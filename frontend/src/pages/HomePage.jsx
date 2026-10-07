import React, { useState } from 'react';
import SearchBar from '../components/SearchBar';
import CategoryFilter from '../components/CategoryFilter';
import BookGrid from '../components/BookGrid';
import BookDetailsModal from '../components/BookDetailsModal';
import { Sparkles, XCircle } from 'lucide-react';

const HomePage = ({
  books,
  loading,
  search,
  setSearch,
  category,
  setCategory,
  onResetFilters,
  showToast
}) => {
  const [selectedBookId, setSelectedBookId] = useState(null);

  const hasActiveFilters = search.trim() !== '' || (category !== 'All Categories' && category !== 'All');

  return (
    <div className="home-page-container">
      {/* Hero Welcome Banner */}
      <section className="hero-banner-section">
        <div className="hero-badge">
          <Sparkles size={14} />
          <span>Curated Academic & Technology Books</span>
        </div>
        <h1 className="hero-heading">Explore, Learn, and Master New Horizons</h1>
        <p className="hero-subtext">
          Browse textbooks, developer guides, and classic literature. Add to your cart and manage your library with ease.
        </p>
      </section>

      {/* Filter and Search Section */}
      <section className="search-filter-section" id="filter-controls-section">
        <div className="search-filter-grid">
          <SearchBar
            search={search}
            setSearch={setSearch}
          />
          <CategoryFilter
            selectedCategory={category}
            setSelectedCategory={setCategory}
          />
        </div>

        {hasActiveFilters && (
          <div className="active-filters-bar" id="active-filters-indicator">
            <span className="active-filters-label">Active Filters:</span>
            {search.trim() && (
              <span className="filter-chip">
                Search: "<strong>{search}</strong>"
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="chip-remove-btn"
                  title="Remove search filter"
                >
                  <XCircle size={14} />
                </button>
              </span>
            )}
            {category !== 'All Categories' && category !== 'All' && (
              <span className="filter-chip">
                Category: <strong>{category}</strong>
                <button
                  type="button"
                  onClick={() => setCategory('All Categories')}
                  className="chip-remove-btn"
                  title="Remove category filter"
                >
                  <XCircle size={14} />
                </button>
              </span>
            )}
            <button
              type="button"
              className="reset-all-filters-btn"
              onClick={onResetFilters}
            >
              Reset All
            </button>
          </div>
        )}
      </section>

      {/* Main Books Grid */}
      <section className="books-showcase-section">
        <BookGrid
          books={books}
          loading={loading}
          onViewDetails={(id) => setSelectedBookId(id)}
          showToast={showToast}
          onResetFilters={onResetFilters}
        />
      </section>

      {/* Book Details Modal */}
      {selectedBookId && (
        <BookDetailsModal
          bookId={selectedBookId}
          onClose={() => setSelectedBookId(null)}
          showToast={showToast}
        />
      )}
    </div>
  );
};

export default HomePage;
