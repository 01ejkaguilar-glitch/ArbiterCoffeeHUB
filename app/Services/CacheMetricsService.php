<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;

/**
 * Cache Metrics Service
 *
 * Tracks cache hit/miss ratios to provide insights into cache effectiveness.
 * Uses Cache for storage so metrics persist across requests and instances.
 */
class CacheMetricsService
{
    /**
     * Track a cache hit
     */
    public function hit(): void
    {
        $hits = Cache::get('metrics:cache:hits', 0);
        Cache::put('metrics:cache:hits', $hits + 1, 86400); // 24 hours
    }

    /**
     * Track a cache miss
     */
    public function miss(): void
    {
        $misses = Cache::get('metrics:cache:misses', 0);
        Cache::put('metrics:cache:misses', $misses + 1, 86400); // 24 hours
    }

    /**
     * Get cache hit rate as a ratio
     *
     * @return float Hit rate ratio (0.0-1.0)
     */
    public function getHitRate(): float
    {
        $hits = Cache::get('metrics:cache:hits', 0);
        $misses = Cache::get('metrics:cache:misses', 0);
        $total = $hits + $misses;

        if ($total === 0) {
            return 0.0;
        }

        return $hits / $total;
    }

    /**
     * Get total cache hits
     *
     * @return int Number of cache hits
     */
    public function getHits(): int
    {
        return Cache::get('metrics:cache:hits', 0);
    }

    /**
     * Get total cache misses
     *
     * @return int Number of cache misses
     */
    public function getMisses(): int
    {
        return Cache::get('metrics:cache:misses', 0);
    }

    /**
     * Reset metrics (useful for testing or periodic reset)
     */
    public function reset(): void
    {
        Cache::forget('metrics:cache:hits');
        Cache::forget('metrics:cache:misses');
    }
}