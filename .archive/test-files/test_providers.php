<?php

$_SERVER['APP_ENV'] = 'local';
$_SERVER['APP_DEBUG'] = true;

require __DIR__.'/vendor/autoload.php';

$app = new Illuminate\Foundation\Application(
    $_ENV['APP_BASE_PATH'] ?? dirname(__DIR__)
);

// Load environment variables
$app->detectEnvironment(function () {
    return $_SERVER;
});

// Load configuration
$app->loadConfigurationFrom([__DIR__.'/config']);

// Register base service providers
$app->registerConfiguredProviders();

/** @var Illuminate\Contracts\Console\Kernel $kernel */
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);

$providers = array_key_first(class_exists(Illuminate\Foundation\Application::class)
    ? $app->getLoadedProviders()
    : []);

if (empty($providers)) {
    // Try alternative way to get providers
    $reflection = new ReflectionObject($app);
    $property = $reflection->getProperty('providers');
    $property->setAccessible(true);
    $providers = $property->getValue($app);
}

echo "Registered service providers:\n";
foreach ($providers as $provider => $loaded) {
    if ($loaded) {
        echo "  [LOADED] $provider\n";
        if (strpos($provider, 'L5Swagger') !== false) {
            echo "  ^^^ FOUND L5SWAGGER PROVIDER ^^^\n";
        }
    }
}

// Also check if we can resolve the command
try {
    $laravelCommands = $kernel->commands();
    $found = false;
    foreach ($laravelCommands as $command) {
        if (strpos(get_class($command), 'L5Swagger') !== false) {
            echo "FOUND SWAGGER COMMAND: ".get_class($command)."\n";
            $found = true;
        }
    }
    if (!$found) {
        echo "No swagger commands found in kernel\n";
        echo "Available commands:\n";
        foreach ($laravelCommands as $command) {
            echo "  ".get_class($command)."\n";
        }
    }
} catch (Exception $e) {
    echo "Error getting commands: ".$e->getMessage()."\n";
}