import { calculateBackoffDelay } from './retryUtils';

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
});