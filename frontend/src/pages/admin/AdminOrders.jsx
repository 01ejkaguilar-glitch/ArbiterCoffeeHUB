import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { usePullToRefresh } from '../../hooks/usePullToRefresh';
import { Container, Row, Col, Breadcrumb, Button } from 'react-bootstrap';
import { FaExclamationTriangle, FaRedo } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { ResponsiveModal, ResponsiveButton, ResponsiveForm, ResponsiveTable, ResponsiveAlert, ResponsiveCard, ResponsiveRow, ResponsiveCol, ResponsiveSpinner } from '../../components/responsive';
import {
  FaEye, FaWifi, FaBell,
  FaShoppingCart, FaCheckCircle, FaClock, FaBoxOpen,
  FaTimesCircle, FaArrowRight, FaTimes, FaSave,
  FaFileDownload, FaList, FaEllipsisV
} from 'react-icons/fa';
import apiService from '../../services/api.service';
import { API_ENDPOINTS } from '../../config/api';
import { useBaristaOrders } from '../../hooks/useBroadcast';
import { useNotificationSystem } from '../../components/common/NotificationSystem';
import useApiError from '../../hooks/useApiError';
import PageShell from '../../components/layout/PageShell';
import { exportToCSV } from '../../utils/exportUtils';
import './AdminOrders.css';

const ORDER_STATUSES = [
  { value: 'pending',               label: 'Pending' },
  { value: 'confirmed',             label: 'Confirmed' },
  { value: 'preparing',             label: 'Preparing' },
  { value: 'ready',                 label: 'Ready' },
  { value: 'completed',             label: 'Completed' },
  { value: 'cancelled',             label: 'Cancelled' },
  { value: 'cancellation_requested',label: 'Cancel Requested' },
];

const STATUS_LABEL = {
  pending: 'Pending', confirmed: 'Confirmed', preparing: 'Preparing',
  ready: 'Ready', completed: 'Completed', cancelled: 'Cancelled',
  cancellation_requested: 'Cancel Requested',
};

/** Inline status chip using ao-status CSS classes */
const StatusChip = ({ status }) => {
  const cls = `ao-status ${status || 'pending'}`;
  return (
    <span className={cls}>
      <span className="ao-dot" />
      {STATUS_LABEL[status] ?? status}
    </span>
  );
};

const PER_PAGE_OPTIONS = [10, 15, 25, 50];

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const { errorInfo, getErrorInfo } = useApiError();
  const [showExportModal, setShowExportModal] = useState(false);
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [batchAction, setBatchAction] = useState('');
  const [batchValue, setBatchValue] = useState('');
  const [columnVisibility, setColumnVisibility] = useState({
    orderNumber: true,
    customer: true,
    dateTime: true,
    status: true,
    total: true,
    type: true,
    actions: true
  });
  const [showColumnDropdown, setShowColumnDropdown] = useState(false);
  const [exportFormat, setExportFormat] = useState('csv');
  const [dateRange, setDateRange] = useState('all');
  const [exporting, setExporting] = useState(false);
  // Virtual scrolling
  const [scrollOffset, setScrollOffset] = useState(0);
  const [visibleStartIndex, setVisibleStartIndex] = useState(0);
  const [visibleEndIndex, setVisibleEndIndex] = useState(0);
  const rowHeightEstimate = 48; // pixels per row (estimated)
  const viewportHeight = 500; // pixels - adjustable
  const buffer = 5; // extra rows to render for smooth scrolling
  const tableRef = useRef(null);

  // Filters
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');

  // Pagination
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(15);
  const [meta, setMeta] = useState({ total: 0, last_page: 1, current_page: 1 });

  const { showSuccessNotification } = useNotificationSystem();

