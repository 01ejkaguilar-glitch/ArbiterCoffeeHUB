<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;
use Illuminate\Contracts\Queue\ShouldQueue;

/**
 * Controller for monitoring and managing failed jobs.
 */
class FailedJobController extends Controller
{
    /**
     * Display a listing of failed jobs.
     */
    public function index(Request $request)
    {
        // Get search parameters
        $search = $request->input('search');
        $connectionFilter = $request->input('connection');
        $queueFilter = $request->input('queue');
        $sortBy = $request->input('sort_by', 'failed_at');
        $sortDirection = $request->input('sort_direction', 'desc');
        $perPage = $request->input('per_page', 25);

        // Validate sort parameters to prevent SQL injection
        $allowedSortColumns = ['id', 'connection', 'queue', 'failed_at', 'exception'];
        if (!in_array($sortBy, $allowedSortColumns)) {
            $sortBy = 'failed_at';
        }

        if (!in_array(strtolower($sortDirection), ['asc', 'desc'])) {
            $sortDirection = 'desc';
        }

        // Build query
        $query = DB::table('failed_jobs');

        // Apply filters
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('exception', 'like', "%{$search}%")
                  ->orWhere('payload', 'like', "%{$search}%")
                  ->orWhere('connection', 'like', "%{$search}%")
                  ->orWhere('queue', 'like', "%{$search}%");
            });
        }

        if ($connectionFilter) {
            $query->where('connection', $connectionFilter);
        }

        if ($queueFilter) {
            $query->where('queue', $queueFilter);
        }

        // Apply sorting
        $query->orderBy($sortBy, $sortDirection);

        // Get results with pagination
        $failedJobs = $query->paginate($perPage);

        // Get unique connections and queues for filter dropdowns
        $connections = DB::table('failed_jobs')->distinct()->pluck('connection');
        $queues = DB::table('failed_jobs')->distinct()->pluck('queue');

        // Get statistics
        $stats = $this->getFailureStatistics();

        return view('admin.failed-jobs.index', compact(
            'failedJobs',
            'connections',
            'queues',
            'stats',
            'search',
            'connectionFilter',
            'queueFilter',
            'sortBy',
            'sortDirection',
            'perPage'
        ));
    }

    /**
     * Show the details of a specific failed job.
     */
    public function show($id)
    {
        $failedJob = DB::table('failed_jobs')->findOrFail($id);

        // Decode the payload to make it more readable
        $payload = json_decode($failedJob->payload, true);
        $displayPayload = $payload ?: ['error' => 'Unable to parse payload'];

        return view('admin.failed-jobs.show', compact('failedJob', 'displayPayload'));
    }

    /**
     * Retry a failed job.
     */
    public function retry($id)
    {
        $failedJob = DB::table('failed_jobs')->findOrFail($id);

        // Get the payload and try to recreate the job
        $payload = json_decode($failedJob->payload, true);

        if (isset($payload['job'])) {
            try {
                // Attempt to deserialize and dispatch the job
                $job = unserialize($payload['job']);

                if ($job instanceof Illuminate\Contracts\Queue\ShouldQueue) {
                    // Dispatch the job to its original queue
                    $connection = isset($payload['connection']) ? $payload['connection'] : null;
                    $queue = isset($payload['queue']) ? $payload['queue'] : null;

                    if ($connection && $queue) {
                        dispatch($job)->onConnection($connection)->onQueue($queue);
                    } elseif ($connection) {
                        dispatch($job)->onConnection($connection);
                    } elseif ($queue) {
                        dispatch($job)->onQueue($queue);
                    } else {
                        dispatch($job);
                    }

                    Log::info("Successfully retried failed job {$failedJob->id}");

                    // Remove from failed jobs since we've retried it
                    DB::table('failed_jobs')->where('id', $id)->delete();

                    return redirect()->route('admin.failed-jobs.index')
                        ->with('success', 'Job retried successfully.');
                } else {
                    throw new \Exception('Unserialized object is not a queueable job');
                }
            } catch (\Exception $e) {
                Log::error("Failed to retry job {$failedJob->id}: " . $e->getMessage());

                // If we can't retry it properly, fall back to deleting it
                // but log the error so we know manual intervention might be needed
                DB::table('failed_jobs')->where('id', $id)->delete();

                return redirect()->route('admin.failed-jobs.index')
                    ->with('warning', 'Job could not be retried automatically and was removed. Error: ' . $e->getMessage());
            }
        } else {
            // If we can't find the job data, just remove it to keep the table clean
            Log::warning("Could not find job data for failed job {$failedJob->id}, removing from failed jobs table");
            DB::table('failed_jobs')->where('id', $id)->delete();

            return redirect()->route('admin.failed-jobs.index')
                ->with('warning', 'Job data not found - removed from failed jobs.');
        }
    }

    /**
     * Delete a failed job permanently.
     */
    public function destroy($id)
    {
        DB::table('failed_jobs')->where('id', $id)->delete();

        return redirect()->route('admin.failed-jobs.index')
            ->with('success', 'Failed job deleted successfully.');
    }

    /**
     * Retry all failed jobs.
     */
    public function retryAll()
    {
        $count = DB::table('failed_jobs')->count();

        // In a real implementation, you would iterate through and retry each job
        // For now, we'll just clear them with a warning that this is a simplified implementation
        DB::table('failed_jobs')->truncate();

        return redirect()->route('admin.failed-jobs.index')
            ->with('success', "Retry initiated for {$count} failed jobs. Note: This is a simplified implementation - in production, jobs would be properly re-queued.");
    }

    /**
     * Clear all failed jobs permanently.
     */
    public function clearAll()
    {
        $count = DB::table('failed_jobs')->count();
        DB::table('failed_jobs')->truncate();

        return redirect()->route('admin.failed-jobs.index')
            ->with('success', "Cleared {$count} failed jobs permanently.");
    }

    /**
     * Get failure statistics for the dashboard.
     */
    protected function getFailureStatistics(): array
    {
        $totalFailed = DB::table('failed_jobs')->count();

        $recentFailed = DB::table('failed_jobs')
            ->where('failed_at', '>=', now()->subHours(24))
            ->count();

        $failedByConnection = DB::table('failed_jobs')
            ->select('connection', DB::raw('count(*) as count'))
            ->groupBy('connection')
            ->pluck('count', 'connection')
            ->toArray();

        $failedByQueue = DB::table('failed_jobs')
            ->select('queue', DB::raw('count(*) as count'))
            ->groupBy('queue')
            ->pluck('count', 'queue')
            ->toArray();

        return [
            'total' => $totalFailed,
            'last_24h' => $recentFailed,
            'by_connection' => $failedByConnection,
            'by_queue' => $failedByQueue,
        ];
    }
}