import React, { useState, useEffect, useMemo } from 'react';
import {
  ResponsiveContainer,
  ResponsiveSpinner,
  ResponsiveButton,
  ResponsiveBadge,
  ResponsiveAlert,
  ResponsiveCard,
  ResponsiveRow,
  ResponsiveCol,
  ResponsiveProgressBar,
  ResponsiveModal
} from '../../components/responsive';
import {
  FaShoppingBag, FaCheckCircle, FaClock, FaWallet,
  FaCoffee, FaClipboardList, FaUser, FaStar,
  FaChevronRight, FaArrowRight, FaFire, FaMoon,
  FaGift, FaTrophy, FaCalendarAlt, FaChevronUp, FaChevronDown
} from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useNotificationSystem } from '../../components/common/NotificationSystem';
import useApiError from '../../hooks/useApiError';
import apiService from '../../services/api.service';
import { API_ENDPOINTS } from '../../config/api';
import { AreaMetricChart } from '../../components/charts';
import StatusBadge from '../../components/common/StatusBadge';
import SEO from '../../components/SEO';
import PullToRefresh from '../../components/mobile/PullToRefresh';
import { usePullToRefresh } from '../../hooks/usePullToRefresh';
import './CustomerDashboard.css';

/* ── helpers ── */
const fmt = (v) => { const n = parseFloat(v); return isNaN(n) ? '0.00' : n.toFixed(2); };

// Get user's usual order from recent orders
const getUsualOrder = (recentOrders) => {
  if (!recentOrders || recentOrders.length === 0) return null;

  // Count frequency of each product in recent orders
  const productCounts = {};

  recentOrders.forEach(order => {
    order.order_items?.forEach(item => {
      const productName = item.product_name || item.name || 'Unknown';
      productCounts[productName] = (productCounts[productName] || 0) + 1;
    });
  });

  // Find the most frequently ordered product
  let usualOrder = null;
  let maxCount = 0;

  for (const [product, count] of Object.entries(productCounts)) {
    if (count > maxCount) {
      maxCount = count;
      usualOrder = product;
    }
  }

  return usualOrder && maxCount >= 2 ? usualOrder : null; // Only suggest if ordered at least twice
};

const getGreeting = (user, stats, recentOrders) => {
  const h = new Date().getHours();
  const baseGreeting = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
  const usualOrder = getUsualOrder(recentOrders);

  // Enhanced personalization based on order history
  if (stats && stats.total_orders > 0) {
    if (stats.total_orders >= 10) {
      return usualOrder
        ? `${baseGreeting}, coffee expert! Your usual ${usualOrder} is ready. You've enjoyed ${stats.total_orders} cups with us.`
        : `${baseGreeting}, coffee expert! You've enjoyed ${stats.total_orders} cups with us.`;
    } else if (stats.total_orders >= 5) {
      return usualOrder
        ? `${baseGreeting}, regular! Your usual ${usualOrder} is ready. Thanks for being a loyal customer.`
        : `${baseGreeting}, regular! Thanks for being a loyal customer.`;
    } else {
      return usualOrder
        ? `${baseGreeting}, welcome back! Your usual ${usualOrder} is ready. You've had ${stats.total_orders} orders so far.`
        : `${baseGreeting}, welcome back! You've had ${stats.total_orders} orders so far.`;
    }
  }

  return usualOrder
    ? `${baseGreeting}, ${user?.name || 'Coffee Lover'}! Your usual ${usualOrder} is ready.`
    : `${baseGreeting}, ${user?.name || 'Coffee Lover'}!`;
};

// Smart recommendation helpers
const getSmartRecommendationTitle = (user, stats, analyticsData, recentOrders) => {
  const hour = new Date().getHours();
  const isMorning = hour >= 6 && hour < 11;
  const isAfternoon = hour >= 11 && hour < 17;
  const isEvening = hour >= 17 || hour < 6;

  // Get user's most frequent order from history
  const usualOrder = getUsualOrder(recentOrders);

  // Time-based recommendations with personalization
  if (isMorning) {
    if (stats.total_orders > 0) {
      return usualOrder
        ? `Morning ${usualOrder} Lover`
        : "Morning Pick-Me-Up";
    }
    return usualOrder
      ? `Start Your Day with ${usualOrder}`
      : "Start Your Day Right";
  }

  if (isAfternoon) {
    if (stats.total_orders > 5) {
      return usualOrder
        ? `Afternoon ${usualOrder} Refill`
        : "Afternoon Refill";
    }
    return usualOrder
      ? `Afternoon ${usualOrder} Boost`
      : "Afternoon Boost";
  }

  if (isEvening) {
    if (stats.total_orders > 0) {
      return usualOrder
        ? `Evening ${usualOrder} Wind-Down`
        : "Evening Wind-Down";
    }
    return usualOrder
      ? `Evening ${usualOrder} Treat`
      : "Evening Treat";
  }

  return usualOrder
    ? `Recommended for You: Try ${usualOrder}`
    : "Recommended for You";
};

