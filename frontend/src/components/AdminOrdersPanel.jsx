import React, { useState, useEffect, useCallback } from 'react';
import { 
  Package, 
  Search, 
  RefreshCw, 
  Clock, 
  Truck, 
  CheckCircle2, 
  XCircle, 
  Eye, 
  Filter, 
  IndianRupee, 
  TrendingUp, 
  AlertCircle, 
  Calendar,
  CreditCard,
  Banknote,
  QrCode,
  MapPin,
  Trash2,
  ChevronDown
} from 'lucide-react';
import OrderDetailsModal from './OrderDetailsModal';
import { 
  getAdminOrders, 
  getAdminOrderStats, 
  updateAdminOrderStatus, 
  deleteAdminOrder,
  DEFAULT_BOOK_COVER 
} from '../services/api';

const AdminOrdersPanel = ({ showToast }) => {
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('newest');

  // Modal states
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch orders and stats from backend
  const fetchOrdersData = useCallback(async () => {
    try {
      setLoading(true);
      const [ordersRes, statsRes] = await Promise.all([
        getAdminOrders({
          status: statusFilter === 'All' ? '' : statusFilter,
          search,
          paymentMethod: paymentFilter,
          sort: sortOrder
        }),
        getAdminOrderStats().catch(() => null)
      ]);

      setOrders(ordersRes.data || ordersRes || []);
      if (statsRes?.data) {
        setStats(statsRes.data);
      }
    } catch (err) {
      console.error('Error fetching admin orders:', err);
      showToast(
        err.response?.data?.message || 'Could not fetch orders from server.',
        'error'
      );
    } finally {
      setLoading(false);
    }
  }, [statusFilter, search, paymentFilter, sortOrder, showToast]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchOrdersData();
    }, 200);
    return () => clearTimeout(timer);
  }, [fetchOrdersData]);

  // Handle Quick Status Change from row dropdown
  const handleQuickStatusChange = async (orderId, newStatus) => {
    try {
      const res = await updateAdminOrderStatus(orderId, newStatus);
      showToast(`Order #${orderId} status updated to ${newStatus}`, 'success');

      // Update in local state
      setOrders((prev) =>
        prev.map((ord) => (ord.orderId === orderId ? res.data : ord))
      );

      // Refresh stats
      const statsRes = await getAdminOrderStats().catch(() => null);
      if (statsRes?.data) setStats(statsRes.data);

      if (selectedOrder && selectedOrder.orderId === orderId) {
        setSelectedOrder(res.data);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update order status';
      showToast(msg, 'error');
    }
  };

  // Handle Status Update from inside the modal
  const handleModalStatusUpdate = async (orderId, status, note) => {
    const res = await updateAdminOrderStatus(orderId, status, note);
    showToast(`Order #${orderId} tracking status updated to ${status}`, 'success');

    // Update in local list and modal
    setOrders((prev) =>
      prev.map((ord) => (ord.orderId === orderId ? res.data : ord))
    );
    setSelectedOrder(res.data);

    // Refresh stats
    const statsRes = await getAdminOrderStats().catch(() => null);
    if (statsRes?.data) setStats(statsRes.data);
  };

  // Handle Delete Order
  const handleDeleteOrder = async (orderId) => {
    try {
      await deleteAdminOrder(orderId);
      showToast(`Order #${orderId} has been removed.`, 'success');
      setOrders((prev) => prev.filter((ord) => ord.orderId !== orderId));
      if (selectedOrder && selectedOrder.orderId === orderId) {
        setIsModalOpen(false);
        setSelectedOrder(null);
      }

      // Refresh stats
      const statsRes = await getAdminOrderStats().catch(() => null);
      if (statsRes?.data) setStats(statsRes.data);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to delete order';
      showToast(msg, 'error');
      throw err;
    }
  };

  const handleOpenDetails = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const renderStatusBadge = (status) => {
    switch (status) {
      case 'Pending':
        return (
          <span className="order-status-badge status-pending">
            <Clock size={13} /> Pending
          </span>
        );
      case 'Processing':
        return (
          <span className="order-status-badge status-processing">
            <Package size={13} /> Processing
          </span>
        );
      case 'Shipped':
        return (
          <span className="order-status-badge status-shipped">
            <Truck size={13} /> Shipped
          </span>
        );
      case 'Delivered':
        return (
          <span className="order-status-badge status-delivered">
            <CheckCircle2 size={13} /> Delivered
          </span>
        );
      case 'Cancelled':
        return (
          <span className="order-status-badge status-cancelled">
            <XCircle size={13} /> Cancelled
          </span>
        );
      default:
        return <span className="order-status-badge">{status}</span>;
    }
  };

  return (
    <div className="admin-orders-container" id="admin-orders-view">
      {/* Top Header */}
      <div className="admin-header-row">
        <div>
          <div className="admin-auth-indicator">
            <span className="admin-auth-pill">
              <Package size={14} />
              <span>Order Management & Dispatch Hub</span>
            </span>
          </div>
          <h1 className="admin-title">Customer Orders & Tracking</h1>
          <p className="admin-subtitle">
            Track order fulfillment, update live shipment statuses, and view delivery details.
          </p>
        </div>

        <div className="admin-header-actions">
          <button
            id="admin-refresh-orders-btn"
            type="button"
            className="btn btn-secondary"
            onClick={fetchOrdersData}
            title="Refresh order database"
          >
            <RefreshCw size={16} className={loading ? 'spin-icon' : ''} />
            <span>Refresh Orders</span>
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="admin-metrics-grid">
        <div className="metric-card">
          <div className="metric-icon-wrap bg-primary-soft">
            <Package size={22} className="text-primary" />
          </div>
          <div>
            <span className="metric-label">Total Orders</span>
            <h3 className="metric-value" id="metric-total-orders">
              {stats?.totalOrders ?? orders.length}
            </h3>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-wrap bg-warning-soft">
            <Clock size={22} className="text-warning" />
          </div>
          <div>
            <span className="metric-label">Pending Fulfillment</span>
            <h3 className="metric-value" id="metric-pending-orders">
              {stats?.pendingOrders ?? orders.filter((o) => o.orderStatus === 'Pending').length}
            </h3>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-wrap bg-info-soft">
            <Truck size={22} className="text-info" />
          </div>
          <div>
            <span className="metric-label">In Transit / Shipped</span>
            <h3 className="metric-value" id="metric-shipped-orders">
              {stats?.shippedOrders ?? orders.filter((o) => o.orderStatus === 'Shipped').length}
            </h3>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-wrap bg-success-soft">
            <CheckCircle2 size={22} className="text-success" />
          </div>
          <div>
            <span className="metric-label">Delivered Orders</span>
            <h3 className="metric-value" id="metric-delivered-orders">
              {stats?.deliveredOrders ?? orders.filter((o) => o.orderStatus === 'Delivered').length}
            </h3>
          </div>
        </div>

        <div className="metric-card metric-revenue-card">
          <div className="metric-icon-wrap bg-purple-soft">
            <IndianRupee size={22} className="text-purple" />
          </div>
          <div>
            <span className="metric-label">Total Revenue</span>
            <h3 className="metric-value" id="metric-total-revenue">
              ₹{(stats?.totalRevenue ?? orders.reduce((acc, o) => acc + (o.orderStatus !== 'Cancelled' ? o.totalAmount : 0), 0)).toLocaleString('en-IN')}
            </h3>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="admin-orders-filter-card">
        {/* Status Pill Tabs */}
        <div className="orders-status-tabs" id="order-status-tabs">
          {['All', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map((status) => (
            <button
              key={status}
              id={`tab-status-${status.toLowerCase()}`}
              type="button"
              className={`status-tab-btn ${statusFilter === status ? 'active' : ''}`}
              onClick={() => setStatusFilter(status)}
            >
              <span>{status}</span>
              {status === 'Pending' && (stats?.pendingOrders > 0) && (
                <span className="tab-count-badge warning">{stats.pendingOrders}</span>
              )}
            </button>
          ))}
        </div>

        {/* Secondary filters row */}
        <div className="orders-toolbar-row">
          <div className="admin-search-wrap orders-search-box">
            <Search size={16} className="search-icon" />
            <input
              id="admin-order-search-input"
              type="text"
              placeholder="Search by Order ID, customer name, phone, city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="admin-search-input"
            />
          </div>

          <div className="orders-filters-group">
            <div className="filter-select-wrapper">
              <span className="filter-label-prefix">Payment:</span>
              <select
                id="admin-payment-filter"
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
                className="orders-filter-select"
              >
                <option value="all">All Payment Types</option>
                <option value="cod">Cash on Delivery (COD)</option>
                <option value="upi">UPI / QR Code</option>
                <option value="card">Credit / Debit Card</option>
              </select>
            </div>

            <div className="filter-select-wrapper">
              <span className="filter-label-prefix">Sort by:</span>
              <select
                id="admin-sort-filter"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="orders-filter-select"
              >
                <option value="newest">Latest Orders</option>
                <option value="oldest">Oldest Orders</option>
                <option value="amount-high">Highest Amount</option>
                <option value="amount-low">Lowest Amount</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Orders Table Card */}
      <div className="admin-table-card">
        <div className="admin-table-toolbar">
          <span className="table-count-text">
            Showing <strong>{orders.length}</strong> orders
            {statusFilter !== 'All' ? ` with status "${statusFilter}"` : ''}
          </span>
        </div>

        <div className="table-responsive-wrapper">
          <table className="admin-data-table orders-data-table" id="admin-orders-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer & Location</th>
                <th>Date Placed</th>
                <th>Items Ordered</th>
                <th>Total (₹)</th>
                <th>Payment</th>
                <th>Current Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="table-loading-cell">
                    <div className="spinner-sm"></div>
                    <span>Loading customer orders...</span>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan="8" className="table-empty-cell">
                    <div className="empty-orders-view">
                      <Package size={40} className="empty-icon text-muted" />
                      <h4>No orders found</h4>
                      <p>No customer orders match your current filter or search criteria.</p>
                      {(search || statusFilter !== 'All' || paymentFilter !== 'all') && (
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => {
                            setSearch('');
                            setStatusFilter('All');
                            setPaymentFilter('all');
                          }}
                        >
                          Clear Filters
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  const orderDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  });

                  return (
                    <tr key={order.orderId || order._id} id={`order-row-${order.orderId}`}>
                      {/* Order ID */}
                      <td>
                        <button
                          type="button"
                          className="table-order-id-btn"
                          onClick={() => handleOpenDetails(order)}
                          title="Click to track order"
                        >
                          #{order.orderId}
                        </button>
                      </td>

                      {/* Customer & Location */}
                      <td>
                        <div className="order-customer-cell">
                          <strong className="customer-name">{order.customer.fullName}</strong>
                          <span className="customer-location">
                            <MapPin size={12} /> {order.customer.city} ({order.customer.pincode})
                          </span>
                          <span className="customer-phone">{order.customer.phone}</span>
                        </div>
                      </td>

                      {/* Date */}
                      <td className="table-date-cell">
                        <span className="date-text">{orderDate}</span>
                        <span className="time-subtext">
                          {new Date(order.createdAt).toLocaleTimeString('en-IN', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </td>

                      {/* Items */}
                      <td>
                        <div className="order-items-cell">
                          <div className="items-thumb-stack">
                            {order.items.slice(0, 2).map((item, i) => (
                              <img
                                key={i}
                                src={item.image || DEFAULT_BOOK_COVER}
                                alt={item.title}
                                className="item-mini-thumb"
                                onError={(e) => {
                                  e.currentTarget.onerror = null;
                                  e.currentTarget.src = DEFAULT_BOOK_COVER;
                                }}
                              />
                            ))}
                          </div>
                          <div className="items-text-desc">
                            <span className="items-summary-title">
                              {order.items[0]?.title}
                            </span>
                            <span className="items-count-tag">
                              {order.totalItems} {order.totalItems === 1 ? 'book' : 'books'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Total */}
                      <td className="table-price-cell">
                        <strong>₹{order.totalAmount.toLocaleString('en-IN')}</strong>
                      </td>

                      {/* Payment */}
                      <td>
                        <div className="payment-cell-info">
                          <span className="payment-type-pill">
                            {order.paymentMethod === 'cod' ? 'COD' : 
                             order.paymentMethod === 'upi' ? 'UPI' : 'Card'}
                          </span>
                          <span className={`payment-dot ${order.paymentStatus === 'Completed' ? 'paid' : 'pending'}`} title={order.paymentStatus}>
                            {order.paymentStatus === 'Completed' ? 'Paid' : 'Unpaid'}
                          </span>
                        </div>
                      </td>

                      {/* Current Status (View Only) */}
                      <td>
                        <div className="status-view-only-wrap">
                          {renderStatusBadge(order.orderStatus)}
                        </div>
                      </td>

                      {/* Actions */}
                      <td>
                        <div className="table-actions-group">
                          <button
                            id={`view-order-btn-${order.orderId}`}
                            type="button"
                            className="btn btn-secondary btn-xs action-track-btn"
                            onClick={() => handleOpenDetails(order)}
                            title="View tracking and full details"
                          >
                            <Eye size={14} />
                            <span>Track & Details</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details & Tracking Stepper Modal */}
      <OrderDetailsModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedOrder(null);
        }}
        order={selectedOrder}
        onUpdateStatus={handleModalStatusUpdate}
        onDeleteOrder={handleDeleteOrder}
        showToast={showToast}
      />
    </div>
  );
};

export default AdminOrdersPanel;
