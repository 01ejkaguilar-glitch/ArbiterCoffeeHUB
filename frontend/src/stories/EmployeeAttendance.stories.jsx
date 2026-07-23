import React from 'react';
import EmployeeAttendance from './EmployeeAttendance';

// Mock the useToast hook
const useToast = () => {
  const showToast = () => {};
  const clearToast = () => {};
  return { toast: null, showToast, clearToast };
};

// Mock the DEFAULT_THEME
const DEFAULT_THEME = {
  primary: '#006837',
  tint: '#e8f5e9',
  tintBorder: '#c8e6c9',
};

// Mock the apiService
jest.mock('../../services/api.service', () => ({
  get: jest.fn().mockResolvedValue({ data: { data: {} } }),
  post: jest.fn().mockResolvedValue({ data: { data: {} } }),
}));

export default {
  title: 'Components/EmployeeAttendance',
  component: EmployeeAttendance,
  parameters: {
    layout: 'padded',
  },
};

export const Default = {
  render: () => (
    <div style={{ padding: '20px', background: '#fafafa' }}>
      {/* We need to mock the hooks and context used by the component */}
      {/* Since we cannot easily mock the hooks in this story, we'll rely on the mocks above */}
      <EmployeeAttendance />
    </div>
  ),
};