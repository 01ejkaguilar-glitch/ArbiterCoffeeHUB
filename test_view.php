<?php

require __DIR__ . '/bootstrap/app.php';

$app = App::configure(basePath: __DIR__)
    ->withRouting(
        web: __DIR__ . '/routes/web.php',
        api: __DIR__ . '/routes/api.php',
        commands: __DIR__ . '/routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function ($middleware) {
        //
    })
    ->withExceptions(function ($exceptions) {
        //
    })->create();

if ($app->bound('view')) {
    echo "view service is bound\n";
} else {
    echo "view service is NOT bound\n";
}