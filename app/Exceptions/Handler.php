<?php

namespace App\Exceptions;

use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Throwable;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Laravel\Sanctum\Exceptions\MissingAccessTokenException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\HttpFoundation\Response;

class Handler extends ExceptionHandler
{
    /**
     * A list of exception types with their corresponding custom log levels.
     *
     * @var array<class-string<Throwable>, \Psr\Log\LogLevel::*>
     */
    protected $levels = [
        //
    ];

    /**
     * A list of the exception types that are not reported.
     *
     * @var array<int, class-string<Throwable>>
     */
    protected $dontReport = [
        //
    ];

    /**
     * A list of the inputs that are never flashed for validation exceptions.
     *
     * @var array<int, string>
     */
    protected $dontFlash = [
        'current_password',
        'password',
        'password_confirmation',
    ];

    /**
     * Register the exception handling callbacks for the application.
     */
    public function register(): void
    {
        $this->reportable(function (Throwable $e) {
            // Custom reporting logic can go here
        });
    }

    /**
     * Render an exception into an HTTP response.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Throwable  $e
     * @return \Symfony\Component\HttpFoundation\Response
     *
     * @throws \Throwable
     */
    public function render($request, Throwable $e)
    {
        // Log the exception with structured data
        $this->logException($e, $request);

        // Handle specific exception types with custom responses
        if ($e instanceof ModelNotFoundException) {
            return response()->json([
                'success' => false,
                'message' => 'Resource not found',
                'error_code' => 'RESOURCE_NOT_FOUND'
            ], Response::HTTP_NOT_FOUND);
        }

        if ($e instanceof ValidationException) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        if ($e instanceof AuthorizationException) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
                'error_code' => 'UNAUTHORIZED'
            ], Response::HTTP_FORBIDDEN);
        }

        if ($e instanceof MissingAccessTokenException) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated',
                'error_code' => 'UNAUTHENTICATED'
            ], Response::HTTP_UNAUTHORIZED);
        }

        if ($e instanceof NotFoundHttpException) {
            return response()->json([
                'success' => false,
                'message' => 'Endpoint not found',
                'error_code' => 'ENDPOINT_NOT_FOUND'
            ], Response::HTTP_NOT_FOUND);
        }

        // For all other exceptions, return generic error in production
        if (app()->environment('production')) {
            return response()->json([
                'success' => false,
                'message' => 'Internal server error',
                'error_code' => 'INTERNAL_SERVER_ERROR'
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }

        // Return detailed error in development/local environments
        return parent::render($request, $e);
    }

    /**
     * Log exception with structured data for better observability.
     *
     * @param  \Throwable  $e
     * @param  \Illuminate\Http\Request|null  $request
     * @return void
     */
    protected function logException(Throwable $e, $request = null): void
    {
        $context = [
            'exception' => get_class($e),
            'message' => $e->getMessage(),
            'file' => $e->getFile(),
            'line' => $e->getLine(),
            'trace' => $e->getTraceAsString(),
        ];

        if ($request instanceof \Illuminate\Http\Request) {
            $context['request'] = [
                'method' => $request->method(),
                'url' => $request->fullUrl(),
                'ip' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'user_id' => $request->user()?->id ?? null,
                'request_id' => $request->header('X-Request-ID'),
                'route' => $request->route() ? $request->route()->getName() : null,
            ];
        }

        // Log to the errors channel for better separation
        Log::channel('errors')->error('Unhandled Exception', $context);
    }
}