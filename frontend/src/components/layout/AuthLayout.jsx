import React from 'react';
import { Outlet } from 'react-router-dom';

/**
 * Minimal layout for authentication pages (Login, Register, Forgot/Reset Password).
 * No Navbar, Footer, or BottomNavigation — full-screen auth experience.
 */
function AuthLayout({ children }) {
  return children || <Outlet />;
}

export default AuthLayout;
