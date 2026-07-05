<?php

namespace Tests\Unit\Http\Resources;

use App\Models\Category;
use App\Models\Product;
use App\Http\Resources\ProductCollection;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Collection;
use Tests\TestCase;

class ProductCollectionTest extends TestCase
{
    use RefreshDatabase;

    public function test_product_collection_transforms_correctly()
    {
        // Create a category and products
        $category = Category::factory()->create([
            'name' => 'Espresso',
        ]);

        $products = Product::factory()->count(3)->create([
            'category_id' => $category->id,
            'is_available' => true,
        ]);

        // Create a collection resource
        $collection = collect($products);
        $resource = new ProductCollection($collection);

        // Get the array representation
        $array = $resource->toArray(request());

        // Assert the structure and values
        $this->assertArrayHasKey('data', $array);
        $this->assertIsArray($array['data']);
        $this->assertCount(3, $array['data']);

        // Check each product in the collection
        foreach ($array['data'] as $index => $productData) {
            $this->assertEquals($products[$index]->id, $productData['id']);
            $this->assertEquals($products[$index]->name, $productData['name']);
            $this->assertEquals($products[$index]->description, $productData['description']);
            $this->assertEquals($products[$index]->price, $productData['price']);
            $this->assertEquals($products[$index]->image_url, $productData['image_url']);
            $this->assertEquals($products[$index]->stock_quantity, $productData['stock_quantity']);
            $this->assertEquals($products[$index]->is_available, $productData['is_available']);
            $this->assertArrayHasKey('created_at', $productData);
            $this->assertArrayHasKey('updated_at', $productData);

            // Assert category relationship is included
            $this->assertArrayHasKey('category', $productData);
            $this->isArray($productData['category']);
            $this->assertEquals($category->id, $productData['category']['id']);
            $this->assertEquals($category->name, $productData['category']['name']);
        }
    }

    public function test_product_collection_handles_empty_collection()
    {
        // Create an empty collection
        $collection = collect([]);
        $resource = new ProductCollection($collection);

        // Get the array representation
        $array = $resource->toArray(request());

        // Assert the structure and values
        $this->assertArrayHasKey('data', $array);
        $this->assertIsArray($array['data']);
        $this->assertEmpty($array['data']);
    }

    public function test_product_collection_handles_null_relationships()
    {
        // Create products with categories
        $products = Product::factory()->count(2)->create();

        // Remove the category relationship to simulate null category
        $products->each->setRelation('category', null);

        // Create a collection resource
        $collection = collect($products);
        $resource = new ProductCollection($collection);

        // Get the array representation
        $array = $resource->toArray(request());

        // Assert the structure and values
        $this->assertArrayHasKey('data', $array);
        $this->assertIsArray($array['data']);
        $this->assertCount(2, $array['data']);

        // Check each product in the collection
        foreach ($array['data'] as $productData) {
            // Assert category is null when relationship is null
            $this->assertArrayHasKey('category', $productData);
            $this->assertNull($productData['category']);
        }
    }

    public function test_product_collection_preserves_additional_metadata_when_provided()
    {
        // Create products
        $products = Product::factory()->count(2)->create();

        // Create a collection with additional metadata
        $collection = collect($products);
        $resource = new ProductCollection($collection, ['status' => 'success', 'message' => 'Products retrieved']);

        // Get the array representation
        $array = $resource->toArray(request());

        // Assert the structure and values
        $this->assertArrayHasKey('data', $array);
        $this->assertArrayHasKey('status', $array);
        $this->assertArrayHasKey('message', $array);
        $this->assertEquals('success', $array['status']);
        $this->assertEquals('Products retrieved', $array['message']);
        $this->assertCount(2, $array['data']);

        // Products data should still be correct
        $this->assertCount(2, $array['data']);
    }
}