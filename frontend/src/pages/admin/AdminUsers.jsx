import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FaBan, FaCheckCircle, FaEdit, FaEye, FaPlus, FaSearch,
  FaUsers, FaUserCheck, FaUserShield, FaUserTimes, FaTimes,
  FaExclamationTriangle, FaPaperclip
} from 'react-icons/fa';
import apiService from '../../services/api.service';
import { API_ENDPOINTS } from '../../config/api';
import PageShell from '../../components/layout/PageShell';
import { useNotificationSystem } from '../../components/common/NotificationSystem';
import ResponsiveButton from '@/components/responsive/Button';
import ResponsiveForm from '@/components/responsive/Form';
import ResponsiveTable from '@/components/responsive/Table';
import ResponsiveCard from '@/components/responsive/Card';
import ResponsiveBadge from '@/components/responsive/Badge';
import './AdminUsers.css';

const PER_PAGE_OPTIONS = [10, 15, 25, 50];
const ROLES = ['customer', 'barista', 'manager', 'admin', 'super-admin'];

function getAvatarClass(name) {
  const char = (name || '?')[0].toLowerCase();
  const map = { a:'a', b:'b', c:'c', d:'d', e:'e', f:'f', g:'g', h:'h' };
  return `au-avatar au-avatar-${map[char] || 'z'}`;
}

function RoleBadge({ role }) {
  const name = typeof role === 'string' ? role : role?.name || '';
  return <ResponsiveBadge className={`au-role-badge ${name}`}>{name}</ResponsiveBadge>;
}

function StatusChip({ status }) {
  const s = status || 'active';
  const variantMap = {
    active: 'success',
    inactive: 'danger',
  };
  const variant = variantMap[s] || 'secondary';
  return <ResponsiveBadge bg={variant}>{s}</ResponsiveBadge>;
}

