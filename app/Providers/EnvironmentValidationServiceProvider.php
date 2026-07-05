<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

class EnvironmentValidationServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        // Skip validation in local environment
        if ($this->app->environment('local')) {
            return;
        }

        $required = [
            'DB_CONNECTION' => 'required',
            'DB_HOST' => 'required',
            'DB_PORT' => 'required|integer',
            'DB_DATABASE' => 'required',
            'DB_USERNAME' => 'required',
            'DB_PASSWORD' => 'required',
            'APP_KEY' => 'required',
        ];

        $data = [];
        foreach ($required as $key => $rule) {
            $data[$key] = env($key, null);
        }

        $validator = Validator::make($data, $required);

        if ($validator->fails()) {
            throw new \RuntimeException(
                'Environment validation failed. Please check your .env file.' . PHP_EOL .
                implode(PHP_EOL, $validator->errors()->all())
            );
        }
    }
}
