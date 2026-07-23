import React from 'react';
import ResponsiveCard from '../../../components/responsive/Card';

const AdminChartSection = ({ stats, analyticsData }) => {
  return (
    <ResponsiveCard className="admin-card">
      <ResponsiveCard.Body>
        <h5 className="fw-semibold mb-3">Sales Overview</h5>
        <pre className="mb-0 small text-muted">{JSON.stringify({ stats, analyticsData }, null, 2)}</pre>
      </ResponsiveCard.Body>
    </ResponsiveCard>
  );
};

export default AdminChartSection;