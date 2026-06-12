import { renderHook, act } from '@testing-library/react';
import useApiError from './useApiError';

// Mock component to test the hook
const TestWrapper = ({ children }) => children;

describe('useApiError', () => {
  test('returns error message and actions for network errors', () => {
    const { result } = renderHook(() => useApiError(), { wrapper: TestWrapper });

    // Simulate network error (no response property)
    act(() => {
      result.current.getErrorInfo({ message: 'Network Error' });
    });

    expect(result.current.errorInfo.type).toBe('error');
    expect(result.current.errorInfo.message).toContain('internet connection');
    expect(result.current.errorInfo.actions).toHaveLength(2);
    expect(result.current.errorInfo.actions[0]).toMatchObject({
      label: expect.stringContaining('Retry'),
      onClick: expect.any(Function)
    });
    expect(result.current.errorInfo.actions[1]).toMatchObject({
      label: expect.stringContaining('Dismiss'),
      variant: 'secondary'
    });
  });

  test('returns 401 error with login action', () => {
    const { result } = renderHook(() => useApiError(), { wrapper: TestWrapper });

    // Simulate 401 error
    act(() => {
      result.current.getErrorInfo({
        response: { status: 401 }
      });
    });

    expect(result.current.errorInfo.type).toBe('error');
    expect(result.current.errorInfo.message).toContain('session has expired');
    expect(result.current.errorInfo.actions).toHaveLength(1);
    expect(result.current.errorInfo.actions[0]).toMatchObject({
      label: expect.stringContaining('Log In'),
      onClick: expect.any(Function)
    });
  });

  test('returns 403 error with permission message', () => {
    const { result } = renderHook(() => useApiError(), { wrapper: TestWrapper });

    // Simulate 403 error
    act(() => {
      result.current.getErrorInfo({
        response: { status: 403 }
      });
    });

    expect(result.current.errorInfo.type).toBe('error');
    expect(result.current.errorInfo.message).toContain('permission');
    expect(result.current.errorInfo.actions).toHaveLength(1);
    expect(result.current.errorInfo.actions[0]).toMatchObject({
      label: expect.stringContaining('Go to Home'),
      variant: 'secondary'
    });
  });

  test('returns 404 error with not found message', () => {
    const { result } = renderHook(() => useApiError(), { wrapper: TestWrapper });

    // Simulate 404 error
    act(() => {
      result.current.getErrorInfo({
        response: { status: 404 }
      });
    });

    expect(result.current.errorInfo.type).toBe('error');
    expect(result.current.errorInfo.message).toContain('could not be found');
    expect(result.current.errorInfo.actions).toHaveLength(1);
    expect(result.current.errorInfo.actions[0]).toMatchObject({
      label: expect.stringContaining('Go to Home'),
      variant: 'secondary'
    });
  });

  test('returns 500 error with retry and report actions', () => {
    const { result } = renderHook(() => useApiError(), { wrapper: TestWrapper });

    // Simulate 500 error
    act(() => {
      result.current.getErrorInfo({
        response: { status: 500 }
      });
    });

    expect(result.current.errorInfo.type).toBe('error');
    expect(result.current.errorInfo.message).toContain('internal server error');
    expect(result.current.errorInfo.actions).toHaveLength(2);
    expect(result.current.errorInfo.actions[0]).toMatchObject({
      label: expect.stringContaining('Retry'),
      onClick: expect.any(Function)
    });
    expect(result.current.errorInfo.actions[1]).toMatchObject({
      label: expect.stringContaining('Report Issue'),
      variant: 'outline-primary'
    });
  });

  test('returns error with message from response data for unknown status code', () => {
    const { result } = renderHook(() => useApiError(), { wrapper: TestWrapper });

    // Simulate 418 error (unknown status) with message in response data
    act(() => {
      result.current.getErrorInfo({
        response: { status: 418, data: { message: 'I\'m a teapot' } }
      });
    });

    expect(result.current.errorInfo.type).toBe('error');
    expect(result.current.errorInfo.message).toBe('I\'m a teapot');
    expect(result.current.errorInfo.actions).toHaveLength(1);
    expect(result.current.errorInfo.actions[0]).toMatchObject({
      label: expect.stringContaining('Dismiss'),
      variant: 'secondary'
    });
  });

  test('returns 500 error with retry and report actions when status is 500 with no data message', () => {
    const { result } = renderHook(() => useApiError(), { wrapper: TestWrapper });

    // Simulate 500 error with no message in response data
    act(() => {
      result.current.getErrorInfo({
        response: { status: 500, data: {} }
      });
    });

    expect(result.current.errorInfo.type).toBe('error');
    expect(result.current.errorInfo.message).toBe('An internal server error occurred. Please try again later.');
    expect(result.current.errorInfo.actions).toHaveLength(2);
    expect(result.current.errorInfo.actions[0]).toMatchObject({
      label: expect.stringContaining('Retry'),
      onClick: expect.any(Function)
    });
    expect(result.current.errorInfo.actions[1]).toMatchObject({
      label: expect.stringContaining('Report Issue'),
      variant: 'outline-primary'
    });
  });
});