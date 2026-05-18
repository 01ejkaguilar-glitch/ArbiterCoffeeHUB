# Admin Mobile-First Responsive UI/UX Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor all admin pages to be mobile-first responsive with improved visual appeal using Brand Identity Guidelines tokens and reusable components.

**Architecture:** Create a library of responsive UI components (Button, Card, Table, Form, Modal) that automatically adapt to screen sizes using CSS Flexbox/Grid and Brand Identity Guidelines design tokens. Each admin page will be updated to use these components instead of raw Bootstrap or custom styling, ensuring consistent mobile experience and visual language.

**Tech Stack:** React, Bootstrap 5, CSS Flexbox/Grid, Brand Identity Guidelines CSS tokens, JavaScript/ES6

---

### Task 1: Create Responsive Button Component

**Files:**
- Create: `frontend/src/components/responsive/Button.jsx`
- Create: `frontend/src/components/responsive/Button.css`
- Modify: `frontend/src/styles/design-system.css` (add mobile button tokens)
- Test: Create test file if testing framework exists

- [ ] **Step 1: Write the failing test**

```javascript
// If using Jest/React Testing Library
import { render, screen } from '@testing-library/react';
import ResponsiveButton from './Button';

test('renders button with correct variant and size', () => {
  render(<ResponsiveButton variant="primary" size="lg">Test Button</ResponsiveButton>);
  const button = screen.getByRole('button', { name: /test button/i });
  expect(button).toBeInTheDocument();
  // Additional assertions for mobile responsiveness would go here
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test frontend/src/components/responsive/Button.jsx`
Expected: FAIL with "Cannot find module" or similar

- [ ] **Step 3: Write minimal implementation**

```jsx
// frontend/src/components/responsive/Button.jsx
import React from 'react';
import PropTypes from 'prop-types';
import './Button.css';

const ResponsiveButton = ({ 
  variant = 'primary', 
  size = 'md', 
  children, 
  onClick, 
  disabled = false,
  block = false,
  ...props 
}) => {
  return (
    <button 
      type="button"
      className={`btn btn-${variant} btn-${size} ${disabled ? 'disabled' : ''} ${block ? 'w-100' : ''}`}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

ResponsiveButton.propTypes = {
  variant: PropTypes.oneOf(['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'dark', 'link']),
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg']),
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func,
  disabled: PropTypes.bool,
  block: PropTypes.bool
};

export default ResponsiveButton;
```

```css
/* frontend/src/components/responsive/Button.css */
/* Base styles will come from Bootstrap and design system tokens */
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test frontend/src/components/responsive/Button.jsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add frontend/src/components/responsive/Button.jsx frontend/src/components/responsive/Button.css
git commit -m "feat: create responsive Button component with mobile-first design"
```

---

### Task 2: Create Responsive Card Component

**Files:**
- Create: `frontend/src/components/responsive/Card.jsx`
- Create: `frontend/src/components/responsive/Card.css`
- Test: Create test file if testing framework exists

- [ ] **Step 1: Write the failing test**

```javascript
import { render, screen } from '@testing-library/react';
import ResponsiveCard from './Card';

test('renders card with header, body, and footer', () => {
  render(
    <ResponsiveCard>
      <ResponsiveCard.Header>Header</ResponsiveCard.Header>
      <ResponsiveCard.Body>Body</ResponsiveCard.Body>
      <ResponsiveCard.Footer>Footer</ResponsiveCard.Footer>
    </ResponsiveCard>
  );
  expect(screen.getByText(/header/i)).toBeInTheDocument();
  expect(screen.getByText(/body/i)).toBeInTheDocument();
  expect(screen.getByText(/footer/i)).toBeInTheDocument();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test frontend/src/components/responsive/Card.jsx`
Expected: FAIL with "Cannot find module" or similar

- [ ] **Step 3: Write minimal implementation**

```jsx
// frontend/src/components/responsive/Card.jsx
import React from 'react';
import PropTypes from 'prop-types';
import './Card.css';

const ResponsiveCard = ({ 
  children, 
  className = '',
  header,
  body,
  footer,
  ...props 
}) => {
  return (
    <div 
      className={`card ${className}`}
      {...props}
    >
      {header && <div className="card-header">{header}</div>}
      <div className="card-body">{body || children}</div>
      {footer && <div className="card-footer">{footer}</div>}
    </div>
  );
};

ResponsiveCard.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  header: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
  body: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
  footer: PropTypes.oneOfType([PropTypes.string, PropTypes.element])
};

export default ResponsiveCard;

// Sub-components for semantic structure
ResponsiveCard.Header = ({ children, className, ...props }) => (
  <div className={`card-header ${className}`} {...props}>
    {children}
  </div>
);

ResponsiveCard.Body = ({ children, className, ...props }) => (
  <div className={`card-body ${className}`} {...props}>
    {children}
  </div>
);

ResponsiveCard.Footer = ({ children, className, ...props }) => (
  <div className={`card-footer ${className}`} {...props}>
    {children}
  </div>
);
```

