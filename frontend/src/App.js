import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import { AnimatePresence, motion } from 'framer-motion';
import { AuthProvider } from './context/AuthContext';
import { KITCHEN_THEME, KITCHEN_INVENTORY_TYPES } from './constants/workforceThemes';
import apiService from './services/api.service';
import { API_ENDPOINTS } from './config/api';
import { CartProvider } from './context/CartContext';
import { NotificationCenterProvider } from './context/NotificationContext';
import { NotificationProvider } from './components/common/NotificationSystem';
import { ToastProvider } from './components/animations/Toast';
import LoadingFallback from './components/common/LoadingFallback';
import ErrorBoundary from './components/common/ErrorBoundary';
import FeedbackModal from './components/common/FeedbackModal';
import HomePage from './pages/public/HomePage';
import { FeedbackModalProvider } from './context/FeedbackModalContext';
import { useFeedbackModal } from './context/FeedbackModalContext';
import { useState } from 'react';

// Styles loaded in index.js (bootstrap -> variables -> overrides -> utilities)

// Layout Components - Lazy loaded
const AuthLayout = lazy(() => import('./components/layout/AuthLayout'));
const CustomerLayout = lazy(() => import('./components/layout/CustomerLayout'));
const AdminLayout = lazy(() => import('./components/layout/AdminLayout'));
const BaristaLayout = lazy(() => import('./components/layout/BaristaLayout'));
const KitchenLayout = lazy(() => import('./components/layout/KitchenLayout'));
const PublicLayout = lazy(() => import('./components/layout/PublicLayout'));

// Common Components - Lazy loaded
const DashboardRedirect = lazy(() => import('./components/common/DashboardRedirect'));

// Public Pages - Keep the homepage eager; lazy-load secondary pages to trim the initial bundle
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'));

// Auth Pages - Lazy loaded (accessed infrequently after first visit)
const ForgotPasswordPage = lazy(() => import('./pages/auth/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./pages/auth/ResetPasswordPage'));

// Lazy Load Public Pages
const ProductsPage = lazy(() => import('./pages/public/ProductsPage'));
const ProductDetailPage = lazy(() => import('./pages/public/ProductDetailPage'));
const AboutPage = lazy(() => import('./pages/public/AboutPage'));
const ContactPage = lazy(() => import('./pages/public/ContactPage'));
const AnnouncementsPage = lazy(() => import('./pages/public/AnnouncementsPage'));
const AnnouncementDetailPage = lazy(() => import('./pages/public/AnnouncementDetailPage'));
const InquiriesPage = lazy(() => import('./pages/public/InquiriesPage'));
const PrivacyPage = lazy(() => import('./pages/public/PrivacyPage'));
const TermsPage = lazy(() => import('./pages/public/TermsPage'));
const NotFound = lazy(() => import('./pages/NotFound'));

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

// Lazy Load Customer Pages
const CustomerDashboard = lazy(() => import('./pages/customer/CustomerDashboard'));
const CustomerProfile = lazy(() => import('./pages/customer/CustomerProfile'));
const OrderHistory = lazy(() => import('./pages/customer/OrderHistory'));
const OrderDetailPage = lazy(() => import('./pages/customer/OrderDetailPage'));
const CartPage = lazy(() => import('./pages/customer/CartPage'));
const CheckoutPage = lazy(() => import('./pages/customer/CheckoutPage'));
const CustomerInsightsPage = lazy(() => import('./pages/customer/CustomerInsightsPage'));

// Lazy Load Admin Pages
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminProducts = lazy(() => import('./pages/admin/AdminProducts'));
const AdminOrders = lazy(() => import('./pages/admin/AdminOrders'));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'));
const AdminAnalytics = lazy(() => import('./pages/admin/AdminAnalytics'));
const AdminInventory = lazy(() => import('./pages/admin/AdminInventory'));
const AdminReports = lazy(() => import('./pages/admin/AdminReports'));
const AdminCoffeeBeans = lazy(() => import('./pages/admin/AdminCoffeeBeans'));
const AdminEmployees = lazy(() => import('./pages/admin/AdminEmployees'));
const AdminAttendance = lazy(() => import('./pages/admin/AdminAttendance'));
const AdminTasks = lazy(() => import('./pages/admin/AdminTasks'));
const AdminShifts = lazy(() => import('./pages/admin/AdminShifts'));
const AdminLeaveRequests = lazy(() => import('./pages/admin/AdminLeaveRequests'));
const AdminPerformance = lazy(() => import('./pages/admin/AdminPerformance'));
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings'));

