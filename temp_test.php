<?php
// Test if we can run artisan commands programmatically
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
    // Try to get the application key command
    $keygen = $app->make('command.key.generate');
    echo "Keygen command resolved successfully<br>";
} catch (Exception $e) {
    echo "Error resolving keygen command: " . $e->getMessage() . "<br>";
    echo "Trace: " . $e->getTraceAsString() . "<br>";
}
?>