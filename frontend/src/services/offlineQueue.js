/**
 * Offline Queue Service
 * Queues critical API actions when offline and replays them when connectivity is restored
 */

import { v4 as uuidv4 } from 'uuid';

// Queue storage key
const QUEUE_STORAGE_KEY = 'arbitercoffee offlineQueue';

class OfflineQueue {
  constructor() {
    this.queue = this.loadQueue() || [];
    this.isProcessing = false;

    // Bind event listeners
    this.handleOnline = this.handleOnline.bind(this);
    this.handleOffline = this.handleOffline.bind(this);
  }

  /**
   * Load queue from localStorage
   * @returns {Array} The queued requests
   */
  loadQueue() {
    try {
      const queued = localStorage.getItem(QUEUE_STORAGE_KEY);
      return queued ? JSON.parse(queued) : [];
    } catch (error) {
      console.error('Failed to load offline queue:', error);
      return [];
    }
  }

  /**
   * Save queue to localStorage
   */
  saveQueue() {
    try {
      localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(this.queue));
    } catch (error) {
      console.error('Failed to save offline queue:', error);
    }
  }

  /**
   * Add a request to the queue
   * @param {Object} request - The request to queue
   * @param {string} request.method - HTTP method
   * @param {string} request.url - Request URL
   * @param {Object} [request.data] - Request body/data
   * @param {Object} [request.params] - Query parameters
   * @param {Object} [request.headers] - Request headers
   * @param {number} request.timestamp - When the request was queued
   * @param {number} request.retryCount - Number of retry attempts
   * @param {string} request.id - Unique identifier for the request
   */
  enqueue(request) {
    // Generate ID if not provided
    const requestWithId = {
      ...request,
      id: request.id || uuidv4(),
      timestamp: request.timestamp || Date.now(),
      retryCount: request.retryCount || 0
    };

    this.queue.push(requestWithId);
    this.saveQueue();

    console.info(`[OfflineQueue] Request queued: ${requestWithId.method} ${requestWithId.url}`);
    return requestWithId;
  }

  /**
   * Remove a request from the queue by ID
   * @param {string} requestId - The ID of the request to remove
   * @returns {boolean} True if request was removed
   */
  dequeue(requestId) {
    const initialLength = this.queue.length;
    this.queue = this.queue.filter(request => request.id !== requestId);
    const removed = this.queue.length < initialLength;

    if (removed) {
      this.saveQueue();
      console.info(`[OfflineQueue] Request dequeued: ${requestId}`);
    }

    return removed;
  }

  /**
   * Get all queued requests
   * @returns {Array} Copy of the queue
   */
  getQueue() {
    return [...this.queue];
  }

  /**
   * Clear the entire queue
   */
  clearQueue() {
    this.queue = [];
    this.saveQueue();
    console.info('[OfflineQueue] Queue cleared');
  }

  /**
   * Process the queue - attempt to send all queued requests
   * @returns {Promise} Resolves when all requests have been processed
   */
  async processQueue() {
    if (this.isProcessing || this.queue.length === 0) {
      return Promise.resolve();
    }

    this.isProcessing = true;
    console.info(`[OfflineQueue] Processing queue with ${this.queue.length} items`);

    // Process requests sequentially to maintain order
    for (let i = 0; i < this.queue.length; i++) {
      const request = this.queue[i];

      try {
        // Attempt to send the request
        await this.sendQueuedRequest(request);

        // If successful, remove from queue
        this.dequeue(request.id);

        // Decrement index since we removed an item
        i--;
      } catch (error) {
        console.warn(`[OfflineQueue] Failed to send queued request ${request.id}:`, error);

        // Increment retry count
        request.retryCount += 1;

        // If max retries exceeded, remove from queue to prevent infinite retries
        if (request.retryCount >= 3) {
          console.error(`[OfflineQueue] Max retries exceeded for request ${request.id}, removing from queue`);
          this.dequeue(request.id);
          i--;
        }
      }
    }

    this.isProcessing = false;

    // If there are still items in queue, save it
    if (this.queue.length > 0) {
      this.saveQueue();
    }

    return Promise.resolve();
  }

  /**
   * Send a queued request using the API service
   * @param {Object} request - The queued request to send
   * @returns {Promise} Resolves with the response
   */
  async sendQueuedRequest(request) {
    // Import apiService here to avoid circular dependencies
    const apiService = await import('./api.service').then(module => module.default || module);

    // Handle special upload requests
    if (request.method === 'UPLOAD') {
      // For uploads, we need to recreate the formData and call the upload method directly
      // Note: This is a simplified implementation - in a real app, you might want to
      // serialize the formData or handle it differently
      return apiService.upload(
        request.url,
        request.formData,
        request.onUploadProgress
      );
    }

    // Prepare request config
    const config = {};
    if (request.params) {
      config.params = request.params;
    }
    if (request.headers) {
      config.headers = request.headers;
    }

    // Send request based on method
    switch (request.method.toUpperCase()) {
      case 'GET':
        return apiService.get(request.url, request.params || {}, false);
      case 'POST':
        return apiService.post(request.url, request.data || {}, config);
      case 'PUT':
        return apiService.put(request.url, request.data || {}, config);
      case 'PATCH':
        return apiService.patch(request.url, request.data || {}, config);
      case 'DELETE':
        return apiService.delete(request.url, config);
      default:
        throw new Error(`Unsupported HTTP method: ${request.method}`);
    }
  }

  /**
   * Handle coming online - process the queue
   */
  handleOnline() {
    console.info('[OfflineQueue] Came online - processing queue');
    this.processQueue().catch(error => {
      console.error('[OfflineQueue] Error processing queue:', error);
    });
  }

  /**
   * Handle going offline
   */
  handleOffline() {
    console.info('[OfflineQueue] Went offline');
    // Note: We don't process queue when going offline, only when coming online
  }

  /**
   * Start listening for online/offline events
   */
  start() {
    window.addEventListener('online', this.handleOnline);
    window.addEventListener('offline', this.handleOffline);

    // If we're already online, process any existing queue
    if (navigator.onLine) {
      this.processQueue().catch(error => {
        console.error('[OfflineQueue] Error processing initial queue:', error);
      });
    }
  }

  /**
   * Stop listening for online/offline events
   */
  stop() {
    window.removeEventListener('online', this.handleOnline);
    window.removeEventListener('offline', this.handleOffline);
  }
}

// Create and export a singleton instance
const offlineQueue = new OfflineQueue();
export default offlineQueue;