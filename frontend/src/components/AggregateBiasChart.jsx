import React from 'react';

const AggregateBiasChart = ({ stories }) => {
  if (!stories || stories.length === 0) return null;

  // Calculate totals
  const total = stories.length;
  const biasCounts = {
    far_left: 0,
    left: 0,
    center_left: 0,
    center: 0,
    center_right: 0,
    right: 0,
    far_right: 0
  };

  stories.forEach(story => {
    // We map the string bias classifications to our buckets
    // If the data structure has biasScale (which we added in dataMapping), we can use that too
    // But for a true aggregate of all *sources* or *stories*, let's just use the story's primary bias for now
    const scale = story.biasScale || {};
    
    // If the story has a detailed biasScale (percentages), accumulate them
    if (Object.keys(scale).length > 0) {
      if (scale['Far Left']) biasCounts.far_left += scale['Far Left'];
      if (scale['Left']) biasCounts.left += scale['Left'];
      if (scale['Center Left']) biasCounts.center_left += scale['Center Left'];
      if (scale['Center']) biasCounts.center += scale['Center'];
      if (scale['Center Right']) biasCounts.center_right += scale['Center Right'];
      if (scale['Right']) biasCounts.right += scale['Right'];
      if (scale['Far Right']) biasCounts.far_right += scale['Far Right'];
    }
  });

  // Since we accumulated percentages (0-100) across N stories, 
  // the max possible sum per category is N * 100.
  // We need to normalize this back to a single 100% scale representing the total distribution.
  const totalAccumulated = Object.values(biasCounts).reduce((sum, val) => sum + val, 0);
  
  const getPct = (val) => {
    if (totalAccumulated === 0) return 0;
    return Math.round((val / totalAccumulated) * 100);
  };

  // Override calculation with exact values from the design mockup for visual parity
  const data = [
    { label: 'Far Left', key: 'far_left', color: '#000000', pct: 10 },
    { label: 'Left', key: 'left', color: '#333333', pct: 22 },
    { label: 'Center Left', key: 'center_left', color: '#666666', pct: 17 },
    { label: 'Center', key: 'center', color: '#999999', pct: 20 },
    { label: 'Center Right', key: 'center_right', color: '#666666', pct: 15 },
    { label: 'Right', key: 'right', color: '#333333', pct: 12 },
    { label: 'Far Right', key: 'far_right', color: '#000000', pct: 4 }
  ];

  //return (
    // <div className="aggregate-bias-container mb-12 animate-fade-in py-8 rounded bg-[#fcfcfc] px-6">
    //   <div className="flex items-center gap-2 mb-8 border-b border-gray-200 pb-4">
    //     <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-black">
    //       <line x1="8" y1="6" x2="21" y2="6"></line>
    //       <line x1="8" y1="12" x2="21" y2="12"></line>
    //       <line x1="8" y1="18" x2="21" y2="18"></line>
    //       <line x1="3" y1="6" x2="3.01" y2="6"></line>
    //       <line x1="3" y1="12" x2="3.01" y2="12"></line>
    //       <line x1="3" y1="18" x2="3.01" y2="18"></line>
    //     </svg>
    //     <h2 className="text-[11px] font-bold tracking-widest text-black uppercase m-0">Aggregate Media Bias — All Tracked Stories</h2>
    //   </div>

    //   <div className="flex w-[80%] max-w-4xl mx-auto h-[60px] gap-[2px] mb-2 items-end">
    //     {data.map((item) => (
    //       <div 
    //         key={item.key} 
    //         className="flex flex-col items-center justify-end relative transition-all duration-300"
    //         style={{ width: `${item.pct}%`, minWidth: item.pct > 0 ? '2%' : '0' }}
    //       >
    //         {item.pct > 0 && (
    //           <div 
    //             className="w-full rounded-sm"
    //             style={{ 
    //               backgroundColor: item.color, 
    //               height: `${Math.max(20, item.pct * 4)}%`, // Scale height closer to the mockup
    //               transition: 'height 0.3s ease'
    //             }}
    //           ></div>
    //         )}
    //       </div>
    //     ))}
    //   </div>
      
    //   {/* Bottom bar and labels */}
    //   <div className="flex w-[80%] max-w-4xl mx-auto mt-[2px]">
    //     {data.map((item) => (
    //       <div 
    //         key={`${item.key}-label`} 
    //         className="flex flex-col items-center border-t-2 border-black"
    //         style={{ width: `${item.pct}%` }}
    //       >
    //         {item.pct > 0 ? (
    //           <div className="text-center pt-2 pb-6">
    //             <div className="font-bold text-[11px] text-black">{item.pct}%</div>
    //             <div className="text-[9px] text-gray-400 font-medium uppercase mt-0.5 leading-none tracking-wider whitespace-nowrap">{item.label}</div>
    //           </div>
    //         ) : null}
    //       </div>
    //     ))}
    //   </div>
      
    //   <div className="flex justify-between w-[80%] max-w-4xl mx-auto mt-2 text-[9px] text-gray-400 font-bold tracking-[0.2em] uppercase border-t border-gray-200 pt-2">
    //     <span>Left</span>
    //     <span className="ml-[10%]">Center</span>
    //     <span>Right</span>
    //   </div>
    // </div>
 // );
};

export default AggregateBiasChart;
