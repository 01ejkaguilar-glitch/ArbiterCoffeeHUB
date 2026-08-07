<?php
require 'vendor/autoload.php';
$app = require 'bootstrap/app.php';
echo get_class($app) . ' version: ';
if (method_exists($app, 'version')) {
    echo $app->version();
} else {
    echo 'no version method';
    // Try to get it from the composer package
    $composer = json_decode(file_get_contents('composer.json'), true);
    if (isset($composer['require']['laravel/framework'])) {
        echo " (composer requires: {$composer['require']['laravel/framework']})";
    }
}
?>