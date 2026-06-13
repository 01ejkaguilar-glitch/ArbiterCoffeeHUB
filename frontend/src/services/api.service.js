/**
 * API Service for making HTTP requests
 * Handles authentication, error handling, and request/response formatting
 */

import apiClientWithRetry from './apiClientWithRetry';
import API_BASE_URL from '../config/api';
import offlineQueue from './offlineQueue';

// Critical actions that should be queued when offline
const CRITICAL_METHODS = ['POST', 'PUT', 'PATCH', 'DELETE'];

// Use the retry-enabled axios instance
const apiClient = apiClientWithRetry;

// Request interceptor - Add auth token and CSRF token to requests
apiClient.interceptors.request.use(
  async (config) => {
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

// Response interceptor - Handle errors globally
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response) {
      // Handle specific error codes
      switch (error.response.status) {
        case 401:
          // Unauthorized - Try to refresh token first (except for auth endpoints)
          if (!originalRequest.url.includes('/auth/') && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
              const refreshResponse = await apiClient.post('/auth/refresh-token');
              if (refreshResponse.data.success) {
                const { token } = refreshResponse.data.data;

                // Calculate new token expiry
                const expiryDate = new Date();
                expiryDate.setDate(expiryDate.getDate() + 7);

                localStorage.setItem('authToken', token);
                localStorage.setItem('tokenExpiry', expiryDate.toISOString());

                // Retry the original request with new token
                originalRequest.headers.Authorization = `Bearer ${token}`;
                return apiClient(originalRequest);
              }
            } catch (refreshError) {
              // Token refresh failed - will trigger logout
            }
          }

          // Only clear tokens/redirect if NOT an auth-check call
          // AuthContext handles its own 401 cleanup
          if (!originalRequest.url.includes('/auth/user') && !originalRequest.url.includes('/auth/')) {
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            localStorage.removeItem('tokenExpiry');
            if (window.location.pathname !== '/login') {
              window.location.href = '/login';
            }
          }
          break;
        case 403:
          // Forbidden
          break;
        case 404:
          // Not found
          break;
        case 422:
          // Validation error
          break;
        case 500:
          // Server error
          break;
        default:
          // Other errors
      }
    } else if (error.request) {
      // Request made but no response - network issue
    } else {
      // Error in request setup
    }
    return Promise.reject(error);
  }
);

// Helper: check if user is online
const isOnline = () => navigator.onLine;

// Helper: check if a request should be queued when offline
const shouldQueueRequest = (method) => {
  return CRITICAL_METHODS.includes(method.toUpperCase());
};

// Progress tracking for requests
const progressCallbacks = new Map();
let progressIdCounter = 0;

// Register a progress callback for a request
export const registerProgressCallback = (callback) => {
  const id = ++progressIdCounter;
  progressCallbacks.set(id, callback);
  return id;
};

// Unregister a progress callback
export const unregisterProgressCallback = (id) => {
  progressCallbacks.delete(id);
};

// Notify all progress callbacks
const notifyProgress = (progress) => {
  progressCallbacks.forEach((callback) => {
    try {
      callback(progress);
    } catch (error) {
      console.error('Error in progress callback:', error);
    }
  });
};

