<?php

namespace Tests\Unit\Services;

use App\Services\CustomerInsightsService;
use App\Services\CacheMetricsService;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Collection;
use Mockery;
use Tests\TestCase;

class CustomerInsightsServiceTest extends TestCase
{
    use RefreshDatabase;

    protected $customerInsightsService;
    protected $mockCacheMetricsService;

    public function setUp(): void
    {
        parent::setUp();

        // Mock CacheMetricsService
        $this->mockCacheMetricsService = Mockery::mock(CacheMetricsService::class);
        $this->app->instance(CacheMetricsService::class, $this->mockCacheMetricsService);

        // Create the service instance
        $this->customerInsightsService = new CustomerInsightsService();

        // Clear cache before each test
        Cache::flush();
    }

    public function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }

    public function test_generate_customer_insights_returns_cached_data_on_hit()
    {
        // Arrange
        $customerId = 1;
        $cacheKey = "customer_insights_{$customerId}";
        $cachedData = ['test' => 'data'];

        // Mock Cache to return cached data
        Cache::shouldReceive('has')
            ->with($cacheKey)
            ->andReturn(true);
        Cache::shouldReceive('get')
            ->with($cacheKey)
            ->andReturn($cachedData);

        // Mock CacheMetricsService to track hit
        $this->mockCacheMetricsService->shouldReceive('hit')
            ->once();

        // Act
        $result = $this->customerInsightsService->generateCustomerInsights($customerId);

        // Assert
        $this->assertEquals($cachedData, $result);
    }

    public function test_generate_customer_insights_generates_and_caches_data_on_miss()
    {
        // Arrange
        $customerId = 1;
        $cacheKey = "customer_insights_{$customerId}";

        // Create a test user to prevent ModelNotFoundException
        $user = User::factory()->create(['id' => $customerId]);

        // Expected data structure for a user with no orders
        $expectedData = [
            'purchase_behavior' => ['status' => 'insufficient_data'],
            'product_affinity' => [
                'favorite_categories' => [],
                'favorite_products' => [],
                'product_combinations' => [],
                'taste_profile' => ['status' => 'no_coffee_purchases'],
            ],
            'engagement_score' => [
                'cei_score' => 5.0,
                'engagement_level' => 'DISENGAGED',
                'components' => [
                    'frequency' => 0.0,
                    'monetary' => 0.0,
                    'recency' => 0.0,
                    'diversity' => 0.0,
                    'interaction' => 50.0,
                ],
            ],
            'satisfaction_indicators' => ['status' => 'insufficient_data'],
            'predictions' => ['status' => 'insufficient_data'],
            'lifecycle_stage' => [
                'stage' => 'AWARENESS',
                'description' => 'Registered but no purchases yet',
            ],
            'recommendations' => [
                [
                    'action' => 'WIN_BACK_CAMPAIGN',
                    'priority' => 'HIGH',
                    'message' => 'Send personalized win-back offer with 20% discount',
                ]
            ],
        ];

        // Mock Cache for miss
        Cache::shouldReceive('has')
            ->with($cacheKey)
            ->andReturn(false);
        Cache::shouldReceive('remember')
            ->with($cacheKey, 3600, Mockery::any())
            ->andReturnUsing(function ($key, $ttl, $callback) {
                return $callback();
            });

        // Mock CacheMetricsService to track miss
        $this->mockCacheMetricsService->shouldReceive('miss')
            ->once();

        // Act
        $result = $this->customerInsightsService->generateCustomerInsights($customerId);

        // Assert
        $this->assertEquals($expectedData, $result);
    }

    public function test_generate_customer_insights_handles_no_user_data()
    {
        // Arrange
        $customerId = 999; // Non-existent user

        // Mock Cache for miss (since we won't have cached data)
        Cache::shouldReceive('has')
            ->andReturn(false);
        Cache::shouldReceive('remember')
            ->andReturnUsing(function ($key, $ttl, $callback) {
                return $callback();
            });

        // Mock CacheMetricsService to track miss
        $this->mockCacheMetricsService->shouldReceive('miss')
            ->once();

        // Act & Assert - should throw ModelNotFoundException
        $this->expectException(\Illuminate\Database\Eloquent\ModelNotFoundException::class);

        $this->customerInsightsService->generateCustomerInsights($customerId);
    }

    public function test_clear_customer_insights_cache_deletes_cache_entry()
    {
        // Arrange
        $customerId = 1;
        $cacheKey = "customer_insights_{$customerId}";

        // Put something in cache
        Cache::put($cacheKey, ['test' => 'data'], 3600);

        // Verify it's there
        $this->assertTrue(Cache::has($cacheKey));

        // Act
        $this->customerInsightsService->clearCustomerInsightsCache($customerId);

        // Assert
        $this->assertFalse(Cache::has($cacheKey));
    }
}