```css
/* frontend/src/components/responsive/Card.css */
.card {
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  transition: var(--transition-base);
  overflow: hidden;
}

.card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

/* Mobile-first responsive adjustments */
@media (max-width: 768px) {
  .card {
    margin-bottom: var(--spacing-4);
  }
  
  .card-header,
  .card-body,
  .card-footer {
    padding: var(--spacing-3);
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test frontend/src/components/responsive/Card.jsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add frontend/src/components/responsive/Card.jsx frontend/src/components/responsive/Card.css
git commit -m "feat: create responsive Card component with mobile-first design"
```

---

### Task 3: Create Responsive Table Component

**Files:**
- Create: `frontend/src/components/responsive/Table.jsx`
- Create: `frontend/src/components/responsive/Table.css`
- Test: Create test file if testing framework exists

- [ ] **Step 1: Write the failing test**

```javascript
import { render, screen } from '@testing-library/react';
import ResponsiveTable from './Table';

test('renders table with headers and rows', () => {
  const columns = [{ Header: 'Name', accessor: 'name' }, { Header: 'Email', accessor: 'email' }];
  const data = [{ name: 'John Doe', email: 'john@example.com' }];
  
  render(<ResponsiveTable columns={columns} data={data} />);
  expect(screen.getByText(/name/i)).toBeInTheDocument();
  expect(screen.getByText(/email/i)).toBeInTheDocument();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test frontend/src/components/responsive/Table.jsx`
Expected: FAIL with "Cannot find module" or similar

- [ ] **Step 3: Write minimal implementation**

```jsx
// frontend/src/components/responsive/Table.jsx
import React from 'react';
import PropTypes from 'prop-types';
import './Table.css';

const ResponsiveTable = ({ 
  columns, 
  data, 
  loading = false,
  emptyMessage = 'No data found',
  ...props 
}) => {
  if (loading) {
    return <div className="table-loading">Loading...</div>;
  }

  if (!data || data.length === 0) {
    return <div className="table-empty">{emptyMessage}</div>;
  }

  // Extract column accessors
  const columnKeys = columns.map(col => col.accessor || col.Header.toLowerCase().replace(/\s+/g, '-'));

  return (
    <div className="table-responsive">
      <table className="table table-striped table-hover">
        <thead>
          <tr>
            {columns.map((col, index) => (
              <th key={index} scope="col">
                {col.Header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {columnKeys.map((key, colIndex) => (
                <td key={colIndex}>
                  {row[key] !== undefined && row[key] !== null ? row[key] : ''}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

ResponsiveTable.propTypes = {
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      Header: PropTypes.string.isRequired,
      accessor: PropTypes.string
    })
  ).isRequired,
  data: PropTypes.arrayOf(PropTypes.object),
  loading: PropTypes.bool,
  emptyMessage: PropTypes.string
};

export default ResponsiveTable;
```

```css
/* frontend/src/components/responsive/Table.css */
/* Mobile-first responsive table */
.table-responsive {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  margin-bottom: var(--spacing-4);
}

.table {
  width: 100%;
  max-width: 100%;
  margin-bottom: 1rem;
  background-color: transparent;
}

.table th,
.table td {
  padding: var(--spacing-2) var(--spacing-3);
  vertical-align: top;
  border-top: 1px solid var(--border-light);
}

.table thead th {
  vertical-align: bottom;
  border-bottom: 2px solid var(--border-dark);
}

.table tbody + tbody {
  border-top: 2px solid var(--border-dark);
}

.table-striped tbody tr:nth-of-type(odd) {
  background-color: rgba(var(--color-dark-green-rgb), 0.02);
}

.table-hover tbody tr:hover {
  background-color: rgba(var(--color-dark-green-rgb), 0.04);
  transition: var(--transition-base);
}

/* Mobile optimizations */
@media (max-width: 768px) {
  .table th,
  .table td {
    padding: var(--spacing-1) var(--spacing-2);
    font-size: 0.875rem;
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test frontend/src/components/responsive/Table.jsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add frontend/src/components/responsive/Table.jsx frontend/src/components/responsive/Table.css
git commit -m "feat: create responsive Table component with mobile-first design"
```

