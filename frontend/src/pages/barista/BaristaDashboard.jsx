import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  FaClock, FaCheckCircle, FaUtensils, FaChartLine, FaCoffee,
  FaTasks, FaCalendarAlt, FaSignInAlt, FaDollarSign, FaStopwatch,
  FaSync, FaExclamationTriangle, FaBolt, FaList,
  FaBoxes, FaLeaf, FaClipboardList, FaChevronRight,
  FaEye, FaUsers,
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { API_ENDPOINTS } from '../../config/api';
import apiService from '../../services/api.service';
import { useBaristaOrders } from '../../hooks/useBroadcast';
import { useNotificationSystem } from '../../components/common/NotificationSystem';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardNavigation';
import { useSwipeToDismiss } from '../../hooks/useSwipeToDismiss';
import { usePullToRefresh } from '../../hooks/usePullToRefresh';
import useApiError from '../../hooks/useApiError';
import ResponsiveButton from '@/components/responsive/Button';
import ResponsiveCard from '@/components/responsive/Card';
import ResponsiveForm from '@/components/responsive/Form';
import ResponsiveModal from '@/components/responsive/Modal';
import ResponsiveRow from '@/components/responsive/Row';
import ResponsiveCol from '@/components/responsive/Col';
import './BaristaDashboard.css';

/* ─── helpers ───────────────────────────────────────────────────── */
const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
};

const fmt = (v, prefix = '₱') => {
  const n = parseFloat(v);
  return isNaN(n) ? '0.00' : prefix + n.toFixed(2);
};

const todayLabel = () => {
  const today = new Date();
  return today.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
};

/* ─── Connection Status Chip ────────────────────────────────────── */
const ConnChip = ({ isConnected, isConnecting, lastUpdated }) => {
  const [connectingSince, setConnectingSince] = useState(null);

  useEffect(() => {
    if (isConnecting && !connectingSince) setConnectingSince(Date.now());
    if (!isConnecting) setConnectingSince(null);
  }, [isConnecting, connectingSince]);

  return (
    <span className={`bd-conn-chip ${isConnected ? 'live' : isConnecting ? 'connecting' : 'offline'}`}>
      <span
        className="bd-conn-dot"
        style={{
          animation: isConnected && !isConnecting ? 'bd-pulse 1.6s infinite' : 'none'
        }}
      />
      {isConnected ? 'Live' : isConnecting ? (
        <>
          Reconnecting...
          {connectingSince && (
            <span className="bd-reconnecting-time">
              ({Math.floor((Date.now() - connectingSince) / 1000)}s)
            </span>
          )}
        </>
      ) : 'Offline'}
      {lastUpdated && (
        <span className="bd-last-updated ml-2">
          Last updated: {lastUpdated}
        </span>
      )}
    </span>
  );
};

/* ─── Skeleton loader ───────────────────────────────────────────── */
const SkeletonLoader = () => (
  <>
    <div className="bd-skeleton-stat-grid">
      {[0,1,2,3].map(i => <div key={i} className="bd-skeleton bd-skeleton-stat" />)}
    </div>
    <div className="bd-skeleton" style={{ height: 260, borderRadius: 12, marginBottom: '1.25rem' }} />
    <div className="bd-skeleton" style={{ height: 200, borderRadius: 12 }} />
  </>
);

/* ═══════════════════════════════════════════════════════════════════
   BARISTA DASHBOARD
   ════════════════════════════════════════════════════════════════════ */
