# Public, Barista, Kitchen, Customer Pages Mobile-First Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor all non-admin pages (Public, Barista, Kitchen, Customer) to be mobile-first responsive using our established responsive component library, maintaining existing functionality while improving mobile experience.

**Architecture:** Apply our existing responsive component library (Button, Card, Table, Form, Modal, etc.) to replace direct usage of react-bootstrap and other UI libraries in non-admin pages. Maintain current visual design and functionality while ensuring mobile responsiveness through our mobile-first design tokens and touch target optimizations. Work on role-based pages first (Barista, Kitchen, Customer) then public pages.

**Tech Stack:** React, Our Responsive Component Library, CSS Flexbox/Grid, Brand Identity Guidelines CSS tokens, JavaScript/ES6

---

### Task 1: Refactor Barista Dashboard and Related Pages

**Files:**
- Modify: `src/pages/barista/BaristaDashboard.jsx`
- Modify: `src/pages/barista/BaristaShifts.jsx`  
- Modify: `src/pages/barista/CoffeeBeanControl.jsx`
- Modify: `src/pages/barista/CompletedOrders.jsx`
- Modify: `src/pages/barista/OrderQueue.jsx`
- Modify: `src/pages/barista/PosPage.jsx`
- Modify: `src/pages/barista/TodaysOriginManagement.jsx`
- Modify: `src/pages/barista/TrainingInsights.jsx`
- Modify: `src/pages/barista/components/OrderCard.jsx`
- Modify: `src/pages/barista/components/OrderDetailModal.jsx`
- Update CSS files as needed

- [x] **Step 1: Write the failing test**

```javascript
// Test that BaristaDashboard uses ResponsiveButton instead of raw Button or Link
// This would be implemented by checking the rendered output contains our responsive components
```

- [x] **Step 2: Run test to verify it fails**

Run: `grep -r "ResponsiveButton" src/pages/barista/`
Expected: FAIL (no instances found initially)

- [x] **Step 3: Write minimal implementation**

```jsx
// Changes to make in Barista pages:
// 1. Update imports - replace react-bootstrap imports with responsive components where appropriate
import ResponsiveButton from '@/components/responsive/Button';
import ResponsiveCard from '@/components/responsive/Card';
import ResponsiveForm from '@/components/responsive/Form';
import ResponsiveModal from '@/components/responsive/Modal';
import ResponsiveTable from '@/components/responsive/Table';
// Keep other imports...

// 2. Update JSX usage throughout:
// Replace Button -> ResponsiveButton
// Replace Card -> ResponsiveCard  
// Replace form elements with ResponsiveForm equivalents
// Replace Table with ResponsiveTable
// Replace Modal with ResponsiveModal
// Apply mobile-responsive utility classes as needed
// Ensure touch targets meet minimum 48x48px requirement
```

- [x] **Step 4: Run test to verify it passes**

Run: `grep -r "ResponsiveButton" src/pages/barista/`
Expected: PASS (shows ResponsiveButton import statements)

- [x] **Step 5: Commit**

```bash
git add src/pages/barista/*.jsx src/pages/barista/components/*.jsx
git commit -m "feat: refactor Barista pages to use responsive components"
```

---

### Task 2: Refactor Kitchen Pages

**Files:**
- Modify: `src/pages/kitchen/KitchenDashboard.jsx`
- Modify: `src/pages/kitchen/FoodOrderQueue.jsx`
- Modify: `src/pages/kitchen/CompletedFoodOrders.jsx`
- Update CSS files as needed

- [x] **Step 1: Write the failing test**

```javascript
// Test that KitchenDashboard uses ResponsiveButton instead of raw Button
```

- [x] **Step 2: Run test to verify it fails**

Run: `grep -r "ResponsiveButton" src/pages/kitchen/`
Expected: FAIL (no instances found initially)

- [x] **Step 3: Write minimal implementation**

```jsx
// Changes to make in Kitchen pages:
// 1. Update imports
import ResponsiveButton from '@/components/responsive/Button';
import ResponsiveCard from '@/components/responsive/Card';
// Keep other imports...

// 2. Update JSX usage:
// Replace Button -> ResponsiveButton
// Replace Card -> ResponsiveCard
// Replace any form elements with ResponsiveForm
// Apply responsive utility classes
```

- [x] **Step 4: Run test to verify it passes**

Run: `grep -r "ResponsiveButton" src/pages/kitchen/`
Expected: PASS (shows ResponsiveButton import statements)

- [x] **Step 5: Commit**

```bash
git add src/pages/kitchen/*.jsx
git commit -m "feat: refactor Kitchen pages to use responsive components"
```

