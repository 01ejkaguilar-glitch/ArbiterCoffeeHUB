<?php

require __DIR__.'/vendor/autoload.php';

$request = new Illuminate\Http\Request();
$request->setMethod('POST');
$request->setPathInfo('/api/auth/login');

$middleware = new App\Http\Middleware\HandleLoginLockouts();

$response = $middleware->handle($request, function ($req) {
    return new Symfony\Component\HttpFoundation\Response('OK');
});

echo "Middleware executed successfully. Response: " . $response->getContent();
