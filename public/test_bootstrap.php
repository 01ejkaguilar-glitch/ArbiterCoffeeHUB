<?php
header('Content-Type: text/plain');
try {
    $app = require_once __DIR__ . '/../bootstrap/app.php';
    echo "Required bootstrap file\n";
    var_dump($app);
} catch (Throwable $e) {
    echo "Caught throwable: " . get_class($e) . "\n";
    echo $e->getMessage() . "\n";
    echo $e->getTraceAsString();
}