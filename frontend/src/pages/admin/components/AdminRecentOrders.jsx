import React from 'react';
import ResponsiveCard from '../../../components/responsive/Card';
import ResponsiveListGroup from '../../../components/responsive/ListGroup';

const AdminRecentOrders = ({ orders = [] }) => {
  return (
    <ResponsiveCard className="admin-card h-100">
      <ResponsiveCard.Header>
        <h5 className="mb-0 fw-semibold">Recent Orders</h5>
      </ResponsiveCard.Header>
      <ResponsiveListGroup variant="flush">
        {orders.length === 0 ? (
          <li className="list-group-item text-muted">No recent orders</li>
        ) : orders.map((order) => (
          <li key={order.id} className="list-group-item d-flex justify-content-between align-items-center">
            <span>#{order.order_number || order.id}</span>
            <small className="text-muted">{order.status || 'pending'}</small>
          </li>
        ))}
      </ResponsiveListGroup>
    </ResponsiveCard>
  );
};

export default AdminRecentOrders;