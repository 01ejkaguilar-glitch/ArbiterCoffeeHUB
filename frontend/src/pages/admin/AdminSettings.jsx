import React, { useEffect, useState, useCallback } from 'react';
import { ResponsiveButton, ResponsiveCard, ResponsiveAlert, ResponsiveModal } from '../../components/responsive';
import {
  FaHistory, FaUsers, FaPlus, FaEdit, FaTrash, FaTimes,
  FaChevronUp, FaChevronDown, FaSave, FaUserCircle, FaSync,
} from 'react-icons/fa';
import apiService from '../../services/api.service';
import { API_ENDPOINTS } from '../../config/api';
import PageShell from '../../components/layout/PageShell';
import useApiError from '../../hooks/useApiError';
import './AdminSettings.css';

// ─── Blank helpers ────────────────────────────────────────────────────────────
const blankTimeline = () => ({ year: new Date().getFullYear(), title: '', description: '' });
const blankMember   = () => ({ name: '', role: '', bio: '', photo_url: '', display_order: 0 });

// ── Validation Functions ─────────────────────────────────────────────────────
const validateTimelineField = (field, value) => {
  let error = '';
  switch (field) {
    case 'year':
      const yearNum = parseInt(value);
      if (!value) {
        error = 'Year is required';
      } else if (isNaN(yearNum)) {
        error = 'Year must be a valid number';
      } else if (yearNum < 1900 || yearNum > 2100) {
        error = 'Year must be between 1900 and 2100';
      }
      break;
    case 'title':
      if (!value || value.trim() === '') {
        error = 'Title is required';
      }
      break;
    default:
      break;
  }
  return error;
};

const validateTeamMemberField = (field, value) => {
  let error = '';
  switch (field) {
    case 'name':
      if (!value || value.trim() === '') {
        error = 'Full name is required';
      }
      break;
    case 'photo_url':
      if (value && value.trim() !== '') {
        try {
          new URL(value);
        } catch (_) {
          error = 'Please enter a valid URL';
        }
      }
      break;
    case 'display_order':
      const orderNum = parseInt(value);
      if (value && !isNaN(orderNum) && orderNum < 0) {
        error = 'Display order must be 0 or greater';
      }
      break;
    default:
      break;
  }
  return error;
};


