<?php

require 'vendor/autoload.php';

$app = require 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

// Test what happens with boolean parameters
$_GET['is_available'] = 'false';
$request = Illuminate\Http\Request::capture();

echo "is_available parameter: " . ($_GET['is_available'] ?? 'not set') . "\n";
echo "request->has('is_available'): " . var_export($request->has('is_available'), true) . "\n";
echo "request->get('is_available'): " . var_export($request->get('is_available'), true) . "\n";
echo "request->boolean('is_available'): " . var_export($request->boolean('is_available'), true) . "\n";
echo "request->input('is_available'): " . var_export($request->input('is_available'), true) . "\n";

echo "\n---\n";

// Test with true
$_GET['is_available'] = 'true';
$request = Illuminate\Http\Request::capture();

echo "is_available parameter: " . ($_GET['is_available'] ?? 'not set') . "\n";
echo "request->has('is_available'): " . var_export($request->has('is_available'), true) . "\n";
echo "request->get('is_available'): " . var_export($request->get('is_available'), true) . "\n";
echo "request->boolean('is_available'): " . var_export($request->boolean('is_available'), true) . "\n";
echo "request->input('is_available'): " . var_export($request->input('is_available'), true) . "\n";

echo "\n---\n";

// Test without parameter
unset($_GET['is_available']);
$request = Illuminate\Http\Request::capture();

echo "is_available parameter: " . ($_GET['is_available'] ?? 'not set') . "\n";
echo "request->has('is_available'): " . var_export($request->has('is_available'), true) . "\n";
echo "request->get('is_available'): " . var_export($request->get('is_available'), true) . "\n";
echo "request->boolean('is_available'): " . var_export($request->boolean('is_available'), true) . "\n";
echo "request->input('is_available'): " . var_export($request->input('is_available'), true) . "\n";