<?php

return [

    /*
    |--------------------------------------------------------------------------
    /// Default Sentry DSN
    |--------------------------------------------------------------------------
    |
    | The Data Source Name (DSN) that Sentinel uses to store events.
    | You can find your project's DSN in your Sentry account under
    | "Client Keys (DSN)".
    |
    */

    'dsn' => env('SENTRY_LARAVEL_DSN'),

    /*
    |--------------------------------------------------------------------------
    /// Symfony/Laravel Integration
    |--------------------------------------------------------------------------
    |
    | The Symfony/Laravel integration integrates with the Laravel framework
    | and allows Sentry to automatically capture exceptions and errors.
    |
    */

    'register_exception_handler' => true,
    'register_panic_handler'     => false,
    'register_error_handler'     => true,

    /*
    |--------------------------------------------------------------------------
    // Breadcrumbs
    |--------------------------------------------------------------------------
    |
    | Breadcrumbs are events that are added to a trail that is displayed
    | alongside an error, giving you a trail of events that happened prior
    | to the issue.
    |
    */

    'breadcrumbs' => [
        // Record debugging information as breadcrumbs
        'debug' => false,

        // Record events such as logs as breadcrumbs
        'log'   => true,

        // Record SQLite statements as breadcrumbs
        'sqlite' => false,

        // Record Eloquent events as breadcrumbs
        'eloquent' => [
            // Fetch models when recording breadcrumbs
            'capture_models' => true,
            // Only collect data from modified columns
            'only_print_dirty' => true,
        ],

        // Record HTTP requests as breadcrumbs
        'http' => true,

        // Capture the request body for HTTP requests
        'http_print_body' => false,

        // Set the maximum number of breadcrumbs that will be recorded. When
        // this limit is reached, the oldest breadcrumbs will be discarded
        // as new ones are added to the trail.
        'max_breadcrumbs' => 100,

        // Merge context from the breadcrumbs
        'merge_context' => false,
    ],

    /*
    |--------------------------------------------------------------------------
    // Tracing
    |--------------------------------------------------------------------------
    |
    | Tracing allows you to see the performance of your application and track
    | transactions as they move through your system.
    |
    */

    'tracing' => [
        // Enable tracing origins
        'origins' => [' artisan', 'commands', 'middleware', 'queue', 'scheduler' ],

        // Set the traces sample rate for transaction tracing. By default, no
        // transactions will be traced. You must set this to a float between 0.0
        // and 1.0 to enable tracing.
        'traces_sample_rate' => env('SENTRY_LARAVEL_TRACES_SAMPLE_RATE', 0.1),

        // Set the profiles sample rate for profiling. By default, no profiles
        // will be captured. You must set this to a float between 0.0 and 1.0
        // to enable profiling.
        'profiles_sample_rate' => env('SENTRY_LARAVEL_PROFILES_SAMPLE_RATE', 0.1),
    ],

    /*
    |--------------------------------------------------------------------------
    // Transport
    |--------------------------------------------------------------------------
    |
    | The transport layer is responsible for sending events to Sentry.
    |
    */

    'http' => [
        // A proxy to use for HTTP requests
        'proxy' => null,

        // A timeout for HTTP requests in seconds
        'timeout' => null,

        // SSL verification
        'verify' => null,

        // HTTP headers to send with each request
        'headers' => [],

        // Use the system's TLS certificate bundle instead of Mozilla's
        'ssl_no_verifypeer' => false,
    ],

    /*
    |--------------------------------------------------------------------------
    // Server Name
    |--------------------------------------------------------------------------
    |
    | The name of the server or hostname that will be tagged to each event.
    | By default, Sentry will attempt to get the hostname from the
    | $_SERVER['SERVER_NAME'] or `php_uname('n')` variables.
    |
    */

    'server_name' => null,

    /*
    |--------------------------------------------------------------------------
    // Release
    |--------------------------------------------------------------------------
    |
    | The release version of your application. If you don't set a release,
    | Sentry will try to read it from the git repository. If you are not using
    | git, you will need to set this manually.
    |
    */

    'release' => null,

    /*
    |--------------------------------------------------------------------------
    // Environment
    |--------------------------------------------------------------------------
    |
    | The environment (e.g. 'staging' or 'production') that your application
    | is running in.
    |
    */

    'environment' => env('APP_ENV', 'production'),

    /*
    |--------------------------------------------------------------------------
    // Distributed Tracing
    |--------------------------------------------------------------------------
    |
    | Options for distributed tracing.
    |
    */

    'distributed_tracing' => [
        // Whether to send traces to Sentry
        'enabled' => true,

        // Whether to send traces to a trace propagation header
        'beacon' => true,
    ],

    /*
    |--------------------------------------------------------------------------
    // Ignore Exceptions
    |--------------------------------------------------------------------------
    |
    | An array of exception types that should not be reported to Sentry.
    |
    */

    'ignore_exceptions' => [
        // Ignore Laravel's built-in exceptions
        \Illuminate\Auth\AuthenticationException::class,
        \Illuminate\Auth\Access\AuthorizationException::class,
        \Illuminate\Database\ModelNotFoundException::class,
        \Illuminate\Validation\ValidationException::class,
        \Illuminate\Verification\VerificationException::class,
        \Illuminate\Session\TokenMismatchException::class,
        \Illuminate\Contracts\Encryption\DecryptException::class,
    ],

    /*
    |--------------------------------------------------------------------------
    // Attach Stacktrace
    |--------------------------------------------------------------------------
    |
    | When enabled, stacktraces are automatically attached to messages.
    |
    */

    'attach_stacktrace' => true,

    /*
    |--------------------------------------------------------------------------
    // Send Default PII
    |--------------------------------------------------------------------------
    |
    | When enabled, certain personally identifiable information (PII) is
    | added to events, such as usernames, IP addresses, and email addresses.
    |
    */

    'send_default_pii' => false,

    /*
    |--------------------------------------------------------------------------
    // Breadcrumbs
    |--------------------------------------------------------------------------
    |--------------------------------------------------------------------------
    */
    'breadcrumbs' => [
        // Record debugging information as breadcrumbs
        'debug' => false,

        // Record events such as logs as breadcrumbs
        'log'   => true,

        // Record HTTP requests as breadcrumbs
        'http' => true,

        // Set the maximum number of breadcrumbs that will be recorded. When
        // this limit is reached, the oldest breadcrumbs will be discarded
        // as new ones are added to the trail.
        'max_breadcrumbs' => 100,
    ],

    /*
    |--------------------------------------------------------------------------
    // Tracing
    |--------------------------------------------------------------------------
    */
    'tracing' => [
        // Enable tracing origins
        'origins' => ['artisan', 'commands', 'middleware', 'queue', 'scheduler'],

        // Set the traces sample rate for transaction tracing. By default, no
        // transactions will be traced. You must set this to a float between 0.0
        // and 1.0 to enable tracing.
        'traces_sample_rate' => env('SENTRY_LARAVEL_TRACES_SAMPLE_RATE', 0.1),

        // Set the profiles sample rate for profiling. By default, no profiles
        // will be captured. You must set this to a float between 0.0 and 1.0
        // to enable profiling.
        'profiles_sample_rate' => env('SENTRY_LARAVEL_PROFILES_SAMPLE_RATE', 0.1),
    ],

];