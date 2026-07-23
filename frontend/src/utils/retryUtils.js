/**
 * Calculate backoff delay with exponential backoff and jitter
 * @param {number} attempt - The attempt number (0-based)
 * @param {number} baseDelay - The base delay in milliseconds
 * @param {number} maxDelay - The maximum delay in milliseconds (optional)
 * @returns {number} The delay in milliseconds
 */
export const calculateBackoffDelay = (attempt, baseDelay = 1000, maxDelay = 30000) => {
  // Exponential backoff: baseDelay * (2 ^ attempt)
  const exponentialDelay = baseDelay * Math.pow(2, attempt);

  // Apply maximum delay cap
  const cappedDelay = Math.min(exponentialDelay, maxDelay);

  // Add jitter: random value between 0 and cappedDelay
  const jitter = Math.random() * cappedDelay;

  return cappedDelay + jitter;
};

/**
 * Parse Retry-After header value to delay in milliseconds
 * @param {string} headerValue - The Retry-After header value
 * @returns {number} Delay in milliseconds
 */
export const parseRetryAfterHeader = (headerValue) => {
  if (!headerValue) return 0;

  // If it's a number of seconds
  const seconds = parseInt(headerValue, 10);
  if (!isNaN(seconds)) {
    return seconds * 1000;
  }

  // If it's a date
  const date = new Date(headerValue);
  if (!isNaN(date.getTime())) {
    return date.getTime() - Date.now();
  }

  return 0;
};

const retryUtils = { calculateBackoffDelay, parseRetryAfterHeader };
export default retryUtils;