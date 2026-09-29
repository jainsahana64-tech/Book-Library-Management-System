import React, { useState, useEffect } from 'react';
import { X, BookPlus, Save, CheckCircle, Clock } from 'lucide-react';

const COMMON_CATEGORIES = [
  'Technology',
  'Fiction',
  'Non-Fiction',
  'Science',
  'History',
  'Philosophy',
  'Self-Help',
  'Biography',
  'Business',
  'Other',
];

export default function BookFormModal({ isOpen, onClose, onSubmit, initialData }) {
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    category: 'Technology',
    customCategory: '',
    status: 'Available',
    isbn: '',
    description: '',
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      const isKnown = COMMON_CATEGORIES.includes(initialData.category);
      setFormData({
        title: initialData.title || '',
        author: initialData.author || '',
        category: isKnown ? initialData.category : 'Other',
        customCategory: isKnown ? '' : initialData.category || '',
        status: initialData.status || 'Available',
        isbn: initialData.isbn || '',
        description: initialData.description || '',
      });
    } else {
      setFormData({
        title: '',
        author: '',
        category: 'Technology',
        customCategory: '',
        status: 'Available',
        isbn: '',
        description: '',
      });
    }
    setErrors({});
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const isEdit = Boolean(initialData);

  const validate = () => {
    const errs = {};
    if (!formData.title.trim()) errs.title = 'Title is required';
    if (!formData.author.trim()) errs.author = 'Author is required';
    if (formData.category === 'Other' && !formData.customCategory.trim()) {
      errs.customCategory = 'Please specify the category';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const payload = {
        title: formData.title.trim(),
        author: formData.author.trim(),
        category:
          formData.category === 'Other'
            ? formData.customCategory.trim()
            : formData.category,
        status: formData.status,
        isbn: formData.isbn.trim(),
        description: formData.description.trim(),
      };

      await onSubmit(payload, initialData?._id);
      onClose();
    } catch (err) {
      setErrors({ form: err.message || 'Failed to save book' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            {isEdit ? <Save size={22} color="#6366f1" /> : <BookPlus size={22} color="#6366f1" />}
            <h2 className="modal-title">{isEdit ? 'Edit Book Details' : 'Add New Book'}</h2>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        {errors.form && (
          <div style={{
            background: 'rgba(244, 63, 94, 0.15)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            borderRadius: '8px',
            padding: '0.75rem 1rem',
            color: '#fb7185',
            fontSize: '0.88rem',
            marginBottom: '1rem',
          }}>
            {errors.form}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Title */}
          <div className="form-group">
            <label className="form-label" htmlFor="book-title-input">
              Book Title <span style={{ color: '#f43f5e' }}>*</span>
            </label>
            <input
              id="book-title-input"
              type="text"
              className="form-input"
              placeholder="e.g. Clean Architecture"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
            {errors.title && <span style={{ color: '#fb7185', fontSize: '0.8rem' }}>{errors.title}</span>}
          </div>

          {/* Author */}
          <div className="form-group">
            <label className="form-label" htmlFor="book-author-input">
              Author Name <span style={{ color: '#f43f5e' }}>*</span>
            </label>
            <input
              id="book-author-input"
              type="text"
              className="form-input"
              placeholder="e.g. Robert C. Martin"
              value={formData.author}
              onChange={(e) => setFormData({ ...formData, author: e.target.value })}
              required
            />
            {errors.author && <span style={{ color: '#fb7185', fontSize: '0.8rem' }}>{errors.author}</span>}
          </div>

          {/* Category */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="book-category-select">Category</label>
              <select
                id="book-category-select"
                className="form-select"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                {COMMON_CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {formData.category === 'Other' && (
              <div className="form-group">
                <label className="form-label" htmlFor="book-custom-cat">Specific Category</label>
                <input
                  id="book-custom-cat"
                  type="text"
                  className="form-input"
                  placeholder="Enter category"
                  value={formData.customCategory}
                  onChange={(e) => setFormData({ ...formData, customCategory: e.target.value })}
                />
                {errors.customCategory && (
                  <span style={{ color: '#fb7185', fontSize: '0.8rem' }}>{errors.customCategory}</span>
                )}
              </div>
            )}

            <div className="form-group">
              <label className="form-label" htmlFor="book-isbn-input">ISBN (Optional)</label>
              <input
                id="book-isbn-input"
                type="text"
                className="form-input"
                placeholder="e.g. 978-0134494166"
                value={formData.isbn}
                onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
              />
            </div>
          </div>

          {/* Availability Status */}
          <div className="form-group">
            <label className="form-label">Availability Status</label>
            <div className="radio-button-group">
              <div
                className={`radio-pill ${formData.status === 'Available' ? 'selected-available' : ''}`}
                onClick={() => setFormData({ ...formData, status: 'Available' })}
                id="status-radio-available"
              >
                <CheckCircle size={16} />
                <span>Available</span>
              </div>
              <div
                className={`radio-pill ${formData.status === 'Issued' ? 'selected-issued' : ''}`}
                onClick={() => setFormData({ ...formData, status: 'Issued' })}
                id="status-radio-issued"
              >
                <Clock size={16} />
                <span>Issued</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label" htmlFor="book-desc-input">Brief Description / Notes</label>
            <textarea
              id="book-desc-input"
              rows={3}
              className="form-textarea"
              placeholder="Short summary or notes about the copy..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          {/* Form Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              id="btn-save-book"
              disabled={submitting}
            >
              {submitting ? 'Saving...' : isEdit ? 'Update Book' : 'Add to Library'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
