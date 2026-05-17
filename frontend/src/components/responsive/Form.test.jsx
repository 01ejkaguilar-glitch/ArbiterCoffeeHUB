import React from 'react';
import { render, screen } from '@testing-library/react';
import ResponsiveForm from './Form';

describe('ResponsiveForm', () => {
  test('renders form with correct class', () => {
    const { container } = render(<ResponsiveForm className="custom-form" />);
    expect(container.firstChild).toHaveClass('form');
    expect(container.firstChild).toHaveClass('custom-form');
  });

  test('renders Form.Group sub-component', () => {
    const { container } = render(<ResponsiveForm.Group><p>Group content</p></ResponsiveForm.Group>);
    expect(container.firstChild).toHaveClass('form-group');
    expect(container.firstChild.textContent).toContain('Group content');
  });

  test('renders Form.Label sub-component', () => {
    const { container } = render(<ResponsiveForm.Label htmlFor="email-input">Email Address</ResponsiveForm.Label>);
    const labelElement = container.firstChild;
    expect(labelElement.tagName).toBe('LABEL');
    expect(labelElement).toHaveAttribute('for', 'email-input');
    expect(labelElement).toHaveClass('form-label');
    expect(labelElement.textContent).toBe('Email Address');
  });

  test('renders Form.Control sub-component as input', () => {
    const { container } = render(<ResponsiveForm.Control type="text" placeholder="Enter text" />);
    const input = container.firstChild;
    expect(input.tagName).toBe('INPUT');
    expect(input).toHaveClass('form-control');
    expect(input).toHaveAttribute('type', 'text');
    expect(input).toHaveAttribute('placeholder', 'Enter text');
  });

  test('renders Form.Control sub-component as select', () => {
    const { container } = render(<ResponsiveForm.Control type="select" />);
    const select = container.firstChild;
    expect(select.tagName).toBe('SELECT');
    expect(select).toHaveClass('form-control');
  });

  test('renders Form.Control sub-component as textarea', () => {
    const { container } = render(<ResponsiveForm.Control type="textarea" />);
    const textarea = container.firstChild;
    expect(textarea.tagName).toBe('TEXTAREA');
    expect(textarea).toHaveClass('form-control');
  });
});