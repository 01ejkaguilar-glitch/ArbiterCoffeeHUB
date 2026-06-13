// src/utils/feedback.js
import apiService from '../services/api.service';
import { API_ENDPOINTS } from '../config/api';

// Feedback types
export const FEEDBACK_TYPES = {
  BUG_REPORT: 'bug_report',
  FEATURE_REQUEST: 'feature_request',
  GENERAL_FEEDBACK: 'general_feedback',
  RATING: 'rating'
};

// Feedback service class
class FeedbackService {
  // Submit feedback
  static async submitFeedback(feedbackData) {
    try {
      const response = await apiService.post(
        API_ENDPOINTS.FEEDBACK.SUBMIT,
        feedbackData
      );

      return {
        success: response.success || false,
        data: response.data || null,
        error: response.error || null
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        error: error.message || 'Failed to submit feedback'
      };
    }
  }

  // Get feedback statistics (for admin)
  static async getFeedbackStats(filters = {}) {
    try {
      const response = await apiService.get(
        API_ENDPOINTS.FEEDBACK.STATS,
        { params: filters }
      );

      return {
        success: response.success || false,
        data: response.data || null,
        error: response.error || null
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        error: error.message || 'Failed to fetch feedback statistics'
      };
    }
  }
}

// Helper to create feedback object
const createFeedback = (type, details, context = {}) => {
  return {
    type,
    details: {
      ...details,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      ...context
    }
  };
};

export {
  FeedbackService,
  FEEDBACK_TYPES,
  createFeedback
};

export default FeedbackService;