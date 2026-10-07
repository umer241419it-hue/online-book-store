import React, { useState } from 'react';
import { Plus, Edit2, Trash2, BookOpen, Layers, AlertCircle, Search, RefreshCw, LogOut, ShieldCheck } from 'lucide-react';
import BookFormModal from './BookFormModal';
import DeleteConfirmModal from './DeleteConfirmModal';
import { deleteBook, DEFAULT_BOOK_COVER } from '../services/api';

const AdminPanel = ({ books, loading, onRefreshBooks, onLogout, showToast }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [bookToEdit, setBookToEdit] = useState(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [bookToDelete, setBookToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [adminSearch, setAdminSearch] = useState('');

  // Calculate statistics
  const totalBooks = books.length;
  const totalStock = books.reduce((acc, b) => acc + (b.quantity || 0), 0);
  const outOfStockCount = books.filter((b) => b.quantity <= 0).length;
  const lowStockCount = books.filter((b) => b.quantity > 0 && b.quantity <= 3).length;

  const handleOpenAdd = () => {
    setBookToEdit(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (book) => {
    setBookToEdit(book);
    setIsFormOpen(true);
  };

  const handleOpenDelete = (book) => {
    setBookToDelete(book);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async (book) => {
    try {
      setIsDeleting(true);
      const identifier = book.bookId || book._id;
      await deleteBook(identifier);
      showToast(`Book "${book.title}" was successfully deleted from database.`, 'success');
      setIsDeleteModalOpen(false);
      setBookToDelete(null);
      onRefreshBooks();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to delete book.';
      showToast(msg, 'error');
      if (err.response?.status === 401 && onLogout) {
        onLogout();
      }
    } finally {
      setIsDeleting(false);
    }
  };

  // Filter books locally in admin for convenience
  const filteredBooks = books.filter((book) => {
    if (!adminSearch.trim()) return true;
    const term = adminSearch.toLowerCase();
    return (
      book.title.toLowerCase().includes(term) ||
      book.author.toLowerCase().includes(term) ||
      book.bookId.toLowerCase().includes(term) ||
      book.category.toLowerCase().includes(term)
    );
  });

  return (
    <div className="admin-panel-container" id="admin-panel-view">
      <div className="admin-header-row">
        <div>
          <div className="admin-auth-indicator">
            <span className="admin-auth-pill">
              <ShieldCheck size={14} />
              <span>Logged in as Administrator</span>
            </span>
          </div>
          <h1 className="admin-title">Admin Inventory Management</h1>
          <p className="admin-subtitle">
            Add, update, delete, and monitor books in the store database.
          </p>
        </div>

        <div className="admin-header-actions">
          <button
            id="admin-refresh-books-btn"
            type="button"
            className="btn btn-secondary"
            onClick={onRefreshBooks}
            title="Refresh database records"
          >
            <RefreshCw size={16} />
            <span>Refresh</span>
          </button>

          <button
            id="admin-add-book-btn"
            type="button"
            className="btn btn-primary"
            onClick={handleOpenAdd}
          >
            <Plus size={18} />
            <span>Add New Book</span>
          </button>

          <button
            id="admin-logout-btn"
            type="button"
            className="btn btn-secondary logout-btn"
            onClick={onLogout}
            title="Log out of Admin session"
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="admin-metrics-grid">
        <div className="metric-card">
          <div className="metric-icon-wrap bg-primary-soft">
            <BookOpen size={22} className="text-primary" />
          </div>
          <div>
            <span className="metric-label">Total Titles</span>
            <h3 className="metric-value" id="metric-total-books">{totalBooks}</h3>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-wrap bg-success-soft">
            <Layers size={22} className="text-success" />
          </div>
          <div>
            <span className="metric-label">Total Stock Units</span>
            <h3 className="metric-value" id="metric-total-stock">{totalStock}</h3>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-wrap bg-warning-soft">
            <AlertCircle size={22} className="text-warning" />
          </div>
          <div>
            <span className="metric-label">Low Stock (≤ 3)</span>
            <h3 className="metric-value" id="metric-low-stock">{lowStockCount}</h3>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-wrap bg-danger-soft">
            <AlertCircle size={22} className="text-danger" />
          </div>
          <div>
            <span className="metric-label">Out of Stock</span>
            <h3 className="metric-value" id="metric-out-of-stock">{outOfStockCount}</h3>
          </div>
        </div>
      </div>

      {/* Search and Table */}
      <div className="admin-table-card">
        <div className="admin-table-toolbar">
          <div className="admin-search-wrap">
            <Search size={16} className="search-icon" />
            <input
              id="admin-filter-input"
              type="text"
              placeholder="Filter by title, author, category, or ID..."
              value={adminSearch}
              onChange={(e) => setAdminSearch(e.target.value)}
              className="admin-search-input"
            />
          </div>
          <span className="table-count-text">
            {filteredBooks.length} of {books.length} books listed
          </span>
        </div>

        <div className="table-responsive-wrapper">
          <table className="admin-data-table" id="admin-books-table">
            <thead>
              <tr>
                <th>Cover</th>
                <th>Book ID</th>
                <th>Title</th>
                <th>Author</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="table-loading-cell">
                    <div className="spinner-sm"></div>
                    <span>Loading database records...</span>
                  </td>
                </tr>
              ) : filteredBooks.length === 0 ? (
                <tr>
                  <td colSpan="8" className="table-empty-cell">
                    No books match your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredBooks.map((book) => (
                  <tr key={book.bookId || book._id} id={`admin-row-${book.bookId}`}>
                    <td>
                      <img
                        src={book.image || DEFAULT_BOOK_COVER}
                        alt={book.title}
                        className="table-book-thumb"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = DEFAULT_BOOK_COVER;
                        }}
                        loading="lazy"
                      />
                    </td>
                    <td>
                      <span className="table-id-badge">{book.bookId}</span>
                    </td>
                    <td className="table-title-cell">
                      <strong>{book.title}</strong>
                    </td>
                    <td>{book.author}</td>
                    <td>
                      <span className="category-tag-sm">{book.category}</span>
                    </td>
                    <td className="table-price-cell">
                      ₹{book.price.toLocaleString('en-IN')}
                    </td>
                    <td>
                      {book.quantity <= 0 ? (
                        <span className="stock-pill stock-zero">0 (Out of stock)</span>
                      ) : book.quantity <= 3 ? (
                        <span className="stock-pill stock-low">{book.quantity} (Low)</span>
                      ) : (
                        <span className="stock-pill stock-ok">{book.quantity}</span>
                      )}
                    </td>
                    <td>
                      <div className="table-actions-group">
                        <button
                          id={`admin-edit-btn-${book.bookId}`}
                          type="button"
                          className="action-icon-btn edit-btn"
                          onClick={() => handleOpenEdit(book)}
                          title="Edit Book Details"
                        >
                          <Edit2 size={15} />
                          <span>Edit</span>
                        </button>
                        <button
                          id={`admin-delete-btn-${book.bookId}`}
                          type="button"
                          className="action-icon-btn delete-btn"
                          onClick={() => handleOpenDelete(book)}
                          title="Delete Book"
                        >
                          <Trash2 size={15} />
                          <span>Delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Form Modal */}
      <BookFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        bookToEdit={bookToEdit}
        onBookSaved={onRefreshBooks}
        showToast={showToast}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        book={bookToDelete}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default AdminPanel;
