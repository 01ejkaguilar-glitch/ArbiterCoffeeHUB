<?php

require __DIR__.'/vendor/autoload.php';

$app = new Illuminate\Foundation\Application(
    $_ENV['APP_BASE_PATH'] ?? dirname(__DIR__)
);

$app->singleton(
    Illuminate\Contracts\Http\Kernel::class,
    App\Http\Kernel::class
);
$app->singleton(
    Illuminate\Contracts\Console\Kernel::class,
    App\Console\Kernel::class
);

$app->bootstrapWith([
    Illuminate\Foundation\Bootstrap\DetectEnvironment::class,
    Illuminate\Foundation\Bootstrap\LoadConfiguration::class,
    Illuminate\Foundation\Bootstrap\HandleExceptions::class,
    Illuminate\Foundation\Bootstrap\RegisterProviders::class,
    Illuminate\Foundation\Bootstrap\BootProviders::class
]);

/** @var Illuminate\Contracts\Console\Kernel $kernel */
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);

$commands = $kernel->commands();
$swaggerCommands = array_filter($commands, function($command) {
    return strpos(get_class($command), 'L5Swagger') !== false;
});

echo "Total commands: ".count($commands)."\n";
echo "Swagger commands: ".count($swaggerCommands)."\n";

if (count($swaggerCommands) > 0) {
    foreach ($swaggerCommands as $command) {
        echo "Found: ".get_class($command)."\n";
    }
} else {
    echo "No swagger commands found\n";
    echo "Available command namespaces:\n";
    $namespaces = array_map(function($command) {
        return dirname(get_class($command));
    }, $commands);
    $namespaces = array_unique($namespaces);
    sort($namespaces);
    foreach ($namespaces as $namespace) {
        echo "  $namespace\n";
    }
}