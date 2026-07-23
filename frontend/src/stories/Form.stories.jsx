import React from 'react';
import { FormControl, FormLabel } from './Form';

export default {
  title: 'Components/Form',
  component: FormControl,
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
};

export const WithLabel = {
  render: (args) => (
    <div style={{ padding: '20px' }}>
      <FormLabel htmlFor="example-input">Email Address</FormLabel>
      <FormControl id="example-input" type="email" placeholder="Enter your email" />
    </div>
  ),
};

export const Invalid = {
  render: () => (
    <div style={{ padding: '20px' }}>
      <FormLabel htmlFor="invalid-input">Required Field</FormLabel>
      <FormControl id="invalid-input" type="text" isInvalid placeholder="This field is required" />
    </div>
  ),
};