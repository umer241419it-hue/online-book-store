import React from 'react';
import BookCard from './BookCard';
import EmptyState from './EmptyState';
import LoadingState from './LoadingState';

const BookGrid = ({ books, loading, onViewDetails, showToast, onResetFilters }) => {
  if (loading) {
    return <LoadingState message="Fetching books from database..." />;
  }

  if (!books || books.length === 0) {
    return (
      <EmptyState
        title="No Books Found"
        description="We couldn't find any books matching your search query or selected category."
        actionText="Reset Filters"
        onAction={onResetFilters}
      />
    );
  }

  return (
    <div className="book-grid-section">
      <div className="book-grid-header">
        <p className="results-count-text">
          Showing <strong>{books.length}</strong> {books.length === 1 ? 'book' : 'books'}
        </p>
      </div>
      <div className="book-cards-grid" id="books-grid-container">
        {books.map((book) => (
          <BookCard
            key={book.bookId || book._id}
            book={book}
            onViewDetails={onViewDetails}
            showToast={showToast}
          />
        ))}
      </div>
    </div>
  );
};

export default BookGrid;
