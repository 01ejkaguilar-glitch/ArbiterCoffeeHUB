import React, { useState, useEffect, useCallback } from 'react';
import ResponsiveButton from '../../components/responsive/Button';
import ResponsiveCard from '../../components/responsive/Card';
import ResponsiveForm from '../../components/responsive/Form';
import ResponsiveTable from '../../components/responsive/Table';
import ResponsiveModal from '../../components/responsive/Modal';
import ResponsiveAlert from '../../components/responsive/Alert';
import ResponsiveSpinner from '../../components/responsive/Spinner';
import ResponsiveBadge from '../../components/responsive/Badge';
import ResponsiveContainer from '../../components/responsive/Container';
import ResponsiveRow from '../../components/responsive/Row';
import ResponsiveCol from '../../components/responsive/Col';
import ResponsiveTabs from '../../components/responsive/Tabs';
import ResponsiveTab from '../../components/responsive/Tab';
// Note: We're keeping Bootstrap's Tab/Tabs for now as they're primarily layout/components
// and we don't have responsive equivalents yet
import { FaFileDownload, FaFilter, FaCoffee, FaTasks, FaUserClock, FaBriefcase } from 'react-icons/fa';
import apiService from '../../services/api.service';
import { API_ENDPOINTS } from '../../config/api';

