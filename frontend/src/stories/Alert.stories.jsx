import React from 'react';
import { ResponsiveAlert } from './Alert';

export default {
  title: 'Components/Alert',
  component: ResponsiveAlert,
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
    children: 'This is a primary alert',
    variant: 'primary',
  },
};

export const Secondary = {
  args: {
    children: 'This is a secondary alert',
    variant: 'secondary',
  },
};

export const Success = {
  args: {
    children: 'This is a success alert',
    variant: 'success',
  },
};

export const Danger = {
  args: {
    children: 'This is a danger alert',
    variant: 'danger',
  },
};

export const Warning = {
  args: {
    children: 'This is a warning alert',
    variant: 'warning',
  },
};

export const Info = {
  args: {
    children: 'This is an info alert',
    variant: 'info',
  },
};

export const Light = {
  args: {
    children: 'This is a light alert',
    variant: 'light',
  },
};

export const Dark = {
  args: {
    children: 'This is a dark alert',
    variant: 'dark',
  },
};

export const WithLink = {
  args: {
    children: (
      <>
        This is an alert with{' '}
        <a href="#" className="alert-link">
          a link
        </a>
        .
      </>
    ),
    variant: 'info',
  },
};

export const WithDismissButton = {
  args: {
    children: (
      <>
        This is a dismissible alert.
        <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
      </>
    ),
    variant: 'danger',
  },
};