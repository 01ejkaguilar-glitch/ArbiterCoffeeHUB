<?php
require __DIR__.'/bootstrap/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->singleton('Illuminate\Contracts\Http\Kernel', 'App\Http\Kernel');
$app->singleton('Illuminate\Contracts\Console\Kernel', 'App\Console\Kernel');
$app->singleton('Illuminate\Contracts\Debug\ExceptionHandler', 'App\Exceptions\Handler');

try {
    $pdo = Illuminate\Support\Facades\DB::connection()->getPdo();
    echo "Database connection successful!\n";
} catch (Exception $e) {
    echo "Database connection failed: " . $e->getMessage() . "\n";
}
?>