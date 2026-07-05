<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

echo "Starting debug test 4...\n";

try {
    require __DIR__.'/vendor/autoload.php';
    echo "Autoload loaded successfully\n";

    // Create the application with explicit base path
    $app = new Illuminate\Foundation\Application(__DIR__);

    echo "Application base path: ".$app->basePath()."\n";

    // Ensure bootstrap/cache directory exists and is writable
    $cacheDir = $app->basePath('/bootstrap/cache');
    echo "Bootstrap cache path: $cacheDir\n";
    if (!is_dir($cacheDir)) {
        mkdir($cacheDir, 0775, true);
        echo "Created cache directory: $cacheDir\n";
    }
    if (!is_writable($cacheDir)) {
        chmod($cacheDir, 0775);
        echo "Made cache directory writable: $cacheDir\n";
    }

    // Load environment variables
    if (file_exists(__DIR__.'/.env')) {
        $app->detectEnvironment(fn() => $_ENV);
        echo "Environment loaded\n";
    }

    // Bootstrap the application
    $app->bootstrapWith([
        Illuminate\Foundation\Bootstrap\LoadEnvironmentVariables::class,
        Illuminate\Foundation\Bootstrap\LoadConfiguration::class,
        Illuminate\Foundation\Bootstrap\HandleExceptions::class,
        Illuminate\Foundation\Bootstrap\RegisterFacades::class,
        Illuminate\Foundation\Bootstrap\RegisterProviders::class,
        Illuminate\Foundation\Bootstrap\BootProviders::class
    ]);

    echo "Application booted\n";

    // Now check if our provider is loaded
    $loadedProviders = $app->getLoadedProviders();
    $swaggerProvider = 'L5Swagger\L5SwaggerServiceProvider';
    $found = false;

    echo "Checking loaded providers...\n";
    foreach ($loadedProviders as $provider => $isLoaded) {
        if ($isLoaded && $provider === $swaggerProvider) {
            echo "✓ L5Swagger service provider is LOADED\n";
            $found = true;
            break;
        }
    }

    if ($found) {
        // Try to get commands
        try {
            $kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
            $commands = $kernel->commands();

            $swaggerFound = false;
            foreach ($commands as $command) {
                if (strpos(get_class($command), 'GenerateDocsCommand') !== false) {
                    echo "✓ Found Swagger command: ".get_class($command)."\n";
                    $swaggerFound = true;
                    break;
                }
            }

            if ($swaggerFound) {
                echo "SUCCESS: L5Swagger is properly installed and working!\n";
            } else {
                echo "✗ L5Swagger provider loaded but no swagger command found\n";
                // Show a few command namespaces to see what's available
                $namespaces = [];
                foreach ($commands as $command) {
                    $ns = dirname(get_class($command));
                    if (!in_array($ns, $namespaces)) {
                        $namespaces[] = $ns;
                    }
                }
                sort($namespaces);
                echo "First 10 command namespaces:\n";
                for ($i = 0; i < min(10, count($namespaces)); $i++) {
                    echo "  ".$namespaces[$i]."\n";
                }
            }
        } catch (Exception $e) {
            echo "Error getting commands: ".$e->getMessage()."\n";
        }
    } else {
        echo "✗ L5Swagger service provider is NOT in loaded providers\n";
        echo "Showing some loaded providers for reference:\n";
        $shown = 0;
        foreach ($loadedProviders as $provider => $isLoaded) {
            if ($isLoaded && $shown < 10) {
                echo "  $provider\n";
                $shown++;
            }
        }
    }

} catch (Exception $e) {
    echo "Exception: ".$e->getMessage()."\n";
    echo "Trace: ".$e->getTraceAsString()."\n";
}