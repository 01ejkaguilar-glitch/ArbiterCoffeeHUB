import React from 'react';
import PropTypes from 'prop-types';

const SkeletonTable = ({
  numRows = 3,
  columns = [
    { label: 'Order #', width: '20%' },
    { label: 'Customer', width: '25%' },
    { label: 'Date & Time', width: '20%' },
    { label: 'Status', width: '15%' },
    { label: 'Total', width: '10%' },
    { label: 'Actions', width: '10%' }
  ],
  className = ''
}) => {
  return (
    <table className={`skeleton-table ${className}`} style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr>
          {columns.map((column, index) => (
            <th key={index} style={{
              width: column.width,
              padding: '12px 8px',
              borderBottom: '2px solid #e9ecef'
            }}>
              <div className="skeleton" style={{
                height: '16px',
                width: '100%',
                borderRadius: '4px'
              }} />
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {[...Array(numRows)].map((rowIndex) => (
          <tr key={rowIndex} style={{ borderBottom: '1px solid #dee2e6' }}>
            {columns.map((column, colIndex) => (
              <td key={colIndex} style={{
                width: column.width,
                padding: '12px 8px'
              }}>
                <div className="skeleton" style={{
                  height: '14px',
                  width: '100%',
                  borderRadius: '4px',
                  marginBottom: '4px'
                }} />
                {colIndex < columns.length - 1 && (
                  <div className="skeleton" style={{
                    height: '12px',
                    width: '80%',
                    borderRadius: '4px'
                  }} />
                )}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

SkeletonTable.propTypes = {
  numRows: PropTypes.number,
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string,
      width: PropTypes.string
    })
  ),
  className: PropTypes.string
};

SkeletonTable.defaultProps = {
  numRows: 3,
  columns: [
    { label: 'Order #', width: '20%' },
    { label: 'Customer', width: '25%' },
    { label: 'Date & Time', width: '20%' },
    { label: 'Status', width: '15%' },
    { label: 'Total', width: '10%' },
    { label: 'Actions', width: '10%' }
  ],
  className: ''
};

export default SkeletonTable;