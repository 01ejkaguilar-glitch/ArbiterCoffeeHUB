<?php

require __DIR__ . '/vendor/autoload.php';

try {
    $provider = new L5Swagger\L5SwaggerServiceProvider(new Illuminate\Foundation\Application(__DIR__));
    echo "Provider instantiated successfully\n";
} catch (Exception $e) {
    echo "Error instantiating provider: " . $e->getMessage() . "\n";
    echo "Trace: " . $e->getTraceAsString() . "\n";
}

try {
    $app = new Illuminate\Foundation\Application(__DIR__);
    $app->instance('app', $app);

    // Register the provider
    $app->register(L5Swagger\L5SwaggerServiceProvider::class);
    echo "Provider registered successfully\n";

    // Try to boot it
    $app->boot();
    echo "Provider booted successfully\n";

    // Check if we can get the commands
    $kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
    $commands = $kernel->commands();

    $found = false;
    foreach ($commands as $command) {
        if (strpos(get_class($command), 'GenerateDocsCommand') !== false) {
            echo "Found swagger command: " . get_class($command) . "\n";
            $found = true;
        }
    }

    if (!$found) {
        echo "No swagger command found after manual registration\n";
        echo "Available commands:\n";
        foreach ($commands as $command) {
            echo "  " . get_class($command) . "\n";
        }
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    echo "Trace: " . $e->getTraceAsString() . "\n";
}