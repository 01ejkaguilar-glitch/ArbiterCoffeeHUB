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
    'is_available' => true,
]);

echo "Created categories:\n";
echo "  Category 1 ID: {$category1->id}\n";
echo "  Category 2 ID: {$category2->id}\n\n";

echo "Created products:\n";
echo "  Category 1 products: ";
foreach ($products1 as $p) {
    echo "{$p->id} ({$p->name}), ";
}
echo "\n";
echo "  Category 2 products: ";
foreach ($products2 as $p) {
    echo "{$p->id} ({$p->name}), ";
}
echo "\n\n";

// Now test the query directly
$query = App\Models\Product::with('category');
$query->where('category_id', $category1->id);
$directResults = $query->get();

echo "Direct query results (where category_id = {$category1->id}):\n";
echo "  Count: {$directResults->count()}\n";
foreach ($directResults as $p) {
    echo "  - {$p->id}: {$p->name} (category_id: {$p->category_id})\n";
}
echo "\n";

// Test caching
use Illuminate\Support\Facades\Cache;
Cache::flush(); // Clear cache first

$cacheKey = 'products_list_' . md5(json_encode(['category_id' => $category1->id]));
echo "Cache key: {$cacheKey}\n";

$cached = Cache::tags(['products'])->has($cacheKey);
echo "Is cached initially: " . ($cached ? 'YES' : 'NO') . "\n";

if (!$cached) {
    echo "Executing callback to generate and cache result...\n";
    $value = Cache::tags(['products'])->remember($cacheKey, 300, function () use ($category1) {
        return App\Models\Product::with('category')
            ->where('category_id', $category1->id)
            ->get();
    });

    echo "Cached value count: {$value->count()}\n";

    $cachedAfter = Cache::tags(['products'])->has($cacheKey);
    echo "Is cached after: " . ($cachedAfter ? 'YES' : 'NO') . "\n";

    if ($cachedAfter) {
        $retrieved = Cache::tags(['products'])->get($cacheKey);
        echo "Retrieved from cache count: {$retrieved->count()}\n";
        foreach ($retrieved as $p) {
            echo "  - {$p->id}: {$p->name} (category_id: {$p->category_id})\n";
        }
    }
}