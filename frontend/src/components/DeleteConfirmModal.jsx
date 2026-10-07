import React from 'react';
import { Trash2, AlertTriangle, X } from 'lucide-react';

const DeleteConfirmModal = ({ isOpen, onClose, book, onConfirm, isDeleting }) => {
  if (!isOpen || !book) return null;

  return (
    <div className="modal-backdrop" onClick={onClose} id="delete-confirm-backdrop">
      <div 
        className="modal-content delete-modal"
        onClick={(e) => e.stopPropagation()}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-dialog-title"
      >
        <div className="delete-modal-icon-wrap">
          <AlertTriangle size={32} className="warning-icon" />
        </div>

        <h3 id="delete-dialog-title" className="delete-modal-title">
          Confirm Deletion
        </h3>

        <p className="delete-modal-desc">
          Are you sure you want to delete <strong>"{book.title}"</strong> (Book ID: <code>{book.bookId}</code>)?
        </p>

        <p className="delete-modal-subdesc">
          This action will permanently remove the book record from MongoDB. This action cannot be undone.
        </p>

        <div className="delete-modal-actions">
          <button
            id="cancel-delete-btn"
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button
            id="confirm-delete-btn"
            type="button"
            className="btn btn-danger"
            onClick={() => onConfirm(book)}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <div className="spinner-sm"></div>
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <Trash2 size={16} />
                <span>Delete Book</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
