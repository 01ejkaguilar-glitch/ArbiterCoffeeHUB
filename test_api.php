<?php

ini_set('display_errors', 1);
ini_set('error_reporting', E_ALL);

// Register the Composer autoloader...
require __DIR__.'/vendor/autoload.php';

try {
    $app = require __DIR__ . '/bootstrap/app.php';

    // Bootstrap the application
    $app->bootstrapWith([
        Illuminate\Foundation\Bootstrap\LoadEnvironmentVariables::class,
        Illuminate\Foundation\Bootstrap\LoadConfiguration::class,
        Illuminate\Foundation\Bootstrap\HandleExceptions::class,
        Illuminate\Foundation\Bootstrap\RegisterFacades::class,
        Illuminate\Foundation\Bootstrap\RegisterProviders::class,
        Illuminate\Foundation\Bootstrap\BootProviders::class,
    ]);

    // Make a request to the test API endpoint
    $request = Illuminate\Http\Request::create('/api/v1/test', 'GET');
    $response = $app->handleRequest($request);

    // Output the response
    header('Content-Type: application/json');
    echo $response->getContent();

} catch (Exception $e) {
    // Output error as JSON for API consistency
    header('Content-Type: application/json');
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Application error: ' . $e->getMessage(),
        'trace' => $e->getTraceAsString()
    ]);
}