import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import FeaturedStory from '../components/FeaturedStory';
import TrendingGrid from '../components/TrendingGrid';
import StoryList from '../components/StoryList';
import Footer from '../components/Footer';

import { processRawData } from '../utils/dataMapping';
import classifiedData from '../../../project/data/bias_classified_output.json';

const Home = () => {
  const [stories, setStories] = useState([]);
  const [featuredStory, setFeaturedStory] = useState(null);
  const [trendingStories, setTrendingStories] = useState([]);
  const [listStories, setListStories] = useState([]);

  useEffect(() => {
    const processed = processRawData(classifiedData);
    setStories(processed);

    if (processed.length > 0) {
      // 1. Featured — pick the first political story with the most sources
      const politicalSorted = processed
        .filter(s => s.category === 'political')
        .sort((a, b) => b.sourcesCount - a.sourcesCount);
      const featured = politicalSorted[0] || processed[0];
      setFeaturedStory(featured);

      // 2. Trending — next 3 stories (mix of categories, skip featured)
      const trending = processed
        .filter(s => s.id !== featured.id)
        .slice(0, 3);
      setTrendingStories(trending);

      // 3. List — the rest
      const usedIds = new Set([featured.id, ...trending.map(t => t.id)]);
      const remaining = processed.filter(s => !usedIds.has(s.id));
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
        {listStories.length > 0 && <StoryList stories={listStories} />}
      </main>

      <Footer />
    </div>
  );
};

export default Home;
