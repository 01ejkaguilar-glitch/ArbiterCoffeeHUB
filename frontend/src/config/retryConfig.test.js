import { retryConfig } from './retryConfig';

describe('retryConfig', () => {
  test('provides default retry configuration values', () => {
    expect(retryConfig.maxRetries).toBeDefined();
    expect(retryConfig.baseDelay).toBeDefined();
    expect(retryConfig.maxDelay).toBeDefined();
    expect(retryConfig.retryableStatusCodes).toBeDefined();

    expect(typeof retryConfig.maxRetries).toBe('number');
    expect(typeof retryConfig.baseDelay).toBe('number');
    expect(typeof retryConfig.maxDelay).toBe('number');
    expect(Array.isArray(retryConfig.retryableStatusCodes)).toBe(true);
  });

  test('has reasonable default values', () => {
    expect(retryConfig.maxRetries).toBe(3);
    expect(retryConfig.baseDelay).toBe(1000);
    expect(retryConfig.maxDelay).toBe(30000);
    expect(retryConfig.retryableStatusCodes).toContain(408);
    expect(retryConfig.retryableStatusCodes).toContain(429);
    expect(retryConfig.retryableStatusCodes).toContain(500);
  });
});