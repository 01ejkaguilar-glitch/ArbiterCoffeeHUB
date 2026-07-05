<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redis;
use Illuminate\Support\Facades\Storage;

/**
 * Metrics Collection Service
 *
 * Collects and stores application metrics for monitoring and observability.
 * Tracks request counts, error rates, response times, and system resource usage.
 */
class MetricsService
{
    /**
     * Increment a counter metric.
     *
     * @param string $name Metric name
     * @param array $tags Optional tags for dimensionality
     * @param float $value Value to increment by (default: 1)
     * @return void
     */
    public function increment(string $name, array $tags = [], float $value = 1): void
    {
        $key = $this->buildMetricKey($name, 'count', $tags);
        $current = (float)Cache::get($key, 0);
        Cache::put($key, $current + $value, 86400); // 24 hours
    }

    /**
     * Record a gauge metric (current value).
     *
     * @param string $name Metric name
     * @param mixed $value Current value
     * @param array $tags Optional tags for dimensionality
     * @return void
     */
    public function gauge(string $name, $value, array $tags = []): void
    {
        $key = $this->buildMetricKey($name, 'gauge', $tags);
        Cache::put($key, $value, 86400); // 24 hours
    }

    /**
     * Record a timing metric.
     *
     * @param string $name Metric name
     * @param float $milliseconds Time in milliseconds
     * @param array $tags Optional tags for dimensionality
     * @return void
     */
    public function timing(string $name, float $milliseconds, array $tags = []): void
    {
        // Store as a histogram - we'll keep track of count, sum, and buckets
        $countKey = $this->buildMetricKey($name, 'count', $tags);
        $sumKey = $this->buildMetricKey($name, 'sum', $tags);

        // Increment count
        $count = (int)Cache::get($countKey, 0);
        Cache::put($countKey, $count + 1, 86400);

        // Add to sum
        $sum = (float)Cache::get($sumKey, 0);
        Cache::put($sumKey, $sum + $milliseconds, 86400);

        // Store individual value for percentile calculations (sampling approach)
        // In a real implementation, you'd use proper histogram or reservoir sampling
        $valuesKey = $this->buildMetricKey($name, 'values', $tags);
        $values = (array)Cache::get($valuesKey, []);
        $values[] = $milliseconds;

        // Keep only last 1000 values to prevent unbounded growth
        if (count($values) > 1000) {
            $values = array_slice($values, -1000);
        }
        Cache::put($valuesKey, $values, 86400);
    }

    /**
     * Get the value of a counter metric.
     *
     * @param string $name Metric name
     * @param array $tags Optional tags for dimensionality
     * @return float Current count
     */
    public function getCount(string $name, array $tags = []): float
    {
        $key = $this->buildMetricKey($name, 'count', $tags);
        return (float)Cache::get($key, 0);
    }

    /**
     * Get the value of a gauge metric.
     *
     * @param string $name Metric name
     * @param array $tags Optional tags for dimensionality
     * @return mixed Current value
     */
    public function getGauge(string $name, array $tags = [])
    {
        $key = $this->buildMetricKey($name, 'gauge', $tags);
        return Cache::get($key);
    }

    /**
     * Get timing statistics (count, sum, mean).
     *
     * @param string $name Metric name
     * @param array $tags Optional tags for dimensionality
     * @return array Statistics ['count' => int, 'sum' => float, 'mean' => float]
     */
    public function getTimingStats(string $name, array $tags = []): array
    {
        $countKey = $this->buildMetricKey($name, 'count', $tags);
        $sumKey = $this->buildMetricKey($name, 'sum', $tags);

        $count = (int)Cache::get($countKey, 0);
        $sum = (float)Cache::get($sumKey, 0);
        $mean = $count > 0 ? $sum / $count : 0;

        return [
            'count' => $count,
            'sum' => $sum,
            'mean' => $mean,
        ];
    }

