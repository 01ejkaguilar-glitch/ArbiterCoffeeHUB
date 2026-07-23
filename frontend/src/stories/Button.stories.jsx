import React from 'react';
import { Button } from './Button';

export default {
  title: 'Components/Button',
  component: Button,
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'dark', 'link'],
    },
    size: {
      control: { type: 'select' },
      options: ['xs', 'sm', 'md', 'lg'],
    },
  },
};

export const Primary = {
  args: {
    children: 'Primary Button',
    variant: 'primary',
  },
};

export const Secondary = {
  args: {
    children: 'Secondary Button',
    variant: 'secondary',
  },
};

export const Sizes = {
  render: (args) => (
    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
      <Button variant="primary" size="xs" {...args}>
        Extra Small
      </Button>
      <Button variant="primary" size="sm" {...args}>
        Small
      </Button>
      <Button variant="primary" size="md" {...args}>
        Medium
      </Button>
      <Button variant="primary" size="lg" {...args}>
        Large
      </Button>
    </div>
  ),
  args: {
    children: 'Button',
  },
};

export const Variants = {
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
      <button className="btn btn-primary">Primary</button>
      <button className="btn btn-secondary">Secondary</button>
      <button className="btn btn-success">Success</button>
      <button className="btn btn-danger">Danger</button>
      <button className="btn btn-warning">Warning</button>
      <button className="btn btn-info">Info</button>
      <button className="btn btn-light">Light</button>
      <button className="btn btn-dark">Dark</button>
      <button className="btn btn-link">Link</button>
    </div>
  ),
};

export const WithIcon = {
  args: {
    children: (
      <>
        <i className="me-2 fas fa-plus" /> Add Item
      </>
    ),
    variant: 'primary',
  },
};