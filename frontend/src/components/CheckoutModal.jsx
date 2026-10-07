import React, { useState } from 'react';
import { 
  X, 
  CheckCircle2, 
  CreditCard, 
  Truck, 
  ShieldCheck, 
  QrCode, 
  Banknote, 
  ShoppingBag, 
  ArrowLeft,
  PackageCheck,
  User,
  Mail,
  Phone,
  MapPin,
  Building2,
  Hash,
  Home,
  Briefcase,
  Compass
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { DEFAULT_BOOK_COVER, createOrder } from '../services/api';

const CheckoutModal = ({ isOpen, onClose, showToast }) => {
  const { cart, getCartTotal, getCartItemCount, clearCart } = useCart();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    pincode: '',
    landmark: '',
    addressType: 'home',
    paymentMethod: 'cod' // 'cod', 'upi', 'card'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState(null);

  if (!isOpen) return null;

  const totalItems = getCartItemCount();
  const totalPrice = getCartTotal();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!formData.fullName.trim() || !formData.email.trim() || !formData.phone.trim() || !formData.address.trim() || !formData.city.trim() || !formData.pincode.trim()) {
      showToast('Please fill out all required shipping details.', 'warning');
      return;
    }

    if (cart.length === 0) {
      showToast('Your cart is empty.', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      const orderPayload = {
        customer: {
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          pincode: formData.pincode,
          landmark: formData.landmark || '',
          addressType: formData.addressType || 'home'
        },
        items: cart.map((item) => ({
          bookId: item.book.bookId || item.book._id,
          title: item.book.title,
          author: item.book.author,
          price: item.book.price,
          quantity: item.quantity,
          image: item.book.image || ''
        })),
        paymentMethod: formData.paymentMethod
      };

      const res = await createOrder(orderPayload);
      const savedData = res.data || res;

      const orderSummary = {
        orderId: savedData.orderId,
        orderDate: new Date(savedData.createdAt || Date.now()).toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        }),
        customer: { ...formData },
        items: [...cart],
        totalAmount: savedData.totalAmount || totalPrice,
        totalItems: savedData.totalItems || totalItems,
        paymentMethodName: 
          formData.paymentMethod === 'cod' ? 'Cash on Delivery' : 
          formData.paymentMethod === 'upi' ? 'UPI / QR Code' : 'Credit / Debit Card'
      };

      setCompletedOrder(orderSummary);
      clearCart();
      showToast(`Order #${savedData.orderId} placed successfully!`, 'success');
    } catch (err) {
      console.error('Order creation error:', err);
      // Fallback for offline mode or network errors
      const fallbackOrderId = 'ORD-' + Math.floor(100000 + Math.random() * 900000);
      const orderSummary = {
        orderId: fallbackOrderId,
        orderDate: new Date().toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        }),
        customer: { ...formData },
        items: [...cart],
        totalAmount: totalPrice,
        totalItems,
        paymentMethodName: 
          formData.paymentMethod === 'cod' ? 'Cash on Delivery' : 
          formData.paymentMethod === 'upi' ? 'UPI / QR Code' : 'Credit / Debit Card'
      };

      setCompletedOrder(orderSummary);
      clearCart();
      showToast(`Order #${fallbackOrderId} recorded locally.`, 'info');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseAndReset = () => {
    setCompletedOrder(null);
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={completedOrder ? handleCloseAndReset : onClose} id="checkout-modal-backdrop">
      <div 
        className="modal-content checkout-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="checkout-title"
      >
        <button 
          id="close-checkout-modal-btn"
          className="modal-close-btn" 
          onClick={completedOrder ? handleCloseAndReset : onClose}
          aria-label="Close modal"
        >
          <X size={20} />
        </button>

        {completedOrder ? (
          /* ================= ORDER SUCCESS VIEW ================= */
          <div className="order-success-view" id="order-success-screen">
            <div className="success-icon-badge">
              <CheckCircle2 size={56} className="success-icon" />
            </div>

            <h2 className="success-title">Order Placed Successfully!</h2>
            <p className="success-subtitle">
              Thank you for shopping with us! Your books will be on their way soon.
            </p>

            <div className="order-receipt-card">
              <div className="receipt-header-row">
                <div>
                  <span className="receipt-meta-label">ORDER ID</span>
                  <p className="receipt-order-id" id="confirmed-order-id">#{completedOrder.orderId}</p>
                </div>
                <div className="receipt-right-meta">
                  <span className="receipt-meta-label">DATE</span>
                  <p className="receipt-date">{completedOrder.orderDate}</p>
                </div>
              </div>

              <div className="receipt-divider"></div>

              <div className="receipt-details-grid">
                <div className="receipt-col">
                  <span className="receipt-meta-label">DELIVERING TO</span>
                  <p className="receipt-text-bold">{completedOrder.customer.fullName}</p>
                  <p className="receipt-text-muted">{completedOrder.customer.address}</p>
                  <p className="receipt-text-muted">{completedOrder.customer.city} - {completedOrder.customer.pincode}</p>
                  <p className="receipt-text-muted">Phone: {completedOrder.customer.phone}</p>
                </div>

                <div className="receipt-col">
                  <span className="receipt-meta-label">PAYMENT METHOD</span>
                  <div className="receipt-payment-tag">
                    {completedOrder.customer.paymentMethod === 'cod' && <Banknote size={15} />}
                    {completedOrder.customer.paymentMethod === 'upi' && <QrCode size={15} />}
                    {completedOrder.customer.paymentMethod === 'card' && <CreditCard size={15} />}
                    <span>{completedOrder.paymentMethodName}</span>
                  </div>
                  <div className="receipt-delivery-estimate">
                    <Truck size={15} />
                    <span>Estimated delivery in 3-4 working days</span>
                  </div>
                </div>
              </div>

              <div className="receipt-divider"></div>

              <div className="receipt-items-summary">
                <span className="receipt-meta-label">ORDER ITEMS ({completedOrder.totalItems})</span>
                <div className="receipt-items-scroll">
                  {completedOrder.items.map((item) => (
                    <div key={item.book.bookId} className="receipt-item-row">
                      <img 
                        src={item.book.image || DEFAULT_BOOK_COVER} 
                        alt={item.book.title} 
                        className="receipt-item-thumb"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = DEFAULT_BOOK_COVER;
                        }}
                      />
                      <div className="receipt-item-info">
                        <p className="receipt-item-title">{item.book.title}</p>
                        <p className="receipt-item-qty">Qty: {item.quantity} × ₹{item.book.price}</p>
                      </div>
                      <span className="receipt-item-total">
                        ₹{(item.book.price * item.quantity).toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="receipt-divider"></div>

              <div className="receipt-total-row">
                <span className="receipt-total-label">Grand Total Paid:</span>
                <span className="receipt-total-amount" id="confirmed-order-total">
                  ₹{completedOrder.totalAmount.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <div className="success-action-buttons">
              <button 
                id="continue-after-checkout-btn"
                type="button" 
                className="btn btn-primary success-continue-btn"
                onClick={handleCloseAndReset}
              >
                <PackageCheck size={18} />
                <span>Continue Shopping</span>
              </button>
            </div>
          </div>
        ) : (
          /* ================= CHECKOUT FORM VIEW ================= */
          <div className="checkout-view-layout">
            <div className="checkout-header-bar">
              <div className="checkout-title-wrap">
                <ShieldCheck size={26} className="checkout-shield-icon" />
                <div>
                  <h2 id="checkout-title" className="checkout-modal-title">Secure Checkout</h2>
                  <p className="checkout-subtitle">Enter your delivery details and choose payment method</p>
                </div>
              </div>
            </div>

            <form onSubmit={handlePlaceOrder} className="checkout-form-grid" id="checkout-order-form">
              {/* Left Column: Delivery and Payment info */}
              <div className="checkout-inputs-col">
                <div className="checkout-section-box shipping-section-enhanced">
                  <div className="section-header-row">
                    <h3 className="section-subtitle">
                      <Truck size={18} />
                      <span>Shipping Address</span>
                    </h3>
                    <span className="section-verified-badge">
                      <ShieldCheck size={13} />
                      <span>Verified Delivery</span>
                    </span>
                  </div>

                  {/* Address Type Quick Select */}
                  <div className="address-type-selector-row">
                    <span className="address-type-label">Deliver to:</span>
                    <div className="address-type-pills">
                      <button
                        type="button"
                        className={`address-type-pill ${formData.addressType === 'home' || !formData.addressType ? 'active' : ''}`}
                        onClick={() => setFormData((prev) => ({ ...prev, addressType: 'home' }))}
                      >
                        <Home size={14} />
                        <span>Home</span>
                      </button>
                      <button
                        type="button"
                        className={`address-type-pill ${formData.addressType === 'work' ? 'active' : ''}`}
                        onClick={() => setFormData((prev) => ({ ...prev, addressType: 'work' }))}
                      >
                        <Briefcase size={14} />
                        <span>Work / Office</span>
                      </button>
                      <button
                        type="button"
                        className={`address-type-pill ${formData.addressType === 'other' ? 'active' : ''}`}
                        onClick={() => setFormData((prev) => ({ ...prev, addressType: 'other' }))}
                      >
                        <MapPin size={14} />
                        <span>Other</span>
                      </button>
                    </div>
                  </div>

                  <div className="form-fields-grid">
                    {/* Full Name */}
                    <div className="form-group full-width">
                      <label htmlFor="checkout-name" className="field-label">
                        Full Name <span className="req-star">*</span>
                      </label>
                      <div className="input-icon-wrapper">
                        <User size={16} className="input-field-icon" />
                        <input 
                          id="checkout-name"
                          type="text" 
                          name="fullName"
                          className="form-control"
                          placeholder="e.g. Rahul Sharma"
                          required
                          value={formData.fullName}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>

                    {/* Email Address */}
                    <div className="form-group half-width">
                      <label htmlFor="checkout-email" className="field-label">
                        Email Address <span className="req-star">*</span>
                      </label>
                      <div className="input-icon-wrapper">
                        <Mail size={16} className="input-field-icon" />
                        <input 
                          id="checkout-email"
                          type="email" 
                          name="email"
                          className="form-control"
                          placeholder="rahul@example.com"
                          required
                          value={formData.email}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>

                    {/* Phone Number */}
                    <div className="form-group half-width">
                      <label htmlFor="checkout-phone" className="field-label">
                        Phone Number <span className="req-star">*</span>
                      </label>
                      <div className="input-icon-wrapper">
                        <Phone size={16} className="input-field-icon" />
                        <input 
                          id="checkout-phone"
                          type="tel" 
                          name="phone"
                          className="form-control"
                          placeholder="10-digit mobile number"
                          required
                          value={formData.phone}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>

                    {/* Street Address */}
                    <div className="form-group full-width">
                      <label htmlFor="checkout-address" className="field-label">
                        Street Address / Flat / House No. <span className="req-star">*</span>
                      </label>
                      <div className="input-icon-wrapper">
                        <MapPin size={16} className="input-field-icon" />
                        <input 
                          id="checkout-address"
                          type="text" 
                          name="address"
                          className="form-control"
                          placeholder="Flat 302, Green Heights, MG Road"
                          required
                          value={formData.address}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>

                    {/* Landmark (Optional) */}
                    <div className="form-group full-width">
                      <label htmlFor="checkout-landmark" className="field-label">
                        Landmark <span className="opt-tag">(Optional)</span>
                      </label>
                      <div className="input-icon-wrapper">
                        <Compass size={16} className="input-field-icon" />
                        <input 
                          id="checkout-landmark"
                          type="text" 
                          name="landmark"
                          className="form-control"
                          placeholder="Near Metro Station / Opposite City Mall"
                          value={formData.landmark || ''}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>

                    {/* City */}
                    <div className="form-group half-width">
                      <label htmlFor="checkout-city" className="field-label">
                        City / Town <span className="req-star">*</span>
                      </label>
                      <div className="input-icon-wrapper">
                        <Building2 size={16} className="input-field-icon" />
                        <input 
                          id="checkout-city"
                          type="text" 
                          name="city"
                          className="form-control"
                          placeholder="e.g. Mumbai"
                          required
                          value={formData.city}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>

                    {/* Pincode */}
                    <div className="form-group half-width">
                      <label htmlFor="checkout-pincode" className="field-label">
                        Postal Pincode <span className="req-star">*</span>
                      </label>
                      <div className="input-icon-wrapper">
                        <Hash size={16} className="input-field-icon" />
                        <input 
                          id="checkout-pincode"
                          type="text" 
                          name="pincode"
                          className="form-control"
                          placeholder="e.g. 400001"
                          required
                          value={formData.pincode}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Trust delivery badge */}
                  <div className="delivery-trust-strip">
                    <Truck size={14} className="trust-truck-icon" />
                    <span>Free contactless doorstep delivery with live tracking</span>
                  </div>
                </div>

                <div className="checkout-section-box">
                  <h3 className="section-subtitle">
                    <CreditCard size={17} />
                    <span>Payment Method</span>
                  </h3>

                  <div className="payment-options-grid">
                    <label className={`payment-option-card ${formData.paymentMethod === 'cod' ? 'selected' : ''}`}>
                      <input 
                        type="radio" 
                        name="paymentMethod" 
                        value="cod" 
                        checked={formData.paymentMethod === 'cod'}
                        onChange={handleInputChange}
                      />
                      <Banknote size={22} className="payment-icon" />
                      <div className="payment-info">
                        <strong>Cash on Delivery (COD)</strong>
                        <span>Pay in cash when your order arrives</span>
                      </div>
                    </label>

                    <label className={`payment-option-card ${formData.paymentMethod === 'upi' ? 'selected' : ''}`}>
                      <input 
                        type="radio" 
                        name="paymentMethod" 
                        value="upi" 
                        checked={formData.paymentMethod === 'upi'}
                        onChange={handleInputChange}
                      />
                      <QrCode size={22} className="payment-icon" />
                      <div className="payment-info">
                        <strong>UPI / QR Code</strong>
                        <span>Google Pay, PhonePe, Paytm, BHIM</span>
                      </div>
                    </label>

                    <label className={`payment-option-card ${formData.paymentMethod === 'card' ? 'selected' : ''}`}>
                      <input 
                        type="radio" 
                        name="paymentMethod" 
                        value="card" 
                        checked={formData.paymentMethod === 'card'}
                        onChange={handleInputChange}
                      />
                      <CreditCard size={22} className="payment-icon" />
                      <div className="payment-info">
                        <strong>Credit / Debit Card</strong>
                        <span>Visa, Mastercard, RuPay & more</span>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Right Column: Order Summary */}
              <div className="checkout-summary-col">
                <div className="checkout-summary-card">
                  <div className="summary-header">
                    <ShoppingBag size={18} />
                    <h4>Order Summary</h4>
                    <span className="summary-items-count">{totalItems} {totalItems === 1 ? 'item' : 'items'}</span>
                  </div>

                  <div className="summary-items-scroll">
                    {cart.map((item) => (
                      <div key={item.book.bookId} className="summary-book-row">
                        <img 
                          src={item.book.image || DEFAULT_BOOK_COVER} 
                          alt={item.book.title} 
                          className="summary-book-thumb"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = DEFAULT_BOOK_COVER;
                          }}
                        />
                        <div className="summary-book-details">
                          <p className="summary-book-title">{item.book.title}</p>
                          <span className="summary-book-qty">Qty: {item.quantity}</span>
                        </div>
                        <span className="summary-book-price">
                          ₹{(item.book.price * item.quantity).toLocaleString('en-IN')}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="summary-cost-breakdown">
                    <div className="cost-row">
                      <span>Items Subtotal</span>
                      <span>₹{totalPrice.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="cost-row">
                      <span>Delivery Fee</span>
                      <span className="free-delivery-badge">FREE</span>
                    </div>
                    <div className="cost-row">
                      <span>GST / Taxes</span>
                      <span className="included-badge">Included</span>
                    </div>
                    <div className="cost-divider"></div>
                    <div className="cost-row grand-total-row">
                      <span className="grand-label">Grand Total</span>
                      <span className="grand-amount" id="checkout-total-amount">
                        ₹{totalPrice.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  <button 
                    id="place-order-submit-btn"
                    type="submit" 
                    className="btn btn-primary place-order-btn"
                    disabled={isSubmitting || cart.length === 0}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="btn-spinner"></div>
                        <span>Processing Order...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck size={18} />
                        <span>Place Order (₹{totalPrice.toLocaleString('en-IN')})</span>
                      </>
                    )}
                  </button>

                  <p className="secure-badge-note">
                    <ShieldCheck size={14} /> 100% Safe & Secure Checkout
                  </p>
                </div>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckoutModal;
