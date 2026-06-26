<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;
use Tests\TestHelpers;

class ProductTest extends TestCase
{
    use RefreshDatabase, TestHelpers;

    /**
     * Setup the test environment
     */
    protected function setUp(): void
    {
        parent::setUp();
        $this->setupRolesAndPermissions();
    }

    /**
     * Test guest can view products
     */
    public function test_guest_can_view_products(): void
    {
        $category = Category::factory()->create();
        Product::factory()->count(5)->create([
            'category_id' => $category->id,
            'is_available' => true,
        ]);

        $response = $this->getJson('/api/v1/products');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'data' => [
                        '*' => ['id', 'name', 'price', 'category'],
                    ],
                ],
            ]);
    }

    /**
     * Test admin can create product
     */
    public function test_admin_can_create_product(): void
    {
        $user = User::factory()->create();
        $user->assignRole('admin');
        
        $category = Category::factory()->create();

        $response = $this->actingAs($user)
            ->postJson('/api/v1/products', [
                'name' => 'Cappuccino',
                'description' => 'Classic Italian coffee',
                'price' => 120.00,
                'category_id' => $category->id,
                'stock_quantity' => 100,
                'is_available' => true,
            ]);

        $response->assertStatus(201);

        $this->assertDatabaseHas('products', [
            'name' => 'Cappuccino',
            'price' => 120.00,
        ]);
    }

    /**
     * Test customer cannot create product
     */
    public function test_customer_cannot_create_product(): void
    {
        $user = User::factory()->create();
        $user->assignRole('customer');

        $category = Category::factory()->create();

        $response = $this->actingAs($user)
            ->postJson('/api/v1/products', [
                'name' => 'Latte',
                'price' => 130.00,
                'category_id' => $category->id,
            ]);

        $response->assertStatus(403);
    }

    /**
     * Test product creation fails with invalid data
     */
    public function test_product_creation_fails_with_invalid_data(): void
    {
        $user = User::factory()->create();
        $user->assignRole('admin');

        $response = $this->actingAs($user)
            ->postJson('/api/v1/products', [
                'name' => 'A', // Too short (min 2)
                'price' => -10, // Negative price
                'category_id' => 999, // Non-existent category
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name', 'price', 'category_id']);
    }

    /**
     * Test product update fails with invalid data
     */
    public function test_product_update_fails_with_invalid_data(): void
    {
        $user = User::factory()->create();
        $user->assignRole('admin');

        $category = Category::factory()->create();
        $product = Product::factory()->create([
            'category_id' => $category->id,
            'name' => 'Original Product',
            'price' => 100.00,
        ]);

        $response = $this->actingAs($user)
            ->putJson("/api/v1/products/{$product->id}", [
                'name' => 'B', // Too short
                'price' => -5, // Negative price
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name', 'price']);
    }

    /**
     * Test unauthorized user cannot create product
     */
    public function test_unauthorized_user_cannot_create_product(): void
    {
        $user = User::factory()->create();
        $user->assignRole('customer'); // Not admin

        $category = Category::factory()->create();

        $response = $this->actingAs($user)
            ->postJson('/api/v1/products', [
                'name' => 'Unauthorized Product',
                'price' => 50.00,
                'category_id' => $category->id,
            ]);

        $response->assertStatus(403);
    }

    /**
     * Test admin can update product
     */
    public function test_admin_can_update_product(): void
    {
        $user = User::factory()->create();
        $user->assignRole('admin');

        $category = Category::factory()->create();
        $product = Product::factory()->create([
            'category_id' => $category->id,
            'name' => 'Original Product',
            'price' => 100.00,
        ]);

        $response = $this->actingAs($user)
            ->putJson("/api/v1/products/{$product->id}", [
                'name' => 'Updated Product',
                'price' => 150.00,
                'description' => 'Updated description',
            ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
            ]);

        $this->assertDatabaseHas('products', [
            'id' => $product->id,
            'name' => 'Updated Product',
            'price' => 150.00,
            'description' => 'Updated description',
        ]);
    }

    /**
     * Test admin can delete product
     */
    public function test_admin_can_delete_product(): void
    {
        $user = User::factory()->create();
        $user->assignRole('admin');

        $category = Category::factory()->create();
        $product = Product::factory()->create([
            'category_id' => $category->id,
        ]);

        $response = $this->actingAs($user)
            ->deleteJson("/api/v1/products/{$product->id}");

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
            ]);

        $this->assertSoftDeleted('products', [
            'id' => $product->id,
        ]);
    }

    /**
     * Test guest can view single product
     */
    public function test_guest_can_view_single_product(): void
    {
        $category = Category::factory()->create();
        $product = Product::factory()->create([
            'category_id' => $category->id,
            'name' => 'Single Product',
            'price' => 75.00,
            'is_available' => true,
        ]);

        $response = $this->getJson("/api/v1/products/{$product->id}");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'id',
                    'name',
                    'description',
                    'price',
                    'image_url',
                    'category' => [
                        'id',
                        'name',
                    ],
                    'stock_quantity',
                    'is_available',
                    'created_at',
                    'updated_at',
                ],
            ]);

        $this->assertEquals('Single Product', $response->json('data.name'));
        $this->assertEquals(75.00, $response->json('data.price'));
    }

    /**
     * Test product listing with category filter
     */
    public function test_product_listing_with_category_filter(): void
    {
        $category1 = Category::factory()->create(['name' => 'Category 1']);
        $category2 = Category::factory()->create(['name' => 'Category 2']);

        // Create products in different categories
        Product::factory()->count(3)->create([
            'category_id' => $category1->id,
            'is_available' => true,
        ]);
        Product::factory()->count(2)->create([
            'category_id' => $category2->id,
            'is_available' => true,
        ]);

        $response = $this->getJson('/api/v1/products?category_id=' . $category1->id);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
            ])
            ->assertJsonCount(3, 'data.data');

        // Verify all products belong to the specified category
        foreach ($response->json('data.data') as $productData) {
            $this->assertEquals($category1->id, $productData['category']['id']);
        }
    }

    /**
     * Test product listing with availability filter
     */
    public function test_product_listing_with_availability_filter(): void
    {
        $category = Category::factory()->create();

        // Create available and unavailable products
        Product::factory()->count(3)->create([
            'category_id' => $category->id,
            'is_available' => true,
        ]);
        Product::factory()->count(2)->create([
            'category_id' => $category->id,
            'is_available' => false,
        ]);

        $response = $this->getJson('/api/v1/products?is_available=true');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
            ])
            ->assertJsonCount(3, 'data.data');

        // Verify all products are available
        foreach ($response->json('data.data') as $productData) {
            $this->assertTrue($productData['is_available']);
        }
    }

    /**
     * Test product listing with search filter
     */
    public function test_product_listing_with_search_filter(): void
    {
        $category = Category::factory()->create();

        // Create products with different names
        Product::factory()->create([
            'category_id' => $category->id,
            'name' => 'Espresso Coffee',
            'is_available' => true,
        ]);
        Product::factory()->create([
            'category_id' => $category->id,
            'name' => 'Green Tea',
            'is_available' => true,
        ]);
        Product::factory()->create([
            'category_id' => $category->id,
            'name' => 'Chocolate Cake',
            'is_available' => true,
        ]);

        $response = $this->getJson('/api/v1/products?search=coffee');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
            ])
            ->assertJsonCount(1, 'data.data');

        $this->assertEquals('Espresso Coffee', $response->json('data.data.0.name'));
    }

    /**
     * Test product listing with sorting
     */
    public function test_product_listing_with_sorting(): void
    {
        $category = Category::factory()->create();

        // Create products with different prices
        Product::factory()->create([
            'category_id' => $category->id,
            'name' => 'Cheap Product',
            'price' => 10.00,
            'is_available' => true,
        ]);
        Product::factory()->create([
            'category_id' => $category->id,
            'name' => 'Expensive Product',
            'price' => 100.00,
            'is_available' => true,
        ]);
        Product::factory()->create([
            'category_id' => $category->id,
            'name' => 'Medium Product',
            'price' => 50.00,
            'is_available' => true,
        ]);

        // Test ascending sort
        $response = $this->getJson('/api/v1/products?sort_by=price&sort_order=asc');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
            ]);

        $prices = array_column($response->json('data.data'), 'price');
        $this->assertEquals([10.00, 50.00, 100.00], $prices);

        // Test descending sort
        $response = $this->getJson('/api/v1/products?sort_by=price&sort_order=desc');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
            ]);

        $prices = array_column($response->json('data.data'), 'price');
        $this->assertEquals([100.00, 50.00, 10.00], $prices);
    }

    /**
     * Test product listing pagination
     */
    public function test_product_listing_pagination(): void
    {
        $category = Category::factory()->create();

        // Create more products than the per_page limit
        Product::factory()->count(15)->create([
            'category_id' => $category->id,
            'is_available' => true,
        ]);

        // Test first page
        $firstPageResponse = $this->getJson('/api/v1/products?per_page=5');

        $firstPageResponse->assertStatus(200)
            ->assertJson([
                'success' => true,
            ])
            ->assertJsonCount(5, 'data.data')
            ->assertJsonPath('data.meta.total', 15);

        // Test second page
        $secondPageResponse = $this->getJson('/api/v1/products?per_page=5&page=2');

        $secondPageResponse->assertStatus(200)
            ->assertJson([
                'success' => true,
            ])
            ->assertJsonCount(5, 'data.data');

        // Verify we're getting different products on each page
        $firstPageIds = array_column($firstPageResponse->json('data.data'), 'id');
        $secondPageIds = array_column($secondPageResponse->json('data.data'), 'id');

        // They should NOT intersect - different pages should have different products
        $this->assertEmpty(array_intersect($firstPageIds, $secondPageIds));
    }

    /**
     * Test customer cannot update product
     */
    public function test_customer_cannot_update_product(): void
    {
        $user = User::factory()->create();
        $user->assignRole('customer');

        $category = Category::factory()->create();
        $product = Product::factory()->create([
            'category_id' => $category->id,
        ]);

        $response = $this->actingAs($user)
            ->putJson("/api/v1/products/{$product->id}", [
                'name' => 'Hacked Product',
            ]);

        $response->assertStatus(403);
    }

    /**
     * Test customer cannot delete product
     */
    public function test_customer_cannot_delete_product(): void
    {
        $user = User::factory()->create();
        $user->assignRole('customer');

        $category = Category::factory()->create();
        $product = Product::factory()->create([
            'category_id' => $category->id,
        ]);

        $response = $this->actingAs($user)
            ->deleteJson("/api/v1/products/{$product->id}");

        $response->assertStatus(403);
    }
}
