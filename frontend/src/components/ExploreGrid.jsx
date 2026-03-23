import React from 'react';
import { Link } from 'react-router-dom';
import { Layers } from 'lucide-react';
import BiasVisualizer from './BiasVisualizer';

const ExploreGrid = ({ stories, viewMode }) => {
  if (!stories || stories.length === 0) {
    return (
      <div className="py-20 text-center text-gray-500">
        <p className="text-xl">No stories found matching your criteria.</p>
        <p className="mt-2 text-sm text-gray-400">Try adjusting your topic or bias filters.</p>
      </div>
    );
  }

  return (
    <div className="mb-24">
      <div className="mb-8 tracking-widest text-xs font-bold text-gray-400 uppercase">
        {stories.length} {stories.length === 1 ? 'story' : 'stories'} found
      </div>

      <div className={
        viewMode === 'grid' 
          ? "grid grid-cols-3 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12" 
          : "flex flex-col gap-8"
      }>
        {stories.map((story, i) => (
          <div 
            key={story.id} 
            className={`group animate-fade-in ${viewMode === 'list' ? 'border-b border-gray-100 pb-8' : 'flex flex-col'}`}
            style={{ 
              animationDelay: `${(i % 12) * 0.05}s`,
              ...(viewMode === 'list' ? { display: 'flex', flexDirection: 'row', gap: '1.5rem', alignItems: 'flex-start' } : {})
            }}
          >
            <div 
              className={`relative flex-shrink-0 border border-gray-200 overflow-hidden ${viewMode === 'list' ? 'mb-0' : 'w-full aspect-[3/2] mb-3'}`}
              style={viewMode === 'list' ? { width: '30%', minWidth: '200px', height: '12rem' } : {}}
            >
              <img 
                src={story.imageUrl || `https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&q=80&w=600`} 
                alt={story.title} 
                className="w-full h-full object-cover  transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            
            <div 
              className={`flex flex-col ${viewMode === 'list' ? 'mt-0 pl-4' : 'mt-1 h-full'}`}
              style={viewMode === 'list' ? { flex: 1, display: 'flex', flexDirection: 'column' } : { flex: 1 }}
            >
              <div className="mb-2">
                <span className="bg-black text-white text-[9px] tracking-[0.15em] font-bold px-2 py-1 uppercase inline-block font-sans">
                  {story.category}
                </span>
              </div>
              
              <div className="text-[10px] text-gray-400 mb-2 flex items-center font-medium uppercase tracking-wider">
                <span>{story.timeAgo}</span>
                <span className="w-1 h-1 rounded-full bg-gray-300 mx-3"></span>
                <span className="flex items-center gap-1">
                  <Layers size={12} />
                  {story.sourcesCount}
                </span>
              </div>
              
              <Link to={`/article/${story.id}`}
                className={`block font-serif font-bold text-black group-hover:text-gray-600 transition-colors mb-2 ${viewMode === 'list' ? 'leading-tight' : 'text-xl leading-snug line-clamp-3'}`}
                style={viewMode === 'list' ? { fontSize: '1.75rem' } : {}}
              >
                {story.title}
              </Link>
              
              <p 
                className={`text-gray-500 ${viewMode === 'list' ? 'mb-4 text-base' : 'mb-4 text-sm line-clamp-3'} leading-relaxed`}
                style={viewMode === 'grid' ? { fontSize: '13px' } : {}}
              >
                     {story.category === 'TECHNOLOGY' 
                  ? "The European Commission unveiled comprehensive AI regulations that could reshape the global tech landscape."
                  : story.category === 'CLIMATE' 
                  ? "A historic heat wave has triggered devastating wildfires across Greece, Italy, and Spain. The framing of this varies."
                  : story.category === 'ECONOMY'
                  ? "The Federal Reserve held rates steady, sparking divergent reactions across financial media. Left-leaning outlets focus..."
                  : story.category === 'HEALTH'
                  ? "A landmark study published in The Lancet draws a strong correlation between ultra-processed food and mental decline."
                  : story.category === 'SECURITY'
                  ? "A sophisticated cyberattack has compromised sensitive data of over 4 million federal employees. Media framing diverges."
                  : story.category === 'CONFLICT'
                  ? "A significant escalation in the ongoing conflict has prompted emergency UN sessions. This story shows wide spectrum bias."
                  : "Congress remains deadlocked over the federal budget as opposing factions dispute spending priorities."}
              </p>
              
              <div className="mt-auto">
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