---

### Task 4: Create Responsive Form Component

**Files:**
- Create: `frontend/src/components/responsive/Form.jsx`
- Create: `frontend/src/components/responsive/Form.css`
- Test: Create test file if testing framework exists

- [ ] **Step 1: Write the failing test**

```javascript
import { render, screen } from '@testing-library/react';
import ResponsiveForm from './Form';

test('renders form with input and label', () => {
  render(<ResponsiveForm><label>Name</label><input type="text" /></ResponsiveForm>);
  expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
  expect(screen.getByRole('textbox')).toBeInTheDocument();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test frontend/src/components/responsive/Form.jsx`
Expected: FAIL with "Cannot find module" or similar

- [ ] **Step 3: Write minimal implementation**

```jsx
// frontend/src/components/responsive/Form.jsx
import React from 'react';
import PropTypes from 'prop-types';
import './Form.css';

const ResponsiveForm = ({ 
  children, 
  onSubmit,
  className = '',
  ...props 
}) => {
  return (
    <form 
      className={`form ${className}`}
      onSubmit={onSubmit}
      {...props}
    >
      {children}
    </form>
  );
};

ResponsiveForm.propTypes = {
  children: PropTypes.node.isRequired,
  onSubmit: PropTypes.func,
  className: PropTypes.string
};

export default ResponsiveForm;

// Form sub-components
ResponsiveForm.Group = ({ 
  children, 
  className = '',
  ...props 
}) => (
  <div className={`form-group ${className}`} {...props}>
    {children}
  </div>
);

ResponsiveForm.Label = ({ 
  children, 
  htmlFor,
  className = '',
  ...props 
}) => (
  <label 
    className={`form-label ${className}`} 
    htmlFor={htmlFor}
    {...props}
  >
    {children}
  </label>
);

ResponsiveForm.Control = ({ 
  type = 'text',
  placeholder,
  className = '',
  ...props 
}) => {
  // Map input types to appropriate elements
  const InputElement = type === 'select' ? 'select' : 
                      type === 'textarea' ? 'textarea' : 'input';
  
  return (
    <InputElement
      className={`form-control ${className}`}
      type={type === 'select' || type === 'textarea' ? undefined : type}
      placeholder={placeholder}
      {...props}
    />
  );
};

ResponsiveForm.Control.propTypes = {
  type: PropTypes.oneOf(['text', 'password', 'email', 'number', 'select', 'textarea', 'checkbox', 'radio']),
  placeholder: PropTypes.string,
  className: PropTypes.string
};

ResponsiveForm.Checkbox = ({ 
  children,
  className = '',
  ...props 
}) => (
  <div className={`form-check ${className}`} {...props}>
    <input 
      className="form-check-input"
      type="checkbox"
      {...props}
    />
    <label className="form-check-label">{children}</label>
  </div>
);

ResponsiveForm.Checkbox.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string
};

ResponsiveForm.Button = ({ 
  variant = 'primary',
  size = 'md',
  children,
  type = 'submit',
  ...props 
}) => (
  <button 
    type={type}
    className={`btn btn-${variant} btn-${size}`}
    {...props}
  >
    {children}
  </button>
);

ResponsiveForm.Button.propTypes = {
  variant: PropTypes.oneOf(['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'dark', 'link']),
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg']),
  children: PropTypes.node.isRequired,
  type: PropTypes.string
};
```

```css
/* frontend/src/components/responsive/Form.css */
/* Mobile-first form styles */
.form-group {
  margin-bottom: var(--spacing-4);
}

.form-label {
  margin-bottom: var(--spacing-1);
  font-weight: 600;
}

.form-control {
  border-radius: var(--radius-md);
  border: 1px solid var(--border-light);
  padding: var(--spacing-2) var(--spacing-3);
  font-size: 1rem;
  transition: var(--transition-base);
}

.form-control:focus {
  border-color: var(--color-dark-green);
  box-shadow: 0 0 0 3px rgba(var(--color-dark-green-rgb), 0.1);
  outline: none;
}

.form-control.is-invalid {
  border-color: var(--color-danger);
}

.form-check {
  display: block;
  min-height: 1.5rem;
  padding-left: 1.5em;
  margin-bottom: var(--spacing-2);
}

.form-check-input {
  width: 1em;
  height: 1em;
  margin-top: 0.25em;
  margin-left: -1.5em;
}

.form-check-label {
  margin-bottom: 0;
}

/* Mobile optimizations */
@media (max-width: 768px) {
  .form-control {
    padding: var(--spacing-2) var(--spacing-3);
    font-size: 0.875rem;
  }
  
  .form-group {
    margin-bottom: var(--spacing-3);
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test frontend/src/components/responsive/Form.jsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add frontend/src/components/responsive/Form.jsx frontend/src/components/responsive/Form.css
git commit -m "feat: create responsive Form component with mobile-first design"
```

