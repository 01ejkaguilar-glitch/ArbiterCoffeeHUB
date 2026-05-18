import React, { useEffect, useState, useCallback } from 'react';
import {
  FaTasks, FaSearch, FaPlus, FaEdit, FaTrash, FaTimes,
  FaSync, FaCheckCircle, FaHourglassHalf, FaExclamationCircle, FaUser,
} from 'react-icons/fa';
import apiService from '../../services/api.service';
import { API_ENDPOINTS } from '../../config/api';
import PageShell from '../../components/layout/PageShell';
import ResponsiveButton from '../../components/responsive/Button';
import ResponsiveForm from '../../components/responsive/Form';
import ResponsiveModal from '../../components/responsive/Modal';
import ResponsiveTable from '../../components/responsive/Table';
import ResponsiveCard from '../../components/responsive/Card';
import './AdminWorkforce.css';

const blankForm = () => ({
  title: '', description: '', assigned_to: '', priority: 'medium',
  status: 'pending', due_date: '',
});

const PriorityBadge = ({ priority }) => {
  const map = { high: 'red', medium: 'amber', low: 'teal' };
  return <span className={`wf-badge ${map[priority] || 'amber'}`}>{priority}</span>;
};
const StatusBadge = ({ status }) => {
  const map = { pending: 'amber', in_progress: 'in_progress', completed: 'present', cancelled: 'absent' };
  const label = status === 'in_progress' ? 'In Progress' : status;
  return <span className={`wf-badge ${map[status] || 'amber'}`}>{label}</span>;
};

