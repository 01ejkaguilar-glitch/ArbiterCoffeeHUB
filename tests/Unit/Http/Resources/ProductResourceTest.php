<?php

namespace Tests\Unit\Http\Resources;

use App\Models\Category;
use App\Models\Product;
use App\Http\Resources\ProductResource;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProductResourceTest extends TestCase
{
    use RefreshDatabase;

    public function test_product_resource_transforms_correctly()
    {
        // Create a category and product
        $category = Category::factory()->create([
            'name' => 'Espresso',
        ]);

        $product = Product::factory()->create([
            'id' => 1,
            'name' => 'Cappuccino',
            'description' => 'Classic Italian coffee',
            'price' => 120.50,
            'image_url' => '/storage/images/cappuccino.jpg',
            'category_id' => $category->id,
            'stock_quantity' => 50,
            'is_available' => true,
        ]);

        // Create the resource
        $resource = new ProductResource($product);

        // Get the array representation
        $array = $resource->toArray(request());

        // Assert the structure and values
        $this->assertEquals(1, $array['id']);
        $this->assertEquals('Cappuccino', $array['name']);
        $this->assertEquals('Classic Italian coffee', $array['description']);
        $this->assertEquals(120.50, $array['price']);
        $this->assertEquals('/storage/images/cappuccino.jpg', $array['image_url']);
        $this->assertEquals(50, $array['stock_quantity']);
        $this->assertTrue($array['is_available']);
        $this->assertArrayHasKey('created_at', $array);
        $this->assertArrayHasKey('updated_at', $array);

        // Assert category relationship is included
        $this->assertArrayHasKey('category', $array);
        $this->isArray($array['category']);
        $this->assertEquals($category->id, $array['category']['id']);
        $this->assertEquals('Espresso', $array['category']['name']);
    }

    public function product_resource_handles_null_relationships()
    {
        // Create a product without a category
        $product = Product::factory()->create([
            'category_id' => null,
        ]);

        // Create the resource
        $resource = new ProductResource($product);

        // Get the array representation
        $array = $resource->toArray(request());

        // Assert category is null when relationship is null
        $this->assertNull($array['category']);
    }
}