---

### Task 3: Refactor Customer Pages

**Files:**
- Modify: `src/pages/customer/CustomerDashboard.jsx`
- Modify: `src/pages/customer/CustomerProfile.jsx`
- Modify: `src/pages/customer/OrderHistory.jsx`
- Modify: `src/pages/customer/OrderDetailPage.jsx`
- Modify: `src/pages/customer/CartPage.jsx`
- Modify: `src/pages/customer/CheckoutPage.jsx`
- Modify: `src/pages/customer/CustomerInsightsPage.jsx`
- Update CSS files as needed

- [x] **Step 1: Write the failing test**

```javascript
// Test that CustomerDashboard uses ResponsiveButton instead of react-bootstrap Button
```

- [x] **Step 2: Run test to verify it fails**

Run: `grep -r "ResponsiveButton" src/pages/customer/`
Expected: FAIL (no instances found initially)

- [x] **Step 3: Write minimal implementation**

```jsx
// Changes to make in Customer pages:
// 1. Update imports - replace react-bootstrap imports
import { Container, Spinner } from 'react-bootstrap'; // Keep these for layout
import ResponsiveButton from '@/components/responsive/Button';
import ResponsiveCard from '@/components/responsive/Card';
import ResponsiveForm from '@/components/responsive/Form';
import ResponsiveModal from '@/components/responsive/Modal';
// Keep other imports like AreaMetricChart, StatusBadge, etc.

// 2. Update JSX usage:
// Replace Button -> ResponsiveButton (except where react-bootstrap specifics needed)
// Replace Card -> ResponsiveCard
// Replace form elements with ResponsiveForm.Control, ResponsiveForm.Group, etc.
// Replace Modal with ResponsiveModal
// Apply responsive spacing and utility classes
```

- [x] **Step 4: Run test to verify it passes**

Run: `grep -r "ResponsiveButton" src/pages/customer/`
Expected: PASS (shows ResponsiveButton import statements)

- [x] **Step 5: Commit**

```bash
git add src/pages/customer/*.jsx
git commit -m "feat: refactor Customer pages to use responsive components"
```

---

### Task 4: Refactor Public Pages

**Files:**
- Modify: `src/pages/public/HomePage.jsx` (completed)
- Modify: `src/pages/public/AboutPage.jsx` (completed)
- Modify: `src/pages/public/AnnouncementsPage.jsx` (completed)
- Modify: `src/pages/public/AnnouncementDetailPage.jsx` (completed)
- Modify: `src/pages/public/ContactPage.jsx` (completed)
- Modify: `src/pages/public/ProductDetailPage.jsx` (completed)
- Modify: `src/pages/public/ProductsPage.jsx` (completed)
- Modify: `src/pages/public/InquiriesPage.jsx` (already refactored)
- Modify: `src/pages/public/PrivacyPage.jsx` (completed)
- Modify: `src/pages/public/TermsPage.jsx` (completed)
- Update CSS files as needed

- [x] **Step 1: Write the failing test**

```javascript
// Test that HomePage uses ResponsiveButton instead of react-bootstrap Button
```

- [x] **Step 2: Run test to verify it fails**

Run: `grep -r "ResponsiveButton" src/pages/public/`
Expected: FAIL (no instances found initially)

- [x] **Step 3: Write minimal implementation**

```jsx
// Changes to make in Public pages:
// 1. Update imports
import { Container, Row, Col } from 'react-bootstrap'; // Keep grid system
import ResponsiveButton from '@/components/responsive/Button';
import ResponsiveCard from '@/components/responsive/Card';
// Keep other imports like SEO, StructuredData, etc.

// 2. Update JSX usage:
// Replace Button -> ResponsiveButton
// Replace any card-like divs with ResponsiveCard
// Apply responsive utility classes for spacing
// Ensure mobile-optimized touch targets
```

- [x] **Step 4: Run test to verify it passes**

Run: `grep -r "ResponsiveButton" src/pages/public/`
Expected: PASS (shows ResponsiveButton import statements)

- [x] **Step 5: Commit**

```bash
git add src/pages/public/*.jsx
git commit -m "feat: refactor Public pages to use responsive components"
```

---

### Task 5: Refactor Auth Pages

**Files:**
- Modify: `src/pages/auth/LoginPage.jsx`
- Modify: `src/pages/auth/RegisterPage.jsx`
- Modify: `src/pages/auth/ForgotPasswordPage.jsx`
- Modify: `src/pages/auth/ResetPasswordPage.jsx`
- Update CSS files as needed

- [x] **Step 1: Write the failing test**

