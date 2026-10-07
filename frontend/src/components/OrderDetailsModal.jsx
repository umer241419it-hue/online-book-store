import React, { useState } from 'react';
import { 
  X, 
  Package, 
  Clock, 
  Truck, 
  CheckCircle2, 
  XCircle, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Building2, 
  Hash, 
  Home, 
  Briefcase, 
  Compass, 
  CreditCard, 
  Banknote, 
  QrCode, 
  Calendar, 
  RefreshCw, 
  Printer, 
  Trash2,
  AlertTriangle,
  SendHorizontal
} from 'lucide-react';
import { DEFAULT_BOOK_COVER } from '../services/api';

const OrderDetailsModal = ({ 
  isOpen, 
  onClose, 
  order, 
  onUpdateStatus, 
  onDeleteOrder, 
  showToast 
}) => {
  const [selectedStatus, setSelectedStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Sync selectedStatus with current order status on open
  React.useEffect(() => {
    if (order) {
      setSelectedStatus(order.orderStatus);
      setStatusNote('');
      setShowDeleteConfirm(false);
    }
  }, [order]);

  if (!isOpen || !order) return null;

  const handleStatusSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStatus) return;

    if (selectedStatus === order.orderStatus && !statusNote.trim()) {
      showToast('Status is already set to ' + selectedStatus, 'info');
      return;
    }

    try {
      setIsUpdating(true);
      await onUpdateStatus(order.orderId, selectedStatus, statusNote.trim());
      setStatusNote('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      setIsDeleting(true);
      await onDeleteOrder(order.orderId);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePrintReceipt = () => {
    if (!order) return;

    const formattedDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const paymentMethodLabel = 
      order.paymentMethod === 'cod' ? 'Cash on Delivery (COD)' :
      order.paymentMethod === 'upi' ? 'UPI / QR Payment' : 'Credit / Debit Card';

    const itemsRows = order.items.map((item, idx) => `
      <tr>
        <td style="text-align: center; color: #64748b; font-weight: 600;">${idx + 1}</td>
        <td>
          <div style="font-weight: 700; color: #0f172a; font-size: 13px;">${item.title}</div>
          ${item.author ? `<div style="font-size: 11px; color: #64748b;">Author: ${item.author}</div>` : ''}
          <div style="font-size: 10px; color: #4f46e5; font-family: monospace;">Book ID: ${item.bookId}</div>
        </td>
        <td style="text-align: center; font-weight: 700;">${item.quantity}</td>
        <td style="text-align: right; font-weight: 600;">₹${Number(item.price).toLocaleString('en-IN')}</td>
        <td style="text-align: right; font-weight: 700; color: #0f172a;">₹${(item.price * item.quantity).toLocaleString('en-IN')}</td>
      </tr>
    `).join('');

    const invoiceHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Invoice #${order.orderId} - BookHaven</title>
        <style>
          @page {
            size: A4 portrait;
            margin: 12mm 15mm;
          }
          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            color: #0f172a;
            background: #ffffff;
            padding: 0;
            line-height: 1.45;
            font-size: 12px;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .invoice-card {
            width: 100%;
            max-width: 100%;
            margin: 0 auto;
          }
          .header-table {
            width: 100%;
            border-bottom: 2px solid #4f46e5;
            padding-bottom: 12px;
            margin-bottom: 14px;
          }
          .brand-name {
            font-size: 22px;
            font-weight: 800;
            color: #1e1b4b;
            letter-spacing: -0.5px;
          }
          .brand-sub {
            font-size: 11px;
            color: #64748b;
            font-weight: 600;
            margin-top: 2px;
          }
          .invoice-title-block {
            text-align: right;
          }
          .invoice-main-title {
            font-size: 18px;
            font-weight: 800;
            color: #4f46e5;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .invoice-ref {
            font-size: 13px;
            font-weight: 700;
            color: #0f172a;
            font-family: monospace;
            margin-top: 2px;
          }
          .invoice-date {
            font-size: 11px;
            color: #64748b;
            margin-top: 2px;
          }
          .info-grid-table {
            width: 100%;
            margin-bottom: 16px;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            background: #f8fafc;
            border-collapse: separate;
          }
          .info-col {
            width: 50%;
            padding: 10px 14px;
            vertical-align: top;
          }
          .info-col:first-child {
            border-right: 1px solid #e2e8f0;
          }
          .info-heading {
            font-size: 10px;
            font-weight: 800;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 5px;
          }
          .info-name {
            font-size: 13px;
            font-weight: 700;
            color: #0f172a;
            margin-bottom: 2px;
          }
          .info-text {
            font-size: 11px;
            color: #334155;
            line-height: 1.4;
          }
          .badge {
            display: inline-block;
            font-size: 9.5px;
            font-weight: 700;
            padding: 2px 7px;
            border-radius: 4px;
            margin-top: 4px;
          }
          .badge-paid {
            background: #dcfce7;
            color: #15803d;
          }
          .badge-pending {
            background: #fef3c7;
            color: #b45309;
          }
          .badge-status {
            background: #e0e7ff;
            color: #4338ca;
          }
          .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 16px;
          }
          .items-table th {
            background: #f1f5f9;
            border-top: 1px solid #cbd5e1;
            border-bottom: 2px solid #cbd5e1;
            padding: 8px 10px;
            font-size: 10px;
            font-weight: 800;
            text-transform: uppercase;
            color: #475569;
            letter-spacing: 0.5px;
            text-align: left;
          }
          .items-table td {
            padding: 8px 10px;
            border-bottom: 1px solid #e2e8f0;
            font-size: 11.5px;
            vertical-align: middle;
          }
          .totals-section {
            width: 100%;
            margin-bottom: 16px;
          }
          .totals-table {
            width: 270px;
            margin-left: auto;
            border-collapse: collapse;
          }
          .totals-table td {
            padding: 4px 6px;
            font-size: 11.5px;
          }
          .totals-label {
            color: #64748b;
            font-weight: 600;
            text-align: left;
          }
          .totals-val {
            text-align: right;
            font-weight: 700;
            color: #0f172a;
          }
          .grand-total-row td {
            border-top: 2px solid #0f172a;
            border-bottom: 2px solid #0f172a;
            padding: 6px 6px;
            font-size: 13.5px;
            font-weight: 800;
            color: #4f46e5;
          }
          .footer-note {
            border-top: 1px dashed #cbd5e1;
            padding-top: 12px;
            text-align: center;
            font-size: 10px;
            color: #64748b;
            line-height: 1.5;
          }
          .footer-bold {
            font-weight: 700;
            color: #0f172a;
          }
        </style>
      </head>
      <body>
        <div class="invoice-card">
          <table class="header-table" cellpadding="0" cellspacing="0">
            <tr>
              <td>
                <div class="brand-name">BOOKHAVEN</div>
                <div class="brand-sub">Online Book Store &bull; Quality Reads Delivered</div>
              </td>
              <td class="invoice-title-block">
                <div class="invoice-main-title">Tax Invoice / Receipt</div>
                <div class="invoice-ref">#${order.orderId}</div>
                <div class="invoice-date">${formattedDate}</div>
              </td>
            </tr>
          </table>

          <table class="info-grid-table" cellpadding="0" cellspacing="0">
            <tr>
              <td class="info-col">
                <div class="info-heading">Customer & Shipping Destination</div>
                <div class="info-name">${order.customer.fullName}</div>
                <div class="info-text">${order.customer.address}</div>
                ${order.customer.landmark ? `<div class="info-text">Landmark: ${order.customer.landmark}</div>` : ''}
                <div class="info-text"><strong>${order.customer.city} - ${order.customer.pincode}</strong></div>
                <div class="info-text" style="margin-top: 3px;">Phone: ${order.customer.phone}</div>
                <div class="info-text">Email: ${order.customer.email}</div>
                <div class="badge badge-status" style="margin-top: 5px; text-transform: uppercase;">Destination: ${order.customer.addressType || 'Home'}</div>
              </td>
              <td class="info-col">
                <div class="info-heading">Order & Payment Overview</div>
                <div class="info-text" style="margin-bottom: 4px;">
                  <strong>Tracking Status:</strong>
                  <span class="badge badge-status">${order.orderStatus}</span>
                </div>
                <div class="info-text" style="margin-bottom: 4px;">
                  <strong>Payment Mode:</strong> ${paymentMethodLabel}
                </div>
                <div class="info-text" style="margin-bottom: 4px;">
                  <strong>Payment Status:</strong> 
                  <span class="badge ${order.paymentStatus === 'Completed' ? 'badge-paid' : 'badge-pending'}">
                    ${order.paymentStatus === 'Completed' ? 'PAID' : 'PENDING ON DELIVERY'}
                  </span>
                </div>
                <div class="info-text" style="margin-top: 5px;">
                  <strong>Total Quantity:</strong> ${order.totalItems} books
                </div>
              </td>
            </tr>
          </table>

          <table class="items-table" cellpadding="0" cellspacing="0">
            <thead>
              <tr>
                <th style="width: 32px; text-align: center;">#</th>
                <th>Item Description</th>
                <th style="width: 55px; text-align: center;">Qty</th>
                <th style="width: 95px; text-align: right;">Unit Price (₹)</th>
                <th style="width: 105px; text-align: right;">Total Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              ${itemsRows}
            </tbody>
          </table>

          <div class="totals-section">
            <table class="totals-table" cellpadding="0" cellspacing="0">
              <tr>
                <td class="totals-label">Items Subtotal:</td>
                <td class="totals-val">₹${Number(order.totalAmount).toLocaleString('en-IN')}</td>
              </tr>
              <tr>
                <td class="totals-label">Shipping & Delivery:</td>
                <td class="totals-val" style="color: #16a34a;">FREE</td>
              </tr>
              <tr>
                <td class="totals-label">Taxes (GST Included):</td>
                <td class="totals-val">₹0.00</td>
              </tr>
              <tr class="grand-total-row">
                <td>Grand Total:</td>
                <td style="text-align: right;">₹${Number(order.totalAmount).toLocaleString('en-IN')}</td>
              </tr>
            </table>
          </div>

          <div class="footer-note">
            <div class="footer-bold">Thank you for shopping with BookHaven!</div>
            <div>For order support or assistance, email us at support@bookhaven.store</div>
            <div style="font-size: 9px; color: #94a3b8; margin-top: 3px;">
              This is a computer-generated tax invoice. No physical signature is required.
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    // Hidden iframe printing engine
    let printFrame = document.getElementById('print-invoice-frame');
    if (!printFrame) {
      printFrame = document.createElement('iframe');
      printFrame.id = 'print-invoice-frame';
      printFrame.style.position = 'fixed';
      printFrame.style.right = '0';
      printFrame.style.bottom = '0';
      printFrame.style.width = '0';
      printFrame.style.height = '0';
      printFrame.style.border = '0';
      printFrame.style.visibility = 'hidden';
      document.body.appendChild(printFrame);
    }

    try {
      const frameDoc = printFrame.contentWindow.document;
      frameDoc.open();
      frameDoc.write(invoiceHtml);
      frameDoc.close();

      setTimeout(() => {
        printFrame.contentWindow.focus();
        printFrame.contentWindow.print();
      }, 250);
    } catch (err) {
      console.warn('Iframe print fallback to window.print():', err);
      window.print();
    }
  };

  // Status helper mapping
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Pending':
        return (
          <span className="order-status-badge status-pending">
            <Clock size={14} /> Pending
          </span>
        );
      case 'Processing':
        return (
          <span className="order-status-badge status-processing">
            <Package size={14} /> Processing
          </span>
        );
      case 'Shipped':
        return (
          <span className="order-status-badge status-shipped">
            <Truck size={14} /> Shipped
          </span>
        );
      case 'Delivered':
        return (
          <span className="order-status-badge status-delivered">
            <CheckCircle2 size={14} /> Delivered
          </span>
        );
      case 'Cancelled':
        return (
          <span className="order-status-badge status-cancelled">
            <XCircle size={14} /> Cancelled
          </span>
        );
      default:
        return <span className="order-status-badge">{status}</span>;
    }
  };

  // Determine active steps for the visual timeline stepper
  const steps = [
    { key: 'Pending', label: 'Order Placed', icon: Clock },
    { key: 'Processing', label: 'Processing & Packed', icon: Package },
    { key: 'Shipped', label: 'Shipped & In Transit', icon: Truck },
    { key: 'Delivered', label: 'Delivered to Doorstep', icon: CheckCircle2 }
  ];

  const statusRanks = {
    Pending: 1,
    Processing: 2,
    Shipped: 3,
    Delivered: 4,
    Cancelled: 0
  };

  const currentRank = statusRanks[order.orderStatus] || 1;
  const isCancelled = order.orderStatus === 'Cancelled';

  const formattedDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="modal-backdrop" onClick={onClose} id="order-details-modal-backdrop">
      <div 
        className="modal-content order-details-modal printable-order-receipt"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="order-details-title"
      >
        <button 
          id="close-order-details-btn"
          className="modal-close-btn no-print" 
          onClick={onClose}
          aria-label="Close modal"
        >
          <X size={20} />
        </button>

        {/* Modal Header */}
        <div className="order-modal-header">
          <div className="order-modal-title-wrap">
            <div className="order-id-pill-wrap">
              <span className="order-id-label">ORDER</span>
              <h2 id="order-details-title" className="order-id-value">#{order.orderId}</h2>
              {getStatusBadge(order.orderStatus)}
            </div>
            <p className="order-timestamp">
              <Calendar size={14} />
              <span>Placed on {formattedDate}</span>
            </p>
          </div>

          <div className="order-header-actions no-print">
            <button 
              id="print-order-receipt-btn"
              type="button" 
              className="btn btn-secondary btn-sm"
              onClick={handlePrintReceipt}
              title="Print Order Receipt / Invoice"
            >
              <Printer size={15} />
              <span>Print Invoice</span>
            </button>
            <button 
              id="delete-order-btn"
              type="button" 
              className="btn btn-danger-soft btn-sm"
              onClick={() => setShowDeleteConfirm(true)}
              title="Delete Order Record"
            >
              <Trash2 size={15} />
              <span>Delete</span>
            </button>
          </div>
        </div>

        {/* Delete Confirmation Box */}
        {showDeleteConfirm && (
          <div className="order-delete-alert-box no-print">
            <div className="alert-content">
              <AlertTriangle size={20} className="text-danger" />
              <div>
                <strong>Confirm Deletion of Order #{order.orderId}?</strong>
                <p>This action cannot be undone. The order and its tracking logs will be permanently removed.</p>
              </div>
            </div>
            <div className="alert-actions">
              <button 
                type="button" 
                className="btn btn-secondary btn-sm"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="btn btn-danger btn-sm"
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Yes, Delete Order'}
              </button>
            </div>
          </div>
        )}

        {/* Visual Progress Stepper */}
        {!isCancelled ? (
          <div className="order-progress-stepper">
            {steps.map((s, idx) => {
              const stepNumber = idx + 1;
              const isCompleted = currentRank > stepNumber;
              const isCurrent = currentRank === stepNumber;
              const StepIcon = s.icon;

              return (
                <div 
                  key={s.key} 
                  className={`stepper-step ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}
                >
                  <div className="stepper-circle">
                    <StepIcon size={16} />
                  </div>
                  <span className="stepper-label">{s.label}</span>
                  {idx < steps.length - 1 && <div className="stepper-line" />}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="cancelled-banner">
            <XCircle size={22} className="text-danger" />
            <div>
              <strong>Order Cancelled</strong>
              <p>This order was marked as cancelled. Inventory has been restocked.</p>
            </div>
          </div>
        )}

        {/* Admin Quick Status Update Form (No print) */}
        <div className="order-status-update-card no-print">
          <div className="status-update-header">
            <RefreshCw size={16} className="text-primary" />
            <span className="status-update-title">Update Tracking Status</span>
          </div>

          <form onSubmit={handleStatusSubmit} className="status-update-form">
            <div className="status-select-wrap">
              <select 
                id="update-order-status-select"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="status-dropdown-control"
              >
                <option value="Pending">Pending (Awaiting fulfillment)</option>
                <option value="Processing">Processing (Packing books)</option>
                <option value="Shipped">Shipped (In transit)</option>
                <option value="Delivered">Delivered (Handed over)</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            <div className="status-note-input-wrap">
              <input 
                id="update-status-note-input"
                type="text"
                placeholder="Optional tracking note (e.g. Courier tracking # or hub update)"
                value={statusNote}
                onChange={(e) => setStatusNote(e.target.value)}
                className="status-note-control"
              />
            </div>

            <button 
              id="submit-status-update-btn"
              type="submit" 
              className="btn btn-primary status-submit-btn"
              disabled={isUpdating}
            >
              <SendHorizontal size={15} />
              <span>{isUpdating ? 'Updating...' : 'Update Status'}</span>
            </button>
          </form>
        </div>

        {/* Customer & Delivery Grid */}
        <div className="order-info-columns-grid">
          {/* Customer / Shipping Address */}
          <div className="order-info-card">
            <h4 className="info-card-title">
              <User size={16} />
              <span>Customer Details</span>
            </h4>
            <div className="customer-info-list">
              <div className="info-item">
                <span className="info-label">Full Name:</span>
                <span className="info-value text-bold">{order.customer.fullName}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Email:</span>
                <span className="info-value info-link">
                  <Mail size={13} /> {order.customer.email}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Phone:</span>
                <span className="info-value">
                  <Phone size={13} /> {order.customer.phone}
                </span>
              </div>
            </div>
          </div>

          {/* Delivery Address */}
          <div className="order-info-card">
            <div className="info-card-header-between">
              <h4 className="info-card-title">
                <MapPin size={16} />
                <span>Shipping Destination</span>
              </h4>
              <span className="address-type-tag">
                {order.customer.addressType === 'work' ? (
                  <><Briefcase size={12} /> Work</>
                ) : (
                  <><Home size={12} /> Home</>
                )}
              </span>
            </div>
            <div className="address-display-box">
              <p className="address-line">{order.customer.address}</p>
              {order.customer.landmark && (
                <p className="landmark-line">
                  <Compass size={13} /> Landmark: {order.customer.landmark}
                </p>
              )}
              <p className="city-pincode-line">
                <Building2 size={13} /> {order.customer.city} — {order.customer.pincode}
              </p>
            </div>
          </div>

          {/* Payment Information */}
          <div className="order-info-card">
            <h4 className="info-card-title">
              <CreditCard size={16} />
              <span>Payment & Billing</span>
            </h4>
            <div className="payment-info-list">
              <div className="info-item">
                <span className="info-label">Method:</span>
                <span className="payment-method-chip">
                  {order.paymentMethod === 'cod' && <Banknote size={14} />}
                  {order.paymentMethod === 'upi' && <QrCode size={14} />}
                  {order.paymentMethod === 'card' && <CreditCard size={14} />}
                  <span>
                    {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 
                     order.paymentMethod === 'upi' ? 'UPI / QR Payment' : 'Credit / Debit Card'}
                  </span>
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Payment Status:</span>
                <span className={`payment-status-pill ${order.paymentStatus === 'Completed' ? 'status-paid' : 'status-unpaid'}`}>
                  {order.paymentStatus === 'Completed' ? '✓ Paid' : '⏳ Pending on Delivery'}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Total Items:</span>
                <span className="info-value">{order.totalItems} books</span>
              </div>
            </div>
          </div>
        </div>

        {/* Ordered Books Table */}
        <div className="order-items-table-wrapper">
          <h4 className="items-section-title">
            <Package size={16} />
            <span>Ordered Items ({order.items.length})</span>
          </h4>

          <table className="order-items-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Price</th>
                <th>Quantity</th>
                <th className="text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, idx) => (
                <tr key={idx}>
                  <td className="item-details-cell">
                    <img 
                      src={item.image || DEFAULT_BOOK_COVER} 
                      alt={item.title}
                      className="order-item-image"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = DEFAULT_BOOK_COVER;
                      }}
                    />
                    <div className="item-text-info">
                      <strong className="item-name">{item.title}</strong>
                      {item.author && <span className="item-author">by {item.author}</span>}
                      <span className="item-id-badge">ID: {item.bookId}</span>
                    </div>
                  </td>
                  <td>₹{item.price.toLocaleString('en-IN')}</td>
                  <td>
                    <span className="item-qty-tag">× {item.quantity}</span>
                  </td>
                  <td className="text-right item-row-total">
                    ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan="3" className="text-right footer-label">Subtotal:</td>
                <td className="text-right">₹{order.totalAmount.toLocaleString('en-IN')}</td>
              </tr>
              <tr>
                <td colSpan="3" className="text-right footer-label">Shipping / Delivery:</td>
                <td className="text-right text-success font-bold">FREE</td>
              </tr>
              <tr className="grand-total-row">
                <td colSpan="3" className="text-right grand-label">Grand Total:</td>
                <td className="text-right grand-value" id="order-modal-grand-total">
                  ₹{order.totalAmount.toLocaleString('en-IN')}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Tracking Logs History */}
        {order.trackingHistory && order.trackingHistory.length > 0 && (
          <div className="tracking-timeline-box">
            <h4 className="timeline-title">
              <Clock size={16} />
              <span>Tracking History & Status Log</span>
            </h4>

            <div className="timeline-feed">
              {order.trackingHistory.slice().reverse().map((log, index) => {
                const logDate = new Date(log.timestamp).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                });

                return (
                  <div key={index} className="timeline-entry">
                    <div className="timeline-bullet" />
                    <div className="timeline-entry-content">
                      <div className="timeline-entry-header">
                        <span className="timeline-status-name">{log.status}</span>
                        <span className="timeline-time">{logDate}</span>
                      </div>
                      {log.note && <p className="timeline-note">{log.note}</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderDetailsModal;