// API Service methods
const apiService = {
  // Check if user is online (exposed for external use)
  isOnline,

  // GET request with optional progress tracking
  get: async (url, params = {}, bustCache = false, onProgress) => {
    // GET requests are not queued as they are typically read-only
    if (!isOnline()) {
      throw new Error('No internet connection');
    }

    // Register progress callback if provided
    let progressId = null;
    if (onProgress) {
      progressId = registerProgressCallback(onProgress);
      // Immediately call with 0%
      notifyProgress(0);
    }

    try {
      const config = { params };
      if (bustCache) {
        config.headers = {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        };
        // Add timestamp to URL to bypass browser cache
        config.params = { ...params, _t: Date.now() };
      }

      // Simulate progress for demonstration (in real implementation,
      // this would be tied to actual request progress)
      if (onProgress) {
        // Call progress at 50% after a short delay
        setTimeout(() => {
          notifyProgress(0.5);
        }, 50);

        // Call progress at 100% when request completes
        const originalNotifyProgress = notifyProgress;
        notifyProgress = (progress) => {
          originalNotifyProgress(progress);
          if (progress >= 1) {
            // Restore original notifyProgress
            notifyProgress = originalNotifyProgress;
            // Unregister after completion
            if (progressId !== null) {
              unregisterProgressCallback(progressId);
            }
          }
        };
      }

      const response = await apiClient.get(url, config);

      // Final progress update
      if (onProgress) {
        notifyProgress(1);
        // Unregister after completion
        if (progressId !== null) {
          unregisterProgressCallback(progressId);
        }
      }

      return response.data;
    } catch (error) {
      // Progress error state
      if (onProgress) {
        notifyProgress(1); // Still show complete to avoid stuck indicator
        if (progressId !== null) {
          unregisterProgressCallback(progressId);
        }
      }
      throw error;
    }
  },

  // POST request with optional progress tracking
  post: async (url, data = {}, config = {}, onProgress) => {
    // If offline and this is a critical request, queue it but still throw error
    if (!isOnline() && shouldQueueRequest('POST')) {
      offlineQueue.enqueue({
        method: 'POST',
        url,
        data,
        config,
        timestamp: Date.now()
      });

      // Still throw the error for immediate feedback, but request is queued
      const error = new Error('No internet connection');
      error.queued = true;
      throw error;
    }

    if (!isOnline()) {
      throw new Error('No internet connection');
    }

    // Register progress callback if provided
    let progressId = null;
    if (onProgress) {
      progressId = registerProgressCallback(onProgress);
      // Immediately call with 0%
      notifyProgress(0);
    }

    try {
      // Simulate progress for demonstration
      if (onProgress) {
        // Call progress at 30% after a short delay
        setTimeout(() => {
          notifyProgress(0.3);
        }, 30);

        // Call progress at 70% after another delay
        setTimeout(() => {
          notifyProgress(0.7);
        }, 100);

        // Call progress at 100% when request completes
        const originalNotifyProgress = notifyProgress;
        notifyProgress = (progress) => {
          originalNotifyProgress(progress);
          if (progress >= 1) {
            // Restore original notifyProgress
            notifyProgress = originalNotifyProgress;
            // Unregister after completion
            if (progressId !== null) {
              unregisterProgressCallback(progressId);
            }
          }
        };
      }

      const response = await apiClient.post(url, data, config);

      // Final progress update
      if (onProgress) {
        notifyProgress(1);
        // Unregister after completion
        if (progressId !== null) {
          unregisterProgressCallback(progressId);
        }
      }

      return response.data;
    } catch (error) {
      // Progress error state
      if (onProgress) {
        notifyProgress(1); // Still show complete to avoid stuck indicator
        if (progressId !== null) {
          unregisterProgressCallback(progressId);
        }
      }
      throw error;
    }
  },

  // PUT request with optional progress tracking
  put: async (url, data = {}, onProgress) => {
    // If offline and this is a critical request, queue it but still throw error
    if (!isOnline() && shouldQueueRequest('PUT')) {
      offlineQueue.enqueue({
        method: 'PUT',
        url,
        data,
        timestamp: Date.now()
      });

      // Still throw the error for immediate feedback, but request is queued
      const error = new Error('No internet connection');
      error.queued = true;
      throw error;
    }

    if (!isOnline()) {
      throw new Error('No internet connection');
    }

    // Register progress callback if provided
    let progressId = null;
    if (onProgress) {
      progressId = registerProgressCallback(onProgress);
      // Immediately call with 0%
      notifyProgress(0);
    }

    try {
      // Simulate progress for demonstration
      if (onProgress) {
        // Call progress at 40% after a short delay
        setTimeout(() => {
          notifyProgress(0.4);
        }, 40);

        // Call progress at 80% after another delay
        setTimeout(() => {
          notifyProgress(0.8);
        }, 120);

        // Call progress at 100% when request completes
        const originalNotifyProgress = notifyProgress;
        notifyProgress = (progress) => {
          originalNotifyProgress(progress);
          if (progress >= 1) {
            // Restore original notifyProgress
            notifyProgress = originalNotifyProgress;
            // Unregister after completion
            if (progressId !== null) {
              unregisterProgressCallback(progressId);
            }
          }
        };
      }

      const response = await apiClient.put(url, data);

      // Final progress update
      if (onProgress) {
        notifyProgress(1);
        // Unregister after completion
        if (progressId !== null) {
          unregisterProgressCallback(progressId);
        }
      }

      return response.data;
    } catch (error) {
      // Progress error state
      if (onProgress) {
        notifyProgress(1); // Still show complete to avoid stuck indicator
        if (progressId !== null) {
          unregisterProgressCallback(progressId);
        }
      }
      throw error;
    }
  },

  // PATCH request with optional progress tracking
  patch: async (url, data = {}, onProgress) => {
    // If offline and this is a critical request, queue it but still throw error
    if (!isOnline() && shouldQueueRequest('PATCH')) {
      offlineQueue.enqueue({
        method: 'PATCH',
        url,
        data,
        timestamp: Date.now()
      });

      // Still throw the error for immediate feedback, but request is queued
      const error = new Error('No internet connection');
      error.queued = true;
      throw error;
    }

    if (!isOnline()) {
      throw new Error('No internet connection');
    }

    // Register progress callback if provided
    let progressId = null;
    if (onProgress) {
      progressId = registerProgressCallback(onProgress);
      // Immediately call with 0%
      notifyProgress(0);
    }

    try {
      // Simulate progress for demonstration
      if (onProgress) {
        // Call progress at 35% after a short delay
        setTimeout(() => {
          notifyProgress(0.35);
        }, 35);

        // Call progress at 65% after another delay
        setTimeout(() => {
          notifyProgress(0.65);
        }, 105);

        // Call progress at 100% when request completes
        const originalNotifyProgress = notifyProgress;
        notifyProgress = (progress) => {
          originalNotifyProgress(progress);
          if (progress >= 1) {
            // Restore original notifyProgress
            notifyProgress = originalNotifyProgress;
            // Unregister after completion
            if (progressId !== null) {
              unregisterProgressCallback(progressId);
            }
          }
        };
      }

      const response = await apiClient.patch(url, data);

      // Final progress update
      if (onProgress) {
        notifyProgress(1);
        // Unregister after completion
        if (progressId !== null) {
          unregisterProgressCallback(progressId);
        }
      }

      return response.data;
    } catch (error) {
      // Progress error state
      if (onProgress) {
        notifyProgress(1); // Still show complete to avoid stuck indicator
        if (progressId !== null) {
          unregisterProgressCallback(progressId);
        }
      }
      throw error;
    }
  },

  // DELETE request with optional progress tracking
  delete: async (url, onProgress) => {
    // If offline and this is a critical request, queue it but still throw error
    if (!isOnline() && shouldQueueRequest('DELETE')) {
      offlineQueue.enqueue({
        method: 'DELETE',
        url,
        timestamp: Date.now()
      });

      // Still throw the error for immediate feedback, but request is queued
      const error = new Error('No internet connection');
      error.queued = true;
      throw error;
    }

    if (!isOnline()) {
      throw new Error('No internet connection');
    }

    // Register progress callback if provided
    let progressId = null;
    if (onProgress) {
      progressId = registerProgressCallback(onProgress);
      // Immediately call with 0%
      notifyProgress(0);
    }

    try {
      // Simulate progress for demonstration
      if (onProgress) {
        // Call progress at 50% after a short delay
        setTimeout(() => {
          notifyProgress(0.5);
        }, 50);

        // Call progress at 100% when request completes
        const originalNotifyProgress = notifyProgress;
        notifyProgress = (progress) => {
          originalNotifyProgress(progress);
          if (progress >= 1) {
            // Restore original notifyProgress
            notifyProgress = originalNotifyProgress;
            // Unregister after completion
            if (progressId !== null) {
              unregisterProgressCallback(progressId);
            }
          }
        };
      }

      const response = await apiClient.delete(url, {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });

      // Final progress update
      if (onProgress) {
        notifyProgress(1);
        // Unregister after completion
        if (progressId !== null) {
          unregisterProgressCallback(progressId);
        }
      }

      return response.data;
    } catch (error) {
      // Progress error state
      if (onProgress) {
        notifyProgress(1); // Still show complete to avoid stuck indicator
        if (progressId !== null) {
          unregisterProgressCallback(progressId);
        }
      }
      throw error;
    }
  },

  // Upload file with progress tracking (uses axios's built-in upload progress)
  upload: async (url, formData, onUploadProgress = null, onProgress) => {
    // If offline and this is a critical request, queue it but still throw error
    // Note: Uploads are considered critical as they represent user-generated content
    if (!isOnline() && shouldQueueRequest('POST')) { // Uploads use POST internally
      // For uploads, we need to create a special queued request
      offlineQueue.enqueue({
        method: 'UPLOAD',
        url,
        formData,
        onUploadProgress,
        timestamp: Date.now()
      });

      // Still throw the error for immediate feedback, but request is queued
      const error = new Error('No internet connection');
      error.queued = true;
      throw error;
    }

    if (!isOnline()) {
      throw new Error('No internet connection');
    }

    // Register progress callback for overall progress if provided
    let progressId = null;
    if (onProgress) {
      progressId = registerProgressCallback(onProgress);
      // Immediately call with 0%
      notifyProgress(0);
    }

    try {
      const response = await apiClient.post(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          // Call the original onUploadProgress if provided
          if (onUploadProgress) {
            onUploadProgress(progressEvent);
          }

          // Update our overall progress if we have a callback
          if (onProgress) {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            notifyProgress(percent / 100); // Convert to 0-1 range
          }
        },
      });

      // Final progress update
      if (onProgress) {
        notifyProgress(1);
        // Unregister after completion
        if (progressId !== null) {
          unregisterProgressCallback(progressId);
        }
      }

      return response.data;
    } catch (error) {
      // Progress error state
      if (onProgress) {
        notifyProgress(1); // Still show complete to avoid stuck indicator
        if (progressId !== null) {
          unregisterProgressCallback(progressId);
        }
      }
      throw error;
    }
  },
}

// Start listening for online/offline events to process the queue
offlineQueue.start();

export default apiService;
