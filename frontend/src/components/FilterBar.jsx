import React from 'react';
import { Search, X, SlidersHorizontal } from 'lucide-react';

export default function FilterBar({
  search,
  onSearchChange,
  status,
  onStatusChange,
  category,
  onCategoryChange,
  categories = [],
  sortBy,
  onSortByChange,
  onClearFilters,
}) {
  const hasActiveFilters = search || status !== 'All' || category !== 'All';

  return (
    <div className="filter-container">
      <div className="filter-top-row">
        {/* Search input */}
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="search-input"
            id="search-input"
            placeholder="Search books by title, author, or category..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          {search && (
            <button
              className="search-clear-btn"
              onClick={() => onSearchChange('')}
              title="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Sort and Actions */}
        <div className="filter-actions">
          <select
            className="select-custom"
            id="select-sort"
            value={sortBy}
            onChange={(e) => onSortByChange(e.target.value)}
          >
            <option value="newest">Sort: Newest Added</option>
            <option value="oldest">Sort: Oldest</option>
            <option value="title_asc">Title: A to Z</option>
            <option value="title_desc">Title: Z to A</option>
            <option value="author_asc">Author: A to Z</option>
          </select>

          {hasActiveFilters && (
            <button
              className="btn btn-outline btn-sm"
              onClick={onClearFilters}
              title="Reset all filters"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      <div className="filter-pills-row">
        {/* Status Toggle Tabs */}
        <div className="status-tabs" role="tablist" aria-label="Book Availability Filter">
          {['All', 'Available', 'Issued'].map((st) => (
            <button
              key={st}
              id={`status-tab-${st.toLowerCase()}`}
              className={`status-tab ${status === st ? 'active' : ''}`}
              onClick={() => onStatusChange(st)}
              role="tab"
              aria-selected={status === st}
            >
              {st === 'All' ? 'All Books' : st}
            </button>
          ))}
        </div>

        {/* Category Chips */}
        <div className="category-chips">
          <button
            className={`category-chip ${category === 'All' ? 'active' : ''}`}
            onClick={() => onCategoryChange('All')}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              className={`category-chip ${category === cat ? 'active' : ''}`}
              onClick={() => onCategoryChange(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
