<?php
require __DIR__ . '/bootstrap/app.php';

use Illuminate\Support\Facades\Facade;

// Test if facade is working
try {
    // Try to use a facade
    $app = app();
    echo "Facade test successful. App instance: " . get_class($app);
} catch (\Exception $e) {
    echo "Facade test failed: " . $e->getMessage();
}