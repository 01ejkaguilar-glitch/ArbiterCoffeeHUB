import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  FaClock, FaCheckCircle, FaUtensils, FaChartLine,
  FaTasks, FaCalendarAlt, FaSignInAlt, FaStopwatch,
  FaSync, FaExclamationTriangle, FaBolt, FaList,
  FaBoxes, FaClipboardList, FaChevronRight,
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { API_ENDPOINTS } from '../../config/api';
import apiService from '../../services/api.service';
import { useKitchenOrders } from '../../hooks/useBroadcast';
import { useNotificationSystem } from '../../components/common/NotificationSystem';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardNavigation';
import { useSwipeToDismiss } from '../../hooks/useSwipeToDismiss';
import SwipeableOrderItem from '../../components/shared/SwipeableOrderItem';
import {
  ResponsiveButton,
  ResponsiveCard,
  ResponsiveContainer,
  ResponsiveCol,
  ResponsiveRow,
} from '@/components/responsive';
import './KitchenDashboard.css';

const POLL_INTERVAL = 30000; // 30 s fallback polling

/* ─── helpers ─────────────────────────────────────────────────── */
const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
};

const todayLabel = new Date().toLocaleDateString('en-US', {
  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
});

/* ─── Connection chip ────────────────────────────────────────── */
const ConnChip = ({ isConnected, isConnecting, lastUpdated }) => {
  return (
    <span className={`kd-conn-chip ${isConnected ? 'live' : isConnecting ? 'connecting' : 'offline'}`}>
      <span
        className="kd-conn-dot"
        style={{
          animation: isConnected && !isConnecting ? 'kd-pulse 1.6s infinite' : 'none'
        }}
      />
      {isConnected ? 'Live' : isConnecting ? 'Reconnecting...' : 'Offline'}
      {lastUpdated && (
        <span className="kd-last-updated ml-2">
          Last updated: {lastUpdated.toLocaleTimeString()}
        )
      )}
    </span>
  );
};

/* ─── Skeleton loader ────────────────────────────────────────── */
const SkeletonLoader = () => (
  <>
    <div className="kd-skeleton-stat-grid">
      {[0,1,2,3].map(i => <div key={i} className="kd-skeleton kd-skeleton-stat" />)}
    </div>
    <div className="kd-skeleton" style={{ height: 260, borderRadius: 12, marginBottom: '1.25rem' }} />
    <div className="kd-skeleton" style={{ height: 200, borderRadius: 12 }} />
  </>
);

/* ════════════════════════════════════════════════════════════════
   KITCHEN DASHBOARD
   ════════════════════════════════════════════════════════════════ */
