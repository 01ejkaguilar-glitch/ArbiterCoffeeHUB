<?php

namespace App\Support;

use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Log;

/**
 * Configuration Helper
 *
 * Provides consistent access to configuration values with validation and fallback support.
 * This helper encourages using config() instead of env() in application code,
 * while env() should be reserved for configuration files only.
 */
class ConfigHelper
{
    /**
     * Get a configuration value with validation and fallback.
     *
     * @param string $key       The configuration key (using dot notation)
     * @param mixed  $default   Default value if key is not found
     * @param bool   $required  Whether the value is required
     * @return mixed
     *
     * @throws \RuntimeException if a required value is missing
     */
    public static function get(string $key, $default = null, bool $required = false)
    {
        $value = Config::get($key, $default);

        if ($required && is_null($value)) {
            Log::error("Required configuration key [{$key}] is missing");
            throw new \RuntimeException("Required configuration key [{$key}] is missing");
        }

        return $value;
    }

    /**
     * Get a configuration value as string.
     *
     * @param string $key       The configuration key (using dot notation)
     * @param string $default   Default value if key is not found
     * @param bool   $required  Whether the value is required
     * @return string
     */
    public static function string(string $key, string $default = '', bool $required = false): string
    {
        $value = self::get($key, $default, $required);
        return is_string($value) ? $value : (string) $value;
    }

    /**
     * Get a configuration value as integer.
     *
     * @param string $key       The configuration key (using dot notation)
     * @param int    $default   Default value if key is not found
     * @param bool   $required  Whether the value is required
     * @return int
     */
    public static function int(string $key, int $default = 0, bool $required = false): int
    {
        $value = self::get($key, $default, $required);
        return is_numeric($value) ? (int) $value : $default;
    }

    /**
     * Get a configuration value as boolean.
     *
     * @param string $key       The configuration key (using dot notation)
     * @param bool   $default   Default value if key is not found
     * @param bool   $required  Whether the value is required
     * @return bool
     */
    public static function bool(string $key, bool $default = false, bool $required = false): bool
    {
        $value = self::get($key, $default, $required);
        if (is_string($value)) {
            return strtolower($value) === 'true' || $value === '1' || strtolower($value) === 'yes';
        }
        return (bool) $value;
    }

    /**
     * Get a configuration value as array.
     *
     * @param string $key       The configuration key (using dot notation)
     * @param array  $default   Default value if key is not found
     * @param bool   $required  Whether the value is required
     * @return array
     */
    public static function array(string $key, array $default = [], bool $required = false): array
    {
        $value = self::get($key, $default, $required);
        return is_array($value) ? $value : (array) $value;
    }
}