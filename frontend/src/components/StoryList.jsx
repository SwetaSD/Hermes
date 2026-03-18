import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Layers } from 'lucide-react';
import BiasVisualizer from './BiasVisualizer';

const CATEGORIES = ['ALL', 'POLITICS', 'TECHNOLOGY', 'CLIMATE', 'ECONOMY', 'SCIENCE', 'HEALTH', 'SECURITY', 'CONFLICT'];

const StoryList = ({ stories }) => {
  const [activeTab, setActiveTab] = useState('ALL');

  const filteredStories = activeTab === 'ALL'
    ? stories
    : stories.filter(s => s.category.toUpperCase() === activeTab);

  if (!stories || stories.length === 0) return null;

  return (
    <section className="mb-24">
      <div className="filter-layout border-y border-gray-300 py-6 mb-12 flex-col md:flex-row flex items-center justify-between">
        <h2 className="filter-title font-bold tracking-widest text-sm text-black m-0">ALL STORIES</h2>
        <div className="filter-categories flex flex-wrap gap-x-6 gap-y-2 mt-4 md:mt-0">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              className={`filter-btn ${activeTab === cat ? '!text-black !bg-transparent border-b-2 !border-black rounded-none pb-1' : '!text-gray-400 font-medium hover:!text-gray-600'}`}
              onClick={() => setActiveTab(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="stories-list grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-12">
        {filteredStories.slice(0, 10).map((story, i) => (
          <div key={story.id} className="list-item animate-fade-in group flex gap-6" style={{ animationDelay: `${i * 0.05}s` }}>
            <div className="list-image-container w-28 h-24 flex-shrink-0 border border-gray-200">
              <img
                src={story.imageUrl || `https://images.unsplash.com/photo-1579532537598-459ecdaf39cc?auto=format&fit=crop&q=80&w=200`}
                alt={story.title}
                className="list-image w-full h-full object-cover grayscale contrast-125 transition-transform duration-500 group-hover:scale-105"
              />
            </div>

            <div className="list-content flex-1 flex flex-col">
              <div className="meta-info text-gray-400 mb-2">
                <span className="list-category !text-gray-400 !font-bold">{story.category}</span>
                <span className="meta-dot bg-gray-300"></span>
                <span>{story.timeAgo}</span>
              </div>

              <Link to={`/article/${story.id}`} className="list-title !text-xl !leading-tight !font-bold font-serif text-black group-hover:text-gray-600 transition-colors mb-4 line-clamp-3 block">
                {story.title}
              </Link>

              <div className="meta-info text-gray-400 mt-auto mb-3">
                <Layers size={14} />
                <span>{story.sourcesCount} sources</span>
              </div>

              <div className="w-full">
                <BiasVisualizer biasScale={story.biasScale} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default StoryList;
