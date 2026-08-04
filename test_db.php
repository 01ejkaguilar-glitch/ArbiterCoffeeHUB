<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

try {
    // Test MySQL connection from .env
    $mysql = Illuminate\Support\Facades\DB::connection('mysql')->getPdo();
    echo "MySQL Connection successful!n";
    echo "MySQL Version: " . $mysql->getAttribute(PDO::ATTR_SERVER_VERSION) . "n";
} catch (Exception $e) {
    echo "MySQL Connection failed: " . $e->getMessage() . "n";
}

try {
    // Test SQLite connection
    $sqlite = new PDO('sqlite:' . __DIR__ . '/database/database.sqlite');
    echo "SQLite Connection successful!n";
    $version = $sqlite->query('SELECT sqlite_version()')->fetchColumn();
    echo "SQLite Version: " . $version . "n";
} catch (Exception $e) {
    echo "SQLite Connection failed: " . $e->getMessage() . "n";
}
?>