const KitchenDashboard = () => {
  const { user } = useAuth();
  const { showOrderNotification } = useNotificationSystem();

  const [dashboardData, setDashboardData]   = useState(null);
  const [workforceData, setWorkforceData]   = useState(null);
  const [queueData, setQueueData]           = useState(null);
  const [loading, setLoading]               = useState(true);
  const [error, setError]                   = useState(null);
  const [refreshing, setRefreshing]         = useState(false);
  const [lastUpdated, setLastUpdated]       = useState(null);

  // Keyboard shortcuts
  const handleDismissOrder = (orderId) => {
    // Remove the order from the queue
    setQueueData(prev => {
      if (!prev) return prev;

      // Remove from all queue arrays
      const updatedPending = (prev.pending_orders || []).filter(order => order.id !== orderId);
      const updatedPreparing = (prev.preparing_orders || []).filter(order => order.id !== orderId);
      const updatedReady = (prev.ready_orders || []).filter(order => order.id !== orderId);

      return {
        ...prev,
        pending_orders: updatedPending,
        preparing_orders: updatedPreparing,
        ready_orders: updatedReady
      };
    });

    showOrderNotification('Order dismissed', 'info');
  };

  const handleProcessOrder = (orderId) => {
    // For demo purposes, we'll show a notification
    // In a real app, this might mark the oldest order as processed
    showOrderNotification('Order marked as processed via keyboard shortcut', 'success');
  };

  useKeyboardShortcuts({
    'delete': () => {
      // Dismiss the first order in queue for delete key
      const firstOrder =
        (queueData?.pending_orders || [])[0] ||
        (queueData?.preparing_orders || [])[0] ||
        (queueData?.ready_orders || [])[0];

      if (firstOrder) {
        handleDismissOrder(firstOrder.id);
      }
    },
    'enter': () => {
      // Process the first order in queue for enter key
      const firstOrder =
        (queueData?.pending_orders || [])[0] ||
        (queueData?.preparing_orders || [])[0] ||
        (queueData?.ready_orders || [])[0];

      if (firstOrder) {
        showOrderNotification(`Order #${firstOrder.order_number || firstOrder.id} processed`, 'success');
      }
    }
  }, true);

  // ─ Real-time via WebSocket / polling fallback ──────────────────────────────────
  const { isConnected: realtimeConnected, isConnecting: realtimeConnecting } = useKitchenOrders((newOrder) => {
    showOrderNotification(newOrder, 'New Food Order!');
    // Refresh stats so counts stay accurate
    fetchDashboardData(false);
    // Update last updated timestamp
    setLastUpdated(new Date());
  });

  /* data fetch ----------------------------------------------- */
  const fetchDashboardData = useCallback(async (showLoad = true) => {
    try {
      if (showLoad) setLoading(true);
      else setRefreshing(true);
      setError(null);

      const dashRes = await apiService.get(API_ENDPOINTS.KITCHEN.DASHBOARD);
      if (dashRes.success) setDashboardData(dashRes.data);

      try {
        const qRes = await apiService.get(API_ENDPOINTS.KITCHEN.ORDER_QUEUE);
        if (qRes.success) setQueueData(qRes.data);
      } catch { /* non-fatal */ }

      try {
        const [shiftRes, tasksRes] = await Promise.all([
          apiService.get(API_ENDPOINTS.KITCHEN.SHIFT_CURRENT),
          apiService.get(API_ENDPOINTS.KITCHEN.TASKS_TODAY),
        ]);
        setWorkforceData({
          currentShift: shiftRes.success ? shiftRes.data : null,
          todaysTasks:  tasksRes.success  ? tasksRes.data  : [],
        });
      } catch { setWorkforceData(null); }

    } catch {
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Simulate reconnection attempts when disconnected
  // NOTE: This effect is removed because we now get the connecting state from the hook.
  // Keeping the comment for clarity but the effect is gone.

  useEffect(() => {
    fetchDashboardData();
    // 30-second background poll (fallback when WebSocket unavailable)
    const poll = setInterval(() => fetchDashboardData(false), POLL_INTERVAL);
    return () => clearInterval(poll);
  }, [fetchDashboardData]);

  /* derived -------------------------------------------------- */
  const pendingOrders   = dashboardData?.pending_orders   || 0;
  const preparingOrders = dashboardData?.preparing_orders || 0;
  const completedToday  = dashboardData?.completed_today  || 0;
  const totalFoodToday  = dashboardData?.total_food_orders_today || 0;
  const avgPrepTime     = dashboardData?.average_preparation_time || '—';

  const todaysTasks     = workforceData?.todaysTasks || [];
  const completedTasks  = todaysTasks.filter(t => t.status === 'completed').length;
  const currentShift    = workforceData?.currentShift;

  const liveQueue = [
    ...(queueData?.pending_orders   || []),
    ...(queueData?.preparing_orders || []),
    ...(queueData?.ready_orders     || []),
  ].slice(0, 8);

  return (
    <div className="kd-page">

      {/* Header */}
      <div className="kd-header">
        <div className="kd-header-left">
          <h1 className="kd-title">{getGreeting()}, {user?.name || 'Kitchen Staff'}!</h1>
          <p className="kd-subtitle">{todayLabel}</p>
        </div>
        <div className="kd-header-right">
          <ConnChip isConnected={realtimeConnected} isConnecting={realtimeConnecting} lastUpdated={lastUpdated} />
          <button
            className="kd-refresh-btn"
            onClick={() => fetchDashboardData(false)}
            disabled={refreshing || loading}
          >
            <FaSync className={refreshing ? 'spinning' : ''} />
            {refreshing ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>
      </div>

      {!realtimeConnected && !loading && (
        <div className="kd-warn">
          <FaExclamationTriangle />
          Real-time updates unavailable — please refresh periodically to check for new orders.
        </div>
      )}

      {error && (
        <div className="kd-error">
          <FaExclamationTriangle className="kd-error-icon" />
          <span>{error}</span>
        </div>
      )}

      {loading ? <SkeletonLoader /> : (
        <>
          {/* Stat Cards */}
          <ResponsiveRow className="g-4 mb-4">
            <ResponsiveCol md={6} lg={3}>
              <ResponsiveCard className="border-0 shadow-sm h-100">
                <div className="p-3">
                  <div className="d-flex align-items-center mb-2">
                    <FaClock className="text-warning me-2" size={20} />
                    <h5 className="mb-0">Pending Food Orders</h5>
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
                    <FaClipboardList className="text-info me-2" size={20} />
                    <h5 className="mb-0">Total Food Orders Today</h5>
                  </div>
                  <p className="fs-4 fw-bold mb-0">{totalFoodToday}</p>
                </div>
              </ResponsiveCard>
            </ResponsiveCol>
          </ResponsiveRow>

          {/* KPI Metrics */}
          <ResponsiveRow className="g-4">
            <ResponsiveCol md={6}>
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
            <ResponsiveCol md={6}>
              <ResponsiveCard className="border-0 shadow-sm h-100">
                <div className="p-3">
                  <div className="d-flex align-items-center mb-2">
                    <FaClipboardList className="text-success me-2" size={18} />
                    <h5 className="mb-0">Tasks Completed</h5>
                  </div>
                  <p className="fs-5 fw-bold mb-0">{completedTasks} / {todaysTasks.length}</p>
                </div>
              </ResponsiveCard>
            </ResponsiveCol>
          </ResponsiveRow>

          {/* Body Grid */}
          <ResponsiveRow className="g-4">
            {/* Left: Live Food Order Queue */}
            <ResponsiveCol md={8}>
              <ResponsiveCard className="border-0 shadow-sm h-100">
                <ResponsiveCard.Header className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">
                    <FaBolt size={14} />
                    Food Order Queue
                    {liveQueue.length > 0 && (
                      <span className={`ms-2 ${pendingOrders > 0 ? 'text-warning' : ''}`}>
                        {liveQueue.length}
                      </span>
                    )}
                  </h5>
                  <Link to="/kitchen/orders" className="text-muted text-decoration-none">
                    View all <FaChevronRight size={10} />
                  </Link>
                </ResponsiveCard.Header>
                <ResponsiveCard.Body className="p-0">
                  {liveQueue.length === 0 ? (
                    <div className="text-center py-4">
                      <FaCheckCircle className="text-success mb-2" size={28} />
                      <p className="mb-0">No active food orders — queue is clear!</p>
                    </div>
                  ) : (
                    <>
                      {liveQueue.map((order) => (
                        <SwipeableOrderItem
                          key={order.id}
                          order={order}
                          onDismiss={handleDismissOrder}
                        />
                      ))}
                    </>
                  )}
                </ResponsiveCard.Body>
              </ResponsiveCard>
            </ResponsiveCol>

            {/* Right column */}
            <ResponsiveCol md={4}>
              {/* Shift card */}
              <ResponsiveCard className="border-0 shadow-sm h-100">
                <ResponsiveCard.Header className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="mb-0 text-muted">Current Shift</h6>
                    {currentShift ? (
                      <p className="mb-0 fw-medium">
                        {currentShift.start_time} – {currentShift.end_time}
                      )
                    ) : (
                      <p className="mb-0 text-muted">No shift today</p>
                    )}
                  </div>
                  <FaCalendarAlt size={18} className="text-primary" />
                </ResponsiveCard.Header>
                <ResponsiveCard.Body className="p-3">
                  <div className="d-flex justify-content-end gap-3">
                    <Link to="/kitchen/attendance" className="text-decoration-none">
                      <ResponsiveButton variant="outline-primary" size="sm" className="">
                        <div className="d-flex justify-content-start align-items-center">
                          <FaSignInAlt size={13} className="me-2" />
                          <span>Clock In/Out</span>
                        </div>
                      </ResponsiveButton>
                    </Link>
                    <Link to="/kitchen/shifts" className="text-decoration-none">
                      <ResponsiveButton variant="outline-secondary" size="sm" className="">
                        <div className="d-flex justify-content-start align-items-center">
                          <FaCalendarAlt size={13} className="me-2" />
                          <span>My Shifts</span>
                        </div>
                      </ResponsiveButton>
                    </Link>
                  </div>
                </ResponsiveCard.Body>
              </ResponsiveCard>

              {/* Quick actions */}
              <ResponsiveCard className="border-0 shadow-sm h-100 mt-3">
                <ResponsiveCard.Header>
                  <h5 className="mb-0">
                    <FaBolt size={14} />
                    Quick Actions
                  </h5>
                </ResponsiveCard.Header>
                <ResponsiveCard.Body className="p-3">
                  <ResponsiveRow className="g-2">
                    <ResponsiveCol md={6}>
                      <Link to="/kitchen/orders" className="text-decoration-none">
                        <ResponsiveButton to="/kitchen/orders" variant="outline-warning" size="sm" className="w-100">
                          <div className="d-flex justify-content-start align-items-center">
                            <FaClock size={15} className="me-2" />
                            <span>Food Orders</span>
                            {pendingOrders > 0 && (
                              <span className="ms-auto badge bg-warning">{pendingOrders}</span>
                            )}
                          </div>
                        </ResponsiveButton>
                      </Link>
                    </ResponsiveCol>
                    <ResponsiveCol md={6}>
                      <Link to="/kitchen/tasks" className="text-decoration-none">
                        <ResponsiveButton to="/kitchen/tasks" variant="outline-primary" size="sm" className="w-100">
                          <div className="d-flex justify-content-start align-items-center">
                            <FaTasks size={15} className="me-2" />
                            <span>My Tasks</span>
                            {todaysTasks.length > 0 && (
                              <span className="ms-auto badge bg-primary">{todaysTasks.length}</span>
                            )}
                          </div>
                        </ResponsiveButton>
                      </Link>
                    </ResponsiveCol>
                    <ResponsiveCol md={6}>
                      <Link to="/kitchen/inventory" className="text-decoration-none">
                        <ResponsiveButton to="/kitchen/inventory" variant="outline-secondary" size="sm" className="w-100">
                          <div className="d-flex justify-content-start align-items-center">
                            <FaBoxes size={15} className="me-2" />
                            <span>Inventory Check</span>
                          </div>
                        </ResponsiveButton>
                      </Link>
                    </ResponsiveCol>
                    <ResponsiveCol md={6}>
                      <Link to="/kitchen/performance" className="text-decoration-none">
                        <ResponsiveButton to="/kitchen/performance" variant="outline-success" size="sm" className="w-100">
                          <div className="d-flex justify-content-start align-items-center">
                            <FaChartLine size={15} className="me-2" />
                            <span>My Performance</span>
                          </div>
                        </ResponsiveButton>
                      </Link>
                    </ResponsiveCol>
                  </ResponsiveRow>
                </ResponsiveCard.Body>
              </ResponsiveCard>
            </ResponsiveCol>
          </div>

          {/* Today's Tasks */}
          <ResponsiveCard className="border-0 shadow-sm h-100">
            <ResponsiveCard.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">
                <FaList size={14} />
                Today's Tasks
                {todaysTasks.length > 0 && (
                  <span className="ms-auto badge bg-primary">{todaysTasks.length}</span>
                )}
              </h5>
              <Link to="/kitchen/tasks" className="text-muted text-decoration-none">
                See all <FaChevronRight size={10} />
              </Link>
            </ResponsiveCard.Body>
            {todaysTasks.length === 0 ? (
              <p className="text-muted text-center">No tasks assigned for today.</p>
            ) : (
              <div className="list-group">
                {todaysTasks.slice(0, 6).map((task, i) => (
                  <div key={task.id || i} className="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center">
                      <span className={`badge bg-${task.status === 'in_progress' ? 'primary' : task.status === 'completed' ? 'success' : 'secondary'} me-2`}></span>
                      <span className="me-2">{task.title || task.name || 'Unnamed task'}</span>
                      {task.priority && (
                        <span className={`badge bg-${task.priority === 'high' ? 'danger' : task.priority === 'medium' ? 'warning' : 'info'} ms-auto`}>{task.priority}</span>
                      )}
                    </div>
                  )}
                </div>
              )}
            </ResponsiveCard.Body>
          </ResponsiveCard>
        </>
      )}
    </div>
  );
};

export default KitchenDashboard;