// src/config/retryConfig.js
export const retryConfig = {
  maxRetries: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 30000, // 30 seconds
  retryableStatusCodes: [408, 429, 500, 502, 503, 504],
};

export default retryConfig;