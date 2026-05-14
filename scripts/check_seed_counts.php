<?php
require __DIR__.'/../vendor/autoload.php';
$app = require __DIR__.'/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();
$db = $app->make('db');
$tables = ['roles','permissions','categories','coffee_beans','inventory_items'];
foreach ($tables as $t) {
    try {
        $count = $db->table($t)->count();
    } catch (Exception $e) {
        $count = 'error: '.$e->getMessage();
    }
    echo str_pad($t,20).": ". $count ."\n";
}
