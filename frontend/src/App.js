import React, { Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useParams } from 'react-router-dom';
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import { AnimatePresence, motion } from 'framer-motion';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { NotificationCenterProvider } from './context/NotificationContext';
import { NotificationProvider } from './components/common/NotificationSystem';
import { ToastProvider } from './components/animations/Toast';
import LoadingFallback from './components/common/LoadingFallback';
import ErrorBoundary from './components/common/ErrorBoundary';
import FeedbackModal from './components/common/FeedbackModal';
import DashboardRedirect from './components/common/DashboardRedirect';
import { FeedbackModalProvider } from './context/FeedbackModalContext';
import EmployeeInventory, { KITCHEN_INVENTORY_TYPES } from './components/workforce/EmployeeInventory';

// Styles loaded in index.js (bootstrap -> variables -> overrides -> utilities)

// Layouts and Pages
import PublicLayout from './components/layout/PublicLayout';
import HomePage from './pages/public/HomePage';
import AboutPage from './pages/public/AboutPage';
import ContactPage from './pages/public/ContactPage';
import AnnouncementsPage from './pages/public/AnnouncementsPage';
import AnnouncementDetailPage from './pages/public/AnnouncementDetailPage';
import InquiriesPage from './pages/public/InquiriesPage';
import ProductsPage from './pages/public/ProductsPage';
import ProductDetailPage from './pages/public/ProductDetailPage';
import PrivacyPage from './pages/public/PrivacyPage';
import TermsPage from './pages/public/TermsPage';

import AuthLayout from './components/layout/AuthLayout';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';

import CustomerLayout from './components/layout/CustomerLayout';
import CustomerDashboard from './pages/customer/CustomerDashboard';
import CustomerProfile from './pages/customer/CustomerProfile';
import OrderHistory from './pages/customer/OrderHistory';
import OrderDetailPage from './pages/customer/OrderDetailPage';
import CartPage from './pages/customer/CartPage';
import CheckoutPage from './pages/customer/CheckoutPage';
import CustomerInsightsPage from './pages/customer/CustomerInsightsPage';

import AdminLayout from './components/layout/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminOrders from './pages/admin/AdminOrders';
import AdminUsers from './pages/admin/AdminUsers';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminInventory from './pages/admin/AdminInventory';
import AdminReports from './pages/admin/AdminReports';
import AdminCoffeeBeans from './pages/admin/AdminCoffeeBeans';
import AdminEmployees from './pages/admin/AdminEmployees';
import AdminAttendance from './pages/admin/AdminAttendance';
import AdminTasks from './pages/admin/AdminTasks';
import AdminShifts from './pages/admin/AdminShifts';
import AdminLeaveRequests from './pages/admin/AdminLeaveRequests';
import AdminPerformance from './pages/admin/AdminPerformance';
import AdminSettings from './pages/admin/AdminSettings';

import BaristaLayout from './components/layout/BaristaLayout';
import BaristaDashboard from './pages/barista/BaristaDashboard';
import OrderQueue from './pages/barista/OrderQueue';
import CoffeeBeanControl from './pages/barista/CoffeeBeanControl';
import TrainingInsights from './pages/barista/TrainingInsights';
import CompletedOrders from './pages/barista/CompletedOrders';
import TodaysOriginManagement from './pages/barista/TodaysOriginManagement';
import InventoryChecklist from './pages/barista/InventoryChecklist';
import PosPage from './pages/barista/PosPage';
import BaristaAttendance from './pages/barista/BaristaAttendance';
import MyTasks from './pages/barista/MyTasks';
import MyShifts from './pages/barista/MyShifts';
import LeaveRequest from './pages/barista/LeaveRequest';
import MyPerformance from './pages/barista/MyPerformance';

import KitchenLayout from './components/layout/KitchenLayout';
import KitchenDashboard from './pages/kitchen/KitchenDashboard';
import FoodOrderQueue from './pages/kitchen/FoodOrderQueue';
import CompletedFoodOrders from './pages/kitchen/CompletedFoodOrders';
import KitchenAttendance from './pages/kitchen/KitchenAttendance';
import KitchenMyTasks from './pages/kitchen/KitchenMyTasks';
import KitchenMyShifts from './pages/kitchen/KitchenMyShifts';
import KitchenLeaveRequest from './pages/kitchen/KitchenLeaveRequest';
import KitchenMyPerformance from './pages/kitchen/KitchenMyPerformance';

