<?php

namespace Tests\Unit\Services;

use App\Services\CacheWarmingService;
use App\Models\Product;
use App\Models\Category;
use Illuminate\Support\Facades\Cache;
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
        $products = Product::factory()->count(5)->create([
            'is_available' => true,
        ]);

        // Warm the cache
        $service->warmPopularProducts();

        // Verify cache was populated for each product
        foreach ($products as $product) {
            $this->assertNotNull(Cache::get('product_' . $product->id));
        }
        // Verify popular products list was cached
        $this->assertNotNull(Cache::get('popular_products_list'));
    }

    /** @test */
    public function it_warms_popular_categories()
    {
        $service = new CacheWarmingService();

        // Create test categories
        $categories = Category::factory()->count(3)->create();

        // Warm the cache
        $service->warmPopularCategories();

        // Verify cache was populated for each category
        foreach ($categories as $category) {
            $this->assertNotNull(Cache::get('category_' . $category->id));
        }
        // Verify popular categories list was cached
        $this->assertNotNull(Cache::get('popular_categories_list'));
    }

    /** @test */
    public function it_warms_all_caches()
    {
        $service = new CacheWarmingService();

        // Create test data
        Category::factory()->create();
        $products = Product::factory()->count(3)->create([
            'is_available' => true,
        ]);

        // Warm all caches
        $service->warmAllCaches();

        // Verify popular products cache was populated
        foreach ($products as $product) {
            $this->assertNotNull(Cache::get('product_' . $product->id));
        }
        $this->assertNotNull(Cache::get('popular_products_list'));

        // Verify popular categories cache was populated
        // Note: we don't create any categories with products in this test, so the popular categories list might be empty
        // But we did create one category (above) but it has no products, so it won't be in the popular categories list
        // Let's create a category with a product to be safe
        $categoryWithProduct = Category::factory()->create();
        Product::factory()->create([
            'category_id' => $categoryWithProduct->id,
            'is_available' => true,
        ]);

        // Re-warm to include this category
        $service->warmAllCaches();

        $this->assertNotNull(Cache::get('category_' . $categoryWithProduct->id));
        $this->assertNotNull(Cache::get('popular_categories_list'));

        // Note: recommendations and coffee beans might be empty if no data exists
    }
}