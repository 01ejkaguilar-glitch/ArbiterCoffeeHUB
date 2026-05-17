import React from 'react';
import PropTypes from 'prop-types';
import './Table.css';

const ResponsiveTable = ({
  columns,
  data,
  loading = false,
  emptyMessage = 'No data found',
  ...props
}) => {
  if (loading) {
    return <div className="table-loading">Loading...</div>;
  }

  if (!data || data.length === 0) {
    return <div className="table-empty">{emptyMessage}</div>;
  }

  // Extract column accessors
  const columnKeys = columns.map(col => col.accessor || col.Header.toLowerCase().replace(/\s+/g, '-'));

  return (
    <div className="table-responsive">
      <table className="table table-striped table-hover">
        <thead>
          <tr>
            {columns.map((col, index) => (
              <th key={index} scope="col">
                {col.Header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {columnKeys.map((key, colIndex) => (
                <td key={colIndex}>
                  {row[key] !== undefined && row[key] !== null ? row[key] : ''}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

ResponsiveTable.propTypes = {
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      Header: PropTypes.string.isRequired,
      accessor: PropTypes.string
    })
  ).isRequired,
  data: PropTypes.arrayOf(PropTypes.object),
  loading: PropTypes.bool,
  emptyMessage: PropTypes.string
};

export default ResponsiveTable;