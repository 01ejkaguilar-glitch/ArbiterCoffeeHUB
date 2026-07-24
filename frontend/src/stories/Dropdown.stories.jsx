import React from 'react';
import { ResponsiveDropdown } from '@components/responsive/Dropdown.jsx';

export default {
  title: 'Components/Dropdown',
  component: ResponsiveDropdown,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    show: { control: 'boolean' },
  },
};

export const Default = {
  render: (args) => (
    <ResponsiveDropdown show={args.show} onToggle={(show) => console.log('Dropdown toggled:', show)}>
      <ResponsiveDropdown.Toggle variant="secondary">
        Dropdown button
      </ResponsiveDropdown.Toggle>
      <ResponsiveDropdown.Menu>
        <ResponsiveDropdown.Item>Action</ResponsiveDropdown.Item>
        <ResponsiveDropdown.Item>Another action</ResponsiveDropdown.Item>
        <ResponsiveDropdown.Item>Something else here</ResponsiveDropdown.Item>
        <li role="separator" className="dropdown-divider" />
        <ResponsiveDropdown.Item>Separated link</ResponsiveDropdown.Item>
      </ResponsiveDropdown.Menu>
    </ResponsiveDropdown>
  ),
  args: {
    show: false,
  },
};

export const Open = {
  render: (args) => (
    <ResponsiveDropdown show={args.show} onToggle={(show) => console.log('Dropdown toggled:', show)}>
      <ResponsiveDropdown.Toggle variant="primary">
        Dropdown button
      </ResponsiveDropdown.Toggle>
      <ResponsiveDropdown.Menu>
        <ResponsiveDropdown.Item>Action</ResponsiveDropdown.Item>
        <ResponsiveDropdown.Item>Another action</ResponsiveDropdown.Item>
        <ResponsiveDropdown.Item>Something else here</ResponsiveDropdown.Item>
        <li role="separator" className="dropdown-divider" />
        <ResponsiveDropdown.Item>Separated link</ResponsiveDropdown.Item>
      </ResponsiveDropdown.Menu>
    </ResponsiveDropdown>
  ),
  args: {
    show: true,
  },
};

export const WithDifferentVariants = {
  render: () => (
    <div style={{ display: 'flex', gap: '16px' }}>
      <ResponsiveDropdown show={false} onToggle={(show) => console.log('Dropdown toggled:', show)}>
        <ResponsiveDropdown.Toggle variant="primary">
          Primary
        </ResponsiveDropdown.Toggle>
        <ResponsiveDropdown.Menu>
          <ResponsiveDropdown.Item>Action</ResponsiveDropdown.Item>
          <ResponsiveDropdown.Item>Another action</ResponsiveDropdown.Item>
        </ResponsiveDropdown.Menu>
      </ResponsiveDropdown>
      <ResponsiveDropdown show={false} onToggle={(show) => console.log('Dropdown toggled:', show)}>
        <ResponsiveDropdown.Toggle variant="success">
          Success
        </ResponsiveDropdown.Toggle>
        <ResponsiveDropdown.Menu>
          <ResponsiveDropdown.Item>Action</ResponsiveDropdown.Item>
          <ResponsiveDropdown.Item>Another action</ResponsiveDropdown.Item>
        </ResponsiveDropdown.Menu>
      </ResponsiveDropdown>
      <ResponsiveDropdown show={false} onToggle={(show) => console.log('Dropdown toggled:', show)}>
        <ResponsiveDropdown.Toggle variant="danger">
          Danger
        </ResponsiveDropdown.Toggle>
        <ResponsiveDropdown.Menu>
          <ResponsiveDropdown.Item>Action</ResponsiveDropdown.Item>
          <ResponsiveDropdown.Item>Another action</ResponsiveDropdown.Item>
        </ResponsiveDropdown.Menu>
      </ResponsiveDropdown>
    </div>
  ),
};