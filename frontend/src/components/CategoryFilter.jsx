import React from 'react';
import { Filter } from 'lucide-react';

export const CATEGORIES = [
  'All Categories',
  'Programming',
  'Web Development',
  'Database',
  'AI & ML',
  'Fiction',
  'Other'
];

const CategoryFilter = ({ selectedCategory, setSelectedCategory }) => {
  return (
    <div className="category-filter-wrapper">
      <div className="category-select-container">
        <label htmlFor="category-filter-dropdown" className="filter-label">
          <Filter size={16} />
          <span>Category</span>
        </label>
        <select
          id="category-filter-dropdown"
          className="category-dropdown-select"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      <div className="category-pills-row" id="category-pills-list">
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              id={`filter-pill-${cat.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
              type="button"
              className={`category-pill ${isSelected ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryFilter;
