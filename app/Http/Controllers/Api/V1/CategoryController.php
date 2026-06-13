<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\BaseController;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Cache;

class CategoryController extends BaseController
{
    // Cache TTL in seconds
    const CACHE_TTL = 600; // 10 minutes (categories change less frequently)

    /**
     * Clear the categories cache using Laravel cache tagging.
     * Since we're using Redis (confirmed in .env), we can leverage tagging
     * for more efficient cache clearing.
     */
    private function clearCategoriesCache()
    {
        // Flush all cache entries tagged with 'categories'
        Cache::tags(['categories'])->flush();

        // Warm up critical category data to prevent cache stampede
        $this->warmCriticalCategories();
    }

    /**
     * Warm up critical category data after cache clearing.
     */
    private function warmCriticalCategories()
    {
        // Warm up the main categories list (without filters)
        $mainCategoriesKey = 'categories_list_' . md5(json_encode([]));
        if (!Cache::tags(['categories'])->has($mainCategoriesKey)) {
            $categories = Category::withCount('products')
                ->orderBy('sort_order', 'asc')
                ->get();
            Cache::tags(['categories'])->put($mainCategoriesKey, $categories, self::CACHE_TTL);
        }
    }

    /**
     * Cache with tagging support.
     * Tracks cache hits/misses for metrics.
     */
    private function rememberCategory($cacheKey, $ttl, $callback)
    {
        // Try to get from cache first to track hits/misses
        if (Cache::tags(['categories'])->has($cacheKey)) {
            app(\App\Services\CacheMetricsService::class)->hit();
            return Cache::tags(['categories'])->get($cacheKey);
        }

        // Cache miss - generate value and store it
        app(\App\Services\CacheMetricsService::class)->miss();
        $value = Cache::tags(['categories'])->remember($cacheKey, $ttl, $callback);

        return $value;
    }
    
    /**
     * Display a listing of categories.
     */
    public function index(Request $request)
    {
        // Create cache key based on request parameters
        $cacheKey = 'categories_list_' . md5(json_encode($request->all()));

        // Try to get from cache (without tags for database cache driver compatibility)
        $categories = $this->rememberCategory($cacheKey, self::CACHE_TTL, function () use ($request) {
            $query = Category::query();

            // Filter by active status
            $isActive = $request->input('is_active');
            if ($isActive !== null) {
                $query->where('is_active', $isActive);
            }

            // Include product count
            if ($request->get('with_products_count', false)) {
                $query->withCount('products');
            }

            // Sorting
            $query->orderBy('sort_order', 'asc');

            return $query->get();
        });

        return $this->sendResponse($categories, 'Categories retrieved successfully');
    }

    /**
     * Store a newly created category.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'image_url' => 'nullable|string',
            'sort_order' => 'integer|min:0',
            'is_active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return $this->sendValidationError($validator->errors()->toArray());
        }

        $category = Category::create($request->all());
        
        // Clear cache after creating
        $this->clearCategoriesCache();

        return $this->sendCreated($category, 'Category created successfully');
    }

    /**
     * Display the specified category.
     */
    public function show($id)
    {
        $cacheKey = 'category_' . $id;

        $category = $this->rememberCategory($cacheKey, self::CACHE_TTL, function () use ($id) {
            return Category::withCount('products')->find($id);
        });

        if (!$category) {
            return $this->sendNotFound('Category not found');
        }

        return $this->sendResponse($category, 'Category retrieved successfully');
    }

    /**
     * Update the specified category.
     */
    public function update(Request $request, $id)
    {
        $category = Category::find($id);

        if (!$category) {
            return $this->sendNotFound('Category not found');
        }

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'image_url' => 'nullable|string',
            'sort_order' => 'integer|min:0',
            'is_active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return $this->sendValidationError($validator->errors()->toArray());
        }

        $category->update($request->all());
        
        // Clear cache after updating
        $this->clearCategoriesCache();

        return $this->sendResponse($category, 'Category updated successfully');
    }

    /**
     * Remove the specified category.
     */
    public function destroy($id)
    {
        $category = Category::find($id);

        if (!$category) {
            return $this->sendNotFound('Category not found');
        }

        $category->delete();
        
        // Clear cache after deleting
        $this->clearCategoriesCache();

        return $this->sendResponse(null, 'Category deleted successfully');
    }
}
