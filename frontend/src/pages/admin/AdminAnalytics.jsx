import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  FaChartLine, FaShoppingCart, FaUsers, FaBoxes,
  FaFileExport, FaSyncAlt,
  FaUserFriends, FaRedoAlt, FaCalendarCheck, FaClock,
  FaUserTie, FaLayerGroup, FaCoffee
} from 'react-icons/fa';
import apiService from '../../services/api.service';
import { API_ENDPOINTS } from '../../config/api';
import PageShell from '../../components/layout/PageShell';
import { BarChart, LineChart, PieChart } from '../../components/common/Charts';
import { exportToCSV } from '../../utils/exportUtils';
import ResponsiveButton from '../../components/responsive/Button';
import ResponsiveCard from '../../components/responsive/Card';
import ResponsiveTable from '../../components/responsive/Table';
import ResponsiveForm from '../../components/responsive/Form';
import ResponsiveModal from '../../components/responsive/Modal';
import './AdminAnalytics.css';

/* ── Helpers ──────────────────────────────────────────────────── */
const php = (val) =>
  `₱${parseFloat(val || 0).toLocaleString('en-PH', {
    minimumFractionDigits: 2, maximumFractionDigits: 2
  })}`;
const pct = (val) => `${parseFloat(val || 0).toFixed(1)}%`;
const fmtDate = (d) =>
  new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

const getDateRange = (key) => {
  const now = new Date();
  let start, end;
  if (key === 'week') {
    start = new Date(now); start.setDate(now.getDate() - 6); end = new Date(now);
  } else if (key === 'year') {
    start = new Date(now.getFullYear(), 0, 1);
    end   = new Date(now.getFullYear(), 11, 31);
  } else {
    start = new Date(now.getFullYear(), now.getMonth(), 1);
    end   = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  }
  return {
    start_date: start.toISOString().split('T')[0],
    end_date:   end.toISOString().split('T')[0],
  };
};

const STATUS_COLORS = {
  completed: '#2ecc71', pending: '#f39c12', processing: '#006837',
  cancelled: '#e74c3c', ready: '#009245', delivered: '#15803d',
};
const PIE_COLORS = ['#2ecc71','#009245','#e74c3c','#f39c12','#005028','#15803d','#e67e22','#2D7A2F'];

const TABS = [
  { key: 'sales',       label: 'Sales',             icon: <FaChartLine /> },
  { key: 'customers',   label: 'Customers',         icon: <FaUsers /> },
  { key: 'performance', label: 'Performance',       icon: <FaUserTie /> },
  { key: 'segments',    label: 'Customer Segments', icon: <FaLayerGroup /> },
  { key: 'barista',     label: 'Barista Stats',     icon: <FaCoffee /> },
];
const TIME_RANGES = [
  { key: 'week',  label: 'This Week'  },
  { key: 'month', label: 'This Month' },
  { key: 'year',  label: 'This Year'  },
];

/* ── Sub-components ───────────────────────────────────────────── */
const KpiCard = ({ icon, iconClass, label, value, sub, className = '' }) => (
  <ResponsiveCard className={`aa-kpi-card text-center ${className}`}>
    <div className={`aa-kpi-icon ${iconClass}`}>{icon}</div>
    <div className="aa-kpi-body">
      <div className="aa-kpi-label">{label}</div>
      <div className="aa-kpi-value">{value}</div>
      {sub && <div className="aa-kpi-sub">{sub}</div>}
    </div>
  </ResponsiveCard>
);

const StatusChip = ({ status }) => (
  <span className="aa-status-chip">
    <span className="aa-dot" style={{ background: STATUS_COLORS[status] || '#aaa' }} />
    {status}
  </span>
);

const Empty = () => (
  <div className="aa-empty">No data available for this period.</div>
);

/* ═══════════════════════════════════════════════════════════════
   Main Component
   ═══════════════════════════════════════════════════════════════ */
