<?php

namespace Tests\Unit\Policies;

use App\Models\User;
use App\Models\Product;
use App\Policies\ProductPolicy;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProductPolicyTest extends TestCase
{
    use RefreshDatabase;

    public function setUp(): void
    {
        parent::setUp();
        $this->policy = new ProductPolicy();
    }

    public function test_admin_can_create_product()
    {
        $user = User::factory()->create();
        $user->assignRole('admin');

        $result = $this->policy->create($user);

        $this->assertTrue($result);
    }

    public function test_super_admin_can_create_product()
    {
        $user = User::factory()->create();
        $user->assignRole('super-admin');

        $result = $this->policy->create($user);

        $this->assertTrue($result);
    }

    public function test_customer_cannot_create_product()
    {
        $user = User::factory()->create();
        $user->assignRole('customer');

        $result = $this->policy->create($user);

        $this->assertFalse($result);
    }

    public function test_admin_can_update_product()
    {
        $user = User::factory()->create();
        $user->assignRole('admin');
        $product = Product::factory()->create();

        $result = $this->policy->update($user, $product);

        $this->assertTrue($result);
    }

    public function test_super_admin_can_update_product()
    {
        $user = User::factory()->create();
        $user->assignRole('super-admin');
        $product = Product::factory()->create();

        $result = $this->policy->update($user, $product);

        $this->assertTrue($result);
    }

    public function test_customer_cannot_update_product()
    {
        $user = User::factory()->create();
        $user->assignRole('customer');
        $product = Product::factory()->create();

        $result = $this->policy->update($user, $product);

        $this->assertFalse($result);
    }

    public function test_admin_can_delete_product()
    {
        $user = User::factory()->create();
        $user->assignRole('admin');
        $product = Product::factory()->create();

        $result = $this->policy->delete($user, $product);

        $this->assertTrue($result);
    }

    public function test_super_admin_can_delete_product()
    {
        $user = User::factory()->create();
        $user->assignRole('super-admin');
        $product = Product::factory()->create();

        $result = $this->policy->delete($user, $product);

        $this->assertTrue($result);
    }

    public function test_customer_cannot_delete_product()
    {
        $user = User::factory()->create();
        $user->assignRole('customer');
        $product = Product::factory()->create();

        $result = $this->policy->delete($user, $product);

        $this->assertFalse($result);
    }

    public function test_any_user_can_view_product()
    {
        $user = User::factory()->create();
        $user->assignRole('customer'); // Test with non-admin role
        $product = Product::factory()->create();

        $result = $this->policy->view($user, $product);

        $this->assertTrue($result);
    }
}