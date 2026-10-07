import React, { useState, useEffect } from 'react';
import { X, ShoppingCart, Tag, CheckCircle2, AlertCircle, Hash, User } from 'lucide-react';
import { getBookById, DEFAULT_BOOK_COVER } from '../services/api';
import { useCart } from '../context/CartContext';

const BookDetailsModal = ({ bookId, onClose, showToast }) => {
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [qtyToAdd, setQtyToAdd] = useState(1);

  const { addToCart, cart } = useCart();

  useEffect(() => {
    let isMounted = true;
    const fetchDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getBookById(bookId);
        if (isMounted) {
          setBook(data);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.response?.data?.message || 'Failed to fetch book details.');
          setLoading(false);
        }
      }
    };

    if (bookId) {
      fetchDetails();
    }

    return () => {
      isMounted = false;
    };
  }, [bookId]);

  if (!bookId) return null;

  const cartItem = book ? cart.find((item) => item.book.bookId === book.bookId) : null;
  const currentInCart = cartItem ? cartItem.quantity : 0;
  const isOutOfStock = book ? book.quantity <= 0 : false;
  const maxCanAdd = book ? Math.max(0, book.quantity - currentInCart) : 0;

  const handleAdd = () => {
    if (!book || isOutOfStock) return;
    if (qtyToAdd > maxCanAdd) {
      showToast(`Cannot add ${qtyToAdd} items. Only ${maxCanAdd} more available for your cart.`, 'warning');
      return;
    }
    const result = addToCart(book, qtyToAdd);
    showToast(result.message, result.success ? 'success' : 'warning');
    if (result.success) {
      onClose();
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose} id="book-details-modal-backdrop">
      <div 
        className="modal-content book-details-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-book-title"
      >
        <button 
          id="close-details-modal-btn"
          className="modal-close-btn" 
          onClick={onClose}
          aria-label="Close modal"
        >
          <X size={20} />
        </button>

        {loading ? (
          <div className="modal-loading-wrapper">
            <div className="spinner"></div>
            <p>Loading book details from server...</p>
          </div>
        ) : error ? (
          <div className="modal-error-wrapper">
            <AlertCircle size={40} className="error-icon" />
            <h3>Unable to Load Book</h3>
            <p>{error}</p>
            <button className="btn btn-secondary" onClick={onClose}>
              Close
            </button>
          </div>
        ) : book ? (
          <div className="book-details-body">
            <div className="details-layout-grid">
              {/* Book Cover Column */}
              <div className="details-cover-col">
                <img
                  src={book.image || DEFAULT_BOOK_COVER}
                  alt={book.title}
                  className="details-cover-image"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = DEFAULT_BOOK_COVER;
                  }}
                />
              </div>

              {/* Book Details Column */}
              <div className="details-info-col">
                <div className="details-header">
                  <div className="details-category-bar">
                    <span className="category-tag">
                      <Tag size={13} /> {book.category}
                    </span>
                    <span className="book-id-badge" id="modal-book-id">
                      <Hash size={13} /> {book.bookId}
                    </span>
                  </div>
                  <h2 id="modal-book-title" className="details-title">
                    {book.title}
                  </h2>
                  <p className="details-author" id="modal-book-author">
                    <User size={15} /> Written by <strong>{book.author}</strong>
                  </p>
                </div>

                <div className="details-spec-grid">
                  <div className="spec-card">
                    <span className="spec-label">Price</span>
                    <span className="spec-value price-text" id="modal-book-price">
                      ₹{book.price.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="spec-card">
                    <span className="spec-label">Stock Status</span>
                    {isOutOfStock ? (
                      <span className="stock-badge out-of-stock" id="modal-book-stock">
                        <AlertCircle size={14} /> Out of Stock
                      </span>
                    ) : (
                      <span className="stock-badge in-stock" id="modal-book-stock">
                        <CheckCircle2 size={14} /> {book.quantity} copies in stock
                      </span>
                    )}
                  </div>

                  <div className="spec-card">
                    <span className="spec-label">Already in Cart</span>
                    <span className="spec-value">{currentInCart} copies</span>
                  </div>
                </div>

                <div className="details-desc-box">
                  <h4 className="desc-heading">About This Book</h4>
                  <p className="desc-content" id="modal-book-description">{book.description}</p>
                </div>
              </div>
            </div>

            <div className="details-footer-actions">
              {!isOutOfStock && maxCanAdd > 0 ? (
                <div className="quantity-select-row">
                  <label htmlFor="modal-qty-select" className="qty-label">Quantity to add:</label>
                  <div className="qty-stepper">
                    <button
                      type="button"
                      className="stepper-btn"
                      onClick={() => setQtyToAdd((q) => Math.max(1, q - 1))}
                      disabled={qtyToAdd <= 1}
                    >
                      -
                    </button>
                    <span className="stepper-value">{qtyToAdd}</span>
                    <button
                      type="button"
                      className="stepper-btn"
                      onClick={() => setQtyToAdd((q) => Math.min(maxCanAdd, q + 1))}
                      disabled={qtyToAdd >= maxCanAdd}
                    >
                      +
                    </button>
                  </div>
                </div>
              ) : null}

              <div className="modal-buttons-group">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={onClose}
                >
                  Close
                </button>
                <button
                  id="modal-add-to-cart-btn"
                  type="button"
                  className={`btn btn-primary ${isOutOfStock || maxCanAdd === 0 ? 'disabled' : ''}`}
                  onClick={handleAdd}
                  disabled={isOutOfStock || maxCanAdd === 0}
                >
                  <ShoppingCart size={18} />
                  <span>
                    {isOutOfStock
                      ? 'Out of Stock'
                      : maxCanAdd === 0
                      ? 'Max in Cart'
                      : `Add to Cart (₹${(book.price * qtyToAdd).toLocaleString('en-IN')})`}
                  </span>
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default BookDetailsModal;
