<?php

namespace Tests\Unit\Services;

use App\Services\CacheWarmingService;
use App\Models\Product;
use App\Models\Category;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CacheWarmingServiceTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function it_warms_popular_products()
    {
        $service = new CacheWarmingService();

        // Create test products
        Category::factory()->create();
        Product::factory()->count(5)->create([
            'is_available' => true,
        ]);

        // Warm the cache
        $service->warmPopularProducts();

        // Verify cache was populated
        $this->assertNotNull(Cache::tags(['products'])->get('popular_products'));
    }

    /** @test */
    public function it_warms_popular_categories()
    {
        $service = new CacheWarmingService();

        // Create test categories with products
        Category::factory()->count(3)->create();

        // Warm the cache
        $service->warmPopularCategories();

        // Verify cache was populated
        $this->assertNotNull(Cache::tags(['categories'])->get('popular_categories'));
    }

    /** @test */
    public function it_warms_all_caches()
    {
        $service = new CacheWarmingService();

        // Create test data
        Category::factory()->create();
        Product::factory()->count(3)->create([
            'is_available' => true,
        ]);

        // Warm all caches
        $service->warmAllCaches();

        // Verify all cache types were populated
        $this->assertNotNull(Cache::tags(['products'])->get('popular_products'));
        $this->assertNotNull(Cache::tags(['categories'])->get('popular_categories'));
        // Note: recommendations and coffee beans might be empty if no data exists
    }
}