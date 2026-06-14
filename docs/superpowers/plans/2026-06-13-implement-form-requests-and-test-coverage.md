# Implement Form Requests in ProductController and Improve Test Coverage

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor ProductController to use Laravel Form Requests for validation and increase unit test coverage for services.

**Architecture:** 
- Replace manual validation in ProductController with existing StoreProductRequest Form Request
- Create UpdateProductRequest Form Request for update operation validation
- Add unit tests for CacheMetricsService and CacheWarmingService to improve test coverage
- Enhance existing feature tests with additional edge case coverage

**Tech Stack:** PHP, Laravel, PHPUnit

---

### Task 1: Update ProductController to use StoreProductRequest

**Files:**
- Modify: `app/Http/Controllers/Api/V1/ProductController.php:142-184`

- [ ] **Step 1: Update store method signature to use StoreProductRequest**

Instead of:
```php
public function store(Request $request)
```

Use:
```php
public function store(StoreProductRequest $request)
```

- [ ] **Step 2: Remove manual validation code from store method**

Remove lines 144-165 (validator creation and validation check) since Form Request handles it

- [ ] **Step 3: Update update method signature to use StoreProductRequest (temporarily)**

Instead of:
```php
public function update(Request $request, $id)
```

Use:
```php
public function update(StoreProductRequest $request, $id)
```

- [ ] **Step 4: Remove manual validation code from update method**

Remove lines 215-229 (validator creation and validation check) since Form Request handles it

- [ ] **Step 5: Test the changes**

Run: `php artisan test --filter=ProductTest`
Expected: All tests should pass

- [ ] **Step 6: Commit**

```bash
git add app/Http/Controllers/Api/V1/ProductController.php
git commit -m "feat: use StoreProductRequest Form Request in ProductController store/update methods"
```

### Task 2: Create UpdateProductRequest Form Request

**Files:**
- Create: `app/Http/Requests/UpdateProductRequest.php`

- [ ] **Step 1: Create the UpdateProductRequest file**

```php
<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProductRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return auth()->check() && auth()->user()->hasRole(['admin', 'super-admin']);
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'name' => 'sometimes|required|string|max:255|min:2',
            'description' => 'sometimes|required|string|max:2000',
            'price' => 'sometimes|required|numeric|min:0|max:99999.99',
            'category_id' => 'sometimes|required|exists:categories,id',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
            'is_available' => 'sometimes|boolean',
            'is_featured' => 'sometimes|boolean',
            'stock_quantity' => 'sometimes|nullable|integer|min:0',
            'preparation_time' => 'sometimes|nullable|integer|min:1|max:120', // minutes
            'ingredients' => 'sometimes|nullable|array',
            'ingredients.*' => 'string|max:100',
            'allergens' => 'sometimes|nullable|array',
            'allergens.*' => 'string|max:100',
            'calories' => 'sometimes|nullable|integer|min:0|max:5000',
            'caffeine_content' => 'sometimes|nullable|integer|min:0|max:1000', // mg
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Product name is required.',
            'name.min' => 'Product name must be at least 2 characters.',
            'description.required' => 'Product description is required.',
            'price.required' => 'Product price is required.',
            'price.min' => 'Price cannot be negative.',
            'price.max' => 'Price cannot exceed ₱99,999.99.',
            'category_id.required' => 'Product category is required.',
            'category_id.exists' => 'Selected category does not exist.',
            'image.image' => 'File must be an image.',
            'image.mimes' => 'Image must be in JPEG, PNG, JPG, GIF, or WebP format.',
            'image.max' => 'Image size cannot exceed 2MB.',
            'preparation_time.max' => 'Preparation time cannot exceed 120 minutes.',
        ];
    }
}
```

- [ ] **Step 2: Update ProductController update method to use UpdateProductRequest**

Change the update method signature from:
```php
public function update(StoreProductRequest $request, $id)
```

To:
```php
public function update(UpdateProductRequest $request, $id)
```

- [ ] **Step 3: Test the changes**

Run: `php artisan test --filter=ProductTest`
Expected: All tests should pass

- [ ] **Step 4: Commit**

```bash
git add app/Http/Requests/UpdateProductRequest.php app/Http/Controllers/Api/V1/ProductController.php
git commit -m "feat: create UpdateProductRequest Form Request and use in ProductController"
```

### Task 3: Add unit tests for CacheMetricsService

**Files:**
- Create: `tests/Unit/Services/CacheMetricsServiceTest.php`

- [ ] **Step 1: Create the test file**

