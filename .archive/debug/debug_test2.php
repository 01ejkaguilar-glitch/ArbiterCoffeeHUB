<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

echo "Starting debug test 2...\n";

try {
    require __DIR__.'/vendor/autoload.php';
    echo "Autoload loaded successfully\n";

    // Create the application
    $app = new Illuminate\Foundation\Application(
        $_ENV['APP_BASE_PATH'] ?? dirname(__DIR__)
    );

    // Load environment variables
    if (file_exists(__DIR__.'/.env')) {
        $app->detectEnvironment(fn() => $_ENV);
    }

    // This is what's missing - we need to bootstrap the basics
    // Let's see what Laravel does in its foundation bootstrappers

    // Bootstrap basic things
    $app->singleton(
        Illuminate\Contracts\Http\Kernel::class,
        App\Http\Kernel::class
    );
    $app->singleton(
        Illuminate\Contracts\Console\Kernel::class,
        App\Console\Kernel::class
    );
    $app->singleton(
        Illuminate\Contracts\Debug\ExceptionHandler::class,
        App\Exceptions\Handler::class
    );

    // Bootstrap providers - this is where service providers get loaded
    $app->bootstrapWith([
        // These are the basic bootstrappers Laravel uses
        Illuminate\Foundation\Bootstrap\LoadEnvironmentVariables::class,
        Illuminate\Foundation\Bootstrap\LoadConfiguration::class,
        Illuminate\Foundation\Bootstrap\HandleExceptions::class,
        Illuminate\Foundation\Bootstrap\RegisterFacades::class,
        Illuminate\Foundation\Bootstrap\RegisterProviders::class,
        Illuminate\Foundation\Bootstrap\BootProviders::class
    ]);

    echo "Application booted with basic bootstrappers\n";

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

    if (!$found) {
        echo "✗ L5Swagger service provider is NOT in loaded providers\n";
        echo "Showing some loaded providers for reference:\n";
        $shown = 0;
        foreach ($loadedProviders as $provider => $isLoaded) {
            if ($isLoaded && $shown < 5) {
                echo "  $provider\n";
                $shown++;
            }
        }
    }

    // Try to get commands anyway
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

        if (!$swaggerFound) {
            echo "✗ No swagger command found\n";
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

} catch (Exception $e) {
    echo "Exception: ".$e->getMessage()."\n";
    echo "Trace: ".$e->getTraceAsString()."\n";
}