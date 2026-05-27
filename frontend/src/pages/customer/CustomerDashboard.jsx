import React, { useState, useEffect, useMemo } from 'react';
import {
  ResponsiveContainer,
  ResponsiveSpinner,
  ResponsiveButton,
} from '@/components/responsive';
import {
  FaShoppingBag, FaCheckCircle, FaClock, FaWallet,
  FaCoffee, FaClipboardList, FaUser, FaStar,
  FaChevronRight, FaArrowRight, FaFire, FaMoon,
  FaGift,
} from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useNotificationSystem } from '../../components/common/NotificationSystem';
import apiService from '../../services/api.service';
import { API_ENDPOINTS } from '../../config/api';
import { AreaMetricChart } from '../../components/charts';
import StatusBadge from '../../components/common/StatusBadge';
import SEO from '../../components/SEO';
import PullToRefresh from '../../components/mobile/PullToRefresh';
import './CustomerDashboard.css';

/* ── helpers ── */
const fmt = (v) => { const n = parseFloat(v); return isNaN(n) ? '0.00' : n.toFixed(2); };

const getGreeting = (user, stats) => {
  const h = new Date().getHours();
  const baseGreeting = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';

  // Enhanced personalization based on order history
  if (stats && stats.total_orders > 0) {
    if (stats.total_orders >= 10) {
      return `${baseGreeting}, coffee expert! You've enjoyed ${stats.total_orders} cups with us.`;
    } else if (stats.total_orders >= 5) {
      return `${baseGreeting}, regular! Thanks for being a loyal customer.`;
    } else {
      return `${baseGreeting}, welcome back! You've had ${stats.total_orders} orders so far.`;
    }
  }

  return `${baseGreeting}, ${user?.name || 'Coffee Lover'}!`;
};

// Smart recommendation helpers
const getSmartRecommendationTitle = (user, stats, analyticsData) => {
  const hour = new Date().getHours();
  const isMorning = hour >= 6 && hour < 11;
  const isAfternoon = hour >= 11 && hour < 17;
  const isEvening = hour >= 17 || hour < 6;

  // Time-based recommendations
  if (isMorning) {
    if (stats.total_orders > 0) {
      return "Morning Pick-Me-Up";
    }
    return "Start Your Day Right";
  }

  if (isAfternoon) {
    if (stats.total_orders > 5) {
      return "Afternoon Refill";
    }
    return "Afternoon Boost";
  }

  if (isEvening) {
    if (stats.total_orders > 0) {
      return "Evening Wind-Down";
    }
    return "Evening Treat";
  }

  return "Recommended for You";
};

const getRecommendationIcon = (user, stats, analyticsData) => {
  const hour = new Date().getHours();
  const isMorning = hour >= 6 && hour < 11;
  const isAfternoon = hour >= 11 && hour < 17;
  const isEvening = hour >= 17 || hour < 6;

  if (isMorning) {
    return <FaCoffee />;
  }
  if (isAfternoon) {
    return <FaClock />;
  }
  return <FaMoon />;
};

const getRecommendationTitle = (user, stats, analyticsData) => {
  const hour = new Date().getHours();
  const isMorning = hour >= 6 && hour < 11;
  const isAfternoon = hour >= 11 && hour < 17;
  const isEvening = hour >= 17 || hour < 6;

  // Get top product from analytics if available
  const topProduct = analyticsData?.top_products?.[0];
  const topProductName = topProduct?.product_name || topProduct?.name || "Our Featured Brew";

  if (isMorning) {
    if (stats.total_orders > 10) {
      return "Barista's Choice Morning Blend";
    }
    return topProductName;
  }

  if (isAfternoon) {
    if (stats.total_orders > 5) {
      return "Iced Caramel Macchiato";
    }
    return `${topProductName} Iced`;
  }

  if (isEvening) {
    if (stats.total_orders > 0) {
      return "Decaf Espresso Roast";
    }
    return "Decaf " + topProductName;
  }

  return topProductName || "House Special";
};

