import { useState } from 'react';

const useApiError = () => {
  const [errorInfo, setErrorInfo] = useState(null);

  const getErrorInfo = (error) => {
    // Analyze error and return appropriate message and actions
    let errorMessage = '';
    let errorActions = [];
    let errorType = 'error';

    if (!error.response) {
      // Network or connection error
      errorMessage = 'Unable to connect to the server. Please check your internet connection.';
      errorActions = [
        {
          label: 'Retry',
          onClick: () => window.location.reload()
        },
        {
          label: 'Dismiss',
          variant: 'secondary'
        }
      ];
    } else {
      // Handle other error types based on status code
      switch (error.response.status) {
        case 401:
          errorType = 'error';
          errorMessage = 'Your session has expired. Please log in again.';
          errorActions = [
            {
              label: 'Log In',
              onClick: () => window.location.href = '/login'
            }
          ];
          break;
        case 403:
          errorType = 'error';
          errorMessage = 'You do not have permission to perform this action.';
          errorActions = [
            {
              label: 'Go to Home',
              variant: 'secondary',
              onClick: () => window.location.href = '/'
            }
          ];
          break;
        case 404:
          errorType = 'error';
          errorMessage = 'The requested resource could not be found.';
          errorActions = [
            {
              label: 'Go to Home',
              variant: 'secondary',
              onClick: () => window.location.href = '/'
            }
          ];
          break;
        case 500:
          errorType = 'error';
          errorMessage = 'An internal server error occurred. Please try again later.';
          errorActions = [
            {
              label: 'Retry',
              onClick: () => window.location.reload()
            },
            {
              label: 'Report Issue',
              variant: 'outline-primary'
            }
          ];
          break;
        default:
          errorType = 'error';
          errorMessage = error.response.data?.message || 'An unexpected error occurred.';
          errorActions = [
            {
              label: 'Dismiss',
              variant: 'secondary'
            }
          ];
          break;
      }
    }

    const errorInfo = {
      type: errorType,
      message: errorMessage,
      actions: errorActions
    };

    // Update state with the computed error info
    setErrorInfo(errorInfo);
    return errorInfo;
  };

  return { errorInfo, getErrorInfo };
};

export default useApiError;