import React from 'react';
import { BookX, RotateCcw } from 'lucide-react';

const EmptyState = ({
  title = 'No Books Found',
  description = 'Try searching with different keywords or selecting another category.',
  actionText,
  onAction
}) => {
  return (
    <div className="empty-state-container" id="empty-state-indicator">
      <div className="empty-state-icon-box">
        <BookX size={44} />
      </div>
      <h3 className="empty-state-title">{title}</h3>
      <p className="empty-state-description">{description}</p>
      {actionText && onAction && (
        <button
          id="empty-state-action-btn"
          type="button"
          className="btn btn-secondary empty-action-btn"
          onClick={onAction}
        >
          <RotateCcw size={15} />
          <span>{actionText}</span>
        </button>
      )}
    </div>
  );
};

export default EmptyState;
