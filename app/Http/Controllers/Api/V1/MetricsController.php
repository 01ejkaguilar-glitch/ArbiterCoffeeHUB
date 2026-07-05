<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\BaseController;
use App\Services\MetricsService;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

/**
 * Metrics Controller
 *
 * Exposes application metrics in Prometheus format for monitoring systems.
 */
class MetricsController extends BaseController
{
    /**
     * Return metrics in Prometheus format.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request): Response
    {
        $metricsService = app(MetricsService::class);
        $cacheMetricsService = app('App\Services\CacheMetricsService');

        $metrics = [];

        // System metrics
        $systemMetrics = $metricsService->getSystemMetrics();
        $metrics[] = '# HELP app_memory_usage_bytes Current memory usage in bytes';
        $metrics[] = '# TYPE app_memory_usage_bytes gauge';
        $metrics[] = 'app_memory_usage_bytes ' . $systemMetrics['memory_usage_bytes'];

        $metrics[] = '# HELP app_memory_peak_bytes Peak memory usage in bytes';
        $metrics[] = '# TYPE app_memory_peak_bytes gauge';
        $metrics[] = 'app_memory_usage_bytes ' . $systemMetrics['memory_peak_bytes'];

        $metrics[] = '# HELP app_database_connections Current database connections';
        $metrics[] = '# TYPE app_database_connections gauge';
        $metrics[] = 'app_database_connections ' . $systemMetrics['database_connections'];

        $metrics[] = '# HELP app_cache_hit_rate Cache hit rate (0-1)';
        $metrics[] = '# TYPE app_cache_hit_rate gauge';
        $metrics[] = 'app_cache_hit_rate ' . $systemMetrics['cache_hit_rate'];

        // Cache metrics from our dedicated service
        $metrics[] = '# HELP app_cache_operations_total Total cache operations';
        $metrics[] = '# TYPE app_cache_operations_total counter';
        $metrics[] = 'app_cache_operations_total ' . ($cacheMetricsService->getHits() + $cacheMetricsService->getMisses());

        $metrics[] = '# HELP app_cache_hits_total Total cache hits';
        $metrics[] = '# TYPE app_cache_hits_total counter';
        $metrics[] = 'app_cache_hits_total ' . $cacheMetricsService->getHits();

        $metrics[] = '# HELP app_cache_misses_total Total cache misses';
        $metrics[] = '# TYPE app_cache_misses_total counter';
        $metrics[] = 'app_cache_misses_total ' . $cacheMetricsService->getMisses();

        return response(implode("\n", $metrics) . "\n", 200)
            ->header('Content-Type', 'text/plain; version=0.0.4');
    }
}