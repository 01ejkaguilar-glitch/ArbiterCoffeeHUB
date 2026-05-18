import React from 'react';
import ResponsiveModal from '../../../components/responsive/Modal';
import ResponsiveForm from '../../../components/responsive/Form';
import ResponsiveButton from '../../../components/responsive/Button';

const BatchActionModal = ({ show, onHide, batchAction, setBatchAction, batchValue, setBatchValue, onSubmit }) => {
  return (
    <ResponsiveModal show={show} onHide={onHide} centered>
      <ResponsiveForm>
        <ResponsiveModal.Header>
          <ResponsiveModal.Title>Batch Update Products</ResponsiveModal.Title>
          <ResponsiveModal.CloseButton onClick={onHide}>
            <FaTimes />
          </ResponsiveModal.CloseButton>
        </ResponsiveModal.Header>
        <ResponsiveModal.Body className="d-grid gap-3">
          <div className="form-group">
            <label className="form-label">Action</label>
            <select
              className="form-select"
              value={batchAction}
              onChange={(event) => setBatchAction(event.target.value)}
            >
              <option value="">Select action</option>
              <option value="price">Update Price</option>
              <option value="stock">Update Stock</option>
              <option value="availability">Update Availability</option>
              <option value="category">Update Category</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Value</label>
            <input
              type="text"
              className="form-control"
              value={batchValue}
              onChange={(event) => setBatchValue(event.target.value)}
            />
          </div>
        </ResponsiveModal.Body>
        <ResponsiveModal.Footer>
          <ResponsiveButton variant="secondary" onClick={onHide}>Cancel</ResponsiveButton>
          <ResponsiveButton variant="primary" onClick={onSubmit}>Apply</ResponsiveButton>
        </ResponsiveModal.Footer>
      </ResponsiveForm>
    </ResponsiveModal>
  );
};

export default BatchActionModal;