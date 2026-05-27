import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  FaClock, FaCheckCircle, FaUtensils, FaChartLine, FaCoffee,
  FaTasks, FaCalendarAlt, FaSignInAlt, FaDollarSign, FaStopwatch,
  FaSync, FaExclamationTriangle, FaBolt, FaList,
  FaBoxes, FaLeaf, FaClipboardList, FaChevronRight,
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { API_ENDPOINTS } from '../../config/api';
import apiService from '../../services/api.service';
import { useBaristaOrders } from '../../hooks/useBroadcast';
import { useNotificationSystem } from '../../components/common/NotificationSystem';
import ResponsiveButton from '@/components/responsive/Button';
import ResponsiveCard from '@/components/responsive/Card';
import ResponsiveForm from '@/components/responsive/Form';
import ResponsiveModal from '@/components/responsive/Modal';
import ResponsiveRow from '@/components/responsive/Row';
import ResponsiveCol from '@/components/responsive/Col';
import './BaristaDashboard.css';

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

const fmt = (n, prefix = '') =>
  prefix
    ? `${prefix}${Number(n || 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : (n || 0).toString();

/* ─── Connection chip ────────────────────────────────────────── */
const ConnChip = ({ connected, lastUpdated }) => {
  const [reconnecting, setReconnecting] = useState(false);

  // Simulate reconnection attempts when disconnected
  useEffect(() => {
    if (!connected) {
      const attemptReconnect = () => {
        setReconnecting(true);
        // Simulate reconnection attempt
        setTimeout(() => {
          // In real implementation, this would attempt to reconnect
          setReconnecting(false);
        }, 3000);
      };

      const interval = setInterval(attemptReconnect, 5000);
      return () => clearInterval(interval);
    }
  }, [connected]);

  return (
    <span className={`bd-conn-chip ${connected ? 'live' : 'offline'} ${reconnecting ? 'reconnecting' : ''}`}>
      <span
        className="bd-conn-dot"
        style={{
          animation: connected && !reconnecting ? 'pulse 1.5s infinite' : 'none'
        }}
      />
      {connected ? 'Live' : reconnecting ? 'Reconnecting...' : 'Offline'}
    </span>
  );
};

/* ─── Skeleton loader ────────────────────────────────────────── */
const SkeletonLoader = () => (
  <>
    <div className="bd-skeleton-stat-grid">
      {[0,1,2,3].map(i => <div key={i} className="bd-skeleton bd-skeleton-stat" />)}
    </div>
    <div className="bd-skeleton" style={{ height: 260, borderRadius: 12, marginBottom: '1.25rem' }} />
    <div className="bd-skeleton" style={{ height: 200, borderRadius: 12 }} />
  </>
);

/* ══════════════════════════════════════════════════════════════
   BARISTA DASHBOARD
   ══════════════════════════════════════════════════════════════ */
const BaristaDashboard = () => {
  const { user } = useAuth();
  const { showOrderNotification } = useNotificationSystem();

  const [dashboardData, setDashboardData]   = useState(null);
  const [workforceData, setWorkforceData]   = useState(null);
  const [queueData, setQueueData]           = useState(null);
  const [loading, setLoading]               = useState(true);
  const [error, setError]                   = useState(null);
  const [refreshing, setRefreshing]         = useState(false);

  /* real-time orders ----------------------------------------- */
  const { isConnected: realtimeConnected } = useBaristaOrders((newOrder) => {
    showOrderNotification(newOrder, 'New Order Received!');
    fetchDashboardData(false);
  });

  /* data fetch ----------------------------------------------- */
  const fetchDashboardData = useCallback(async (showLoad = true) => {
    try {
      if (showLoad) setLoading(true);
      else setRefreshing(true);
      setError(null);

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
      setError('Failed to load dashboard data. Please try again.');
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
  return (
    <div className="bd-page">

      {/* Header ─────────────────────────────────────────────── */}
      <div className="bd-header d-flex justify-content-between align-items-center">
        <div className="bd-header-left">
          <h1 className="bd-title">{getGreeting()}, {user?.name || 'Barista'}!</h1>
          <p className="bd-subtitle">{todayLabel}</p>
        </div>
        <div className="bd-header-right d-flex align-items-center gap-3">
          <ConnChip connected={realtimeConnected} lastUpdated={new Date().toLocaleTimeString()} />
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
      {error && (
        <div className="bd-error">
          <FaExclamationTriangle className="bd-error-icon" />
          <span>{error}</span>
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
                  <p className="fs-4 fw-bold mb-0">{fmt(revenue, '₱')}</p>
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
                  <p className="fs-5 fw-bold mb-0">{completedTasks} / {todaysTasks.length}</p>
                </div>
              </ResponsiveCard>
            </ResponsiveCol>
          </ResponsiveRow>

          {/* ── Body Grid ─────────────────────────────────────── */}
          <div className="bd-body-grid">

            {/* Left: Live Order Queue ─────────────────────────── */}
            <ResponsiveCol md={8}>
              <ResponsiveCard className="border-0 shadow-sm h-100">
                <ResponsiveCard.Header className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">
                    <FaBolt size={14} />
                    Live Order Queue
                    {liveQueue.length > 0 && (
                      <span className={`ms-2 ${pendingOrders > 0 ? 'text-warning' : ''}`}>
                        {liveQueue.length}
                      </span>
                    )}
                  </h5>
                  <Link to="/barista/orders" className="text-muted text-decoration-none">
                    View all <FaChevronRight size={10} />
                  </Link>
                </ResponsiveCard.Header>
                <ResponsiveCard.Body className="p-0">
                  {liveQueue.length === 0 ? (
                    <div className="text-center py-4">
                      <FaCheckCircle className="text-success mb-2" size={28} />
                      <p className="mb-0">No active orders — queue is clear!</p>
                    </div>
                  ) : (
                    <div className="list-group list-group-flush">
                      {liveQueue.map((order) => (
                        <div key={order.id} className="list-group-item list-group-item-action">
                          <div className="d-flex w-100 justify-content-between">
                            <h6 className="mb-1">#{order.order_number || order.id}</h6>
                            <small className={`text-${order.status === 'completed' ? 'success' : order.status === 'preparing' ? 'warning' : order.status === 'pending' ? 'info' : 'secondary'}`}>
                              {order.status}
                            </small>
                          </div>
                          <p className="mb-1">
                            <strong>{order.user?.name || order.customer_name || 'Guest'}</strong>
                          </p>
                          <small className="text-muted">
                            {order.order_items?.length || order.orderItems?.length || 0} item(s)
                          </small>
                        </div>
                      ))}
                    </div>
                  )}
                </ResponsiveCard.Body>
              </ResponsiveCard>
            </ResponsiveCol>

            {/* Right column ───────────────────────────────────── */}
            <ResponsiveCol md={4}>

              {/* Shift card */}
              <ResponsiveCard className="border-0 shadow-sm h-100">
                <ResponsiveCard.Header className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="mb-0 text-muted">Current Shift</h6>
                    {currentShift ? (
                      <p className="mb-0 fw-medium">
                        {currentShift.start_time} – {currentShift.end_time}
                      </p>
                    ) : (
                      <p className="mb-0 text-muted">No shift today</p>
                    )}
                    {currentShift?.shift_name && (
                      <p className="mb-0 fw-medium">{currentShift.shift_name}</p>
                    )}
                  </div>
                  <FaCalendarAlt size={18} className="text-primary" />
                </ResponsiveCard.Header>
                <ResponsiveCard.Body className="p-3">
                  <div className="d-flex justify-content-end gap-3">
                    <ResponsiveButton to="/barista/attendance" variant="outline-primary" size="sm" className="">
                      <div className="d-flex justify-content-start align-items-center">
                        <FaSignInAlt size={13} className="me-2" />
                        <span>Clock In/Out</span>
                      </div>
                    </ResponsiveButton>
                    <ResponsiveButton to="/barista/shifts" variant="outline-secondary" size="sm" className="">
                      <div className="d-flex justify-content-start align-items-center">
                        <FaCalendarAlt size={13} className="me-2" />
                        <span>My Shifts</span>
                      </div>
                    </ResponsiveButton>
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
                      <ResponsiveButton to="/barista/orders" variant="outline-warning" size="sm" className="w-100">
                        <div className="d-flex justify-content-start align-items-center">
                          <FaClock size={15} className="me-2" />
                          <span>Order Queue</span>
                          {pendingOrders > 0 && (
                            <span className="ms-auto badge bg-warning">{pendingOrders}</span>
                          )}
                        </div>
                      </ResponsiveButton>
                    </ResponsiveCol>
                    <ResponsiveCol md={6}>
                      <ResponsiveButton to="/barista/tasks" variant="outline-primary" size="sm" className="w-100">
                        <div className="d-flex justify-content-start align-items-center">
                          <FaTasks size={15} className="me-2" />
                          <span>My Tasks</span>
                          {todaysTasks.length > 0 && (
                            <span className="ms-auto badge bg-primary">{todaysTasks.length}</span>
                          )}
                        </div>
                      </ResponsiveButton>
                    </ResponsiveCol>
                    <ResponsiveCol md={6}>
                      <ResponsiveButton to="/barista/beans" variant="outline-success" size="sm" className="w-100">
                        <div className="d-flex justify-content-start align-items-center">
                          <FaCoffee size={15} className="me-2" />
                          <span>Coffee Beans</span>
                        </div>
                      </ResponsiveButton>
                    </ResponsiveCol>
                    <ResponsiveCol md={6}>
                      <ResponsiveButton to="/barista/featured-origins" variant="outline-info" size="sm" className="w-100">
                        <div className="d-flex justify-content-start align-items-center">
                          <FaLeaf size={15} className="me-2" />
                          <span>Today's Origin</span>
                        </div>
                      </ResponsiveButton>
                    </ResponsiveCol>
                    <ResponsiveCol md={6}>
                      <ResponsiveButton to="/barista/inventory" variant="outline-secondary" size="sm" className="w-100">
                        <div className="d-flex justify-content-start align-items-center">
                          <FaBoxes size={15} className="me-2" />
                          <span>Inventory Check</span>
                        </div>
                      </ResponsiveButton>
                    </ResponsiveCol>
                    <ResponsiveCol md={6}>
                      <ResponsiveButton to="/barista/performance" variant="outline-success" size="sm" className="w-100">
                        <div className="d-flex justify-content-start align-items-center">
                          <FaChartLine size={15} className="me-2" />
                          <span>My Performance</span>
                        </div>
                      </ResponsiveButton>
                    </ResponsiveCol>
                  </ResponsiveRow>
                </ResponsiveCard.Body>
              </ResponsiveCard>

            </ResponsiveCol>
          </div>

          {/* ── Today's Tasks ────────────────────────────────── */}
          <div className="bd-card">
            <div className="bd-card-head">
              <h2 className="bd-card-title">
                <FaList size={14} />
                Today's Tasks
                {todaysTasks.length > 0 && (
                  <span className="bd-card-badge">{todaysTasks.length}</span>
                )}
              </h2>
              <Link to="/barista/tasks" className="bd-see-all">
                See all <FaChevronRight size={10} />
              </Link>
            </div>
            <div className="bd-card-body">
              {todaysTasks.length === 0 ? (
                <p className="bd-task-empty">No tasks assigned for today.</p>
              ) : (
                <div className="bd-task-list">
                  {todaysTasks.slice(0, 6).map((task, i) => (
                    <div key={task.id || i} className="bd-task-item">
                      <span className={`bd-task-status-dot ${task.status === 'in_progress' ? 'in_progress' : task.status}`} />
                      <span className="bd-task-name">{task.title || task.name || 'Unnamed task'}</span>
                      {task.priority && (
                        <span className={`bd-task-priority ${task.priority}`}>{task.priority}</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </>
      )}

    </div>
  );
};

export default BaristaDashboard;

