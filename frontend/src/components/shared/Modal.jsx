import React from 'react';
import PropTypes from 'prop-types';
import './Modal.css';

const Modal = ({
  children,
  show = false,
  onHide,
  backdrop = true,
  keyboard = true,
  centered = false,
  scrollable = false,
  size = '', // '', 'sm', 'lg', 'xl'
  className = '',
  header,
  footer,
  title,
  ...props
}) => {
  if (!show) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && backdrop && onHide) {
      onHide();
    }
  };

  const handleKeyDown = (e) => {
    if (keyboard && e.key === 'Escape' && onHide) {
      onHide();
    }
  };

  return (
    <>
      {backdrop && (
        <div
          className={`modal-backdrop${show ? ' show' : ''}`}
          onClick={handleBackdropClick}
        />
      )}
      <div
        className={`modal${show ? ' show' : ''} ${size ? `modal-${size}` : ''} ${centered ? 'modal-dialog-centered' : ''} ${scrollable ? 'modal-dialog-scrollable' : ''} ${className}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? `modal-title-${Date.now()}` : undefined}
        onKeyDown={handleKeyDown}
        {...props}
      >
        <div className="modal-content">
          {header || title ? (
            <div className="modal-header">
              {title && (
                <h5 className="modal-title" id={`modal-title-${Date.now()}`}>
                  {title}
                </h5>
              )}
              {header}
              {onHide && (
                <button type="button" className="btn-close" onClick={onHide} aria-label="Close">
                  <span aria-hidden="true">&times;</span>
                </button>
              )}
            </div>
          ) : null}

          <div className="modal-body">
            {children}
          </div>

          {footer ? (
            <div className="modal-footer">
              {footer}
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
};

Modal.propTypes = {
  children: PropTypes.node,
  show: PropTypes.bool,
  onHide: PropTypes.func,
  backdrop: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
  keyboard: PropTypes.bool,
  centered: PropTypes.bool,
  scrollable: PropTypes.bool,
  size: PropTypes.oneOf(['', 'sm', 'lg', 'xl']),
  className: PropTypes.string,
  header: PropTypes.node,
  footer: PropTypes.node,
  title: PropTypes.string,
};

Modal.defaultProps = {
  show: false,
  onHide: () => {},
  backdrop: true,
  keyboard: true,
  centered: false,
  scrollable: false,
  size: '',
  className: '',
  header: null,
  footer: null,
  title: '',
};

export default Modal;