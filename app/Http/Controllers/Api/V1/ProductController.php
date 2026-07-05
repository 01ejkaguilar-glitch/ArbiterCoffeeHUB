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
use Illuminate\Support\Facades\Log;
use App\Http\Resources\ProductResource;
use App\Http\Resources\ProductCollection;
use App\Http\Controllers\Api\V1\Traits\CacheTaggingTrait;
use App\Traits\HasCacheKeyGeneration;
use App\Traits\HasSorting;
use OpenApi\Attributes as OA;

class ProductController extends BaseController
{
    use CacheTaggingTrait, HasCacheKeyGeneration, HasSorting;

    // Cache TTL in seconds
    const CACHE_TTL = 300; // 5 minutes

    /**
     * @OA\Tag(
     *     name="Products",
     *     description="Product management endpoints"
     * )
     */


    /**
     * @OA\Get(
     *     path="/api/products",
     *     operationId="getProductsList",
     *     tags={"Products"},
     *     summary="Get list of products",
     *     description="Returns a paginated list of products with optional filtering",
     *     @OA\Parameter(
     *         name="category_id",
     *         in="query",
     *         description="Filter by category ID",
     *         required=false,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Parameter(
     *         name="is_available",
     *         in="query",
     *         description="Filter by availability status",
     *         required=false,
     *         @OA\Schema(type="boolean")
     *     ),
     *     @OA\Parameter(
     *         name="search",
     *         in="query",
     *         description="Search in product name",
     *         required=false,
     *         @OA\Schema(type="string")
     *     ),
     *     @OA\Parameter(
     *         name="sort_by",
     *         in="query",
     *         description="Sort by field",
     *         required=false,
     *         @OA\Schema(type="string", default="created_at")
     *     ),
     *     @OA\Parameter(
     *         name="sort_order",
     *         in="query",
     *         description="Sort order (asc or desc)",
     *         required=false,
     *         @OA\Schema(type="string", enum={"asc", "desc"}, default="desc")
     *     ),
     *     @OA\Parameter(
     *         name="per_page",
     *         in="query",
     *         description="Number of items per page",
     *         required=false,
     *         @OA\Schema(type="integer", default="15")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="data", ref="#/components/schemas/ProductCollection"),
     *             @OA\Property(property="message", type="string", example="Products retrieved successfully")
     *         )
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Unauthenticated",
     *         @OA\JsonContent(ref="#/components/schemas/ErrorResponse")
     *     ),
     *     @OA\Response(
     *         response=403,
     *         description="Forbidden",
     *         @OA\JsonContent(ref="#/components/schemas/ErrorResponse")
     *     )
     * )
     */
    public function index(Request $request)
    {
        error_log('Products index method called');
        error_log('Request: ' . json_encode($request->all()));

        // Create cache key based on request parameters
        $cacheKey = $this->generateProductListCacheKey($request->all());

        // Try to get from cache (without tags for database cache driver compatibility)
        $callback = function () use ($request) {
            error_log('Callback executed');
            $query = Product::query();

            // Filter by category
            $categoryId = $request->get('category_id');
            if ($categoryId !== null && is_numeric($categoryId)) {
                error_log('Filtering by category_id: ' . $categoryId);
                $query->where('category_id', (int)$categoryId);
            }

            // Filter by availability
            $isAvailable = $request->get('is_available');
            if ($isAvailable !== null) {
                // Convert string boolean values to integers for database comparison
                $isAvailableValue = filter_var($isAvailable, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
                if ($isAvailableValue !== null) {
                    error_log('Filtering by is_available (boolean): ' . var_export($isAvailableValue, true));
                    $query->where('is_available', $isAvailableValue ? 1 : 0);
                } else {
                    // Fallback for numeric values
                    error_log('Filtering by is_available (numeric): ' . $isAvailable);
                    $query->where('is_available', (int)$isAvailable);
                }
            }

            // Search by name
            $search = $request->get('search');
            if ($search !== null) {
                error_log('Searching for: ' . $search);
                $query->where('name', 'like', '%' . $search . '%');
            }

            // Apply sorting using trait with product-specific columns
            error_log('Applying sorting');
            $this->applySorting($query, $request, ['id', 'name', 'price', 'created_at', 'updated_at', 'is_available', 'is_featured', 'category_id']);

            // Pagination
            $perPage = $request->get('per_page', 15);
            error_log('Per page: ' . $perPage);

            // Log the query for debugging (BEFORE pagination to get pristine query)
            Log::debug('Product query SQL: ' . $query->toSql());
            Log::debug('Product query bindings: ' . json_encode($query->getBindings()));

            $products = $query->paginate((int)$perPage);

            // Log pagination details (AFTER pagination to get correct paginator values)
            error_log('Pagination total: ' . $products->total());
            error_log('Pagination perPage: ' . $products->perPage());
            error_log('Pagination currentPage: ' . $products->currentPage());
            error_log('Pagination lastPage: ' . $products->lastPage());

            return $products;
        };
        $products = $callback(); // EMPTY TAGS FOR TESTING
        error_log('Callback returned, got products');

        // Log the response data for debugging
        $collection = new ProductCollection($products);
        $responseData = $collection->response()->getData(true);
        error_log('Response data: ' . json_encode($responseData));

        return $this->sendResponse(new ProductCollection($products), 'Products retrieved successfully');
    }

    /**
     * @OA\Get(
     *     path="/api/admin/products",
     *     operationId="getAdminProductsList",
     *     tags={"Products"},
     *     summary="Get admin list of products",
     *     description="Returns a paginated list of all products for admin use (bypasses cache)",
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="category_id",
     *         in="query",
     *         description="Filter by category ID",
     *         required=false,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Parameter(
     *         name="is_available",
     *         in="query",
     *         description="Filter by availability status",
     *         required=false,
     *         @OA\Schema(type="boolean")
     *     ),
     *     @OA\Parameter(
     *         name="search",
     *         in="query",
     *         description="Search in product name",
     *         required=false,
     *         @OA\Schema(type="string")
     *     ),
     *     @OA\Parameter(
     *         name="sort_by",
     *         in="query",
     *         description="Sort by field",
     *         required=false,
     *         @OA\Schema(type="string", default="created_at")
     *     ),
     *     @OA\Parameter(
     *         name="sort_order",
     *         in="query",
     *         description="Sort order (asc or desc)",
     *         required=false,
     *         @OA\Schema(type="string", enum={"asc", "desc"}, default="desc")
     *     ),
     *     @OA\Parameter(
     *         name="per_page",
     *         in="query",
     *         description="Number of items per page",
     *         required=false,
     *         @OA\Schema(type="integer", default="100")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="data", ref="#/components/schemas/ProductCollection"),
     *             @OA\Property(property="message", type="string", example="Products retrieved successfully")
     *         )
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Unauthenticated",
     *         @OA\JsonContent(ref="#/components/schemas/ErrorResponse")
     *     ),
     *     @OA\Response(
     *         response=403,
     *         description="Forbidden",
     *         @OA\JsonContent(ref="#/components/schemas/ErrorResponse")
     *     )
     * )
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
            $query->where('name', 'like', '%' . $request->input('search').'%');
        }

        // Apply sorting using trait with product-specific columns
        $this->applySorting($query, $request, ['id', 'name', 'price', 'created_at', 'updated_at', 'is_available', 'is_featured', 'category_id']);

        // Paginate with a larger default so the admin sees all products
        $perPage  = $request->get('per_page', 100);
        $products = $query->paginate($perPage);

        return $this->sendResponse($products, 'Products retrieved successfully');
    }

    /**
     * @OA\Post(
     *     path="/api/products",
     *     operationId="createProduct",
     *     tags={"Products"},
     *     summary="Create a new product",
     *     description="Creates a new product with the provided data",
     *     security={{"sanctum":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\MediaType(
     *             mediaType="multipart/form-data",
     *             @OA\Schema(
     *                 ref="#/components/schemas/Product"
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Product created successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="data", ref="#/components/schemas/ProductResource"),
     *             @OA\Property(property="message", type="string", example="Product created successfully")
     *         )
     *     ),
     *     @OA\Response(
     *         response=400,
     *         description="Bad request",
     *         @OA\JsonContent(ref="#/components/schemas/ErrorResponse")
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Unauthenticated",
     *         @OA\JsonContent(ref="#/components/schemas/ErrorResponse")
     *     ),
     *     @OA\Response(
     *         response=403,
     *         description="Forbidden",
     *         @OA\JsonContent(ref="#/components/schemas/ErrorResponse")
     *     )
     * )
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
     * @OA\Get(
     *     path="/api/products/{id}",
     *     operationId="getProductById",
     *     tags={"Products"},
     *     summary="Get product details",
     *     description="Returns a single product by its ID",
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="Product ID",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="data", ref="#/components/schemas/ProductResource"),
     *             @OA\Property(property="message", type="string", example="Product retrieved successfully")
     *         )
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Unauthenticated",
     *         @OA\JsonContent(ref="#/components/schemas/ErrorResponse")
     *     ),
     *     @OA\Response(
     *         response=403,
     *         description="Forbidden",
     *         @OA\JsonContent(ref="#/components/schemas/ErrorResponse")
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Product not found",
     *         @OA\JsonContent(ref="#/components/schemas/ErrorResponse")
     *     )
     * )
     */
    public function show($id)
    {
        $cacheKey = 'product_' . $id;

        $product = $this->rememberTagged($cacheKey, self::CACHE_TTL, function () use ($id) {
            return Product::with('category')->find($id);
        }, ['products']);

        if (!$product) {
            return $this->sendNotFound('Product not found');
        }

        $this->authorize('view', $product);

        return $this->sendResponse(new ProductResource($product), 'Product retrieved successfully');
    }

    /**
     * @OA\Put(
     *     path="/api/products/{id}",
     *     operationId="updateProduct",
     *     tags={"Products"},
     *     summary="Update an existing product",
     *     description="Updates an existing product with the provided data",
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="Product ID",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\MediaType(
     *             mediaType="multipart/form-data",
     *             @OA\Schema(
     *                 ref="#/components/schemas/Product"
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Product updated successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="data", ref="#/components/schemas/ProductResource"),
     *             @OA\Property(property="message", type="string", example="Product updated successfully")
     *         )
     *     ),
     *     @OA\Response(
     *         response=400,
     *         description="Bad request",
     *         @OA\JsonContent(ref="#/components/schemas/ErrorResponse")
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Unauthenticated",
     *         @OA\JsonContent(ref="#/components/schemas/ErrorResponse")
     *     ),
     *     @OA\Response(
     *         response=403,
     *         description="Forbidden",
     *         @OA\JsonContent(ref="#/components/schemas/ErrorResponse")
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Product not found",
     *         @OA\JsonContent(ref="#/components/schemas/ErrorResponse")
     *     )
     * )
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
     * @OA\Delete(
     *     path="/api/products/{id}",
     *     operationId="deleteProduct",
     *     tags={"Products"},
     *     summary="Delete a product",
     *     description="Deletes a product by its ID",
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="Product ID",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Product deleted successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="data", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Product deleted successfully")
     *         )
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Unauthenticated",
     *         @OA\JsonContent(ref="#/components/schemas/ErrorResponse")
     *     ),
     *     @OA\Response(
     *         response=403,
     *         description="Forbidden",
     *         @OA\JsonContent(ref="#/components/schemas/ErrorResponse")
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Product not found",
     *         @OA\JsonContent(ref="#/components/schemas/ErrorResponse")
     *     )
     * )
     */
    public function destroy($id)
    {
        $product = Product::find($id);

        if (!$product) {
            return $this->sendNotFound('Product not found');
        }

        $this->authorize('delete', $product);

        $product->delete();

        // Fire ProductDeleted event to handle cache clearing
        event(new \App\Events\ProductDeleted($product));

        return $this->sendResponse(null, 'Product deleted successfully');
    }

    /**
     * @OA\Get(
     *     path="/api/products/{id}/recipe",
     *     operationId="getProductRecipe",
     *     tags={"Products"},
     *     summary="Get product recipe instructions",
     *     description="Returns brewing recipe instructions for a specific product",
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="Product ID",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="data", type="object"),
     *             @OA\Property(property="message", type="string", example="Recipe retrieved successfully")
     *         )
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Unauthenticated",
     *         @OA\JsonContent(ref="#/components/schemas/ErrorResponse")
     *     ),
     *     @OA\Response(
     *         response=403,
     *         description="Forbidden",
     *         @OA\JsonContent(ref="#/components/schemas/ErrorResponse")
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Product not found",
     *         @OA\JsonContent(ref="#/components/schemas/ErrorResponse")
     *     ),
     *     @OA\Response(
     *         response=500,
     *         description="Internal server error",
     *         @OA\JsonContent(ref="#/components/schemas/ErrorResponse")
     *     )
     * )
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