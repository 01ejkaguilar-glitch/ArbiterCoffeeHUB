/**
 * Offline Queue Service Tests
 */

// Mock crypto for uuidv4 in JSDOM
if (typeof crypto === 'undefined') {
  global.crypto = {
    getRandomValues: (arr) => {
      return Array.from(arr, () => Math.floor(Math.random() * 256));
    }
  };
}

// Mock localStorage
const localStorageMock = (() => {
  let store = {};

  return {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn((key) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('OfflineQueue', () => {
  // Reset module registry before each test to get a fresh instance
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();

    // Re-apply the mocks after resetModules clears them
    jest.mock('uuid', () => {
      let counter = 0;
      return {
        v4: jest.fn(() => {
          counter++;
          return `test-uuid-${counter}`;
        })
      };
    });

    // Re-import the module after resetting modules and re-applying mocks
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const offlineQueueModule = require('./offlineQueue');
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    global.offlineQueue = offlineQueueModule.default;

    // Clear the queue and reset localStorage mock before each test
    offlineQueue.clearQueue();
    localStorageMock.clear();
  });

  describe('constructor', () => {
    it('should initialize with an empty queue', () => {
      // Since we're using a singleton, we test that the instance starts empty
      // (after clearQueue in beforeEach)
      const queue = offlineQueue.getQueue();
      expect(queue).toHaveLength(0);
    });

    it('should load queue from localStorage if available', () => {
      // For this test, we need to simulate what happens when a new instance is created
      // with data in localStorage. Since we're using a singleton, we'll manually
      // test the loadQueue method

      const mockQueue = [
        { id: 'test1', method: 'POST', url: '/test', timestamp: Date.now() },
      ];
      localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(mockQueue));

      // Call loadQueue directly to test it
      const loadedQueue = offlineQueue.loadQueue();

      expect(loadedQueue).toHaveLength(1);
      expect(loadedQueue[0].id).toBe('test1');
    });
  });

  describe('enqueue', () => {
    it('should add a request to the queue', () => {
      const request = {
        method: 'POST',
        url: '/api/test',
        data: { test: 'data' },
      };

      const queuedRequest = offlineQueue.enqueue(request);

      expect(queuedRequest).toHaveProperty('id');
      expect(queuedRequest.method).toBe('POST');
      expect(queuedRequest.url).toBe('/api/test');
      expect(queuedRequest.data).toEqual({ test: 'data' });
      expect(queuedRequest.timestamp).toBeDefined();
      expect(queuedRequest.retryCount).toBe(0);

      const queue = offlineQueue.getQueue();
      expect(queue).toHaveLength(1);
    });

    it('should generate a UUID if no ID is provided', () => {
      const request = {
        method: 'GET',
        url: '/api/test',
      };

      const queuedRequest = offlineQueue.enqueue(request);
      expect(typeof queuedRequest.id).toBe('string');
      expect(queuedRequest.id).toMatch(/^test-uuid-\d+$/);
    });

    it('should use provided ID if available', () => {
      const request = {
        id: 'custom-id-123',
        method: 'POST',
        url: '/api/test',
      };

      const queuedRequest = offlineQueue.enqueue(request);
      expect(queuedRequest.id).toBe('custom-id-123');
    });

    it('should save queue to localStorage', () => {
      const request = {
        method: 'POST',
        url: '/api/test',
      };

      offlineQueue.enqueue(request);

      // Should be called: clearQueue in beforeEach + enqueue
      expect(localStorageMock.setItem).toHaveBeenCalledTimes(2);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'arbitercoffee offlineQueue',
        expect.any(String)
      );
    });
  });

  describe('dequeue', () => {
    it('should remove a request from the queue by ID', () => {
      // Use explicit IDs to ensure test determinism
      const request = {
        id: 'explicit-id-1',
        method: 'POST',
        url: '/api/test1',
      };
      const request2 = {
        id: 'explicit-id-2',
        method: 'PUT',
        url: '/api/test2',
      };

      const queuedRequest = offlineQueue.enqueue(request);
      const queuedRequest2 = offlineQueue.enqueue(request2);

      const result = offlineQueue.dequeue(queuedRequest.id);

      expect(result).toBe(true);

      const queue = offlineQueue.getQueue();
      expect(queue).toHaveLength(1);
      expect(queue[0].id).toBe('explicit-id-2');
    });

    it('should return false if request ID is not found', () => {
      const request = {
        method: 'POST',
        url: '/api/test',
      };

      offlineQueue.enqueue(request);

      const result = offlineQueue.dequeue('non-existent-id');

      expect(result).toBe(false);

      const queue = offlineQueue.getQueue();
      expect(queue).toHaveLength(1);
    });

    it('should save queue to localStorage after removal', () => {
      const request = {
        method: 'POST',
        url: '/api/test',
      };

      const queuedRequest = offlineQueue.enqueue(request);
      offlineQueue.dequeue(queuedRequest.id);

      // Should be called: clearQueue in beforeEach + enqueue + dequeue
      expect(localStorageMock.setItem).toHaveBeenCalledTimes(3);
    });
  });

  describe('getQueue', () => {
    it('should return a copy of the queue', () => {
      const request = {
        method: 'POST',
        url: '/api/test',
      };

      offlineQueue.enqueue(request);
      const queueCopy = offlineQueue.getQueue();

      expect(queueCopy).toHaveLength(1);
      // Check that the essential properties match (excluding metadata like id, timestamp, retryCount)
      expect(queueCopy[0].method).toBe(request.method);
      expect(queueCopy[0].url).toBe(request.url);

      // Modify the copy and ensure original queue is unchanged
      queueCopy.push({ method: 'GET', url: '/api/other' });
      expect(offlineQueue.getQueue()).toHaveLength(1);
    });
  });

  describe('clearQueue', () => {
    it('should remove all requests from the queue', () => {
      offlineQueue.enqueue({ method: 'POST', url: '/api/test1' });
      offlineQueue.enqueue({ method: 'PUT', url: '/api/test2' });

      expect(offlineQueue.getQueue()).toHaveLength(2);

      offlineQueue.clearQueue();

      expect(offlineQueue.getQueue()).toHaveLength(0);
    });

    it('should save empty queue to localStorage', () => {
      offlineQueue.enqueue({ method: 'POST', url: '/api/test' });
      offlineQueue.clearQueue();

      // Should be called: clearQueue in beforeEach + enqueue + clearQueue
      expect(localStorageMock.setItem).toHaveBeenCalledTimes(3);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'arbitercoffee offlineQueue',
        '[]'
      );
    });
  });

  describe('processQueue logic', () => {
    // We'll test the core logic without actually making HTTP requests
    // by examining the queue manipulation behavior

    it('should correctly manage queue state during processing simulation', () => {
      // Add some requests
      offlineQueue.enqueue({ method: 'POST', url: '/api/test1' });
      offlineQueue.enqueue({ method: 'PUT', url: '/api/test2' });

      expect(offlineQueue.getQueue()).toHaveLength(2);

      // Simulate removing one request (what would happen after successful processing)
      const firstRequest = offlineQueue.getQueue()[0];
      offlineQueue.dequeue(firstRequest.id);

      expect(offlineQueue.getQueue()).toHaveLength(1);

      // Clear the rest
      offlineQueue.clearQueue();
      expect(offlineQueue.getQueue()).toHaveLength(0);
    });
  });

  describe('handleOnline', () => {
    it('should exist and be a function', () => {
      expect(typeof offlineQueue.handleOnline).toBe('function');
    });
  });

  describe('handleOffline', () => {
    it('should exist and be a function', () => {
      expect(typeof offlineQueue.handleOffline).toBe('function');
    });
  });

  describe('start', () => {
    it('should exist and be a function', () => {
      expect(typeof offlineQueue.start).toBe('function');
    });
  });

  describe('stop', () => {
    it('should exist and be a function', () => {
      expect(typeof offlineQueue.stop).toBe('function');
    });
  });
});