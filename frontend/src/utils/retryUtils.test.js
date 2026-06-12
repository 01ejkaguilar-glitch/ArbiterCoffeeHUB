import { calculateBackoffDelay, parseRetryAfterHeader } from './retryUtils';

describe('retryUtils', () => {
  test('calculates exponential backoff with jitter', () => {
    // Attempt 0: baseDelay * (2^0) + jitter
    const delay0 = calculateBackoffDelay(0, 1000); // baseDelay 1000ms
    expect(delay0).toBeGreaterThanOrEqual(1000);
    expect(delay0).toBeLessThan(2000); // baseDelay * 2

    // Attempt 1: baseDelay * (2^1) + jitter
    const delay1 = calculateBackoffDelay(1, 1000);
    expect(delay1).toBeGreaterThanOrEqual(2000);
    expect(delay1).toBeLessThan(4000);

    // Attempt 2: baseDelay * (2^2) + jitter
    const delay2 = calculateBackoffDelay(2, 1000);
    expect(delay2).toBeGreaterThanOrEqual(4000);
    expect(delay2).toBeLessThan(8000);
  });

  test('parses Retry-After header value as seconds', () => {
    const retryAfter = parseRetryAfterHeader('60'); // 60 seconds
    expect(retryAfter).toBe(60 * 1000); // Converted to milliseconds
  });

  test('parses Retry-After header value as date', () => {
    // Create a date that's exactly 30 seconds from now
    const futureDate = new Date(Date.now() + 30000);
    const dateString = futureDate.toString();
    const retryAfter = parseRetryAfterHeader(dateString);
    // Allow for timing differences in test execution
    expect(retryAfter).toBeCloseTo(30000, -4);
  });
});