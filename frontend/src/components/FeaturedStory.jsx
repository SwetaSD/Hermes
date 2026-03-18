import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Layers } from 'lucide-react';
import BiasVisualizer from './BiasVisualizer';

const FeaturedStory = ({ story }) => {
  if (!story) return null;

  return (
    <section className="featured-section animate-fade-in">
      <div className="featured-image-container border border-gray-200 shadow-sm">
        <div className="absolute top-4 left-4 z-10">
          <span className="category-tag">{story.category}</span>
        </div>
        <img
          src={story.imageUrl || `https://images.unsplash.com/photo-1541872526-9f8f260170a7?auto=format&fit=crop&q=80&w=1200`}
          alt={story.title}
          className="featured-image grayscale"
        />
      </div>

      <div className="featured-content">
        <div className="meta-info text-gray-400 mb-4">
          <span>{story.timeAgo || '2h ago'}</span>
          <span className="meta-dot bg-gray-300"></span>
          <span className="flex items-center gap-1">
            <Layers size={14} />
            {story.sourcesCount || 47} sources
          </span>
        </div>

        <h1 className="featured-title !text-5xl !leading-tight">{story.title}</h1>

        <p className="featured-desc !text-gray-500 !text-[1.05rem] mt-2 mb-8">
          {story.customDesc || "Congress remains deadlocked over the federal budget as opposing factions dispute spending priorities. Different outlets frame the impasse through vastly different lenses."}
        </p>

        <div className="w-full max-w-md">
          <BiasVisualizer biasScale={story.biasScale} />
        </div>

        <Link to={`/article/${story.id}`} className="read-full mt-8 tracking-wider font-bold">
          READ FULL ANALYSIS <ArrowRight size={16} strokeWidth={2} />
        </Link>
      </div>
    </section>
  );
};

export default FeaturedStory;
