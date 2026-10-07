import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import AdminPage from './pages/AdminPage';
import Cart from './components/Cart';
import CheckoutModal from './components/CheckoutModal';
import Toast from './components/Toast';
import AdminLoginModal from './components/AdminLoginModal';
import { getBooks, isAdminAuthenticated, adminLogout } from './services/api';
import { CartProvider } from './context/CartContext';

function AppContent() {
  const [activeTab, setActiveTab] = useState('user'); // 'user' or 'admin'
  const [adminSubTab, setAdminSubTab] = useState('inventory'); // 'inventory' or 'orders'
  const [pendingAdminSubTab, setPendingAdminSubTab] = useState('inventory');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(() => isAdminAuthenticated());
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);

  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All Categories');

  const [toasts, setToasts] = useState([]);

  // Toast notification helper
  const showToast = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto dismiss after 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const dismissToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Fetch books from backend API
  const fetchBookList = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getBooks({
        search,
        category: category === 'All Categories' ? '' : category
      });
      setBooks(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching books:', err);
      showToast(
        err.response?.data?.message || 'Could not connect to server. Ensure backend is running.',
        'error'
      );
    } finally {
      setLoading(false);
    }
  }, [search, category, showToast]);

  // Debounced search and category filter trigger
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchBookList();
    }, 250);

    return () => clearTimeout(debounceTimer);
  }, [fetchBookList]);

  const handleResetFilters = () => {
    setSearch('');
    setCategory('All Categories');
  };

  // Tab navigation handler with admin password protection
  const handleSelectTab = (tab) => {
    if (tab === 'admin-orders') {
      if (isAdminLoggedIn) {
        setActiveTab('admin');
        setAdminSubTab('orders');
      } else {
        setPendingAdminSubTab('orders');
        setIsAdminLoginOpen(true);
      }
    } else if (tab === 'admin-inventory') {
      if (isAdminLoggedIn) {
        setActiveTab('admin');
        setAdminSubTab('inventory');
      } else {
        setPendingAdminSubTab('inventory');
        setIsAdminLoginOpen(true);
      }
    } else if (tab === 'admin') {
      if (isAdminLoggedIn) {
        setActiveTab('admin');
      } else {
        setPendingAdminSubTab('inventory');
        setIsAdminLoginOpen(true);
      }
    } else {
      setActiveTab('user');
    }
  };

  // Successful admin login callback
  const handleAdminLoginSuccess = () => {
    setIsAdminLoggedIn(true);
    setIsAdminLoginOpen(false);
    setActiveTab('admin');
    setAdminSubTab(pendingAdminSubTab || 'inventory');
  };

  // Admin logout callback
  const handleAdminLogout = () => {
    adminLogout();
    setIsAdminLoggedIn(false);
    setActiveTab('user');
    setAdminSubTab('inventory');
    showToast('Administrator session logged out.', 'info');
  };

  return (
    <div className="app-layout">
      {/* Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        adminSubTab={adminSubTab}
        onSelectTab={handleSelectTab}
        onOpenCart={() => setIsCartOpen(true)}
        isAdminLoggedIn={isAdminLoggedIn}
      />

      {/* Main Content Area */}
      <main className="main-content">
        {activeTab === 'user' ? (
          <HomePage
            books={books}
            loading={loading}
            search={search}
            setSearch={setSearch}
            category={category}
            setCategory={setCategory}
            onResetFilters={handleResetFilters}
            showToast={showToast}
          />
        ) : (
          <AdminPage
            books={books}
            loading={loading}
            onRefreshBooks={fetchBookList}
            onLogout={handleAdminLogout}
            showToast={showToast}
            activeSubTab={adminSubTab}
            onChangeSubTab={(tab) => setAdminSubTab(tab)}
          />
        )}
      </main>

      {/* Shopping Cart Drawer */}
      <Cart
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        showToast={showToast}
        onBrowseBooks={() => {
          setActiveTab('user');
          setIsCartOpen(false);
        }}
        onOpenCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        showToast={showToast}
      />

      {/* Admin Password Login Modal */}
      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onSuccess={handleAdminLoginSuccess}
        showToast={showToast}
      />

      {/* Toast Notifications */}
      <Toast toasts={toasts} onDismiss={dismissToast} />

      {/* Footer */}
      <footer className="footer-container">
        <div className="footer-content">
          <p className="footer-title">
            <strong>Online Book Store</strong> — MERN Stack Assignment 2
          </p>
          <p className="footer-subtext">
            Built with MongoDB, Express.js, React.js, and Node.js. Clean architecture & full CRUD capabilities.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <CartProvider>
      <AppContent />
    </CartProvider>
  );
}
