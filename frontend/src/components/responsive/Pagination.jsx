import React from 'react';
import PropTypes from 'prop-types';
import './Pagination.css';

const ResponsivePagination = ({
  currentPage,
  totalPages,
  onPageChange,
  className = ''
}) => {
  if (totalPages <= 1) return null;

  const renderPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;
    let startPage, endPage;

    if (totalPages <= maxVisiblePages) {
      startPage = 1;
      endPage = totalPages;
    } else {
      if (currentPage <= Math.floor(maxVisiblePages / 2)) {
        startPage = 1;
        endPage = maxVisiblePages;
      } else if (currentPage >= totalPages - Math.floor(maxVisiblePages / 2)) {
        startPage = totalPages - maxVisiblePages + 1;
        endPage = totalPages;
      } else {
        startPage = currentPage - Math.floor(maxVisiblePages / 2);
        endPage = currentPage + Math.floor(maxVisiblePages / 2);
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return pageNumbers.map(pageNumber => (
      <button
        key={pageNumber}
        className={`page-number ${pageNumber === currentPage ? 'active' : ''}`}
        onClick={() => onPageChange(pageNumber)}
      >
        {pageNumber}
      </button>
    ));
  };

  return (
    <nav className={`pagination ${className}`} aria-label="Page navigation">
      <button
        className="prev-page"
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
      >
        ‹
      </button>
      <button
        className="first-page"
        onClick={() => onPageChange(1)}
        disabled={currentPage === 1}
      >
        «
      </button>
      {renderPageNumbers()}
      <button
        className="last-page"
        onClick={() => onPageChange(totalPages)}
        disabled={currentPage === totalPages}
      >
        »
      </button>
      <button
        className="next-page"
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
      >
        ›
      </button>
    </nav>
  );
};

ResponsivePagination.propTypes = {
  currentPage: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  className: PropTypes.string
};

export default ResponsivePagination;