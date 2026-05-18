import React from 'react';
import { FaImage } from 'react-icons/fa';
import ResponsiveModal from '../../../components/responsive/Modal';
import ResponsiveForm from '../../../components/responsive/Form';
import ResponsiveButton from '../../../components/responsive/Button';

const ProductFormModal = ({ show, onHide, formData = {}, handleChange, handleRemoveImage, handleSubmit, editingProduct, categories = [], imagePreview }) => {
  return (
    <ResponsiveModal show={show} onHide={onHide} size="lg" centered>
      <ResponsiveForm onSubmit={handleSubmit}>
        <ResponsiveModal.Header>
          <ResponsiveModal.Title>{editingProduct ? 'Edit Product' : 'Add Product'}</ResponsiveModal.Title>
          <ResponsiveModal.CloseButton onClick={onHide}>
            <FaTimes />
          </ResponsiveModal.CloseButton>
        </ResponsiveModal.Header>
        <ResponsiveModal.Body className="d-grid gap-3">
          <div className="form-group">
            <label className="form-label">Product Image</label>
            <div className="product-image-upload">
              <div className="image-upload-placeholder">
                {imagePreview ? (
                  <img src={imagePreview} alt="Product preview" className="image-preview" />
                ) : (
                  <>
                    <FaImage size={32} className="upload-icon" />
                    <span className="upload-text">Click to upload product image</span>
                    <span className="upload-hint">Recommended: 800x800px, JPG or PNG</span>
                  </>
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                name="image"
                onChange={handleChange}
                className="form-control"
              />
              {imagePreview && formData.image && (
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={handleRemoveImage}
                >
                  Remove Image
                </button>
              )}
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Name</label>
            <input
              type="text"
              className="form-control"
              name="name"
              value={formData.name || ''}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-control"
              rows={3}
              name="description"
              value={formData.description || ''}
              onChange={handleChange}
            />
          </div>
          <div className="d-grid gap-3" style={{ gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}>
            <div className="form-group">
              <label className="form-label">Price</label>
              <input
                type="number"
                step="0.01"
                className="form-control"
                name="price"
                value={formData.price || ''}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Stock Quantity</label>
              <input
                type="number"
                className="form-control"
                name="stock_quantity"
                value={formData.stock_quantity || ''}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Category</label>
            <select
              className="form-select"
              name="category_id"
              value={formData.category_id || ''}
              onChange={handleChange}
            >
              <option value="">Select category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
          </div>
          <div className="form-check">
            <input
              className="form-check-input"
              type="checkbox"
              name="is_available"
              checked={!!formData.is_available}
              onChange={handleChange}
            />
            <label className="form-check-label">Available</label>
          </div>
        </ResponsiveModal.Body>
        <ResponsiveModal.Footer>
          <ResponsiveButton variant="secondary" onClick={onHide}>Cancel</ResponsiveButton>
          <ResponsiveButton variant="primary" type="submit">Save</ResponsiveButton>
        </ResponsiveModal.Footer>
      </ResponsiveForm>
    </ResponsiveModal>
  );
};

export default ProductFormModal;