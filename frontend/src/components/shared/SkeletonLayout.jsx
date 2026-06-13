import React from 'react';
import PropTypes from 'prop-types';

const SkeletonLayout = ({
  children,
  skeletonComponent = null,
  skeletonProps = {},
  className = '',
  ...rest
}) => {
  // If no skeleton component is provided, return children as-is
  if (!skeletonComponent) {
    return <div className={className} {...rest}>{children}</div>;
  }

  // Clone the skeleton component with provided props
  const SkeletonElement = skeletonComponent;

  return (
    <div className={className} {...rest}>
      {Array.isArray(children) ? children.map((child, index) => (
        <SkeletonElement key={index} {...skeletonProps} />
      )) : (
        <SkeletonElement {...skeletonProps} />
      )}
    </div>
  );
};

SkeletonLayout.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.element,
    PropTypes.arrayOf(PropTypes.element)
  ]),
  skeletonComponent: PropTypes.elementType,
  skeletonProps: PropTypes.object,
  className: PropTypes.string
};

SkeletonLayout.defaultProps = {
  children: null,
  skeletonComponent: null,
  skeletonProps: {},
  className: ''
};

export default SkeletonLayout;