---

### Task 5: Create Responsive Modal Component

**Files:**
- Create: `frontend/src/components/responsive/Modal.jsx`
- Create: `frontend/src/components/responsive/Modal.css`
- Test: Create test file if testing framework exists

- [ ] **Step 1: Write the failing test**

```javascript
import { render, screen } from '@testing-library/react';
import ResponsiveModal from './Modal';

test('renders modal with header, body, and footer', () => {
  render(
    <ResponsiveModal show={true} onHide={() => {}}>
      <ResponsiveModal.Header>Header</ResponsiveModal.Header>
      <ResponsiveModal.Body>Body</ResponsiveModal.Body>
      <ResponsiveModal.Footer>Footer</ResponsiveModal.Footer>
    </ResponsiveModal>
  );
  expect(screen.getByText(/header/i)).toBeInTheDocument();
  expect(screen.getByText(/body/i)).toBeInTheDocument();
  expect(screen.getByText(/footer/i)).toBeInTheDocument();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test frontend/src/components/responsive/Modal.jsx`
Expected: FAIL with "Cannot find module" or similar

- [ ] **Step 3: Write minimal implementation**

```jsx
// frontend/src/components/responsive/Modal.jsx
import React from 'react';
import PropTypes from 'prop-types';
import './Modal.css';

const ResponsiveModal = ({ 
  show = false,
  onHide,
  children,
  backdrop = true,
  keyboard = true,
  ...props 
}) => {
  if (!show) {
    return null;
  }

  return (
    <div 
      className={`modal ${backdrop ? 'show' : ''} d-block`}
      tabIndex="-1"
      role="dialog"
      style={{ display: 'block' }}
      {...props}
    >
      <div className="modal-dialog" role="document">
        <div className="modal-content">
          {children}
        </div>
      </div>
      
      {/* Backdrop */}
      {backdrop && (
        <div 
          className="modal-backdrop fade show"
          onClick={onHide}
        />
      )}
    </div>
  );
};

ResponsiveModal.propTypes = {
  show: PropTypes.bool,
  onHide: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
  backdrop: PropTypes.bool,
  keyboard: PropTypes.bool
};

// Sub-components for semantic structure
ResponsiveModal.Header = ({ 
  children, 
  className = '',
  closeButton = true,
  ...props 
}) => {
  return (
    <div 
      className={`modal-header ${className}`} 
      {...props}
    >
      {closeButton && (
        <button 
          type="button" 
          className="close" 
          data-dismiss="modal" 
          aria-label="Close"
          onClick={props.onHide || (() => {})}
        >
          <span aria-hidden="true">&times;</span>
        </button>
      )}
      {children}
    </div>
  );
};

ResponsiveModal.Body = ({ 
  children, 
  className = '',
  ...props 
}) => (
  <div className={`modal-body ${className}`} {...props}>
    {children}
  </div>
);

ResponsiveModal.Footer = ({ 
  children, 
  className = '',
  ...props 
}) => (
  <div className={`modal-footer ${className}`} {...props}>
    {children}
  </div>
);
```

