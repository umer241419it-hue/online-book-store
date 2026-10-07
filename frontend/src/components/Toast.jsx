import React from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

const Toast = ({ toasts, onDismiss }) => {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="toast-container" id="toast-notifications-container">
      {toasts.map((toast) => {
        const { id, message, type = 'info' } = toast;

        let Icon = Info;
        let iconClass = 'toast-icon-info';
        if (type === 'success') {
          Icon = CheckCircle2;
          iconClass = 'toast-icon-success';
        } else if (type === 'error') {
          Icon = AlertCircle;
          iconClass = 'toast-icon-error';
        } else if (type === 'warning') {
          Icon = AlertTriangle;
          iconClass = 'toast-icon-warning';
        }

        return (
          <div key={id} className={`toast-card toast-${type}`} id={`toast-${id}`}>
            <Icon size={20} className={`toast-icon ${iconClass}`} />
            <div className="toast-message-text">{message}</div>
            <button
              type="button"
              className="toast-dismiss-btn"
              onClick={() => onDismiss(id)}
              aria-label="Dismiss notification"
            >
              <X size={15} />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default Toast;
