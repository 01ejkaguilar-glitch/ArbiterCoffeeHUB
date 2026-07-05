<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Database\Connection;
use Illuminate\Support\Facades\Log;
use Illuminate\Database\Events\QueryExecuted;
use App\Services\RecommendationService;
use App\Services\CustomerInsightsService;
use App\Services\MetricsService;
use App\Services\CacheMetricsService;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // Register Recommendation Service
        $this->app->singleton(RecommendationService::class, function ($app) {
            return new RecommendationService();
        });

        // Register Customer Insights Service
        $this->app->singleton(CustomerInsightsService::class, function ($app) {
            return new CustomerInsightsService();
        });

        // Register Metrics Service
        $this->app->singleton(MetricsService::class, function ($app) {
            return new MetricsService();
        });

        // Register Cache Metrics Service
        $this->app->singleton(CacheMetricsService::class, function ($app) {
            return new CacheMetricsService();
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Fix for PHP 8.4 SQLite transaction issues
        if (version_compare(PHP_VERSION, '8.4.0', '>=')) {
            Connection::resolverFor('sqlite', function ($connection, $database, $prefix, $config) {
                // Override transaction_mode for PHP 8.4 compatibility
                $config['transaction_mode'] = null;
                return new \Illuminate\Database\SQLiteConnection($connection, $database, $prefix, $config);
            });
        }

        // Log slow queries for performance monitoring
        $slowQueryThreshold = env('DB_SLOW_QUERY_THRESHOLD', 100); // milliseconds

        \Event::listen(QueryExecuted::class, function (QueryExecuted $query) use ($slowQueryThreshold) {
            $time = $query->time;

            // Convert to milliseconds if it's in seconds (Laravel returns time in seconds)
            $timeMs = $time * 1000;

            if ($timeMs >= $slowQueryThreshold) {
                Log::channel('performance')->warning('Slow query detected', [
                    'query' => $query->sql,
                    'bindings' => $query->bindings,
                    'time' => $timeMs . ' ms',
                    'connection' => $query->connectionName,
                ]);
            }
        });

        // Note: Spatie UnauthorizedException handler removed — package not installed.
        // Re-add when spatie/laravel-permission is required.
    }
}