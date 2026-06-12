# API Retry Guidelines

This document outlines the retry mechanism implemented in the ArbiterCoffeeHUB frontend application to improve resilience and user experience when dealing with failed API requests.

## Overview

The application implements a retry mechanism with exponential backoff and jitter for failed API requests. This helps handle transient network issues, rate limiting, and temporary server errors gracefully.

## Implementation Details

### Retry Utility Functions

Located in `src/utils/retryUtils.js`, this module contains two key functions:

1. `calculateBackoffDelay(attempt, baseDelay, maxDelay)` - Calculates delay with exponential backoff and jitter
2. `parseRetryAfterHeader(headerValue)` - Parses Retry-After header values to milliseconds

### API Client with Retry Logic

Located in `src/services/apiClientWithRetry.js`, this module creates an axios instance with automatic retry capabilities.

### Configuration

Retry behavior can be configured via `src/config/retryConfig.js`:

```javascript
export const retryConfig = {
  maxRetries: 3,           // Maximum number of retry attempts
  baseDelay: 1000,         // Base delay in milliseconds (1 second)
  maxDelay: 30000,         // Maximum delay in milliseconds (30 seconds)
  retryableStatusCodes: [  // HTTP status codes that trigger retries
    408, // Request timeout
    429, // Rate limited
    500, // Internal server error
    502, // Bad gateway
    503, // Service unavailable
    504  // Gateway timeout
  ],
};
```

## How It Works

1. **Request Interceptor**: Initializes retry count and adds authentication tokens
2. **Response Interceptor**: 
   - Returns successful responses directly
   - For failed responses, checks if the status code is retryable
   - Calculates delay using exponential backoff with jitter
   - Respects Retry-After headers when present
   - Waits for the calculated delay
   - Retries the request (up to maxRetries times)

### Exponential Backoff with Jitter

The delay calculation follows this formula:
```
delay = baseDelay * (2 ^ attempt) + random_jitter
```

Where:
- `attempt` is the retry attempt number (0-based)
- `random_jitter` is a random value between 0 and the calculated delay
- The result is capped at `maxDelay`

This approach helps prevent the "thundering herd" problem when many clients retry simultaneously.

### Retry-After Header Support

When a server responds with a `Retry-After` header, the retry mechanism will:
1. Parse the header value (either as seconds or as an HTTP date)
2. Use that value as the delay instead of the calculated backoff delay
3. This allows servers to communicate exactly when clients should retry

## Usage

Services should import and use the retry-enabled API client:

```javascript
// Instead of:
// import axios from 'axios';
// const api = axios.create({ baseURL: API_BASE_URL });

// Use:
import apiClientWithRetry from './apiClientWithRetry';
const api = apiClientWithRetry;

// All API calls will now automatically retry
const response = await api.get('/endpoint');
```

## Integration

The retry mechanism has been integrated throughout the application by updating `src/services/api.service.js` to use the retry-enabled client as its base.

## Testing

Unit tests for the retry utilities are located in:
- `src/utils/retryUtils.test.js`
- `src/services/apiClientWithRetry.test.js`
- `src/config/retryConfig.test.js`

## Best Practices

1. **Idempotency**: Ensure that API endpoints are idempotent when possible, as retry mechanisms may resend requests
2. **User Experience**: Consider showing appropriate loading states during retry attempts
3. **Monitoring**: Track retry rates to identify persistent issues
4. **Configuration**: Adjust retry limits and delays based on your specific API characteristics and requirements

## Troubleshooting

If you notice excessive retries in your application:
1. Check if the API is consistently returning non-retryable error codes
2. Verify that client requests are properly formed
3. Review server-side logs for patterns in error responses
4. Consider adjusting the retryable status codes in the configuration