// ─── Main Component ───────────────────────────────────────────────────────────
const AdminSettings = () => {
  const [timeline, setTimeline]   = useState([]);
  const [team, setTeam]           = useState([]);
  const [loading, setLoading]     = useState({ timeline: true, team: true });
  const [saving, setSaving]       = useState({ timeline: false, team: false });
  const [alert, setAlert]         = useState({ timeline: null, team: null });
  const { errorInfo, getErrorInfo } = useApiError();
  // Validation states
  const [tlErrors, setTlErrors]   = useState({});
  const [tmErrors, setTmErrors]   = useState({});

  // Modal state shared
  const [tlModal, setTlModal]     = useState(false);
  const [tmModal, setTmModal]     = useState(false);
  const [selected, setSelected]   = useState(null);
  const [tlForm, setTlForm]       = useState(blankTimeline());
  const [tmForm, setTmForm]       = useState(blankMember());

  const validateTimeline = () => {
    const errors = {};

    // Validate year
    const yearError = validateTimelineField('year', tlForm.year);
    if (yearError) errors.year = yearError;

    // Validate title
    const titleError = validateTimelineField('title', tlForm.title);
    if (titleError) errors.title = titleError;

    setTlErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateTeamMember = () => {
    const errors = {};

    // Validate name
    const nameError = validateTeamMemberField('name', tmForm.name);
    if (nameError) errors.name = nameError;

    // Validate photo_url
    const photoError = validateTeamMemberField('photo_url', tmForm.photo_url);
    if (photoError) errors.photo_url = photoError;

    // Validate display_order
    const orderError = validateTeamMemberField('display_order', tmForm.display_order);
    if (orderError) errors.display_order = orderError;

    setTmErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const clearAlert = (key) => setAlert(p => ({ ...p, [key]: null }));
  const showAlert = (key, msg, type = 'success') => {
    setAlert(p => ({ ...p, [key]: { msg, type } }));
    setTimeout(() => clearAlert(key), 4000);
  };

  // ── Fetch Timeline ──────────────────────────────────────────────────────────
  // Only getErrorInfo is in the dependency array because it's the only value that can change between renders.
  // API_ENDPOINTS.ADMIN.SETTINGS.TIMELINE and apiService.get are imported constants/immutable references
  // that never change, so they don't need to be in the dependency array.
  const fetchTimeline = useCallback(async () => {
    setLoading(p => ({ ...p, timeline: true }));
    try {
      const res = await apiService.get(API_ENDPOINTS.ADMIN.SETTINGS.TIMELINE);
      if (res.success) setTimeline(Array.isArray(res.data) ? res.data : (res.data?.data || []));
    } catch (err) {
      getErrorInfo(err);
    }
    finally { setLoading(p => ({ ...p, timeline: false })); }
  }, [getErrorInfo]);

  // ── Fetch Team ──────────────────────────────────────────────────────────────
  // Only getErrorInfo is in the dependency array because it's the only value that can change between renders.
// API_ENDPOINTS.ADMIN.SETTINGS.TEAM and apiService.get are imported constants/immutable references
// that never change, so they don't need to be in the dependency array.
  const fetchTeam = useCallback(async () => {
    setLoading(p => ({ ...p, team: true }));
    try {
      const res = await apiService.get(API_ENDPOINTS.ADMIN.SETTINGS.TEAM);
      if (res.success) setTeam(Array.isArray(res.data) ? res.data : (res.data?.data || []));
    } catch (err) {
      getErrorInfo(err);
    }
    finally { setLoading(p => ({ ...p, team: false })); }
  }, [getErrorInfo]);

  useEffect(() => { fetchTimeline(); fetchTeam(); }, [fetchTimeline, fetchTeam]);

  // ── Timeline CRUD ───────────────────────────────────────────────────────────
  const openTlAdd  = () => { setSelected(null); setTlForm(blankTimeline()); setTlModal(true); };
  const openTlEdit = (item) => { setSelected(item); setTlForm({ year: item.year || '', title: item.title || '', description: item.description || '' }); setTlModal(true); };

  const saveTl = async (e) => {
    e.preventDefault();
    // Validate form before submitting
    if (!validateTimeline()) {
      return;
    }
    setSaving(p => ({ ...p, timeline: true }));
    try {
      const res = selected
        ? await apiService.put(`${API_ENDPOINTS.ADMIN.SETTINGS.TIMELINE}/${selected.id}`, tlForm)
        : await apiService.post(API_ENDPOINTS.ADMIN.SETTINGS.TIMELINE, tlForm);
      if (res.success) { setTlModal(false); fetchTimeline(); showAlert('timeline', selected ? 'Timeline entry updated.' : 'Timeline entry added.'); }
      else {
        getErrorInfo({ message: res.message || 'Save failed.' });
      }
    } catch (err) {
      getErrorInfo(err);
    }
    finally { setSaving(p => ({ ...p, timeline: false })); }
  };

  const deleteTl = async (item) => {
    if (!window.confirm(`Delete "${item.title}" (${item.year})?`)) return;
    try {
      await apiService.delete(`${API_ENDPOINTS.ADMIN.SETTINGS.TIMELINE}/${item.id}`);
      fetchTimeline(); showAlert('timeline', 'Entry deleted.');
    } catch (err) {
      getErrorInfo(err);
    }
  };

  const moveTl = (idx, dir) => {
    const arr = [...timeline];
    const target = idx + dir;
    if (target < 0 || target >= arr.length) return;
    [arr[idx], arr[target]] = [arr[target], arr[idx]];
    setTimeline(arr);
  };

  // ── Team CRUD ───────────────────────────────────────────────────────────────
  const openTmAdd  = () => { setSelected(null); setTmForm(blankMember()); setTmModal(true); };
  const openTmEdit = (m) => { setSelected(m); setTmForm({ name: m.name || '', role: m.role || '', bio: m.bio || '', photo_url: m.photo_url || '', display_order: m.display_order || 0 }); setTmModal(true); };

  const saveTm = async (e) => {
    e.preventDefault();
    // Validate form before submitting
    if (!validateTeamMember()) {
      return;
    }
    setSaving(p => ({ ...p, team: true }));
    try {
      const res = selected
        ? await apiService.put(`${API_ENDPOINTS.ADMIN.SETTINGS.TEAM}/${selected.id}`, tmForm)
        : await apiService.post(API_ENDPOINTS.ADMIN.SETTINGS.TEAM, tmForm);
      if (res.success) { setTmModal(false); fetchTeam(); showAlert('team', selected ? 'Member updated.' : 'Member added.'); }
      else {
        getErrorInfo({ message: res.message || 'Save failed.' });
      }
    } catch (err) {
      getErrorInfo(err);
    }
    finally { setSaving(p => ({ ...p, team: false })); }
  };

  const deleteTm = async (m) => {
    if (!window.confirm(`Remove team member "${m.name}"?`)) return;
    try {
      await apiService.delete(`${API_ENDPOINTS.ADMIN.SETTINGS.TEAM}/${m.id}`);
      fetchTeam(); showAlert('team', 'Member removed.');
    } catch (err) {
      getErrorInfo(err);
    }
  };

  const tlField = k => ({
    value: tlForm[k],
    onChange: e => {
      const value = e.target.value;
      setTlForm(p => ({ ...p, [k]: value }));
      // Validate field on change
      const error = validateTimelineField(k, value);
      setTlErrors(prev => ({ ...prev, [k]: error }));
    }
  });
  const tmField = k => ({
    value: tmForm[k],
    onChange: e => {
      const value = e.target.value;
      setTmForm(p => ({ ...p, [k]: value }));
      // Validate field on change
      const error = validateTeamMemberField(k, value);
      setTmErrors(prev => ({ ...prev, [k]: error }));
    }
  });

  return (
    <PageShell title="Settings" subtitle="Manage company timeline and team members" error={errorInfo} onRetry={() => { fetchTimeline(); fetchTeam(); }}>
      <div className="as-page">
        <div className="as-section-row row g-4">

          {/* ── Company Timeline ─────────────────────────────────────────────── */}
          <div className="col-12 col-sm-6">
            <ResponsiveCard className="as-section-card">
              <div className="as-section-head">
                <div className="as-section-icon green"><FaHistory /></div>
                <span className="as-section-title">Company Timeline</span>
                <span className="as-section-count">{timeline.length} entries</span>
                <div className="as-head-actions">
                  <ResponsiveButton variant="outline-secondary" size="sm" className="as-btn add" onClick={fetchTimeline} title="Refresh">
                    <FaSync />
                  </ResponsiveButton>
                  <ResponsiveButton variant="primary" size="sm" className="as-btn add" onClick={openTlAdd}>
                    <FaPlus />Add Entry
                  </ResponsiveButton>
                </div>
              </div>

              <div className="as-section-body">
                <ResponsiveAlert show={!!alert.timeline?.msg} onHide={() => clearAlert('timeline')} message={alert.timeline?.msg} type={alert.timeline?.type} />
                {loading.timeline ? (
                  <div className="as-loading">
                    <div className="as-spinner" />Loading timeline…</div>
                    ) : timeline.length === 0 ? (
                    <div className="as-empty">
                      <div className="as-empty-icon"><FaHistory /></div>
                      <div className="as-empty-text">No timeline entries yet</div>
                      <div className="as-empty-sub">Add your first milestone to showcase your journey</div>
                    </div>
                    ) : (
                    <div className="as-entries">
                      {timeline.map((item, idx) => (
                        <div className="as-entry-card" key={item.id || idx}>
                          <>
                            <div className="as-entry-head">
                              <div className="as-entry-num">{idx + 1}</div>
                              <span className="as-entry-pill">{item.year}</span>
                              <span className={`as-entry-title ${item.title ? '' : 'muted'}`}>{item.title || 'Untitled entry'}</span>
                              <div className="as-entry-actions">
                                <button className="as-icon-btn" title="Move up"   disabled={idx === 0}                   onClick={() => moveTl(idx, -1)}><FaChevronUp /></button>
                                <button className="as-icon-btn" title="Move down" disabled={idx === timeline.length - 1} onClick={() => moveTl(idx, +1)}><FaChevronDown /></button>
                                <button className="as-icon-btn" title="Edit" onClick={() => openTlEdit(item)}><FaEdit /></button>
                                <button className="as-icon-btn" danger title="Delete" onClick={() => deleteTl(item)}><FaTrash /></button>
                              </div>
                            </div>
                            {item.description && (
                              <div className="as-entry-body">
                                <p style={{ margin: 0, fontSize: '.875rem', color: '#6b7280' }}>{item.description}</p>
                              </div> )}
                          </>
                        </div>
                    ))}
                    ))}
                  </div>
                )}
              </div>
            </ResponsiveCard>
          </div>

          {/* ── Team Members ─────────────────────────────────────────────────── */}
          <div className="col-12 col-sm-6">
            <ResponsiveCard className="as-section-card">
              <div className="as-section-head">
                <div className="as-section-icon blue"><FaUsers /></div>
                <span className="as-section-title">Team Members</span>
                <span className="as-section-count">{team.length} members</span>
                <div className="as-head-actions">
                  <ResponsiveButton variant="outline-secondary" size="sm" className="as-btn add" onClick={fetchTeam} title="Refresh">
                    <FaSync />
                  </ResponsiveButton>
                  <ResponsiveButton variant="primary" size="sm" className="as-btn add" onClick={openTmAdd}>
                    <FaPlus />Add Member
                  </ResponsiveButton>
                </div>
              </div>

              <div className="as-section-body">
                <ResponsiveAlert show={!!alert.team?.msg} onHide={() => clearAlert('team')} message={alert.team?.msg} type={alert.team?.type} />
                {loading.team ? (
                  <div className="as-loading"><div className="as-spinner" />Loading team members…</div>
                    ) : team.length === 0 ? (
                    <div className="as-empty">
                      <div className="as-empty-icon"><FaUsers /></div>
                      <div className="as-empty-text">No team members yet</div>
                      <div className="as-empty-sub">Add members to display on your public page</div>
                    </div>
                    ) : (
                    <div className="as-entries">
                    {team.map((m, idx) => (
                      <div className="as-entry-card" key={m.id || idx}>
                        <div className="as-entry-head">
                          <div className="as-entry-num">{idx + 1}</div>
                          {m.photo_url
                            ? <img className="as-avatar-preview" src={m.photo_url} alt={m.name} loading="lazy" style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }} />
                            : <div className="as-avatar-placeholder" style={{ width: 32, height: 32, fontSize: '.9rem' }}><FaUserCircle /></div>}
                          <span className={`as-entry-title ${m.name ? '' : 'muted'}`}>
                            {m.name || 'Unnamed'}
                            {m.role && <span style={{ fontWeight: 400, color: '#9ca3af', marginLeft: '.4rem', fontSize: '.8rem' }}>— {m.role}</span>}
                          </span>
                          <div className="as-entry-actions">
                            <button className="as-icon-btn" title="Edit" onClick={() => openTmEdit(m)}><FaEdit /></button>
                            <button className="as-icon-btn danger" title="Remove" onClick={() => deleteTm(m)}><FaTrash /></button>
                          </div>
                          </div>
                            {m.bio && (
                              <div className="as-entry-body">
                                <p style={{ margin: 0, fontSize: '.875rem', color: '#6b7280' }}>{m.bio}</p>
                              </div>)}
                          </div>
                        ))}
                      </div>
                    )}
              </div>
            </ResponsiveCard>
          </div>
        </div>
      </div>
      {/* ── Timeline Modal ────────────────────────────────────────────────── */}
      <ResponsiveModal show={tlModal} onHide={() => setTlModal(false)}>
        <div className="as-modal-head">
          <span className="as-modal-title"><FaHistory style={{ marginRight: '.5rem' }} />{selected ? 'Edit Timeline Entry' : 'Add Timeline Entry'}</span>
          <button className="as-modal-close" onClick={() => setTlModal(false)}><FaTimes /></button>
        </div>
        <form onSubmit={saveTl}>
          <div className="as-modal-body">
            <div className="as-form-row as-2col">
              <div>
                <label className="as-label">Year *</label>
                <input type="number" min="1900" max="2100" className={`as-input ${tlErrors.year ? 'error' : ''}`} required {...tlField('year')} />
                {tlErrors.year && <span className="as-error-message">{tlErrors.year}</span>}
              </div>
              <div>
                <label className="as-label">Title *</label>
                <input className={`as-input ${tlErrors.title ? 'error' : ''}`} placeholder="Milestone title" required {...tlField('title')} />
                {tlErrors.title && <span className="as-error-message">{tlErrors.title}</span>}
              </div>
            </div>
            <div className="as-form-row">
              <label className="as-label">Description</label>
              <textarea className={`as-textarea ${tlErrors.description ? 'error' : ''}`} rows={3} placeholder="Describe this milestone…" {...tlField('description')} />
              {tlErrors.description && <span className="as-error-message">{tlErrors.description}</span>}
            </div>
          </div>
          <div className="as-modal-foot">
            <ResponsiveButton variant="outline-secondary" size="sm" onClick={() => setTlModal(false)}>
              Cancel
            </ResponsiveButton>
            <ResponsiveButton variant="primary" size="sm" disabled={saving.timeline}>
              <FaSave style={{ marginRight: '.3rem' }} />{saving.timeline ? 'Saving…' : selected ? 'Update' : 'Add Entry'}
            </ResponsiveButton>
          </div>
        </form>
      </ResponsiveModal>

      {/* ── Team Member Modal ─────────────────────────────────────────────── */}
      <ResponsiveModal show={tmModal} onHide={() => setTmModal(false)}>
        <div className="as-modal-head">
          <span className="as-modal-title"><FaUsers style={{ marginRight: '.5rem' }} />{selected ? 'Edit Team Member' : 'Add Team Member'}</span>
          <button className="as-modal-close" onClick={() => setTmModal(false)}><FaTimes /></button>
        </div>
        <form onSubmit={saveTm}>
          <div className="as-modal-body">
            <div className="as-form-row as-2col">
              <div>
                <label className="as-label">Full Name *</label>
                <input className={`as-input ${tmErrors.name ? 'error' : ''}`} placeholder="Member name" required {...tmField('name')} />
                {tmErrors.name && <span className="as-error-message">{tmErrors.name}</span>}
              </div>
              <div>
                <label className="as-label">Role / Position</label>
                <input className={`as-input ${tmErrors.role ? 'error' : ''}`} placeholder="e.g. Head Barista" {...tmField('role')} />
                {tmErrors.role && <span className="as-error-message">{tmErrors.role}</span>}
              </div>
              <div>
                <label className="as-label">Bio</label>
                <textarea className={`as-textarea ${tmErrors.bio ? 'error' : ''}`} rows={3} placeholder="Short bio or description…" {...tmField('bio')} />
                {tmErrors.bio && <span className="as-error-message">{tmErrors.bio}</span>}
              </div>
              <div className="as-form-row as-2col">
                <div>
                  <label className="as-label">Photo URL</label>
                  <input className={`as-input ${tmErrors.photo_url ? 'error' : ''}`} placeholder="https://…" {...tmField('photo_url')} />
                  {tmErrors.photo_url && <span className="as-error-message">{tmErrors.photo_url}</span>}
                </div>
                <div>
                  <label className="as-label">Display Order</label>
                  <input type="number" min="0" className={`as-input ${tmErrors.display_order ? 'error' : ''}`} {...tmField('display_order')} />
                  {tmErrors.display_order && <span className="as-error-message">{tmErrors.display_order}</span>}
                </div>
              </div>
            </div>
            {tmForm.photo_url && (
              <div className="as-avatar-row" style={{ marginTop: '.5rem' }}>
                <img className="as-avatar-preview" src={tmForm.photo_url} alt="Preview" loading="lazy" onError={e => { e.target.style.display = 'none'; }} />
                <span style={{ fontSize: '.78rem', color: '#9ca3af' }}>Photo preview</span>
              </div>
            )}
          </div>
          <div className="as-modal-foot">
            <ResponsiveButton variant="outline-secondary" size="sm" onClick={() => setTmModal(false)}>
              Cancel
            </ResponsiveButton>
            <ResponsiveButton variant="primary" size="sm" disabled={saving.team}>
              <FaSave style={{ marginRight: '.3rem' }} />{saving.team ? 'Saving…' : selected ? 'Update' : 'Add Member'}
            </ResponsiveButton>
          </div>
        </form>
      </ResponsiveModal>
    </PageShell>
  );
};

export default AdminSettings;