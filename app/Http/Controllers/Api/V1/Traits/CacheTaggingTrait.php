<?php

namespace App\Http\Controllers\Api\V1\Traits;

use Illuminate\Support\Facades\Cache;
use App\Services\CacheMetricsService;

/**
 * Trait for cache tagging functionality with hit/miss tracking.
 * Provides consistent cache key generation, storage, retrieval, and clearing.
 */
trait CacheTaggingTrait
{
    /**
     * Generate a cache key based on the given data.
     *
     * @param string $baseKey
     * @param mixed $data
     * @return string
     */
    protected function generateTaggedCacheKey(string $baseKey, $data = null): string
    {
        if ($data !== null) {
            return $baseKey . '_' . md5(json_encode($data));
        }

        return $baseKey;
    }

    /**
     * Retrieve item from cache with hit/miss tracking.
     *
     * @param string $cacheKey
     * @param int $ttl
     * @param callable $callback
     * @param array $tags
     * @return mixed
     */
    protected function rememberTagged(string $cacheKey, int $ttl, callable $callback, array $tags = [])
    {
        // Try to get from cache first to track hits/misses
        if (!empty($tags) && Cache::tags($tags)->has($cacheKey)) {
            app(CacheMetricsService::class)->hit();
            return Cache::tags($tags)->get($cacheKey);
        }

        // Cache miss - generate value and store it
        app(CacheMetricsService::class)->miss();

        if (!empty($tags)) {
            $value = Cache::tags($tags)->remember($cacheKey, $ttl, $callback);
        } else {
            $value = cache()->remember($cacheKey, $ttl, $callback);
        }

        return $value;
    }

    /**
     * Clear cache entries by tags.
     *
     * @param array $tags
     * @return void
     */
    protected function clearTaggedCache(array $tags): void
    {
        if (!empty($tags)) {
            Cache::tags($tags)->flush();
        }
    }

    /**
     * Check if cached item exists with tags.
     *
     * @param string $cacheKey
     * @param array $tags
     * @return bool
     */
    protected function hasTagged(string $cacheKey, array $tags = []): bool
    {
        if (!empty($tags)) {
            return Cache::tags($tags)->has($cacheKey);
        }

        return Cache::has($cacheKey);
    }
}