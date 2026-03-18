import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Layers } from 'lucide-react';
import BiasVisualizer from './BiasVisualizer';

const TrendingGrid = ({ stories }) => {
  if (!stories || stories.length === 0) return null;

  return (
    <section className="mb-16">
      <div className="section-header border-b border-gray-300 pb-2 mb-8">
        <h2 className="section-title !font-bold">
          <ArrowRight size={16} strokeWidth={2} className="text-black" /> TRENDING NOW
        </h2>
        <a href="#" className="view-all uppercase tracking-wider text-xs font-bold text-gray-500">View all <ArrowRight size={12} strokeWidth={2} /></a>
      </div>

      <div className="trending-grid gap-x-8 gap-y-12">
        {stories.slice(0, 3).map((story, i) => (
          <div key={story.id} className="trending-card animate-fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
            <div className="trending-image-container border border-gray-200">
              <span className="trending-category-badge !bg-black !text-white !font-bold pb-1 pt-1.5 px-2">{story.category}</span>
              <img
                src={story.imageUrl || `https://images.unsplash.com/photo-1558434653-271dbdebfbc7?auto=format&fit=crop&q=80&w=600`}
                alt={story.title}
                className="trending-image grayscale contrast-125"
              />
            </div>

            <div className="flex flex-col flex-1 mt-4">
              <div className="meta-info text-gray-400 mb-2">
                <span>{story.timeAgo}</span>
                <span className="meta-dot bg-gray-300"></span>
                <span className="flex items-center gap-1">
                  <Layers size={14} />
                  {story.sourcesCount} sources
                </span>
              </div>

              <Link to={`/article/${story.id}`}>
                <h3 className="trending-title !text-2xl !leading-snug !mb-3 hover:text-gray-500 transition-colors">{story.title}</h3>
              </Link>
              <p className="trending-desc !text-gray-500 !text-sm">
                {story.category === 'TECHNOLOGY'
                  ? "The European Commission unveiled comprehensive AI regulations that could reshape the global tech landscape."
                  : story.category === 'CLIMATE'
                    ? "A historic heat wave has triggered devastating wildfires across Greece, Italy, and Spain. The framing of this varies."
                    : "The Federal Reserve held rates steady, sparking divergent reactions across financial media. Left-leaning outlets focus..."}
              </p>

              <div className="mt-8">
                <BiasVisualizer biasScale={story.biasScale} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default TrendingGrid;