const AdminAnalytics = () => {
  const [activeTab,  setActiveTab]  = useState('sales');
  const [timeRange,  setTimeRange]  = useState('month');
  const [refreshing, setRefreshing] = useState(false);

  const [salesData, setSalesData] = useState(null);
  const [custData,  setCustData]  = useState(null);
  const [perfData,  setPerfData]  = useState(null);
  const [segmentsData, setSegmentsData] = useState(null);
  const [baristaData,  setBaristaData]  = useState(null);

  const [loadingSales,    setLoadingSales]    = useState(false);
  const [loadingCust,     setLoadingCust]     = useState(false);
  const [loadingPerf,     setLoadingPerf]     = useState(false);
  const [loadingSegments, setLoadingSegments] = useState(false);
  const [loadingBarista,  setLoadingBarista]  = useState(false);

  const [loaded, setLoaded] = useState({ sales: false, customers: false, performance: false, segments: false, barista: false });

  /* ── Fetch helpers ─────────────────────────────────────────── */
  const fetchSales = useCallback(async (range) => {
    setLoadingSales(true);
    try {
      const params = new URLSearchParams(getDateRange(range));
      const res = await apiService.get(`${API_ENDPOINTS.ADMIN.ANALYTICS.SALES}?${params}`);
      if (res.success) setSalesData(res.data);
    } catch (e) { /* Sales data unavailable */ }
    finally { setLoadingSales(false); }
  }, []);

  const fetchCustomers = useCallback(async (range) => {
    setLoadingCust(true);
    try {
      const params = new URLSearchParams(getDateRange(range));
      const res = await apiService.get(`${API_ENDPOINTS.ADMIN.ANALYTICS.CUSTOMERS}?${params}`);
      if (res.success) setCustData(res.data);
    } catch (e) { /* Customer data unavailable */ }
    finally { setLoadingCust(false); }
  }, []);

  const fetchPerformance = useCallback(async (range) => {
    setLoadingPerf(true);
    try {
      const params = new URLSearchParams(getDateRange(range));
      const res = await apiService.get(`${API_ENDPOINTS.ADMIN.ANALYTICS.PERFORMANCE}?${params}`);
      if (res.success) setPerfData(res.data);
    } catch (e) { /* Performance data unavailable */ }
    finally { setLoadingPerf(false); }
  }, []);

  const fetchSegments = useCallback(async () => {
    setLoadingSegments(true);
    try {
      const res = await apiService.get(API_ENDPOINTS.ADMIN.ANALYTICS.CUSTOMER_SEGMENTS);
      if (res.success) setSegmentsData(res.data);
    } catch (e) { /* Segments data unavailable */ }
    finally { setLoadingSegments(false); }
  }, []);

  const fetchBarista = useCallback(async (range) => {
    setLoadingBarista(true);
    try {
      const params = new URLSearchParams(getDateRange(range));
      const res = await apiService.get(`${API_ENDPOINTS.ADMIN.ANALYTICS.BARISTA_PERFORMANCE}?${params}`);
      if (res.success) setBaristaData(res.data);
    } catch (e) { /* Barista data unavailable */ }
    finally { setLoadingBarista(false); }
  }, []);

  /* Reset loaded flags when timeRange changes */
  useEffect(() => {
    setLoaded({ sales: false, customers: false, performance: false, segments: false, barista: false });
  }, [timeRange]);

  /* Lazy-fetch on tab switch or after reset */
  useEffect(() => {
    if (activeTab === 'sales'       && !loaded.sales)       { fetchSales(timeRange); setLoaded(p => ({ ...p, sales: true })); }
    if (activeTab === 'customers'   && !loaded.customers)   { fetchCustomers(timeRange); setLoaded(p => ({ ...p, customers: true })); }
    if (activeTab === 'performance' && !loaded.performance) { fetchPerformance(timeRange); setLoaded(p => ({ ...p, performance: true })); }
    if (activeTab === 'segments'    && !loaded.segments)    { fetchSegments(); setLoaded(p => ({ ...p, segments: true })); }
    if (activeTab === 'barista'     && !loaded.barista)     { fetchBarista(timeRange); setLoaded(p => ({ ...p, barista: true })); }
  }, [activeTab, loaded, timeRange, fetchSales, fetchCustomers, fetchPerformance, fetchSegments, fetchBarista]);

  const handleRefresh = () => {
    setRefreshing(true);
    setLoaded({ sales: false, customers: false, performance: false, segments: false, barista: false });
    setTimeout(() => setRefreshing(false), 600);
  };

  const handleExport = () => {
    if (activeTab === 'sales' && salesData?.daily_sales)
      exportToCSV(salesData.daily_sales.map(d => ({ date: d.date, revenue: d.total, orders: d.orders })), `sales-${timeRange}.csv`);
    else if (activeTab === 'customers' && custData?.top_customers)
      exportToCSV(custData.top_customers, `customers-${timeRange}.csv`);
    else if (activeTab === 'performance' && perfData?.employee_performance)
      exportToCSV(perfData.employee_performance, `performance-${timeRange}.csv`);
  };

  /* ── Chart data (memoised) ──────────────────────────────────── */
  const salesCharts = useMemo(() => {
    if (!salesData) return {};
    return {
      daily: (salesData.daily_sales || []).map(d => ({ label: fmtDate(d.date), value: parseFloat(d.total) || 0 })),
      statusPie: (salesData.ordersByStatus || []).map(s => ({ label: s.status, value: s.count || 0 })),
      topProds: (salesData.topProducts || []).slice(0, 6).map(p => ({ label: p.name, value: parseFloat(p.revenue) || 0 })),
      paymentPie: (salesData.payment_method_breakdown || []).map(p => ({ label: p.payment_method || p.label || 'Unknown', value: p.count || p.value || 0 })),
      orderTypePie: (salesData.order_type_breakdown || []).map(t => ({ label: t.order_type || t.label || 'Unknown', value: t.count || t.value || 0 })),
    };
  }, [salesData]);


  /* ══════════════════════════════════════════════════════════════
     Render tabs
     ══════════════════════════════════════════════════════════════ */
  const renderSales = () => {
    if (loadingSales) return <div className="aa-loading"><span className="aa-spinner" />Loading sales data…</div>;
    if (!salesData) return <Empty />;
    return (
      <>
        <div className="aa-kpi-grid">
          <KpiCard icon={<FaChartLine />}   iconClass="green"  label="Total Revenue"    value={php(salesData.totalRevenue)}      sub="All completed orders" />
          <KpiCard icon={<FaShoppingCart />} iconClass="blue"  label="Total Orders"     value={salesData.totalOrders || 0}        sub="Across all statuses" />
          <KpiCard icon={<FaUsers />}        iconClass="purple" label="Total Customers" value={salesData.totalCustomers || 0}    sub="Unique buyers" />
          <KpiCard icon={<FaBoxes />}        iconClass="amber"  label="Avg Order Value" value={php(salesData.averageOrderValue)} sub="Per order" />
        </div>

        <div className="aa-chart-grid">
          <div className="aa-chart-wrap span2">
            {salesCharts.daily?.length > 1
              ? <LineChart data={salesCharts.daily} title="Daily Revenue Trend" color="#2ecc71" height={280} />
              : <div className="aa-empty">Not enough daily data to render trend line.</div>}
          </div>
          <div className="aa-chart-wrap">
            {salesCharts.statusPie?.length > 0
              ? <PieChart data={salesCharts.statusPie} title="Orders by Status" colors={PIE_COLORS} />
              : <div className="aa-empty">No order status data.</div>}
          </div>
          {salesCharts.paymentPie?.length > 0 && (
            <div className="aa-chart-wrap">
              <PieChart data={salesCharts.paymentPie} title="Payment Methods" colors={PIE_COLORS} />
            </div>
          )}
          {salesCharts.orderTypePie?.length > 0 && (
            <div className="aa-chart-wrap">
              <PieChart data={salesCharts.orderTypePie} title="Order Types" colors={PIE_COLORS} />
            </div>
          )}
          {salesCharts.topProds?.length > 0 && (
            <div className="aa-chart-wrap span2">
              <BarChart data={salesCharts.topProds} title="Top Products by Revenue" color="#009245" height={220} />
            </div>
          )}
        </div>

        <div className="aa-table-grid">
          <div className="aa-section">
            <div className="aa-section-header"><span className="aa-section-title">Top Selling Products</span></div>
            <ResponsiveTable
              columns={[
                { Header: '#', accessor: 'rank' },
                { Header: 'Product', accessor: 'name' },
                { Header: 'Category', accessor: 'category' },
                { Header: 'Sold', accessor: 'total_sold' },
                { Header: 'Revenue', accessor: 'revenue' }
              ]}
              data={salesData.topProducts?.length > 0 ? salesData.topProducts.map((p, i) => ({
                rank: `#${i + 1}`,
                name: p.name,
                category: p.category,
                total_sold: p.total_sold || 0,
                revenue: php(p.revenue)
              })) : []}
              emptyMessage="No top selling products data available"
            />
          </div>

          <div className="aa-section">
            <div className="aa-section-header"><span className="aa-section-title">Revenue by Category</span></div>
            <ResponsiveTable
              columns={[
                { Header: 'Category', accessor: 'name' },
                { Header: 'Orders', accessor: 'order_count' },
                { Header: 'Revenue', accessor: 'revenue' },
                { Header: 'Share', accessor: 'percentage' }
              ]}
              data={salesData.revenueByCategory?.length > 0 ? salesData.revenueByCategory.map((c, i) => ({
                name: c.name,
                order_count: c.order_count || 0,
                revenue: php(c.revenue),
                percentage: `${pct(c.percentage)}` // Already formatted as percentage string
              })) : []}
              emptyMessage="No revenue by category data available"
            />
          </div>
        </div>

        <div className="aa-section" style={{ marginTop: '1rem' }}>
          <div className="aa-section-header"><span className="aa-section-title">Orders by Status</span></div>
          <ResponsiveTable
            columns={[
              { Header: 'Status', accessor: 'status' },
              { Header: 'Count', accessor: 'count' },
              { Header: 'Total Amount', accessor: 'total' },
              { Header: '% of Orders', accessor: 'percentage' }
            ]}
            data={salesData.ordersByStatus?.length > 0 ? salesData.ordersByStatus.map((s, i) => ({
              status: s.status,
              count: s.count || 0,
              total: php(s.total),
              percentage: pct(s.percentage)
            })) : []}
            emptyMessage="No orders by status data available"
          />
        </div>
      </>
    );
  };

  const renderCustomers = () => {
    if (loadingCust) return <div className="aa-loading"><span className="aa-spinner" />Loading customer data…</div>;
    if (!custData)   return <Empty />;
    const s = custData.summary || {};
    return (
      <>
        <div className="aa-kpi-grid">
          <KpiCard icon={<FaUsers />}         iconClass="blue"   label="Total Customers"  value={s.total_customers || 0}          sub="All registered" />
          <KpiCard icon={<FaUserFriends />}   iconClass="green"  label="Active Customers" value={s.active_customers || 0}         sub="Ordered in period" />
          <KpiCard icon={<FaRedoAlt />}       iconClass="purple" label="Repeat Customers" value={s.repeat_customers || 0}         sub="Ordered more than once" />
          <KpiCard icon={<FaCalendarCheck />} iconClass="amber"  label="Avg Order Freq"   value={`${parseFloat(s.avg_order_frequency || 0).toFixed(1)}x`} sub="Orders per customer" />
        </div>

        <div className="aa-section">
          <div className="aa-section-header"><span className="aa-section-title">Top Customers</span></div>
          <ResponsiveTable
            columns={[
              { Header: '#', accessor: 'rank' },
              { Header: 'Name', accessor: 'name' },
              { Header: 'Email', accessor: 'email' },
              { Header: 'Orders', accessor: 'total_orders' },
              { Header: 'Total Spent', accessor: 'total_spent' },
              { Header: 'Avg Order', accessor: 'average_order_value' }
            ]}
            data={custData.top_customers?.length > 0 ? custData.top_customers.map((c, i) => ({
              rank: `#${i + 1}`,
              name: c.name || c.user?.name || 'N/A',
              email: c.email || c.user?.email || '—',
              total_orders: c.total_orders || c.orders_count || 0,
              total_spent: php(c.total_spent || c.revenue),
              average_order_value: php(c.average_order_value || c.avg_order)
            })) : []}
            emptyMessage="No top customers data available"
          />
        </div>
      </>
    );
  };

  const renderPerformance = () => {
    if (loadingPerf) return <div className="aa-loading"><span className="aa-spinner" />Loading performance data…</div>;
    if (!perfData)   return <Empty />;
    const s = perfData.summary || {};
    return (
      <>
        <div className="aa-kpi-grid">
          <KpiCard icon={<FaUserTie />}         iconClass="blue"   label="Total Employees"  value={s.total_employees || 0}                                  sub="Active staff" />
          <KpiCard icon={<FaCalendarCheck />}   iconClass="green"  label="Attendance Rate"  value={pct(s.attendance_rate)}                                  sub="Period average" />
          <KpiCard icon={<FaClock />}           iconClass="amber"  label="Avg Completion"   value={`${parseFloat(s.avg_completion_time || 0).toFixed(0)} min`} sub="Per order" />
        </div>

        <div className="aa-section">
          <div className="aa-section-header"><span className="aa-section-title">Employee Performance</span></div>
          <ResponsiveTable
            columns={[
              { Header: '#', accessor: 'rank' },
              { Header: 'Employee', accessor: 'name' },
              { Header: 'Position', accessor: 'position' },
              { Header: 'Orders Processed', accessor: 'orders_processed' },
              { Header: 'Days Worked', accessor: 'days_worked' }
            ]}
            data={perfData.employee_performance?.length > 0 ? perfData.employee_performance.map((e, i) => ({
              rank: `#${i + 1}`,
              name: e.user?.name || e.name || 'N/A',
              position: e.position || 'Staff',
              orders_processed: e.orders_processed || 0,
              days_worked: e.days_worked || 0
            })) : []}
            emptyMessage="No employee performance data available"
          />
        </div>
      </>
    );
  };

  const renderSegments = () => {
    if (loadingSegments) return <div className="aa-loading"><span className="aa-spinner" />Loading customer segments…</div>;
    if (!segmentsData)   return <Empty />;
    const segments = segmentsData.segments || segmentsData.customer_segments || segmentsData.data || [];
    const summary  = segmentsData.summary || {};
    return (
      <>
        <div className="aa-kpi-grid">
          <KpiCard icon={<FaUsers />}       iconClass="blue"   label="Total Customers"    value={summary.total_customers   || 0} sub="All segments" />
          <KpiCard icon={<FaLayerGroup />}  iconClass="green"  label="Active Segments"    value={Array.isArray(segments) ? segments.length : 0} sub="Distinct groups" />
          <KpiCard icon={<FaUserFriends />} iconClass="purple" label="VIP / High-Value"   value={summary.vip_count         || 0} sub="Top spenders" />
          <KpiCard icon={<FaRedoAlt />}     iconClass="amber"  label="At-Risk Customers"  value={summary.at_risk_count     || 0} sub="Low recent activity" />
        </div>

        <div className="aa-section">
          <div className="aa-section-header"><span className="aa-section-title">Segment Breakdown</span></div>
          <ResponsiveTable
            columns={[
              { Header: 'Segment', accessor: 'segment' },
              { Header: 'Customers', accessor: 'customer_count' },
              { Header: 'Avg Spend', accessor: 'avg_spend' },
              { Header: 'Avg Orders', accessor: 'avg_orders' },
              { Header: 'Share', accessor: 'percentage' }
            ]}
            data={Array.isArray(segments) && segments.length > 0 ? segments.map((seg, i) => ({
              segment: seg.segment || seg.name || seg.label || 'Unknown',
              customer_count: seg.customer_count || seg.count || 0,
              avg_spend: php(seg.avg_spend || seg.average_spend || 0),
              avg_orders: parseFloat(seg.avg_orders || seg.average_orders || 0).toFixed(1),
              percentage: pct(seg.percentage)
            })) : []}
            emptyMessage="No segment breakdown data available"
          />
        </div>
      </>
    );
  };

  const renderBarista = () => {
    if (loadingBarista) return <div className="aa-loading"><span className="aa-spinner" />Loading barista data…</div>;
    if (!baristaData)   return <Empty />;
    const baristas = baristaData.barista_performance || baristaData.performance || baristaData.data || [];
    const summary  = baristaData.summary || {};
    return (
      <>
        <div className="aa-kpi-grid">
          <KpiCard icon={<FaCoffee />}        iconClass="green"  label="Active Baristas"   value={summary.total_baristas   || 0}                                       sub="In period" />
          <KpiCard icon={<FaShoppingCart />}  iconClass="blue"   label="Orders Completed"  value={summary.total_orders     || 0}                                       sub="By all baristas" />
          <KpiCard icon={<FaClock />}         iconClass="amber"  label="Avg Prep Time"     value={`${parseFloat(summary.avg_prep_time || 0).toFixed(0)} min`}           sub="Per order" />
          <KpiCard icon={<FaCalendarCheck />} iconClass="purple" label="Attendance Rate"   value={pct(summary.attendance_rate)}                                        sub="Period average" />
        </div>

        <div className="aa-section">
          <div className="aa-section-header"><span className="aa-section-title">Barista Performance Ranking</span></div>
          <ResponsiveTable
            columns={[
              { Header: '#', accessor: 'rank' },
              { Header: 'Barista', accessor: 'name' },
              { Header: 'Orders', accessor: 'orders_completed' },
              { Header: 'Avg Prep', accessor: 'avg_prep_time' },
              { Header: 'Attendance', accessor: 'attendance_rate' },
              { Header: 'Rating', accessor: 'performance_score' }
            ]}
            data={Array.isArray(baristas) && baristas.length > 0 ? baristas.map((b, i) => ({
              rank: `#${i + 1}`,
              name: b.user?.name || b.name || b.barista_name || 'N/A',
              orders_completed: b.orders_completed || b.total_orders || 0,
              avg_prep_time: `${parseFloat(b.avg_prep_time || 0).toFixed(0)} min`,
              attendance_rate: pct(b.attendance_rate),
              performance_score: parseFloat(b.performance_score || b.rating || 0).toFixed(1)
            })) : []}
            emptyMessage="No barista performance data available"
          />
        </div>
      </>
    );
  };

  /* ── Header controls ────────────────────────────────────────── */
  const headerRight = (
    <div style={{ display: 'flex', gap: '.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
      <div className="aa-time-toggle">
        {TIME_RANGES.map(r => (
          <ResponsiveButton
            key={r.key}
            variant="outline-secondary"
            size={timeRange === r.key ? 'sm' : 'xs'}
            className={`aa-time-btn${timeRange === r.key ? ' active' : ''}`}
            onClick={() => setTimeRange(r.key)}
          >
            {r.label}
          </ResponsiveButton>
        ))}
      </div>
      <ResponsiveButton
        variant="outline-primary"
        size="sm"
        className={`aa-icon-btn${refreshing ? ' spinning' : ''}`}
        onClick={handleRefresh}
        title="Refresh"
      >
        <FaSyncAlt />
      </ResponsiveButton>
      <ResponsiveButton
        variant="outline-success"
        size="sm"
        className="aa-export-btn"
        onClick={handleExport}
      >
        <FaFileExport /> Export CSV
      </ResponsiveButton>
    </div>
  );

  return (
    <PageShell
      title="Analytics"
      subtitle="Business insights across sales, customers and staff performance"
      headerRight={headerRight}
    >
      <div id="analytics-container">
        <div className="aa-toolbar">
          <div className="aa-tab-nav-wrap">
            <nav className="aa-tab-nav">
              {TABS.map(t => (
                <button key={t.key} className={`aa-tab-btn${activeTab === t.key ? ' active' : ''}`} onClick={() => setActiveTab(t.key)} title={t.label}>
                  {t.icon} <span className="aa-tab-label">{t.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        <div style={{ marginTop: '1.25rem' }}>
          {activeTab === 'sales'       && renderSales()}
          {activeTab === 'customers'   && renderCustomers()}
          {activeTab === 'performance' && renderPerformance()}
          {activeTab === 'segments'    && renderSegments()}
          {activeTab === 'barista'     && renderBarista()}
        </div>
      </div>
    </PageShell>
  );
};

export default AdminAnalytics;

