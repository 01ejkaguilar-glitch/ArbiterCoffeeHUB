<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';

try {
    $kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
    $status = $kernel->handle(
        $input = new Symfony\Component\Console\Input\ArgvInput($_SERVER['argv']),
        new Symfony\Component\Console\Output\ConsoleOutput
    );
    $kernel->terminate($input, $status);
} catch (Exception $e) {
    echo "Exception: ".$e->getMessage()."\n";
    echo "Trace: ".$e->getTraceAsString();
} catch (Throwable $t) {
    echo "Throwable: ".$t->getMessage()."\n";
    echo "Trace: ".$t->getTraceAsString();
}