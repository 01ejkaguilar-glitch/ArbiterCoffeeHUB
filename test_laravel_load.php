<?php
ob_start();
header('Content-Type: text/plain');
echo "Starting to load Laravel...\n";

try {
    $app = require __DIR__ . '/bootstrap/app.php';
    echo "Laravel application loaded successfully\n";

    // Try to bootstrap the application
    $app->bootstrapWith([
        Illuminate\Foundation\Bootstrap\LoadEnvironmentVariables::class,
        Illuminate\Foundation\Bootstrap\LoadConfiguration::class,
    ]);
    echo "Application bootstrapped with env and config\n";

} catch (Exception $e) {
    echo "Caught exception: " . get_class($e) . "\n";
    echo "Message: " . $e->getMessage() . "\n";
    echo "Trace: " . $e->getTraceAsString() . "\n";
} catch (Throwable $t) {
    echo "Caught throwable: " . get_class($t) . "\n";
    echo "Message: " . $t->getMessage() . "\n";
    echo "Trace: " . $t->getTraceAsString() . "\n";
}

$output = ob_get_clean();
header('Content-Length: ' . strlen($output));
echo $output;
?>