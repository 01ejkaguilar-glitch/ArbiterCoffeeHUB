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
        Cache::flush();
    }

    /** @test */
    public function it_tracks_cache_hits()
    {
        $service = new CacheMetricsService();

        // Simulate a cache hit
        Cache::put('test_key', 'test_value', 10);
        Cache::get('test_key'); // This would be a hit

        $service->hit();

        $this->assertEquals(1, $service->getHits());
        $this->assertEquals(0, $service->getMisses());
        $this->assertEquals(1.0, $service->getHitRate());
    }

    /** @test */
    public function it_tracks_cache_misses()
    {
        $service = new CacheMetricsService();

        $service->miss();

        $this->assertEquals(0, $service->getHits());
        $this->assertEquals(1, $service->getMisses());
        $this->assertEquals(0.0, $service->getHitRate());
    }

    /** @test */
    public function it_calculates_correct_hit_rate()
    {
        $service = new CacheMetricsService();

        // Simulate 3 hits and 1 miss
        $service->hit();
        $service->hit();
        $service->miss();
        $service->hit();

        $this->assertEquals(3, $service->getHits());
        $this->assertEquals(1, $service->getMisses());
        $this->assertEquals(0.75, $service->getHitRate());
    }

    /** @test */
    public function it_returns_zero_hit_rate_when_no_requests()
    {
        $service = new CacheMetricsService();

        $this->assertEquals(0.0, $service->getHitRate());
    }
}