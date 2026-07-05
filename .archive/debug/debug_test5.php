<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

echo "Starting debug test 5...\n";

try {
    require __DIR__.'/vendor/autoload.php';
    echo "Autoload loaded successfully\n";

    // Create the application with explicit base path
    $app = new Illuminate\Foundation\Application(__DIR__);

    // Ensure bootstrap/cache directory exists and is writable
    $cacheDir = $app->basePath('/bootstrap/cache');
    if (!is_dir($cacheDir)) {
        mkdir($cacheDir, 0775, true);
    }
    if (!is_writable($cacheDir)) {
        chmod($cacheDir, 0775);
    }

    // Load environment variables
    if (file_exists(__DIR__.'/.env')) {
        $app->detectEnvironment(fn() => $_ENV);
    }

    // Let's manually load the configuration like Laravel does
    // First, let's check what's in the config file
    $configFile = __DIR__.'/config/app.php';
    if (file_exists($configFile)) {
        echo "Config file exists\n";
        $config = include $configFile;
        if (is_array($config) && isset($config['providers'])) {
            echo "Providers configuration found, count: ".count($config['providers'])."\n";
            // Show our provider if it's there
            $swaggerProvider = 'L5Swagger\L5SwaggerServiceProvider::class';
            $foundInConfig = false;
            foreach ($config['providers'] as $provider) {
                if (is_string($provider) && $provider === $swaggerProvider) {
                    echo "✓ Found L5Swagger provider in config/app.php\n";
                    $foundInConfig = true;
                    break;
                }
            }
            if (!$foundInConfig) {
                echo "✗ L5Swagger provider NOT found in config/app.php\n";
                // Show a few providers from config
                echo "First 10 providers in config:\n";
                $count = 0;
                foreach ($config['providers'] as $provider) {
                    if (is_string($provider)) {
                        echo "  $provider\n";
                        $count++;
                        if ($count >= 10) break;
                    }
                }
            }
        } else {
            echo "Config file doesn't return expected array\n";
            var_dump($config);
        }
    } else {
        echo "Config file does not exist: $configFile\n";
    }

    // Now let's see what happens when we load configuration through Laravel
    $app->bootstrapWith([
        Illuminate\Foundation\Bootstrap\LoadEnvironmentVariables::class,
        Illuminate\Foundation\Bootstrap\LoadConfiguration::class
    ]);

    echo "After loading configuration:\n";
    // Try to get a config value
    try {
        $appName = $app->config('app.name');
        echo "App name from config: $appName\n";
    }catch