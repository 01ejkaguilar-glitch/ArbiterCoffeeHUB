<?php

// Test Composer autoloader
require __DIR__ . '/vendor/autoload.php';

if (class_exists(\Illuminate\Foundation\Application::class)) {
    echo "Illuminate\\Foundation\\Application class exists\n";
} else {
    echo "Illuminate\\Foundation\\Application class does NOT exist\n";
}

// Test if we can create an instance
try {
    $app = new \Illuminate\Foundation\Application(__DIR__);
    echo "Successfully created Application instance\n";
} catch (Exception $e) {
    echo "Failed to create Application instance: " . $e->getMessage() . "\n";
}