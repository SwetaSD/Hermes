import React from 'react';
import { Search, LayoutGrid, List } from 'lucide-react';

const CATEGORIES = ['ALL', 'POLITICAL', 'GENERAL'];
const BIAS_CATEGORIES = ['ALL', 'LEFT', 'CENTER', 'RIGHT'];

const ExploreFilterBar = ({ 
  searchTerm, 
  setSearchTerm, 
  activeCategory, 
  setActiveCategory,
  activeBias,
  setActiveBias,
  viewMode,
  setViewMode
}) => {
  return (
    <div className="explore-filter-bar">
      
      {/* Top Filter Row: Search + Categories + View Toggle */}
      <div className="explore-filter-top">
        
        {/* Search Input */}
        <div className="explore-search-wrapper">
          <div className="explore-search-icon">
            <Search size={14} />
          </div>
          <input
            type="text"
            className="explore-search-input"
            placeholder="Search stories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Categories */}
        <div className="explore-categories">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              className={`explore-cat-btn ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* View Toggle */}
        <div className="explore-view-toggle">
          <button 
            className={`explore-view-btn ${viewMode === 'grid' ? 'active' : ''}`}
            onClick={() => setViewMode('grid')}
            aria-label="Grid View"
          >
            <LayoutGrid size={14} />
          </button>
          <button 
            className={`explore-view-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
            aria-label="List View"
          >
            <List size={14} />
          </button>
        </div>
      </div>

      {/* Bottom Bias Filter Row */}
      <div className="explore-bias-row">
        <span className="explore-bias-label">BIAS:</span>
        <div className="explore-bias-btns">
          {BIAS_CATEGORIES.map(bias => (
            <button
              key={bias}
              className={`explore-bias-btn ${activeBias === bias ? 'active' : ''}`}
              onClick={() => setActiveBias(bias)}
            >
              {bias}
            </button>
          ))}
        </div>
      </div>

    </div>
  );
};

export default ExploreFilterBar;
