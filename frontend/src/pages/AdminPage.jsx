import React, { useState, useEffect } from 'react';
import { BookOpen, Package, ShieldCheck, LogOut, RefreshCw } from 'lucide-react';
import AdminPanel from '../components/AdminPanel';
import AdminOrdersPanel from '../components/AdminOrdersPanel';
import { getAdminOrderStats } from '../services/api';

const AdminPage = ({ 
  books, 
  loading, 
  onRefreshBooks, 
  onLogout, 
  showToast, 
  activeSubTab = 'inventory',
  onChangeSubTab
}) => {
  const [subTab, setSubTab] = useState(activeSubTab);
  const [pendingCount, setPendingCount] = useState(0);

  // Sync with prop if provided
  useEffect(() => {
    if (activeSubTab) {
      setSubTab(activeSubTab);
    }
  }, [activeSubTab]);

  // Fetch pending orders count for the badge
  const fetchPendingCount = async () => {
    try {
      const statsRes = await getAdminOrderStats();
      if (statsRes?.data) {
        setPendingCount(statsRes.data.pendingOrders || 0);
      }
    } catch (err) {
      // Non-critical, ignore
    }
  };

  useEffect(() => {
    fetchPendingCount();
    const interval = setInterval(fetchPendingCount, 15000); // Poll badge every 15s
    return () => clearInterval(interval);
  }, []);

  const handleSwitchTab = (tab) => {
    setSubTab(tab);
    if (onChangeSubTab) {
      onChangeSubTab(tab);
    }
  };

  return (
    <div className="admin-page-wrapper">
      {/* Admin Top Master Sub-navigation Bar */}
      <nav className="admin-subnav-bar" id="admin-subnav-bar" aria-label="Admin Navigation">
        <div className="admin-subnav-left">
          <div className="admin-auth-badge-glow">
            <ShieldCheck size={16} className="text-primary" />
            <span>Administrator Portal</span>
          </div>
        </div>

        <div className="admin-subnav-tabs">
          <button
            id="admin-tab-inventory-btn"
            type="button"
            className={`admin-subtab-btn ${subTab === 'inventory' ? 'active' : ''}`}
            onClick={() => handleSwitchTab('inventory')}
          >
            <BookOpen size={17} />
            <span>Book Inventory</span>
            <span className="subtab-count-pill">{books.length}</span>
          </button>

          <button
            id="admin-tab-orders-btn"
            type="button"
            className={`admin-subtab-btn ${subTab === 'orders' ? 'active' : ''}`}
            onClick={() => handleSwitchTab('orders')}
          >
            <Package size={17} />
            <span>Track Orders</span>
            {pendingCount > 0 && (
              <span className="subtab-count-pill badge-pending-alert" title={`${pendingCount} pending orders require fulfillment`}>
                {pendingCount}
              </span>
            )}
          </button>
        </div>

        <div className="admin-subnav-right">
          <button
            id="admin-nav-logout-btn"
            type="button"
            className="btn btn-secondary btn-sm logout-btn"
            onClick={onLogout}
            title="Log out of Admin session"
          >
            <LogOut size={15} />
            <span>Logout</span>
          </button>
        </div>
      </nav>

      {/* Main Admin Tab View Content */}
      <div className="admin-tab-content-area">
        {subTab === 'inventory' ? (
          <AdminPanel
            books={books}
            loading={loading}
            onRefreshBooks={onRefreshBooks}
            onLogout={onLogout}
            showToast={showToast}
          />
        ) : (
          <AdminOrdersPanel showToast={showToast} />
        )}
      </div>
    </div>
  );
};

export default AdminPage;
