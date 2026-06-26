<?php

namespace Tests\Unit\Services;

use App\Models\Product;
use App\Models\Category;
use App\Models\CoffeeBean;
use App\Services\CacheWarmingService;
use App\Services\RecommendationService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Mockery;
use Tests\TestCase;

class CacheWarmingServiceTest extends TestCase
{
    use RefreshDatabase;

    protected $cacheWarmingService;
    protected $mockRecommendationService;

    public function setUp(): void
    {
        parent::setUp();

        $this->mockRecommendationService = Mockery::mock(RecommendationService::class);
        $this->app->instance(RecommendationService::class, $this->mockRecommendationService);

        $this->cacheWarmingService = new CacheWarmingService();
    }

    public function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }

    public function test_warm_popular_products_caches_individual_products()
    {
        // Create test products
        $products = Product::factory()->count(3)->create([
            'is_available' => true,
        ]);

        // Call the method
        $this->cacheWarmingService->warmPopularProducts();

        // Verify each product was cached individually
        foreach ($products as $product) {
            $cacheKey = 'product_' . $product->id;
            $this->assertTrue(Cache::has($cacheKey));
            $cachedProduct = Cache::get($cacheKey);
            $this->assertEquals($product->id, $cachedProduct->id);
        }

        // Verify the products list was cached
        $this->assertTrue(Cache::has('popular_products_list'));
        $cachedList = Cache::get('popular_products_list');
        $this->assertEquals(3, $cachedList->count());
    }

    public function test_warm_popular_categories_caches_with_product_counts()
    {
        // Create categories with products
        $categoryWithProducts = Category::factory()->create();
        Product::factory()->count(2)->create([
            'category_id' => $categoryWithProducts->id,
        ]);

        // Create category without products
        $emptyCategory = Category::factory()->create();

        // Call the method
        $this->cacheWarmingService->warmPopularCategories();

        // Verify the category with products was cached
        $cacheKey = 'category_' . $categoryWithProducts->id;
        $this->assertTrue(Cache::has($cacheKey));
        $cachedCategory = Cache::get($cacheKey);
        $this->assertEquals($categoryWithProducts->id, $cachedCategory->id);
        $this->assertEquals(2, $cachedCategory->products_count);

        // Verify the empty category was not cached (since products_count <= 0)
        $emptyCacheKey = 'category_' . $emptyCategory->id;
        $this->assertFalse(Cache::has($emptyCacheKey));

        // Verify the popular categories list was cached
        $this->assertTrue(Cache::has('popular_categories_list'));
        $cachedList = Cache::get('popular_categories_list');
        $this->assertEquals(1, $cachedList->count());
        $this->assertEquals($categoryWithProducts->id, $cachedList->first()->id);
    }

    public function test_warm_popular_coffee_beans_caches_featured_and_high_stock()
    {
        // Create featured coffee bean
        $featuredBean = CoffeeBean::factory()->create([
            'stock_quantity' => 10,
            'is_featured' => true,
        ]);

        // Create high stock coffee bean
        $highStockBean = CoffeeBean::factory()->create([
            'stock_quantity' => 60,
            'is_featured' => false,
        ]);

        // Create low stock, non-featured coffee bean (should not be cached)
        $lowStockBean = CoffeeBean::factory()->create([
            'stock_quantity' => 5,
            'is_featured' => false,
        ]);

        // Call the method
        $this->cacheWarmingService->warmPopularCoffeeBeans();

        // Verify featured bean was cached
        $featuredCacheKey = 'coffee_bean_' . $featuredBean->id;
        $this->assertTrue(Cache::has($featuredCacheKey));
        $this->assertEquals($featuredBean->id, Cache::get($featuredCacheKey)->id);

        // Verify high stock bean was cached
        $highStockCacheKey = 'coffee_bean_' . $highStockBean->id;
        $this->assertTrue(Cache::has($highStockCacheKey));
        $this->assertEquals($highStockBean->id, Cache::get($highStockCacheKey)->id);

        // Verify low stock bean was not cached
        $lowStockCacheKey = 'coffee_bean_' . $lowStockBean->id;
        $this->assertFalse(Cache::has($lowStockCacheKey));

        // Verify featured coffee beans list was cached
        $this->assertTrue(Cache::has('featured_coffee_beans_list'));
        $featuredList = Cache::get('featured_coffee_beans_list');
        $this->assertEquals(2, $featuredList->count()); // Both featured and high stock should be in featured list
    }

    public function test_warm_product_caches_single_product()
    {
        // Create a product
        $product = Product::factory()->create();

        // Call the method
        $this->cacheWarmingService->warmProduct($product->id);

        // Verify the product was cached
        $cacheKey = 'product_' . $product->id;
        $this->assertTrue(Cache::has($cacheKey));
        $cachedProduct = Cache::get($cacheKey);
        $this->assertEquals($product->id, $cachedProduct->id);
    }

    public function test_warm_category_caches_single_category()
    {
        // Create a category
        $category = Category::factory()->create();

        // Call the method
        $this->cacheWarmingService->warmCategory($category->id);

        // Verify the category was cached
        $cacheKey = 'category_' . $category->id;
        $this->assertTrue(Cache::has($cacheKey));
        $cachedCategory = Cache::get($cacheKey);
        $this->assertEquals($category->id, $cachedCategory->id);
    }

    public function test_warm_all_caches_calls_all_warming_methods()
    {
        // Mock the individual warming methods to verify they're called
        $this->cacheWarmingService = Mockery::mock(CacheWarmingService::class)->makePartial();
        $this->cacheWarmingService->shouldReceive('warmPopularProducts')->once();
        $this->cacheWarmingService->shouldReceive('warmPopularCategories')->once();
        $this->cacheWarmingService->shouldReceive('warmPopularRecommendations')->once();
        $this->cacheWarmingService->shouldReceive('warmPopularCoffeeBeans')->once();

        // Call the method
        $this->cacheWarmingService->warmAllCaches();
        
        // Add assertion to make sure the test actually tests something
        $this->assertTrue(true);
    }
}
