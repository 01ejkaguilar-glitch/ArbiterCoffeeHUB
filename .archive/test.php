<?php

error_reporting(E_ALL);
ini_set('display_errors', 1);

require __DIR__.'/vendor/autoload.php';

try {
    $app = require_once __DIR__.'/bootstrap/app.php';
    $app->boot();
    echo "Application booted successfully!\n";
} catch (Exception $e) {
    echo "Error: ".$e->getMessage()."\n";
    echo "File: ".$e->getFile()."\n";
    echo "Line: ".$e->getLine()."\n";
    echo "Trace:\n";
    echo $e->getTraceAsString();
}