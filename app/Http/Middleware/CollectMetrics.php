<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Services\MetricsService;

/**
 * Metrics Collection Middleware
 *
 * Automatically collects metrics for HTTP requests including
 * response time, status codes, and request counts.
 */
class CollectMetrics
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle(Request $request, Closure $next)
    {
        // Start timing the request
        $startTime = microtime(true);

        // Process the request
        $response = $next($request);

        // Calculate request duration
        $endTime = microtime(true);
        $durationMs = ($endTime - $startTime) * 1000;

        // Record metrics
        app(MetricsService::class)->recordHttpRequest(
            $request->method(),
            $request->path(),
            $response->getStatusCode(),
            $durationMs
        );

        // Also record as a general API request metric
        app(MetricsService::class)->timing(
            'api.request.duration',
            $durationMs,
            ['method' => $request->method(), 'endpoint' => $request->path()]
        );

        app(MetricsService::class)->increment(
            'api.request.count',
            ['method' => $request->method(), 'endpoint' => $request->path()]
        );

        // Record error metrics if applicable
        if ($response->getStatusCode() >= 400) {
            app(MetricsService::class)->increment(
                'api.request.errors',
                ['method' => $request->method(), 'endpoint' => $request->path(), 'status_class' => floor($response->getStatusCode() / 100) . 'xx']
            );
        }

        return $response;
    }
}