// Lazy Load Barista Pages
const BaristaDashboard = lazy(() => import('./pages/barista/BaristaDashboard'));
const OrderQueue = lazy(() => import('./pages/barista/OrderQueue'));
const CoffeeBeanControl = lazy(() => import('./pages/barista/CoffeeBeanControl'));
const TrainingInsights = lazy(() => import('./pages/barista/TrainingInsights'));
const CompletedOrders = lazy(() => import('./pages/barista/CompletedOrders'));
const TodaysOriginManagement = lazy(() => import('./pages/barista/TodaysOriginManagement'));
const InventoryChecklist = lazy(() => import('./components/workforce/EmployeeInventory'));

// Lazy Load Barista Workforce Pages
const BaristaAttendance = lazy(() => import('./components/workforce/EmployeeAttendance'));
const MyTasks = lazy(() => import('./components/workforce/EmployeeMyTasks'));
const MyShifts = lazy(() => import('./components/workforce/EmployeeMyShifts'));
const LeaveRequest = lazy(() => import('./components/workforce/EmployeeLeaveRequest'));
const MyPerformance = lazy(() => import('./components/workforce/EmployeeMyPerformance'));

// Lazy Load Barista POS (full-screen, no sidebar)
const PosPage = lazy(() => import('./pages/barista/PosPage'));

// Lazy Load Kitchen Staff Pages
const KitchenDashboard = lazy(() => import('./pages/kitchen/KitchenDashboard'));
const FoodOrderQueue = lazy(() => import('./pages/kitchen/FoodOrderQueue'));
const CompletedFoodOrders = lazy(() => import('./pages/kitchen/CompletedFoodOrders'));
const KitchenInventory = lazy(() => import('./components/workforce/EmployeeInventory'));

// Lazy Load Kitchen Workforce Pages
const KitchenAttendance = lazy(() => import('./components/workforce/EmployeeAttendance'));
const KitchenMyTasks = lazy(() => import('./components/workforce/EmployeeMyTasks'));
const KitchenMyShifts = lazy(() => import('./components/workforce/EmployeeMyShifts'));
const KitchenLeaveRequest = lazy(() => import('./components/workforce/EmployeeLeaveRequest'));
const KitchenMyPerformance = lazy(() => import('./components/workforce/EmployeeMyPerformance'));

// Kitchen inventory config for inline route props
const kitchenEndpoints = {
  inventory: () => apiService.get(API_ENDPOINTS.KITCHEN.INVENTORY, { per_page: 200 }),
  adjust: (itemId, payload) => apiService.post(API_ENDPOINTS.KITCHEN.INVENTORY_ADJUST(itemId), payload),
};
const kitchenBuildPayload = (_item, newQty) => ({ quantity: newQty, reason: 'Kitchen checklist adjustment' });

// Lazy Load Notification Pages
const NotificationCenter = lazy(() => import('./pages/notifications/NotificationCenter'));
const NotificationPreferences = lazy(() => import('./pages/notifications/NotificationPreferences'));

function App() {
  const { showFeedbackModal, toggleFeedbackModal } = useFeedbackModal();

  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <Router>
          <AuthProvider>
            <CartProvider>
              <NotificationCenterProvider>
                <ToastProvider>
                  <NotificationProvider>
                    <ErrorBoundary>
                      <Suspense fallback={<LoadingFallback />}>
                        <AnimatedRoutes />
                      </Suspense>
                      <FeedbackModalProvider>
                        <FeedbackModal
                          show={showFeedbackModal}
                          onHide={toggleFeedbackModal}
                        />
                      </FeedbackModalProvider>
                    </ErrorBoundary>
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
  const currentSection = getRouteSection(location.pathname);
  const routeVariants = sectionVariants[currentSection] || sectionVariants.public;

  return (
    <AnimatePresence mode="wait">
      <Routes location={location}>
        {/* Animate each route */}
        <Route
          element={
            <motion.div
              variants={routeVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <Routes location={location} />
            </motion.div>
          }
        />
      </Routes>
    </AnimatePresence>
  );
}

export default App;