```javascript
// Test that LoginPage uses ResponsiveButton and ResponsiveForm
```

- [x] **Step 2: Run test to verify it fails**

Run: `grep -r "ResponsiveButton" src/pages/auth/`
Expected: FAIL (no instances found initially)

- [x] **Step 3: Write minimal implementation**

```jsx
// Changes to make in Auth pages:
// 1. Update imports
import ResponsiveButton from '@/components/responsive/Button';
import ResponsiveForm from '@/components/responsive/Form';
import ResponsiveCard from '@/components/responsive/Card';
// Keep other imports...

// 2. Update JSX usage:
// Replace form elements with ResponsiveForm
// Replace Button -> ResponsiveButton
// Replace containers/cards with ResponsiveCard
// Apply responsive utility classes
```

- [x] **Step 4: Run test to verify it passes**

Run: `grep -r "ResponsiveButton" src/pages/auth/`
Expected: PASS (shows ResponsiveButton import statements)

- [x] **Step 5: Commit**

```bash
git add src/pages/auth/*.jsx
git commit -m "feat: refactor Auth pages to use responsive components"
```

---

### Task 6: Refactor Notification Pages

**Files:**
- Modify: `src/pages/notifications/NotificationCenter.jsx` (already refactored)
- Modify: `src/pages/notifications/NotificationPreferences.jsx` (completed)
- Update CSS files as needed

- [x] **Step 1: Write the failing test**

```javascript
// Test that NotificationCenter uses ResponsiveButton and ResponsiveCard
```

- [x] **Step 2: Run test to verify it fails**

Run: `grep -r "ResponsiveButton" src/pages/notifications/`
Expected: FAIL (no instances found initially)

- [x] **Step 3: Write minimal implementation**

```jsx
// Changes to make in Notification pages:
// 1. Update imports
import ResponsiveButton from '@/components/responsive/Button';
import ResponsiveCard from '@/components/responsive/Card';
// Keep other imports...

// 2. Update JSX usage:
// Replace Button -> ResponsiveButton
// Replace card-like divs with ResponsiveCard
// Apply responsive utility classes
```

- [x] **Step 4: Run test to verify it passes**

Run: `grep -r "ResponsiveButton" src/pages/notifications/`
Expected: PASS (shows ResponsiveButton import statements)

- [x] **Step 5: Commit**

```bash
git add src/pages/notifications/*.jsx
git commit -m "feat: refactor Notification pages to use responsive components"
```

---

### Task 7: Update Design System for Additional Mobile Tokens (if needed)

**Files:**
- Modify: `src/styles/design-system.css` (add any missing mobile-responsive tokens)
- Modify: `src/styles/variables.css` (extend with any missing mobile breakpoints)

- [x] **Step 1: Write the failing test**

```javascript
// Test that all needed mobile design tokens exist
```

- [x] **Step 2: Run test to verify it fails**

Run: `grep -- "--spacing-mobile-" src/styles/design-system.css`
Expected: PASS (should already exist from admin refactor)

- [x] **Step 3: Write minimal implementation**

```css
/* Add any missing mobile tokens if discovered during implementation */
/* Mobile-specific utilities for components if needed */
```

- [x] **Step 4: Run test to verify it passes**

Run: `grep -- "--spacing-mobile-" src/styles/design-system.css`
Expected: PASS

- [x] **Step 5: Commit**

```bash
git add src/styles/design-system.css src/styles/variables.css
git commit -m "feat: ensure design system has all needed mobile tokens"
```

---

### Task 8: Update Import Paths and Fix Any Broken References

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

### Task 9: Final Testing and Validation

**Files:**
- Application testing

- [ ] **Step 1: Write the failing test**

```javascript
// Test responsive behavior at various breakpoints
// Test touch target sizes (minimum 48x48px)
// Test visual consistency with Brand Identity Guidelines
// Test all refactored pages for proper functionality
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test` or manual testing
Expected: FAIL (if any issues found)

- [ ] **Step 3: Write minimal implementation**

```bash
// Manual testing checklist:
// 1. Test each refactored page at mobile widths (320px, 480px, 768px)
// 2. Verify all touch targets are at least 48x48px
// 3. Verify visual consistency with Brand Identity Guidelines
// 4. Test form validation and error states
// 5. Test modal behavior on mobile
// 6. Verify loading states work correctly
// 7. Test that all functionality works as expected
// 8. Check console for any errors or warnings
// 9. Verify CSS variables are being used correctly
// 10. Test touch gestures and interactions
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test` or manual testing
Expected: PASS (all tests pass, no issues found)

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "chore: final testing and validation of non-admin mobile-first refactor"
```