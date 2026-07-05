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

    // Additional edge case tests

    /** @test */
    public function it_handles_large_numbers_of_hits_and_misses()
    {
        $service = new CacheMetricsService();

        // Simulate a large number of hits and misses
        for ($i = 0; $i < 1000; $i++) {
            $service->hit();
        }
        for ($i = 0; $i < 500; $i++) {
            $service->miss();
        }

        $this->assertEquals(1000, $service->getHits());
        $this->assertEquals(500, $service->getMisses());
        $this->assertEquals(0.6666666666666666, $service->getHitRate());
    }

    /** @test */
    public function it_maintains_accuracy_after_many_operations()
    {
        $service = new CacheMetricsService();

        // Alternate hits and misses
        for ($i = 0; $i < 100; $i++) {
            $service->hit();
            $service->miss();
        }

        $this->assertEquals(100, $service->getHits());
        $this->assertEquals(100, $service->getMisses());
        $this->assertEquals(0.5, $service->getHitRate());
    }

    /** @test */
    public function it_returns_float_for_hit_rate()
    {
        $service = new CacheMetricsService();
        $service->hit();
        $service->miss();

        $hitRate = $service->getHitRate();
        $this->assertIsFloat($hitRate);
        $this->assertEquals(0.5, $hitRate);
    }

    /** @test */
    public function it_resets_metrics_correctly()
    {
        $service = new CacheMetricsService();

        // Add some metrics
        $service->hit();
        $service->hit();
        $service->miss();

        $this->assertEquals(2, $service->getHits());
        $this->assertEquals(1, $service->getMisses());

        // Reset metrics
        $service->reset();

        $this->assertEquals(0, $service->getHits());
        $this->assertEquals(0, $service->getMisses());
        $this->assertEquals(0.0, $service->getHitRate());
    }

    /** @test */
    public function it_works_with_cache_persistence()
    {
        $service1 = new CacheMetricsService();
        $service1->hit();
        $service1->hit();
        $service1->miss();

        // Create a new service instance (simulating a new request)
        $service2 = new CacheMetricsService();

        $this->assertEquals(2, $service2->getHits());
        $this->assertEquals(1, $service2->getMisses());
        $this->assertEquals(0.6666666666666666, $service2->getHitRate());
    }
}