<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Log;

class BackupCleanupCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'backup:clean
                            {--disk= : Disk to clean up (local, s3, etc.)}
                            {--days= : Keep backups for how many days (default: 30)}
                            {--type= : Type of backup to clean (database, files, all)}
                            {--notify : Send notification on completion}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Clean up old backup files';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting backup cleanup...');

        $disk = $this->option('disk') ?: config('backup.destination', 'local');
        $days = $this->option('days') ?: 30;
        $type = $this->option('type') ?: 'all';
        $notify = $this->option('notify');

        if (!Storage::disk($disk)->exists('')) {
            $this->error("Disk '{$disk}' not found or not accessible.");
            return 1;
        }

        $cutoffDate = Carbon::now()->subDays($days);
        $deletedCount = 0;
        $freedSpace = 0;
        $errors = [];

        try {
            // Define backup directories to clean
            $directories = [];
            if ($type === 'database' || $type === 'all') {
                $directories[] = 'backups/database';
            }
            if ($type === 'files' || $type === 'all') {
                $directories[] = 'backups/files';
            }
            if ($type === 'all') {
                $directories[] = 'backups'; // Root backups directory
            }

            foreach ($directories as $directory) {
                if (!Storage::disk($disk)->exists($directory)) {
                    continue;
                }

                $files = Storage::disk($disk)->allFiles($directory);

                foreach ($files as $file) {
                    try {
                        $lastModified = Storage::disk($disk)->lastModified($file);
                        $fileDate = Carbon::createFromTimestamp($lastModified);

                        if ($fileDate->isPast($cutoffDate)) {
                            $size = Storage::disk($disk)->size($file);
                            Storage::disk($disk)->delete($file);
                            $deletedCount++;
                            $freedSpace += $size;

                            $this->info("Deleted: {$file} (". $this->formatBytes($size) . ")");
                        }
                    } catch (\Exception $e) {
                        $errors[] = "Failed to process {$file}: " . $e->getMessage();
                        $this->error("Failed to process {$file}: " . $e->getMessage());
                    }
                }
            }
        } catch (\Exception $e) {
            $this->error("Cleanup failed: " . $e->getMessage());
            Log::error('Backup cleanup failed: ' . $e->getMessage(), ['exception' => $e]);

            // Send failure notification
            if ($notify) {
                $this->sendNotification(false, 'cleanup', $e->getMessage());
            }

            return 1;
        }

        // Handle any errors that occurred during file processing
        if (!empty($errors)) {
            $errorMsg = implode('; ', $errors);
            $this->warning("Completed with {$deletedCount} files deleted, but encountered errors: {$errorMsg}");

            // Send partial success notification
            if ($notify) {
                $this->sendNotification(true, 'cleanup', "Completed with errors: {$errorMsg}");
            }
        } else {
            $this->info("Backup cleanup completed!");
            $this->info("Deleted {$deletedCount} files, freed ". $this->formatBytes($freedSpace));

            // Log success
            Log::info('Backup cleanup completed', [
                'disk' => $disk,
                'deleted_count' => $deletedCount,
                'freed_space' => $freedSpace,
                'days_threshold' => $days,
                'type' => $type
            ]);

            // Send success notification
            if ($notify) {
                $this->sendNotification(true, 'cleanup');
            }
        }

        return 0;
    }

    /**
     * Send notification about backup completion/failure.
     */
    protected function sendNotification(bool $success, string $type, string $errorMessage = null): void
    {
        $status = $success ? 'SUCCESS' : 'FAILED';
        $message = "Backup {$type} cleanup: {$status}";

        if ($errorMessage) {
            $message .= " - {$errorMessage}";
        }

        // Log the notification
        if ($success) {
            $this->info($message);
            Log::info($message);
        } else {
            $this->error($message);
            Log::error($message);
        }

        // TODO: Implement actual notification channels (email, Slack, webhook)
        // For now, just log - in production this would integrate with notification services
    }

    /**
     * Format bytes to human readable format.
     */
    protected function formatBytes(int $bytes, int $precision = 2): string
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];

        $bytes = max($bytes, 0);
        $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
        $pow = min($pow, count($units) - 1);

        $bytes /= (1024 ** $pow);

        return round($bytes, $precision) . ' ' . $units[$pow];
    }
}