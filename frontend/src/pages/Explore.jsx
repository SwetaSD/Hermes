import React, { useState, useEffect, useMemo } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import AggregateBiasChart from '../components/AggregateBiasChart';
import ExploreFilterBar from '../components/ExploreFilterBar';
import ExploreGrid from '../components/ExploreGrid';

import { processRawData } from '../utils/dataMapping';
import classifiedData from '../../../project/data/classified_results.json';

const Explore = () => {
  const [stories, setStories] = useState([]);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [activeBias, setActiveBias] = useState('ALL');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  useEffect(() => {
    // Process the imported JSON
    const processed = processRawData(classifiedData);
    
    // Add visual variety to categories just like Home page does for mock display
    const categories = ['SCIENCE', 'HEALTH', 'SECURITY', 'CONFLICT', 'POLITICS', 'TECHNOLOGY', 'CLIMATE', 'ECONOMY'];
    processed.forEach((s, i) => {
      if (s.category === 'political') {
         s.category = categories[i % categories.length];
      } else {
         s.category = s.category.toUpperCase();
      }
    });

    setStories(processed);
  }, []);

  // Filter Logic
  const filteredStories = useMemo(() => {
    return stories.filter(story => {
      // 1. Text Search (Title or Category)
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        if (!story.title.toLowerCase().includes(term) && !story.category.toLowerCase().includes(term)) {
          return false;
        }
      }

      // 2. Category Filter
      if (activeCategory !== 'ALL' && story.category !== activeCategory) {
        return false;
      }

      // 3. Bias Filter
      if (activeBias !== 'ALL') {
        const biasMapping = {
          'FAR LEFT': 'far_left',
          'LEFT': 'left',
          'CENTER LEFT': 'center_left',
          'CENTER': 'center',
          'CENTER RIGHT': 'center_right',
          'RIGHT': 'right',
          'FAR RIGHT': 'far_right'
        };
        const targetBias = biasMapping[activeBias];
        if (story.bias !== targetBias) {
          return false;
        }
      }

      return true;
    });
  }, [stories, searchTerm, activeCategory, activeBias]);

  return (
    <div className="app-container min-h-screen bg-white">
      <Header 
        totalSources={classifiedData?.total_articles || 0} 
        totalStories={stories.length || 0} 
      />
      
      <main className="container max-w-7xl mx-auto px-6 py-12 pb-4 flex-1 animate-fade-in">
        <h1 className="text-[56px] font-serif font-bold text-black mb-4 pt-[50px] tracking-tight">Explore Stories</h1>
        <p className="text-[#888888] font-inter text-[1.05rem] mb-12 max-w-2xl mr-[670px]">
          Browse all tracked stories. Filter by topic, search by keyword, and see how bias shifts across the media landscape.
        </p>

        <AggregateBiasChart stories={stories} />

        <ExploreFilterBar 
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
          activeBias={activeBias}
          setActiveBias={setActiveBias}
          viewMode={viewMode}
          setViewMode={setViewMode}
        />

        <ExploreGrid 
          stories={filteredStories} 
          viewMode={viewMode} 
        />
        
      </main>

      <Footer />
    </div>
  );
};

export default Explore;
