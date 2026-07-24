import React from 'react';
import { ResponsiveListGroup, ResponsiveListGroupItem } from '@components/responsive/ListGroup.jsx';

export default {
  title: 'Components/ListGroup',
  component: ResponsiveListGroup,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: [null, 'flush'],
    },
  },
};

export const Default = {
  render: (args) => (
    <ResponsiveListGroup variant={args.variant}>
      <ResponsiveListGroupItem>Item 1</ResponsiveListGroupItem>
      <ResponsiveListGroupItem>Item 2</ResponsiveListGroupItem>
      <ResponsiveListGroupItem>Item 3</ResponsiveListGroupItem>
    </ResponsiveListGroup>
  ),
  args: {
    variant: null,
  },
};

export const Flush = {
  render: (args) => (
    <ResponsiveListGroup variant={args.variant}>
      <ResponsiveListGroupItem>Item 1</ResponsiveListGroupItem>
      <ResponsiveListGroupItem>Item 2</ResponsiveListGroupItem>
      <ResponsiveListGroupItem>Item 3</ResponsiveListGroupItem>
    </ResponsiveListGroup>
  ),
  args: {
    variant: 'flush',
  },
};

export const WithCustomContent = {
  render: () => (
    <ResponsiveListGroup>
      <ResponsiveListGroupItem>
        <div className="d-flex w-100 justify-content-between">
          <h5 className="mb-1">List group item heading</h5>
          <small className="text-muted">3 days ago</small>
        </div>
        <p className="mb-1">Some placeholder content in a paragraph.</p>
        <small>And some small print.</small>
      </ResponsiveListGroupItem>
      <ResponsiveListGroupItem>
        <div className="d-flex w-100 justify-content-between">
          <h5 className="mb-1">List group item heading</h5>
          <small className="text-muted">3 days ago</small>
        </div>
        <p className="mb-1">Some placeholder content in a paragraph.</p>
        <small>And some small print.</small>
      </ResponsiveListGroupItem>
    </ResponsiveListGroup>
  ),
};