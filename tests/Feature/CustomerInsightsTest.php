<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Product;
use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Tests\TestCase;

class CustomerInsightsTest extends TestCase
{
    use RefreshDatabase;

    public function setUp(): void
    {
        parent::setUp();
        Cache::flush();
    }

    public function tearDown(): void
    {
        Cache::flush();
        parent::tearDown();
    }

    /** @test */
    public function guest_cannot_access_customer_insights()
    {
        $response = $this->getJson('/api/v1/customer-insights');
        $response->assertStatus(401);
    }

    /** @test */
    public function authenticated_user_can_view_own_insights()
    {
        // Create a user
        $user = User::factory()->create();

        // Acting as the user
        $response = $this->actingAs($user)
            ->getJson('/api/v1/customer-insights');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'purchase_behavior',
                    'product_affinity',
                    'engagement_score',
                    'satisfaction_indicators',
                    'predictions',
                    'lifecycle_stage',
                    'recommendations'
                ],
                'message'
            ]);
    }

    /** @test */
    public function user_cannot_view_another_users_insights_unless_admin()
    {
        // Create two users
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();

        // Trying to access user1's insights as user2
        $response = $this->actingAs($user2)
            ->getJson('/api/v1/customer-insights?customer_id=' . $user1->id);

        $response->assertStatus(403);
    }

    /** @test */
    public function admin_can_view_any_users_insights()
    {
        // Create an admin user and a regular user
        $admin = User::factory()->create();
        $admin->assignRole('admin');
        $user = User::factory()->create();

        // Admin accessing user's insights
        $response = $this->actingAs($admin)
            ->getJson('/api/v1/customer-insights?customer_id=' . $user->id);

        $response->assertStatus(200);
    }

    /** @test */
    public function super_admin_can_view_any_users_insights()
    {
        // Create a super-admin user and a regular user
        $superAdmin = User::factory()->create();
        $superAdmin->assignRole('super-admin');
        $user = User::factory()->create();

        // Super-admin accessing user's insights
        $response = $this->actingAs($superAdmin)
            ->getJson('/api/v1/customer-insights?customer_id=' . $user->id);

        $response->assertStatus(200);
    }

    /** @test */
    public function purchase_behavior_endpoint_returns_correct_data()
    {
        $user = User::factory()->create();
        $response = $this->actingAs($user)
            ->getJson('/api/v1/customer-insights/purchase-behavior');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data',
                'message'
            ]);
    }

    /** @test */
    public function product_affinity_endpoint_returns_correct_data()
    {
        $user = User::factory()->create();
        $response = $this->actingAs($user)
            ->getJson('/api/v1/customer-insights/product-affinity');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data',
                'message'
            ]);
    }

    /** @test */
    public function engagement_score_endpoint_returns_correct_data()
    {
        $user = User::factory()->create();
        $response = $this->actingAs($user)
            ->getJson('/api/v1/customer-insights/engagement-score');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'cei_score',
                    'engagement_level',
                    'components'
                ],
                'message'
            ]);
    }

    /** @test */
    public function lifecycle_stage_endpoint_returns_correct_data()
    {
        $user = User::factory()->create();
        $response = $this->actingAs($user)
            ->getJson('/api/v1/customer-insights/lifecycle-stage');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'stage',
                    'description'
                ],
                'message'
            ]);
    }

    /** @test */
    public function recommendations_endpoint_returns_correct_data()
    {
        $user = User::factory()->create();
        $response = $this->actingAs($user)
            ->getJson('/api/v1/customer-insights/recommendations');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    '*' => ['action', 'priority', 'message']
                ],
                'message'
            ]);
    }

    /** @test */
    public function predictions_endpoint_returns_correct_data()
    {
        $user = User::factory()->create();
        $response = $this->actingAs($user)
            ->getJson('/api/v1/customer-insights/predictions');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data',
                'message'
            ]);
    }

    /** @test */
    public function satisfaction_indicators_endpoint_returns_correct_data()
    {
        $user = User::factory()->create();
        $response = $this->actingAs($user)
            ->getJson('/api/v1/customer-insights/satisfaction');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data',
                'message'
            ]);
    }

    /** @test */
    public function clear_cache_endpoint_works()
    {
        $user = User::factory()->create();

        // Put something in cache first
        Cache::put("customer_insights_{$user->id}", ['test' => 'data'], 3600);
        $this->assertTrue(Cache::has("customer_insights_{$user->id}"));

        // Clear the cache
        $response = $this->actingAs($user)
            ->postJson('/api/v1/customer-insights/clear-cache');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true
            ]);

        // Verify cache is cleared
        $this->assertFalse(Cache::has("customer_insights_{$user->id}"));
    }

    /** @test */
    public function bulk_insights_endpoint_requires_admin()
    {
        // Create two regular users
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();

        // Try to access bulk insights as regular user
        $response = $this->actingAs($user1)
            ->postJson('/api/v1/admin/analytics/customer-insights/bulk', [
                'customer_ids' => [$user1->id, $user2->id]
            ]);

        $response->assertStatus(403);
    }

    /** @test */
    public function bulk_insights_endpoint_works_for_admin()
    {
        // Create an admin user and two regular users
        $admin = User::factory()->create();
        $admin->assignRole('admin');
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();

        // Admin accessing bulk insights
        $response = $this->actingAs($admin)
            ->postJson('/api/v1/admin/analytics/customer-insights/bulk', [
                'customer_ids' => [$user1->id, $user2->id]
            ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    $user1->id => [
                        'purchase_behavior',
                        'product_affinity',
                        'engagement_score',
                        'satisfaction_indicators',
                        'predictions',
                        'lifecycle_stage',
                        'recommendations'
                    ],
                    $user2->id => [
                        'purchase_behavior',
                        'product_affinity',
                        'engagement_score',
                        'satisfaction_indicators',
                        'predictions',
                        'lifecycle_stage',
                        'recommendations'
                    ]
                ],
                'message'
            ]);
    }

    /** @test */
    public function insights_contain_expected_structure_for_new_user()
    {
        $user = User::factory()->create();
        $response = $this->actingAs($user)
            ->getJson('/api/v1/customer-insights');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Customer insights retrieved successfully'
            ])
            ->assertJsonStructure([
                'success',
                'data' => [
                    'purchase_behavior' => [
                        'status'
                    ],
                    'product_affinity' => [
                        'favorite_categories',
                        'favorite_products',
                        'product_combinations',
                        'taste_profile'
                    ],
                    'engagement_score' => [
                        'cei_score',
                        'engagement_level',
                        'components' => [
                            'frequency',
                            'monetary',
                            'recency',
                            'diversity',
                            'interaction'
                        ]
                    ],
                    'satisfaction_indicators' => [
                        'status'
                    ],
                    'predictions' => [
                        'status'
                    ],
                    'lifecycle_stage' => [
                        'stage',
                        'description'
                    ],
                    'recommendations' => [
                        '*' => ['action', 'priority', 'message']
                    ]
                ]
            ]);
    }
}