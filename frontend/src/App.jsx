import React, { useState, useEffect } from 'react';
import './index.css';
import './App.css';

import Header from './components/Header';
import FeaturedStory from './components/FeaturedStory';
import TrendingGrid from './components/TrendingGrid';
import StoryList from './components/StoryList';
import Footer from './components/Footer';

import { processRawData } from './utils/dataMapping';
import classifiedData from '../../project/data/classified_results.json';

function App() {
  const [stories, setStories] = useState([]);
  const [featuredStory, setFeaturedStory] = useState(null);
  const [trendingStories, setTrendingStories] = useState([]);
  const [listStories, setListStories] = useState([]);

  useEffect(() => {
    // Process the imported JSON
    const processed = processRawData(classifiedData);
    setStories(processed);

    if (processed.length > 0) {
      // 1. Featured - taking a prominent political story if available
      const featured = processed.find(s => s.category.toLowerCase() === 'political') || processed[0];
      featured.imageUrl = '/src/assets/hero.png';
      featured.customDesc = "Work begins on the new facility to store EVMs and VVPATs in Ranipet and Tirupattur districts, aiming to bolster election readiness and security.";
      setFeaturedStory(featured);

      // 2. Trending - taking next 3
      // We will manually pick a few diverse ones from the JSON or mock their categories for visual variety
      const trending = processed.filter(s => s.id !== featured.id).slice(0, 3);
      
      if (trending[0]) { trending[0].category = 'TECHNOLOGY'; trending[0].imageUrl = '/src/assets/tech.png'; }
      if (trending[1]) { trending[1].category = 'CLIMATE'; trending[1].imageUrl = '/src/assets/climate.png'; }
      if (trending[2]) { trending[2].category = 'ECONOMY'; trending[2].imageUrl = '/src/assets/economy.png'; }
      
      setTrendingStories(trending);

      // 3. List - taking the rest
      const remaining = processed.filter(s => 
        s.id !== featured.id && !trending.find(t => t.id === s.id)
      );
      // Let's add some variety to the list categories since the raw data is entirely 'political'
      const categories = ['SCIENCE', 'HEALTH', 'SECURITY', 'CONFLICT', 'POLITICS'];
      remaining.forEach((s, i) => {
        if (s.category === 'political') {
           s.category = categories[i % categories.length];
        } else {
           s.category = s.category.toUpperCase();
        }
      });
      setListStories(remaining);
    }
  }, []);

  return (
    <div className="app-container">
      <Header 
        totalSources={classifiedData?.total_articles || 0} 
        totalStories={stories.length || 0} 
      />
      
      <main className="main-content container">
        {featuredStory && <FeaturedStory story={featuredStory} />}
        
        {trendingStories.length > 0 && <TrendingGrid stories={trendingStories} />}
        
        <div className="w-full h-px bg-gray-200 my-12" style={{ backgroundColor: 'var(--border)' }}></div>
        
        {listStories.length > 0 && <StoryList stories={listStories} />}
      </main>

      <Footer />
    </div>
  );
}

export default App;
