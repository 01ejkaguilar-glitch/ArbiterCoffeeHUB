<?php
header('Content-Type: text/plain');

// Disable Laravel's error handling to see the raw error
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

try {
    require __DIR__.'/../vendor/autoload.php';
    $app = require_once __DIR__.'/../bootstrap/app.php';

    echo "Bootstrap successful! App: " . get_class($app) . "\n";

    // Try to get the facade application
    if (isset($app)) {
        echo "App instance exists\n";
        // Try to manually set the facade application
        \Illuminate\Support\Facades\Facade::setFacadeApplication($app);
        echo "Facade application set\n";
    } else {
        echo "App instance is null\n";
    }

} catch (Throwable $e) {
    echo "Throwable caught: " . get_class($e) . "\n";
    echo "Message: " . $e->getMessage() . "\n";
    echo "Trace: " . $e->getTraceAsString() . "\n";
}
?>