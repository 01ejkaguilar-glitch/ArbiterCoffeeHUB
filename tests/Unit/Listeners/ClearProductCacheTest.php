<?php

namespace Tests\Unit\Listeners;

use App\Models\Product;
use App\Listeners\ClearProductCache;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Tests\TestCase;

class ClearProductCacheTest extends TestCase
{
    use RefreshDatabase;

    public function setUp(): void
    {
        parent::setUp();
        $this->listener = new ClearProductCache();

        // Clear cache before each test
        Cache::flush();
    }

    public function test_listener_flushes_products_cache()
    {
        // Add some test data to cache
        Cache::tags(['products'])->put('test_key', 'test_value', 300);

        // Verify data is in cache
        $this->assertTrue(Cache::tags(['products'])->has('test_key'));
        $this->assertEquals('test_value', Cache::tags(['products'])->get('test_key'));

        // Create a mock event (we don't actually need the event data for this listener)
        $event = new \stdClass();

        // Call the listener
        $this->listener->handle($event);

        // Verify cache has been flushed
        $this->assertFalse(Cache::tags(['products'])->has('test_key'));
    }

    public function test_listener_warms_critical_products_after_flushing()
    {
        // Create some test products
        $category = \App\Models\Category::factory()->create();
        $products = \App\Models\Product::factory()->count(5)->create([
            'category_id' => $category->id,
            'is_available' => true,
        ]);

        // Create a mock event
        $event = new \stdClass();

        // Call the listener
        $this->listener->handle($event);

        // Verify that critical products data is now in cache
        $mainProductsKey = 'products_list_' . md5(json_encode([]));
        $this->assertTrue(Cache::tags(['products'])->has($mainProductsKey));

        $cachedProducts = Cache::tags(['products'])->get($mainProductsKey);
        $this->assertCount(5, $cachedProducts); // Should have 5 products
        $this->assertTrue($cachedProducts->every(function ($product) {
            return $product->is_available === true;
        }));

        // Verify products are ordered by created_at descending
        $timestamps = $cachedProducts->pluck('created_at');
        $timestampsArray = $timestamps->all();
        $isDescending = true;
        for ($i = 0; $i < count($timestampsArray) - 1; $i++) {
            if (strtotime($timestampsArray[$i]) < strtotime($timestampsArray[$i + 1])) {
                $isDescending = false;
                break;
            }
        }
        $this->assertTrue($isDescending, 'Products should be ordered by created_at descending');
    }

}