const getRecommendationIcon = (user, stats, analyticsData, recentOrders) => {
  const hour = new Date().getHours();
  const isMorning = hour >= 6 && hour < 11;
  const isAfternoon = hour >= 11 && hour < 17;
  const isEvening = hour >= 17 || hour < 6;

  // Get user's most frequent order from history for potential icon customization
  const usualOrder = getUsualOrder(recentOrders);

  if (isMorning) {
    // Could customize based on usual order - for now keep coffee icon
    return <FaCoffee />;
  }
  if (isAfternoon) {
    // Could customize based on usual order - for now keep clock icon
    return <FaClock />;
  }
  return <FaMoon />;
};

const getRecommendationTitle = (user, stats, analyticsData, recentOrders) => {
  const hour = new Date().getHours();
  const isMorning = hour >= 6 && hour < 11;
  const isAfternoon = hour >= 11 && hour < 17;
  const isEvening = hour >= 17 || hour < 6;

  // Get top product from analytics if available
  const topProduct = analyticsData?.top_products?.[0];
  const topProductName = topProduct?.product_name || topProduct?.name || "Our Featured Brew";

  // Get user's most frequent order from history
  const usualOrder = getUsualOrder(recentOrders);

  if (isMorning) {
    if (stats.total_orders > 10) {
      return usualOrder
        ? `Barista's Choice ${usualOrder} Blend`
        : "Barista's Choice Morning Blend";
    }
    return usualOrder
      ? `${usualOrder} Morning Special`
      : topProductName;
  }

  if (isAfternoon) {
    if (stats.total_orders > 5) {
      return usualOrder
        ? `Iced ${usualOrder} Macchiato`
        : "Iced Caramel Macchiato";
    }
    return usualOrder
      ? `${topProductName} Iced with ${usualOrder || 'a twist'}`
      : `${topProductName} Iced`;
  }

  if (isEvening) {
    if (stats.total_orders > 0) {
      return usualOrder
        ? `Decaf ${usualOrder} Espresso`
        : "Decaf Espresso Roast";
    }
    return usualOrder
      ? `Decaf ${usualOrder} Special`
      : "Decaf " + topProductName;
  }

  return usualOrder
    ? `${topProductName} with ${usualOrder} twist`
    : topProductName || "House Special";
};

const getRecommendationDescription = (user, stats, analyticsData, recentOrders) => {
  const hour = new Date().getHours();
  const isMorning = hour >= 6 && hour < 11;
  const isAfternoon = hour >= 11 && hour < 17;
  const isEvening = hour >= 17 || hour < 6;

  // Get user's most frequent order from history
  const usualOrder = getUsualOrder(recentOrders);

  if (isMorning) {
    if (stats.total_orders > 0) {
      return usualOrder
        ? `Bold and energizing ${usualOrder} to kickstart your day`
        : "Bold and energizing to kickstart your day";
    }
    return usualOrder
      ? `A smooth, balanced ${usualOrder} perfect for morning`
      : "A smooth, balanced blend perfect for morning";
  }

  if (isAfternoon) {
    if (stats.total_orders > 5) {
      return usualOrder
        ? `Sweet and refreshing ${usualOrder} for that afternoon lift`
        : "Sweet and refreshing for that afternoon lift";
    }
    return usualOrder
      ? `Cool, refreshing ${usualOrder} option for warmer afternoons`
      : "Cool, refreshing option for warmer afternoons";
  }

  if (isEvening) {
    if (stats.total_orders > 0) {
      return usualOrder
        ? `Smooth and caffeine-free ${usualOrder} for evening enjoyment`
        : "Smooth and caffeine-free for evening enjoyment";
    }
    return usualOrder
      ? `Rich ${usualOrder} flavor without the caffeine for evening`
      : "Rich flavor without the caffeine for evening";
  }

  return usualOrder
    ? `Customer favorite ${usualOrder} with perfect balance of flavor`
    : "Customer favorite with perfect balance of flavor";
};