const getRecommendationDescription = (user, stats, analyticsData) => {
  const hour = new Date().getHours();
  const isMorning = hour >= 6 && hour < 11;
  const isAfternoon = hour >= 11 && hour < 17;
  const isEvening = hour >= 17 || hour < 6;

  if (isMorning) {
    if (stats.total_orders > 0) {
      return "Bold and energizing to kickstart your day";
    }
    return "A smooth, balanced blend perfect for morning";
  }

  if (isAfternoon) {
    if (stats.total_orders > 5) {
      return "Sweet and refreshing for that afternoon lift";
    }
    return "Cool, refreshing option for warmer afternoons";
  }

  if (isEvening) {
    if (stats.total_orders > 0) {
      return "Smooth and caffeine-free for evening enjoyment";
    }
    return "Rich flavor without the caffeine for evening";
  }

  return "Customer favorite with perfect balance of flavor";
};

const QUICK_ACTIONS = [
  { path: '/products', label: 'Browse Menu', icon: FaCoffee, color: 'rgba(0,104,55,0.1)', iconColor: 'var(--color-dark-green)', desc: 'Discover new flavors' },
    { path: '/orders', label: 'My Orders', icon: FaClipboardList, color: 'rgba(0,104,55,0.1)', iconColor: 'var(--color-dark-green)', desc: 'Track & manage orders' },
    { path: '/cart', label: 'My Cart', icon: FaShoppingBag, color: 'rgba(155,107,0,0.1)', iconColor: 'var(--color-warning)', desc: 'Review your cart' },
    { path: '/profile', label: 'Profile', icon: FaUser, color: 'rgba(0,104,55,0.1)', iconColor: 'var(--color-dark-green)', desc: 'Account settings' },
];

/* ── motion variants ── */
const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.4 } }) };

/* ================================================================ */

const CustomerDashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [rewardsData, setRewardsData] = useState(null);
  const [expandedDateIndex, setExpandedDateIndex] = useState(null);

  const stats = dashboardData?.statistics || {};
  const recentOrders = useMemo(() => dashboardData?.recent_orders || [], [dashboardData]);
  const activeOrder = dashboardData?.active_order;

  // Group orders by date and order type for improved order history
  const groupedOrders = useMemo(() => {
    if (!recentOrders || recentOrders.length === 0) return [];

    // Group by date first
    const ordersByDate = {};
    recentOrders.forEach(order => {
      const date = new Date(order.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });

      if (!ordersByDate[date]) {
        ordersByDate[date] = {};
      }

      // Then group by order type within each date
      const orderType = order.order_type || 'dine_in';
      if (!ordersByDate[date][orderType]) {
        ordersByDate[date][orderType] = [];
      }

      ordersByDate[date][orderType].push(order);
    });

    // Convert to array of dates sorted by date (newest first)
    return Object.keys(ordersByDate)
      .sort((a, b) => new Date(b) - new Date(a)) // Newest first
      .map(date => ({
        date,
        orderTypes: Object.keys(ordersByDate[date])
          .sort() // Sort order types alphabetically
          .map(orderType => ({
            orderType,
            orders: ordersByDate[date][orderType]
          }))
      }));
  }, [recentOrders]);

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

  useEffect(() => { fetchDashboard(); }, []);
  useEffect(() => { fetchAnalytics(); }, []);
  useEffect(() => { fetchRewards(); }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await apiService.get(API_ENDPOINTS.CUSTOMER.DASHBOARD);
      if (res.success) setDashboardData(res.data);
      else setError('Failed to load dashboard');
    } catch {
      setError('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const res = await apiService.get(API_ENDPOINTS.CUSTOMER.ANALYTICS);
      if (res.success) setAnalyticsData(res.data);
    } catch {
      // analytics is non-critical; silently skip on error
    }
  };

  const fetchRewards = async () => {
    try {
      const res = await apiService.get(API_ENDPOINTS.CUSTOMER.REWARDS);
      if (res.success) setRewardsData(res.data);
    } catch {
      // rewards is non-critical; silently skip on error
    }
  };

  const reorderOrder = async (orderId) => {
    try {
      const res = await apiService.post(API_ENDPOINTS.ORDERS.REORDER(orderId));
      if (res.success) {
        showSuccessNotification(
          'Order Reordered',
          'Items from order #' + orderId + ' have been added to your cart.'
        );
        // Refresh cart count or show confirmation
      } else {
        throw new Error(res.message || 'Reorder failed');
      }
    } catch (error) {
      showErrorNotification('Failed to reorder', error.message || 'Unable to reorder this item');
    }
  };

  /* ── Loading ─────────── */
  if (loading) {
    return (
      <main role="main">
        <ResponsiveContainer className="py-5 text-center">
          <ResponsiveSpinner />
          <p className="mt-3 text-muted">Loading your dashboard…</p>
        </ResponsiveContainer>
      </main>
    );
  }

  /* ── Error ──────────── */
  if (error) {
    return (
      <main role="main">
        <ResponsiveContainer className="py-5 text-center">
          <p className="text-danger mb-3">{error}</p>
          <ResponsiveButton variant="outline-primary" size="sm" onClick={fetchDashboard}>Retry</ResponsiveButton>
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
    <main role="main">
      <SEO title="Dashboard" url="/customer/dashboard" />
      <PullToRefresh onRefresh={fetchDashboard}>
        <ResponsiveContainer className="py-4">

        {/* ─── Hero Greeting ────────────────── */}
        <motion.div className="cdb-hero" initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <p className="cdb-hero-greeting">{getGreeting(user, stats)}</p>
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
                Order #{activeOrder.id} is <ResponsiveBadge type="order" status={activeOrder.status} />
              </div>
              <div className="cdb-active-meta">
                {activeOrder.order_items?.length || '—'} items · ₱{fmt(activeOrder.total_amount)}
              </div>
            </div>
            <ResponsiveButton to={`/orders/${activeOrder.id}`} variant="warning" size="sm" className="cdb-active-btn fw-semibold">
              Track Order <FaArrowRight className="ms-1" />
            </ResponsiveButton>
          </motion.div>
        )}

        {/* ─── Stat Cards ───────────────────── */}
        <ResponsiveRow className="g-4">
          {[
            { label: 'Total Orders', value: stats.total_orders || 0, Icon: FaShoppingBag, mod: 'orders' },
            { label: 'Completed', value: stats.completed_orders || 0, Icon: FaCheckCircle, mod: 'completed' },
            { label: 'Active', value: stats.active_orders || 0, Icon: FaClock, mod: 'active' },
            { label: 'Total Spent', value: `₱${fmt(stats.total_spent)}`, Icon: FaWallet, mod: 'spent' },
          ].map((s, i) => (
            <ResponsiveCol md={6} lg={3} key={s.label}>
              <ResponsiveCard className="border-0 shadow-sm h-100">
                <div className="p-3">
                  <div className="d-flex align-items-center mb-2">
                    <s.Icon className={`text-${s.mod === 'orders' ? 'warning' : s.mod === 'completed' ? 'success' : s.mod === 'active' ? 'info' : 'text-dark'} me-2`} size={20} />
                    <h5 className="mb-0">{s.label}</h5>
                  </div>
                  <p className="fs-3 fw-bold mb-0">{s.value}</p>
                </div>
              </ResponsiveCard>
            </ResponsiveCol>
          ))}
        </ResponsiveRow>

        {/* ─── Quick Actions ────────────────── */}
        <ResponsiveRow className="g-4">
          {QUICK_ACTIONS.map((a, i) => (
            <ResponsiveCol md={6} lg={3} key={a.path}>
              <motion.div initial="hidden" animate="visible" variants={fadeUp}>
                <Link to={a.path} className="text-decoration-none d-block">
                  <div className="d-flex align-items-start">
                    <div className="cdb-action-icon-wrap me-3" style={{ background: a.color, color: a.iconColor, width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px' }}>
                      <a.icon />
                    </div>
                    <div>
                      <h6 className="mb-1">{a.label}</h6>
                      <p className="mb-0 text-muted small">{a.desc}</p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            </ResponsiveCol>
          ))}
        </ResponsiveRow>

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

            {/* Top products from analytics */}
            {analyticsData?.top_products?.length > 0 && (
              <div className="cdb-quick-stats mt-3">
                <div className="cdb-section-header">
                  <h2 className="cdb-section-title"><FaFire size={14} className="me-1" style={{ color: '#e67e22' }} />Top Products</h2>
                </div>
                {analyticsData.top_products.slice(0, 5).map((p, i) => (
                  <div className="cdb-quick-stat-row" key={p.product_id || p.id || i}>
                    <span className="cdb-quick-stat-label">{p.product_name || p.name}</span>
                    <span className="cdb-quick-stat-value">{p.order_count || p.quantity || p.count}×</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Smart Recommendations */}
          {analyticsData && (
            <div className="cdb-quick-stats mt-3">
              <div className="cdb-section-header">
                <h2 className="cdb-section-title"><FaStar className="me-1" />{getSmartRecommendationTitle(user, stats, analyticsData)}</h2>
              </div>
              <div className="cdb-recommendation-card">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="cdb-recommendation-item"
                >
                  <div className="cdb-rec-icon">
                    {getRecommendationIcon(user, stats, analyticsData)}
                  </div>
                  <div className="cdb-rec-content">
                    <h3 className="cdb-rec-title">{getRecommendationTitle(user, stats, analyticsData)}</h3>
                    <p className="cdb-rec-description">{getRecommendationDescription(user, stats, analyticsData)}</p>
                    <Link to="/products" className="cdb-rec-button">
                      Try It Now <FaArrowRight className="ms-1" />
                    </Link>
                  </div>
                </motion-div>
              </div>
            </div>
          )}

          {/* Rewards Visualization */}
          {rewardsData && (
            <div className="cdb-quick-stats mt-3">
              <div className="cdb-section-header">
                <h2 className="cdb-section-title"><FaGift className="me-1" />Rewards & Loyalty</h2>
              </div>
              <div className="cdb-rewards-container">
                {/* Progress Bar with Tier Milestones */}
                <div className="cdb-rewards-progress">
                  <div className="cdb-progress-label">
                    <span>Loyalty Points</span>
                    <span className="cdb-progress-value">{rewardsData.points} pts</span>
                  </div>
                  <div className="cdb-progress-bar">
                    <div
                      className="cdb-progress-fill"
                      style={{ width: `${Math.min(rewardsData.progressPercent, 100)}%` }}
                    >
                      {/* Tier milestones */}
                      {rewardsData.tiers.map((tier, index) => (
                        <div
                          key={`tier-${index}`}
                          className="cdb-tier-marker"
                          style={{ left: `${tier.percent}%` }}
                        >
                          <div className="cdb-tier-dot" />
                          <div className="cdb-tier-label">{tier.name}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="cdb-progress-text">
                    {rewardsData.pointsToNextTier} pts to next tier
                  </div>
                </div>

                {/* Reward Redemption Preview */}
                <div className="cdb-rewards-preview">
                  <h3 className="cdb-preview-title">Available Rewards</h3>
                  {rewardsData.availableRewards.length > 0 ? (
                    <div className="cdb-rewards-list">
                      {rewardsData.availableRewards.map((reward, index) => (
                        <div
                          key={`reward-${index}`}
                          className={`cdb-reward-item ${rewardsData.points >= reward.points ? 'affordable' : 'unaffordable'}`}
                        >
                          <div className="cdb-reward-info">
                            <h4 className="cdb-reward-name">{reward.name}</h4>
                            <p className="cdb-reward-description">{reward.description}</p>
                          </div>
                          <div className="cdb-reward-cost">
                            <FaStar className="me-1" />
                            {reward.points} pts
                            {rewardsData.points >= reward.points ? (
                              <ResponsiveButton
                                variant="outline-success"
                                size="sm"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  // TODO: Implement reward redemption
                                }}
                              >
                                Redeem
                              </ResponsiveButton>
                            ) : (
                              <span className="text-muted">Not enough points</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted">Check back soon for available rewards!</p>
                  )}
                </div>

                {/* Expiration Warnings */}
                {rewardsData.expiringPoints && rewardsData.expiringPoints.length > 0 && (
                  <div className="cdb-expiration-warnings">
                    <h3 className="cdb-expiration-title">Points Expiring Soon</h3>
                    {rewardsData.expiringPoints.map((expiry, index) => (
                      <div
                        key={`expiry-${index}`}
                        className="cdb-expiry-item"
                      >
                        <div className="cdb-expiry-info">
                          <span className="cdb-expiry-amount">-{expiry.points} pts</span>
                          <span className="cdb-expiry-date">{new Date(expiry.expiresAt).toLocaleDateString()}</span>
                        </div>
                        <div className="cdb-expiry-action">
                          <ResponsiveButton
                            variant="outline-warning"
                            size="sm"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              // TODO: Implement points preservation
                            }}
                          >
                            Use Points
                          </ResponsiveButton>
                        </div>
                      >
                    ))}
                  </div>
                )}
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
              groupedOrders.map((dateGroup, dateIndex) => (
                <div key={`date-${dateIndex}`} className="cdb-order-group">
                  <div className="cdb-order-group-header" onClick={() => setExpandedDateIndex(expandedDateIndex === dateIndex ? null : dateIndex)}>
                    <div className="cdb-order-date">{dateGroup.date}</div>
                    <div className="cdb-order-type-count">
                      {dateGroup.orderTypes.reduce((total, typeGroup) => total + typeGroup.orders.length, 0)} orders
                      <span className={`cdb-toggle-icon ${expandedDateIndex === dateIndex ? 'open' : 'closed'}`}>
                        {expandedDateIndex === dateIndex ? '▲' : '▼'}
                      </span>
                    </div>
                  </div>

                  {expandedDateIndex === dateIndex && (
                    <div className="cdb-order-group-body">
                      {dateGroup.orderTypes.map((typeGroup, typeIndex) => (
                        <div key={`type-${dateIndex}-${typeIndex}`} className="cdb-order-type-group">
                          <div className="cdb-order-type-header">
                            <span className="cdb-order-type-label">
                              {typeGroup.orderType === 'dine_in' ? 'Dine In' :
                               typeGroup.orderType === 'takeaway' ? 'Takeaway' :
                               typeGroup.orderType === 'delivery' ? 'Delivery' :
                               typeGroup.orderType}
                            </span>
                            <span className="cdb-order-type-count">
                              ({typeGroup.orders.length})
                            </span>
                          </div>
                          <div className="cdb-order-type-items">
                            {typeGroup.orders.map((order) => (
                              <Link key={order.id} to={`/orders/${order.id}`} className="cdb-order-item" onClick={(e) => {
                                // Prevent triggering expand/collapse when clicking on order link
                                e.stopPropagation();
                              }}>
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
                                    <ResponsiveBadge type="order" status={order.status} />
                                  </div>
                                </div>
                                <div className="cdb-order-reorder">
                                  <Button
                                    variant="outline-secondary"
                                    size="sm"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      // Call reorder API
                                      reorderOrder(order.id);
                                    }}
                                  >
                                    <FaSync className="me-1" />
                                    Reorder
                                  </Button>
                                </div>
                              </Link>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="cdb-empty">
                <div className="cdb-empty-icon"><FaCoffee /></div>
                <p className="cdb-empty-text">No orders yet. Ready for your first cup?</p>
                <Link to="/products" className="cdb-empty-link">Browse Menu <FaArrowRight className="ms-1" size={12} /></Link>
              </div>
            )}
          </div>
        </div>
      </ResponsiveContainer>
    </PullToRefresh>
    </main>
  );
};

export default CustomerDashboard;
