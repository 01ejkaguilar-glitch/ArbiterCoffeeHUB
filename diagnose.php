<?php
// Simple diagnostic to check Laravel bootstrap
require __DIR__ . '/vendor/autoload.php';

try {
    $app = new Illuminate\Foundation\Application(
        $_ENV['APP_BASE_PATH'] ?? dirname(__DIR__)
    );

    echo "Laravel application instantiated successfully<br>";

    // Try to boot the application
    $app->bootstrapWith([
        Illuminate\Foundation\Bootstrap\LoadEnvironmentVariables::class,
        Illuminate\Foundation\Bootstrap\LoadConfiguration::class,
        Illuminate\Foundation\Bootstrap\HandleExceptions::class,
        Illuminate\Foundation\Bootstrap\RegisterFacades::class,
        Illuminate\Foundation\Bootstrap\RegisterProviders::class,
        Illuminate\Foundation\Bootstrap\BootProviders::class
    ]);

    echo "Application booted successfully<br>";

    // Try to make a simple helper call
    echo "APP_ENV: " . app()->environment() . "<br>";

} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "<br>";
    echo "Trace: " . $e->getTraceAsString() . "<br>";
}
?>