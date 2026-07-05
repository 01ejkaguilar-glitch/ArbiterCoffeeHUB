<?php

require 'vendor/autoload.php';

$app = require 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

// Test the policy with null user (guest)
$policy = app()->make(App\Policies\ProductPolicy::class);
$user = null; // Guest user
$product = new App\Models\Product();
$product->forceFill(['id' => 1]);

try {
    $result = $policy->view($user, $product);
    echo "Policy view result with null user: ";
    var_dump($result);
} catch (Exception $e) {
    echo "Exception when calling policy with null user: ";
    echo get_class($e) . ": " . $e->getMessage() . PHP_EOL;
}

// Also test the gate directly
$gate = app()->make(Illuminate\Contracts\Auth\Access\Gate::class);
try {
    $gateResult = $gate->inspect('view', $product, [$user]);
    echo 'Gate inspect result: ';
    if ($gateResult->allowed()) {
        echo 'ALLOWED' . PHP_EOL;
    } else {
        echo 'DENIED: ' . $gateResult->message() . PHP_EOL;
    }
} catch (Exception $e) {
    echo "Exception in gate inspection: ";
    echo get_class($e) . ": " . $e->getMessage() . PHP_EOL;
}