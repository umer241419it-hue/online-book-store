import React from 'react';
import { Trash2, Plus, Minus, AlertCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { DEFAULT_BOOK_COVER } from '../services/api';

const CartItem = ({ item, showToast }) => {
  const { incrementQuantity, decrementQuantity, removeFromCart } = useCart();
  const { book, quantity } = item;
  const itemTotal = book.price * quantity;
  const isMaxStockReached = quantity >= book.quantity;

  const handleIncrement = () => {
    const result = incrementQuantity(book.bookId);
    if (!result.success) {
      showToast(result.message, 'warning');
    }
  };

  const handleDecrement = () => {
    decrementQuantity(book.bookId);
  };

  const handleRemove = () => {
    removeFromCart(book.bookId);
    showToast(`Removed "${book.title}" from cart.`, 'info');
  };

  return (
    <div className="cart-item-card" id={`cart-item-${book.bookId}`}>
      <div className="cart-item-header">
        <img
          src={book.image || DEFAULT_BOOK_COVER}
          alt={book.title}
          className="cart-item-thumb"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = DEFAULT_BOOK_COVER;
          }}
          loading="lazy"
        />

        <div className="cart-item-title-col">
          <h4 className="cart-book-title" id={`cart-item-title-${book.bookId}`}>
            {book.title}
          </h4>
          <span className="cart-book-author">by {book.author}</span>
          <span className="cart-unit-price">
            ₹{book.price.toLocaleString('en-IN')} each
          </span>
        </div>

        <button
          type="button"
          id={`cart-remove-btn-${book.bookId}`}
          className="cart-remove-item-btn"
          onClick={handleRemove}
          title="Remove from cart"
          aria-label={`Remove ${book.title} from cart`}
        >
          <Trash2 size={16} />
        </button>
      </div>

      <div className="cart-item-controls-row">
        <div className="cart-quantity-selector">
          <button
            type="button"
            id={`cart-decrement-btn-${book.bookId}`}
            className="qty-btn"
            onClick={handleDecrement}
            title={quantity === 1 ? 'Remove from cart' : 'Decrease quantity'}
            aria-label="Decrease quantity"
          >
            <Minus size={14} />
          </button>
          <span
            className="qty-display-number"
            id={`cart-qty-val-${book.bookId}`}
          >
            {quantity}
          </span>
          <button
            type="button"
            id={`cart-increment-btn-${book.bookId}`}
            className={`qty-btn ${isMaxStockReached ? 'disabled' : ''}`}
            onClick={handleIncrement}
            disabled={isMaxStockReached}
            title={
              isMaxStockReached
                ? `Maximum stock limit (${book.quantity}) reached`
                : 'Increase quantity'
            }
            aria-label="Increase quantity"
          >
            <Plus size={14} />
          </button>
        </div>

        <div className="cart-subtotal-block">
          <span className="subtotal-label">Subtotal:</span>
          <span
            className="subtotal-amount"
            id={`cart-subtotal-${book.bookId}`}
          >
            ₹{itemTotal.toLocaleString('en-IN')}
          </span>
        </div>
      </div>

      {isMaxStockReached && (
        <div className="stock-limit-note">
          <AlertCircle size={12} />
          <span>Maximum available stock ({book.quantity}) in cart</span>
        </div>
      )}
    </div>
  );
};

export default CartItem;
