import React from 'react';
import { ResponsiveBadge } from '@components/responsive/Badge.jsx';

export default {
  title: 'Components/Badge',
  component: ResponsiveBadge,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'dark'],
    },
  },
};

export const Primary = {
  args: {
    children: 'Primary',
    variant: 'primary',
  },
};

export const Secondary = {
  args: {
    children: 'Secondary',
    variant: 'secondary',
  },
};

export const Success = {
  args: {
    children: 'Success',
    variant: 'success',
  },
};

export const Danger = {
  args: {
    children: 'Danger',
    variant: 'danger',
  },
};

export const Warning = {
  args: {
    children: 'Warning',
    variant: 'warning',
  },
};

export const Info = {
  args: {
    children: 'Info',
    variant: 'info',
  },
};

export const Light = {
  args: {
    children: 'Light',
    variant: 'light',
  },
};

export const Dark = {
  args: {
    children: 'Dark',
    variant: 'dark',
  },
};

export const WithContent = {
  args: {
    children: 'New',
    variant: 'success',
  },
};