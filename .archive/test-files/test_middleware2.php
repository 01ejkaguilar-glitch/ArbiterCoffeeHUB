<?php

require __DIR__.'/vendor/autoload.php';

try {
    $middleware = new App\Http\Middleware\HandleLoginLockouts();
    echo "Middleware instantiated successfully.\n";
} catch (Throwable $e) {
    echo "Error instantiating middleware: " . $e->getMessage() . "\n";
    echo $e->getTraceAsString();
}
