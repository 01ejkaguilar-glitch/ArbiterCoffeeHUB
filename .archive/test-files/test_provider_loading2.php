<?php

require __DIR__ . '/vendor/autoload.php';

try {
    $app = new Illuminate\Foundation\Application(__DIR__);
    $app->instance('app', $app);

    // Register the provider
    $provider = new L5Swagger\L5SwaggerServiceProvider($app);
    echo "Before registering provider:\n";
    if (isset($app->make('config')['l5-swagger'])) {
        echo "Config already exists\n";
        print_r($app->make('config')['l5-swagger']);
    } else {
        echo "Config does not exist yet\n";
    }

    $provider->register();
    echo "After registering provider:\n";
    if (isset($app->make('config')['l5-swagger'])) {
        echo "Config now exists\n";
        print_r($app->make('config')['l5-swagger']);
    } else {
        echo "Config still does not exist\n";
    }

    // Now try to boot
    $provider->boot();
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
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    echo "Trace: " . $e->getTraceAsString() . "\n";
}