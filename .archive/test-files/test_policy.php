<?php

require 'vendor/autoload.php';

$app = require 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

// Test if ProductPolicy can be resolved from container
$policy = app()->make(App\Policies\ProductPolicy::class);
echo "Policy class: " . get_class($policy) . PHP_EOL;

// Test Gate
$gate = app()->make(Illuminate\Contracts\Auth\Access\Gate::class);
$user = new App\Models\User();
$user->forceFill(['id' => 1]);
$product = new App\Models\Product();
$product->forceFill(['id' => 1]);
$result = $gate->inspect('view', $product, [$user]);
echo 'View result: ';
// Check if it's allowed
if ($result->allowed()) {
    echo 'ALLOWED' . PHP_EOL;
} else {
    echo 'DENIED: ' . $result->message() . PHP_EOL;
}