    /**
     * Record a database query metric.
     *
     * @param string $queryType Type of query (select, insert, update, delete)
     * @param string $table Table name
     * @param float $milliseconds Query execution time
     * @return void
     */
    public function recordQuery(string $queryType, string $table, float $milliseconds): void
    {
        $this->timing(
            'db.query.time',
            $milliseconds,
            ['type' => $queryType, 'table' => $table]
        );
        $this->increment(
            'db.query.count',
            ['type' => $queryType, 'table' => $table]
        );
    }

    /**
     * Record a cache operation metric.
     *
     * @param string $operation Type of operation (get, set, delete)
     * @param string $store Cache store name
     * @param bool $hit Whether it was a cache hit
     * @param float $milliseconds Operation time
     * @return void
     */
    public function recordCacheOperation(string $operation, string $store, bool $hit, float $milliseconds = 0): void
    {
        $this->timing(
            'cache.operation.time',
            $milliseconds,
            ['operation' => $operation, 'store' => $store]
        );

        $this->increment(
            'cache.operation.count',
            ['operation' => $operation, 'store' => $store]
        );

        if ($hit) {
            $this->increment('cache.hits', ['store' => $store]);
        } else {
            $this->increment('cache.misses', ['store' => $store]);
        }
    }

    /**
     * Record an HTTP request metric.
     *
     * @param string $method HTTP method
     * @param string $endpoint Request endpoint
     * @param int $statusCode HTTP status code
     * @param float $milliseconds Request duration
     * @return void
     */
    public function recordHttpRequest(string $method, string $endpoint, int $statusCode, float $milliseconds): void
    {
        $statusClass = floor($statusCode / 100) . 'xx'; // e.g., 2xx, 4xx, 5xx

        $this->timing(
            'http.request.time',
            $milliseconds,
            ['method' => $method, 'endpoint' => $endpoint, 'status_class' => $statusClass]
        );

        $this->increment(
            'http.request.count',
            ['method' => $method, 'endpoint' => $endpoint, 'status_class' => $statusClass]
        );
    }

    /**
     * Get current system resource usage.
     *
     * @return array System metrics
     */
    public function getSystemMetrics(): array
    {
        $memory = memory_get_usage(true);
        $memoryPeak = memory_get_peak_usage(true);

        // Get database connection count
        $dbConnections = 0;
        try {
            $result = DB::select('SHOW PROCESSLIST');
            $dbConnections = count($result);
        } catch (\Exception $e) {
            // Database might not be available
        }

        // Get cache hit rate if CacheMetricsService is available
        $cacheHitRate = 0;
        try {
            if (class_exists('App\Services\CacheMetricsService')) {
                $cacheHitRate = app('App\Services\CacheMetricsService')->getHitRate();
            }
        } catch (\Exception $e) {
            // CacheMetricsService might not be available
        }

        return [
            'memory_usage_bytes' => $memory,
            'memory_peak_bytes' => $memoryPeak,
            'memory_usage_mb' => round($memory / 1024 / 1024, 2),
            'memory_peak_mb' => round($memoryPeak / 1024 / 1024, 2),
            'database_connections' => $dbConnections,
            'cache_hit_rate' => $cacheHitRate,
            'timestamp' => now()->toISOString(),
        ];
    }

    /**
     * Build a metric key with optional tags.
     *
     * @param string $name Base metric name
     * @param string $type Metric type (count, gauge, etc.)
     * @param array $tags Tags for dimensionality
     * @return string Formatted metric key
     */
    protected function buildMetricKey(string $name, string $type, array $tags = []): string
    {
        if (empty($tags)) {
            return "metrics:{$name}:{$type}";
        }

        // Sort tags for consistent key generation
        ksort($tags);
        $tagString = '';
        foreach ($tags as $key => $value) {
            $tagString .= ",{$key}:{$value}";
        }

        return "metrics:{$name}:{$type}{$tagString}";
    }

    /**
     * Reset all metrics (useful for testing).
     *
     * @return void
     */
    public function reset(): void
    {
        // This is a simplified implementation - in production you might want
        // to be more selective about what you reset
        $keys = Cache::getStore()->getKeys('metrics:*');
        foreach ($keys as $key) {
            Cache::forget($key);
        }
    }
}