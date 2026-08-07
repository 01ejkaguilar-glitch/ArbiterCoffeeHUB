<?php
header('Content-Type: text/plain');

require __DIR__ . '/../vendor/autoload.php';

try {
    $app = require_once __DIR__ . '/../bootstrap/app.php';
    echo "Laravel bootstrap successful\n";
    echo "App instance: " . get_class($app) . "\n";

    // Try to boot the application
    $app->boot();
    echo "Application booted successfully\n";

} catch (Exception $e) {
    echo "Error: " . get_class($e) . ": " . $e->getMessage() . "\n";
    echo "Trace: " . $e->getTraceAsString() . "\n";
}
?>