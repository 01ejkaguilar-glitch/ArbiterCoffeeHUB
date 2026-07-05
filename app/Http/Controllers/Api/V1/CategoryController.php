<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\BaseController;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Cache;
use App\Http\Controllers\Api\V1\Traits\CacheTaggingTrait;

class CategoryController extends BaseController
{
    use CacheTaggingTrait;

    // Cache TTL in seconds
    const CACHE_TTL = 600; // 10 minutes (categories change less frequently)



    
    /**
     * Display a listing of categories.
     */
    public function index(Request $request)
    {
        // Create cache key based on request parameters
        $cacheKey = 'categories_list_' . md5(json_encode($request->all()));

        // Try to get from cache with hit/miss tracking
        $categories = $this->rememberTagged($cacheKey, self::CACHE_TTL, function () use ($request) {
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
        }, ['categories']);

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
        $this->clearTaggedCache(['categories']);
        $this->warmCriticalCategories();

        return $this->sendCreated($category, 'Category created successfully');
    }

    /**
     * Display the specified category.
     */
    public function show($id)
    {
        $cacheKey = 'category_' . $id;

        $category = $this->rememberTagged($cacheKey, self::CACHE_TTL, function () use ($id) {
            return Category::withCount('products')->find($id);
        }, ['categories']);

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
        $this->clearTaggedCache(['categories']);
        $this->warmCriticalCategories();

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
        $this->clearTaggedCache(['categories']);
        $this->warmCriticalCategories();

        return $this->sendResponse(null, 'Category deleted successfully');
    }

    /**
     * Warm up critical category data after cache clearing.
     */
    protected function warmCriticalCategories()
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
}
