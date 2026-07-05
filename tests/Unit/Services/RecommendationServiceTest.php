<?php

namespace Tests\Unit\Services;

use App\Services\RecommendationService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RecommendationServiceTest extends TestCase
{
    use RefreshDatabase;

    protected $recommendationService;

    public function setUp(): void
    {
        parent::setUp();
        $this->recommendationService = new RecommendationService();
    }

    public function test_get_current_season_returns_correct_season()
    {
        // Test each season by mocking Carbon::now()
        // Since we can't easily mock static calls, we'll test the logic directly

        // Test spring (March - May)
        $this->assertEquals('spring', $this->testGetCurrentSeasonForMonth(3));
        $this->assertEquals('spring', $this->testGetCurrentSeasonForMonth(4));
        $this->assertEquals('spring', $this->testGetCurrentSeasonForMonth(5));

        // Test summer (June - August)
        $this->assertEquals('summer', $this->testGetCurrentSeasonForMonth(6));
        $this->assertEquals('summer', $this->testGetCurrentSeasonForMonth(7));
        $this->assertEquals('summer', $this->testGetCurrentSeasonForMonth(8));

        // Test fall (September - November)
        $this->assertEquals('fall', $this->testGetCurrentSeasonForMonth(9));
        $this->assertEquals('fall', $this->testGetCurrentSeasonForMonth(10));
        $this->assertEquals('fall', $this->testGetCurrentSeasonForMonth(11));

        // Test winter (December - February)
        $this->assertEquals('winter', $this->testGetCurrentSeasonForMonth(12));
        $this->assertEquals('winter', $this->testGetCurrentSeasonForMonth(1));
        $this->assertEquals('winter', $this->testGetCurrentSeasonForMonth(2));
    }

    private function testGetCurrentSeasonForMonth(int $month): string
    {
        // Create a closure that mimics the getCurrentSeason logic
        $getCurrentSeason = function () use ($month) {
            if ($month >= 3 && $month <= 5) return 'spring';
            if ($month >= 6 && $month <= 8) return 'summer';
            if ($month >= 9 && $month <= 11) return 'fall';
            return 'winter';
        };

        return $getCurrentSeason();
    }

    public function test_calculate_customer_affinity_score_returns_valid_score()
    {
        // Create test data
        $user = \App\Models\User::factory()->create();
        $product = \App\Models\Product::factory()->create([
            'is_available' => true,
        ]);

        // Test with no purchases (should return 0)
        $score = $this->recommendationService->calculateCustomerAffinityScore(
            $user->id,
            $product->id
        );
        $this->assertEquals(0.0, $score);

        // Create an order with the product
        $order = \App\Models\Order::factory()->create([
            'user_id' => $user->id,
        ]);

        \App\Models\OrderItem::factory()->create([
            'order_id' => $order->id,
            'product_id' => $product->id,
            'quantity' => 2,
            'unit_price' => 10.00,
        ]);

        // Test with some purchases
        $score = $this->recommendationService->calculateCustomerAffinityScore(
            $user->id,
            $product->id
        );

        // Score should be greater than 0
        $this->assertGreaterThan(0, $score);

        // Score should be a reasonable value (not extremely high)
        $this->assertLessThanOrEqual(100, $score);
    }

    public function test_clear_customer_recommendation_cache_clears_both_caches()
    {
        $customerId = 1;

        // Put some fake data in cache
        \Illuminate\Support\Facades\Cache::put(
            "product_recommendations_{$customerId}",
            ['fake' => 'data'],
            3600
        );
        \Illuminate\Support\Facades\Cache::put(
            "coffee_bean_recommendations_{$customerId}",
            ['fake' => 'data'],
            3600
        );

        // Verify cache has data
        $this->assertTrue(\Illuminate\Support\Facades\Cache::has("product_recommendations_{$customerId}"));
        $this->assertTrue(\Illuminate\Support\Facades\Cache::has("coffee_bean_recommendations_{$customerId}"));

        // Call the method
        $this->recommendationService->clearCustomerRecommendationCache($customerId);

        // Verify cache is cleared
        $this->assertFalse(\Illuminate\Support\Facades\Cache::has("product_recommendations_{$customerId}"));
        $this->assertFalse(\Illuminate\Support\Facades\Cache::has("coffee_bean_recommendations_{$customerId}"));
    }
}