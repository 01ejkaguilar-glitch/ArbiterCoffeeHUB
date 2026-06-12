import apiClientWithRetry from './apiClientWithRetry';

describe('apiClientWithRetry', () => {
  // We'll implement specific tests later as needed
  test('apiClientWithRetry is defined', () => {
    expect(apiClientWithRetry).toBeDefined();
  });

  test('has interceptors', () => {
    expect(apiClientWithRetry.interceptors).toBeDefined();
    expect(apiClientWithRetry.interceptors.request).toBeDefined();
    expect(apiClientWithRetry.interceptors.response).toBeDefined();
  });
});