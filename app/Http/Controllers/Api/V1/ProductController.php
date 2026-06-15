<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\BaseController;
use App\Models\Product;
use Illuminate\Http\Request;
use App\Http\Requests\StoreProductRequest;
use App\Http\Requests\UpdateProductRequest;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Event;
use App\Http\Resources\ProductResource;
use App\Http\Resources\ProductCollection;

class ProductController extends BaseController
{
    // Cache TTL in seconds
    const CACHE_TTL = 300; // 5 minutes

    /**
     * Clear the products cache using Laravel cache tagging.
     * Since we're using Redis (confirmed in .env), we can leverage tagging
     * for more efficient cache clearing.
     */
    private function clearProductsCache()
    {
        // Flush all cache entries tagged with 'products'
        Cache::tags(['products'])->flush();

        // Warm up critical product data to prevent cache stampede
        $this->warmCriticalProducts();
    }

    /**
     * Cache with tagging support.
     * Tracks cache hits/misses for metrics.
     */
    private function rememberProduct($cacheKey, $ttl, $callback)
    {
        // Try to get from cache first to track hits/misses
        if (Cache::tags(['products'])->has($cacheKey)) {
            app(\App\Services\CacheMetricsService::class)->hit();
            return Cache::tags(['products'])->get($cacheKey);
        }

        // Cache miss - generate value and store it
        app(\App\Services\CacheMetricsService::class)->miss();
        $value = Cache::tags(['products'])->remember($cacheKey, $ttl, $callback);

        return $value;
    }

    /**
     * Warm up critical product data after cache clearing.
     */
    private function warmCriticalProducts()
    {
        // Warm up the main products list (without filters)
        $mainProductsKey = 'products_list_' . md5(json_encode([]));
        if (!Cache::tags(['products'])->has($mainProductsKey)) {
            $products = Product::with('category')
                ->where('is_available', true)
                ->orderBy('created_at', 'desc')
                ->take(20)
                ->get();
            Cache::tags(['products'])->put($mainProductsKey, $products, self::CACHE_TTL);
        }
    }

    /**
     * Display a listing of products.
     */
    public function index(Request $request)
    {
        // Create cache key based on request parameters
        $cacheKey = 'products_list_' . md5(json_encode($request->all()));

        // Try to get from cache (without tags for database cache driver compatibility)
        $products = $this->rememberProduct($cacheKey, self::CACHE_TTL, function () use ($request) {
            $query = Product::with('category');

            // Filter by category
            $categoryId = $request->input('category_id');
            if ($categoryId !== null) {
                $query->where('category_id', $categoryId);
            }

            // Filter by availability
            $isAvailable = $request->input('is_available');
            if ($isAvailable !== null) {
                $query->where('is_available', $isAvailable);
            }

            // Search by name
            $search = $request->input('search');
            if ($search !== null) {
                $query->where('name', 'like', '%' . $search . '%');
            }

            // Sorting
            $sortBy = $request->get('sort_by', 'created_at');
            $sortOrder = $request->get('sort_order', 'desc');
            $query->orderBy($sortBy, $sortOrder);

            // Pagination
            $perPage = $request->get('per_page', 15);
            return $query->paginate($perPage);
        });

        return $this->sendResponse(new ProductCollection($products), 'Products retrieved successfully');
    }

    /**
     * Admin product listing — bypasses cache, returns all products (no pagination
     * limit by default so the admin sees every record).
     */
    public function adminIndex(Request $request)
    {
        $query = Product::with('category');

        // Optional filters (same as public index)
        if ($request->filled('category_id')) {
            $query->where('category_id', $request->input('category_id'));
        }
        if ($request->filled('is_available')) {
            $query->where('is_available', $request->input('is_available'));
        }
        if ($request->filled('search')) {
            $query->where('name', 'like', '%' . $request->input('search') . '%');
        }

        $sortBy    = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        // Paginate with a larger default so the admin sees all products
        $perPage  = $request->get('per_page', 100);
        $products = $query->paginate($perPage);

        return $this->sendResponse($products, 'Products retrieved successfully');
    }

    /**
     * Store a newly created product.
     */
    public function store(StoreProductRequest $request)
    {
        $this->authorize('create', Product::class);

        $productData = $request->except('image');

        // Handle image upload
        if ($request->hasFile('image')) {
            $image = $request->file('image');
            $imageName = time() . '_' . uniqid() . '.' . $image->getClientOriginalExtension();
            $imagePath = $image->storeAs('products', $imageName, 'public');
            $productData['image_url'] = '/storage/' . $imagePath;
        }

        $product = Product::create($productData);
        $product->load('category');

        // Fire ProductCreated event to handle cache clearing
        event(new \App\Events\ProductCreated($product));

        return $this->sendCreated(new ProductResource($product), 'Product created successfully');
    }

    /**
     * Display the specified product.
     */
    public function show($id)
    {
        $cacheKey = 'product_' . $id;

        $product = $this->rememberProduct($cacheKey, self::CACHE_TTL, function () use ($id) {
            return Product::with('category')->find($id);
        });

        if (!$product) {
            return $this->sendNotFound('Product not found');
        }

        $this->authorize('view', $product);

        return $this->sendResponse(new ProductResource($product), 'Product retrieved successfully');
    }

    /**
     * Update the specified product.
     */
    public function update(UpdateProductRequest $request, $id)
    {
        $product = Product::find($id);

        if (!$product) {
            return $this->sendNotFound('Product not found');
        }

        $this->authorize('update', $product);

        $productData = $request->except('image');

        // Handle image upload
        if ($request->hasFile('image')) {
            // Delete old image if exists
            if ($product->image_url && file_exists(public_path($product->image_url))) {
                unlink(public_path($product->image_url));
            }

            $image = $request->file('image');
            $imageName = time() . '_' . uniqid() . '.' . $image->getClientOriginalExtension();
            $imagePath = $image->storeAs('products', $imageName, 'public');
            $productData['image_url'] = '/storage/' . $imagePath;
        }

        $product->update($productData);
        $product->load('category');

        // Fire ProductUpdated event to handle cache clearing
        event(new \App\Events\ProductUpdated($product));

        return $this->sendResponse(new ProductResource($product), 'Product updated successfully');
    }

    /**
     * Remove the specified product.
     */
    public function destroy($id)
    {
        $product = Product::find($id);

        if (!$product) {
            return $this->sendNotFound('Product not found');
        }

        $this->authorize('delete', $product);

        $product->delete();

        // Clear the products cache since we deleted a product
        $this->clearProductsCache();

        return $this->sendResponse(null, 'Product deleted successfully');
    }

    /**
     * Get recipe instructions for a product
     */
    public function getRecipe($id)
    {
        try {
            $product = Product::find($id);

            if (!$product) {
                return $this->sendNotFound('Product not found');
            }

            $recipe = [
                'product_id' => $product->id,
                'name' => $product->name,
                'brewing_method' => $product->brewing_method,
                'recommended_water_temp' => $product->recommended_water_temp,
                'recommended_brew_time' => $product->recommended_brew_time,
                'coffee_to_water_ratio' => $product->coffee_to_water_ratio,
                'grind_size' => $product->grind_size,
                'steps' => $product->recipe_instructions ?? [],
            ];

            return $this->sendResponse($recipe, 'Recipe retrieved successfully');
        } catch (\Exception $e) {
            return $this->sendError('Failed to retrieve recipe', 500, ['error' => $e->getMessage()]);
        }
    }
}