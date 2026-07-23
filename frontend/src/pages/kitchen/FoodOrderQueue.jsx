import React, { useState, useEffect, useCallback } from 'react';
import {
  FaClock, FaUtensils, FaBell, FaCheckCircle, FaThumbsUp,
  FaSync, FaClipboardList,
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { API_ENDPOINTS } from '../../config/api';
import apiService from '../../services/api.service';
import { useKitchenOrders } from '../../hooks/useBroadcast';
import { useNotificationSystem } from '../../components/common/NotificationSystem';
import {
  ResponsiveButton,
  ResponsiveCard,
  ResponsiveContainer,
  ResponsiveCol,
  ResponsiveRow,
} from '@/components/responsive';
import './FoodOrderQueue.css';

const POLL_INTERVAL = 30000; // 30 s fallback polling

// ─ Helpers ──────────────────────────────────────────────────────────────────────────────
const EMPTY_QUEUE = { pending_orders: [], confirmed_orders: [], preparing_orders: [], ready_orders: [], total_queue: 0 };

const normalise = (data) => ({
  pending_orders:   Array.isArray(data?.pending_orders)   ? data.pending_orders   : [],
  confirmed_orders: Array.isArray(data?.confirmed_orders) ? data.confirmed_orders : [],
  preparing_orders: Array.isArray(data?.preparing_orders) ? data.preparing_orders : [],
  ready_orders:     Array.isArray(data?.ready_orders)     ? data.ready_orders     : [],
  total_queue:      data?.total_queue ?? 0,
});

const formatElapsedTime = (ms) => {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  return `${m}:${(s % 60).toString().padStart(2, '0')}`;
};

// ─ Skeleton ───────────────────────────────────────────────────────────────────────────
const SkeletonCard = () => (
  <div className="foq-skeleton-card">
    <div className="foq-skeleton foq-skeleton-line foq-skeleton-sm" />
    <div className="foq-skeleton foq-skeleton-line foq-skeleton-md" />
    <div className="foq-skeleton foq-skeleton-line foq-skeleton-full" />
    <div className="foq-skeleton foq-skeleton-btn" style={{ marginTop: 10 }} />
  </div>
);

/* ── Connection chip ────────────────────────────────────────── */
const ConnChip = ({ connected }) => (
  <span className={`foq-conn-chip ${connected ? 'live' : 'offline'}`}>
    <span className="foq-conn-dot" />
    {connected ? 'Live' : 'Offline'}
  </span>
);

// ─ Column config ──────────────────────────────────────────────────────────────────────
const COLUMNS = [
  { key: 'pending',   label: 'Pending',   ordersKey: 'pending_orders',   icon: <FaClock /> },
  { key: 'confirmed', label: 'Confirmed', ordersKey: 'confirmed_orders', icon: <FaThumbsUp /> },
  { key: 'preparing', label: 'Preparing', ordersKey: 'preparing_orders', icon: <FaUtensils /> },
  { key: 'ready',     label: 'Ready',     ordersKey: 'ready_orders',     icon: <FaCheckCircle /> },
];

// ─ Order Card ──────────────────────────────────────────────────────────────────────
const FoodOrderCard = ({ order, timer, updatingOrder, onUpdateStatus, formatElapsedTime }) => {
  const statusActions = {
    pending:   [{ label: 'Confirm', status: 'confirmed' }, { label: 'Start Prep', status: 'preparing' }],
    confirmed: [{ label: 'Start Prep', status: 'preparing' }],
    preparing: [{ label: 'Mark Ready', status: 'ready' }],
    ready:     [{ label: 'Complete', status: 'completed' }],
  };
  const actions = statusActions[order.status] || [];

  return (
    <ResponsiveCard className={`border-0 shadow-sm h-100 ${order.status} foq-order-card ${order.status}`}>
      <ResponsiveCard.Header className="foq-order-header d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center">
          <span className="foq-order-num">#{order.order_number || order.id}</span>
          <span className={`foq-order-type ${order.order_type || 'dine_in'}`}>
            {(order.order_type || 'dine_in').replace('_', ' ')}
          </span>
        </div>
        {timer && order.status === 'preparing' && (
          <div className="d-flex align-items-center">
            <FaClock size={11} /> {formatElapsedTime(timer.elapsed)}
          </div>
        )}
      </ResponsiveCard.Header>
      <ResponsiveCard.Body className="p-3">
        <div className="foq-order-customer">
          {order.user?.name || order.customer_name || 'Guest'}
        </div>
        <div className="foq-order-items-list">
          {(order.order_items || order.orderItems || []).map((item, idx) => (
            <div key={idx} className="foq-order-item-row d-flex justify-content-between">
              <span className="foq-item-qty">{item.quantity}×</span>
              <span className="foq-item-name">{item.product?.name || item.product_name || 'Item'}</span>
            </div>
          ))}
        </div>
        <ResponsiveCard.Footer className="p-3 foq-order-actions">
          <div className="d-flex gap-2">
            {actions.map((act) => (
              <ResponsiveButton
                key={act.status}
                variant={act.status === 'confirmed' ? 'success' : act.status === 'preparing' ? 'primary' : 'info'}
                size="sm"
                onClick={() => onUpdateStatus(order.id, act.status)}
                disabled={updatingOrder === order.id}
              >
                {updatingOrder === order.id ? <><FaSync className="fa-spin" /> </> : act.label}
              </ResponsiveButton>
            ))}
            {order.status !== 'completed' && order.status !== 'cancelled' && (
              <ResponsiveButton variant="danger" size="sm" onClick={() => onUpdateStatus(order.id, 'cancelled')} disabled={updatingOrder === order.id}>
                {updatingOrder === order.id ? <><FaSync className="fa-spin" /> </> : 'Cancel'}
              </ResponsiveButton>
            )}
          </div>
        </ResponsiveCard.Footer>
      </ResponsiveCard.Body>
    </ResponsiveCard>
  );
};

const FoodOrderQueue = () => {
  const { user, isAuthenticated } = useAuth();
  const [orders, setOrders]         = useState(EMPTY_QUEUE);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingOrder, setUpdatingOrder] = useState(null);
  const [orderTimers, setOrderTimers] = useState({});
  const { showSuccessNotification, showErrorNotification, showOrderNotification } = useNotificationSystem();

  // ─ Broadcast (WebSocket → polling fallback) ───────────────────────────────────────
  const { isConnected: realtimeConnected } = useKitchenOrders((newOrder) => {
    showOrderNotification(newOrder, 'New Food Order!');
    setOrders(prev => ({
      ...prev,
      pending_orders: [newOrder, ...(prev.pending_orders || [])],
    }));
  });

  // ─ Fetch ───────────────────────────────────────────────────────────────────────────────
  const fetchOrderQueue = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const response = await apiService.get(API_ENDPOINTS.KITCHEN.ORDER_QUEUE);
      const raw = response.data?.data ?? response.data;
      const data = normalise(raw);
      setOrders(data);

      const timers = {};
      data.preparing_orders.forEach(order => {
        timers[order.id] = {
          status: 'preparing',
          startTime: new Date(order.prepared_at || order.updated_at).getTime(),
          elapsed: Date.now() - new Date(order.prepared_at || order.updated_at).getTime(),
        };
      });
      setOrderTimers(timers);
    } catch {
      showErrorNotification('Failed to load food order queue');
      setOrders(EMPTY_QUEUE);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [showErrorNotification]);

  useEffect(() => {
    fetchOrderQueue();

    // 1-second timer tick for elapsed display
    const tick = setInterval(() => {
      setOrderTimers(prev => {
        const next = { ...prev };
        Object.keys(next).forEach(id => {
          if (next[id].status === 'preparing') next[id].elapsed = Date.now() - next[id].startTime;
        });
        return next;
      });
    }, 1000);

    // 30-second background poll (fallback when WebSocket unavailable)
    const poll = setInterval(() => fetchOrderQueue(true), POLL_INTERVAL);

    return () => {
      clearInterval(tick);
      clearInterval(poll);
    };
  }, [fetchOrderQueue]);

  // ─ Update status ──────────────────────────────────────────────────────────────────
  const updateOrderStatus = useCallback(async (orderId, newStatus) => {
    setUpdatingOrder(orderId);
    try {
      await apiService.put(API_ENDPOINTS.KITCHEN.UPDATE_ORDER(orderId), { status: newStatus });

      setOrders(prev => {
        const all = [
          ...(prev.pending_orders || []),
          ...(prev.confirmed_orders || []),
          ...(prev.preparing_orders || []),
          ...(prev.ready_orders || []),
        ];
        const order = all.find(o => o.id === orderId);
        const next = {
          pending_orders:   (prev.pending_orders   || []).filter(o => o.id !== orderId),
          confirmed_orders: (prev.confirmed_orders || []).filter(o => o.id !== orderId),
          preparing_orders: (prev.preparing_orders || []).filter(o => o.id !== orderId),
          ready_orders:     (prev.ready_orders     || []).filter(o => o.id !== orderId),
        };

        if (order && !['completed', 'cancelled'].includes(newStatus)) {
          const updated = { ...order, status: newStatus, updated_at: new Date().toISOString() };
          if (newStatus === 'confirmed')  next.confirmed_orders.unshift(updated);
          if (newStatus === 'preparing') {
            next.preparing_orders.unshift(updated);
            setOrderTimers(t => ({
              ...t,
              [orderId]: { status: 'preparing', startTime: Date.now(), elapsed: 0 },
            }));
          }
          if (newStatus === 'ready') next.ready_orders.unshift(updated);
        }
        return next;
      });

      showSuccessNotification(`Order #${orderId} → ${newStatus}`);
    } catch {
      showErrorNotification('Failed to update order status');
    } finally {
      setUpdatingOrder(null);
    }
  }, [showSuccessNotification, showErrorNotification]);

  if (!isAuthenticated || !user) {
    return (
      <div className="foq-page">
        <div style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af' }}>
          <FaBell size={36} style={{ opacity: .3, marginBottom: '.75rem', display: 'block', margin: '0 auto .75rem' }} />
          <p style={{ fontWeight: 600 }}>Authentication required. Please log in.</p>
        </div>
      </div>
    );
  }

  const hasRole = user.roles && Array.isArray(user.roles)
    && user.roles.some(r => ['kitchen-staff', 'admin', 'super-admin'].includes(r));
  if (!hasRole) {
    return (
      <div className="foq-page">
        <div style={{ textAlign: 'center', padding: '3rem', color: '#C41E3A' }}>
          <p style={{ fontWeight: 700 }}>Access Denied — Kitchen Staff role required.</p>
        </div>
      </div>
    );
  }

  const totalActive = orders.pending_orders.length + orders.confirmed_orders.length +
    orders.preparing_orders.length + orders.ready_orders.length;

  return (
    <div className="foq-page">
      {/* Top bar */}
      <div className="foq-topbar">
        <div>
          <h1 className="foq-title">
            Food Order Queue
          </h1>
          <p className="foq-subtitle">Monitor and advance food orders in real time</p>
        </div>
        <div className="foq-topbar-actions">
          <ConnChip connected={realtimeConnected} />
          <button
            className={`foq-refresh-btn${refreshing ? ' spinning' : ''}`}
            onClick={() => fetchOrderQueue(true)}
            disabled={refreshing}
          >
            <FaSync />
            {refreshing ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Summary pills */}
      <ResponsiveContainer className="mb-4">
        <ResponsiveRow className="g-4 justify-content-center">
          {COLUMNS.map(col => (
            <ResponsiveCol md={3} sm={6} key={col.key}>
              <div className={`text-center p-3 border rounded ${col.key === 'pending' ? 'border-warning' :
                                col.key === 'confirmed' ? 'border-success' :
                                col.key === 'preparing' ? 'border-info' :
                                col.key === 'ready' ? 'border-success' : 'border-light'} `}>
                {col.icon}
                <h6 className="mt-3 mb-1">{col.label}</h6>
                <span className="fs-4 fw-bold">{orders[col.ordersKey]?.length}</span>
              </div>
            </ResponsiveCol>
          ))}
          <ResponsiveCol md={3} sm={6}>
            <div className="text-center p-3 border rounded bg-light">
              Total active: <span className="fs-4 fw-bold">{totalActive}</span>
            </div>
          </ResponsiveCol>
        </ResponsiveRow>
      </ResponsiveContainer>

      {/* Kanban board */}
      <ResponsiveContainer>
        <ResponsiveRow className="g-4">
          {COLUMNS.map(col => {
            const colOrders = orders[col.ordersKey] || [];
            return (
              <ResponsiveCol md={3} sm={6} lg={3} xl={2} key={col.key}>
                <div className="h-100 border rounded shadow-sm">
                  <div className="d-flex justify-content-between align-items-start p-3">
                    <div className="d-flex align-items-center">
                      {col.icon}
                      <h6 className="ms-2 mb-0">{col.label}</h6>
                    </div>
                    <span className="badge bg-primary rounded-pill">{colOrders.length}</span>
                  </div>
                  <div className="p-3">
                    {loading ? (
                      <div className="d-flex justify-content-center py-5">
                        <><SkeletonCard /><SkeletonCard /></>
                      </div>
                    ) : colOrders.length === 0 ? (
                      <div className="text-center py-4">
                        <FaClipboardList className="mb-2" />
                        <p className="text-muted mb-0">No {col.label.toLowerCase()} orders</p>
                      </div>
                    ) : (
                      <div className="list-group list-group-flush">
                        {colOrders.map(order => (
                          <FoodOrderCard
                            key={order.id}
                            order={order}
                            timer={orderTimers[order.id]}
                            updatingOrder={updatingOrder}
                            onUpdateStatus={updateOrderStatus}
                            formatElapsedTime={formatElapsedTime}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </ResponsiveCol>
            );
          })}
        </ResponsiveRow>
      </ResponsiveContainer>
    </div>
  );
};

export default FoodOrderQueue;