const QUICK_ACTIONS = [
  { path: '/products', label: 'Browse Menu', icon: FaCoffee, color: 'rgba(0,104,55,0.1)', iconColor: 'var(--color-dark-green)', desc: 'Discover new flavors' },
  { path: '/orders', label: 'My Orders', icon: FaClipboardList, color: 'rgba(0,104,55,0.1)', iconColor: 'var(--color-dark-green)', desc: 'Track & manage orders' },
  { path: '/cart', label: 'My Cart', icon: FaShoppingBag, color: 'rgba(155,107,0,0.1)', iconColor: 'var(--color-warning)', desc: 'Review your cart' },
  { path: '/profile', label: 'Profile', icon: FaUser, color: 'rgba(0,104,55,0.1)', iconColor: 'var(--color-dark-green)', desc: 'Account settings' },
];


/* ================================================================ */

const CustomerDashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [rewardsData, setRewardsData] = useState(null);
  const [rewardsLoading, setRewardsLoading] = useState(true);
  const [previewReward, setPreviewReward] = useState(null);
  const [redemptionLoading, setRedemptionLoading] = useState(false);
  const [expandedDates, setExpandedDates] = useState(new Set());
  const { showSuccessNotification, showErrorNotification } = useNotificationSystem();
  const { errorInfo, getErrorInfo } = useApiError();
  const { onTouchStart, onTouchMove, onTouchEnd } = usePullToRefresh(
    () => {
      fetchDashboard();
      fetchAnalytics();
      fetchRewards();
    },
    { threshold: 100 }
  );

  // ALL HOOKS MUST BE AT THE TOP - Move useMemo hooks here
  const stats = dashboardData?.statistics || {};
  const recentOrders = useMemo(() => dashboardData?.recent_orders || [], [dashboardData]);
  const activeOrder = dashboardData?.active_order;

  /* chart data */
  const orderHistoryData = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const map = days.map((d) => ({ date: d, orders: 0 }));
    if (recentOrders.length) {
      recentOrders.forEach((o) => {
        const idx = (new Date(o.created_at).getDay() + 6) % 7; // Mon=0
        map[idx].orders += 1;
      });
    }
    return map;
  }, [recentOrders]);

  // Group recent orders by date for collapsible sections
  const groupedOrders = useMemo(() => {
    if (!recentOrders || recentOrders.length === 0) return [];

    // Group by date (YYYY-MM-DD)
    const groups = {};

    recentOrders.forEach(order => {
      const date = new Date(order.created_at).toISOString().split('T')[0];
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(order);
    });

    // Convert to array and sort by date (newest first)
    return Object.entries(groups)
      .map(([date, orders]) => ({
        date,
        orders: orders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      }))
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [recentOrders]);

  // Animation variant for motion components
  const fadeUp = useMemo(() => {
    return {
      initial: { y: 20, opacity: 0 },
      animate: { y: 0, opacity: 1 },
      transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }
    };
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await apiService.get(API_ENDPOINTS.CUSTOMER.DASHBOARD);
      if (res.success) setDashboardData(res.data);
      else {
        getErrorInfo({ response: { status: 500, data: { message: 'Failed to load dashboard' } } });
      }
    } catch (error) {
      getErrorInfo(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const res = await apiService.get(API_ENDPOINTS.CUSTOMER.ANALYTICS);
      if (res.success) setAnalyticsData(res.data);
      // analytics is non-critical; silently skip on error
    } catch (error) {
      // analytics is non-critical; silently skip on error
      getErrorInfo(error);
    }
  };

  const fetchRewards = async () => {
    try {
      setRewardsLoading(true);
      const res = await apiService.get(API_ENDPOINTS.CUSTOMER.REWARDS);
      if (res.success) setRewardsData(res.data);
      else {
        getErrorInfo({ response: { status: 500, data: { message: 'Failed to load rewards' } } });
      }
    } catch (error) {
      getErrorInfo(error);
    } finally {
      setRewardsLoading(false);
    }
  };

  const openRewardPreview = (reward) => {
    setPreviewReward(reward);
  };

  const closeRewardPreview = () => {
    setPreviewReward(null);
  };

  const handleRewardRedemption = async () => {
    if (!previewReward || !previewReward.id) {
      showErrorNotification('Invalid reward selection.');
      closeRewardPreview();
      return;
    }

    try {
      setRedemptionLoading(true);
      const res = await apiService.post(
        API_ENDPOINTS.CUSTOMER.REWARDS_REDEEM(previewReward.id)
      );
      if (res.success) {
        showSuccessNotification(`Redeemed ${previewReward.title}!`);
        // Refresh rewards data to update points balance
        fetchRewards();
      } else {
        throw new Error(res.message || 'Redemption failed');
      }
    } catch (error) {
      showErrorNotification(
        error.message || 'Failed to redeem reward. Please try again.'
      );
    } finally {
      setRedemptionLoading(false);
      closeRewardPreview();
    }
  };

  /* ── Loading ─────────── */
  if (loading) {
    return (
      <main role="main">
        <ResponsiveContainer className="py-5 text-center">
          <ResponsiveSpinner animation="border" variant="success" />
          <p className="mt-3 text-muted">Loading your dashboard…</p>
        </ResponsiveContainer>
      </main>
    );
  }

  /* ── Error ──────────── */
  if (errorInfo) {
    return (
      <main role="main">
        <ResponsiveContainer className="py-5 text-center">
          <ResponsiveAlert variant="danger">
            <p className="text-danger mb-3">{errorInfo.message}</p>
            {errorInfo.actions && errorInfo.actions.length > 0 && (
              <div className="d-flex justify-content-center gap-2 mt-3">
                {errorInfo.actions.map((action, index) => (
                  <ResponsiveButton
                    key={index}
                    variant={action.variant || 'primary'}
                    size="sm"
                    onClick={action.onClick}
                  >
                    {action.label}
                  </ResponsiveButton>
                ))}
              </div>
            )}
          </ResponsiveAlert>
        </ResponsiveContainer>
      </main>
    );
  }

  const avgOrder = stats.total_orders > 0
    ? ((parseFloat(stats.total_spent) || 0) / stats.total_orders).toFixed(2)
    : '0.00';
  const completionRate = stats.total_orders > 0
    ? ((stats.completed_orders / stats.total_orders) * 100).toFixed(0)
    : 0;

  return (
    <main
      role="main"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      style={{ touchAction: 'manipulation' }}
    >
      <SEO title="Dashboard" url="/customer/dashboard" />
      <ResponsiveContainer className="py-4">

          {/* ─── Hero Greeting ────────────────── */}
          <motion.div className="cdb-hero" initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <p className="cdb-hero-greeting">{getGreeting(user, stats, recentOrders)}</p>
            <h1 className="cdb-hero-name">{user?.name || 'Coffee Lover'}</h1>
            <p className="cdb-hero-subtitle">Here's what's happening with your coffee orders today.</p>
            <div className="cdb-hero-member">
              <FaStar size={14} />
              Member since {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'N/A'}
            </div>
          </motion.div>

          {/* ─── Active Order Banner ──────────── */}
          {activeOrder && (
            <motion.div className="cdb-active-order" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.15 }}>
              <span className="cdb-active-pulse" />
              <div className="cdb-active-info">
                <div className="cdb-active-label">
                  Order #{activeOrder.id} is <StatusBadge type="order" status={activeOrder.status} />
                </div>
                <div className="cdb-active-meta">
                  {activeOrder.order_items?.length || '—'} items · ₱{fmt(activeOrder.total_amount)}
                </div>
              </div>
              <ResponsiveButton as={Link} to={`/orders/${activeOrder.id}`} variant="warning" size="sm" className="cdb-active-btn fw-semibold">
                Track Order <FaArrowRight className="ms-1" />
              </ResponsiveButton>
            </motion.div>
          )}

          {/* ─── Stat Cards ───────────────────── */}
          <div className="cdb-stats">
            {[
              { label: 'Total Orders', value: stats.total_orders || 0, Icon: FaShoppingBag, mod: 'orders' },
              { label: 'Completed', value: stats.completed_orders || 0, Icon: FaCheckCircle, mod: 'completed' },
              { label: 'Active', value: stats.active_orders || 0, Icon: FaClock, mod: 'active' },
              { label: 'Total Spent', value: `₱${fmt(stats.total_spent)}`, Icon: FaWallet, mod: 'spent' },
            ].map((s, i) => (
              <motion.div key={s.label} className="cdb-stat-card" custom={i} initial="hidden" animate="visible" variants={fadeUp}>
                <div className={`cdb-stat-icon cdb-stat-icon--${s.mod}`}><s.Icon /></div>
                <div className="cdb-stat-value">{s.value}</div>
                <div className="cdb-stat-label">{s.label}</div>
              </motion.div>
            ))}
          </div>

          {/* ─── Rewards Section ──────────────── */}
          {!rewardsLoading && rewardsData && (
            <ResponsiveCard className="cdb-rewards-card mb-4">
              <ResponsiveCard.Header className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">
                  <FaTrophy className="me-2" />
                  My Rewards
                </h5>
                {rewardsData.points_expiring_soon && (
                  <div className="cdb-expiration-warnings">
                    <div className="cdb-expiration-title">
                      <FaMoon className="me-2" />
                      Expiring Points Alert
                    </div>
                    <div className="cdb-expiry-item">
                      <div className="cdb-expiry-info">
                        <span>Points expiring soon:</span>
                        <span className="cdb-expiry-amount">{rewardsData.points_expiring_soon} points</span>
                      </div>
                      <div className="cdb-expiry-date">
                        {/* In a real app, this would show the actual expiration date */}
                        <small>Within 30 days</small>
                      </div>
                      <div className="cdb-expiry-action">
                        <ResponsiveButton
                          variant="outline-warning"
                          size="sm"
                          onClick={() => {
                            // In a real app, this might navigate to a rewards history or expiration details page
                            showSuccessNotification('Expiring points details would be shown here.');
                          }}
                        >
                          View Details
                        </ResponsiveButton>
                      </div>
                    </div>
                  </div>
                )}
              </ResponsiveCard.Header>
              <ResponsiveCard.Body className="p-3">
                <div className="text-center mb-3">
                  <h3 className="mb-2">{rewardsData.total_points || 0} <small className="text-muted">points</small></h3>
                  <p className="text-muted mb-0">Your current balance</p>
                </div>

                {/* Progress Bar with Tier Milestones */}
                <div className="cdb-progress-bar-container mb-3">
                  <div className="cdb-progress-label">
                    <span>Progress to Next Tier</span>
                    <span className="cdb-progress-value">{rewardsData.progress_percentage || 0}%</span>
                  </div>
                  <div className="cdb-progress-bar">
                    <div
                      className="cdb-progress-fill"
                      style={{ width: `${rewardsData.progress_percentage || 0}%` }}
                    >
                      {/* Tier markers will be positioned absolutely */}
                      {/* Bronze (0%), Silver (25%), Gold (50%), Platinum (75%) */}
                      <div className="cdb-tier-marker" style={{ left: '0%' }}>
                        <div className="cdb-tier-dot"></div>
                      </div>
                      <div className="cdb-tier-marker" style={{ left: '25%' }}>
                        <div className="cdb-tier-dot"></div>
                      </div>
                      <div className="cdb-tier-marker" style={{ left: '50%' }}>
                        <div className="cdb-tier-dot"></div>
                      </div>
                      <div className="cdb-tier-marker" style={{ left: '75%' }}>
                        <div className="cdb-tier-dot"></div>
                      </div>
                    </div>
                  </div>
                  <div className="cdb-progress-text">
                    {rewardsData.current_tier} Tier
                  </div>
                </div>

                {/* Reward Redemption Preview */}
                {rewardsData.available_rewards && rewardsData.available_rewards.length > 0 && (
                  <div className="mb-3">
                    <h6 className="mb-2">Available Rewards</h6>
                    <div className="row g-3">
                      {rewardsData.available_rewards.slice(0, 3).map((reward, index) => (
                        <ResponsiveCol key={index} xs={12} sm={6} lg={4}>
                          <ResponsiveCard className="h-100 shadow-sm border-0">
                            <ResponsiveCard.Body className="p-3 text-center">
                              <div className="mb-2">
                                {reward.icon || <FaGift className="text-warning" /> }
                              </div>
                              <h6 className="mb-1">{reward.title}</h6>
                              <p className="text-muted small mb-2">{reward.description}</p>
                              <div className="mb-3">
                                <small className="text-muted">Cost: </small>
                                <strong>{reward.cost} points</strong>
                              </div>
                              <ResponsiveButton
                                variant="outline-primary"
                                size="sm"
                                className="w-100"
                                disabled={!reward.id}
                                onClick={() => openRewardPreview(reward)}
                              >
                                Preview & Redeem
                              </ResponsiveButton>
                            </ResponsiveCard.Body>
                          </ResponsiveCard>
                        </ResponsiveCol>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tier Benefits */}
                {rewardsData.current_tier && (
                  <div className="mt-3 pt-3 border-top">
                    <h6 className="mb-2">Current Tier: <span className="text-capitalize">{rewardsData.current_tier}</span></h6>
                    <p className="small text-muted mb-0">
                      {rewardsData.tier_benefits || 'Enjoy exclusive benefits at your tier level'}
                    </p>
                  </div>
                )}
              </ResponsiveCard.Body>
            </ResponsiveCard>
          )}
          {rewardsLoading && (
            <ResponsiveCard className="cdb-rewards-card mb-4">
              <ResponsiveCard.Body className="text-center py-4">
                <ResponsiveSpinner animation="border" />
                <p className="mt-2">Loading rewards...</p>
              </ResponsiveCard.Body>
            </ResponsiveCard>
          )}
          {errorInfo && (
            <ResponsiveCard className="cdb-rewards-card mb-4">
              <ResponsiveCard.Body>
                <ResponsiveAlert variant="danger">
                  {errorInfo.message}
                  {errorInfo.actions && errorInfo.actions.length > 0 && (
                    <div className="d-flex justify-content-center gap-2 mt-2">
                      {errorInfo.actions.map((action, index) => (
                        <ResponsiveButton
                          key={index}
                          variant={action.variant || 'primary'}
                          size="sm"
                          onClick={action.onClick}
                        >
                          {action.label}
                        </ResponsiveButton>
                      ))}
                    </div>
                  )}
                </ResponsiveAlert>
              </ResponsiveCard.Body>
            </ResponsiveCard>
          )}

          {/* ─── Quick Actions ────────────────── */}
          <div className="cdb-actions">
            {QUICK_ACTIONS.map((a, i) => (
              <motion.div key={a.path} custom={i + 4} initial="hidden" animate="visible" variants={fadeUp}>
                <Link to={a.path} className="cdb-action-card">
                  <div className="cdb-action-icon-wrap" style={{ background: a.color, color: a.iconColor }}>
                    <a.icon />
                  </div>
                  <span className="cdb-action-label">{a.label}</span>
                  <span className="cdb-action-desc">{a.desc}</span>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* ─── Content Grid: Chart + Recent Orders ── */}
          <div className="cdb-content-grid">

            {/* Left — chart + quick stats */}
            <div>
              <AreaMetricChart
                data={orderHistoryData}
                title="Order Activity"
                subtitle="Recent orders by day of week"
                dataKey="orders"
                xAxisKey="date"
                height={220}
                color="#006837"
              />

              <div className="cdb-quick-stats mt-3">
                <div className="cdb-section-header">
                  <h2 className="cdb-section-title">Quick Stats</h2>
                </div>
                <div className="cdb-quick-stat-row">
                  <span className="cdb-quick-stat-label">Avg Order Value</span>
                  <span className="cdb-quick-stat-value">₱{avgOrder}</span>
                </div>
                <div className="cdb-quick-stat-row">
                  <span className="cdb-quick-stat-label">Completion Rate</span>
                  <span className="cdb-quick-stat-value">{completionRate}%</span>
                </div>
                <div className="cdb-quick-stat-row">
                  <span className="cdb-quick-stat-label">Member Since</span>
                  <span className="cdb-quick-stat-value">
                    {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'N/A'}
                  </span>
                </div>
              </div>

              {/* Personalized Recommendations */}
              {analyticsData && (
                <div className="cdb-quick-stats mt-3">
                  <div className="cdb-section-header">
                    <h2 className="cdb-section-title">For You</h2>
                  </div>
                  <div className="cdb-quick-stat-row">
                    <span className="cdb-quick-stat-label">Based on your history & time of day</span>
                    <span className="cdb-quick-stat-value">
                      {getSmartRecommendationTitle(user, stats, analyticsData, recentOrders)}
                    </span>
                  </div>
                  <div className="cdb-quick-stat-row">
                    <span className="cdb-quick-stat-label">Recommendation</span>
                    <div className="d-flex align-items-start">
                      <div className="me-3">
                        {getRecommendationIcon(user, stats, analyticsData, recentOrders)}
                      </div>
                      <div>
                        <h5 className="mb-1">
                          {getRecommendationTitle(user, stats, analyticsData, recentOrders)}
                        </h5>
                        <p className="text-muted small mb-0">
                          {getRecommendationDescription(user, stats, analyticsData, recentOrders)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right — recent orders */}
            <div className="cdb-orders-card">
              <div className="cdb-section-header">
                <h2 className="cdb-section-title">Recent Orders</h2>
                <Link to="/orders" className="cdb-section-link">
                  View All <FaChevronRight size={10} />
                </Link>
              </div>

              {groupedOrders.length > 0 ? (
                groupedOrders.map((group) => {
                  const formattedDate = new Date(group.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  });
                  const isExpanded = expandedDates.has(group.date);

                  return (
                    <div key={group.date} className="cdb-order-group">
                      <div className="cdb-order-group-header" onClick={() => {
                        setExpandedDates(prev => {
                          const newSet = new Set(prev);
                          if (newSet.has(group.date)) {
                            newSet.delete(group.date);
                          } else {
                            newSet.add(group.date);
                          }
                          return newSet;
                        });
                      }}>
                        <div className="cdb-order-date">{formattedDate}</div>
                        <div className="cdb-order-type-count">
                          {group.orders.length} {group.orders.length === 1 ? 'order' : 'orders'}
                        </div>
                        <div className="cdb-toggle-icon">
                          {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
                        </div>
                      </div>
                      <div className={`cdb-order-group-body ${isExpanded ? 'show' : ''}`}>
                        {group.orders.map((order) => (
                          <div key={order.id} className="cdb-order-item">
                            <div className="cdb-order-num-wrap">
                              <span className="cdb-order-num">#{order.id}</span>
                            </div>
                            <div className="cdb-order-details">
                              <div className="cdb-order-title">
                                Order #{order.id}
                              </div>
                              <div className="cdb-order-meta">
                                {new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                {' · '}
                                <StatusBadge type="order" status={order.status} />
                              </div>
                            </div>
                            <div className="cdb-order-right">
                              <div className="cdb-order-amount">₱{fmt(order.total_amount)}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="cdb-empty">
                  <div className="cdb-empty-icon"><FaCoffee /></div>
                  <p className="cdb-empty-text">No orders yet. Ready for your first cup?</p>
                  <Link to="/products" className="cdb-empty-link">Browse Menu <FaArrowRight className="ms-1" size={12} /></Link>
                </div>
              )
              }
            </div>
          </div>

        </ResponsiveContainer>

      {/* Reward Redemption Preview Modal */}
      <ResponsiveModal show={!!previewReward} onHide={closeRewardPreview}>
        <ResponsiveModal.Header closeButton>
          <ResponsiveModal.Title>
            {previewReward ? `Confirm Redemption: ${previewReward.title}` : 'Confirm Redemption'}
          </ResponsiveModal.Title>
        </ResponsiveModal.Header>
        <ResponsiveModal.Body>
          {previewReward && (
            <div>
              <div className="text-center mb-4">
                {previewReward.icon || <FaGift className="text-warning fa-2x" />}
                <h4 className="mt-3">{previewReward.title}</h4>
                <p className="text-muted">{previewReward.description}</p>
              </div>

              <div className="mb-4">
                <div className="d-flex justify-content-between">
                  <span>Points Balance:</span>
                  <strong>{rewardsData?.total_points || 0} points</strong>
                </div>
                <div className="d-flex justify-content-between">
                  <span>Reward Cost:</span>
                  <strong>{previewReward.cost} points</strong>
                </div>
                <div className="d-flex justify-content-between mt-2">
                  <span>Points After Redemption:</span>
                  <strong>
                    {(rewardsData?.total_points || 0) - previewReward.cost} points
                  </strong>
                </div>
              </div>

              <div className="alert alert-info">
                <small>
                  Are you sure you want to redeem this reward? This action cannot be undone.
                </small>
              </div>
            </div>
          )}
        </ResponsiveModal.Body>
        <ResponsiveModal.Footer>
          <ResponsiveButton variant="secondary" size="sm" onClick={closeRewardPreview}>
            Cancel
          </ResponsiveButton>
          <ResponsiveButton
            variant="primary"
            size="sm"
            onClick={handleRewardRedemption}
            disabled={!(previewReward && previewReward.id) || redemptionLoading}
          >
            {redemptionLoading ? 'Processing...' : 'Confirm Redemption'}
          </ResponsiveButton>
        </ResponsiveModal.Footer>
      </ResponsiveModal>
    </main>
  );
};

export default CustomerDashboard;