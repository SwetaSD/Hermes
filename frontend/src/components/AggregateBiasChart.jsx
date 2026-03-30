import React from 'react';

const AggregateBiasChart = ({ stories }) => {
  if (!stories || stories.length === 0) return null;

  // Calculate totals from actual story data
  const biasCounts = {
    left: 0,
    center: 0,
    right: 0
  };

  stories.forEach(story => {
    const scale = story.biasScale || {};
    if (Object.keys(scale).length > 0) {
      biasCounts.left += (scale.left || 0);
      biasCounts.center += (scale.center || 0);
      biasCounts.right += (scale.right || 0);
    }
  });

  const totalAccumulated = Object.values(biasCounts).reduce((sum, val) => sum + val, 0);
  
  const getPct = (val) => {
    if (totalAccumulated === 0) return 0;
    return Math.round((val / totalAccumulated) * 100);
  };

  const data = [
    { label: 'Left', key: 'left', color: '#dc3545', pct: getPct(biasCounts.left) },
    { label: 'Center', key: 'center', color: '#f0c238', pct: getPct(biasCounts.center) },
    { label: 'Right', key: 'right', color: '#2563eb', pct: getPct(biasCounts.right) },
  ];

  return (
    <div className="aggregate-bias-container">
      <div className="aggregate-bias-header">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="8" y1="6" x2="21" y2="6"></line>
          <line x1="8" y1="12" x2="21" y2="12"></line>
          <line x1="8" y1="18" x2="21" y2="18"></line>
          <line x1="3" y1="6" x2="3.01" y2="6"></line>
          <line x1="3" y1="12" x2="3.01" y2="12"></line>
          <line x1="3" y1="18" x2="3.01" y2="18"></line>
        </svg>
        <h2 className="aggregate-bias-title">Aggregate Media Bias — All Tracked Stories</h2>
      </div>

      <div className="aggregate-bias-bars">
        {data.map((item) => (
          <div 
            key={item.key} 
            className="aggregate-bias-bar-col"
            style={{ width: `${Math.max(item.pct, 2)}%` }}
          >
            {item.pct > 0 && (
              <div 
                className="aggregate-bias-bar"
                style={{ 
                  backgroundColor: item.color, 
                  height: `${Math.max(25, item.pct * 1.5)}px`
                }}
              ></div>
            )}
          </div>
        ))}
      </div>
      
      {/* Labels row */}
      <div className="aggregate-bias-labels">
        {data.map((item) => (
          <div 
            key={`${item.key}-label`} 
            className="aggregate-bias-label-col"
            style={{ width: `${Math.max(item.pct, 2)}%` }}
          >
            {item.pct > 0 && (
              <div className="aggregate-bias-label-item">
                <span className="aggregate-bias-pct">{item.pct}%</span>
                <span className="aggregate-bias-label-text">{item.label}</span>
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="aggregate-bias-axis">
        <span>Left</span>
        <span>Center</span>
        <span>Right</span>
      </div>
    </div>
  );
};

export default AggregateBiasChart;
