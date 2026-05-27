import React, { useEffect, useState, useCallback } from 'react';
import {
  FaCalendarAlt, FaSearch, FaPlus, FaEdit, FaTrash,
  FaTimes, FaSync, FaClock, FaUsers, FaChevronLeft, FaChevronRight,
  FaExchangeAlt, FaStopwatch, FaClipboardList,
} from 'react-icons/fa';
import apiService from '../../services/api.service';
import { API_ENDPOINTS } from '../../config/api';
import PageShell from '../../components/layout/PageShell';
import ResponsiveButton from '@/components/responsive/Button';
import ResponsiveForm from '@/components/responsive/Form';
import ResponsiveModal from '@/components/responsive/Modal';
import ResponsiveTable from '@/components/responsive/Table';
import ResponsiveCard from '@/components/responsive/Card';
import ResponsiveAlert from '@/components/responsive/Alert';
import ResponsiveSpinner from '@/components/responsive/Spinner';
import ResponsiveBadge from '@/components/responsive/Badge';
import ResponsiveContainer from '@/components/responsive/Container';
import ResponsiveRow from '@/components/responsive/Row';
import ResponsiveCol from '@/components/responsive/Col';
import { useNotificationSystem } from '../../components/common/NotificationSystem';
import './BaristaShifts.css';

const DAYS   = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const fmtTime = t => t ? t.slice(0, 5) : '—';
const normalizeShift = (shift, fallbackDate = '') => ({
  ...shift,
  shift_date: shift.shift_date || shift.date || fallbackDate || '',
});
const getWeekStart = (d = new Date()) => {
  const day = new Date(d);
  day.setDate(day.getDate() - day.getDay());
  day.setHours(0, 0, 0, 0);
  return day;
};
const fmtDateLabel = d => d.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' });

const blankForm = () => ({
  employee_id: '', shift_date: '', start_time: '08:00', end_time: '16:00', notes: '',
});