```css
/* frontend/src/components/responsive/Modal.css */
/* Mobile-first modal styles */
.modal-dialog {
  position: relative;
  width: auto;
  margin: var(--spacing-4) auto;
  pointer-events: none;
}

.modal.fade .modal-dialog {
  transition: transform 0.3s ease-out;
  transform: translate(0, -50px);
}

.modal.show .modal-dialog {
  transform: none;
}

.modal-dialog-centered {
  display: -ms-flexbox;
  display: flex;
  -ms-flex-align: center;
  align-items: center;
  min-height: calc(100% - var(--spacing-8) * 2);
}

.modal-content {
  position: relative;
  display: -ms-flexbox;
  display: flex;
  -ms-flex-direction: column;
  flex-direction: column;
  width: 100%;
  pointer-events: auto;
  background-color: var(--color-white);
  background-clip: padding-box;
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  outline: 0;
}

.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1040;
  width: 100vw;
  height: 100vh;
  background-color: #000;
}

.modal-backdrop.fade {
  opacity: 0;
}

.modal-backdrop.show {
  opacity: 0.5;
}

.modal-header {
  display: -ms-flexbox;
  display: flex;
  -ms-flex-align: start;
  align-items: flex-start;
  -ms-flex-pack: justify;
  justify-content: space-between;
  padding: var(--spacing-4);
  border-bottom: 1px solid var(--border-light);
  border-top-left-radius: var(--radius-lg);
  border-top-right-radius: var(--radius-lg);
}

.modal-title {
  margin-bottom: 0;
  line-height: 1.5;
}

.modal-body {
  position: relative;
  -ms-flex: 1 1 auto;
  flex: 1 1 auto;
  padding: var(--spacing-4);
}

.modal-footer {
  display: -ms-flexbox;
  display: flex;
  -ms-flex-align: center;
  align-items: center;
  -ms-flex-pack: end;
  justify-content: flex-end;
  padding: var(--spacing-4);
  border-top: 1px solid var(--border-light);
  border-bottom-right-radius: var(--radius-lg);
  border-bottom-left-radius: var(--radius-lg);
}

/* Mobile optimizations */
@media (max-width: 576px) {
  .modal-dialog {
    margin: var(--spacing-3);
    margin-top: var(--spacing-3);
    margin-bottom: var(--spacing-3);
  }
  
  .modal-content {
    border-radius: var(--radius-md);
  }
  
  .modal-header,
  .modal-body,
  .modal-footer {
    padding: var(--spacing-3);
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test frontend/src/components/responsive/Modal.jsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add frontend/src/components/responsive/Modal.jsx frontend/src/components/responsive/Modal.css
git commit -m "feat: create responsive Modal component with mobile-first design"
```

---

### Task 6: Update Design System Tokens for Mobile-Specific Values

**Files:**
- Modify: `frontend/src/styles/design-system.css` (add mobile-responsive tokens)
- Modify: `frontend/src/styles/variables.css` (extend with mobile breakpoints if needed)

- [ ] **Step 1: Write the failing test**

```javascript
// Simple test to verify CSS variables are accessible
// This would typically be tested visually or via computed styles in a test environment
// For now, we'll verify the file contains expected tokens after implementation
```

- [ ] **Step 2: Run test to verify it fails**

Run: `grep -- "--spacing-mobile-" frontend/src/styles/design-system.css`
Expected: FAIL (no output)

- [ ] **Step 3: Write minimal implementation**

```css
/* frontend/src/styles/design-system.css */
/* Add mobile-specific design tokens */

/* Mobile Spacing Scale (8px base unit) */
--spacing-mobile-0: 0;
--spacing-mobile-1: 0.25rem; /* 4px */
--spacing-mobile-2: 0.5rem;  /* 8px */
--spacing-mobile-3: 0.75rem; /* 12px */
--spacing-mobile-4: 1rem;    /* 16px */
--spacing-mobile-5: 1.25rem; /* 20px */
--spacing-mobile-6: 1.5rem;  /* 24px */
--spacing-mobile-8: 2rem;    /* 32px */
--spacing-mobile-10: 2.5rem; /* 40px */
--spacing-mobile-12: 3rem;   /* 48px */
--spacing-mobile-16: 4rem;   /* 64px */

/* Mobile Typography - slightly smaller for mobile readability */
--font-size-mobile-base: 0.875rem; /* 14px */
--font-size-mobile-sm: 0.75rem;    /* 12px */
--font-size-mobile-lg: 1rem;       /* 16px */

/* Mobile Border Radius */
--radius-mobile-sm: 0.25rem;   /* 4px */
--radius-mobile-md: 0.375rem;  /* 6px */
--radius-mobile-lg: 0.5rem;    /* 8px */

/* Mobile Shadow Scale */
--shadow-mobile-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
--shadow-mobile-md: 0 1px 3px rgba(0, 0, 0, 0.1);
--shadow-mobile-lg: 0 4px 6px rgba(0, 0, 0, 0.1);

/* Mobile Transition */
--transition-mobile-base: 0.15s ease-in-out;

/* Breakpoints */
--bp-mobile: 576px;
--bp-tablet: 768px;
--bp-desktop: 992px;
--bp-wide: 1200px;
```

