import React from 'react';
import { Link } from 'react-router-dom';
import { Layers } from 'lucide-react';
import BiasVisualizer from './BiasVisualizer';

const ExploreGrid = ({ stories, viewMode }) => {
  if (!stories || stories.length === 0) {
    return (
      <div className="explore-empty">
        <p className="explore-empty-title">No stories found matching your criteria.</p>
        <p className="explore-empty-sub">Try adjusting your topic or bias filters.</p>
      </div>
    );
  }

  return (
    <div className="explore-grid-wrapper">
      <div className="explore-grid-count">
        {stories.length} {stories.length === 1 ? 'story' : 'stories'} found
      </div>

      <div className={viewMode === 'grid' ? 'explore-grid' : 'explore-list'}>
        {stories.map((story, i) => (
          <div 
            key={story.id} 
            className={`explore-card ${viewMode === 'list' ? 'explore-card--list' : ''}`}
            style={{ animationDelay: `${(i % 12) * 0.05}s` }}
          >
            <div className={`explore-card__image-wrapper ${viewMode === 'list' ? 'explore-card__image-wrapper--list' : ''}`}>
              <img 
                src={story.imageUrl} 
                alt={story.title} 
                className="explore-card__image"
                onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&q=80&w=600'; }}
              />
              <span className="explore-card__category-badge">
                {story.category === 'non_political' ? 'GENERAL' : story.category.toUpperCase()}
              </span>
            </div>
            
            <div className={`explore-card__body ${viewMode === 'list' ? 'explore-card__body--list' : ''}`}>
              <div className="explore-card__meta">
                <span>{story.timeAgo}</span>
                <span className="explore-card__meta-dot"></span>
                <span className="explore-card__meta-sources">
                  <Layers size={12} />
                  {story.sourcesCount}
                </span>
              </div>
              
              <Link to={`/article/${story.id}`} className="explore-card__title">
                {story.title}
              </Link>
              
              <p className="explore-card__snippet">
                {story.snippet}
              </p>
              
              <div className="explore-card__bias">
                <BiasVisualizer biasScale={story.biasScale} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExploreGrid;
