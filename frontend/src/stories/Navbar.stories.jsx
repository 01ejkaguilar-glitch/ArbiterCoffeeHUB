import React from 'react';
import { Navbar } from '@components/layout/Navbar.jsx';

export default {
  title: 'Components/Navbar',
  component: Navbar,
  parameters: {
    layout: 'centered',
  },
};

export const Default = {
  render: () => (
    <Navbar />
  ),
};

export const Mobile = {
  render: () => (
    <div style={{ width: '320px', border: '1px solid #ddd', padding: '10px' }}>
      <Navbar variant="mobile" />
    </div>
  ),
};