import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import StatsOverview from './components/StatsOverview';
import FilterBar from './components/FilterBar';
import BookCard from './components/BookCard';
import BookFormModal from './components/BookFormModal';
import AuthModal from './components/AuthModal';
import Toast from './components/Toast';
import { authApi, booksApi } from './services/api';
import { BookPlus, Library, AlertCircle, RefreshCw, Sparkles, Trash2, X } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState(() => authApi.getCurrentUser());
  const [books, setBooks] = useState([]);
  const [stats, setStats] = useState({ total: 0, available: 0, issued: 0, categoriesCount: 0 });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [serverError, setServerError] = useState(null);

  // Filters state
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [sortBy, setSortBy] = useState('newest');

  // Modals state
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [bookToDelete, setBookToDelete] = useState(null);

  // Toasts
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Fetch books from REST API
  const loadBooks = useCallback(async () => {
    setLoading(true);
    setServerError(null);
    try {
      const data = await booksApi.getBooks({
        search,
        category: categoryFilter,
        status: statusFilter,
        sortBy,
      });

      setBooks(data.books || []);
      if (data.stats) {
        setStats(data.stats);
      }
      if (data.categories) {
        setCategories(data.categories);
      }
    } catch (err) {
      console.error('Failed to load books:', err);
      setServerError(err.message || 'Unable to connect to the backend server');
    } finally {
      setLoading(false);
    }
  }, [search, categoryFilter, statusFilter, sortBy]);

  useEffect(() => {
    loadBooks();
  }, [loadBooks]);

  // Auth handlers
  const handleLogin = async (credentials) => {
    const res = await authApi.login(credentials);
    setUser(res.user);
    addToast(`Welcome back, ${res.user.name || 'Librarian'}!`, 'success');
  };

  const handleSignup = async (userData) => {
    const res = await authApi.signup(userData);
    setUser(res.user);
    addToast('Account created successfully!', 'success');
  };

  const handleLogout = () => {
    authApi.logout();
    setUser(null);
    addToast('Logged out successfully', 'info');
  };

  // Add / Edit book handler
  const handleSaveBook = async (payload, id) => {
    if (id) {
      // Update existing book
      const res = await booksApi.updateBook(id, payload);
      addToast(`"${res.book.title}" updated successfully!`, 'success');
    } else {
      // Create new book
      const res = await booksApi.createBook(payload);
      addToast(`"${res.book.title}" added to library!`, 'success');
    }
    loadBooks();
  };

  // Toggle book status between Available and Issued
  const handleToggleStatus = async (book) => {
    const newStatus = book.status === 'Available' ? 'Issued' : 'Available';

    // Optimistic UI update
    setBooks((prev) =>
      prev.map((b) => (b._id === book._id ? { ...b, status: newStatus } : b))
    );
    setStats((prev) => ({
      ...prev,
      available: newStatus === 'Available' ? prev.available + 1 : Math.max(0, prev.available - 1),
      issued: newStatus === 'Issued' ? prev.issued + 1 : Math.max(0, prev.issued - 1),
    }));

    try {
      await booksApi.toggleBookStatus(book._id);
      addToast(`"${book.title}" marked as ${newStatus}`, 'success');
    } catch (err) {
      // Revert if error
      loadBooks();
      addToast(err.message || 'Failed to update book status', 'error');
    }
  };

  // Delete book handler
  const confirmDelete = async () => {
    if (!bookToDelete) return;

    try {
      await booksApi.deleteBook(bookToDelete._id);
      addToast(`"${bookToDelete.title}" removed from library`, 'success');
      setBookToDelete(null);
      loadBooks();
    } catch (err) {
      addToast(err.message || 'Failed to delete book', 'error');
    }
  };

  // Seed initial sample books
  const handleSeedBooks = async () => {
    try {
      await booksApi.seedSampleBooks();
      addToast('Sample books loaded into your library!', 'success');
      loadBooks();
    } catch (err) {
      addToast(err.message || 'Failed to seed sample books', 'error');
    }
  };

  // Clear all filters
  const handleClearFilters = () => {
    setSearch('');
    setStatusFilter('All');
    setCategoryFilter('All');
    setSortBy('newest');
  };

  return (
    <div className="app-container">
      {/* Top Navigation */}
      <Navbar
        user={user}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
        onOpenAddBook={() => {
          setEditingBook(null);
          setIsBookModalOpen(true);
        }}
      />

      {/* Backend Connection Error Banner */}
      {serverError && (
        <div className="system-banner" style={{ borderLeft: '4px solid #f43f5e' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <AlertCircle size={20} color="#f43f5e" />
            <div>
              <strong>Backend Connection Notice:</strong> {serverError}
              <div style={{ fontSize: '0.8rem', opacity: 0.85, marginTop: '2px' }}>
                Make sure your Express server is running on port 5000 (`npm run dev` in `backend/`).
              </div>
            </div>
          </div>
          <button
            className="btn btn-secondary btn-sm"
            onClick={loadBooks}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <RefreshCw size={14} />
            <span>Retry</span>
          </button>
        </div>
      )}

      {/* Hero / Statistics Section */}
      <StatsOverview stats={stats} />

      {/* Controls & Filter Bar */}
      <FilterBar
        search={search}
        onSearchChange={setSearch}
        status={statusFilter}
        onStatusChange={setStatusFilter}
        category={categoryFilter}
        onCategoryChange={setCategoryFilter}
        categories={categories}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        onClearFilters={handleClearFilters}
      />

      {/* Main Books Grid / List */}
      <main aria-label="Books Inventory">
        {loading ? (
          <div className="empty-state">
            <RefreshCw size={36} className="spin" color="#6366f1" style={{ animation: 'spin 1s linear infinite' }} />
            <h3 className="empty-state-title">Loading library records...</h3>
            <p className="empty-state-desc">Fetching catalog from MongoDB REST endpoints.</p>
          </div>
        ) : books.length > 0 ? (
          <div className="books-grid">
            {books.map((book) => (
              <BookCard
                key={book._id}
                book={book}
                onToggleStatus={handleToggleStatus}
                onEdit={(b) => {
                  setEditingBook(b);
                  setIsBookModalOpen(true);
                }}
                onDelete={(b) => setBookToDelete(b)}
              />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">
              <Library size={32} />
            </div>
            <h3 className="empty-state-title">No books match your criteria</h3>
            <p className="empty-state-desc">
              {search || statusFilter !== 'All' || categoryFilter !== 'All'
                ? 'Try adjusting your search terms or clearing current filters.'
                : 'Your library is currently empty. Add your first book or load sample records!'}
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
              {search || statusFilter !== 'All' || categoryFilter !== 'All' ? (
                <button className="btn btn-secondary" onClick={handleClearFilters}>
                  Clear Filters
                </button>
              ) : (
                <>
                  <button
                    className="btn btn-primary"
                    onClick={() => {
                      setEditingBook(null);
                      setIsBookModalOpen(true);
                    }}
                  >
                    <BookPlus size={18} />
                    <span>Add First Book</span>
                  </button>
                  <button className="btn btn-secondary" onClick={handleSeedBooks}>
                    <Sparkles size={16} color="#fbbf24" />
                    <span>Load Sample Books</span>
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Add / Edit Book Modal */}
      <BookFormModal
        isOpen={isBookModalOpen}
        onClose={() => setIsBookModalOpen(false)}
        onSubmit={handleSaveBook}
        initialData={editingBook}
      />

      {/* Auth Modal (Login / Signup) */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLogin={handleLogin}
        onSignup={handleSignup}
      />

      {/* Delete Confirmation Modal */}
      {bookToDelete && (
        <div className="modal-overlay" onClick={() => setBookToDelete(null)} role="dialog" aria-modal="true">
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '420px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f43f5e' }}>
                <Trash2 size={22} />
                <h3 className="modal-title" style={{ fontSize: '1.25rem' }}>Delete Book</h3>
              </div>
              <button className="modal-close-btn" onClick={() => setBookToDelete(null)}>
                <X size={18} />
              </button>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
              Are you sure you want to remove <strong>"{bookToDelete.title}"</strong> by {bookToDelete.author}? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button className="btn btn-secondary" onClick={() => setBookToDelete(null)}>
                Cancel
              </button>
              <button className="btn btn-danger" id="btn-confirm-delete" onClick={confirmDelete}>
                Yes, Delete Book
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notifications */}
      <Toast toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}
