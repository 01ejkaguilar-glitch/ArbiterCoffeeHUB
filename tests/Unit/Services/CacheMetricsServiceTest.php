<?php

namespace Tests\Unit\Services;

use App\Services\CacheMetricsService;
use Illuminate\Support\Facades\Cache;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CacheMetricsServiceTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        // Clear cache metrics before each test
        CacheMetricsService::reset();
    }

    /** @test */
    public function it_tracks_cache_hits()
    {
        // Simulate a cache hit
        Cache::put('test_key', 'test_value', 10);
        Cache::get('test_key'); // This would be a hit

        CacheMetricsService::hit();

        $this->assertEquals(1, CacheMetricsService::getHits());
        $this->assertEquals(0, CacheMetricsService::getMisses());
        $this->assertEquals(100.0, CacheMetricsService::getHitRate());
    }

    /** @test */
    public function it_tracks_cache_misses()
    {
        CacheMetricsService::miss();

        $this->assertEquals(0, CacheMetricsService::getHits());
        $this->assertEquals(1, CacheMetricsService::getMisses());
        $this->assertEquals(0.0, CacheMetricsService::getHitRate());
    }

    /** @test */
    public function it_calculates_correct_hit_rate()
    {
        // Simulate 3 hits and 1 miss
        CacheMetricsService::hit();
        CacheMetricsService::hit();
        CacheMetricsService::miss();
        CacheMetricsService::hit();

        $this->assertEquals(3, CacheMetricsService::getHits());
        $this->assertEquals(1, CacheMetricsService::getMisses());
        $this->assertEquals(75.0, CacheMetricsService::getHitRate());
    }

    /** @test */
    public function it_returns_zero_hit_rate_when_no_requests()
    {
        $this->assertEquals(0.0, CacheMetricsService::getHitRate());
    }
}