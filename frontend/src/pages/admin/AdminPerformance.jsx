import React, { useEffect, useState, useCallback } from 'react';
import {
  FaStar, FaSearch, FaPlus, FaEdit, FaTrash, FaTimes,
  FaSync, FaChartLine, FaUserCheck, FaMedal,
} from 'react-icons/fa';
import apiService from '../../services/api.service';
import { API_ENDPOINTS } from '../../config/api';
import PageShell from '../../components/layout/PageShell';
import './AdminWorkforce.css';
import ResponsiveButton from '../../components/responsive/Button';
import ResponsiveForm from '../../components/responsive/Form';
import ResponsiveModal from '../../components/responsive/Modal';
import ResponsiveTable from '../../components/responsive/Table';
import ResponsiveCard from '../../components/responsive/Card';
import ResponsiveAlert from '../../components/responsive/Alert';
import ResponsiveSpinner from '../../components/responsive/Spinner';
import ResponsiveBadge from '../../components/responsive/Badge';
import ResponsiveContainer from '../../components/responsive/Container';
import ResponsiveRow from '../../components/responsive/Row';
import ResponsiveCol from '../../components/responsive/Col';

const blankForm = () => ({
  employee_id: '', review_period: '', overall_score: '', punctuality_score: '',
  quality_score: '', teamwork_score: '', comments: '', reviewed_by: '',
});

const ScoreBar = ({ score }) => {
  const pct = Math.min(100, Math.max(0, parseFloat(score) || 0)) * 10;
  const color = pct >= 80 ? 'var(--color-dark-green)' : pct >= 60 ? 'var(--color-warning)' : 'var(--color-danger)';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
      <div style={{ flex: 1, height: 7, background: '#f3f4f6', borderRadius: 99, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 99, transition: 'width .3s' }} />
      </div>
      <span style={{ fontSize: '.78rem', fontWeight: 700, color, minWidth: 28 }}>{parseFloat(score) ? Number(score).toFixed(1) : '—'}</span>
    </div>
  );
};

const StarRating = ({ score }) => {
  const val = parseFloat(score) || 0;
  return (
    <span style={{ color: '#f59e0b', letterSpacing: 1 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <FaStar key={i} style={{ opacity: i <= Math.round(val / 2) ? 1 : .25 }} />
      ))}
    </span>
  );
};

