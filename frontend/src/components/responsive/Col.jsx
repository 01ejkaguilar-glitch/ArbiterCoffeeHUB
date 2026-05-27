import React from 'react';
import PropTypes from 'prop-types';
import './Col.css';

const ResponsiveCol = ({
  children,
  className = '',
  xs,
  sm,
  md,
  lg,
  xl,
  offsetXs = 0,
  offsetSm = 0,
  offsetMd = 0,
  offsetLg = 0,
  offsetXl = 0,
  orderXs = 0,
  orderSm = 0,
  orderMd = 0,
  orderLg = 0,
  orderXl = 0,
  ...props
}) => {
  const colClass = [
    xs !== undefined ? `col-${xs}` : null,
    sm !== undefined ? `col-sm-${sm}` : null,
    md !== undefined ? `col-md-${md}` : null,
    lg !== undefined ? `col-lg-${lg}` : null,
    xl !== undefined ? `col-xl-${xl}` : null,
    offsetXs !== 0 ? `offset-${offsetXs}` : null,
    offsetSm !== 0 ? `offset-sm-${offsetSm}` : null,
    offsetMd !== 0 ? `offset-md-${offsetMd}` : null,
    offsetLg !== 0 ? `offset-lg-${offsetLg}` : null,
    offsetXl !== 0 ? `offset-xl-${offsetXl}` : null,
    orderXs !== 0 ? `order-${orderXs}` : null,
    orderSm !== 0 ? `order-sm-${orderSm}` : null,
    orderMd !== 0 ? `order-md-${orderMd}` : null,
    orderLg !== 0 ? `order-lg-${orderLg}` : null,
    orderXl !== 0 ? `order-xl-${orderXl}` : null,
    className
  ].filter(Boolean).join(' ');

  return (
    <div
      className={colClass}
      {...props}
    >
      {children}
    </div>
  );
};

ResponsiveCol.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  xs: PropTypes.number,
  sm: PropTypes.number,
  md: PropTypes.number,
  lg: PropTypes.number,
  xl: PropTypes.number,
  offsetXs: PropTypes.number,
  offsetSm: PropTypes.number,
  offsetMd: PropTypes.number,
  offsetLg: PropTypes.number,
  offsetXl: PropTypes.number,
  orderXs: PropTypes.number,
  orderSm: PropTypes.number,
  orderMd: PropTypes.number,
  orderLg: PropTypes.number,
  orderXl: PropTypes.number
};

export default ResponsiveCol;