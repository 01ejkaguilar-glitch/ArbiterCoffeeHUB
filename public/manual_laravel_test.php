<?php
header('Content-Type: text/plain');

try {
    echo "Step 1: Checking maintenance file\n";
    $maintenance = __DIR__.'/storage/framework/maintenance.php';
    if (file_exists($maintenance)) {
        echo "Maintenance file found\n";
    } else {
        echo "Maintenance file not found (normal)\n";
    }

    echo "Step 2: Loading autoloader\n";
    require __DIR__.'/../vendor/autoload.php';
    echo "Autoloader loaded successfully\n";

    echo "Step 3: Loading bootstrap/app.php\n";
    $app = require_once __DIR__.'/../bootstrap/app.php';
    echo "Bootstrap loaded successfully, app instance: " . get_class($app) . "\n";

    echo "Step 4: Creating request\n";
    $request = Illuminate\Http\Request::capture();
    echo "Request created successfully\n";

    echo "Step 5: Handling request\n";
    $response = $app->handleRequest($request);
    echo "Request handled successfully\n";

} catch (Exception $e) {
    echo "Error: " . get_class($e) . ": " . $e->getMessage() . "\n";
    echo "Trace: " . $e->getTraceAsString() . "\n";
}
?>