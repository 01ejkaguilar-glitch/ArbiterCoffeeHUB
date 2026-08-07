<?php

ini_set('display_errors', 1);
ini_set('error_reporting', E_ALL);

// Register the Composer autoloader...
require __DIR__.'/vendor/autoload.php';

try {
    $app = require __DIR__ . '/bootstrap/app.php';

    echo "Required bootstrap/app.php successfully\n";
    echo "Got object of type: " . gettype($app) . "\n";
    echo "Got object of class: " . get_class($app) . "\n";

    // Bootstrap the application
    $app->bootstrapWith([
        Illuminate\Foundation\Bootstrap\LoadEnvironmentVariables::class,
        Illuminate\Foundation\Bootstrap\LoadConfiguration::class,
        Illuminate\Foundation\Bootstrap\HandleExceptions::class,
        Illuminate\Foundation\Bootstrap\RegisterFacades::class,
        Illuminate\Foundation\Bootstrap\RegisterProviders::class,
        Illuminate\Foundation\Bootstrap\BootProviders::class,
    ]);

    echo "Bootstrapped application successfully\n";
    echo "Got object of type: " . gettype($app) . "\n";
    echo "Got object of class: " . get_class($app) . "\n";

    // Check if the application is properly bootstrapped
    if ($app->bound('view')) {
        echo "view service is bound\n";
    } else {
        echo "view service is NOT bound\n";
        echo "Available bindings: ";
        print_r(array_keys($app->getBindings()));
    }

    // Try to make a simple request to test the application
    echo "Testing application by making a simple request...\n";
    $response = $app->handleRequest(
        Illuminate\Http\Request::create('/api/v1/test', 'GET')
    );
    echo "Request handled successfully\n";
    echo "Response status: " . $response->getStatusCode() . "\n";
    echo "Response content: " . $response->getContent() . "\n";

} catch (Exception $e) {
    echo "Caught exception: " . get_class($e) . "\n";
    echo "Message: " . $e->getMessage() . "\n";
    echo "Trace: " . $e->getTraceAsString() . "\n";
}