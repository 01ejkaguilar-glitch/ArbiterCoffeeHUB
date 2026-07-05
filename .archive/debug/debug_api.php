<?php

require 'vendor/autoload.php';

$app = require 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

// Use the testing database
$_ENV['DB_CONNECTION'] = 'testing';
$_ENV['DB_DATABASE'] = ':memory:';

// Re-bootstrap with testing config
$app = require 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

// Run migrations for testing
Artisan::call('migrate', [
    '--database' => 'testing',
    '--force' => true,
]);

// Create test data like in the failing test
$category1 = App\Models\Category::factory()->create(['name' => 'Category 1']);
$category2 = App\Models\Category::factory()->create(['name' => 'Category 2']);

// Create products in different categories
$products1 = App\Models\Product::factory()->count(3)->create([
    'category_id' => $category1->id,
    'is_available' => true,
]);
$products2 = App\Models\Product::factory()->count(2)->create([
    'category_id' => $category2->id,
    'is_available' => false,
]);

echo "Created categories:\n";
echo "  Category 1 ID: {$category1->id}\n";
echo "  Category 2 ID: {$category2->id}\n\n";

echo "Created products:\n";
echo "  Category 1 products (available): ";
foreach ($products1 as $p) {
    echo "{$p->id} ({$p->name}), ";
}
echo "\n";
echo "  Category 2 products (unavailable): ";
foreach ($products2 as $p) {
    echo "{$p->id} ({$p->name}), ";
}
echo "\n\n";

// Now test the API endpoint simulation
use Illuminate\Http\Request;
use App\Http\Controllers\Api\V1\ProductController;

$controller = new ProductController();

// Simulate request with is_available=true
$_GET['is_available'] = 'true';
$request = Request::capture();

echo "Testing API with is_available=true:\n";
echo "  request->has('is_available'): " . var_export($request->has('is_available'), true) . "\n";
if ($request->has('is_available')) {
    $isAvailable = $request->boolean('is_available');
    echo "  request->boolean('is_available'): " . var_export($isAvailable, true) . "\n";
}

// Try to call the controller method
try {
    // We can't easily call the controller method directly because it uses caching
    // Let's just test the query building logic directly

    $query = App\Models\Product::with('category');

    // Filter by category (none in this case)
    $categoryId = $request->integer('category_id');
    if ($categoryId !== null) {
        $query->where('category_id', $categoryId);
    }

    // Filter by availability
    if ($request->has('is_available')) {
        $isAvailable = $request->boolean('is_available');
        echo "  Applying is_available filter: " . var_export($isAvailable, true) . "\n";
        $query->where('is_available', $isAvailable);
    }

    // Search by name
    $search = $request->query('search');
    if ($search !== null) {
        $query->where('name', 'like', '%' . $search . '%');
    }

    // Sorting
    $sortBy = $request->get('sort_by', 'created_at');
    $sortOrder = $request->get('sort_order', 'desc');
    $query->orderBy($sortBy, $sortOrder);

    // Get results
    $results = $query->get();

    echo "  Results count: " . $results->count() . "\n";
    foreach ($results as $p) {
        echo "    - {$p->id}: {$p->name} (is_available: {$p->is_available})\n";
    }
} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}