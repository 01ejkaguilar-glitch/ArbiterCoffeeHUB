import React, { useState } from 'react';
import Sidebar from './Sidebar';

// Mock data for sidebar items and groups
const mockItems = [
  { path: '/dashboard', label: 'Dashboard', icon: () => null }, // Placeholder - would use actual icon component
  { path: '/products', label: 'Products', icon: () => null },
  { path: '/orders', label: 'Orders', icon: () => null },
  { path: '/inventory', label: 'Inventory', icon: () => null },
];

const mockGroups = [
  {
    label: 'Management',
    items: [
      { path: '/users', label: 'Users', icon: () => null },
      { path: '/roles', label: 'Roles', icon: () => null },
      { path: '/settings', label: 'Settings', icon: () => null },
    ],
  },
  {
    label: 'Reports',
    items: [
      { path: '/reports/sales', label: 'Sales Reports', icon: () => null },
      { path: '/reports/inventory', label: 'Inventory Reports', icon: () => null },
    ],
  },
];

export default {
  title: 'Components/Sidebar',
  component: Sidebar,
  parameters: {
    layout: 'padded',
  },
};

export const Default = {
  render: () => (
    <div style={{ width: '256px', height: '100vh', background: 'var(--color-bg-light)' }}>
      <Sidebar title="Dashboard" items={mockItems} groups={mockGroups} />
    </div>
  ),
};

export const Collapsed = {
  render: () => (
    <div style={{ width: '64px', height: '100vh', background: 'var(--color-bg-light)' }}>
      <Sidebar title="Dash" items={mockItems} groups={mockGroups} />
    </div>
  ),
};

export const MobileView = {
  render: () => {
    const [showMobile, setShowMobile] = useState(false);

    return (
      <div style={{ position: 'relative', width: '320px', height: '100vh', background: 'var(--color-bg-light)' }}>
        <button
          onClick={() => setShowMobile(!showMobile)}
          style={{
            position: 'absolute',
            top: '10px',
            left: '10px',
            padding: '8px 16px',
            background: 'var(--color-primary)',
            color: 'white',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            cursor: 'pointer'
          }}
        >
          Toggle Mobile View
        </button>
        {showMobile && (
          <div style={{
            position: 'absolute',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            background: 'var(--color-bg-light)',
            zIndex: 1000
          }}>
            <Sidebar title="Dashboard" items={mockItems} groups={mockGroups} />
          </div>
        )}
      </div>
    );
  },
};