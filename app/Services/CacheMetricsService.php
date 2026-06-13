<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;

/**
 * Cache Metrics Service
 *
 * Tracks cache hit/miss ratios to provide insights into cache effectiveness.
 * Uses a simple in-memory tracking approach (reset on each request in PHP).
 * For production, consider using a proper monitoring system like Prometheus.
 */
class CacheMetricsService
{
    /**
     * Track a cache hit
     */
    public static function hit(): void
    {
        $hits = Cache::get('metrics:cache:hits', 0);
        Cache::put('metrics:cache:hits', $hits + 1, 86400); // 24 hours
    }

    /**
     * Track a cache miss
     */
    public static function miss(): void
    {
        $misses = Cache::get('metrics:cache:misses', 0);
        Cache::put('metrics:cache:misses', $misses + 1, 86400); // 24 hours
    }

    /**
     * Get cache hit rate as a percentage
     *
     * @return float Hit rate percentage (0-100)
     */
    public static function getHitRate(): float
    {
        $hits = Cache::get('metrics:cache:hits', 0);
        $misses = Cache::get('metrics:cache:misses', 0);
        $total = $hits + $misses;

        if ($total === 0) {
            return 0.0;
        }

        return round(($hits / $total) * 100, 2);
    }

    /**
     * Get total cache hits
     *
     * @return int Number of cache hits
     */
    public static function getHits(): int
    {
        return Cache::get('metrics:cache:hits', 0);
    }

    /**
     * Get total cache misses
     *
     * @return int Number of cache misses
     */
    public static function getMisses(): int
    {
        return Cache::get('metrics:cache:misses', 0);
    }

    /**
     * Reset metrics (useful for testing or periodic reset)
     */
    public static function reset(): void
    {
        Cache::forget('metrics:cache:hits');
        Cache::forget('metrics:cache:misses');
    }
}