const AdminTasks = () => {
  const [tasks, setTasks]           = useState([]);
  const [employees, setEmployees]   = useState([]);
  const [stats, setStats]           = useState({ total: 0, pending: 0, inProgress: 0, completed: 0 });
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [showModal, setShowModal]   = useState(false);
  const [selected, setSelected]     = useState(null);
  const [formData, setFormData]     = useState(blankForm());
  const [saving, setSaving]         = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [toDelete, setToDelete]     = useState(null);
  const [error, setError]           = useState(null);

  const fetchEmployees = useCallback(async () => {
    try {
      const res = await apiService.get(API_ENDPOINTS.WORKFORCE.EMPLOYEES);
      if (res.success) setEmployees(Array.isArray(res.data) ? res.data : (res.data?.data || []));
    } catch { /* non-fatal */ }
  }, []);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiService.get(API_ENDPOINTS.WORKFORCE.TASKS);
      if (res.success) {
        const d = Array.isArray(res.data) ? res.data : (res.data?.data || []);
        setTasks(d);
        setStats({
          total:      d.length,
          pending:    d.filter(t => t.status === 'pending').length,
          inProgress: d.filter(t => t.status === 'in_progress').length,
          completed:  d.filter(t => t.status === 'completed').length,
        });
      }
    } catch { setError('Failed to load tasks.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchTasks(); fetchEmployees(); }, [fetchTasks, fetchEmployees]);

  const openAdd  = () => { setSelected(null); setFormData(blankForm()); setShowModal(true); };
  const openEdit = (task) => {
    setSelected(task);
    setFormData({ title: task.title || '', description: task.description || '',
      assigned_to: task.assigned_to || task.employee_id || '',
      priority: task.priority || 'medium', status: task.status || 'pending',
      due_date: task.due_date || '' });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = selected
        ? await apiService.put(API_ENDPOINTS.WORKFORCE.TASK_DETAIL(selected.id), formData)
        : await apiService.post(API_ENDPOINTS.WORKFORCE.TASKS, formData);
      if (res.success) { setShowModal(false); fetchTasks(); }
      else setError(res.message || 'Save failed.');
    } catch { setError('Failed to save task.'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    try {
      await apiService.delete(API_ENDPOINTS.WORKFORCE.TASK_DETAIL(toDelete.id));
      setShowDelete(false); setToDelete(null); fetchTasks();
    } catch { setError('Failed to delete task.'); }
  };

  const field = k => ({
    value: formData[k],
    onChange: e => setFormData(p => ({ ...p, [k]: e.target.value })),
  });

  const empName = id => {
    const e = employees.find(e => String(e.id) === String(id));
    return e ? e.name : id ? `#${id}` : '—';
  };

  const filtered = tasks.filter(t => {
    const q = search.toLowerCase();
    const nameMatch   = (t.title || '').toLowerCase().includes(q) || empName(t.assigned_to).toLowerCase().includes(q);
    const statusMatch = statusFilter   === 'all' || t.status   === statusFilter;
    const prioMatch   = priorityFilter === 'all' || t.priority === priorityFilter;
    return nameMatch && statusMatch && prioMatch;
  });

  const overdue = (t) => t.due_date && t.status !== 'completed' && new Date(t.due_date) < new Date();

  return (
    <PageShell title="Task Management" subtitle="Assign and track employee tasks" error={error} onRetry={fetchTasks}>
      <div className="wf-page">

        {/* Stats */}
        <div className="wf-stat-grid">
          {[
            { label: 'Total Tasks',  val: stats.total,      icon: <FaTasks />,           color: 'blue'  },
            { label: 'Pending',      val: stats.pending,    icon: <FaHourglassHalf />,   color: 'amber' },
            { label: 'In Progress',  val: stats.inProgress, icon: <FaExclamationCircle />, color: 'teal'},
            { label: 'Completed',   val: stats.completed,  icon: <FaCheckCircle />,      color: 'green' },
          ].map(({ label, val, icon, color }) => (
            <div className="wf-stat-card" key={label}>
              <div className={`wf-stat-icon ${color}`}>{icon}</div>
              <div><div className="wf-stat-val">{val}</div><div className="wf-stat-label">{label}</div></div>
            </div>
          ))}
        </div>

        {/* Filter bar */}
        <div className="wf-filter-bar">
          <div className="wf-search-wrap">
            <FaSearch className="wf-search-icon" />
            <input className="wf-search-input" placeholder="Search tasks or assignee…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="wf-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <select className="wf-select" value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)}>
            <option value="all">All Priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <ResponsiveButton variant="outline-secondary" size="sm" className="wf-btn-icon" onClick={fetchTasks} title="Refresh"><FaSync /></ResponsiveButton>
          <ResponsiveButton variant="primary" size="md" onClick={openAdd}><FaPlus style={{ marginRight: '.4rem' }} />Add Task</ResponsiveButton>
        </div>

        {/* Table */}
        <ResponsiveTable
          columns={[
            { Header: 'Task', accessor: 'title' },
            { Header: 'Assigned To', accessor: 'assigned_to' },
            { Header: 'Priority', accessor: 'priority' },
            { Header: 'Due Date', accessor: 'due_date' },
            { Header: 'Status', accessor: 'status' },
            { Header: 'Actions', accessor: 'actions' }
          ]}
          data={filtered.map(task => ({
            id: task.id,
            title: task.title,
            description: task.description,
            assigned_to: task.assigned_to || task.employee_id,
            priority: task.priority,
            status: task.status,
            due_date: task.due_date,
            overdue: overdue(task)
          }))}
          loading={loading}
          emptyMessage={<><FaTasks size={28} style={{ color: '#d1d5db', display: 'block', margin: '0 auto .5rem' }} />No tasks found.</>}
        >
          {(columnProps) => {
            if (columnProps.column.accessor === 'title') {
              return (
                <div className="wf-td-bold">{columnProps.value}</div>
                {columnProps.row.description && <div className="wf-td-muted" style={{ fontSize: '.75rem', marginTop: 2, maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{columnProps.row.description}</div>}
                {columnProps.row.overdue && <span style={{ fontSize: '.7rem', color: '#ef4444', fontWeight: 600 }}>OVERDUE</span>}
              );
            }

            if (columnProps.column.accessor === 'assigned_to') {
              return (
                <div style={{ display: 'flex', alignItems: 'center', gap: '.4rem' }}>
                  <FaUser size={10} style={{ color: '#9ca3af' }} />
                  <span>{empName(columnProps.row.assigned_to)}</span>
                </div>
              );
            }

            if (columnProps.column.accessor === 'priority') {
              return <PriorityBadge priority={columnProps.value} />;
            }

            if (columnProps.column.accessor === 'due_date') {
              return <td className="wf-td-muted">{columnProps.value ? new Date(columnProps.value + 'T00:00:00').toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}</td>;
            }

            if (columnProps.column.accessor === 'status') {
              return <StatusBadge status={columnProps.value} />;
            }

            if (columnProps.column.accessor === 'actions') {
              return (
                <div className="wf-action-group">
                  <ResponsiveButton variant="outline-secondary" size="sm" className="wf-action-btn edit" title="Edit" onClick={() => openEdit(columnProps.row)}>
                    <FaEdit />
                  </ResponsiveButton>
                  <ResponsiveButton variant="outline-danger" size="sm" className="wf-action-btn delete" title="Delete" onClick={() => { setToDelete(columnProps.row); setShowDelete(true); }}>
                    <FaTrash />
                  </ResponsiveButton>
                </div>
              );
            }

            return <td>{columnProps.cell}</td>;
          }}
        </ResponsiveTable>

        {/* Add/Edit Modal */}
        {showModal && (
          <div className="wf-modal-overlay" onClick={() => setShowModal(false)}>
            <div className="wf-modal" onClick={e => e.stopPropagation()}>
              <div className="wf-modal-head">
                <span className="wf-modal-title"><FaTasks style={{ marginRight: '.5rem' }} />{selected ? 'Edit Task' : 'Add Task'}</span>
                <button className="wf-modal-close" onClick={() => setShowModal(false)}><FaTimes /></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="wf-modal-body">
                  <ResponsiveForm.Group className="wf-form-row">
                    <ResponsiveForm.Label className="wf-form-label">Task Title *</ResponsiveForm.Label>
                    <ResponsiveForm.Control
                      type="text"
                      placeholder="Task title"
                      required
                      {...field('title')}
                    />
                  </ResponsiveForm.Group>
                  <ResponsiveForm.Group className="wf-form-row">
                    <ResponsiveForm.Label className="wf-form-label">Description</ResponsiveForm.Label>
                    <ResponsiveForm.Control
                      type="textarea"
                      rows={3}
                      placeholder="Task description…"
                      {...field('description')}
                    />
                  </ResponsiveForm.Group>
                  <ResponsiveForm.Group className="wf-form-row">
                    <ResponsiveForm.Label className="wf-form-label">Assign To</ResponsiveForm.Label>
                    <ResponsiveForm.Control
                      type="select"
                      {...field('assigned_to')}
                    >
                      <option value="">Unassigned</option>
                      {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                    </ResponsiveForm.Control>
                  </ResponsiveForm.Group>
                  <ResponsiveForm.Group className="wf-form-row wf-2col">
                    <div>
                      <ResponsiveForm.Label className="wf-form-label">Priority</ResponsiveForm.Label>
                      <ResponsiveForm.Control
                        type="select"
                        {...field('priority')}
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </ResponsiveForm.Control>
                    </div>
                    <div>
                      <ResponsiveForm.Label className="wf-form-label">Status</ResponsiveForm.Label>
                      <ResponsiveForm.Control
                        type="select"
                        {...field('status')}
                      >
                        <option value="pending">Pending</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </ResponsiveForm.Control>
                    </div>
                  </ResponsiveForm.Group>
                  <ResponsiveForm.Group className="wf-form-row">
                    <ResponsiveForm.Label className="wf-form-label">Due Date</ResponsiveForm.Label>
                    <ResponsiveForm.Control
                      type="date"
                      {...field('due_date')}
                    />
                  </ResponsiveForm.Group>
                </div>
                <div className="wf-modal-foot">
                  <ResponsiveButton variant="outline-secondary" size="sm" onClick={() => setShowModal(false)}>Cancel</ResponsiveButton>
                  <ResponsiveButton variant="primary" size="sm" type="submit" disabled={saving}>{saving ? 'Saving…' : selected ? 'Update Task' : 'Add Task'}</ResponsiveButton>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirm */}
        {showDelete && toDelete && (
          <div className="wf-modal-overlay" onClick={() => setShowDelete(false)}>
            <div className="wf-modal sm" onClick={e => e.stopPropagation()}>
              <div className="wf-modal-head">
                <span className="wf-modal-title" style={{ color: '#C41E3A' }}>Delete Task</span>
                <button className="wf-modal-close" onClick={() => setShowDelete(false)}><FaTimes /></button>
              </div>
              <div className="wf-modal-body" style={{ textAlign: 'center', padding: '1.5rem' }}>
                <p>Delete task <strong>"{toDelete.title}"</strong>?</p>
              </div>
              <div className="wf-modal-foot">
                <ResponsiveButton variant="outline-secondary" size="sm" onClick={() => setShowDelete(false)}>Cancel</ResponsiveButton>
                <ResponsiveButton variant="outline-danger" size="sm" onClick={handleDelete}>Delete</ResponsiveButton>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageShell>
  );
};

export default AdminTasks;
