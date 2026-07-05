<?php

require 'vendor/autoload.php';

$app = require 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

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

// Now test the query directly with is_available=true
$query = App\Models\Product::with('category');
$query->where('category_id', $category1->id);

// Simulate request with is_available=true
$_GET['is_available'] = 'true';
$request = Illuminate\Http\Request::capture();

if ($request->has('is_available')) {
    $isAvailable = $request->boolean('is_available');
    echo "Filtering by is_available = " . var_export($isAvailable, true) . "\n";
    $query->where('is_available', $isAvailable);
}

$directResults = $query->get();

echo "Direct query results (where category_id = {$category1->id} AND is_available = true):\n";
echo "  Count: {$directResults->count()}\n";
foreach ($directResults as $p) {
    echo "  - {$p->id}: {$p->name} (is_available: {$p->is_available})\n";
}
echo "\n";

// Now test with is_available=false
$query2 = App\Models\Product::with('category');
$query2->where('category_id', $category1->id);

// Simulate request with is_available=false
$_GET['is_available'] = 'false';
$request = Illuminate\Http\Request::capture();

if ($request->has('is_available')) {
    $isAvailable = $request->boolean('is_available');
    echo "Filtering by is_available = " . var_export($isAvailable, true) . "\n";
    $query2->where('is_available', $isAvailable);
}

$directResults2 = $query2->get();

echo "Direct query results (where category_id = {$category1->id} AND is_available = false):\n";
echo "  Count: {$directResults2->count()}\n";
foreach ($directResults2 as $p) {
    echo "  - {$p->id}: {$p->name} (is_available: {$p->is_available})\n";
}
echo "\n";

// Test without is_available parameter
$query3 = App\Models\Product::with('category');
$query3->where('category_id', $category1->id);

// Simulate request without is_available parameter
unset($_GET['is_available']);
$request = Illuminate\Http\Request::capture();

if ($request->has('is_available')) {
    $isAvailable = $request->boolean('is_available');
    echo "Filtering by is_available = " . var_export($isAvailable, true) . "\n";
    $query3->where('is_available', $isAvailable);
} else {
    echo "No is_available filter applied\n";
}

$directResults3 = $query3->get();

echo "Direct query results (where category_id = {$category1->id} - no is_available filter):\n";
echo "  Count: {$directResults3->count()}\n";
foreach ($directResults3 as $p) {
    echo "  - {$p->id}: {$p->name} (is_available: {$p->is_available})\n";
}
echo "\n";