import NotFound from './pages/NotFound';

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      refetchInterval: 90 * 1000,
      refetchIntervalInBackground: false,
    },
  },
});

const routeRedirects = [
  { path: '/customer', to: '/customer/dashboard' },
  { path: '/orders', to: '/customer/orders' },
  { path: '/cart', to: '/customer/cart' },
  { path: '/profile', to: '/customer/profile' },
  { path: '/checkout', to: '/customer/checkout' },
  { path: '/barista/dashboard', to: '/barista' },
  { path: '/barista/orders', to: '/barista/order-queue' },
  { path: '/barista/beans', to: '/barista/coffee-bean-control' },
  { path: '/barista/completed', to: '/barista/completed-orders' },
  { path: '/barista/featured-origins', to: '/barista/today-origin' },
  { path: '/barista/inventory', to: '/barista/inventory-checklist' },
  { path: '/barista/training', to: '/barista/training-insights' },
  { path: '/barista/tasks', to: '/barista/my-tasks' },
  { path: '/barista/shifts', to: '/barista/my-shifts' },
  { path: '/barista/performance', to: '/barista/my-performance' },
  { path: '/kitchen/dashboard', to: '/kitchen' },
  { path: '/kitchen/orders', to: '/kitchen/food-order-queue' },
  { path: '/kitchen/completed', to: '/kitchen/completed-food-orders' },
  { path: '/kitchen/tasks', to: '/kitchen/my-tasks' },
  { path: '/kitchen/shifts', to: '/kitchen/my-shifts' },
  { path: '/kitchen/performance', to: '/kitchen/my-performance' },
];

function CustomerOrderRedirect() {
  const { id } = useParams();

  return <Navigate to={`/customer/orders/${id}`} replace />;
}

function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <Router>
          <AuthProvider>
            <CartProvider>
              <NotificationCenterProvider>
                <ToastProvider>
                  <NotificationProvider>
                    <FeedbackModalProvider>
                      <ErrorBoundary>
                        <Suspense fallback={<LoadingFallback />}>
                          <AnimatedRoutes />
                        </Suspense>
                        <FeedbackModal />
                      </ErrorBoundary>
                    </FeedbackModalProvider>
                  </NotificationProvider>
                </ToastProvider>
              </NotificationCenterProvider>
            </CartProvider>
          </AuthProvider>
        </Router>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

