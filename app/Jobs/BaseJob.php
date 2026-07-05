<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

/**
 * Base job class with standardized error handling, logging, and exponential backoff retry logic.
 */
abstract class BaseJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Base delay in seconds for exponential backoff.
     * Can be overridden in child classes.
     */
    protected int $backoffBase = 60; // Start with 60 seconds

    /**
     * Maximum number of attempts before giving up.
     * Can be overridden in child classes.
     */
    protected int $maxAttempts = 3;

    /**
     * Execute the job with standardized error handling and exponential backoff.
     */
    public function handle(): void
    {
        try {
            $this->handleJob();
        } catch (\Exception $e) {
            $this->handleJobException($e);
        }
    }

    /**
     * Abstract method that contains the actual job logic.
     * Must be implemented by child classes.
     */
    abstract protected function handleJob(): void;

    /**
     * Handle job exceptions with logging and exponential backoff retry logic.
     */
    protected function handleJobException(\Exception $e): void
    {
        // Log the error with job context
        Log::error("Job failed: " . get_class($this), [
            'job' => get_class($this),
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString(),
            'attempt' => $this->attempts(),
            'max_attempts' => $this->maxAttempts,
        ]);

        // Check if we should retry
        if ($this->attempts() < $this->maxAttempts) {
            // Calculate delay using exponential backoff: base * 2^(attempt-1)
            $delay = $this->backoffBase * pow(2, ($this->attempts() - 1));

            // Cap the maximum delay to prevent excessively long waits (e.g., 1 hour max)
            $delay = min($delay, 3600);

            Log::info("Retrying job in {$delay} seconds (attempt " . ($this->attempts() + 1) . "/" . $this->maxAttempts . ")", [
                'job' => get_class($this),
                'delay' => $delay,
                'attempt' => $this->attempts() + 1,
            ]);

            $this->release($delay);
        } else {
            // Max attempts reached, log final failure
            Log::error("Job failed permanently after {$this->maxAttempts} attempts: " . get_class($this), [
                'job' => get_class($this),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            // Call the failed method if it exists
            if (method_exists($this, 'failed')) {
                $this->failed($e);
            }
        }
    }
}