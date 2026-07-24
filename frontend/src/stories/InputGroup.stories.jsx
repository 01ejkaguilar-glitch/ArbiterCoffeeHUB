import React from 'react';
import { InputGroup } from '@components/responsive/InputGroup.jsx';

export default {
  title: 'Components/InputGroup',
  component: InputGroup,
  parameters: {
    layout: 'centered',
  },
};

export const Default = {
  args: {},
};

export const WithLabel = {
  render: (args) => (
    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <label htmlFor="email-input">Email Address</label>
      <InputGroup id="email-input" placeholder="Enter your email" />
    </div>
  ),
};

export const WithPrepend = {
  render: () => (
    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <label htmlFor="price-input">Price</label>
      <div className="input-group">
        <span className="input-group-text">$</span>
        <input type="number" className="form-control" id="price-input" placeholder="0.00" />
      </div>
    </div>
  ),
};

export const WithAppend = {
  render: () => (
    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <label htmlFor="percent-input">Percentage</label>
      <div className="input-group">
        <input type="number" className="form-control" id="percent-input" placeholder="0" />
        <span className="input-group-text">%</span>
      </div>
    </div>
  ),
};