```css
/* frontend/src/styles/variables.css */
/* Extend existing variables with mobile breakpoints if not present */
/* Add at the end of file */
:root {
  /* Mobile-first breakpoint variables */
  --bp-mobile: 576px;
  --bp-tablet: 768px;
  --bp-desktop: 992px;
  --bp-wide: 1200px;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `grep -- "--spacing-mobile-" frontend/src/styles/design-system.css`
Expected: PASS (shows mobile spacing tokens)

- [ ] **Step 5: Commit**

```bash
git add frontend/src/styles/design-system.css frontend/src/styles/variables.css
git commit -m "feat: add mobile-responsive design tokens to design system"
```

---

### Task 7: Refactor Admin Dashboard to Use Responsive Components

**Files:**
- Modify: `frontend/src/pages/admin/AdminDashboard.jsx`
- Modify: `frontend/src/pages/admin/AdminDashboard.css` (if exists, otherwise create or update)

- [ ] **Step 1: Write the failing test**

```javascript
// Test that AdminDashboard uses ResponsiveButton instead of raw Button
// This would be implemented by checking the rendered output contains our responsive components
```

- [ ] **Step 2: Run test to verify it fails**

Run: `grep -r "import.*Button.*from.*responsive" frontend/src/pages/admin/AdminDashboard.jsx`
Expected: FAIL (no import found)

- [ ] **Step 3: Write minimal implementation**

```jsx
// Changes to make in frontend/src/pages/admin/AdminDashboard.jsx:
// 1. Update imports
// Replace:
// import { Row, Col, Card, Badge, Button } from 'react-bootstrap';
// With:
import { Row, Col, Badge } from 'react-bootstrap';
import ResponsiveButton from '../../components/responsive/Button';
import ResponsiveCard from '../../components/responsive/Card';
// Keep other imports...

// 2. Update JSX usage
// Replace:
// <Button variant="outline-secondary" size="sm" className="d-flex align-items-center gap-1">
// With:
// <ResponsiveButton variant="outline-secondary" size="sm" className="d-flex align-items-center gap-1">

// Replace:
// <Card className="admin-card h-100">
// With:
// <ResponsiveCard className="admin-card h-100">

// Similar replacements for all Button, Card, Form, etc. instances
// Apply responsive spacing and sizing classes where needed
```

- [ ] **Step 4: Run test to verify it passes**

Run: `grep -r "import.*Button.*from.*responsive" frontend/src/pages/admin/AdminDashboard.jsx`
Expected: PASS (shows the import statement)

- [ ] **Step 5: Commit**

```bash
git add frontend/src/pages/admin/AdminDashboard.jsx
git commit -m "feat: refactor AdminDashboard to use responsive components"
```

---

### Task 8: Refactor Admin Analytics to Use Responsive Components

**Files:**
- Modify: `frontend/src/pages/admin/AdminAnalytics.jsx`
- Modify: `frontend/src/pages/admin/AdminAnalytics.css`

- [ ] **Step 1: Write the failing test**

```javascript
// Test that AdminAnalytics uses ResponsiveButton, ResponsiveCard, etc.
```

- [ ] **Step 2: Run test to verify it fails**

Run: `grep -r "import.*Button.*from.*responsive" frontend/src/pages/admin/AdminAnalytics.jsx`
Expected: FAIL (no import found)

- [ ] **Step 3: Write minimal implementation**

```jsx
// Changes to make in frontend/src/pages/admin/AdminAnalytics.jsx:
// 1. Update imports
// Replace Bootstrap imports with responsive components where appropriate
import ResponsiveButton from '../../components/responsive/Button';
import ResponsiveCard from '../../components/responsive/Card';
import ResponsiveModal from '../../components/responsive/Modal';
// Keep other imports...

// 2. Update JSX usage throughout the file:
// Replace Button -> ResponsiveButton
// Replace Card -> ResponsiveCard
// Replace Modal -> ResponsiveModal
// Replace Form elements with ResponsiveForm equivalents
// Apply mobile-responsive utility classes as needed
```

- [ ] **Step 4: Run test to verify it passes**

Run: `grep -r "import.*Button.*from.*responsive" frontend/src/pages/admin/AdminAnalytics.jsx`
Expected: PASS (shows the import statement)

- [ ] **Step 5: Commit**

```bash
git add frontend/src/pages/admin/AdminAnalytics.jsx
git commit -m "feat: refactor AdminAnalytics to use responsive components"
```

---

### Task 9: Refactor Admin Employees to Use Responsive Components

**Files:**
- Modify: `frontend/src/pages/admin/AdminEmployees.jsx`
- Modify: `frontend/src/pages/admin/AdminWorkforce.css`

- [ ] **Step 1: Write the failing test**

```javascript
// Test that AdminEmployees uses responsive components
```

- [ ] **Step 2: Run test to verify it fails**

Run: `grep -r "import.*Button.*from.*responsive" frontend/src/pages/admin/AdminEmployees.jsx`
Expected: FAIL (no import found)

- [ ] **Step 3: Write minimal implementation**

```jsx
// Changes to make in frontend/src/pages/admin/AdminEmployees.jsx:
// 1. Update imports
import ResponsiveButton from '../../components/responsive/Button';
import ResponsiveCard from '../../components/responsive/Card';
import ResponsiveForm from '../../components/responsive/Form';
import ResponsiveModal from '../../components/responsive/Modal';
import ResponsiveTable from '../../components/responsive/Table';
// Keep other imports...

