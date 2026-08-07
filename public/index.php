<?php

use Illuminate\Foundation\Application;
use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

echo "Before maintenance check\n";
flush();

// Determine if the application is in maintenance mode...
if (file_exists($maintenance = __DIR__.'/storage/framework/maintenance.php')) {
    require $maintenance;
}

echo "After maintenance check\n";
flush();

try {
    // Register the Composer autoloader...
    require __DIR__.'/../vendor/autoload.php';
    echo "After autoload\n";
    flush();
} catch (Throwable $e) {
    echo "Autoload error: " . get_class($e) . ": " . $e->getMessage() . "\n";
    flush();
    exit(1);
}

try {
    // Bootstrap Laravel and handle the request...
    /** @var Application $app */
    $app = require_once __DIR__.'/../bootstrap/app.php';
    echo "After bootstrap\n";
    flush();
} catch (Throwable $e) {
    echo "Bootstrap error: " . get_class($e) . ": " . $e->getMessage() . "\n";
    flush();
    exit(1);
}

// Debug: output the app class
echo "App class: " . get_class($app) . "\n";
flush();

// Set the facade application
Illuminate\Support\Facades\Facade::setFacadeApplication($app);
echo "Facade application set\n";
flush();

$app->handleRequest(Request::capture());

?>