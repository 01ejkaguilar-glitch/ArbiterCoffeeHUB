import axios from 'axios';
import { calculateBackoffDelay, parseRetryAfterHeader } from '../utils/retryUtils';
import API_BASE_URL from '../config/api';

/**
 * Create axios instance with retry logic
 * Handles automatic retries with exponential backoff and jitter
 * Respects Retry-After headers when present
 */
const apiClientWithRetry = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 second timeout
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: false,  // Using Bearer tokens, not cookies
});

// Default retry configuration
const DEFAULT_MAX_RETRIES = 3;
const DEFAULT_BASE_DELAY = 1000; // 1 second
const DEFAULT_MAX_DELAY = 30000; // 30 seconds

// Request interceptor to add retry count and auth token
apiClientWithRetry.interceptors.request.use(
  async (config) => {
    // Initialize retry count
    config.retryCount = config.retryCount || 0;

    // Add Bearer token if available
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle retries with exponential backoff
apiClientWithRetry.interceptors.response.use(
  (response) => {
    // Return response directly if successful
    return response;
  },
  async (error) => {
    const { config, response } = error;

    // If no config or max retries exceeded, reject
    if (!config || config.retryCount >= DEFAULT_MAX_RETRIES) {
      return Promise.reject(error);
    }

    // Check if we should retry based on status code
    const statusCode = response?.status;
    const shouldRetry =
      statusCode >= 500 || // Server errors
      statusCode === 429 || // Rate limited
      statusCode === 408; // Request timeout

    if (!shouldRetry) {
      return Promise.reject(error);
    }

    // Increment retry count
    config.retryCount += 1;

    // Calculate delay with exponential backoff and jitter
    let delay = calculateBackoffDelay(
      config.retryCount - 1, // 0-based attempt
      DEFAULT_BASE_DELAY,
      DEFAULT_MAX_DELAY
    );

    // Override with Retry-After header if present
    if (response?.headers?.['retry-after']) {
      delay = parseRetryAfterHeader(response.headers['retry-after']);
    }

    // Wait for the delay
    await new Promise((resolve) => setTimeout(resolve, delay));

    // Retry the request
    return apiClientWithRetry(config);
  }
);

export default apiClientWithRetry;