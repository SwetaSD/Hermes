import React from 'react';
import { Search, LayoutGrid, List } from 'lucide-react';

const CATEGORIES = ['ALL', 'POLITICS', 'TECHNOLOGY', 'CLIMATE', 'ECONOMY', 'SCIENCE', 'HEALTH', 'SECURITY', 'CONFLICT'];
const BIAS_CATEGORIES = ['ALL', 'FAR LEFT', 'LEFT', 'CENTER LEFT', 'CENTER', 'CENTER RIGHT', 'RIGHT', 'FAR RIGHT'];

const ExploreFilterBar = ({ 
  searchTerm, 
  setSearchTerm, 
  activeCategory, 
  setActiveCategory,
  activeBias,
  setActiveBias,
  viewMode,
  setViewMode
}) => {
  // return (
  //   <div className="explore-filter-bar mb-10">
      
  //     {/* Top Filter Row: Search + Categories + View Toggle */}
  //     <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-6 w-full border-b border-gray-200 pb-4">
        
  //       {/* Search Input */}
  //       <div className="relative w-full lg:w-64 flex-shrink-0">
  //         <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
  //           <Search size={14} className="text-gray-400" />
  //         </div>
  //         <input
  //           type="text"
  //           className="block w-full pl-9 pr-3 py-2 border border-gray-100 rounded text-xs text-black placeholder-gray-400 focus:outline-none focus:border-gray-300 transition-colors"
  //           placeholder="Search stories..."
  //           value={searchTerm}
  //           onChange={(e) => setSearchTerm(e.target.value)}
  //         />
  //       </div>

  //       {/* Categories */}
  //       <div className="filter-categories flex flex-wrap flex-grow justify-start lg:justify-end w-full" style={{ gap: '0.5rem 1.25rem' }}>
  //         {CATEGORIES.map(cat => (
  //           <button
  //             key={cat}
  //             className={`filter-btn uppercase font-bold transition-colors px-2 py-1 ${
  //               activeCategory === cat 
  //                 ? 'bg-black text-white rounded-sm' 
  //                 : 'text-gray-400 hover:text-black bg-transparent'
  //             }`}
  //             style={{ fontSize: '9px', letterSpacing: '0.15em' }}
  //             onClick={() => setActiveCategory(cat)}
  //           >
  //             {cat}
  //           </button>
  //         ))}
  //       </div>

  //       {/* View Toggle */}
  //       <div className="hidden lg:flex border border-gray-200 rounded-sm divide-x divide-gray-200 ml-4">
  //         <button 
  //           className={`transition-colors ${viewMode === 'grid' ? 'bg-black text-white' : 'text-gray-400 hover:text-black bg-white'}`}
  //           style={{ padding: '0.375rem' }}
  //           onClick={() => setViewMode('grid')}
  //           aria-label="Grid View"
  //         >
  //           <LayoutGrid size={14} />
  //         </button>
  //         <button 
  //           className={`transition-colors ${viewMode === 'list' ? 'bg-black text-white' : 'text-gray-400 hover:text-black bg-white'}`}
  //           style={{ padding: '0.375rem' }}
  //           onClick={() => setViewMode('list')}
  //           aria-label="List View"
  //         >
  //           <List size={14} />
  //         </button>
  //       </div>
  //     </div>

  //     {/* Bottom Bias Filter Row */}
  //     <div className="flex items-center gap-3 font-bold uppercase" style={{ fontSize: '9px', letterSpacing: '0.15em' }}>
  //       <span className="text-gray-300">BIAS:</span>
  //       <div className="flex flex-wrap gap-2">
  //         {BIAS_CATEGORIES.map(bias => (
  //           <button
  //             key={bias}
  //             className={`px-2 py-1 rounded-sm transition-colors border ${
  //               activeBias === bias 
  //                 ? 'bg-black text-white border-black' 
  //                 : 'bg-white border-gray-200 text-gray-400 hover:border-gray-400 hover:text-black'
  //             }`}
  //             onClick={() => setActiveBias(bias)}
  //           >
  //             {bias}
  //           </button>
  //         ))}
  //       </div>
  //     </div>

  //   </div>
  // );
};

export default ExploreFilterBar;
