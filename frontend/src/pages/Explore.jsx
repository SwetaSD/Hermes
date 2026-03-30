import React, { useState, useEffect, useMemo } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import AggregateBiasChart from '../components/AggregateBiasChart';
import ExploreFilterBar from '../components/ExploreFilterBar';
import ExploreGrid from '../components/ExploreGrid';

import { processRawData } from '../utils/dataMapping';
import classifiedData from '../../../project/data/bias_classified_output.json';

const Explore = () => {
  const [stories, setStories] = useState([]);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [activeBias, setActiveBias] = useState('ALL');
  const [viewMode, setViewMode] = useState('grid');

  useEffect(() => {
    // Process the imported JSON — real categories preserved
    const processed = processRawData(classifiedData);
    setStories(processed);
  }, []);

  // Filter Logic
  const filteredStories = useMemo(() => {
    return stories.filter(story => {
      // 1. Text Search (Title, Category, or Source)
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        if (
          !story.title.toLowerCase().includes(term) && 
          !story.category.toLowerCase().includes(term) &&
          !story.source.toLowerCase().includes(term)
        ) {
          return false;
        }
      }

      // 2. Category Filter
      if (activeCategory !== 'ALL') {
        const categoryMap = {
          'POLITICAL': 'political',
          'GENERAL': 'non_political',
        };
        const targetCategory = categoryMap[activeCategory];
        if (targetCategory && story.category !== targetCategory) {
          return false;
        }
      }

      // 3. Bias Filter
      if (activeBias !== 'ALL') {
        const biasMapping = {
          'LEFT': 'left',
          'CENTER': 'center',
          'RIGHT': 'right',
        };
        const targetBias = biasMapping[activeBias];
        if (targetBias && story.finalBias !== targetBias) {
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
