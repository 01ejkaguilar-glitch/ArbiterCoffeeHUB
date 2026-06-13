import React from 'react';
import { ResponsiveContainer, ResponsiveButton } from '@/components/responsive';
import { Link } from 'react-router-dom';

const CustomerInsightsPage = () => {
  return (
    <main role="main">
      <ResponsiveContainer className="py-5 text-center">
        <h1>Customer Insights</h1>
        <p className="text-muted">This page was simplified to restore a working frontend build.</p>
        <ResponsiveButton as={Link} to="/customer/dashboard" variant="primary">
          Back to Dashboard
        </ResponsiveButton>
      </ResponsiveContainer>
    </main>
  );
};

export default CustomerInsightsPage;