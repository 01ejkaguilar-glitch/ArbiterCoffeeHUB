<?php

// Disable error reporting for cleaner output
error_reporting(0);

require __DIR__.'/vendor/autoload.php';

// Create a new Laravel application instance
$app = new Illuminate\Foundation\Application(
    $_ENV['APP_BASE_PATH'] ?? dirname(__DIR__)
);

// Load environment variables
if (file_exists(__DIR__.'/.env')) {
    $app->detectEnvironment(fn() => $_ENV);
}

// Set bootstrap providers if needed (Laravel 12+)
if (method_exists($app, 'bindPathsIn')) {
    $app->bindPathsIn();
}

// Register the service providers from config/app.php
$app->registerConfiguredProviders();

// Get the list of loaded providers
$loadedProviders = $app->getLoadedProviders();

// Check if our provider is in the list
$swaggerProvider = 'L5Swagger\L5SwaggerServiceProvider';
$found = false;

echo "Checking for L5Swagger service provider...\n";
echo "Total loaded providers: ".count($loadedProviders)."\n";

foreach ($loadedProviders as $provider => $isLoaded) {
    if ($isLoaded && $provider === $swaggerProvider) {
        echo "✓ L5Swagger service provider is LOADED\n";
        $found = true;
        break;
    } elseif ($isLoaded) {
        // Just show a few others to verify it's working
        if (str_contains($provider, 'Foundation') || str_contains($provider, 'Auth')) {
            echo "  Loaded: $provider\n";
        }
    }
}

if (!$found) {
    echo "✗ L5Swagger service provider is NOT loaded\n";
    echo "Checking if it's in the config at all...\n";

    // Check the config file directly
    $configProviders = include __DIR__.'/config/app.php';
    if (isset($configProviders)) {
        $configProviderArray = [];
        foreach ($configProviders as $key => $value) {
            if (is_int($key) && is_string($value)) {
                $configProviderArray[] = $value;
            }
        }

        if (in_array($swaggerProvider, $configProviderArray, true)) {
            echo "✓ Provider IS in config/app.php\n";
        } else {
            echo "✗ Provider is NOT in config/app.php\n";
            echo "Providers in config:\n";
            foreach ($configProviderArray as $p) {
                if (str_contains($p, 'L5Swagger') || str_contains($p, 'Swagger')) {
                    echo "  * $p\n";
                }
            }
        }
    }
}

// Try to boot the provider if it's registered but not loaded
if (!$found) {
    echo "\nTrying to manually register and boot the provider...\n";
    try {
        $provider = new L5Swagger\L5SwaggerServiceProvider($app);
        $app->register($provider); // This should call register() and boot()
        echo "✓ Manually registered provider\n";

        // Now try to get the command
        $kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
        $commands = $kernel->commands();

        $swaggerFound = false;
        foreach ($commands as $command) {
            if (strpos(get_class($command), 'GenerateDocsCommand') !== false) {
                echo "✓ Found Swagger command after manual registration: ".get_class($command)."\n";
                $swaggerFound = true;
                break;
            }
        }

        if (!$swaggerFound) {
            echo "✗ Still no swagger command after manual registration\n";
            echo "Available commands:\n";
            foreach ($commands as $command) {
                echo "  ".get_class($command)."\n";
            }
        }
    } catch (Exception $e) {
        echo "✗ Error manually registering provider: ".$e->getMessage()."\n";
    }
}