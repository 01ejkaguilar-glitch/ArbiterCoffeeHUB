// src/context/FeedbackModalContext.js
import React, { createContext, useContext, useState } from 'react';

const FeedbackModalContext = createContext();

// Provider component
export const FeedbackModalProvider = ({ children }) => {
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  const toggleFeedbackModal = () => {
    setShowFeedbackModal(!showFeedbackModal);
  };

  const showFeedback = () => setShowFeedbackModal(true);
  const hideFeedback = () => setShowFeedbackModal(false);

  return (
    <FeedbackModalContext.Provider value={{
      showFeedbackModal,
      toggleFeedbackModal,
      showFeedback,
      hideFeedback
    }}>
      {children}
    </FeedbackModalContext.Provider>
  );
};

// Hook to use the context
export const useFeedbackModal = () => {
  const context = useContext(FeedbackModalContext);
  if (!context) {
    throw new Error('useFeedbackModal must be used within a FeedbackModalProvider');
  }
  return context;
};

export default FeedbackModalContext;