const AdminReports = () => {
  const [activeTab, setActiveTab] = useState('attendance');
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [filters, setFilters] = useState({
    start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0],
    employee_id: '',
    status: '',
    type: 'both'
  });
  const [alert, setAlert] = useState({ show: false, message: '', type: '' });

  const fetchReport = useCallback(async () => {
    try {
      setLoading(true);
      let endpoint;
      const params = {
        start_date: filters.start_date,
        end_date: filters.end_date
      };

      switch (activeTab) {
        case 'attendance':
          endpoint = API_ENDPOINTS.ADMIN.REPORTS.ATTENDANCE;
          if (filters.employee_id) params.employee_id = filters.employee_id;
          break;
        case 'leave_ot':
          endpoint = API_ENDPOINTS.ADMIN.REPORTS.LEAVE_OT;
          if (filters.employee_id) params.employee_id = filters.employee_id;
          if (filters.type) params.type = filters.type;
          break;
        case 'tasks':
          endpoint = API_ENDPOINTS.ADMIN.REPORTS.TASK_COMPLETION;
          if (filters.employee_id) params.assigned_to = filters.employee_id;
          if (filters.status) params.status = filters.status;
          break;
        case 'beans':
          endpoint = API_ENDPOINTS.ADMIN.REPORTS.BEAN_USAGE;
          break;
        default:
          return;
      }

      const queryString = new URLSearchParams(params).toString();
      const response = await apiService.get(`${endpoint}?${queryString}`);
      
      if (response.success) {
        setReportData(response.data);
      }
    } catch (error) {
      showAlert('Failed to load report', 'danger');
    } finally {
      setLoading(false);
    }
  }, [activeTab, filters]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const handleExport = async (format = 'csv') => {
    try {
      const params = {
        report_type: activeTab === 'leave_ot' ? 'leave_ot' : activeTab === 'tasks' ? 'task_completion' : activeTab === 'beans' ? 'bean_usage' : 'attendance',
        format: format,
        start_date: filters.start_date,
        end_date: filters.end_date
      };

      const queryString = new URLSearchParams(params).toString();
      const url = `${API_ENDPOINTS.ADMIN.REPORTS.EXPORT}?${queryString}`;
      
      // Create a temporary link and trigger download
      const link = document.createElement('a');
      link.href = url;
      link.download = `${params.report_type}_${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showAlert('Report exported successfully!', 'success');
    } catch (error) {
      showAlert('Failed to export report', 'danger');
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const showAlert = (message, type) => {
    setAlert({ show: true, message, type });
    setTimeout(() => setAlert({ show: false, message: '', type: '' }), 3000);
  };

  const renderAttendanceReport = () => {
    if (!reportData) return null;

    return (
      <>
        <ResponsiveRow className="mb-4 g-2 g-md-3">
          <ResponsiveCol xs={6} md={3}>
            <ResponsiveCard className="border-0 shadow-sm">
              <ResponsiveCard.Body className="p-2 p-md-3">
                <h6 className="text-muted mb-1 small">Total Records</h6>
                <h3 className="mb-0 fs-5 fs-md-3">{reportData.stats?.total_records || 0}</h3>
              </ResponsiveCard.Body>
            </ResponsiveCard>
          </Col>
          <ResponsiveCol xs={6} md={3}>
            <ResponsiveCard className="border-0 shadow-sm">
              <ResponsiveCard.Body className="p-2 p-md-3">
                <h6 className="text-muted mb-1 small">Present</h6>
                <h3 className="mb-0 fs-5 fs-md-3 text-success">{reportData.stats?.present_count || 0}</h3>
              </ResponsiveCard.Body>
            </ResponsiveCard>
          </Col>
          <ResponsiveCol xs={6} md={3}>
            <ResponsiveCard className="border-0 shadow-sm">
              <ResponsiveCard.Body className="p-2 p-md-3">
                <h6 className="text-muted mb-1 small">Absent</h6>
                <h3 className="mb-0 fs-5 fs-md-3 text-danger">{reportData.stats?.absent_count || 0}</h3>
              </ResponsiveCard.Body>
            </ResponsiveCard>
          </Col>
          <ResponsiveCol xs={6} md={3}>
            <ResponsiveCard className="border-0 shadow-sm">
              <ResponsiveCard.Body className="p-2 p-md-3">
                <h6 className="text-muted mb-1 small">Attendance Rate</h6>
                <h3 className="mb-0 fs-5 fs-md-3 text-info">{reportData.stats?.attendance_rate || 0}%</h3>
              </ResponsiveCard.Body>
            </ResponsiveCard>
          </Col>
        </Row>

        <ResponsiveTable responsive hover>
          <thead className="table-light">
            <tr>
              <th>Date</th>
              <th>Employee</th>
              <th>Status</th>
              <th>Check In</th>
              <th>Check Out</th>
              <th>Hours Worked</th>
              <th>OT Hours</th>
            </tr>
          </thead>
          <tbody>
            {reportData.attendances && reportData.attendances.length > 0 ? (
              reportData.attendances.map((record) => (
                <tr key={record.id}>
                  <td>{new Date(record.date).toLocaleDateString()}</td>
                  <td>{record.employee?.user?.name || 'N/A'}</td>
                  <td>
                    <ResponsiveBadge bg={
                      record.status === 'present' ? 'success' :
                      record.status === 'late' ? 'warning' :
                      'danger'
                    }>
                      {record.status}
                    </Badge>
                  </td>
                  <td>{record.check_in_time || 'N/A'}</td>
                  <td>{record.check_out_time || 'N/A'}</td>
                  <td>{record.hours_worked || 0}h</td>
                  <td className="text-warning">{record.overtime_hours || 0}h</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center text-muted py-4">
                  No attendance records found
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </>
    );
  };

  const renderLeaveOTReport = () => {
    if (!reportData) return null;

    return (
      <>
        <ResponsiveRow className="mb-4 g-2 g-md-3">
          <ResponsiveCol xs={6} md={3}>
            <ResponsiveCard className="border-0 shadow-sm">
              <ResponsiveCard.Body className="p-2 p-md-3">
                <h6 className="text-muted mb-1 small">Total Leaves</h6>
                <h3 className="mb-0 fs-5 fs-md-3">{reportData.stats?.total_leave_requests || 0}</h3>
              </ResponsiveCard.Body>
            </ResponsiveCard>
          </Col>
          <ResponsiveCol xs={6} md={3}>
            <ResponsiveCard className="border-0 shadow-sm">
              <ResponsiveCard.Body className="p-2 p-md-3">
                <h6 className="text-muted mb-1 small">Approved</h6>
                <h3 className="mb-0 fs-5 fs-md-3 text-success">{reportData.stats?.approved_leaves || 0}</h3>
              </ResponsiveCard.Body>
            </ResponsiveCard>
          </Col>
          <ResponsiveCol xs={6} md={3}>
            <ResponsiveCard className="border-0 shadow-sm">
              <ResponsiveCard.Body className="p-2 p-md-3">
                <h6 className="text-muted mb-1 small">Pending</h6>
                <h3 className="mb-0 fs-5 fs-md-3 text-warning">{reportData.stats?.pending_leaves || 0}</h3>
              </ResponsiveCard.Body>
            </ResponsiveCard>
          </Col>
          <ResponsiveCol xs={6} md={3}>
            <ResponsiveCard className="border-0 shadow-sm">
              <ResponsiveCard.Body className="p-2 p-md-3">
                <h6 className="text-muted mb-1 small">Total OT Hours</h6>
                <h3 className="mb-0 fs-5 fs-md-3 text-info">{reportData.stats?.total_overtime_hours || 0}h</h3>
              </ResponsiveCard.Body>
            </ResponsiveCard>
          </Col>
        </Row>

        {/* Leave Requests Table */}
        {reportData.leave_requests && reportData.leave_requests.length > 0 && (
          <>
            <h5 className="mb-3">Leave Requests</h5>
            <ResponsiveTable responsive hover className="mb-4">
              <thead className="table-light">
                <tr>
                  <th>Employee</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Days</th>
                  <th>Reason</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {reportData.leave_requests.map((leave) => (
                  <tr key={leave.id}>
                    <td>{leave.employee?.user?.name || 'N/A'}</td>
                    <td>{new Date(leave.start_date).toLocaleDateString()}</td>
                    <td>{new Date(leave.end_date).toLocaleDateString()}</td>
                    <td>{leave.days_count || 0}</td>
                    <td>{leave.reason || 'N/A'}</td>
                    <td>
                      <ResponsiveBadge bg={
                        leave.status === 'approved' ? 'success' :
                        leave.status === 'pending' ? 'warning' :
                        'danger'
                      }>
                        {leave.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </>
        )}

        {/* Overtime Records Table */}
        {reportData.overtime_records && reportData.overtime_records.length > 0 && (
          <>
            <h5 className="mb-3">Overtime Records</h5>
            <ResponsiveTable responsive hover>
              <thead className="table-light">
                <tr>
                  <th>Employee</th>
                  <th>Date</th>
                  <th>OT Hours</th>
                  <th>Check In</th>
                  <th>Check Out</th>
                </tr>
              </thead>
              <tbody>
                {reportData.overtime_records.map((ot) => (
                  <tr key={ot.id}>
                    <td>{ot.employee?.user?.name || 'N/A'}</td>
                    <td>{new Date(ot.date).toLocaleDateString()}</td>
                    <td className="text-warning"><strong>{ot.overtime_hours}h</strong></td>
                    <td>{ot.check_in_time}</td>
                    <td>{ot.check_out_time}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </>
        )}
      </>
    );
  };

  const renderTaskCompletionReport = () => {
    if (!reportData) return null;

    return (
      <>
        <ResponsiveRow className="mb-4 g-2 g-md-3">
          <ResponsiveCol xs={6} md={3}>
            <ResponsiveCard className="border-0 shadow-sm">
              <ResponsiveCard.Body className="p-2 p-md-3">
                <h6 className="text-muted mb-1 small">Total Tasks</h6>
                <h3 className="mb-0 fs-5 fs-md-3">{reportData.stats?.total_tasks || 0}</h3>
              </ResponsiveCard.Body>
            </ResponsiveCard>
          </Col>
          <ResponsiveCol xs={6} md={3}>
            <ResponsiveCard className="border-0 shadow-sm">
              <ResponsiveCard.Body className="p-2 p-md-3">
                <h6 className="text-muted mb-1 small">Completed</h6>
                <h3 className="mb-0 fs-5 fs-md-3 text-success">{reportData.stats?.completed_tasks || 0}</h3>
              </ResponsiveCard.Body>
            </ResponsiveCard>
          </Col>
          <ResponsiveCol xs={6} md={3}>
            <ResponsiveCard className="border-0 shadow-sm">
              <ResponsiveCard.Body className="p-2 p-md-3">
                <h6 className="text-muted mb-1 small">Overdue</h6>
                <h3 className="mb-0 fs-5 fs-md-3 text-danger">{reportData.stats?.overdue_tasks || 0}</h3>
              </ResponsiveCard.Body>
            </ResponsiveCard>
          </Col>
          <ResponsiveCol xs={6} md={3}>
            <ResponsiveCard className="border-0 shadow-sm">
              <ResponsiveCard.Body className="p-2 p-md-3">
                <h6 className="text-muted mb-1 small">Completion Rate</h6>
                <h3 className="mb-0 fs-5 fs-md-3 text-info">{reportData.stats?.completion_rate || 0}%</h3>
              </ResponsiveCard.Body>
            </ResponsiveCard>
          </Col>
        </Row>

        <ResponsiveTable responsive hover>
          <thead className="table-light">
            <tr>
              <th>Task</th>
              <th>Assigned To</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Due Date</th>
              <th>Completed At</th>
            </tr>
          </thead>
          <tbody>
            {reportData.tasks && reportData.tasks.length > 0 ? (
              reportData.tasks.map((task) => (
                <tr key={task.id}>
                  <td><strong>{task.title}</strong></td>
                  <td>{task.assignedTo?.user?.name || 'N/A'}</td>
                  <td>
                    <ResponsiveBadge bg={
                      task.status === 'completed' ? 'success' :
                      task.status === 'in_progress' ? 'primary' :
                      task.status === 'cancelled' ? 'danger' :
                      'warning'
                    }>
                      {task.status}
                    </Badge>
                  </td>
                  <td>
                    <ResponsiveBadge bg={
                      task.priority === 'high' ? 'danger' :
                      task.priority === 'medium' ? 'warning' :
                      'info'
                    }>
                      {task.priority || 'normal'}
                    </Badge>
                  </td>
                  <td>{new Date(task.due_date).toLocaleDateString()}</td>
                  <td>{task.completed_at ? new Date(task.completed_at).toLocaleDateString() : 'N/A'}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center text-muted py-4">
                  No tasks found
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </>
    );
  };

  const renderBeanUsageReport = () => {
    if (!reportData) return null;

    return (
      <>
        <ResponsiveRow className="mb-4 g-2 g-md-3">
          <ResponsiveCol xs={6} md={3}>
            <ResponsiveCard className="border-0 shadow-sm">
              <ResponsiveCard.Body className="p-2 p-md-3">
                <h6 className="text-muted mb-1 small">Total Beans</h6>
                <h3 className="mb-0 fs-5 fs-md-3">{reportData.stats?.total_beans || 0}</h3>
              </ResponsiveCard.Body>
            </ResponsiveCard>
          </Col>
          <ResponsiveCol xs={6} md={3}>
            <ResponsiveCard className="border-0 shadow-sm">
              <ResponsiveCard.Body className="p-2 p-md-3">
                <h6 className="text-muted mb-1 small">Low Stock</h6>
                <h3 className="mb-0 fs-5 fs-md-3 text-warning">{reportData.stats?.low_stock_beans || 0}</h3>
              </ResponsiveCard.Body>
            </ResponsiveCard>
          </Col>
          <ResponsiveCol xs={6} md={3}>
            <ResponsiveCard className="border-0 shadow-sm">
              <ResponsiveCard.Body className="p-2 p-md-3">
                <h6 className="text-muted mb-1 small">Out of Stock</h6>
                <h3 className="mb-0 fs-5 fs-md-3 text-danger">{reportData.stats?.out_of_stock_beans || 0}</h3>
              </ResponsiveCard.Body>
            </ResponsiveCard>
          </Col>
          <ResponsiveCol xs={6} md={3}>
            <ResponsiveCard className="border-0 shadow-sm">
              <ResponsiveCard.Body className="p-2 p-md-3">
                <h6 className="text-muted mb-1 small">Featured Times</h6>
                <h3 className="mb-0 fs-5 fs-md-3 text-info">{reportData.stats?.total_featured_times || 0}</h3>
              </ResponsiveCard.Body>
            </ResponsiveCard>
          </Col>
        </Row>

        <ResponsiveTable responsive hover>
          <thead className="table-light">
            <tr>
              <th>Bean Name</th>
              <th>Origin</th>
              <th>Region</th>
              <th>Current Stock</th>
              <th>Times Featured</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {reportData.bean_usage && reportData.bean_usage.length > 0 ? (
              reportData.bean_usage.map((bean) => (
                <tr key={bean.id}>
                  <td><strong>{bean.name}</strong></td>
                  <td>{bean.origin_country}</td>
                  <td>{bean.region}</td>
                  <td className={bean.current_stock < 10 ? 'text-warning' : ''}>
                    <strong>{bean.current_stock} kg</strong>
                  </td>
                  <td>{bean.times_featured}</td>
                  <td>
                    <ResponsiveBadge bg={bean.is_featured ? 'success' : 'secondary'}>
                      {bean.is_featured ? 'Featured' : 'Regular'}
                    </Badge>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center text-muted py-4">
                  No bean usage data found
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </>
    );
  };

  return (
    <ResponsiveContainer className="py-5">
      <ResponsiveRow className="mb-4">
        <ResponsiveCol>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="display-5 fw-bold">Reports & Analytics</h1>
              <p className="lead text-muted">View comprehensive reports and export data</p>
            </div>
            <ResponsiveButton
              variant="success"
              size="lg"
              onClick={() => handleExport('csv')}
              disabled={loading || !reportData}
            >
              <FaFileDownload className="me-2" />
              Export CSV
            </ResponsiveButton>
          </div>
        </Col>
      </Row>

      {alert.show && (
        <ResponsiveAlert show={alert.show} onHide={() => setAlert({ show: false, message: '', type: '' })} message={alert.message} type={alert.type} />
      )}

      {/* Filters */}
      <ResponsiveCard className="mb-4 shadow-sm">
        <ResponsiveCard.Body>
          <ResponsiveRow className="g-2 g-md-3">
            <ResponsiveCol xs={6} md={3}>
              <ResponsiveForm.Group>
                <ResponsiveForm.Label className="small">Start Date</ResponsiveForm.Label>
                <ResponsiveForm.Control
                  type="date"
                  name="start_date"
                  value={filters.start_date}
                  onChange={handleFilterChange}
                />
              </ResponsiveForm.Group>
            </Col>
            <ResponsiveCol xs={6} md={3}>
              <ResponsiveForm.Group>
                <ResponsiveForm.Label className="small">End Date</ResponsiveForm.Label>
                <ResponsiveForm.Control
                  type="date"
                  name="end_date"
                  value={filters.end_date}
                  onChange={handleFilterChange}
                />
              </ResponsiveForm.Group>
            </Col>
            {activeTab === 'leave_ot' && (
              <ResponsiveCol xs={6} md={3}>
                <ResponsiveForm.Group>
                  <ResponsiveForm.Label className="small">Type</ResponsiveForm.Label>
                  <ResponsiveForm.Select
                    name="type"
                    value={filters.type}
                    onChange={handleFilterChange}
                  >
                    <option value="both">Both</option>
                    <option value="leave">Leave Only</option>
                    <option value="overtime">Overtime Only</option>
                  </ResponsiveForm.Select>
                </ResponsiveForm.Group>
              </Col>
            )}
            {activeTab === 'tasks' && (
              <ResponsiveCol xs={6} md={3}>
                <ResponsiveForm.Group>
                  <ResponsiveForm.Label className="small">Status</ResponsiveForm.Label>
                  <ResponsiveForm.Select
                    name="status"
                    value={filters.status}
                    onChange={handleFilterChange}
                  >
                    <option value="">All</option>
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </ResponsiveForm.Select>
                </ResponsiveForm.Group>
              </Col>
            )}
            <ResponsiveCol xs={6} md={3} className="d-flex align-items-end">
              <ResponsiveButton variant="primary" size="md" onClick={fetchReport} disabled={loading} className="w-100">
                <FaFilter className="me-2" />
                {loading ? 'Loading...' : 'Apply Filters'}
              </ResponsiveButton>
            </Col>
          </Row>
        </ResponsiveCard.Body>
      </ResponsiveCard>

      {/* Report Tabs */}
      <ResponsiveCard className="shadow-sm">
        <ResponsiveCard.Header>
          <ResponsiveTabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="border-0">
            <Tab eventKey="attendance" title={
              <span><FaUserClock className="me-2" />Attendance</span>
            } />
            <Tab eventKey="leave_ot" title={
              <span><FaBriefcase className="me-2" />Leave & OT</span>
            } />
            <Tab eventKey="tasks" title={
              <span><FaTasks className="me-2" />Task Completion</span>
            } />
            <Tab eventKey="beans" title={
              <span><FaCoffee className="me-2" />Bean Usage</span>
            } />
          </Tabs>
        </ResponsiveCard.Header>
        <ResponsiveCard.Body>
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
              <p className="mt-3">Loading report...</p>
            </div>
          ) : (
            <>
              {activeTab === 'attendance' && renderAttendanceReport()}
              {activeTab === 'leave_ot' && renderLeaveOTReport()}
              {activeTab === 'tasks' && renderTaskCompletionReport()}
              {activeTab === 'beans' && renderBeanUsageReport()}
            </>
          )}
        </ResponsiveCard.Body>
      </ResponsiveCard>
    </Container>
  );
};

export default AdminReports;
