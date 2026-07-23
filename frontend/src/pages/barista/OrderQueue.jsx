import React, { useState, useEffect, useCallback } from 'react';
import {
  FaClock, FaUtensils, FaBell, FaCheckCircle, FaThumbsUp,
  FaSync, FaClipboardList,
} from 'react-icons/fa';
import { useAuth } from '@/context/AuthContext';
import { API_ENDPOINTS } from '@/config/api';
import apiService from '@/services/api.service';
import { useBaristaOrders } from '@/hooks/useBroadcast';
import { useNotificationSystem } from '@/components/common/NotificationSystem';
import { ResponsiveButton, ResponsiveContainer, ResponsiveRow, ResponsiveCol } from '@/components/responsive';
import OrderCard from '@/pages/barista/components/OrderCard';
import OrderDetailModal from '@/pages/barista/components/OrderDetailModal';
import '@/pages/barista/OrderQueue.css';

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
  <div className="oq-skeleton-card">
    <div className="oq-skeleton oq-skeleton-line oq-skeleton-sm" />
    <div className="oq-skeleton oq-skeleton-line oq-skeleton-md" />
    <div className="oq-skeleton oq-skeleton-line oq-skeleton-full" />
    <div className="oq-skeleton oq-skeleton-btn" style={{ marginTop: 10 }} />
  </div>
);

// ─ Column config ──────────────────────────────────────────────────────────────────────
const COLUMNS = [
  { key: 'pending',   label: 'Pending',   ordersKey: 'pending_orders',   icon: <FaClock /> },
  { key: 'confirmed', label: 'Confirmed', ordersKey: 'confirmed_orders', icon: <FaThumbsUp /> },
  { key: 'preparing', label: 'Preparing', ordersKey: 'preparing_orders', icon: <FaUtensils /> },
  { key: 'ready',     label: 'Ready',     ordersKey: 'ready_orders',     icon: <FaCheckCircle /> },
];

const OrderQueue = () => {
  const { user, isAuthenticated } = useAuth();
  const [orders, setOrders]         = useState(EMPTY_QUEUE);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingOrder, setUpdatingOrder] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [orderTimers, setOrderTimers] = useState({});
  const { showSuccessNotification, showErrorNotification, showOrderNotification } = useNotificationSystem();

  // ─ Real-time ─────────────────────────────────────────────────────────────────────────────
  const { isConnected: realtimeConnected } = useBaristaOrders((newOrder) => {
    showOrderNotification(newOrder, 'New Order Received!');
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
      const response = await apiService.get(API_ENDPOINTS.BARISTA.ORDER_QUEUE);
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
      showErrorNotification('Failed to load order queue');
      setOrders(EMPTY_QUEUE);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [showErrorNotification]);

  // Initial load + timer tick
  useEffect(() => {
    fetchOrderQueue();
    const tick = setInterval(() => {
      setOrderTimers(prev => {
        const next = { ...prev };
        Object.keys(next).forEach(id => {
          if (next[id].status === 'preparing') next[id].elapsed = Date.now() - next[id].startTime;
        });
        return next;
      });
    }, 1000);
    return () => clearInterval(tick);
  }, [fetchOrderQueue]);

  // ─ Update status ──────────────────────────────────────────────────────────────────
  const updateOrderStatus = useCallback(async (orderId, newStatus) => {
    setUpdatingOrder(orderId);
    try {
      await apiService.put(API_ENDPOINTS.BARISTA.UPDATE_ORDER(orderId), { status: newStatus });

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

  const openDetail = useCallback((order) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
  }, []);

  // ─ Auth guards ─────────────────────────────────────────────────────────────────────
  if (!isAuthenticated || !user) {
    return (
      <div className="oq-page">
        <div style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af' }}>
          <FaBell size={36} style={{ opacity: .3, marginBottom: '.75rem', display: 'block', margin: '0 auto .75rem' }} />
          <p style={{ fontWeight: 600 }}>Authentication required. Please log in.</p>
        </div>
      </div>
    );
  }

  const hasRole = user.roles && Array.isArray(user.roles)
    && user.roles.some(r => ['barista', 'admin', 'super-admin'].includes(r));
  if (!hasRole) {
    return (
      <div className="oq-page">
        <div style={{ textAlign: 'center', padding: '3rem', color: '#C41E3A' }}>
          <p style={{ fontWeight: 700 }}>Access Denied — Barista role required.</p>
        </div>
      </div>
    );
  }

  const totalActive = orders.pending_orders.length + orders.confirmed_orders.length +
    orders.preparing_orders.length + orders.ready_orders.length;

  return (
    <div className="oq-page">

      {/* Top bar */}
      <ResponsiveContainer className="py-4">
        <ResponsiveRow className="align-items-center justify-content-between mb-4">
          <ResponsiveCol>
            <h1 className="display-5 fw-bold">
              <FaClipboardList className="me-2" />
              Order Queue
            </h1>
            <p className="text-muted">Monitor and advance all active orders in real time</p>
          </ResponsiveCol>
          <ResponsiveCol className="text-end">
            <div className="d-flex align-items-center gap-3">
              <span className={`rounded-pill px-3 py-1 ${realtimeConnected ? 'bg-success' : 'bg-secondary'} text-white d-inline-flex align-items-center gap-2`}>
                <span className="oq-conn-dot bg-white rounded-circle" style={{ width: '8px', height: '8px' }}></span>
                <span>{realtimeConnected ? 'Live' : 'Offline'}</span>
              </span>
              <ResponsiveButton
                variant="outline-primary"
                size="sm"
                onClick={() => fetchOrderQueue(true)}
                disabled={refreshing}
              >
                <FaSync className="me-2" />
                {refreshing ? 'Refreshing…' : 'Refresh'}
              </ResponsiveButton>
            </div>
          </ResponsiveCol>
        </ResponsiveRow>
      </ResponsiveContainer>

      {/* Summary pills */}
      <ResponsiveContainer className="mb-4">
        <ResponsiveRow className="g-4 justify-content-center">
          {COLUMNS.map(col => (
            <ResponsiveCol md={3} sm={6}>
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
              <ResponsiveCol md={3} sm={6} lg={3} xl={2}>
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
                          <OrderCard
                            key={order.id}
                            order={order}
                            timer={orderTimers[order.id]}
                            updatingOrder={updatingOrder}
                            onUpdateStatus={updateOrderStatus}
                            onViewDetail={openDetail}
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

      {/* Detail modal */}
      <OrderDetailModal
        show={showOrderModal}
        onHide={() => setShowOrderModal(false)}
        order={selectedOrder}
      />
    </div>
  );
};

export default OrderQueue;
