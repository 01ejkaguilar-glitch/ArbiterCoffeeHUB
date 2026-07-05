<?php

namespace App\Traits;

use Illuminate\Support\Str;

/**
 * Trait for generating consistent cache keys across the application.
 *
 * This trait provides methods for creating standardized cache keys that
 * incorporate hashing to prevent key collisions and ensure predictable
 * cache behavior.
 *
 * @package App\Traits
 */
trait HasCacheKeyGeneration
{
    /**
     * Generate a cache key based on a prefix and parameters.
     *
     * This method creates a consistent, hashed cache key that can safely
     * contain complex parameter data without exceeding length limits or
     * containing invalid characters.
     *
     * @param string $prefix The cache key prefix (e.g., 'products_list', 'user_profile')
     * @param array  $params Associative array of parameters to include in the key
     * @return string A hashed cache key in the format: "{prefix}_{hash}"
     *
     * @example
     * // Generate a key for product filters
     * $key = $this->generateCacheKey('products_list', [
     *     'category_id' => 5,
     *     'search' => 'espresso',
     *     'sort_by' => 'price',
     *     'sort_order' => 'asc'
     * ]);
     * // Returns something like: products_list_5d41402abc4b2a76b9719d911017c592
     *
     * @example
     * // Generate a key for user preferences
     * $key = $this->generateCacheKey('user_preferences', [
     *     'user_id' => 123,
     *     'category' => 'notifications'
     * ]);
     *
     * @note The method uses json_encode to serialize the parameters, so
     *       the parameter order matters for consistency. Consider sorting
     *       the array keys if order-independent hashing is required.
     */
    protected function generateCacheKey(string $prefix, array $params = []): string
    {
        // Sort parameters by key to ensure consistent hashing regardless of input order
        ksort($params);

        // Generate MD5 hash of JSON-encoded parameters
        $hash = md5(json_encode($params));

        // Return formatted cache key
        return $prefix . '_' . $hash;
    }

    /**
     * Generate a cache key for product listings with filters.
     *
     * Convenience method specifically for product listing cache keys.
     * Automatically applies the 'products_list' prefix and handles
     * common filter parameters.
     *
     * @param array $filters Associative array of filter parameters:
     *                       - category_id (int): Filter by category ID
     *                       - is_available (bool): Filter by availability
     *                       - search (string): Search term for product name
     *                       - sort_by (string): Field to sort by
     *                       - sort_order (string): Sort direction (asc/desc)
     *                       - per_page (int): Number of items per page
     *                       - page (int): Page number for pagination
     * @return string A cache key for the product listing with the given filters
     *
     * @example
     * // Generate key for first page of available espresso products
     * $key = $this->generateProductListCacheKey([
     *     'is_available' => true,
     *     'search' => 'espresso',
     *     'per_page' => 15,
     *     'page' => 1
     * ]);
     *
     * @see generateCacheKey() for the underlying implementation
     */
    protected function generateProductListCacheKey(array $filters = []): string
    {
        return $this->generateCacheKey('products_list', $filters);
    }

    /**
     * Generate a cache key for a single product.
     *
     * @param int $productId The ID of the product
     * @return string A cache key for the product
     *
     * @example
     * $key = $this->generateProductCacheKey(123);
     * // Returns: product_123_a1b2c3d4e5f678901234567890123456
     */
    protected function generateProductCacheKey(int $productId): string
    {
        return $this->generateCacheKey('product', ['id' => $productId]);
    }

    /**
     * Generate a cache key for user-specific data.
     *
     * @param int $userId The ID of the user
     * @param string $type The type of data (e.g., 'preferences', 'cart', 'history')
     * @param array $additionalParams Additional parameters to include in the key
     * @return string A cache key for the user data
     *
     * @example
     * $key = $this->generateUserCacheKey(456, 'preferences', ['theme' => 'dark']);
     * // Returns: user_456_preferences_78901234567890abcdef1234567890ab
     */
    protected function generateUserCacheKey(int $userId, string $type, array $additionalParams = []): string
    {
        $params = array_merge([
            'user_id' => $userId,
            'type' => $type
        ], $additionalParams);

        return $this->generateCacheKey('user', $params);
    }

    /**
     * Generate a cache key for analytics or reporting data.
     *
     * @param string $reportType The type of report (e.g., 'sales', 'traffic', 'conversion')
     * @param string $timePeriod The time period (e.g., 'daily', 'weekly', 'monthly', '2023-01')
     * @param array $filters Additional filters to apply to the report
     * @return string A cache key for the report data
     *
     * @example
     * $key = $this->generateAnalyticsCacheKey('sales', 'monthly', [
     *     'category_id' => 5,
     *     'start_date' => '2023-01-01',
     *     'end_date' => '2023-01-31'
     * ]);
     */
    protected function generateAnalyticsCacheKey(string $reportType, string $timePeriod, array $filters = []): string
    {
        $params = array_merge([
            'report_type' => $reportType,
            'time_period' => $timePeriod
        ], $filters);

        return $this->generateCacheKey('analytics', $params);
    }
}