```php
<?php

namespace Tests\Unit\Services;

use App\Services\CacheMetricsService;
use Illuminate\Support\Facades\Cache;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CacheMetricsServiceTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        // Clear cache metrics before each test
        Cache::flush();
    }

    /** @test */
    public function it_tracks_cache_hits()
    {
        $service = new CacheMetricsService();
        
        // Simulate a cache hit
        Cache::put('test_key', 'test_value', 10);
        Cache::get('test_key'); // This would be a hit
        
        $service->hit();
        
        $this->assertEquals(1, $service->getHits());
        $this->assertEquals(0, $service->getMisses());
        $this->assertEquals(1.0, $service->getHitRate());
    }

    /** @test */
    public function it_tracks_cache_misses()
    {
        $service = new CacheMetricsService();
        
        $service->miss();
        
        $this->assertEquals(0, $service->getHits());
        $this->assertEquals(1, $service->getMisses());
        $this->assertEquals(0.0, $service->getHitRate());
    }

    /** @test */
    public function it_calculates_correct_hit_rate()
    {
        $service = new CacheMetricsService();
        
        // Simulate 3 hits and 1 miss
        $service->hit();
        $service->hit();
        $service->miss();
        $service->hit();
        
        $this->assertEquals(3, $service->getHits());
        $this->assertEquals(1, $service->getMisses());
        $this->assertEquals(0.75, $service->getHitRate());
    }

    /** @test */
    public function it_returns_zero_hit_rate_when_no_requests()
    {
        $service = new CacheMetricsService();
        
        $this->assertEquals(0.0, $service->getHitRate());
    }
}
```

- [ ] **Step 2: Run the tests**

Run: `php artisan test --filter=CacheMetricsServiceTest`
Expected: All tests should pass

- [ ] **Step 3: Commit**

```bash
git add tests/Unit/Services/CacheMetricsServiceTest.php
git commit -m "feat: add unit tests for CacheMetricsService"
```

### Task 4: Add unit tests for CacheWarmingService

**Files:**
- Create: `tests/Unit/Services/CacheWarmingServiceTest.php`

- [ ] **Step 1: Create the test file**

```php
<?php

namespace Tests\Unit\Services;

use App\Services\CacheWarmingService;
use App\Models\Product;
use App\Models\Category;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CacheWarmingServiceTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function it_warms_popular_products()
    {
        $service = new CacheWarmingService();
        
        // Create test products
        Category::factory()->create();
        Product::factory()->count(5)->create([
            'is_available' => true,
        ]);
        
        // Warm the cache
        $service->warmPopularProducts();
        
        // Verify cache was populated
        $this->assertNotNull(Cache::tags(['products'])->get('popular_products'));
    }

    /** @test */
    public function it_warms_popular_categories()
    {
        $service = new CacheWarmingService();
        
        // Create test categories with products
        Category::factory()->count(3)->create();
        
        // Warm the cache
        $service->warmPopularCategories();
        
        // Verify cache was populated
        $this->assertNotNull(Cache::tags(['categories'])->get('popular_categories'));
    }

    /** @test */
    public function it_warms_all_caches()
    {
        $service = new CacheWarmingService();
        
        // Create test data
        Category::factory()->create();
        Product::factory()->count(3)->create([
            'is_available' => true,
        ]);
        
        // Warm all caches
        $service->warmAllCaches();
        
        // Verify all cache types were populated
        $this->assertNotNull(Cache::tags(['products'])->get('popular_products'));
        $this->assertNotNull(Cache::tags(['categories'])->get('popular_categories'));
        // Note: recommendations and coffee beans might be empty if no data exists
    }
}
```

- [ ] **Step 2: Run the tests**

Run: `php artisan test --filter=CacheWarmingServiceTest`
Expected: All tests should pass

- [ ] **Step 3: Commit**

```bash
git add tests/Unit/Services/CacheWarmingServiceTest.php
git commit -m "feat: add unit tests for CacheWarmingService"
```

### Task 5: Enhance ProductTest with edge cases

**Files:**
- Modify: `tests/Feature/ProductTest.php`

- [ ] **Step 1: Add test for product creation with invalid data**

```php
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
```

- [ ] **Step 2: Add test for product update with invalid data**

```php
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
```

- [ ] **Step 3: Add test for unauthorized product creation**

```php
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
```

- [ ] **Step 4: Run the enhanced tests**

Run: `php artisan test --filter=ProductTest`
Expected: All tests should pass

- [ ] **Step 5: Commit**

```bash
git add tests/Feature/ProductTest.php
git commit -m "feat: enhance ProductTest with edge case tests for validation and authorization"
```

### Verification

After completing all tasks, run the full test suite to ensure nothing is broken:

```bash
php artisan test
```

Expected: All tests should pass, confirming that:
1. ProductController properly uses Form Requests for validation
2. UpdateProductRequest handles update validation correctly
3. CacheMetricsService and CacheWarmingService have unit test coverage
4. ProductTest includes comprehensive edge case testing