// 2. Update JSX usage:
// Replace Form -> ResponsiveForm
// Replace Button -> ResponsiveButton
// Replace Card -> ResponsiveCard
// Replace Table -> ResponsiveTable
// Replace Modal -> ResponsiveModal
// Update form controls to use ResponsiveForm.Control, etc.
// Apply responsive styling classes
```

- [ ] **Step 4: Run test to verify it passes**

Run: `grep -r "import.*Button.*from.*responsive" frontend/src/pages/admin/AdminEmployees.jsx`
Expected: PASS (shows the import statement)

- [ ] **Step 5: Commit**

```bash
git add frontend/src/pages/admin/AdminEmployees.jsx
git commit -m "feat: refactor AdminEmployees to use responsive components"
```

---

### Task 10: Refactor Admin Inventory to Use Responsive Components

**Files:**
- Modify: `frontend/src/pages/admin/AdminInventory.jsx`
- Modify: `frontend/src/pages/admin/AdminInventory.css`

- [ ] **Step 1: Write the failing test**

```javascript
// Test that AdminInventory uses responsive components
```

- [ ] **Step 2: Run test to verify it fails**

Run: `grep -r "import.*Button.*from.*responsive" frontend/src/pages/admin/AdminInventory.jsx`
Expected: FAIL (no import found)

- [ ] **Step 3: Write minimal implementation**

```jsx
// Changes to make in frontend/src/pages/admin/AdminInventory.jsx:
// 1. Update imports
import ResponsiveButton from '../../components/responsive/Button';
import ResponsiveCard from '../../components/responsive/Card';
import ResponsiveForm from '../../components/responsive/Form';
import ResponsiveModal from '../../components/responsive/Modal';
import ResponsiveTable from '../../components/responsive/Table';
// Keep other imports...

// 2. Update JSX usage throughout:
// Replace all form elements with ResponsiveForm equivalents
// Replace Button with ResponsiveButton
// Replace Card with ResponsiveCard
// Replace Table with ResponsiveTable (enhance existing table)
// Replace Modal with ResponsiveModal
// Apply responsive utility classes for spacing, sizing
// Ensure touch targets are appropriately sized
```

- [ ] **Step 4: Run test to verify it passes**

Run: `grep -r "import.*Button.*from.*responsive" frontend/src/pages/admin/AdminInventory.jsx`
Expected: PASS (shows the import statement)

- [ ] **Step 5: Commit**

```bash
git add frontend/src/pages/admin/AdminInventory.jsx
git commit -m "feat: refactor AdminInventory to use responsive components"
```

---

### Task 11: Refactor Admin Products to Use Responsive Components

**Files:**
- Modify: `frontend/src/pages/admin/AdminProducts.jsx`
- Modify: `frontend/src/pages/admin/AdminProducts.css`
- Modify: `frontend/src/pages/admin/components/ProductFormModal.jsx` (if used)
- Modify: `frontend/src/pages/admin/components/ProductTable.jsx` (if used)
- Modify: `frontend/src/pages/admin/components/BatchActionModal.jsx` (if used)

- [ ] **Step 1: Write the failing test**

```javascript
// Test that AdminProducts uses responsive components
```

- [ ] **Step 2: Run test to verify it fails**

Run: `grep -r "import.*Button.*from.*responsive" frontend/src/pages/admin/AdminProducts.jsx`
Expected: FAIL (no import found)

- [ ] **Step 3: Write minimal implementation**

```jsx
// Changes to make in frontend/src/pages/admin/AdminProducts.jsx:
// 1. Update imports
import ResponsiveButton from '../../components/responsive/Button';
import ResponsiveCard from '../../components/responsive/Card';
import ResponsiveForm from '../../components/responsive/Form';
import ResponsiveModal from '../../components/responsive/Modal';
import ResponsiveTable from '../../components/responsive.However, // Correct path to Table component
// Keep other imports...

