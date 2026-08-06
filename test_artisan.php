<?php
// Test if we can run artisan commands
require __DIR__ . '/vendor/autoload.php';

$app = new Illuminate\Foundation\Application(
    $_ENV['APP_BASE_PATH'] ?? dirname(__DIR__)
);

$app->bootstrapWith([
    Illuminate\Foundation\Bootstrap\LoadEnvironmentVariables::class,
    Illuminate\Foundation\Bootstrap\LoadConfiguration::class,
    Illuminate\Foundation\Bootstrap\HandleExceptions::class,
    Illuminate\Foundation\Bootstrap\RegisterFacades::class,
    Illuminate\Foundation\Bootstrap\RegisterProviders::class,
    Illuminate\Foundation\Bootstrap\BootProviders::class
]);

try {
    // Try to get the application instance
    echo "Laravel version: " . $app->version() . "<br>";
    echo "APP_ENV: " . $app->environment() . "<br>";
    echo "APP_KEY: " . $app->make('config')['app.key'] . "<br>";
    echo "Artisan application test successful<br>";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "<br>";
    echo "Trace: " . $e->getTraceAsString() . "<br>";
}
?>