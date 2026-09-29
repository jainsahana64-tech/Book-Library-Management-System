import React from 'react';
import { User, Tag, Edit3, Trash2, ArrowLeftRight, Check, Clock } from 'lucide-react';

export default function BookCard({ book, onToggleStatus, onEdit, onDelete }) {
  const isAvailable = book.status === 'Available';

  return (
    <article
      className="book-card"
      id={`book-card-${book._id}`}
      style={{
        '--status-stripe': isAvailable ? '#10b981' : '#f59e0b',
      }}
    >
      <div>
        <div className="book-card-header">
          <span className="category-badge">
            <Tag size={12} />
            {book.category || 'General'}
          </span>

          <span
            className={`status-badge ${isAvailable ? 'available' : 'issued'}`}
            id={`badge-status-${book._id}`}
          >
            <span className="status-indicator-dot" />
            {book.status}
          </span>
        </div>

        <div className="book-card-body" style={{ marginTop: '0.85rem' }}>
          <h3 className="book-title" title={book.title}>
            {book.title}
          </h3>
          <p className="book-author">
            <User size={15} />
            <span>by <strong>{book.author}</strong></span>
          </p>

          {book.description ? (
            <p className="book-description" title={book.description}>
              {book.description}
            </p>
          ) : (
            <p className="book-description" style={{ fontStyle: 'italic', opacity: 0.6 }}>
              {book.isbn ? `ISBN: ${book.isbn}` : 'No description provided.'}
            </p>
          )}
        </div>
      </div>

      <div className="book-card-footer">
        {/* Toggle Status Button */}
        <button
          className={`toggle-status-btn ${isAvailable ? 'to-issue' : 'to-available'}`}
          id={`btn-toggle-${book._id}`}
          onClick={() => onToggleStatus(book)}
          title={`Click to mark this book as ${isAvailable ? 'Issued' : 'Available'}`}
        >
          {isAvailable ? (
            <>
              <Clock size={15} />
              <span>Mark as Issued</span>
            </>
          ) : (
            <>
              <Check size={15} />
              <span>Mark as Available</span>
            </>
          )}
        </button>

        {/* Action icons */}
        <div className="card-action-buttons">
          <button
            className="icon-action-btn"
            id={`btn-edit-${book._id}`}
            onClick={() => onEdit(book)}
            title="Edit book details"
          >
            <Edit3 size={15} />
          </button>
          <button
            className="icon-action-btn delete"
            id={`btn-delete-${book._id}`}
            onClick={() => onDelete(book)}
            title="Delete this book"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>
    </article>
  );
}