// 2. Update JSX usage:
// Replace Form with ResponsiveForm in ProductFormModal
// Replace Button with ResponsiveButton throughout
// Replace Card with ResponsiveCard
// Replace Table implementations with ResponsiveTable
// Replace Modal with ResponsiveModal
// Update form controls to use ResponsiveForm sub-components
// Apply responsive spacing and sizing
// Ensure image upload controls are mobile-friendly
```

- [ ] **Step 4: Run test to verify it passes**

Run: `grep -r "import.*Button.*from.*responsive" frontend/src/pages/admin/AdminProducts.jsx`
Expected: PASS (shows the import statement)

- [ ] **Step 5: Commit**

```bash
git add frontend/src/pages/admin/AdminProducts.jsx
git commit -m "feat: refactor AdminProducts to use responsive components"
```

---

### Task 12: Refactor Remaining Admin Pages (Orders, Reports, Settings, Tasks, Users, Workforce)

**Files:**
- Modify: `frontend/src/pages/admin/AdminOrders.jsx`
- Modify: `frontend/src/pages/admin/AdminReports.jsx`
- Modify: `frontend/src/pages/admin/AdminSettings.jsx`
- Modify: `frontend/src/pages/admin/AdminTasks.jsx`
- Modify: `frontend/src/pages/admin/AdminUsers.jsx`
- Modify: `frontend/src/pages/admin/AdminWorkforce.jsx`
- And their respective CSS files and sub-components

- [ ] **Step 1: Write the failing test**

```javascript
// Test that each admin page uses responsive components
```

- [ ] **Step 2: Run test to verify it fails**

Run: `grep -r "import.*Button.*from.*responsive" frontend/src/pages/admin/AdminOrders.jsx`
Expected: FAIL (no import found)
// Repeat for each admin page

- [ ] **Step 3: Write minimal implementation**

```jsx
// For each remaining admin page, apply the same pattern:
// 1. Update imports to use responsive components
// 2. Replace Bootstrap components with responsive equivalents
// 3. Update form elements to use ResponsiveForm
// 4. Replace buttons with ResponsiveButton
// 5. Replace cards with ResponsiveCard
// 6. Replace tables with ResponsiveTable
// 7. Replace modals with ResponsiveModal
// 8. Apply responsive utility classes for spacing, sizing, and layout
// 9. Ensure all touch targets meet minimum 48x48px requirement
// 10. Test responsive behavior at various breakpoints
```

- [ ] **Step 4: Run test to verify it passes**

Run: `grep -r "import.*Button.*from.*responsive" frontend/src/pages/admin/AdminOrders.jsx`
Expected: PASS (shows the import statement)
// Repeat verification for each admin page

- [ ] **Step 5: Commit**

```bash
git add frontend/src/pages/admin/AdminOrders.jsx frontend/src/pages/admin/AdminReports.jsx frontend/src/pages/admin/AdminSettings.jsx frontend/src/pages/admin/AdminTasks.jsx frontend/src/pages/admin/AdminUsers.jsx frontend/src/pages/admin/AdminWorkforce.git
git commit -m "feat: refactor remaining admin pages to use responsive components"
```

---

### Task 13: Update Import Paths and Fix Any Broken References

**Files:**
- Various files as needed

- [ ] **Step 1: Write the failing test**

```javascript
// Test that all imports resolve correctly
// Run the application and check for compile errors
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run build`
Expected: FAIL (if there are import path issues)

- [ ] **Step 3: Write minimal implementation**

```bash
// Fix any import paths that may have been incorrect
// Ensure all component imports point to the correct locations
// Verify that CSS files are properly imported
// Check that responsive components are properly exported
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run build`
Expected: PASS (successful build)

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "fix: resolve any import issues after component refactor"
```

---

### Task 14: Final Testing and Validation

**Files:**
- Application testing

- [ ] **Step 1: Write the failing test**

```javascript
// Test responsive behavior at various breakpoints
// Test touch target sizes
// Test visual consistency with Brand Identity Guidelines
// Test all admin pages for proper functionality
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test` or manual testing
Expected: FAIL (if any issues found)

- [ ] **Step 3: Write minimal implementation**

```bash
// Manual testing checklist:
// 1. Test each admin page at mobile widths (320px, 480px, 768px)
// 2. Verify all touch targets are at least 48x48px
// 3. Verify visual consistency with Brand Identity Guidelines
// 4. Test form validation and error states
// 5. Test modal behavior on mobile
// 6. Test table horizontal scrolling on mobile
// 7. Verify loading states work correctly
// 8. Test that all functionality works as expected
// 9. Check console for any errors or warnings
// 10. Verify CSS variables are being used correctly
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test` or manual testing
Expected: PASS (all tests pass, no issues found)

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "chore: final testing and validation of responsive admin refactor"
```