const AdminUsers = () => {
  /* ── server-side state ── */
  const [users, setUsers]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [meta, setMeta]           = useState({ total:0, last_page:1, current_page:1, from:0, to:0 });
  const [page, setPage]           = useState(1);
  const [perPage, setPerPage]     = useState(15);

  /* ── filters ── */
  const [search, setSearch]                   = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [roleFilter, setRoleFilter]           = useState('all');
  const [statusFilter, setStatusFilter]       = useState('all');

  /* ── stats ── */
  const [stats, setStats] = useState({ total_users:0, active_users:0, inactive_users:0, by_role:{} });

  /* ── modals ── */
  const [showDetail, setShowDetail]     = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [detailData, setDetailData]     = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const [showEdit, setShowEdit]   = useState(false);
  const [editMode, setEditMode]   = useState('create');
  const [editForm, setEditForm]   = useState({
    name:'',
    email:'',
    password:'',
    role:'customer',
    address_line_1: '',
    address_line_2: '',
    city: '',
    state: '',
    postal_code: '',
    country: '',
    profile_image: null,
    profile_image_preview: '',
    document_file: null,
    document_file_name: ''
  });
  const [editSaving, setEditSaving] = useState(false);
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [currentStep, setCurrentStep] = useState(1);

  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmUser, setConfirmUser] = useState(null);
  const [toggling, setToggling]       = useState(false);

  /* ── form validation ── */
  const [formErrors, setFormErrors] = useState({});
  const [formTouched, setFormTouched] = useState({});

  const { showSuccessNotification, showErrorNotification } = useNotificationSystem();

  const validateField = (field, value) => {
    let error = '';
    switch (field) {
      case 'name':
        if (!value || value.trim() === '') {
          error = 'Full name is required';
        }
        break;
      case 'email':
        if (!value || value.trim() === '') {
          error = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(value)) {
          error = 'Email address is invalid';
        }
        break;
      case 'password':
        if (editMode === 'create' && (!value || value.trim() === '')) {
          error = 'Password is required';
        } else if (value && value.length < 8) {
          error = 'Password must be at least 8 characters';
        }
        break;
      case 'role':
        if (!value) {
          error = 'Role is required';
        }
        break;
      case 'address_line_1':
        if (!value || value.trim() === '') {
          error = 'Address line 1 is required';
        }
        break;
      case 'city':
        if (!value || value.trim() === '') {
          error = 'City is required';
        }
        break;
      case 'state':
        if (!value || value.trim() === '') {
          error = 'State is required';
        }
        break;
      case 'postal_code':
        if (!value || value.trim() === '') {
          error = 'Postal code is required';
        }
        break;
      case 'country':
        if (!value || value.trim() === '') {
          error = 'Country is required';
        }
        break;
      case 'profile_image':
        if (editMode === 'create' && !value) {
          error = 'Profile image is required';
        }
        break;
      case 'document_file':
        // Document is optional, no validation required
        break;
      default:
        break;
    }
    return error;
  };

  const handleFieldChange = (field, val) => {
    setFormTouched(prev => ({ ...prev, [field]: true }));
    setEditForm(prev => ({ ...prev, [field]: val }));

    // Validate on change
    const error = validateField(field, val);
    setFormErrors(prev => ({ ...prev, [field]: error }));

    // Clear address suggestions when address fields are manually edited
    if (field.includes('address_') || field === 'city' || field === 'state' || field === 'postal_code' || field === 'country') {
      setAddressSuggestions([]);
    }
  };

  const validateForm = () => {
    const errors = {};
    const fields = ['name', 'email', 'password', 'role', 'address_line_1', 'city', 'state', 'postal_code', 'country'];
    fields.forEach(field => {
      const error = validateField(field, editForm[field]);
      if (error) errors[field] = error;
    });
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleProfileImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setFormErrors(prev => ({ ...prev, profile_image: 'Please upload an image file' }));
        return;
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setFormErrors(prev => ({ ...prev, profile_image: 'File size must be under 5MB' }));
        return;
      }

      // Clear previous errors
      setFormErrors(prev => ({ ...prev, profile_image: '' }));

      // Update form state
      setEditForm(prev => ({
        ...prev,
        profile_image: file
      }));

      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setEditForm(prev => ({
        ...prev,
        profile_image_preview: previewUrl
      }));
    }
  };

  const handleDocumentChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
      if (!allowedTypes.includes(file.type)) {
        setFormErrors(prev => ({ ...prev, document_file: 'Please upload a PDF, DOC, DOCX, or TXT file' }));
        return;
      }

      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        setFormErrors(prev => ({ ...prev, document_file: 'File size must be under 10MB' }));
        return;
      }

      // Clear previous errors
      setFormErrors(prev => ({ ...prev, document_file: '' }));

      // Update form state
      setEditForm(prev => ({
        ...prev,
        document_file: file,
        document_file_name: file.name
      }));
    }
  };

  const goToNextStep = () => {
    // Validate current step before moving to next step
    if (validateCurrentStep()) {
      setCurrentStep(prev => Math.min(prev + 1, getTotalSteps()));
    }
  };

  const goToPreviousStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const getTotalSteps = () => {
    return 3; // Account Info, Profile Info, Address Info
  };

  const validateCurrentStep = () => {
    // Reset errors for current step validation
    const stepErrors = {};
    let isValid = true;

    switch (currentStep) {
      case 1: // Account Information
        ['name', 'email', 'password', 'role'].forEach(field => {
          const error = validateField(field, editForm[field]);
          if (error) {
            stepErrors[field] = error;
            isValid = false;
          }
        });
        break;
      case 2: // Profile Information
        // Profile image is required for create mode
        if (editMode === 'create' && !editForm.profile_image) {
          stepErrors.profile_image = 'Profile image is required';
          isValid = false;
        }
        break;
      case 3: // Address Information
        ['address_line_1', 'city', 'state', 'postal_code', 'country'].forEach(field => {
          const error = validateField(field, editForm[field]);
          if (error) {
            stepErrors[field] = error;
            isValid = false;
          }
        });
        break;
      default:
        break;
    }

    setFormErrors(stepErrors);
    return isValid;
  };

  const getStepTitle = (step) => {
    switch (step) {
      case 1: return 'Account Information';
      case 2: return 'Profile Information';
      case 3: return 'Address Information';
      default: return '';
    }
  };

  
  /* ── debounce ── */
  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 350);
    return () => clearTimeout(t);
  }, [search]);

  /* ── fetch users ── */
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, per_page: perPage });
      if (debouncedSearch) params.set('search', debouncedSearch);
      if (roleFilter !== 'all') params.set('role', roleFilter);
      if (statusFilter !== 'all') params.set('status', statusFilter);
      const res = await apiService.get(`${API_ENDPOINTS.ADMIN.USERS}?${params}`);
      if (res.success) {
        const p = res.data;
        setUsers(Array.isArray(p.data) ? p.data : []);
        setMeta({ total: p.total ?? 0, last_page: p.last_page ?? 1, current_page: p.current_page ?? 1, from: p.from ?? 0, to: p.to ?? 0 });
      }
    } catch (err) {
      // Users fetch error
    } finally {
      setLoading(false);
    }
  }, [page, perPage, debouncedSearch, roleFilter, statusFilter]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  /* ── stats ── */
  const fetchStats = useCallback(async () => {
    try {
      const res = await apiService.get(API_ENDPOINTS.ADMIN.USER_STATISTICS);
      if (res.success) setStats(res.data);
    } catch (_) {}
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  /* ── filter handlers ── */
  const handleRole    = (v) => { setRoleFilter(v);       setPage(1); };
  const handleStatus  = (v) => { setStatusFilter(v);     setPage(1); };
  const handlePerPage = (v) => { setPerPage(Number(v));  setPage(1); };

  /* ── view detail ── */
  const handleView = async (user) => {
    setSelectedUser(user);
    setShowDetail(true);
    setDetailLoading(true);
    setDetailData(null);
    try {
      const res = await apiService.get(API_ENDPOINTS.ADMIN.USER_DETAIL(user.id));
      if (res.success) setDetailData(res.data);
    } catch (_) {}
    setDetailLoading(false);
  };

  /* ── create / edit ── */
  const handleOpenCreate = () => {
    setEditMode('create');
    setEditForm({ name:'', email:'', password:'', role:'customer' });
    setShowEdit(true);
  };

  const handleOpenEdit = (user) => {
    const roles = Array.isArray(user.roles) ? user.roles.map(r => typeof r === 'string' ? r : r.name) : [];
    setEditMode('edit');
    setEditForm({ id: user.id, name: user.name || '', email: user.email || '', password:'', role: roles[0] || 'customer' });
    setShowEdit(true);
  };

  
  const handleSaveUser = async () => {
    // Validate form before submitting
    if (!validateForm()) {
      showErrorNotification('Error', 'Please fix the errors in the form');
      return;
    }

    setEditSaving(true);
    try {
      let res;
      if (editMode === 'create') {
        res = await apiService.post(API_ENDPOINTS.ADMIN.USERS, editForm);
      } else {
        const payload = { name: editForm.name, email: editForm.email, role: editForm.role };
        if (editForm.password) payload.password = editForm.password;
        res = await apiService.put(API_ENDPOINTS.ADMIN.USER_DETAIL(editForm.id), payload);
      }
      if (res.success) {
        showSuccessNotification('Success', editMode === 'create' ? 'User created!' : 'User updated!');
        setShowEdit(false);
        fetchUsers();
        fetchStats();
      } else {
        showErrorNotification('Error', res.message || 'Failed to save user');
      }
    } catch (err) {
      showErrorNotification('Error', err?.response?.data?.message || 'Failed to save user');
    } finally {
      setEditSaving(false);
    }
  };

  /* ── toggle status ── */
  const handleToggleRequest = (user) => { setConfirmUser(user); setShowConfirm(true); };

  const handleToggleConfirm = async () => {
    if (!confirmUser) return;
    const isActive = (confirmUser.status || 'active') === 'active';
    setToggling(true);
    try {
      let res;
      if (isActive) {
        res = await apiService.delete(API_ENDPOINTS.ADMIN.USER_DETAIL(confirmUser.id));
      } else {
        res = await apiService.post(API_ENDPOINTS.ADMIN.USER_REACTIVATE(confirmUser.id));
      }
      if (res.success) {
        showSuccessNotification('Updated', `User ${isActive ? 'deactivated' : 'reactivated'} successfully`);
        setShowConfirm(false);
        setConfirmUser(null);
        fetchUsers();
        fetchStats();
      }
    } catch (err) {
      showErrorNotification('Error', `Failed to ${isActive ? 'deactivate' : 'reactivate'} user`);
    } finally {
      setToggling(false);
    }
  };

  // Mock address autocomplete function
  // In a real application, this would call an address validation/autocomplete service like Google Maps Places API
  
  /* ── pagination buttons ── */
  const pageButtons = useMemo(() => {
    const { last_page, current_page } = meta;
    if (last_page <= 1) return [];
    const range = [];
    for (let i = Math.max(1, current_page - 2); i <= Math.min(last_page, current_page + 2); i++) range.push(i);
    const buttons = [...range];
    if (range[0] > 1) { if (range[0] > 2) buttons.unshift('...-left'); buttons.unshift(1); }
    if (range[range.length-1] < last_page) { if (range[range.length-1] < last_page-1) buttons.push('...-right'); buttons.push(last_page); }
    return buttons;
  }, [meta]);

  return (
    <PageShell
      title="User Management"
      subtitle="Manage user accounts, roles and permissions"
      loading={false}
    >
      {/* Stats Bar */}
      <div className="au-stats-bar">
        <ResponsiveCard className="au-stat-card">
          <ResponsiveCard.Body>
            <div className="au-stat-icon blue"><FaUsers /></div>
            <div><div className="au-stat-label">Total Users</div><div className="au-stat-value">{stats.total_users}</div></div>
          </ResponsiveCard.Body>
        </ResponsiveCard>
        <ResponsiveCard className="au-stat-card">
          <ResponsiveCard.Body>
            <div className="au-stat-icon green"><FaUserCheck /></div>
            <div><div className="au-stat-label">Active</div><div className="au-stat-value">{stats.active_users}</div></div>
          </ResponsiveCard.Body>
        </ResponsiveCard>
        <ResponsiveCard className="au-stat-card">
          <ResponsiveCard.Body>
            <div className="au-stat-icon red"><FaUserTimes /></div>
            <div><div className="au-stat-label">Inactive</div><div className="au-stat-value">{stats.inactive_users}</div></div>
          </ResponsiveCard.Body>
        </ResponsiveCard>
        <ResponsiveCard className="au-stat-card">
          <ResponsiveCard.Body>
            <div className="au-stat-icon purple"><FaUserShield /></div>
            <div><div className="au-stat-label">Admins</div><div className="au-stat-value">{stats.by_role?.admins ?? 0}</div></div>
          </ResponsiveCard.Body>
        </ResponsiveCard>
        <ResponsiveCard className="au-stat-card">
          <ResponsiveCard.Body>
            <div className="au-stat-icon teal"><FaUsers /></div>
            <div><div className="au-stat-label">Baristas</div><div className="au-stat-value">{stats.by_role?.baristas ?? 0}</div></div>
          </ResponsiveCard.Body>
        </ResponsiveCard>
        <ResponsiveCard className="au-stat-card">
          <ResponsiveCard.Body>
            <div className="au-stat-icon amber"><FaUsers /></div>
            <div><div className="au-stat-label">Customers</div><div className="au-stat-value">{stats.by_role?.customers ?? 0}</div></div>
          </ResponsiveCard.Body>
        </ResponsiveCard>
      </div>

      {/* Filter Bar */}
      <div className="au-filter-bar">
        <div className="au-search-wrap">
          <FaSearch className="au-search-icon" />
          <ResponsiveForm.Control
            type="text"
            className="au-search"
            placeholder="Search by name or email…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <ResponsiveForm.Control
          type="select"
          className="au-select"
          value={roleFilter}
          onChange={e => handleRole(e.target.value)}
        >
          <option value="all">All Roles</option>
          {ROLES.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
        </ResponsiveForm.Control>
        <ResponsiveForm.Control
          type="select"
          className="au-select"
          value={statusFilter}
          onChange={e => handleStatus(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </ResponsiveForm.Control>
        <ResponsiveForm.Control
          type="select"
          className="au-select"
          value={perPage}
          onChange={e => handlePerPage(e.target.value)}
          style={{minWidth:90}}
        >
          {PER_PAGE_OPTIONS.map(n => <option key={n} value={n}>{n} / page</option>)}
        </ResponsiveForm.Control>
        {meta.total > 0 && <span className="au-count-label">{meta.from}–{meta.to} of {meta.total}</span>}
        <ResponsiveButton variant="primary" size="md" className="au-add-btn" onClick={handleOpenCreate}>
          <FaPlus /> Add User
        </ResponsiveButton>
      </div>

      {/* Table */}
      <div className="au-table-wrap">
        {loading ? (
          <div className="au-empty"><p>Loading users…</p></div>
        ) : users.length === 0 ? (
          <div className="au-empty">
            <div className="au-empty-icon"><FaUsers /></div>
            <p>No users found.{(search || roleFilter !== 'all' || statusFilter !== 'all') && ' Try adjusting your filters.'}</p>
          </div>
        ) : (
          <ResponsiveTable responsive hover className="au-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Roles</th>
                <th>Status</th>
                <th>Joined</th>
                <th style={{textAlign:'right'}}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => {
                const roles = Array.isArray(user.roles) ? user.roles : [];
                const status = user.status || 'active';
                return (
                  <tr key={user.id}>
                    <td>
                      <div className="au-user-cell">
                        <div className={getAvatarClass(user.name)}>{(user.name || '?')[0].toUpperCase()}</div>
                        <div>
                          <div className="au-user-name">{user.name}</div>
                          <div className="au-user-id">#{user.id}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{fontSize:'.85rem'}}>{user.email}</td>
                    <td>{roles.length === 0 ? <RoleBadge role="customer" /> : roles.map((r,i) => <RoleBadge key={i} role={r} />)}</td>
                    <td><StatusChip status={status} /></td>
                    <td style={{fontSize:'.82rem',color:'#666'}}>
                      {new Date(user.created_at).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}
                    </td>
                    <td>
                      <div className="au-actions-cell">
                        <ResponsiveButton variant="outline-secondary" size="sm" className="au-action-btn view" title="View Details" onClick={() => handleView(user)}>
                          <FaEye />
                        </ResponsiveButton>
                        <ResponsiveButton variant="outline-secondary" size="sm" className="au-action-btn edit" title="Edit User" onClick={() => handleOpenEdit(user)}>
                          <FaEdit />
                        </ResponsiveButton>
                        <ResponsiveButton
                          variant={status === 'active' ? 'outline-danger' : 'outline-success'}
                          size="sm"
                          className={`au-action-btn ${status === 'active' ? 'deactivate' : 'reactivate'}`}
                          title={status === 'active' ? 'Deactivate' : 'Reactivate'}
                          onClick={() => handleToggleRequest(user)}
                        >
                          {status === 'active' ? <FaBan /> : <FaCheckCircle />}
                        </ResponsiveButton>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </ResponsiveTable>
        )}
        {/* Pagination */}
        {pageButtons.length > 0 && (
          <div className="au-pagination-bar">
            <span className="au-pagination-info">Page {meta.current_page} of {meta.last_page}</span>
            <div className="au-pagination">
              <button className="au-page-btn" onClick={() => setPage(1)} disabled={meta.current_page===1}>&#171;</button>
              <button className="au-page-btn" onClick={() => setPage(p => Math.max(1,p-1))} disabled={meta.current_page===1}>&#8249;</button>
              {pageButtons.map(btn =>
                typeof btn === 'string'
                  ? <span key={btn} className="au-page-ellipsis">…</span>
                  : <button key={btn} className={`au-page-btn${btn===meta.current_page?' active':''}`} onClick={() => setPage(btn)}>{btn}</button>
              )}
              <button className="au-page-btn" onClick={() => setPage(p => Math.min(meta.last_page,p+1))} disabled={meta.current_page===meta.last_page}>&#8250;</button>
              <button className="au-page-btn" onClick={() => setPage(meta.last_page)} disabled={meta.current_page===meta.last_page}>&#187;</button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetail && selectedUser && (
        <div className="au-modal-backdrop" onClick={e => { if (e.target===e.currentTarget) setShowDetail(false); }}>
          <div className="au-modal lg">
            <div className="au-modal-header">
              <span className="au-modal-title">User Details — {selectedUser.name}</span>
              <button className="au-modal-close" onClick={() => setShowDetail(false)}><FaTimes /></button>
            </div>
            <div className="au-modal-body">
              {detailLoading ? <div className="au-empty"><p>Loading…</p></div> : (() => {
                const u = detailData || selectedUser;
                return (
                  <>
                    <div className={`${getAvatarClass(u.name)} au-detail-avatar`}>{(u.name||'?')[0].toUpperCase()}</div>
                    <div className="au-detail-grid">
                      <div className="au-detail-field"><label>User ID</label><div className="au-val">#{u.id}</div></div>
                      <div className="au-detail-field"><label>Status</label><div className="au-val"><StatusChip status={u.status||'active'} /></div></div>
                      <div className="au-detail-field"><label>Full Name</label><div className="au-val">{u.name}</div></div>
                      <div className="au-detail-field"><label>Email</label><div className="au-val">{u.email}</div></div>
                      <div className="au-detail-field"><label>Phone</label><div className="au-val">{u.phone||'—'}</div></div>
                      <div className="au-detail-field"><label>Roles</label><div className="au-val">{(u.roles||[]).map((r,i)=><RoleBadge key={i} role={r}/>)}</div></div>
                      <div className="au-detail-field"><label>Joined</label><div className="au-val">{new Date(u.created_at).toLocaleString()}</div></div>
                      <div className="au-detail-field"><label>Last Updated</label><div className="au-val">{new Date(u.updated_at).toLocaleString()}</div></div>
                    </div>
                    {u.customer_profile && (<>
                      <hr className="au-detail-divider" />
                      <p className="au-section-title">Customer Profile</p>
                      <div className="au-detail-grid">
                        <div className="au-detail-field"><label>Total Orders</label><div className="au-val">{u.customer_profile.total_orders??0}</div></div>
                        <div className="au-detail-field"><label>Total Spent</label><div className="au-val">₱{parseFloat(u.customer_profile.total_spent||0).toFixed(2)}</div></div>
                      </div>
                    </>)}
                    {detailData?.orders?.length > 0 && (<>
                      <hr className="au-detail-divider" />
                      <p className="au-section-title">Recent Orders ({detailData.orders.length})</p>
                      <div className="au-orders-list">
                        {detailData.orders.map(order => (
                          <div key={order.id} className="au-order-row">
                            <span>#{order.order_number}</span>
                            <StatusChip status={order.status} />
                            <span>₱{parseFloat(order.total_amount||0).toFixed(2)}</span>
                            <span style={{color:'#aaa',fontSize:'.76rem'}}>{new Date(order.created_at).toLocaleDateString()}</span>
                          </div>
                        ))}
                      </div>
                    </>)}
                  </>
                );
              })()}
            </div>
            <div className="au-modal-footer">
              <button className="au-btn ghost" onClick={() => setShowDetail(false)}>Close</button>
              <button className="au-btn primary" onClick={() => { setShowDetail(false); handleOpenEdit(selectedUser); }}>Edit User</button>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      {showEdit && (
        <div className="au-modal-backdrop" onClick={e => { if (e.target===e.currentTarget) setShowEdit(false); }}>
          <div className="au-modal">
            <div className="au-modal-header">
              <span className="au-modal-title">{editMode==='create' ? 'Add New User' : `Edit — ${editForm.name}`}</span>
              <button className="au-modal-close" onClick={() => setShowEdit(false)}><FaTimes /></button>
            </div>
            <div className="au-modal-body">
              {/* Step Progress Indicator */}
              <div className="au-wizard-steps">
                {[1, 2, 3].map(step => (
                  <div key={step} className={`au-wizard-step${step === currentStep ? ' active' : ''}${step < currentStep ? ' completed' : ''}`}>
                    <div className="au-wizard-step-circle">{step}</div>
                    <div className="au-wizard-step-label">{getStepTitle(step)}</div>
                  </div>
                ))}
              </div>

              {/* Step Content */}
              <div className="au-wizard-content">
                {currentStep === 1 && (
                  <>
                    <div className="au-form-group">
                      <label className="au-form-label">Full Name *</label>
                      <input className="au-form-input" value={editForm.name} onChange={e=>handleFieldChange('name',e.target.value)} placeholder="Enter full name" />
                      {formTouched.name && formErrors.name && <span className="au-form-error">{formErrors.name}</span>}
                    </div>
                    <div className="au-form-group">
                      <label className="au-form-label">Email *</label>
                      <input className="au-form-input" type="email" value={editForm.email} onChange={e=>handleFieldChange('email',e.target.value)} placeholder="Enter email address" />
                      {formTouched.email && formErrors.email && <span className="au-form-error">{formErrors.email}</span>}
                    </div>
                    <div className="au-form-group">
                      <label className="au-form-label">{editMode==='create' ? 'Password *' : 'New Password'}</label>
                      <input className="au-form-input" type="password" value={editForm.password} onChange={e=>handleFieldChange('password',e.target.value)} placeholder={editMode==='create' ? 'Min 8 characters' : 'Leave blank to keep current'} />
                      {editMode==='edit' && <span className="au-form-hint">Leave blank to keep the current password</span>}
                      {formTouched.password && formErrors.password && <span className="au-form-error">{formErrors.password}</span>}
                    </div>
                    <div className="au-form-group">
                      <label className="au-form-label">Role *</label>
                      <select className="au-form-select" value={editForm.role} onChange={e=>handleFieldChange('role',e.target.value)}>
                        {ROLES.map(r=><option key={r} value={r}>{r.charAt(0).toUpperCase()+r.slice(1)}</option>)}
                      </select>
                      {formTouched.role && formErrors.role && <span className="au-form-error">{formErrors.role}</span>}
                    </div>
                  </>
                )}
                {currentStep === 2 && (
                  <>
                    <div className="au-form-group">
                      <label className="au-form-label">Profile Image *</label>
                      <input className="au-form-input" type="file" accept="image/*" onChange={e=>handleProfileImageChange(e)} />
                      {formTouched.profile_image && formErrors.profile_image && <span className="au-form-error">{formErrors.profile_image}</span>}
                      {editForm.profile_image_preview && (
                        <div className="au-image-preview mt-2">
                          <img src={editForm.profile_image_preview} alt="Profile Preview" className="au-preview-img" />
                        </div>
                      )}
                    </div>
                    <div className="au-form-group">
                      <label className="au-form-label">Document Upload</label>
                      <input className="au-form-input" type="file" accept=".pdf,.doc,.docx,.txt" onChange={e=>handleDocumentChange(e)} />
                      {formTouched.document_file && formErrors.document_file && <span className="au-form-error">{formErrors.document_file}</span>}
                      {editForm.document_file_name && (
                        <div className="au-file-preview mt-2">
                          <FaPaperclip className="au-file-icon" />
                          <span className="au-file-name">{editForm.document_file_name}</span>
                        </div>
                      )}
                    </div>
                  </>
                )}
                {currentStep === 3 && (
                  <>
                    {/* Address Fields */}
                    <div className="au-form-group">
                      <label className="au-form-label">Address Line 1 *</label>
                      <input className="au-form-input" value={editForm.address_line_1} onChange={e=>handleFieldChange('address_line_1',e.target.value)} placeholder="Street address, P.O. box, etc." />
                      {formTouched.address_line_1 && formErrors.address_line_1 && <span className="au-form-error">{formErrors.address_line_1}</span>}
                    </div>

                    <div className="au-form-group">
                      <label className="au-form-label">Address Line 2</label>
                      <input className="au-form-input" value={editForm.address_line_2} onChange={e=>handleFieldChange('address_line_2',e.target.value)} placeholder="Apartment, suite, unit, etc." />
                    </div>

                    <div className="au-form-row">
                      <div className="au-form-group">
                        <label className="au-form-label">City *</label>
                        <input className="au-form-input" value={editForm.city} onChange={e=>handleFieldChange('city',e.target.value)} placeholder="City" />
                        {formTouched.city && formErrors.city && <span className="au-form-error">{formErrors.city}</span>}
                      </div>
                      <div className="au-form-group">
                        <label className="au-form-label">State *</label>
                        <input className="au-form-input" value={editForm.state} onChange={e=>handleFieldChange('state',e.target.value)} placeholder="State/Province" />
                        {formTouched.state && formErrors.state && <span className="au-form-error">{formErrors.state}</span>}
                      </div>
                    </div>

                    <div className="au-form-row">
                      <div className="au-form-group">
                        <label className="au-form-label">Postal Code *</label>
                        <input className="au-form-input" value={editForm.postal_code} onChange={e=>handleFieldChange('postal_code',e.target.value)} placeholder="ZIP or postal code" />
                        {formTouched.postal_code && formErrors.postal_code && <span className="au-form-error">{formErrors.postal_code}</span>}
                      </div>
                      <div className="au-form-group">
                        <label className="au-form-label">Country *</label>
                        <input className="au-form-input" value={editForm.country} onChange={e=>handleFieldChange('country',e.target.value)} placeholder="Country" />
                        {formTouched.country && formErrors.country && <span className="au-form-error">{formErrors.country}</span>}
                      </div>
                    </div>

                    {/* Address Suggestions */}
                    {addressSuggestions.length > 0 && (
                      <div className="au-address-suggestions">
                        <div className="au-address-suggestions-header">
                          <strong>Address Suggestions:</strong>
                          <button className="au-btn-link" onClick={() => setAddressSuggestions([])}>Clear</button>
                        </div>
                        <div className="au-address-suggestions-list">
                          {addressSuggestions.map((suggestion, index) => (
                            <div key={index} className="au-address-suggestion-item" onClick={() => {
                              setEditForm({
                                ...editForm,
                                address_line_1: suggestion.address_line_1 || '',
                                address_line_2: suggestion.address_line_2 || '',
                                city: suggestion.city || '',
                                state: suggestion.state || '',
                                postal_code: suggestion.postal_code || '',
                                country: suggestion.country || ''
                              });
                              setAddressSuggestions([]);
                            }}>
                              {suggestion.formatted_address}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
            <div className="au-modal-footer">
              <button
                className="au-btn ghost"
                onClick={() => {
                  if (currentStep > 1) {
                    goToPreviousStep();
                  } else {
                    setShowEdit(false);
                  }
                }}
              >
                {currentStep === 1 ? 'Cancel' : 'Back'}
              </button>
              <button
                className="au-btn primary"
                onClick={() => {
                  if (currentStep === getTotalSteps()) {
                    handleSaveUser();
                  } else {
                    goToNextStep();
                  }
                }}
                disabled={editSaving || !validateCurrentStep()}
              >
                {currentStep === getTotalSteps()
                  ? (editSaving ? 'Saving…' : (editMode==='create' ? 'Create User' : 'Save Changes'))
                  : (editSaving ? 'Saving…' : 'Next Step')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Deactivate / Reactivate */}
      {showConfirm && confirmUser && (
        <div className="au-modal-backdrop" onClick={e => { if (e.target===e.currentTarget) { setShowConfirm(false); setConfirmUser(null); } }}>
          <div className="au-modal sm">
            <div className="au-modal-header">
              <span className="au-modal-title">{(confirmUser.status||'active')==='active' ? 'Deactivate' : 'Reactivate'} User</span>
              <button className="au-modal-close" onClick={() => { setShowConfirm(false); setConfirmUser(null); }}><FaTimes /></button>
            </div>
            <div className="au-modal-body au-confirm-body">
              <div className="au-confirm-icon">
                <FaExclamationTriangle style={{color:(confirmUser.status||'active')==='active'?'#e74c3c':'#2ecc71',fontSize:'2.5rem'}} />
              </div>
              <div className="au-confirm-title">{(confirmUser.status||'active')==='active'?'Deactivate':'Reactivate'} {confirmUser.name}?</div>
              <p className="au-confirm-msg">
                {(confirmUser.status||'active')==='active'
                  ? 'This will prevent the user from logging in. You can reactivate them later.'
                  : 'This will restore access for this user.'}
              </p>
            </div>
            <div className="au-modal-footer">
              <button className="au-btn ghost" onClick={() => { setShowConfirm(false); setConfirmUser(null); }}>Cancel</button>
              <button
                className={`au-btn ${(confirmUser.status||'active')==='active'?'danger':'success'}`}
                onClick={handleToggleConfirm}
                disabled={toggling}
              >{toggling?'Please wait…':((confirmUser.status||'active')==='active'?'Deactivate':'Reactivate')}</button>
            </div>
          </div>
        </div>
      )}
    </PageShell>
  );
};

export default AdminUsers;
