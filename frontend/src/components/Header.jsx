import React from 'react';
import { Search, Zap } from 'lucide-react';
import { format } from 'date-fns';

const Header = ({ totalSources, totalStories }) => {
  const today = format(new Date(), 'EEEE, MMMM dd, yyyy');

  return (
    <header className="header-wrapper animate-fade-in">
      {/* Top Banner Ticker */}
      <div className="header-ticker">
        <div className="ticker-content">
          <span className="flex items-center gap-1"><Zap size={14} /> LIVE</span>
          <span>SHUTDOWN LOOMS</span>
          <span className="text-gray-400">TECHNOLOGY | AI Regulation Framework Proposed by European Commission</span>
          <span className="text-gray-400">CLIMATE | Record Temperatures Across Southern Europe Spark Wildfire Emergencies</span>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="header-top">
        <div className="logo cursor-pointer hover:opacity-80 transition-opacity">
          <div className="logo-icon font-bold">H</div>
          <span>HERMES</span>
        </div>

        <nav className="nav-links">
          <a href="#" className="nav-link active">HOME</a>
          <a href="#" className="nav-link">EXPLORE</a>
          <a href="#" className="nav-link">BIAS MAP</a>
          <a href="#" className="nav-link">ABOUT</a>
        </nav>

        <div className="header-actions">
          <button className="search-btn hover:text-primary transition-colors" aria-label="Search">
            <Search size={22} strokeWidth={1.5} />
          </button>
          <button className="subscribe-btn">SUBSCRIBE</button>
        </div>
      </div>

      {/* Date and Stats Sub-bar */}
      <div className="header-date">
        <span>{today}</span>
        <span className="hidden sm:inline">Tracking {totalSources || 0} sources across {totalStories || 0} stories</span>
      </div>
    </header>
  );
};

export default Header;