const AdminPerformance = () => {
  const [reviews, setReviews]       = useState([]);
  const [employees, setEmployees]   = useState([]);
  const [stats, setStats]           = useState({ total: 0, avgScore: 0, excellent: 0, needsImprovement: 0 });
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [periodFilter, setPeriodFilter] = useState('');
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

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const params = periodFilter ? `?period=${encodeURIComponent(periodFilter)}` : '';
      const res = await apiService.get(`${API_ENDPOINTS.WORKFORCE.PERFORMANCE_REVIEWS}${params}`);
      if (res.success) {
        const d = Array.isArray(res.data) ? res.data : (res.data?.data || []);
        setReviews(d);
        const scores = d.map(r => parseFloat(r.overall_score)).filter(Boolean);
        const avg = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
        setStats({
          total:             d.length,
          avgScore:          avg.toFixed(1),
          excellent:         d.filter(r => parseFloat(r.overall_score) >= 8).length,
          needsImprovement:  d.filter(r => parseFloat(r.overall_score) < 6 && r.overall_score).length,
        });
      }
    } catch { setError('Failed to load performance reviews.'); }
    finally { setLoading(false); }
  }, [periodFilter]);

  useEffect(() => { fetchReviews(); fetchEmployees(); }, [fetchReviews, fetchEmployees]);

  const openAdd  = () => { setSelected(null); setFormData(blankForm()); setShowModal(true); };
  const openEdit = (review) => {
    setSelected(review);
    setFormData({
      employee_id:       review.employee_id || '',
      review_period:     review.review_period || '',
      overall_score:     review.overall_score || '',
      punctuality_score: review.punctuality_score || '',
      quality_score:     review.quality_score || '',
      teamwork_score:    review.teamwork_score || '',
      comments:          review.comments || '',
      reviewed_by:       review.reviewed_by || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...formData,
        overall_score:     parseFloat(formData.overall_score)     || null,
        punctuality_score: parseFloat(formData.punctuality_score) || null,
        quality_score:     parseFloat(formData.quality_score)     || null,
        teamwork_score:    parseFloat(formData.teamwork_score)    || null,
      };
      const res = selected
        ? await apiService.put(API_ENDPOINTS.WORKFORCE.PERFORMANCE_REVIEW_DETAIL(selected.id), payload)
        : await apiService.post(API_ENDPOINTS.WORKFORCE.PERFORMANCE_REVIEWS, payload);
      if (res.success) { setShowModal(false); fetchReviews(); }
      else setError(res.message || 'Save failed.');
    } catch { setError('Failed to save review.'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    try {
      await apiService.delete(API_ENDPOINTS.WORKFORCE.PERFORMANCE_REVIEW_DETAIL(toDelete.id));
      setShowDelete(false); setToDelete(null); fetchReviews();
    } catch { setError('Failed to delete review.'); }
  };

  const field = k => ({
    value: formData[k],
    onChange: e => setFormData(p => ({ ...p, [k]: e.target.value })),
  });

  const empName = id => {
    const e = employees.find(e => String(e.id) === String(id));
    return e ? e.name : id ? `#${id}` : '—';
  };

  const filtered = reviews.filter(r => {
    const q = search.toLowerCase();
    return empName(r.employee_id).toLowerCase().includes(q) || (r.review_period || '').toLowerCase().includes(q);
  });

  return (
    <PageShell title="Performance Reviews" subtitle="Track and manage employee performance" error={error} onRetry={fetchReviews}>
      <div className="wf-page">

        {/* Stats */}
        <div className="wf-stat-grid">
          {[
            { label: 'Total Reviews',     val: stats.total,            icon: <FaChartLine />,  color: 'blue'  },
            { label: 'Avg. Score',         val: `${stats.avgScore}/10`, icon: <FaStar />,       color: 'amber' },
            { label: 'Excellent (≥8)',     val: stats.excellent,        icon: <FaMedal />,      color: 'green' },
            { label: 'Needs Improvement', val: stats.needsImprovement,  icon: <FaUserCheck />,  color: 'red'   },
          ].map(({ label, val, icon, color }) => (
            <ResponsiveCard className={`wf-stat-card ${color}-soft`} key={label}>
              <ResponsiveCard.Body className="p-2">
                <div className={`wf-stat-icon text-${color}`}>{icon}</div>
                <div><div className="wf-stat-val">{val}</div><div className="wf-stat-label">{label}</div></div>
              </ResponsiveCard.Body>
            </ResponsiveCard>
          ))}
        </div>

        {/* Filter bar */}
        <div className="wf-filter-bar">
          <div className="wf-search-wrap">
            <FaSearch className="wf-search-icon" />
            <ResponsiveForm.Control
              type="text"
              className="wf-search-input"
              placeholder="Search by employee or period…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <input
            type="month"
            className="wf-select"
            value={periodFilter}
            onChange={e => setPeriodFilter(e.target.value)}
            style={{ cursor: 'pointer' }}
            title="Filter by period"
          />
          {periodFilter && <button className="wf-btn secondary" onClick={() => setPeriodFilter('')}>Clear</button>}
          <button className="wf-btn secondary wf-btn-icon" onClick={fetchReviews} title="Refresh"><FaSync /></button>
          <button className="wf-btn primary" onClick={openAdd}><FaPlus style={{ marginRight: '.4rem' }} />Add Review</button>
        </div>

        {/* Table */}
        <ResponsiveTable responsive hover className="wf-table">
          <thead className="table-light">
            <tr>
              <th>Employee</th><th>Period</th><th>Overall</th>
              <th>Punctuality</th><th>Quality</th><th>Teamwork</th>
              <th>Rating</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} className="text-center fw-light py-4">Loading reviews…</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={8} className="text-center fw-light py-4"><FaChartLine size={28} style={{ color: '#d1d5db', display: 'block', margin: '0 auto .5rem' }} />No reviews found.</td></tr>
            ) : filtered.map(review => (
              <tr key={review.id}>
                <td className="fw-bold">{empName(review.employee_id)}</td>
                <td className="text-muted">{review.review_period || '—'}</td>
                <td style={{ minWidth: 130 }}><ScoreBar score={review.overall_score} /></td>
                <td style={{ minWidth: 110 }}><ScoreBar score={review.punctuality_score} /></td>
                <td style={{ minWidth: 100 }}><ScoreBar score={review.quality_score} /></td>
                <td style={{ minWidth: 100 }}><ScoreBar score={review.teamwork_score} /></td>
                <td><StarRating score={review.overall_score} /></td>
                <td>
                  <div className="d-flex gap-2">
                    <ResponsiveButton variant="outline-secondary" size="sm" className="me-1" title="Edit" onClick={() => openEdit(review)}>
                      <FaEdit />
                    </ResponsiveButton>
                    <ResponsiveButton variant="outline-danger" size="sm" title="Delete" onClick={() => { setToDelete(review); setShowDelete(true); }}>
                      <FaTrash />
                    </ResponsiveButton>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </ResponsiveTable>

        {/* Add/Edit Modal */}
        {showModal && (
          <ResponsiveModal show={showModal} onHide={() => setShowModal(false)} centered={true} size="lg">
            <ResponsiveModal.Header closeButton>
              <ResponsiveModal.Title>
                <FaChartLine className="me-2" />{selected ? 'Edit Review' : 'Add Review'}
              </ResponsiveModal.Title>
            </ResponsiveModal.Header>
            <ResponsiveModal.Body>
              <form onSubmit={handleSubmit}>
                <div className="wf-form-row wf-2col">
                  <div>
                    <ResponsiveForm.Label className="wf-form-label">Employee *</ResponsiveForm.Label>
                    <ResponsiveForm.Control
                      type="select"
                      required
                      {...field('employee_id')}
                    >
                      <option value="">Select employee…</option>
                      {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                    </ResponsiveForm.Control>
                  </div>
                  <div>
                    <ResponsiveForm.Label className="wf-form-label">Review Period</ResponsiveForm.Label>
                    <ResponsiveForm.Control
                      type="month"
                      {...field('review_period')}
                    />
                  </div>
                </div>
                <div className="wf-form-row wf-2col">
                  <div>
                    <ResponsiveForm.Label className="wf-form-label">Overall Score (0-10)</ResponsiveForm.Label>
                    <ResponsiveForm.Control
                      type="number"
                      min="0"
                      max="10"
                      step="0.1"
                      className="wf-field-input"
                      placeholder="e.g. 8.5"
                      {...field('overall_score')}
                    />
                  </div>
                  <div>
                    <ResponsiveForm.Label className="wf-form-label">Punctuality Score (0-10)</ResponsiveForm.Label>
                    <ResponsiveForm.Control
                      type="number"
                      min="0"
                      max="10"
                      step="0.1"
                      className="wf-field-input"
                      placeholder="e.g. 9.0"
                      {...field('punctuality_score')}
                    />
                  </div>
                </div>
                <div className="wf-form-row wf-2col">
                  <div>
                    <ResponsiveForm.Label className="wf-form-label">Quality Score (0-10)</ResponsiveForm.Label>
                    <ResponsiveForm.Control
                      type="number"
                      min="0"
                      max="10"
                      step="0.1"
                      className="wf-field-input"
                      placeholder="e.g. 8.0"
                      {...field('quality_score')}
                    />
                  </div>
                  <div>
                    <ResponsiveForm.Label className="wf-form-label">Teamwork Score (0-10)</ResponsiveForm.Label>
                    <ResponsiveForm.Control
                      type="number"
                      min="0"
                      max="10"
                      step="0.1"
                      className="wf-field-input"
                      placeholder="e.g. 7.5"
                      {...field('teamwork_score')}
                    />
                  </div>
                </div>
                <div className="wf-form-row">
                  <ResponsiveForm.Label className="wf-form-label">Reviewed By</ResponsiveForm.Label>
                  <ResponsiveForm.Control
                    type="text"
                    placeholder="Reviewer name"
                    {...field('reviewed_by')}
                  />
                </div>
                <div className="wf-form-row">
                  <ResponsiveForm.Label className="wf-form-label">Comments</ResponsiveForm.Label>
                  <ResponsiveForm.Control
                    type="textarea"
                    rows={3}
                    placeholder="Performance notes and comments…"
                    {...field('comments')}
                  />
                </div>
                <ResponsiveModal.Footer>
                  <ResponsiveButton variant="outline-secondary" size="sm" onClick={() => setShowModal(false)}>
                    Cancel
                  </ResponsiveButton>
                  <ResponsiveButton variant="primary" size="sm" type="submit" disabled={saving}>
                    {saving ? 'Saving…' : selected ? 'Update Review' : 'Add Review'}
                  </ResponsiveButton>
                </ResponsiveModal.Footer>
              </form>
            </ResponsiveModal.Body>
          </ResponsiveModal>
        )}

        {/* Delete Confirm */}
        {showDelete && toDelete && (
          <div className="wf-modal-overlay" onClick={() => setShowDelete(false)}>
            <div className="wf-modal sm" onClick={e => e.stopPropagation()}>
              <div className="wf-modal-head">
                <span className="wf-modal-title" style={{ color: '#C41E3A' }}>Delete Review</span>
                <button className="wf-modal-close" onClick={() => setShowDelete(false)}><FaTimes /></button>
              </div>
              <div className="wf-modal-body" style={{ textAlign: 'center', padding: '1.5rem' }}>
                <p>Delete performance review for <strong>{empName(toDelete.employee_id)}</strong>?</p>
              </div>
              <div className="wf-modal-foot">
                <button className="wf-btn secondary" onClick={() => setShowDelete(false)}>Cancel</button>
                <button className="wf-btn danger" onClick={handleDelete}>Delete</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageShell>
  );
};

export default AdminPerformance;
