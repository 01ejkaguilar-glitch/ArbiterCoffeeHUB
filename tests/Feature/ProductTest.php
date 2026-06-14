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
}
