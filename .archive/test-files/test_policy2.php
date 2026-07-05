<?php

require 'vendor/autoload.php';

$app = require 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

// Test the policy directly
$policy = app()->make(App\Policies\ProductPolicy::class);
$user = new App\Models\User();
$user->forceFill(['id' => 1]);
$product = new App\Models\Product();
$product->forceFill(['id' => 1]);

$result = $policy->view($user, $product);
echo "Direct policy view result: ";
var_dump($result);

// Test with hasRole - does the user have any roles?
echo "User has admin role: ";
var_dump($user->hasRole('admin'));

echo "User has super-admin role: ";
var_dump($user->hasRole('super-admin'));

echo "User hasRole(['admin', 'super-admin']): ";
var_dump($user->hasRole(['admin', 'super-admin']));