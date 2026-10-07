import React from 'react';
import { ShoppingCart, Eye, Tag, AlertCircle, CheckCircle2, Plus, Minus } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { DEFAULT_BOOK_COVER } from '../services/api';

const BookCard = ({ book, onViewDetails, showToast }) => {
  const { addToCart, cart, incrementQuantity, decrementQuantity } = useCart();

  const isOutOfStock = book.quantity <= 0;
  
  // Calculate how many of this book are currently in the cart
  const cartItem = cart.find((item) => item.book.bookId === book.bookId);
  const cartQuantity = cartItem ? cartItem.quantity : 0;
  const isMaxStockInCart = cartQuantity >= book.quantity;

  const handleAddToCart = (e) => {
    e.stopPropagation();
    if (isOutOfStock) {
      showToast('This book is out of stock.', 'error');
      return;
    }
    if (isMaxStockInCart) {
      showToast(`Cannot add more. You already have all ${book.quantity} copies in your cart.`, 'warning');
      return;
    }

    const result = addToCart(book, 1);
    showToast(result.message, result.success ? 'success' : 'warning');
  };

  const handleDecrement = (e) => {
    e.stopPropagation();
    decrementQuantity(book.bookId);
  };

  const handleIncrement = (e) => {
    e.stopPropagation();
    if (isMaxStockInCart) {
      showToast(`Cannot add more. Maximum available stock is ${book.quantity}.`, 'warning');
      return;
    }
    const result = incrementQuantity(book.bookId);
    if (!result.success) {
      showToast(result.message, 'warning');
    }
  };

  return (
    <div className={`book-card ${isOutOfStock ? 'out-of-stock-card' : ''}`} id={`book-card-${book.bookId}`}>
      {/* Book Cover Image */}
      <div 
        className="book-card-image-wrap"
        onClick={() => onViewDetails(book.bookId)}
        title={`View details for ${book.title}`}
      >
        <img
          src={book.image || DEFAULT_BOOK_COVER}
          alt={book.title}
          className="book-card-image"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = DEFAULT_BOOK_COVER;
          }}
          loading="lazy"
        />
        <div className="card-top-header image-overlay">
          <span className="category-tag">
            <Tag size={11} />
            {book.category}
          </span>
          <span className="book-id-badge">#{book.bookId}</span>
        </div>
      </div>

      <div className="card-body">
        <h3 
          className="book-title" 
          title={book.title} 
          id={`book-title-${book.bookId}`}
          onClick={() => onViewDetails(book.bookId)}
        >
          {book.title}
        </h3>
        <p className="book-author" id={`book-author-${book.bookId}`}>
          by <strong>{book.author}</strong>
        </p>

        <p className="book-brief-desc">
          {book.description.length > 90
            ? `${book.description.substring(0, 90)}...`
            : book.description}
        </p>
      </div>

      <div className="card-pricing-row">
        <div className="price-container">
          <span className="currency-symbol">₹</span>
          <span className="price-amount" id={`book-price-${book.bookId}`}>
            {book.price.toLocaleString('en-IN')}
          </span>
        </div>

        <div className="stock-container">
          {isOutOfStock ? (
            <span className="stock-badge out-of-stock" id={`book-stock-${book.bookId}`}>
              <AlertCircle size={13} /> Out of Stock
            </span>
          ) : book.quantity <= 3 ? (
            <span className="stock-badge low-stock" id={`book-stock-${book.bookId}`}>
              Only {book.quantity} left!
            </span>
          ) : (
            <span className="stock-badge in-stock" id={`book-stock-${book.bookId}`}>
              <CheckCircle2 size={13} /> {book.quantity} in stock
            </span>
          )}
        </div>
      </div>

      <div className="card-actions">
        <button
          id={`view-details-btn-${book.bookId}`}
          type="button"
          className="btn btn-secondary view-details-btn"
          onClick={() => onViewDetails(book.bookId)}
          title="View full details"
        >
          <Eye size={16} />
          <span>Details</span>
        </button>

        {cartQuantity > 0 ? (
          <div className="card-cart-stepper" id={`card-stepper-${book.bookId}`} onClick={(e) => e.stopPropagation()}>
            <button
              id={`card-decrement-btn-${book.bookId}`}
              type="button"
              className="card-stepper-btn minus-btn"
              onClick={handleDecrement}
              title="Decrease quantity"
              aria-label="Decrease quantity"
            >
              <Minus size={15} />
            </button>
            <span className="card-stepper-count" id={`card-stepper-count-${book.bookId}`}>
              {cartQuantity} in Cart
            </span>
            <button
              id={`card-increment-btn-${book.bookId}`}
              type="button"
              className={`card-stepper-btn plus-btn ${isMaxStockInCart ? 'disabled' : ''}`}
              onClick={handleIncrement}
              disabled={isMaxStockInCart}
              title={isMaxStockInCart ? 'Maximum stock reached' : 'Increase quantity'}
              aria-label="Increase quantity"
            >
              <Plus size={15} />
            </button>
          </div>
        ) : (
          <button
            id={`add-to-cart-btn-${book.bookId}`}
            type="button"
            className={`btn btn-primary add-cart-btn ${isOutOfStock ? 'disabled' : ''}`}
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            title={isOutOfStock ? 'Item out of stock' : 'Add to cart'}
          >
            <ShoppingCart size={16} />
            <span>{isOutOfStock ? 'Sold Out' : 'Add to Cart'}</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default BookCard;
