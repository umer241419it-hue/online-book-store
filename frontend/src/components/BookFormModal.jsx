import React, { useState, useEffect } from 'react';
import { X, Save, PlusCircle, AlertCircle, Image as ImageIcon } from 'lucide-react';
import { createBook, updateBook, DEFAULT_BOOK_COVER } from '../services/api';
import { CATEGORIES } from './CategoryFilter';

const availableCategories = CATEGORIES.filter(
  (c) => c !== 'All Categories'
);

const BookFormModal = ({ isOpen, onClose, bookToEdit, onBookSaved, showToast }) => {
  const isEditing = Boolean(bookToEdit);

  const initialFormState = {
    bookId: '',
    title: '',
    author: '',
    category: availableCategories[0] || 'Web Development',
    price: '',
    quantity: '',
    description: '',
    image: ''
  };

  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  useEffect(() => {
    if (bookToEdit) {
      setFormData({
        bookId: bookToEdit.bookId || '',
        title: bookToEdit.title || '',
        author: bookToEdit.author || '',
        category: bookToEdit.category || availableCategories[0],
        price: bookToEdit.price !== undefined ? String(bookToEdit.price) : '',
        quantity: bookToEdit.quantity !== undefined ? String(bookToEdit.quantity) : '',
        description: bookToEdit.description || '',
        image: bookToEdit.image || ''
      });
    } else {
      setFormData(initialFormState);
    }
    setErrors({});
    setServerError('');
  }, [bookToEdit, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors = {};

    // bookId validation
    if (!formData.bookId.trim()) {
      newErrors.bookId = 'Book ID is required (e.g. B101)';
    }

    // title validation
    if (!formData.title.trim()) {
      newErrors.title = 'Book title cannot be empty';
    }

    // author validation
    if (!formData.author.trim()) {
      newErrors.author = 'Author cannot be empty';
    }

    // category validation
    if (!formData.category.trim()) {
      newErrors.category = 'Please select or enter a category';
    }

    // price validation
    if (formData.price === '' || formData.price === null) {
      newErrors.price = 'Price is required';
    } else {
      const numPrice = Number(formData.price);
      if (isNaN(numPrice) || numPrice < 0) {
        newErrors.price = 'Price must be a valid number ≥ 0';
      }
    }

    // quantity validation
    if (formData.quantity === '' || formData.quantity === null) {
      newErrors.quantity = 'Quantity is required';
    } else {
      const numQty = Number(formData.quantity);
      if (isNaN(numQty) || !Number.isInteger(numQty) || numQty < 0) {
        newErrors.quantity = 'Quantity must be an integer ≥ 0';
      }
    }

    // description validation
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for that specific field when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    setServerError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setSubmitting(true);
      setServerError('');

      const payload = {
        bookId: formData.bookId.trim(),
        title: formData.title.trim(),
        author: formData.author.trim(),
        category: formData.category.trim(),
        price: Number(formData.price),
        quantity: Number(formData.quantity),
        description: formData.description.trim(),
        image: formData.image ? formData.image.trim() : ''
      };

      if (isEditing) {
        // Use either bookToEdit._id or bookToEdit.bookId for lookup
        const idToUpdate = bookToEdit.bookId || bookToEdit._id;
        await updateBook(idToUpdate, payload);
        showToast(`Book "${payload.title}" updated successfully!`, 'success');
      } else {
        await createBook(payload);
        showToast(`Book "${payload.title}" created successfully!`, 'success');
      }

      onBookSaved();
      onClose();
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || 'Failed to save book. Please verify your inputs.';
      setServerError(errorMsg);
      showToast(errorMsg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose} id="book-form-modal-backdrop">
      <div 
        className="modal-content form-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="form-modal-heading"
      >
        <div className="modal-form-header">
          <div className="header-title-flex">
            {isEditing ? <Save size={22} className="modal-title-icon" /> : <PlusCircle size={22} className="modal-title-icon" />}
            <h2 id="form-modal-heading" className="modal-title">
              {isEditing ? 'Edit Book Details' : 'Add New Book to Inventory'}
            </h2>
          </div>
          <button
            id="close-form-modal-btn"
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close form modal"
          >
            <X size={20} />
          </button>
        </div>

        {serverError && (
          <div className="server-error-banner" id="form-server-error-banner">
            <AlertCircle size={18} />
            <span>{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="admin-book-form" noValidate>
          <div className="form-grid">
            {/* Book ID */}
            <div className="form-field-group">
              <label htmlFor="field-bookId" className="field-label">
                Book ID <span className="required-star">*</span>
              </label>
              <input
                id="field-bookId"
                name="bookId"
                type="text"
                placeholder="e.g. B101"
                value={formData.bookId}
                onChange={handleChange}
                className={`field-input ${errors.bookId ? 'input-error' : ''}`}
                disabled={isEditing}
              />
              {errors.bookId && (
                <span className="field-error-text" id="error-bookId">
                  {errors.bookId}
                </span>
              )}
            </div>

            {/* Category */}
            <div className="form-field-group">
              <label htmlFor="field-category" className="field-label">
                Category <span className="required-star">*</span>
              </label>
              <select
                id="field-category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className={`field-input ${errors.category ? 'input-error' : ''}`}
              >
                {availableCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              {errors.category && (
                <span className="field-error-text" id="error-category">
                  {errors.category}
                </span>
              )}
            </div>

            {/* Title */}
            <div className="form-field-group full-width">
              <label htmlFor="field-title" className="field-label">
                Book Title <span className="required-star">*</span>
              </label>
              <input
                id="field-title"
                name="title"
                type="text"
                placeholder="Enter complete book title"
                value={formData.title}
                onChange={handleChange}
                className={`field-input ${errors.title ? 'input-error' : ''}`}
              />
              {errors.title && (
                <span className="field-error-text" id="error-title">
                  {errors.title}
                </span>
              )}
            </div>

            {/* Author */}
            <div className="form-field-group full-width">
              <label htmlFor="field-author" className="field-label">
                Author Name <span className="required-star">*</span>
              </label>
              <input
                id="field-author"
                name="author"
                type="text"
                placeholder="Enter author's name"
                value={formData.author}
                onChange={handleChange}
                className={`field-input ${errors.author ? 'input-error' : ''}`}
              />
              {errors.author && (
                <span className="field-error-text" id="error-author">
                  {errors.author}
                </span>
              )}
            </div>

            {/* Price */}
            <div className="form-field-group">
              <label htmlFor="field-price" className="field-label">
                Price (₹) <span className="required-star">*</span>
              </label>
              <input
                id="field-price"
                name="price"
                type="number"
                step="0.01"
                min="0"
                placeholder="e.g. 499"
                value={formData.price}
                onChange={handleChange}
                className={`field-input ${errors.price ? 'input-error' : ''}`}
              />
              {errors.price && (
                <span className="field-error-text" id="error-price">
                  {errors.price}
                </span>
              )}
            </div>

            {/* Quantity */}
            <div className="form-field-group">
              <label htmlFor="field-quantity" className="field-label">
                Quantity in Stock <span className="required-star">*</span>
              </label>
              <input
                id="field-quantity"
                name="quantity"
                type="number"
                step="1"
                min="0"
                placeholder="e.g. 15"
                value={formData.quantity}
                onChange={handleChange}
                className={`field-input ${errors.quantity ? 'input-error' : ''}`}
              />
              {errors.quantity && (
                <span className="field-error-text" id="error-quantity">
                  {errors.quantity}
                </span>
              )}
            </div>

            {/* Image URL with Preview */}
            <div className="form-field-group full-width">
              <label htmlFor="field-image" className="field-label">
                Book Cover Image URL
              </label>
              <div className="image-input-row">
                <input
                  id="field-image"
                  name="image"
                  type="url"
                  placeholder="e.g. https://images.unsplash.com/photo-..."
                  value={formData.image}
                  onChange={handleChange}
                  className="field-input"
                />
                {formData.image && (
                  <div className="form-image-preview-box">
                    <img
                      src={formData.image}
                      alt="Preview"
                      className="form-image-preview-thumb"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = DEFAULT_BOOK_COVER;
                      }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="form-field-group full-width">
              <label htmlFor="field-description" className="field-label">
                Description <span className="required-star">*</span>
              </label>
              <textarea
                id="field-description"
                name="description"
                rows="4"
                placeholder="Provide a detailed overview of the book's contents, topics, or background..."
                value={formData.description}
                onChange={handleChange}
                className={`field-textarea ${errors.description ? 'input-error' : ''}`}
              ></textarea>
              {errors.description && (
                <span className="field-error-text" id="error-description">
                  {errors.description}
                </span>
              )}
            </div>
          </div>

          <div className="modal-actions-footer">
            <button
              id="cancel-book-form-btn"
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              id="submit-book-form-btn"
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <div className="spinner-sm"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save size={16} />
                  <span>{isEditing ? 'Update Book' : 'Save Book'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookFormModal;
