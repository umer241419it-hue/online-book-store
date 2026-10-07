import React from 'react';
import { X, ShoppingBag, Trash2, ArrowRight, CreditCard } from 'lucide-react';
import { useCart } from '../context/CartContext';
import CartItem from './CartItem';

const Cart = ({ isOpen, onClose, showToast, onBrowseBooks, onOpenCheckout }) => {
  const { cart, getCartTotal, getCartItemCount, clearCart } = useCart();

  if (!isOpen) return null;

  const totalItems = getCartItemCount();
  const totalPrice = getCartTotal();

  const handleClearAll = () => {
    if (cart.length === 0) return;
    clearCart();
    showToast('Shopping cart cleared.', 'info');
  };

  return (
    <div className="cart-backdrop" onClick={onClose} id="cart-drawer-backdrop">
      <aside 
        className="cart-sidebar"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-title"
        id="cart-drawer"
      >
        <div className="cart-header">
          <div className="cart-header-title-wrap">
            <ShoppingBag size={22} className="cart-header-icon" />
            <h2 id="cart-title" className="cart-heading">YOUR CART</h2>
            <span className="cart-count-pill" id="cart-drawer-item-count">
              {totalItems} {totalItems === 1 ? 'item' : 'items'}
            </span>
          </div>
          <button
            id="close-cart-btn"
            type="button"
            className="cart-close-btn"
            onClick={onClose}
            aria-label="Close cart"
          >
            <X size={20} />
          </button>
        </div>

        <div className="cart-body">
          {cart.length === 0 ? (
            <div className="empty-cart-state" id="empty-cart-view">
              <div className="empty-cart-icon-wrap">
                <ShoppingBag size={48} />
              </div>
              <h3 className="empty-cart-title">Your cart is empty</h3>
              <p className="empty-cart-desc">
                Looks like you haven't added any books to your cart yet. Explore our collection to find something interesting!
              </p>
              <button
                id="cart-start-shopping-btn"
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  onClose();
                  if (onBrowseBooks) onBrowseBooks();
                }}
              >
                <span>Browse Books</span>
                <ArrowRight size={16} />
              </button>
            </div>
          ) : (
            <div className="cart-items-list" id="cart-items-container">
              {cart.map((item) => (
                <CartItem
                  key={item.book.bookId}
                  item={item}
                  showToast={showToast}
                />
              ))}
            </div>
          )}
        </div>

        {cart.length > 0 && (
          <div className="cart-footer">
            <div className="cart-total-box">
              <div className="cart-total-row">
                <span className="total-label">TOTAL:</span>
                <span className="total-value" id="cart-total-amount">
                  ₹{totalPrice.toLocaleString('en-IN')}
                </span>
              </div>
              <p className="cart-tax-notice">
                * Cart state is automatically saved locally in your browser.
              </p>
            </div>

            <div className="cart-checkout-action-row">
              <button
                id="proceed-to-checkout-btn"
                type="button"
                className="btn btn-primary checkout-proceed-btn"
                onClick={() => {
                  if (onOpenCheckout) {
                    onOpenCheckout();
                  }
                }}
              >
                <CreditCard size={18} />
                <span>Proceed to Checkout (₹{totalPrice.toLocaleString('en-IN')})</span>
                <ArrowRight size={16} />
              </button>
            </div>

            <div className="cart-footer-buttons">
              <button
                id="clear-entire-cart-btn"
                type="button"
                className="btn btn-secondary clear-cart-btn"
                onClick={handleClearAll}
              >
                <Trash2 size={16} />
                <span>Clear Cart</span>
              </button>

              <button
                id="continue-shopping-btn"
                type="button"
                className="btn btn-secondary continue-btn"
                onClick={onClose}
              >
                <span>Continue Shopping</span>
              </button>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
};

export default Cart;
