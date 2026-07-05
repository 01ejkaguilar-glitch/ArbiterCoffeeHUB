<?php

namespace App\Support;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

/**
 * Feature Flag Helper
 *
 * Provides a simple way to check if a feature flag is enabled.
 * Flags are stored in the database and can be checked with optional user context.
 */
class FeatureFlag
{
    /**
     * Cache key prefix for feature flags.
     */
    const CACHE_PREFIX = 'feature_flag_';

    /**
     * Check if a feature flag is enabled.
     *
     * @param string $name      The name of the feature flag
     * @param mixed  $user      Optional user object or ID for contextual evaluation
     * @return bool
     */
    public static function enabled(string $name, $user = null): bool
    {
        // Try to get from cache first (cached for 1 minute)
        $cacheKey = self::CACHE_PREFIX . $name;
        $flag = Cache::get($cacheKey);

        if ($flag === null) {
            // Fetch from database
            $flag = DB::table('feature_flags')->where('name', $name)->first();
            if ($flag) {
                // Cache the flag object for 1 minute
                Cache::put($cacheKey, $flag, now()->addMinute());
            }
        }

        if (!$flag) {
            // Flag not found, treat as disabled
            return false;
        }

        // If flag is not enabled, return false
        if (!$flag->enabled) {
            return false;
        }

        // If there are conditions, evaluate them
        if (!empty($flag->conditions)) {
            return self::evaluateConditions($flag->conditions, $user);
        }

        // No conditions, flag is enabled
        return true;
    }

    /**
     * Evaluate conditions against a user context.
     *
     * @param mixed  $conditions The conditions stored as JSON
     * @param mixed  $user       Optional user object or ID
     * @return bool
     */
    protected static function evaluateConditions($conditions, $user): bool
    {
        // If no user provided, we cannot evaluate user-specific conditions
        if (!$user) {
            // If conditions require a user, we cannot fulfill them
            // For simplicity, we'll disable the flag if conditions exist but no user
            // In a more advanced system, you might have default conditions
            return false;
        }

        // Decode conditions JSON
        $conditions = json_decode($conditions, true);
        if (!is_array($conditions)) {
            return false;
        }

        // Example condition: percentage rollout
        if (isset($conditions['percentage'])) {
            $percentage = (int) $conditions['percentage'];
            if ($percentage <= 0) {
                return false;
            }
            if ($percentage >= 100) {
                return true;
            }

            // Use user ID to determine if they are in the percentage
            $userId = is_object($user) ? $user->id : $user;
            if (!is_numeric($userId)) {
                return false;
            }

            // Simple hash of userId to get a consistent value
            $hash = crc32((string) $userId);
            $value = ($hash % 100) + 1; // 1 to 100 inclusive

            return $value <= $percentage;
        }

        // Add more condition types as needed (e.g., user attributes, roles, etc.)

        // If we don't recognize the condition, assume disabled for safety
        return false;
    }

    /**
     * Flush the feature flag cache.
     * Useful when flags are updated in the database.
     */
    public static function flushCache(): void
    {
        // Since we cached with a prefix, we would need to clear matching keys.
        // For simplicity, we'll clear the entire cache. In a real app, you might use tags.
        Cache::flush();
    }
}