// Real-time barista order notifications
  const { isConnected, pendingOrders } = useBaristaOrders(({ order }) => {
    setOrders(prevOrders => [order, ...prevOrders]);
    showSuccessNotification(
      'New Order Received',
      `Order #${order.order_number} has been placed and needs attention.`
    );
  });

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 350);
    return () => clearTimeout(t);
  }, [search]);

  const fetchOrders = useCallback(async (showRefreshIndicator = false) => {
    try {
      if (showRefreshIndicator) setRefreshing(true);
      else setLoading(true);

      const params = new URLSearchParams();
      params.set('page', page);
      params.set('per_page', perPage);
      if (debouncedSearch) params.set('search', debouncedSearch);
      if (filterStatus)    params.set('status', filterStatus);
      if (filterType)      params.set('order_type', filterType);

      const url = `${API_ENDPOINTS.ADMIN.ORDERS}?${params.toString()}`;
      const response = await apiService.get(url);

      if (response.success) {
        const raw = response.data;
        // Laravel paginator wraps rows in .data
        const rows = Array.isArray(raw.data) ? raw.data : (Array.isArray(raw) ? raw : []);
        setOrders(rows);
        if (raw.total !== undefined) {
          setMeta({
            total:        raw.total,
            last_page:    raw.last_page   ?? 1,
            current_page: raw.current_page ?? 1,
            from:         raw.from         ?? null,
            to:           raw.to           ?? null,
          });
        }
      } else {
        getErrorInfo(response);
      }
    } catch (err) {
      getErrorInfo(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [page, perPage, debouncedSearch, filterStatus, filterType]);

  // Refetch whenever page, perPage, debounced search, or filters change
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Clear selected orders when data changes to avoid stale selections
  useEffect(() => {
    setSelectedOrders([]);
  }, [orders]);

  // Close column dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showColumnDropdown) {
        setShowColumnDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showColumnDropdown]);

  // Virtual scrolling: update visible indices when scroll position changes
  useEffect(() => {
    if (!tableRef.current) return;

    const updateVisibleIndices = () => {
      const scrollTop = tableRef.current.scrollTop;
      const startIndex = Math.max(0, Math.floor((scrollTop - (buffer * rowHeightEstimate)) / rowHeightEstimate));
      const endIndex = Math.min(
        orders.length - 1,
        Math.ceil((scrollTop + viewportHeight + (buffer * rowHeightEstimate)) / rowHeightEstimate)
      );

      setScrollOffset(scrollTop);
      setVisibleStartIndex(startIndex);
      setVisibleEndIndex(endIndex);
    };

    const handleScroll = () => {
      updateVisibleIndices();
    };

    tableRef.current.addEventListener('scroll', handleScroll);
    // Initial calculation
    updateVisibleIndices();

    return () => {
      tableRef.current.removeEventListener('scroll', handleScroll);
    };
  }, [orders.length, viewportHeight, rowHeightEstimate, buffer]);

  // Set up pull-to-refresh hook
  const handleRefreshCallback = useCallback(() => fetchOrders(false), [fetchOrders]);
  const { onTouchStart, onTouchMove, onTouchEnd } = usePullToRefresh(
    handleRefreshCallback,
    { threshold: 100 }
  );

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setShowModal(true);
  };

  const handleToggleOrderSelection = (orderId) => {
    setSelectedOrders(prev =>
      prev.includes(orderId)
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  const handleToggleSelectAll = () => {
    setSelectedOrders(prev =>
      prev.length === orders.length
        ? []
        : orders.map(order => order.id)
    );
  };

  const handleStatusUpdate = async () => {
    if (!selectedOrder || !newStatus) return;

    try {
      const response = await apiService.patch(
        API_ENDPOINTS.ADMIN.ORDER_STATUS(selectedOrder.id),
        { status: newStatus }
      );

      if (response.success) {
        // Update order in the list
        setOrders(prevOrders =>
          prevOrders.map(order =>
            order.id === selectedOrder.id
              ? { ...order, status: newStatus }
              : order
          )
        );

        setShowModal(false);
        showSuccessNotification(
          'Order Updated',
          `Order #${selectedOrder.order_number} status changed to ${newStatus}.`
        );
      } else {
        getErrorInfo(response);
      }
    } catch (error) {
      getErrorInfo(error);
    }
  };

  const handleRefresh = () => {
    fetchOrders(true);
  };

  const handleFilterStatus = (val) => { setFilterStatus(val); setPage(1); };
  const handleFilterType   = (val) => { setFilterType(val);   setPage(1); };
  const handlePerPage      = (val) => { setPerPage(Number(val)); setPage(1); };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  // Stats from the full current page (server already pre-filtered)
  const stats = useMemo(() => ({
    total:     meta.total,
    pending:   orders.filter(o => o.status === 'pending').length,
    preparing: orders.filter(o => o.status === 'preparing' || o.status === 'confirmed').length,
    ready:     orders.filter(o => o.status === 'ready').length,
    completed: orders.filter(o => o.status === 'completed').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
  }), [orders, meta.total]);

  // Export functions
  const handleExportCSV = () => {
    const exportData = orders.map(order => ({
      'Order #': order.order_number,
      Customer: order.user?.name || '—',
      'Date & Time': new Date(order.created_at).toLocaleString(),
      Status: order.status,
      Total: parseFloat(order.total_amount).toFixed(2),
      Type: order.order_type || '—'
    }));
    exportToCSV(exportData, `orders-${new Date().toISOString().split('T')[0]}.csv`);
  };

  const handleExportPDF = () => {
    // For PDF export, we'll use the browser's print function on a special view
    // In a production app, you might use a library like jsPDF
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Orders Export</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { text-align: center; color: #2c3e50; }
            table { border-collapse: collapse; width: 100%; margin: 20px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #ecf0f1; font-weight: bold; }
            tr:nth-child(even) { background-color: #f2f2f2; }
          </style>
        </head>
        <body>
          <h1>Orders Export</h1>
          <p>Exported on: ${new Date().toLocaleString()}</p>
          <table>
            <thead>
              <tr>
                <th>Order #</th>
                <th>Customer</th>
                <th>Date & Time</th>
                <th>Status</th>
                <th>Total</th>
                <th>Type</th>
              </tr>
            </thead>
            <tbody>
              ${orders.map(order => `
                <tr>
                  <td>${order.order_number}</td>
                  <td>${order.user?.name || '—'}</td>
                  <td>${new Date(order.created_at).toLocaleString()}</td>
                  <td>${order.status}</td>
                  <td>₱${parseFloat(order.total_amount).toFixed(2)}</td>
                  <td>${order.order_type || '—'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <script>
            window.onload = () => {
              window.print();
              setTimeout(() => window.close(), 1000);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleExportFromModal = () => {
    setExporting(true);
    try {
      if (exportFormat === 'csv') {
        handleExportCSV();
      } else if (exportFormat === 'pdf') {
        handleExportPDF();
      }
      showSuccessNotification('Success', `Orders exported successfully as ${exportFormat.toUpperCase()}`);
    } catch (error) {
      getErrorInfo(error);
    } finally {
      setExporting(false);
      setShowExportModal(false);
    }
  };

  // Batch actions
  const handleBatchAction = async () => {
    if (selectedOrders.length === 0) {
      getErrorInfo({ message: 'Please select orders first' });
      return;
    }

    try {
      let updateData = {};
      switch (batchAction) {
        case 'status':
          if (!batchValue) {
            getErrorInfo({ message: 'Please select a status' });
            return;
          }
          updateData = { status: batchValue };
          break;
        default:
          getErrorInfo({ message: 'Invalid batch action' });
          return;
      }

      // Update each selected order
      await Promise.all(
        selectedOrders.map(orderId =>
          apiService.patch(
            API_ENDPOINTS.ADMIN.ORDER_STATUS(orderId),
            updateData
          )
        )
      );

      showSuccessNotification('Success', `Updated ${selectedOrders.length} orders successfully!`);
      setShowBatchModal(false);
      setSelectedOrders([]);
      setBatchAction('');
      setBatchValue('');
      fetchOrders();
    } catch (error) {
      getErrorInfo(error);
    }
  };

  // Unique order types from current page for the filter dropdown
  const orderTypes = useMemo(() =>
    [...new Set(orders.map(o => o.order_type).filter(Boolean))],
    [orders]);

  // ── Page number range (show at most 5 page buttons) ──────────
  const pageButtons = useMemo(() => {
    const total = meta.last_page;
    if (total <= 1) return [];
    const delta = 2;
    const left  = Math.max(1, page - delta);
    const right = Math.min(total, page + delta);
    const pages = [];
    for (let i = left; i <= right; i++) pages.push(i);
    if (left > 1)     pages.unshift('...-left',  1);
    if (right < total) pages.push('...-right', total);
    return pages;
  }, [page, meta.last_page]);

  return (
    <PageShell
      title="Order Management"
      subtitle="Manage and track all customer orders"
      loading={loading}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      style={{
        touchAction: 'manipulation'
      }}
      headerRight={
        <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem', flexWrap: 'wrap' }}>
          {/* Live indicator */}
          <span className={`ao-live-chip ${isConnected ? 'on' : 'off'}`}>
            <span className="ao-live-dot" />
            {isConnected ? 'Live' : 'Offline'}
          </span>

          {/* Pending alert */}
          {pendingOrders.length > 0 && (
            <span className="ao-pending-chip">
              <FaBell size={11} />
              {pendingOrders.length} new
            </span>
          )}

          {/* Batch actions */}
          {selectedOrders.length > 0 && (
            <div style={{ display: 'flex', gap: '.3rem' }}>
              <ResponsiveButton
                variant="outline-secondary"
                size="sm"
                onClick={() => setShowBatchModal(true)}
                disabled={selectedOrders.length === 0}
              >
                <FaList size={12} />
                Batch ({selectedOrders.length})
              </ResponsiveButton>
            </div>
          )}

          {/* Export buttons */}
          <div style={{ display: 'flex', gap: '.3rem' }}>
            <ResponsiveButton
              variant="outline-success"
              size="sm"
              onClick={() => {
                setExportFormat('csv');
                setShowExportModal(true);
              }}
              disabled={loading || orders.length === 0}
            >
              <FaFileDownload size={12} />
              CSV
            </ResponsiveButton>
            <ResponsiveButton
              variant="outline-success"
              size="sm"
              onClick={() => {
                setExportFormat('pdf');
                setShowExportModal(true);
              }}
              disabled={loading || orders.length === 0}
            >
              PDF
            </ResponsiveButton>
          </div>

          {/* Refresh */}
          <ResponsiveButton
            variant="outline-secondary"
            size="sm"
            className="ao-refresh-btn"
            onClick={handleRefresh}
            disabled={refreshing}
            aria-label="Refresh orders"
          >
            <FaRedo size={12} className={refreshing ? 'ao-spinning' : ''} />
            Refresh
          </ResponsiveButton>
        </div>
      }
    >
      {/* Error */}
      {errorInfo && (
        <div>
          <ResponsiveAlert show={true} onHide={() => { /* Error cleared by useApiError internal state */ }} message={errorInfo.message} type={errorInfo.type} />
          {errorInfo.actions && errorInfo.actions.length > 0 && (
            <div className="mt-3">
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

      {/* Stats Bar */}
      {!loading && (
        <ResponsiveRow className="g-4">
          <ResponsiveCol xs={12} sm={6} md={4} lg={2}>
            <ResponsiveCard className="ao-stat-card text-center blue">
              <FaShoppingCart className="ao-stat-icon" />
              <div className="ao-stat-value">{stats.total}</div>
              <div className="ao-stat-label">Total Orders</div>
            </ResponsiveCard>
          </ResponsiveCol>
          <ResponsiveCol xs={12} sm={6} md={4} lg={2}>
            <ResponsiveCard className="ao-stat-card text-center amber">
              <FaClock className="ao-stat-icon" />
              <div className="ao-stat-value">{stats.pending}</div>
              <div className="ao-stat-label">Pending</div>
            </ResponsiveCard>
          </ResponsiveCol>
          <ResponsiveCol xs={12} sm={6} md={4} lg={2}>
            <ResponsiveCard className="ao-stat-card text-center purple">
              <FaBoxOpen className="ao-stat-icon" />
              <div className="ao-stat-value">{stats.preparing}</div>
              <div className="ao-stat-label">In Progress</div>
            </ResponsiveCard>
          </ResponsiveCol>
          <ResponsiveCol xs={12} sm={6} md={4} lg={2}>
            <ResponsiveCard className="ao-stat-card text-center teal">
              <FaWifi className="ao-stat-icon" />
              <div className="ao-stat-value">{stats.ready}</div>
              <div className="ao-stat-label">Ready</div>
            </ResponsiveCard>
          </ResponsiveCol>
          <ResponsiveCol xs={12} sm={6} md={4} lg={2}>
            <ResponsiveCard className="ao-stat-card text-center green">
              <FaCheckCircle className="ao-stat-icon" />
              <div className="ao-stat-value">{stats.completed}</div>
              <div className="ao-stat-label">Completed</div>
            </ResponsiveCard>
          </ResponsiveCol>
          <ResponsiveCol xs={12} sm={6} md={4} lg={2}>
            <ResponsiveCard className="ao-stat-card text-center red">
              <FaTimesCircle className="ao-stat-icon" />
              <div className="ao-stat-value">{stats.cancelled}</div>
              <div className="ao-stat-label">Cancelled</div>
            </ResponsiveCard>
          </ResponsiveCol>
        </ResponsiveRow>
      )}

      {/* Filter Bar */}
      {!loading && (
        <div className="ao-filter-bar">
          {/* Search */}
          <div className="ao-search-wrap">
            <svg className="ao-search-icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              type="search"
              className="ao-search-input"
              placeholder="Search order #, customer…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {/* Select all toggle */}
          <div className="ao-select-all-wrap">
            <div className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                checked={selectedOrders.length === orders.length && orders.length > 0}
                onChange={handleToggleSelectAll}
              />
              <label className="form-check-label">Select All</label>
            </div>
          </div>

          {/* Status filter */}
          <select className="ao-filter-select" value={filterStatus} onChange={e => handleFilterStatus(e.target.value)} aria-label="Filter by status">
            <option value="">All Statuses</option>
            {ORDER_STATUSES.map(s => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>

          {/* Type filter */}
          <select className="ao-filter-select" value={filterType} onChange={e => handleFilterType(e.target.value)} aria-label="Filter by type">
            <option value="">All Types</option>
            {orderTypes.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>

          {/* Per-page */}
          <select className="ao-filter-select" value={perPage} onChange={e => handlePerPage(e.target.value)} aria-label="Rows per page" style={{ minWidth: 90 }}>
            {PER_PAGE_OPTIONS.map(n => (
              <option key={n} value={n}>{n} / page</option>
            ))}
          </select>

          {/* Column visibility */}
          <div
  className="ao-column-toggle"
  tabindex="0"
  role="button"
  aria-expanded={showColumnDropdown}
  aria-label="Toggle column visibility"
  onClick={() => setShowColumnDropdown(!showColumnDropdown)}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setShowColumnDropdown(!showColumnDropdown);
    }
  }}
>
            <FaEllipsisV size={14} className={`ao-column-toggle-icon${showColumnDropdown ? ' active' : ''}`} />
            <div className={`ao-column-dropdown${showColumnDropdown ? ' active' : ''}`}>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  checked={columnVisibility.orderNumber}
                  onChange={(e) => setColumnVisibility(prev => ({ ...prev, orderNumber: e.target.value }))}
                />
                <label className="form-check-label">Order #</label>
              </div>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  checked={columnVisibility.customer}
                  onChange={(e) => setColumnVisibility(prev => ({ ...prev, customer: e.target.value }))}
                />
                <label className="form-check-label">Customer</label>
              </div>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  checked={columnVisibility.dateTime}
                  onChange={(e) => setColumnVisibility(prev => ({ ...prev, dateTime: e.target.value }))}
                />
                <label className="form-check-label">Date & Time</label>
              </div>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  checked={columnVisibility.status}
                  onChange={(e) => setColumnVisibility(prev => ({ ...prev, status: e.target.value }))}
                />
                <label className="form-check-label">Status</label>
              </div>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  checked={columnVisibility.total}
                  onChange={(e) => setColumnVisibility(prev => ({ ...prev, total: e.target.value }))}
                />
                <label className="form-check-label">Total</label>
              </div>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  checked={columnVisibility.type}
                  onChange={(e) => setColumnVisibility(prev => ({ ...prev, type: e.target.value }))}
                />
                <label className="form-check-label">Type</label>
              </div>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  checked={columnVisibility.actions}
                  onChange={(e) => setColumnVisibility(prev => ({ ...prev, actions: e.target.value }))}
                />
                <label className="form-check-label">Actions</label>
              </div>
            </div>
          </div>

          <span className="ao-filter-count">
            {meta.from ?? 0}–{meta.to ?? 0} of {meta.total}
          </span>
        </div>
      )}

      {/* Table */}
      <div className="ao-table-card shadow-sm">
        <div
          ref={tableRef}
          style={{
            overflowX: 'auto',
            overflowY: 'auto',
            height: `${viewportHeight}px`,
            position: 'relative'
          }}
        >
          <table className="ao-table" aria-label="Orders list">
            <thead>
              <tr>
                {columnVisibility.orderNumber && <th>Order #</th>}
                {columnVisibility.customer && <th>Customer</th>}
                {columnVisibility.dateTime && <th>Date &amp; Time</th>}
                {columnVisibility.status && <th>Status</th>}
                {columnVisibility.total && <th>Total</th>}
                {columnVisibility.type && <th>Type</th>}
                {columnVisibility.actions && <th style={{ width: 70 }}>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {/* Padding for virtual scrolling */}
              <tr style={{ height: `${visibleStartIndex * rowHeightEstimate}px` }}>
                <td colSpan="7"></td>
              </tr>

              {/* Visible rows */}
              {!loading && orders.length === 0 ? (
                <tr>
                  <td colSpan="7">
                    <div className="ao-empty">
                      <FaShoppingCart className="ao-empty-icon" />
                      <p>No orders found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                orders.slice(visibleStartIndex, visibleEndIndex + 1).map(order => (
                  <tr key={order.id}>
                    {columnVisibility.orderNumber && (
                      <td>
                        <div className="ao-order-num">{order.order_number}</div>
                      </td>
                    )}
                    {columnVisibility.customer && (
                      <td>
                        <div className="ao-customer-name">{order.user?.name || '—'}</div>
                        {order.user?.email && (
                          <div className="ao-customer-email">{order.user.email}</div>
                        )}
                      </td>
                    )}
                    {columnVisibility.dateTime && (
                      <td>
                        <div className="ao-order-time">{formatDate(order.created_at)}</div>
                      </td>
                    )}
                    {columnVisibility.status && (
                      <td>
                        <StatusChip status={order.status} />
                      </td>
                    )}
                    {columnVisibility.total && (
                      <td>
                        <span className="ao-price">₱{parseFloat(order.total_amount).toFixed(2)}</span>
                      </td>
                    )}
                    {columnVisibility.type && (
                      <td>
                        <span className="ao-type-pill">{order.order_type || '—'}</span>
                      </td>
                    )}
                    {columnVisibility.actions && (
                      <td>
                        <div className="ao-action-group">
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              checked={selectedOrders.includes(order.id)}
                              onChange={() => handleToggleOrderSelection(order.id)}
                            />
                          </div>
                          <ResponsiveButton
                            variant="outline-secondary"
                            size="sm"
                            className="ao-view-btn"
                            onClick={() => handleViewOrder(order)}
                            aria-label={`View order ${order.order_number}`}
                          >
                            <FaEye size={11} /> View
                          </ResponsiveButton>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}

              {/* Padding for virtual scrolling */}
              <tr style={{ height: `${(orders.length - visibleEndIndex - 1) * rowHeightEstimate}px` }}>
                <td colSpan="7"></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Pagination Bar ── */}
      {meta.last_page > 1 && (
        <div className="ao-pagination">
          <span className="ao-page-info">
            Page {meta.current_page} of {meta.last_page}
          </span>
          <div className="ao-page-btns">
            <button
              className="ao-page-btn"
              onClick={() => setPage(1)}
              disabled={page === 1}
              aria-label="First page"
            >««</button>
            <button
              className="ao-page-btn"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              aria-label="Previous page"
            >‹</button>

            {pageButtons.map((p, i) =>
              typeof p === 'number' ? (
                <ResponsiveButton
                  key={p}
                  variant="outline-secondary"
                  size="sm"
                  className={`ao-page-btn ${p === page ? 'active' : ''}`}
                  onClick={() => setPage(p)}
                  aria-current={p === page ? 'page' : undefined}
                >
                  {p}
                </ResponsiveButton>
              ) : (
                <span key={p + i} className="ao-page-ellipsis">…</span>
              )
            )}

            <button
              className="ao-page-btn"
              onClick={() => setPage(p => Math.min(meta.last_page, p + 1))}
              disabled={page === meta.last_page}
              aria-label="Next page"
            >›</button>
            <button
              className="ao-page-btn"
              onClick={() => setPage(meta.last_page)}
              disabled={page === meta.last_page}
              aria-label="Last page"
            >»»</button>
          </div>
        </div>
      )}

      {/* ── Order Detail Modal ── */}
      <ResponsiveModal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
        <div className="ao-modal-header">
          <h5 className="ao-modal-title">
            <span className="ao-modal-icon"><FaEye size={13} /></span>
            Order {selectedOrder?.order_number}
          </h5>
          <button className="ao-modal-close" onClick={() => setShowModal(false)} aria-label="Close">
            <FaTimes size={13} />
          </button>
        </div>

        {selectedOrder && (
          <>
            <div className="ao-modal-body">
              {/* Meta chips */}
              <div className="ao-meta-grid">
                <div className="ao-meta-chip">
                  <div className="ao-meta-chip-label">Customer</div>
                  <div className="ao-meta-chip-value">{selectedOrder.user?.name || '—'}</div>
                </div>
                <div className="ao-meta-chip">
                  <div className="ao-meta-chip-label">Order Type</div>
                  <div className="ao-meta-chip-value" style={{ textTransform: 'capitalize' }}>{selectedOrder.order_type}</div>
                </div>
                <div className="ao-meta-chip">
                  <div className="ao-meta-chip-label">Status</div>
                  <div style={{ marginTop: '.15rem' }}><StatusChip status={selectedOrder.status} /></div>
                </div>
                <div className="ao-meta-chip">
                  <div className="ao-meta-chip-label">Total Amount</div>
                  <div className="ao-meta-chip-value ao-price">₱{parseFloat(selectedOrder.total_amount).toFixed(2)}</div>
                </div>
                <div className="ao-meta-chip">
                  <div className="ao-meta-chip-label">Date Placed</div>
                  <div className="ao-meta-chip-value">{formatDate(selectedOrder.created_at)}</div>
                </div>
                {selectedOrder.payment_status && (
                  <div className="ao-meta-chip">
                    <div className="ao-meta-chip-label">Payment</div>
                    <div className="ao-meta-chip-value" style={{ textTransform: 'capitalize' }}>{selectedOrder.payment_status}</div>
                  </div>
                )}
              </div>

              {/* Order Items */}
              <div className="ao-section-title">Order Items</div>
              <div className="ao-items-wrap">
                <table className="ao-items-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th style={{ textAlign: 'center' }}>Qty</th>
                      <th style={{ textAlign: 'right' }}>Unit Price</th>
                      <th style={{ textAlign: 'right' }}>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(selectedOrder.orderItems || []).map(item => (
                      <tr key={item.id}>
                        <td className="ao-item-name">{item.product?.name || '—'}</td>
                        <td style={{ textAlign: 'center' }}>{item.quantity}</td>
                        <td style={{ textAlign: 'right' }}>₱{parseFloat(item.unit_price).toFixed(2)}</td>
                        <td style={{ textAlign: 'right', fontWeight: 700 }}>
                          ₱{(parseFloat(item.unit_price) * item.quantity).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                    {/* Total row */}
                    <tr style={{ background: '#f8f9fa', borderTop: '2px solid #e9ecef' }}>
                      <td colSpan="3" style={{ textAlign: 'right', fontWeight: 700, fontSize: '.8rem', color: '#6b7280', letterSpacing: '.04em' }}>TOTAL</td>
                      <td style={{ textAlign: 'right', fontWeight: 800, color: '#111827' }}>
                        ₱{parseFloat(selectedOrder.total_amount).toFixed(2)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Status Timeline */}
              {Array.isArray(selectedOrder.status_history) && selectedOrder.status_history.length > 0 && (
                <>
                  <div className="ao-section-title">Status Timeline</div>
                  <div className="ao-timeline">
                    {selectedOrder.status_history.map((entry, i) => (
                      <div key={i} className="ao-tl-item">
                        <div className="ao-tl-arrow">
                          <StatusChip status={entry.from} />
                          <FaArrowRight size={10} style={{ color: '#9ca3af' }} />
                          <StatusChip status={entry.to} />
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div className="ao-tl-time">{new Date(entry.timestamp).toLocaleString()}</div>
                          <div className="ao-tl-by">by {entry.updated_by}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* Update Status */}
              <div className="ao-status-update-wrap">
                <div className="ao-status-update-label">Update Order Status</div>
                <select
                  className="ao-status-select"
                  value={newStatus}
                  onChange={e => setNewStatus(e.target.value)}
                >
                  {ORDER_STATUSES.map(s => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="ao-modal-footer">
              <ResponsiveButton variant="outline-secondary" size="sm" className="ao-cancel-btn" onClick={() => setShowModal(false)}>
                Close
              </ResponsiveButton>
              <ResponsiveButton variant="primary" size="sm" className="ao-save-btn" onClick={handleStatusUpdate} disabled={newStatus === selectedOrder.status}>
                <FaSave size={12} />
                Update Status
              </ResponsiveButton>
            </div>
          </>
        )}
      </ResponsiveModal>

      {/* ── Batch Action Modal ── */}
      <ResponsiveModal show={showBatchModal} onHide={() => setShowBatchModal(false)} centered>
        <ResponsiveForm>
          <ResponsiveModal.Header>
            <ResponsiveModal.Title>Batch Update Orders</ResponsiveModal.Title>
            <ResponsiveModal.CloseButton onClick={() => setShowBatchModal(false)} aria-label="Close">
              <FaTimes />
            </ResponsiveModal.CloseButton>
          </ResponsiveModal.Header>
          <ResponsiveModal.Body className="d-grid gap-3">
            <div className="form-group">
              <label className="form-label">Action</label>
              <select
                className="form-select"
                value={batchAction}
                onChange={(event) => setBatchAction(event.target.value)}
              >
                <option value="">Select action</option>
                <option value="status">Update Status</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select
                className="form-select"
                value={batchValue}
                onChange={(event) => setBatchValue(event.target.value)}
              >
                <option value="">Select status</option>
                {ORDER_STATUSES.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
          </ResponsiveModal.Body>
          <ResponsiveModal.Footer>
            <ResponsiveButton variant="secondary" onClick={() => setShowBatchModal(false)}>
              Cancel
            </ResponsiveButton>
            <ResponsiveButton variant="primary" onClick={handleBatchAction} disabled={selectedOrders.length === 0}>
              {selectedOrders.length > 0 ? `Update ${selectedOrders.length} Orders` : 'Update Orders'}
            </ResponsiveButton>
          </ResponsiveModal.Footer>
        </ResponsiveForm>
      </ResponsiveModal>

      {/* ── Export Modal ── */}
      <ResponsiveModal show={showExportModal} onHide={() => setShowExportModal(false)} centered>
        <ResponsiveForm>
          <ResponsiveModal.Header>
            <ResponsiveModal.Title>Export Orders</ResponsiveModal.Title>
            <ResponsiveModal.CloseButton onClick={() => setShowExportModal(false)} aria-label="Close">
              <FaTimes />
            </ResponsiveModal.CloseButton>
          </ResponsiveModal.Header>
          <ResponsiveModal.Body className="d-grid gap-3">
            <div className="form-group">
              <label className="form-label">Export Format</label>
              <select
                className="form-select"
                value={exportFormat}
                onChange={(event) => setExportFormat(event.target.value)}
              >
                <option value="csv">CSV</option>
                <option value="pdf">PDF</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Date Range</label>
              <select
                className="form-select"
                value={dateRange}
                onChange={(event) => setDateRange(event.target.value)}
              >
                <option value="all">All Orders</option>
                <option value="today">Today</option>
                <option value="this_week">This Week</option>
                <option value="this_month">This Month</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>
          </ResponsiveModal.Body>
          <ResponsiveModal.Footer>
            <ResponsiveButton variant="secondary" onClick={() => setShowExportModal(false)}>
              Cancel
            </ResponsiveButton>
            <ResponsiveButton variant="primary" onClick={handleExportFromModal} disabled={exporting}>
              {exporting ? <><ResponsiveSpinner animation="border" size="sm" /> Exporting...</> : 'Export'}
            </ResponsiveButton>
          </ResponsiveModal.Footer>
        </ResponsiveForm>
      </ResponsiveModal>
    </PageShell>
  );
};

export default AdminOrders;
