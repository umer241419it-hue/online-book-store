import React, { useState, useEffect } from 'react';
import { BookOpen, ShoppingBag, ShieldCheck, Library, Lock } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { getAdminOrderStats } from '../services/api';

const Navbar = ({ activeTab, onSelectTab, onOpenCart, isAdminLoggedIn }) => {
  const { getCartItemCount } = useCart();
  const itemCount = getCartItemCount();
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);

  // Poll pending orders count if admin is logged in
  useEffect(() => {
    if (!isAdminLoggedIn) {
      setPendingOrdersCount(0);
      return;
    }

    let isMounted = true;
    const fetchCount = async () => {
      try {
        const res = await getAdminOrderStats();
        if (isMounted && res?.data) {
          setPendingOrdersCount(res.data.pendingOrders || 0);
        }
      } catch (e) {
        // Ignore background errors
      }
    };

    fetchCount();
    const interval = setInterval(fetchCount, 20000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [isAdminLoggedIn]);

  return (
    <header className="navbar-container" id="main-navbar">
      <div className="navbar-content">
        <div 
          className="brand-logo" 
          id="nav-brand" 
          onClick={() => onSelectTab('user')}
          role="button"
          tabIndex={0}
        >
          <div className="logo-icon-wrapper">
            <BookOpen className="logo-icon" size={24} />
          </div>
          <div className="brand-text">
            <span className="brand-title">BOOKHAVEN</span>
            <span className="brand-subtitle">Online Book Store</span>
          </div>
        </div>

        <nav className="nav-actions">
          <div className="tab-pill-group" id="nav-tabs">
            {/* Browse Books Storefront */}
            <button
              id="tab-user-store"
              className={`nav-tab-btn ${activeTab === 'user' ? 'active' : ''}`}
              onClick={() => onSelectTab('user')}
            >
              <Library size={18} />
              <span>Browse Books</span>
            </button>

            {/* Admin Panel (Single entry on main header) */}
            <button
              id="tab-admin-panel"
              className={`nav-tab-btn ${activeTab === 'admin' ? 'active' : ''}`}
              onClick={() => onSelectTab('admin')}
              title={isAdminLoggedIn ? 'Admin Panel (Logged In)' : 'Admin Panel (Password Required)'}
            >
              {isAdminLoggedIn ? <ShieldCheck size={18} className="text-primary" /> : <Lock size={16} />}
              <span>Admin Panel</span>
              {isAdminLoggedIn && pendingOrdersCount > 0 && (
                <span className="nav-badge-pending" title={`${pendingOrdersCount} pending orders to fulfill`}>
                  {pendingOrdersCount}
                </span>
              )}
            </button>
          </div>

          <button
            id="nav-cart-btn"
            className="cart-nav-btn"
            onClick={onOpenCart}
            aria-label="View shopping cart"
          >
            <div className="cart-icon-wrapper">
              <ShoppingBag size={20} />
              {itemCount > 0 && (
                <span className="cart-badge-pill" id="cart-item-count-badge">
                  {itemCount}
                </span>
              )}
            </div>
            <span className="cart-nav-text">Cart</span>
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
