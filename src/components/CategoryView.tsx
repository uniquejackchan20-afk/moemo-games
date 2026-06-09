/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo, useTransition } from 'react';
import { Game } from '../types';
import { GAMES_DATA } from '../data';
import { Search, Star, SlidersHorizontal, Eye } from 'lucide-react';

interface CategoryViewProps {
  initialCategory: string;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onPlayGame: (gameId: string) => void;
}

const ITEMS_PER_PAGE = 6;

const CATEGORIES = [
  { id: 'all', name: '全部遊戲' },
  { id: 'puzzle', name: '益智解謎' },
  { id: 'simulation', name: '模擬經營' },
];

export default function CategoryView({
  initialCategory,
  searchQuery,
  onSearchChange,
  onPlayGame,
}: CategoryViewProps) {
  const [selectedCategory, setSelectedCategory] = useState(initialCategory || 'all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<'all' | 'easy' | 'medium' | 'hard'>('all');
  const [selectedDuration, setSelectedDuration] = useState<'all' | 'short' | 'medium' | 'long'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [isPending, startTransition] = useTransition();

  // Reset page when queries change
  const resetPage = () => setCurrentPage(1);

  // Filter processes
  const filteredGames = useMemo(() => {
    return GAMES_DATA.filter(game => {
      // Category filter
      if (selectedCategory !== 'all' && game.category !== selectedCategory) return false;
      // Difficulty filter
      if (selectedDifficulty !== 'all' && game.difficulty !== selectedDifficulty) return false;
      // Duration filter
      if (selectedDuration !== 'all' && game.playTime !== selectedDuration) return false;
      // Search keyword filter
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        return (
          game.title.toLowerCase().includes(q) ||
          game.description.toLowerCase().includes(q) ||
          game.tags.some(tag => tag.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [selectedCategory, selectedDifficulty, selectedDuration, searchQuery]);

  // Pagination bounds
  const totalPages = Math.ceil(filteredGames.length / ITEMS_PER_PAGE);
  const paginatedGames = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredGames.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredGames, currentPage]);

  return (
    <div className="max-w-[1240px] mx-auto px-6 py-8 flex flex-col lg:flex-row gap-8">
      
      {/* Sidebar Filter Panel */}
      <aside className="w-full lg:w-64 space-y-6 shrink-0 text-left">
        <div className="bg-white p-5 rounded-3xl border border-emerald-50 shadow-md space-y-5">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
            <SlidersHorizontal className="w-4.5 h-4.5 text-[#1b6b4f]" />
            <span className="font-heading font-bold text-sm text-gray-800">篩選條件</span>
          </div>

          {/* Search form in sidebar */}
          <div className="space-y-1.5">
            <label htmlFor="search-input-category" className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">搜尋關聯字</label>
            <div className="relative">
              <input
                id="search-input-category"
                type="text"
                placeholder="搜尋遊戲名稱或標籤..."
                value={searchQuery}
                aria-label="搜尋遊戲名稱或標籤"
                onChange={(e) => {
                  onSearchChange(e.target.value);
                  resetPage();
                }}
                className="w-full bg-gray-50 border border-gray-100 placeholder-gray-400 focus:border-[#1b6b4f] text-[11px] font-medium rounded-full py-2.5 pl-3.5 pr-8 outline-none shadow-inner"
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
            </div>
          </div>

          {/* Difficulty Dropdowns */}
          <div className="space-y-2">
            <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">遊戲難易度</span>
            <div className="flex flex-col gap-1.5 text-xs font-bold text-gray-700">
              <button
                onClick={() => { setSelectedDifficulty('all'); resetPage(); }}
                className={`py-2 px-3 rounded-xl border text-left transition-colors flex justify-between ${
                  selectedDifficulty === 'all' ? 'bg-[#a7f3d0]/30 border-primary text-primary' : 'bg-transparent border-gray-100 hover:bg-gray-50'
                }`}
              >
                <span>全部難度</span>
                <span className="opacity-50">All</span>
              </button>
              <button
                onClick={() => { setSelectedDifficulty('easy'); resetPage(); }}
                className={`py-2 px-3 rounded-xl border text-left transition-colors flex justify-between ${
                  selectedDifficulty === 'easy' ? 'bg-[#a7f3d0]/30 border-primary text-primary' : 'bg-transparent border-gray-100 hover:bg-gray-50'
                }`}
              >
                <span>簡單 (療癒)</span>
                <span className="text-emerald-600">Easy</span>
              </button>
              <button
                onClick={() => { setSelectedDifficulty('medium'); resetPage(); }}
                className={`py-2 px-3 rounded-xl border text-left transition-colors flex justify-between ${
                  selectedDifficulty === 'medium' ? 'bg-[#a7f3d0]/30 border-primary text-primary' : 'bg-transparent border-gray-100 hover:bg-gray-50'
                }`}
              >
                <span>中等 (挑戰)</span>
                <span className="text-orange-600">Medium</span>
              </button>
              <button
                onClick={() => { setSelectedDifficulty('hard'); resetPage(); }}
                className={`py-2 px-3 rounded-xl border text-left transition-colors flex justify-between ${
                  selectedDifficulty === 'hard' ? 'bg-[#a7f3d0]/30 border-primary text-primary' : 'bg-transparent border-gray-100 hover:bg-gray-50'
                }`}
              >
                <span>困難 (燒腦)</span>
                <span className="text-red-600">Hard</span>
              </button>
            </div>
          </div>

          {/* Average Play Clock */}
          <div className="space-y-2">
            <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">遊戲體驗時長</span>
            <div className="flex flex-col gap-1.5 text-xs font-bold text-gray-700">
              <button
                onClick={() => { setSelectedDuration('all'); resetPage(); }}
                className={`py-2 px-3 rounded-xl border text-left transition-colors ${
                  selectedDuration === 'all' ? 'bg-[#f3e580]/30 border-amber-600 text-amber-900' : 'bg-transparent border-gray-100 hover:bg-gray-50'
                }`}
              >
                🕒 不限時長
              </button>
              <button
                onClick={() => { setSelectedDuration('short'); resetPage(); }}
                className={`py-3 px-3 rounded-xl border text-left transition-colors ${
                  selectedDuration === 'short' ? 'bg-[#f3e580]/30 border-amber-600 text-amber-900' : 'bg-transparent border-gray-100 hover:bg-gray-50'
                }`}
              >
                🔋 5分鐘內 (休閒)
              </button>
              <button
                onClick={() => { setSelectedDuration('medium'); resetPage(); }}
                className={`py-3 px-3 rounded-xl border text-left transition-colors ${
                  selectedDuration === 'medium' ? 'bg-[#f3e580]/30 border-amber-600 text-amber-900' : 'bg-transparent border-gray-100 hover:bg-gray-50'
                }`}
              >
                ⏳ 5-15分鐘 (挑戰)
              </button>
              <button
                onClick={() => { setSelectedDuration('long'); resetPage(); }}
                className={`py-3 px-3 rounded-xl border text-left transition-colors ${
                  selectedDuration === 'long' ? 'bg-[#f3e580]/30 border-amber-600 text-amber-900' : 'bg-transparent border-gray-100 hover:bg-gray-50'
                }`}
              >
                🎬 15分鐘以上 (沉浸)
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content grid area */}
      <main className="flex-1 space-y-6">
        
        {/* Category Tabs Top Bar */}
        <div className="flex gap-2 overflow-x-auto pb-2 border-b border-gray-100 custom-scrollbar justify-start">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => { setSelectedCategory(cat.id); resetPage(); }}
              className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer shadow-sm border ${
                selectedCategory === cat.id
                  ? 'bg-primary border-primary text-white scale-102'
                  : 'bg-white border-gray-100 hover:border-gray-200 text-gray-500'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Counter statement */}
        <p className="text-left text-xs font-bold text-gray-500 bg-gray-50 py-2 px-4 rounded-xl border border-gray-100">
          🔍 篩選結果：共找到 <span className="text-primary font-mono">{filteredGames.length}</span> 款符合條件的療癒小遊戲！
        </p>

        {/* List of Game Cards */}
        {paginatedGames.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-md">
            <span className="material-symbols-outlined text-[60px] text-gray-300 mb-4 block" style={{ fontVariationSettings: "'FILL' 0" }}>sentiment_neutral</span>
            <h4 className="font-bold text-sm text-gray-700">哎呀！找不到符合條件的遊戲</h4>
            <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
              試著清除一些篩選條件，或是輸入其他關鍵字搜尋看看吧！
            </p>
            <button
              onClick={() => {
                startTransition(() => {
                  setSelectedCategory('all');
                  setSelectedDifficulty('all');
                  setSelectedDuration('all');
                  onSearchChange('');
                  resetPage();
                });
              }}
              className="mt-6 px-5 py-2 bg-primary/15 hover:bg-primary/25 text-primary text-xs font-bold rounded-full"
            >
              清除所有篩選條件
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedGames.map(game => (
              <div
                key={game.id}
                onClick={() => onPlayGame(game.id)}
                className="bg-white rounded-3xl border border-emerald-100/60 overflow-hidden shadow-md flex flex-col justify-between bubble-card transition-all duration-300 text-left cursor-pointer"
              >
                <div className="relative aspect-[16/10] overflow-hidden">
                  <img
                    src={game.image}
                    alt={game.title}
                    className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-300"
                  />
                  {/* Rating Badge */}
                  <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm text-yellow-400 text-[10px] font-mono font-bold px-2 py-1 rounded-full flex items-center gap-0.5">
                    <Star className="w-3.5 h-3.5 fill-yellow-400" />
                    <span>{game.rating}</span>
                  </div>
                </div>

                <div className="p-5 flex-grow flex flex-col justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center gap-2">
                      <span className="bg-emerald-50 text-teal-800 text-[8px] font-bold px-2 py-0.5 rounded-full border border-teal-100">
                        {game.categoryName}
                      </span>
                      <span className="text-[9px] text-gray-500 font-bold">
                        {game.difficultyName} | {game.playTimeName}
                      </span>
                    </div>
                    <h4 className="font-sans font-bold text-sm text-gray-800 tracking-tight group-hover:text-primary transition-colors">
                      {game.title}
                    </h4>
                    <p className="text-[11px] text-gray-400 font-medium leading-relaxed line-clamp-3">
                      {game.description}
                    </p>
                  </div>

                  {/* Play Action */}
                  <div className="flex justify-between items-center pt-3 border-t border-gray-50 text-[10px] font-bold text-[#1b6b4f]">
                    <span>🎮 {game.timesPlayed.toLocaleString()} 人玩過</span>
                    <span className="bg-[#a7f3d0] hover:bg-emerald-300 font-bold px-3 py-1.5 rounded-full text-[9px] hover:-translate-y-0.5 transition-transform flex items-center gap-1 shadow-sm">
                      <Eye className="w-3 h-3" />
                      立即預覽
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Paging controls */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 pt-6">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3.5 py-2 border border-gray-100 hover:border-gray-200 bg-white hover:bg-gray-50 rounded-full text-xs font-bold text-gray-600 disabled:opacity-50 disabled:hover:bg-white cursor-pointer select-none shadow-sm"
            >
              上一頁
            </button>
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`w-9 h-9 font-mono text-xs font-bold rounded-full transition-all border ${
                  currentPage === i + 1
                    ? 'bg-primary border-primary text-white scale-105 shadow-sm'
                    : 'bg-white border-gray-100 hover:border-gray-200 text-gray-600'
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-3.5 py-2 border border-gray-100 hover:border-gray-200 bg-white hover:bg-gray-50 rounded-full text-xs font-bold text-gray-600 disabled:opacity-50 disabled:hover:bg-white cursor-pointer select-none shadow-sm"
            >
              下一頁
            </button>
          </div>
        )}

      </main>

    </div>
  );
}