const BaristaShifts = () => {
  const [shifts, setShifts]           = useState([]);
  const [employees, setEmployees]     = useState([]);
  const [weeklyData, setWeeklyData]   = useState([]);
  const [stats, setStats]             = useState({ total: 0, today: 0, upcoming: 0, uniqueEmp: 0 });
  const [loading, setLoading]         = useState(true);
  const [currentWeek, setCurrentWeek] = useState(() => getWeekStart());
  const [view, setView]               = useState('list'); // 'list' | 'week'
  const [search, setSearch]           = useState('');
  const [showModal, setShowModal]     = useState(false);
  const [selected, setSelected]       = useState(null);
  const [formData, setFormData]       = useState(blankForm());
  const [saving, setSaving]           = useState(false);
  const [showDelete, setShowDelete]   = useState(false);
  const [toDelete, setToDelete]       = useState(null);
  const [error, setError]             = useState(null);
  const [breakTimer, setBreakTimer]   = useState(null);
  const [isOnBreak, setIsOnBreak]     = useState(false);
  const [breakStartTime, setBreakStartTime] = useState(null);
  const [elapsedBreakTime, setElapsedBreakTime] = useState(0);

  const fetchEmployees = useCallback(async () => {
    try {
      const res = await apiService.get(API_ENDPOINTS.WORKFORCE.EMPLOYEES);
      if (res.success) setEmployees(Array.isArray(res.data) ? res.data : (res.data?.data || []));
    } catch { /* non-fatal */ }
  }, []);

  const fetchShifts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiService.get(API_ENDPOINTS.WORKFORCE.SHIFTS);
      if (res.success) {
        const raw = Array.isArray(res.data) ? res.data : (res.data?.data || []);
        const d = Array.isArray(raw) ? raw.map(shift => normalizeShift(shift)) : [];
        setShifts(d);
        const today = new Date().toISOString().slice(0, 10);
        setStats({
          total:     d.length,
          today:     d.filter(s => s.shift_date === today).length,
          upcoming:  d.filter(s => s.shift_date > today).length,
          uniqueEmp: new Set(d.map(s => s.employee_id)).size,
        });
      }
    } catch { setError('Failed to load shifts.'); }
    finally { setLoading(false); }
  }, []);

  const fetchWeekly = useCallback(async () => {
    try {
      const params = `?week_start=${currentWeek.toISOString().slice(0, 10)}`;
      const res = await apiService.get(`${API_ENDPOINTS.WORKFORCE.WEEKLY_SCHEDULE}${params}`);
      if (res.success) {
        const raw = Array.isArray(res.data) ? res.data : (res.data?.data || []);
        const flattened = Array.isArray(raw)
          ? raw.map(shift => normalizeShift(shift))
          : Object.entries(raw || {}).flatMap(([date, items]) =>
              (Array.isArray(items) ? items : []).map(shift => normalizeShift(shift, date))
            );
        setWeeklyData(flattened);
      }
    } catch { /* non-fatal */ }
  }, [currentWeek]);

  useEffect(() => { fetchShifts(); fetchEmployees(); }, [fetchShifts, fetchEmployees]);
  useEffect(() => { if (view === 'week') fetchWeekly(); }, [view, fetchWeekly]);

  const prevWeek = () => { const w = new Date(currentWeek); w.setDate(w.getDate() - 7); setCurrentWeek(w); };
  const nextWeek = () => { const w = new Date(currentWeek); w.setDate(w.getDate() + 7); setCurrentWeek(w); };

  const openAdd = () => { setSelected(null); setFormData(blankForm()); setShowModal(true); };
  const openEdit = (sh) => {
    setSelected(sh);
    setFormData({
      employee_id: sh.employee_id || '',
      shift_date: sh.shift_date || sh.date || '',
      start_time: sh.start_time?.slice(0, 5) || '08:00',
      end_time: sh.end_time?.slice(0, 5) || '16:00',
      notes: sh.notes || ''
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        employee_id: formData.employee_id,
        date: formData.shift_date,
        start_time: formData.start_time,
        end_time: formData.end_time,
        notes: formData.notes,
      };
      const res = selected
        ? await apiService.put(API_ENDPOINTS.WORKFORCE.SHIFT_DETAIL(selected.id), payload)
        : await apiService.post(API_ENDPOINTS.WORKFORCE.SHIFTS, payload);
      if (res.success) {
        setShowModal(false);
        fetchShifts();
        if (view === 'week') fetchWeekly();
      }
      else setError(res.message || 'Save failed.');
    } catch { setError('Failed to save shift.'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    try {
      await apiService.delete(API_ENDPOINTS.WORKFORCE.SHIFT_DETAIL(toDelete.id));
      setShowDelete(false); setToDelete(null); fetchShifts();
    } catch { setError('Failed to delete shift.'); }
  };

    const requestShiftSwap = async (shiftId) => {
    const { showSuccessNotification, showErrorNotification } = useNotificationSystem();
    try {
      // Implementation for shift swap request
      // In a real app, this would make an API request to request a shift swap
      showSuccessNotification('Shift swap request submitted!');
    } catch (error) {
      showErrorNotification('Failed to submit shift swap request');
    }
  };

  const startBreak = async () => {
    const { showSuccessNotification } = useNotificationSystem();
    setIsOnBreak(true);
    setBreakStartTime(new Date());
    // Start break timer
    const interval = setInterval(() => {
      setElapsedBreakTime(Date.now() - breakStartTime.getTime());
    }, 1000);
    // Store interval ID to clear later
    setBreakTimer(interval);
    showSuccessNotification('Break started');
  };

  const endBreak = async () => {
    const { showSuccessNotification } = useNotificationSystem();
    if (breakTimer) {
      clearInterval(breakTimer);
      setBreakTimer(null);
    }
    setIsOnBreak(false);
    // Save break time to backend if needed
    const breakDuration = elapsedBreakTime;
    setElapsedBreakTime(0);
    if (breakDuration > 0) {
      showSuccessNotification(`Break ended. Duration: ${Math.floor(breakDuration / 60000)} minutes`);
    }
  };

  const field = k => ({
    value: formData[k],
    onChange: e => setFormData(p => ({ ...p, [k]: e.target.value })),
  });

  const empName = id => {
    const e = employees.find(e => String(e.id) === String(id));
    return e ? e.name : `#${id}`;
  };

  const filtered = shifts.filter(s => {
    const q = search.toLowerCase();
    return empName(s.employee_id).toLowerCase().includes(q) || (s.shift_date || '').includes(q);
  });

  // Build weekly grid: array of 7 day-columns
  const weekDays = DAYS.map((_, i) => {
    const d = new Date(currentWeek); d.setDate(d.getDate() + i);
    return d;
  });

  return (
    <PageShell title="My Shifts" subtitle="Manage and view your work schedules" error={error} onRetry={fetchShifts}>
      <div className="bs-page">

        {/* Current Shift Info and Break Timer */}
        <ResponsiveCard className="border-0 shadow-sm h-100 mb-4">
          <ResponsiveCard.Header className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">
              <FaClipboardList className="me-2" />
              Current Shift
            </h5>
            <div className="d-flex align-items-center gap-3">
              <ResponsiveButton
                variant="outline-secondary"
                size="sm"
                className=""
                onClick={() => {/* Clock in/out logic */}}
              >
                <div className="d-flex justify-content-start align-items-center">
                  <FaSignInAlt size={13} className="me-2" />
                  <span>Clock In/Out</span>
                </div>
              </ResponsiveButton>
              <ResponsiveButton
                variant={isOnBreak ? 'success' : 'outline-secondary'}
                size="sm"
                onClick={isOnBreak ? endBreak : startBreak}
              >
                {isOnBreak ? (
                  <>
                    <FaStopwatch className="me-2" />
                    End Break
                  </>
                ) : (
                  <>
                    <FaStopwatch className="me-2" />
                    Start Break
                  </>
                )}
              </ResponsiveButton>
            </div>
          </ResponsiveCard.Header>
          <ResponsiveCard.Body className="p-4">
            {/* Current shift details would go here */}
            <div className="text-center">
              <p className="text-muted">No active shift</p>
              {isOnBreak && (
                <div className="mt-3">
                  <p className="fw-bold">On Break</p>
                  <p className="text-success">{Math.floor(elapsedBreakTime / 60000)} minutes</p>
                </div>
              )}
            </div>
          </ResponsiveCard.Body>
        </ResponsiveCard>

        {/* Stats */}
        <div className="bs-stat-grid">
          {[
            { label: 'Total Shifts',     val: stats.total,     icon: <FaCalendarAlt />, color: 'blue'  },
            { label: 'Today\'s Shifts',  val: stats.today,     icon: <FaClock />,       color: 'green' },
            { label: 'Upcoming',         val: stats.upcoming,  icon: <FaChevronRight />, color: 'amber' },
            { label: 'Employees Scheduled', val: stats.uniqueEmp, icon: <FaUsers />,    color: 'teal'  },
          ].map(({ label, val, icon, color }) => (
            <ResponsiveCard className={`bs-stat-card ${color}-soft`} key={label}>
              <ResponsiveCard.Body className="p-2">
                <div className={`bs-stat-icon text-${color}`}>{icon}</div>
                <div><div className="bs-stat-val">{val}</div><div className="bs-stat-label">{label}</div></div>
              </ResponsiveCard.Body>
            </ResponsiveCard>
          ))}
        </div>

        {/* Filter bar */}
        <div className="bs-filter-bar">
          <div className="bs-search-wrap">
            <FaSearch className="bs-search-icon" />
            <input className="bs-search-input" placeholder="Search by name or date…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div style={{ display: 'flex', gap: '.5rem' }}>
            <ResponsiveButton variant={view === 'list' ? 'primary' : 'outline-secondary'} size="sm" onClick={() => setView('list')}>List</ResponsiveButton>
            <ResponsiveButton variant={view === 'week' ? 'primary' : 'outline-secondary'} size="sm" onClick={() => setView('week')}>Weekly</ResponsiveButton>
          </div>
          <ResponsiveButton variant="outline-secondary" size="sm" className="bs-btn-icon" onClick={() => { fetchShifts(); if (view === 'week') fetchWeekly(); }} title="Refresh"><FaSync /></ResponsiveButton>
          <ResponsiveButton variant="primary" size="sm" onClick={openAdd}><FaPlus style={{ marginRight: '.4rem' }} />Add Shift</ResponsiveButton>
        </div>

        {/* List View */}
        {view === 'list' && (
          <div className="bs-table-wrap">
            <table className="bs-table">
              <thead>
                <tr>
                  <th>Employee</th><th>Date</th><th>Start</th><th>End</th><th>Hours</th><th>Notes</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} className="bs-empty">Loading shifts…</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={7} className="bs-empty"><FaCalendarAlt size={26} style={{ color: '#d1d5db', display: 'block', margin: '0 auto .5rem' }} />No shifts found.</td></tr>
                ) : filtered.map(sh => {
                  const hrs = sh.start_time && sh.end_time
                    ? (new Date(`2000-01-01T${sh.end_time}`) - new Date(`2000-01-01T${sh.start_time}`)) / 3600000
                    : null;
                  return (
                    <tr key={sh.id}>
                      <td className="bs-td-bold">{empName(sh.employee_id)}</td>
                      <td className="bs-td-muted">{sh.shift_date ? new Date(sh.shift_date + 'T00:00:00').toLocaleDateString('en-PH', { weekday: 'short', month: 'short', day: 'numeric' }) : '—'}</td>
                      <td>{fmtTime(sh.start_time)}</td>
                      <td>{fmtTime(sh.end_time)}</td>
                      <td style={{ fontWeight: 600 }}>{hrs != null ? `${hrs}h` : '—'}</td>
                      <td className="bs-td-muted">{sh.notes || '—'}</td>
                      <td>
                        <div className="bs-action-group">
                          <ResponsiveButton variant="outline-primary" size="sm" title="Edit" onClick={() => openEdit(sh)} className="p-0"><FaEdit size={13} /></ResponsiveButton>
                          <ResponsiveButton variant="outline-info" size="sm" title="Request Swap" onClick={() => requestShiftSwap(sh.id)} className="p-0"><FaExchangeAlt size={13} /></ResponsiveButton>
                          <ResponsiveButton variant="outline-danger" size="sm" title="Delete" onClick={() => { setToDelete(sh); setShowDelete(true); }} className="p-0"><FaTrash size={13} /></ResponsiveButton>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Weekly View */}
        {view === 'week' && (
          <div className="bs-table-wrap">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '.75rem 1rem', borderBottom: '1px solid #f3f4f6' }}>
              <ResponsiveButton variant="outline-secondary" size="sm" className="bs-btn-icon" onClick={prevWeek}><FaChevronLeft /></ResponsiveButton>
              <span style={{ fontWeight: 600, color: '#374151' }}>
                {fmtDateLabel(weekDays[0])} — {fmtDateLabel(weekDays[6])}
              </span>
              <ResponsiveButton variant="outline-secondary" size="sm" className="bs-btn-icon" onClick={nextWeek}><FaChevronRight /></ResponsiveButton>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table className="bs-table" style={{ minWidth: 700 }}>
                <thead>
                  <tr>
                    {weekDays.map((d, i) => (
                      <th key={i} style={{ textAlign: 'center' }}>
                        {DAYS[i]}<br /><span style={{ fontWeight: 400, fontSize: '.75rem', color: '#6b7280' }}>{fmtDateLabel(d)}</span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    {weekDays.map((d, i) => {
                      const iso = d.toISOString().slice(0, 10);
                      const dayShifts = (weeklyData.length ? weeklyData : shifts).filter(s => (s.shift_date || s.date) === iso);
                      return (
                        <td key={i} style={{ verticalAlign: 'top', minWidth: 120, padding: '.5rem' }}>
                          {dayShifts.length === 0 ? (
                            <span style={{ color: '#d1d5db', fontSize: '.75rem' }}>—</span>
                          ) : dayShifts.map(sh => (
                            <div key={sh.id} style={{ background: 'var(--color-success-bg)', borderRadius: 6, padding: '4px 8px', marginBottom: 4, fontSize: '.75rem' }}>
                              <div style={{ fontWeight: 600, color: 'var(--color-dark-green)' }}>{empName(sh.employee_id)}</div>
                              <div style={{ color: 'var(--color-medium-green)' }}>{fmtTime(sh.start_time)}–{fmtTime(sh.end_time)}</div>
                            </div>
                          ))}
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Add/Edit Modal */}
        {showModal && (
          <div className="bs-modal-overlay" onClick={() => setShowModal(false)}>
            <div className="bs-modal" onClick={e => e.stopPropagation()}>
              <div className="bs-modal-head">
                <span className="bs-modal-title"><FaCalendarAlt style={{ marginRight: '.5rem' }} />{selected ? 'Edit Shift' : 'Add Shift'}</span>
                <ResponsiveButton variant="link" size="xs" onClick={() => setShowModal(false)} className="p-0 m-0"><FaTimes size={12} /></ResponsiveButton>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="bs-modal-body">
                  <div className="bs-form-row">
                    <label className="bs-form-label">Employee *</label>
                    <select className="bs-field-select" required {...field('employee_id')}>
                      <option value="">Select employee…</option>
                      {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                    </select>
                  </div>
                  <div className="bs-form-row">
                    <label className="bs-form-label">Shift Date *</label>
                    <input type="date" className="bs-field-input" required {...field('shift_date')} />
                  </div>
                  <div className="bs-form-row bs-2col">
                    <div>
                      <label className="bs-form-label">Start Time</label>
                      <input type="time" className="bs-field-input" {...field('start_time')} />
                    </div>
                    <div>
                      <label className="bs-form-label">End Time</label>
                      <input type="time" className="bs-field-input" {...field('end_time')} />
                    </div>
                  </div>
                  <div className="bs-form-row">
                    <label className="bs-form-label">Notes</label>
                    <textarea className="bs-field-textarea" rows={2} placeholder="Optional notes…" {...field('notes')} />
                  </div>
                </div>
                <div className="bs-modal-foot">
                  <ResponsiveButton variant="outline-secondary" size="sm" onClick={() => setShowModal(false)}>Cancel</ResponsiveButton>
                  <ResponsiveButton variant="primary" size="sm" type="submit" disabled={saving}>
                    {saving ? 'Saving…' : selected ? 'Update Shift' : 'Add Shift'}
                  </ResponsiveButton>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirm */}
        {showDelete && toDelete && (
          <div className="bs-modal-overlay" onClick={() => setShowDelete(false)}>
            <div className="bs-modal sm" onClick={e => e.stopPropagation()}>
              <div className="bs-modal-head">
                <span className="bs-modal-title" style={{ color: '#C41E3A' }}>Delete Shift</span>
                <button className="bs-modal-close" onClick={() => setShowDelete(false)}><FaTimes /></button>
              </div>
              <div className="bs-modal-body" style={{ textAlign: 'center', padding: '1.5rem' }}>
                <p>Remove shift for <strong>{empName(toDelete.employee_id)}</strong> on <strong>{toDelete.shift_date}</strong>?</p>
              </div>
              <div className="bs-modal-foot">
                <ResponsiveButton variant="outline-secondary" size="sm" onClick={() => setShowDelete(false)}>Cancel</ResponsiveButton>
                <ResponsiveButton variant="danger" size="sm" onClick={handleDelete}>Delete</ResponsiveButton>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageShell>
  );
};

export default BaristaShifts;