function AnimatedRoutes() {
  const location = useLocation();
  const queryClient = useQueryClient();

  useEffect(() => {
    const handleFocus = () => {
      queryClient.refetchQueries({ type: 'active' });
    };

    const handleOnline = () => {
      queryClient.refetchQueries({ type: 'active' });
    };

    window.addEventListener('focus', handleFocus);
    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('online', handleOnline);
    };
  }, [queryClient]);

  useEffect(() => {
    queryClient.refetchQueries({ type: 'active' });
  }, [location.pathname, queryClient]);

  // Helper function to determine route section
  const getRouteSection = (pathname) => {
    if (pathname.startsWith('/admin')) return 'admin';
    if (pathname.startsWith('/barista')) return 'barista';
    if (pathname.startsWith('/kitchen')) return 'kitchen';
    if (pathname.startsWith('/customer') || pathname.startsWith('/orders') || pathname === '/cart' || pathname === '/profile' || pathname === '/checkout') return 'customer';
    if (pathname.startsWith('/auth') || pathname === '/login' || pathname === '/register' || pathname === '/forgot-password' || pathname === '/reset-password') return 'auth';
    if (pathname.startsWith('/products') || pathname === '/' || pathname === '/about' || pathname === '/announcements' || pathname === '/inquiries' || pathname === '/contact') return 'public';
    return 'public'; // default
  };

  // Define animation variants for different sections
  const sectionVariants = {
    public: {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.43, 0.13, 0.23, 0.96] } },
      exit: { opacity: 0, y: -20, transition: { duration: 0.3, ease: [0.43, 0.13, 0.23, 0.96] } }
    },
    customer: {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.43, 0.13, 0.23, 0.96] } },
      exit: { opacity: 0, y: -20, transition: { duration: 0.3, ease: [0.43, 0.13, 0.23, 0.96] } }
    },
    auth: {
      initial: { opacity: 0, scale: 0.9 },
      animate: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: [0.43, 0.13, 0.23, 0.96] } },
      exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2, ease: [0.43, 0.13, 0.23, 0.96] } }
    },
    admin: {
      initial: { opacity: 0, x: -20 },
      animate: { opacity: 1, x: 0, transition: { duration: 0.3, ease: [0.43, 0.13, 0.23, 0.96] } },
      exit: { opacity: 0, x: 20, transition: { duration: 0.2, ease: [0.43, 0.13, 0.23, 0.96] } }
    },
    barista: {
      initial: { opacity: 0, x: 20 },
      animate: { opacity: 1, x: 0, transition: { duration: 0.3, ease: [0.43, 0.13, 0.23, 0.96] } },
      exit: { opacity: 0, x: -20, transition: { duration: 0.2, ease: [0.43, 0.13, 0.23, 0.96] } }
    },
    kitchen: {
      initial: { opacity: 0, scale: 0.95 },
      animate: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: [0.43, 0.13, 0.23, 0.96] } },
      exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2, ease: [0.43, 0.13, 0.23, 0.96] } }
    }
  };

  // Get current route section

  // Function to get route variants for a given path
  const getRouteVariants = (path) => {
    const section = getRouteSection(path);
    return sectionVariants[section] || sectionVariants.public;
  };

  return (
    <AnimatePresence mode="wait">
      <Routes location={location}>
        {/* Public Routes */}
        <Route
          path="/"
          element={
            <motion.div
              variants={getRouteVariants('/')}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <PublicLayout>
                <HomePage />
              </PublicLayout>
            </motion.div>
          }
        />
        <Route
          path="/about"
          element={
            <motion.div
              variants={getRouteVariants('/about')}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <PublicLayout>
                <AboutPage />
              </PublicLayout>
            </motion.div>
          }
        />
        <Route
          path="/contact"
          element={
            <motion.div
              variants={getRouteVariants('/contact')}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <PublicLayout>
                <ContactPage />
              </PublicLayout>
            </motion.div>
          }
        />
        <Route
          path="/announcements"
          element={
            <motion.div
              variants={getRouteVariants('/announcements')}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <PublicLayout>
                <AnnouncementsPage />
              </PublicLayout>
            </motion.div>
          }
        />
        <Route
          path="/announcements/:id"
          element={
            <motion.div
              variants={getRouteVariants('/announcements/:id')}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <PublicLayout>
                <AnnouncementDetailPage />
              </PublicLayout>
            </motion.div>
          }
        />
        <Route
          path="/inquiries"
          element={
            <motion.div
              variants={getRouteVariants('/inquiries')}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <PublicLayout>
                <InquiriesPage />
              </PublicLayout>
            </motion.div>
          }
        />
        <Route
          path="/products"
          element={
            <motion.div
              variants={getRouteVariants('/products')}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <PublicLayout>
                <ProductsPage />
              </PublicLayout>
            </motion.div>
          }
        />
        <Route
          path="/products/:id"
          element={
            <motion.div
              variants={getRouteVariants('/products/:id')}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <PublicLayout>
                <ProductDetailPage />
              </PublicLayout>
            </motion.div>
          }
        />
        <Route
          path="/privacy"
          element={
            <motion.div
              variants={getRouteVariants('/privacy')}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <PublicLayout>
                <PrivacyPage />
              </PublicLayout>
            </motion.div>
          }
        />
        <Route
          path="/terms"
          element={
            <motion.div
              variants={getRouteVariants('/terms')}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <PublicLayout>
                <TermsPage />
              </PublicLayout>
            </motion.div>
          }
        />

        {/* Auth Routes */}
        <Route
          path="/login"
          element={
            <motion.div
              variants={getRouteVariants('/login')}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <AuthLayout>
                <LoginPage />
              </AuthLayout>
            </motion.div>
          }
        />
        <Route
          path="/register"
          element={
            <motion.div
              variants={getRouteVariants('/register')}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <AuthLayout>
                <RegisterPage />
              </AuthLayout>
            </motion.div>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <motion.div
              variants={getRouteVariants('/forgot-password')}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <AuthLayout>
                <ForgotPasswordPage />
              </AuthLayout>
            </motion.div>
          }
        />
        <Route
          path="/reset-password"
          element={
            <motion.div
              variants={getRouteVariants('/reset-password')}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <AuthLayout>
                <ResetPasswordPage />
              </AuthLayout>
            </motion.div>
          }
        />

        {/* Customer Routes */}
        <Route
          path="/customer/dashboard"
          element={
            <motion.div
              variants={getRouteVariants('/customer/dashboard')}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <CustomerLayout>
                <CustomerDashboard />
              </CustomerLayout>
            </motion.div>
          }
        />
        <Route
          path="/customer"
          element={<Navigate to="/customer/dashboard" replace />}
        />
        <Route
          path="/customer/profile"
          element={
            <motion.div
              variants={getRouteVariants('/customer/profile')}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <CustomerLayout>
                <CustomerProfile />
              </CustomerLayout>
            </motion.div>
          }
        />
        <Route
          path="/customer/orders"
          element={
            <motion.div
              variants={getRouteVariants('/customer/orders')}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <CustomerLayout>
                <OrderHistory />
              </CustomerLayout>
            </motion.div>
          }
        />
        <Route
          path="/customer/orders/:id"
          element={
            <motion.div
              variants={getRouteVariants('/customer/orders/:id')}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <CustomerLayout>
                <OrderDetailPage />
              </CustomerLayout>
            </motion.div>
          }
        />
        <Route
          path="/orders/:id"
          element={<CustomerOrderRedirect />}
        />
        <Route
          path="/customer/cart"
          element={
            <motion.div
              variants={getRouteVariants('/customer/cart')}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <CustomerLayout>
                <CartPage />
              </CustomerLayout>
            </motion.div>
          }
        />
        <Route
          path="/customer/checkout"
          element={
            <motion.div
              variants={getRouteVariants('/customer/checkout')}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <CustomerLayout>
                <CheckoutPage />
              </CustomerLayout>
            </motion.div>
          }
        />
        <Route
          path="/customer/insights"
          element={
            <motion.div
              variants={getRouteVariants('/customer/insights')}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <CustomerLayout>
                <CustomerInsightsPage />
              </CustomerLayout>
            </motion.div>
          }
        />

        <Route
          path="/dashboard"
          element={<DashboardRedirect />}
        />

        {routeRedirects.map((route) => (
          <Route
            key={route.path}
            path={route.path}
            element={<Navigate to={route.to} replace />}
          />
        ))}

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <motion.div
              variants={getRouteVariants('/admin')}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <AdminLayout>
                <AdminDashboard />
              </AdminLayout>
            </motion.div>
          }
        />
        <Route
          path="/admin/products"
          element={
            <motion.div
              variants={getRouteVariants('/admin/products')}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <AdminLayout>
                <AdminProducts />
              </AdminLayout>
            </motion.div>
          }
        />
        <Route
          path="/admin/orders"
          element={
            <motion.div
              variants={getRouteVariants('/admin/orders')}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <AdminLayout>
                <AdminOrders />
              </AdminLayout>
            </motion.div>
          }
        />
        <Route
          path="/admin/users"
          element={
            <motion.div
              variants={getRouteVariants('/admin/users')}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <AdminLayout>
                <AdminUsers />
              </AdminLayout>
            </motion.div>
          }
        />
        <Route
          path="/admin/analytics"
          element={
            <motion.div
              variants={getRouteVariants('/admin/analytics')}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <AdminLayout>
                <AdminAnalytics />
              </AdminLayout>
            </motion.div>
          }
        />
        <Route
          path="/admin/inventory"
          element={
            <motion.div
              variants={getRouteVariants('/admin/inventory')}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <AdminLayout>
                <AdminInventory />
              </AdminLayout>
            </motion.div>
          }
        />
        <Route
          path="/admin/reports"
          element={
            <motion.div
              variants={getRouteVariants('/admin/reports')}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <AdminLayout>
                <AdminReports />
              </AdminLayout>
            </motion.div>
          }
        />
        <Route
          path="/admin/coffee-beans"
          element={
            <motion.div
              variants={getRouteVariants('/admin/coffee-beans')}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <AdminLayout>
                <AdminCoffeeBeans />
              </AdminLayout>
            </motion.div>
          }
        />
        <Route
          path="/admin/employees"
          element={
            <motion.div
              variants={getRouteVariants('/admin/employees')}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <AdminLayout>
                <AdminEmployees />
              </AdminLayout>
            </motion.div>
          }
        />
        <Route
          path="/admin/attendance"
          element={
            <motion.div
              variants={getRouteVariants('/admin/attendance')}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <AdminLayout>
                <AdminAttendance />
              </AdminLayout>
            </motion.div>
          }
        />
        <Route
          path="/admin/tasks"
          element={
            <motion.div
              variants={getRouteVariants('/admin/tasks')}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <AdminLayout>
                <AdminTasks />
              </AdminLayout>
            </motion.div>
          }
        />
        <Route
          path="/admin/shifts"
          element={
            <motion.div
              variants={getRouteVariants('/admin/shifts')}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <AdminLayout>
                <AdminShifts />
              </AdminLayout>
            </motion.div>
          }
        />
        <Route
          path="/admin/leave-requests"
          element={
            <motion.div
              variants={getRouteVariants('/admin/leave-requests')}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <AdminLayout>
                <AdminLeaveRequests />
              </AdminLayout>
            </motion.div>
          }
        />
        <Route
          path="/admin/performance"
          element={
            <motion.div
              variants={getRouteVariants('/admin/performance')}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <AdminLayout>
                <AdminPerformance />
              </AdminLayout>
            </motion.div>
          }
        />
        <Route
          path="/admin/settings"
          element={
            <motion.div
              variants={getRouteVariants('/admin/settings')}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <AdminLayout>
                <AdminSettings />
              </AdminLayout>
            </motion.div>
          }
        />

        {/* Barista Routes */}
        <Route
          path="/barista"
          element={
            <motion.div
              variants={getRouteVariants('/barista')}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <BaristaLayout>
                <BaristaDashboard />
              </BaristaLayout>
            </motion.div>
          }
        />
        <Route
          path="/barista/order-queue"
          element={
            <motion.div
              variants={getRouteVariants('/barista/order-queue')}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <BaristaLayout>
                <OrderQueue />
              </BaristaLayout>
            </motion.div>
          }
        />
        <Route
          path="/barista/coffee-bean-control"
          element={
            <motion.div
              variants={getRouteVariants('/barista/coffee-bean-control')}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <BaristaLayout>
                <CoffeeBeanControl />
              </BaristaLayout>
            </motion.div>
          }
        />
        <Route
          path="/barista/training-insights"
          element={
            <motion.div
              variants={getRouteVariants('/barista/training-insights')}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <BaristaLayout>
                <TrainingInsights />
              </BaristaLayout>
            </motion.div>
          }
        />
        <Route
          path="/barista/completed-orders"
          element={
            <motion.div
              variants={getRouteVariants('/barista/completed-orders')}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <BaristaLayout>
                <CompletedOrders />
              </BaristaLayout>
            </motion.div>
          }
        />
        <Route
          path="/barista/today-origin"
          element={
            <motion.div
              variants={getRouteVariants('/barista/today-origin')}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <BaristaLayout>
                <TodaysOriginManagement />
              </BaristaLayout>
            </motion.div>
          }
        />
        <Route
          path="/barista/inventory-checklist"
          element={
            <motion.div
              variants={getRouteVariants('/barista/inventory-checklist')}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <BaristaLayout>
                <InventoryChecklist />
              </BaristaLayout>
            </motion.div>
          }
        />
        <Route
          path="/barista/pos"
          element={
            <motion.div
              variants={getRouteVariants('/barista/pos')}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <PosPage />
            </motion.div>
          }
        />

        {/* Barista Workforce Routes */}
        <Route
          path="/barista/attendance"
          element={
            <motion.div
              variants={getRouteVariants('/barista/attendance')}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <BaristaLayout>
                <BaristaAttendance />
              </BaristaLayout>
            </motion.div>
          }
        />
        <Route
          path="/barista/my-tasks"
          element={
            <motion.div
              variants={getRouteVariants('/barista/my-tasks')}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <BaristaLayout>
                <MyTasks />
              </BaristaLayout>
            </motion.div>
          }
        />
        <Route
          path="/barista/my-shifts"
          element={
            <motion.div
              variants={getRouteVariants('/barista/my-shifts')}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <BaristaLayout>
                <MyShifts />
              </BaristaLayout>
            </motion.div>
          }
        />
        <Route
          path="/barista/leave-request"
          element={
            <motion.div
              variants={getRouteVariants('/barista/leave-request')}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <BaristaLayout>
                <LeaveRequest />
              </BaristaLayout>
            </motion.div>
          }
        />
        <Route
          path="/barista/my-performance"
          element={
            <motion.div
              variants={getRouteVariants('/barista/my-performance')}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <BaristaLayout>
                <MyPerformance />
              </BaristaLayout>
            </motion.div>
          }
        />

        {/* Kitchen Routes */}
        <Route
          path="/kitchen"
          element={
            <motion.div
              variants={getRouteVariants('/kitchen')}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <KitchenLayout>
                <KitchenDashboard />
              </KitchenLayout>
            </motion.div>
          }
        />
        <Route
          path="/kitchen/food-order-queue"
          element={
            <motion.div
              variants={getRouteVariants('/kitchen/food-order-queue')}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <KitchenLayout>
                <FoodOrderQueue />
              </KitchenLayout>
            </motion.div>
          }
        />
        <Route
          path="/kitchen/completed-food-orders"
          element={
            <motion.div
              variants={getRouteVariants('/kitchen/completed-food-orders')}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <KitchenLayout>
                <CompletedFoodOrders />
              </KitchenLayout>
            </motion.div>
          }
        />
        <Route
          path="/kitchen/inventory"
          element={
            <motion.div
              variants={getRouteVariants('/kitchen/inventory')}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <KitchenLayout>
                <EmployeeInventory
                  title="Kitchen Inventory Checklist"
                  inventoryTypes={KITCHEN_INVENTORY_TYPES}
                />
              </KitchenLayout>
            </motion.div>
          }
        />

        {/* Kitchen Workforce Routes */}
        <Route
          path="/kitchen/attendance"
          element={
            <motion.div
              variants={getRouteVariants('/kitchen/attendance')}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <KitchenLayout>
                <KitchenAttendance />
              </KitchenLayout>
            </motion.div>
          }
        />
        <Route
          path="/kitchen/my-tasks"
          element={
            <motion.div
              variants={getRouteVariants('/kitchen/my-tasks')}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <KitchenLayout>
                <KitchenMyTasks />
              </KitchenLayout>
            </motion.div>
          }
        />
        <Route
          path="/kitchen/my-shifts"
          element={
            <motion.div
              variants={getRouteVariants('/kitchen/my-shifts')}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <KitchenLayout>
                <KitchenMyShifts />
              </KitchenLayout>
            </motion.div>
          }
        />
        <Route
          path="/kitchen/leave-request"
          element={
            <motion.div
              variants={getRouteVariants('/kitchen/leave-request')}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <KitchenLayout>
                <KitchenLeaveRequest />
              </KitchenLayout>
            </motion.div>
          }
        />
        <Route
          path="/kitchen/my-performance"
          element={
            <motion.div
              variants={getRouteVariants('/kitchen/my-performance')}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <KitchenLayout>
                <KitchenMyPerformance />
              </KitchenLayout>
            </motion.div>
          }
        />

        {/* Catch-all route for 404 */}
        <Route
          path="*"
          element={
            <motion.div
              variants={getRouteVariants('*')}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <NotFound />
            </motion.div>
          }
        />
      </Routes>
    </AnimatePresence>
  );
}

export default App;