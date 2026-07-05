<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

echo "Starting debug test...\n";

try {
    require __DIR__.'/vendor/autoload.php';
    echo "Autoload loaded successfully\n";

    if (class_exists('L5Swagger\L5SwaggerServiceProvider')) {
        echo "L5Swagger service provider class exists\n";

        $app = new Illuminate\Foundation\Application(__DIR__);
        echo "Laravel app created\n";

        $provider = new L5Swagger\L5SwaggerServiceProvider($app);
        echo "Provider instantiated\n";

        $provider->register();
        echo "Provider registered\n";

        $provider->boot();
        echo "Provider booted\n";

        // Try to get commands
        $kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
        echo "Kernel obtained\n";

        $commands = $kernel->commands();
        echo "Got commands, count: ".count($commands)."\n";

        $found = false;
        foreach ($commands as $command) {
            if (strpos(get_class($command), 'GenerateDocsCommand') !== false) {
                echo "Found swagger command: ".get_class($command)."\n";
                $found = true;
                break;
            }
        }

        if (!$found) {
            echo "No swagger command found\n";
            echo "First 10 commands:\n";
            $count = 0;
            foreach ($commands as $command) {
                if ($count >= 10) break;
                echo "  ".get_class($command)."\n";
                $count++;
            }
        }
    } else {
        echo "L5Swagger service provider class NOT found\n";
    }
} catch (Exception $e) {
    echo "Exception: ".$e->getMessage()."\n";
    echo "Trace: ".$e->getTraceAsString()."\n";
}