import React from 'react';
import { ResponsiveForm } from '@components/responsive/Form.jsx';

export default {
  title: 'Components/Form',
  component: ResponsiveForm,
  parameters: {
    layout: 'centered',
  },
};

export const Default = {
  args: {
    type: 'text',
    placeholder: 'Enter text...',
    className: ''
  },
  render: (args) => (
    <div style={{ padding: '20px' }}>
      <ResponsiveForm.Control {...args} />
    </div>
  ),
};

export const WithLabel = {
  render: () => (
    <div style={{ padding: '20px' }}>
      <ResponsiveForm.Label htmlFor="example-input">Email Address</ResponsiveForm.Label>
      <ResponsiveForm.Control id="example-input" type="email" placeholder="Enter your email" />
    </div>
  ),
};

export const Invalid = {
  render: () => (
    <div style={{ padding: '20px' }}>
      <ResponsiveForm.Label htmlFor="invalid-input">Required Field</ResponsiveForm.Label>
      <ResponsiveForm.Control id="invalid-input" type="text" className="is-invalid" placeholder="This field is required" />
    </div>
  ),
};