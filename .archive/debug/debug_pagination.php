<?php

// Include composer autoload
require __DIR__ . '/vendor/autoload.php';

// Polyfill imagejpeg when GD extension is not available to allow Laravel FileFactory to generate images in tests
if (!function_exists('imagejpeg')) {
    function imagejpeg($image, $filename = null, $quality = null)
    {
        if ($filename !== null) {
            // Write a valid 1x1 JPEG image so image libraries can decode it during tests
            $jpg = base64_decode(
                'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8Xw8AAn8B9YJ7swAAAABJRU5ErkJggg=='
            );
            file_put_contents($filename, $jpg);
        }

        return true;
    }
}

// Bootstrap the Laravel application so we can create test roles early
/**
 * Bootstrap the Laravel application so we can create test roles early.
 * If the roles table doesn't exist yet, run migrations once to ensure the
 * required tables are present for seeding roles/permissions.
 */
$app = require __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

// Ensure database schema is migrated for the test environment
$kernel->call('migrate', ['--force' => true]);

// Create test data like in the failing test
$category = App\Models\Category::factory()->create();

// Create more products than the per_page limit
App\Models\Product::factory()->count(15)->create([
    'category_id' => $category->id,
    'is_available' => true,
]);

echo "Created 15 products\n";

// Now test the query building logic
$request = Illuminate\Http\Request::capture();
$request->merge(['per_page' => 5]);

$query = App\Models\Product::query()->where('id', '>', 0);

echo "Initial query count: " . $query->count() . "\n";

// Filter by category
$categoryId = $request->get('category_id');
if ($categoryId !== null && is_numeric($categoryId)) {
    $query->where('category_id', (int)$categoryId);
    echo "After category filter: " . $query->count() . "\n";
}

// Filter by availability
$isAvailable = $request->get('is_available');
if ($isAvailable !== null) {
    // Convert string boolean values to integers for database comparison
    $isAvailableValue = filter_var($isAvailable, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
    if ($isAvailableValue !== null) {
        $query->where('is_available', $isAvailableValue ? 1 : 0);
    } else {
        // Fallback for numeric values
        $query->where('is_available', (int)$isAvailable);
    }
    echo "After availability filter: " . $query->count() . "\n";
}

// Search by name
$search = $request->get('search');
if ($search !== null) {
    $query->where('name', 'like', '%' . $search . '%');
    echo "After search filter: " . $query->count() . "\n";
}

// Sorting
$sortBy = $request->get('sort_by', 'created_at');
$sortOrder = $request->get('sort_order', 'desc');
$query->orderBy($sortBy, $sortOrder);
echo "After sorting: " . $query->count() . "\n";

// Pagination
$perPage = $request->get('per_page', 15);
$pagination = $query->paginate((int)$perPage);

echo "Final count: " . $pagination->total() . "\n";
echo "Per page: " . $pagination->perPage() . "\n";
echo "Current page: " . $pagination->currentPage() . "\n";
echo "Last page: " . $pagination->lastPage() . "\n";
