import React from 'react';
import { Search, X } from 'lucide-react';

const SearchBar = ({ search, setSearch, onSearchSubmit }) => {
  const handleClear = () => {
    setSearch('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && onSearchSubmit) {
      onSearchSubmit();
    }
  };

  return (
    <div className="search-bar-wrapper">
      <div className="search-input-container">
        <Search className="search-icon" size={20} />
        <input
          id="book-search-input"
          type="text"
          placeholder="Search by book title or author name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={handleKeyDown}
          className="search-input-field"
          autoComplete="off"
        />
        {search && (
          <button
            id="clear-search-btn"
            type="button"
            className="clear-search-btn"
            onClick={handleClear}
            title="Clear search"
          >
            <X size={16} />
          </button>
        )}
      </div>
    </div>
  );
};

export default SearchBar;
