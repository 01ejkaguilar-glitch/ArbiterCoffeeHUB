import React from 'react';
import PropTypes from 'prop-types';
import './Modal.css';

const ResponsiveModal = ({
  show = false,
  onHide,
  children,
  backdrop = true,
  keyboard = true,
  ...props
}) => {
  if (!show) {
    return null;
  }

  return (
    <div
      className={`modal ${backdrop ? 'show' : ''} d-block`}
      tabIndex="-1"
      role="dialog"
      style={{ display: 'block' }}
      {...props}
    >
      <div className="modal-dialog" role="document">
        <div className="modal-content">
          {children}
        </div>
      </div>

      {/* Backdrop */}
      {backdrop && (
        <div
          className="modal-backdrop fade show"
          onClick={onHide}
        />
      )}
    </div>
  );
};

ResponsiveModal.propTypes = {
  show: PropTypes.bool,
  onHide: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
  backdrop: PropTypes.bool,
  keyboard: PropTypes.bool
};

// Sub-components for semantic structure
ResponsiveModal.Header = ({
  children,
  className = '',
  closeButton = true,
  ...props
}) => {
  return (
    <div
      className={`modal-header ${className}`}
      {...props}
    >
      {closeButton && (
        <button
          type="button"
          className="close"
          data-dismiss="modal"
          aria-label="Close"
          onClick={props.onHide || (() => {})}
        >
          <span aria-hidden="true">&times;</span>
        </button>
      )}
      {children}
    </div>
  );
};

ResponsiveModal.Body = ({
  children,
  className = '',
  ...props
}) => (
  <div className={`modal-body ${className}`} {...props}>
    {children}
  </div>
);

ResponsiveModal.Footer = ({
  children,
  className = '',
  ...props
}) => (
  <div className={`modal-footer ${className}`} {...props}>
    {children}
  </div>
);

export default ResponsiveModal;