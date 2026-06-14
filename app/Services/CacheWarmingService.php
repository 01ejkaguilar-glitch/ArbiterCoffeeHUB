<?php

namespace App\Services;

use App\Models\Product;
use App\Models\Category;
use App\Models\CoffeeBean;
use App\Services\ProductService;
use App\Services\RecommendationService;
use Illuminate\Support\Facades\Cache;

/**
 * Cache Warming Service
 *
 * Responsible for warming up cache with frequently accessed data
 * to prevent cache stampede and improve response times after deployments
 * or cache clearing events.
 */
class CacheWarmingService
{
    /**
     * Warm up all caches with popular/frequently accessed data
     */
    public function warmAllCaches(): void
    {
        $this->warmPopularProducts();
        $this->warmPopularCategories();
        $this->warmPopularRecommendations();
        $this->warmPopularCoffeeBeans();
    }

    /**
     * Warm up popular products cache
     */
    public function warmPopularProducts(): void
    {
        // Get popular products (based on sales or views)
        $popularProducts = Product::where('is_available', true)
            ->with('category')
            ->orderBy('created_at', 'desc') // Simple heuristic: newer products are likely more popular
            ->take(20)
            ->get();

        // Cache each popular product individually
        foreach ($popularProducts as $product) {
            $cacheKey = 'product_' . $product->id;
            if (!Cache::has($cacheKey)) {
                Cache::put($cacheKey, $product->load('category'), 300); // 5 minutes TTL
            }
        }

        // Cache popular products list
        $popularProductsListKey = 'popular_products_list';
        if (!Cache::has($popularProductsListKey)) {
            Cache::put($popularProductsListKey, $popularProducts, 300);
        }
    }

    /**
     * Warm up popular categories cache
     */
    public function warmPopularCategories(): void
    {
        // Get categories with products (most likely to be accessed)
        $popularCategories = Category::withCount('products')
            ->where('products_count', '>', 0)
            ->orderByDesc('products_count')
            ->take(10)
            ->get();

        // Cache each popular category
        foreach ($popularCategories as $category) {
            $cacheKey = 'category_' . $category->id;
            if (!Cache::has($cacheKey)) {
                Cache::put($cacheKey, $category->loadCount('products'), 600); // 10 minutes TTL
            }
        }

        // Cache popular categories list
        $popularCategoriesListKey = 'popular_categories_list';
        if (!Cache::has($popularCategoriesListKey)) {
            Cache::put($popularCategoriesListKey, $popularCategories, 600);
        }
    }

    /**
     * Warm up popular recommendations cache
     */
    public function warmPopularRecommendations(): void
    {
        // Since recommendations are user-specific, we'll warm up for a sample of users
        // In a real implementation, you might want to warm up for active users or segments
        $recommendationService = app(RecommendationService::class);

        // Get some active users (those who have ordered recently)
        $activeUserIds = \DB::table('orders')
            ->where('status', 'completed')
            ->where('created_at', '>=', now()->subDays(30))
            ->pluck('user_id')
            ->unique()
            ->take(50)
            ->toArray();

        // Warm up recommendations for active users
        foreach ($activeUserIds as $userId) {
            $cacheKey = 'product_recommendations_' . $userId;
            if (!Cache::has($cacheKey)) {
                // This will trigger the recommendation service to generate and cache recommendations
                $recommendationService->getProductRecommendations($userId, 10);
                Cache::put($cacheKey, true, 3600); // Mark as warmed for 1 hour
            }
        }
    }

    /**
     * Warm up popular coffee beans cache
     */
    public function warmPopularCoffeeBeans(): void
    {
        // Get popular coffee beans (featured or high stock)
        $popularCoffeeBeans = CoffeeBean::where('stock_quantity', '>', 0)
            ->where('is_featured', true)
            ->orWhere(function($query) {
                $query->where('stock_quantity', '>', 50); // High stock items
            })
            ->take(15)
            ->get();

        // Cache each popular coffee bean
        foreach ($popularCoffeeBeans as $coffeeBean) {
            $cacheKey = 'coffee_bean_' . $coffeeBean->id;
            if (!Cache::has($cacheKey)) {
                Cache::put($cacheKey, $coffeeBean, 600); // 10 minutes TTL
            }
        }

        // Cache featured coffee beans list
        $featuredCoffeeBeansKey = 'featured_coffee_beans_list';
        if (!Cache::has($featuredCoffeeBeansKey)) {
            Cache::put($featuredCoffeeBeansKey, $popularCoffeeBeans, 600);
        }
    }

    /**
     * Warm up cache for a specific product (called after product updates)
     */
    public function warmProduct(int $productId): void
    {
        $product = Product::with('category')->find($productId);
        if ($product) {
            $cacheKey = 'product_' . $productId;
            Cache::put($cacheKey, $product, 300);
        }
    }

    /**
     * Warm up cache for a specific category (called after category updates)
     */
    public function warmCategory(int $categoryId): void
    {
        $category = Category::withCount('products')->find($categoryId);
        if ($category) {
            $cacheKey = 'category_' . $categoryId;
            Cache::put($cacheKey, $category, 600);
        }
    }
}