const BaristaDashboard = () => {
  const { user } = useAuth();
  const { showOrderNotification } = useNotificationSystem();

  const [dashboardData, setDashboardData]   = useState(null);
  const [workforceData, setWorkforceData]   = useState(null);
  const [queueData, setQueueData]           = useState(null);
  const [loading, setLoading]               = useState(true);
  const [refreshing, setRefreshing]         = useState(false);
  const [lastUpdated, setLastUpdated]       = useState(null);

  /* Swipe-to-dismiss state */
  const [swipeOrders, setSwipeOrders] = useState({}); // orderId -> {x: number, dismissing: boolean}

  /* Keyboard shortcuts */
  const handleDeleteOrder = () => {
    // For demo purposes, we'll just show a notification
    // In a real app, this might dismiss the oldest order or selected order
    showOrderNotification('Order dismissed via keyboard shortcut', 'info');
  };

  const handleEnterOrder = () => {
    // For demo purposes, we'll just show a notification
    // In a real app, this might mark the oldest order as processed
    showOrderNotification('Order marked as processed via keyboard shortcut', 'success');
  };

  useKeyboardShortcuts({
    'delete': handleDeleteOrder,
    'enter': handleEnterOrder
  }, true);

  const handleDismissOrder = (orderId) => {
    // Optimistic update: remove from queue immediately
    setQueueData(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        pending_orders: prev.pending_orders.filter(order => order.id !== orderId),
        preparing_orders: prev.preparing_orders.filter(order => order.id !== orderId),
        ready_orders: prev.ready_orders.filter(order => order.id !== orderId)
      };
    });

    // Show notification
    showOrderNotification('Order dismissed', 'info');

    // In a real app, you might want to call an API to actually dismiss/complete the order
    // For now, we'll just refresh the data to sync with server
    fetchDashboardData(false);
  };

  /* real-time orders ----------------------------------------- */
  const { isConnected: realtimeConnected, isConnecting: realtimeConnecting } = useBaristaOrders((newOrder) => {
    showOrderNotification(newOrder, 'New Order Received!');
    fetchDashboardData(false);
    // Update last updated timestamp
    setLastUpdated(new Date());
  });

  /* data fetch ----------------------------------------------- */
  const { errorInfo, getErrorInfo } = useApiError();
  const fetchDashboardData = useCallback(async (showLoad = true) => {
    try {
      if (showLoad) setLoading(true);
      else setRefreshing(true);
      // Note: useApiError doesn't expose a direct setter to clear error,
      // but successful calls will naturally overwrite any existing error state
      // We also clear loading/refreshing states in finally block

      /* main stats */
      const dashRes = await apiService.get(API_ENDPOINTS.BARISTA.DASHBOARD);
      if (dashRes.success) setDashboardData(dashRes.data);

      /* queue preview */
      try {
        const qRes = await apiService.get(API_ENDPOINTS.BARISTA.ORDER_QUEUE);
        if (qRes.success) setQueueData(qRes.data);
      } catch { /* non-fatal */ }

      /* workforce */
      try {
        const [shiftRes, tasksRes] = await Promise.all([
          apiService.get(API_ENDPOINTS.BARISTA.SHIFT_CURRENT),
          apiService.get(API_ENDPOINTS.BARISTA.TASKS_TODAY),
        ]);
        setWorkforceData({
          currentShift: shiftRes.success ? shiftRes.data : null,
          todaysTasks:  tasksRes.success  ? tasksRes.data  : [],
        });
      } catch { setWorkforceData(null); }

    } catch (err) {
      getErrorInfo(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchDashboardData(); }, [fetchDashboardData]);

  /* derived -------------------------------------------------- */
  const pendingOrders   = dashboardData?.pending_orders   || 0;
  const preparingOrders = dashboardData?.preparing_orders || 0;
  const completedToday  = dashboardData?.completed_today  || 0;
  const revenue         = dashboardData?.total_revenue_today || 0;
  const avgPrepTime     = dashboardData?.average_preparation_time || '—';
  const ordersPerHour   = completedToday
    ? (Math.round((completedToday / 8) * 10) / 10).toString() : '0';

  const todaysTasks     = workforceData?.todaysTasks || [];
  const completedTasks  = todaysTasks.filter(t => t.status === 'completed').length;
  const currentShift    = workforceData?.currentShift;

  /* queue items: flatten pending + preparing + ready */
  const liveQueue = [
    ...(queueData?.pending_orders   || []),
    ...(queueData?.preparing_orders || []),
    ...(queueData?.ready_orders     || []),
  ].slice(0, 8);

  /* ── render ───────────────────────────────────────────────── */
  // Set up pull-to-refresh hook
  const { onTouchStart, onTouchMove, onTouchEnd } = usePullToRefresh(
    () => fetchDashboardData(false),
    { threshold: 100 }
  );

  return (
    <main
      className="bd-page"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      style={{ touchAction: 'manipulation' }}
    >

      {/* Header ─────────────────────────────────────────────── */}
      <div className="bd-header d-flex justify-content-between align-items-center">
        <div className="bd-header-left">
          <h1 className="bd-title">{getGreeting()}, {user?.name || 'Barista'}!</h1>
          <p className="bd-subtitle">{todayLabel()}</p>
        </div>
        <div className="bd-header-right d-flex align-items-center gap-3">
          <ConnChip isConnected={realtimeConnected} isConnecting={realtimeConnecting} lastUpdated={lastUpdated} />
          <ResponsiveButton
            variant="outline-secondary"
            size="sm"
            className="bd-refresh-btn"
            onClick={() => fetchDashboardData(false)}
            disabled={refreshing || loading}
          >
            <FaSync className={refreshing ? 'spinning' : ''} />
            {refreshing ? 'Refreshing…' : 'Refresh'}
          </ResponsiveButton>
        </div>
      </div>

      {/* Offline warning ─────────────────────────────────────── */}
      {!realtimeConnected && !loading && (
        <div className="bd-warn">
          <FaExclamationTriangle />
          Real-time updates unavailable — please refresh periodically to check for new orders.
        </div>
      )}

      {/* Error ───────────────────────────────────────────────── */}
      {errorInfo && (
        <div className="bd-error">
          <FaExclamationTriangle className="bd-error-icon" />
          <span>{errorInfo.message}</span>
          {errorInfo.actions && errorInfo.actions.length > 0 && (
            <div className="mt-3 d-flex gap-2">
              {errorInfo.actions.map((action, index) => (
                <ResponsiveButton
                  key={index}
                  variant={action.variant || 'primary'}
                  size="sm"
                  onClick={action.onClick}
                  style={{ marginRight: index < errorInfo.actions.length - 1 ? '0.5rem' : 0 }}
                >
                  {action.label}
                </ResponsiveButton>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Skeleton / Content ──────────────────────────────────── */}
      {loading ? <SkeletonLoader /> : (
        <>
          {/* ── Stat Cards ────────────────────────────────────── */}
          <ResponsiveRow className="g-4 mb-4">
            <ResponsiveCol md={6} lg={3}>
              <ResponsiveCard className="border-0 shadow-sm h-100">
                <div className="p-3">
                  <div className="d-flex align-items-center mb-2">
                    <FaClock className="text-warning me-2" size={20} />
                    <h5 className="mb-0">Pending Orders</h5>
                  </div>
                  <p className="fs-4 fw-bold mb-0">{pendingOrders}</p>
                </div>
              </ResponsiveCard>
            </ResponsiveCol>
            <ResponsiveCol md={6} lg={3}>
              <ResponsiveCard className="border-0 shadow-sm h-100">
                <div className="p-3">
                  <div className="d-flex align-items-center mb-2">
                    <FaUtensils className="text-primary me-2" size={20} />
                    <h5 className="mb-0">Preparing</h5>
                  </div>
                  <p className="fs-4 fw-bold mb-0">{preparingOrders}</p>
                </div>
              </ResponsiveCard>
            </ResponsiveCol>
            <ResponsiveCol md={6} lg={3}>
              <ResponsiveCard className="border-0 shadow-sm h-100">
                <div className="p-3">
                  <div className="d-flex align-items-center mb-2">
                    <FaCheckCircle className="text-success me-2" size={20} />
                    <h5 className="mb-0">Completed Today</h5>
                  </div>
                  <p className="fs-4 fw-bold mb-0">{completedToday}</p>
                </div>
              </ResponsiveCard>
            </ResponsiveCol>
            <ResponsiveCol md={6} lg={3}>
              <ResponsiveCard className="border-0 shadow-sm h-100">
                <div className="p-3">
                  <div className="d-flex align-items-center mb-2">
                    <FaDollarSign className="text-info me-2" size={20} />
                    <h5 className="mb-0">Today's Revenue</h5>
                  </div>
                  <p className="fs-4 fw-bold mb-0">{fmt(revenue)}</p>
                </div>
              </ResponsiveCard>
            </ResponsiveCol>
          </ResponsiveRow>

          {/* ── KPI Metrics ───────────────────────────────────── */}
          <ResponsiveRow className="g-4">
            <ResponsiveCol md={4}>
              <ResponsiveCard className="border-0 shadow-sm h-100">
                <div className="p-3">
                  <div className="d-flex align-items-center mb-2">
                    <FaStopwatch className="text-primary me-2" size={18} />
                    <h5 className="mb-0">Avg Preparation Time</h5>
                  </div>
                  <p className="fs-5 fw-bold mb-0">{avgPrepTime}</p>
                </div>
              </ResponsiveCard>
            </ResponsiveCol>
            <ResponsiveCol md={4}>
              <ResponsiveCard className="border-0 shadow-sm h-100">
                <div className="p-3">
                  <div className="d-flex align-items-center mb-2">
                    <FaChartLine className="text-success me-2" size={18} />
                    <h5 className="mb-0">Orders per Hour</h5>
                  </div>
                  <p className="fs-5 fw-bold mb-0">{ordersPerHour}</p>
                </div>
              </ResponsiveCard>
            </ResponsiveCol>
            <ResponsiveCol md={4}>
              <ResponsiveCard className="border-0 shadow-sm h-100">
                <div className="p-3">
                  <div className="d-flex align-items-center mb-2">
                    <FaClipboardList className="text-warning me-2" size={18} />
                    <h5 className="mb-0">Tasks Completed</h5>
                  </div>
                  <p className="fs-5 fw-bold mb-0">{completedTasks}/{todaysTasks.length}</p>
                </div>
              </ResponsiveCard>
            </ResponsiveCol>
          </ResponsiveRow>

          {/* ── Live Order Queue ───────────────────────────────── */}
          <ResponsiveRow className="g-4">
            <ResponsiveCol xs={12}>
              <ResponsiveCard className="border-0 shadow-sm h-100">
                <div className="p-4">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <h5 className="mb-0">
                      <FaClipboardList className="me-2" /> Live Order Queue ({liveQueue.length})
                    </h5>
                    <div className="d-flex gap-2">
                      {liveQueue.length > 0 && (
                        <ResponsiveButton
                          variant="outline-primary"
                          size="sm"
                          onClick={() => {
                            // In a real app, this might show all orders or open order management
                            showOrderNotification('Viewing all orders', 'info');
                          }}
                        >
                          <FaEye /> View All
                        </ResponsiveButton>
                      )}
                    </div>
                  </div>
                  {liveQueue.length === 0 ? (
                    <div className="text-center py-3">
                      <FaClipboardList className="mb-2" style={{ fontSize: '2rem', opacity: '0.3' }} />
                      <p className="mb-0">No active orders</p>
                    </div>
                  ) : (
                    <div className="queue-list">
                      {liveQueue.map((order) => {
                        const isSwiping = swipeOrders[order.id]?.dismissing;
                        const swipeX = swipeOrders[order.id]?.x || 0;

                        return (
                          <div
                            key={order.id}
                            className={`bd-order-item${isSwiping ? ' dismissing' : ''}`}
                            style={{ transform: `translateX(${swipeX}px)` }}
                            onTouchStart={(e) => {
                              const touch = e.touches[0];
                              setSwipeOrders(prev => ({
                                ...prev,
                                [order.id]: { x: touch.clientX, dismissing: false }
                              }));
                            }}
                            onTouchMove={(e) => {
                              const touch = e.touches[0];
                              const startX = swipeOrders[order.id]?.x || 0;
                              const diffX = touch.clientX - startX;

                              // Update position while tracking if user is swiping far enough to dismiss
                              setSwipeOrders(prev => ({
                                ...prev,
                                [order.id]: {
                                  x: startX + diffX,
                                  dismissing: Math.abs(diffX) > 60
                                }
                              }));
                            }}
                            onTouchEnd={() => {
                              if (swipeOrders[order.id]?.dismissing) {
                                handleDismissOrder(order.id);
                              } else {
                                // Reset position
                                setSwipeOrders(prev => ({
                                  ...prev,
                                  [order.id]: { x: 0, dismissing: false }
                                }));
                              }
                            }}
                          >
                            <div className="bd-order-content">
                              <div className="bd-order-header d-flex justify-content-between align-items-start">
                                <div>
                                  <h6 className="mb-1">#{order.order_number}</h6>
                                  <p className="text-muted small">
                                    {order.customer?.name || 'Guest Customer'}
                                  </p>
                                </div>
                                <span className={`bd-status-badge bd-status-${order.status}`}>
                                  {order.status.toUpperCase()}
                                </span>
                              </div>
                              <div className="bd-order-details mt-2">
                                <div className="d-flex gap-3">
                                  <div className="bd-order-item-info">
                                    <strong>Items:</strong> {order.total_items || 0}
                                  </div>
                                  <div className="bd-order-item-info">
                                    <strong>Total:</strong> {fmt(order.total_amount || 0)}
                                  </div>
                                  <div className="bd-order-item-info">
                                    <strong>Time:</strong> {new Date(order.created_at).toLocaleTimeString()}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </ResponsiveCard>
            </ResponsiveCol>
          </ResponsiveRow>

          {/* ── Workforce Overview ─────────────────────────────── */}
          <ResponsiveRow className="g-4 mt-4">
            <ResponsiveCol xs={12} sm={6} md={4}>
              <ResponsiveCard className="border-0 shadow-sm h-100">
                <div className="p-3">
                  <div className="d-flex align-items-center mb-2">
                    <FaUsers className="text-info me-2" size={20} />
                    <h5 className="mb-0">Team Status</h5>
                  </div>
                  {currentShift ? (
                    <>
                      <p className="fs-5 fw-bold mb-1">{currentShift.name || 'Shift'}</p>
                      <p className="text-sm mb-0">
                        {currentShift.start_time} – {currentShift.end_time}
                      </p>
                    </>
                  ) : (
                    <p className="text-muted text-center py-2">No active shift</p>
                  )}
                </div>
              </ResponsiveCard>
            </ResponsiveCol>
            <ResponsiveCol xs={12} sm={6} md={4}>
              <ResponsiveCard className="border-0 shadow-sm h-100">
                <div className="p-3">
                  <div className="d-flex align-items-center mb-2">
                    <FaTasks className="text-warning me-2" size={20} />
                    <h5 className="mb-0">Today's Tasks</h5>
                  </div>
                  <p className="fs-5 fw-bold mb-1">{completedTasks}/{todaysTasks.length} Completed</p>
                  {todaysTasks.length > 0 && (
                    <div className="progress-wrapper">
                      <div className="progress-bg">
                        <div className="progress-fill" style={{ width: `${(completedTasks / todaysTasks.length * 100) || 0}%` }} />
                      </div>
                    </div>
                  )}
                </div>
              </ResponsiveCard>
            </ResponsiveCol>
            <ResponsiveCol xs={12} sm={6} md={4}>
              <ResponsiveCard className="border-0 shadow-sm h-100">
                <div className="p-3">
                  <div className="d-flex align-items-center mb-2">
                    <FaCalendarAlt className="text-success me-2" size={20} />
                    <h5 className="mb-0">Attendance</h5>
                  </div>
                  <p className="fs-5 fw-bold mb-1">{workforceData?.attendance_present || 0}/{workforceData?.attendance_scheduled || 0} Present</p>
                </div>
              </ResponsiveCard>
            </ResponsiveCol>
          </ResponsiveRow>
        </>
      )}
    </main>
  );
};

export default BaristaDashboard;