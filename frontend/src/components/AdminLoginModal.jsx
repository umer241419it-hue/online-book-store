import React, { useState } from 'react';
import { Lock, X, KeyRound, AlertCircle, ArrowRight } from 'lucide-react';
import { adminLogin } from '../services/api';

const AdminLoginModal = ({ isOpen, onClose, onSuccess, showToast }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password.trim()) {
      setError('Please enter the administrator password.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const data = await adminLogin(password);
      if (data.success) {
        showToast('Administrator authentication successful!', 'success');
        setPassword('');
        setError('');
        onSuccess();
      } else {
        setError(data.message || 'Invalid admin password.');
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Invalid administrator password. Access denied.';
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose} id="admin-login-modal-backdrop">
      <div
        className="modal-content admin-login-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-login-title"
      >
        <button
          id="close-admin-login-btn"
          className="modal-close-btn"
          onClick={onClose}
          aria-label="Close admin login modal"
        >
          <X size={20} />
        </button>

        <div className="admin-login-header">
          <div className="admin-lock-icon-wrap">
            <Lock size={28} />
          </div>
          <h2 id="admin-login-title" className="admin-login-title">
            Admin Access
          </h2>
          <p className="admin-login-subtitle">
            Enter the administrator password to manage bookstore inventory and database records.
          </p>
        </div>

        {error && (
          <div className="server-error-banner" id="admin-login-error">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="admin-login-form">
          <div className="form-field-group">
            <label htmlFor="admin-password-input" className="field-label">
              Admin Password <span className="required-star">*</span>
            </label>
            <div className="password-input-wrap">
              <KeyRound size={18} className="password-icon" />
              <input
                id="admin-password-input"
                type="password"
                placeholder="Enter admin password..."
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                className={`field-input password-field ${error ? 'input-error' : ''}`}
                autoFocus
                autoComplete="current-password"
              />
            </div>
          </div>

          <div className="admin-login-actions">
            <button
              id="cancel-admin-login-btn"
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              id="submit-admin-login-btn"
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="spinner-sm"></div>
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <span>Unlock Admin Panel</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminLoginModal;
