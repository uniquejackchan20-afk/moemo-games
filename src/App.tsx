/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useTransition, useEffect } from 'react';
import Navbar from './components/Navbar';
import HomeView from './components/HomeView';
import CategoryView from './components/CategoryView';
import RankingView from './components/RankingView';
import GameDetailView from './components/GameDetailView';
import Footer from './components/Footer';
import PolicySupportView from './components/PolicySupportView';
import { GAMES_DATA } from './data';
import { ArrowUp, Play, Trash2, Heart, Sparkles, Gamepad2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  // Master page and game routing targets
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [supportTab, setSupportTab] = useState<'terms' | 'privacy' | 'faq' | 'contact'>('terms');
  const [selectedGameId, setSelectedGameId] = useState<string>('cafe');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Custom user session profile state
  const [loggedInUser, setLoggedInUser] = useState<{ username: string; avatarUrl: string } | null>(null);
  
  // Custom in-memory history data
  const [likedGameIds, setLikedGameIds] = useState<string[]>(['cafe', 'jelly']);
  const [recentlyPlayedIds, setRecentlyPlayedIds] = useState<string[]>(['cafe', 'wood']);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Scroll visibility check for Scroll-to-Top Button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Listen to hash/regulatory route changes from footer links
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash === '#terms') {
        setCurrentPage('support');
        setSupportTab('terms');
        window.scrollTo({ top: 0, behavior: 'instant' });
      } else if (hash === '#privacy') {
        setCurrentPage('support');
        setSupportTab('privacy');
        window.scrollTo({ top: 0, behavior: 'instant' });
      } else if (hash === '#faq') {
        setCurrentPage('support');
        setSupportTab('faq');
        window.scrollTo({ top: 0, behavior: 'instant' });
      } else if (hash === '#contact') {
        setCurrentPage('support');
        setSupportTab('contact');
        window.scrollTo({ top: 0, behavior: 'instant' });
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Login handler
  const handleLogin = (username: string) => {
    setLoggedInUser({
      username,
      avatarUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCYM1WChbAHYMPMMBB6IqLKRh344RuCgtHJQUCoQLBCBKw3yCE-aOsfbtLSEcsVDIbXUerUe4tNiXIbBtFCIOjZZifpxWJLqvQNYEECJIKecLeAWrPdQobwDxhidzAyX0AAEfYEU1nKTWrhBk1BGk5PlNyA9jhCkcjEq_NSLc2eQWtI1W7Onh5Ctnh_hQUbkXEFTEPa_bJwhghbbmaNoOE_tuNtF5sDdWGJLY9Ij7nnuvSHN-OAtuHW0xidpwgSld2kqNciIKzzweNx"
    });
  };

  const handleLogout = () => {
    setLoggedInUser(null);
  };

  // Play Game triggers Page translation and appends historical cache records
  const handlePlayGame = (gameId: string) => {
    setSelectedGameId(gameId);
    
    // Push to recently played history (avoiding duplicate positions)
    setRecentlyPlayedIds(prev => {
      const filtered = prev.filter(id => id !== gameId);
      return [gameId, ...filtered];
    });

    setCurrentPage('detail');
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  // Category tab redirection
  const handleSelectCategoryFromHome = (category: string) => {
    setSearchQuery('');
    setCurrentPage('category');
    // Ensure the category list gets triggered
    setTimeout(() => {
      const catBtns = document.querySelectorAll('button');
      catBtns.forEach(btn => {
        if (btn.textContent?.includes(category === 'action' ? '動作冒險' : category === 'puzzle' ? '益智解謎' : category === 'girls' ? '女生最愛' : '休閒時光')) {
          btn.click();
        }
      });
    }, 100);
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  // Toggle favorite selection
  const handleToggleLike = (gameId: string) => {
    setLikedGameIds(prev =>
      prev.includes(gameId) ? prev.filter(id => id !== gameId) : [...prev, gameId]
    );
  };

  // Remove individual recently played game from history
  const handleRemoveFromHistory = (gameId: string) => {
    setRecentlyPlayedIds(prev => prev.filter(id => id !== gameId));
  };

  const selectedRecentlyPlayedGames = GAMES_DATA.filter(g => recentlyPlayedIds.includes(g.id));
  const selectedLikedGames = GAMES_DATA.filter(g => likedGameIds.includes(g.id));

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/40 text-gray-700">
      
      {/* Navbar segment */}
      <Navbar
        currentPage={currentPage}
        onNavigate={(page) => {
          setCurrentPage(page);
          window.scrollTo({ top: 0, behavior: 'instant' });
        }}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        loggedInUser={loggedInUser}
        onLogin={handleLogin}
        onLogout={handleLogout}
      />

      {/* Main Content Layout Body */}
      <main className="flex-grow pt-28">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage + selectedGameId}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
          >
            {currentPage === 'home' && (
              <HomeView
                onNavigate={(page) => {
                  setCurrentPage(page);
                  window.scrollTo({ top: 0, behavior: 'instant' });
                }}
                onSelectCategory={handleSelectCategoryFromHome}
                onPlayGame={handlePlayGame}
              />
            )}

            {currentPage === 'category' && (
              <CategoryView
                initialCategory="all"
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onPlayGame={handlePlayGame}
              />
            )}

            {currentPage === 'ranking' && (
              <RankingView onPlayGame={handlePlayGame} />
            )}

            {/* Recently Played & Bookmarked Unified Tab */}
            {currentPage === 'recently-played' && (
              <div className="max-w-[1240px] mx-auto px-6 py-8 space-y-12 text-left">
                
                {/* Section A: Recently Played Grid */}
                <div className="space-y-4">
                  <h3 className="text-md font-sans font-bold text-gray-800 flex items-center gap-2 border-b border-gray-100 pb-2">
                    <span className="material-symbols-outlined text-primary text-[20px]">history</span>
                    您最近玩過的遊戲（共 {recentlyPlayedIds.length} 款）
                  </h3>

                  {selectedRecentlyPlayedGames.length === 0 ? (
                    <div className="bg-white rounded-3xl p-12 border border-gray-50 text-center shadow-sm max-w-sm mx-auto">
                      <span className="text-4xl block mb-2">🐾</span>
                      <p className="text-xs text-gray-400 font-bold">還沒有任何遊玩足跡喔！</p>
                      <button
                        onClick={() => setCurrentPage('home')}
                        className="mt-4 px-5 py-2 bg-primary text-white text-xs font-bold rounded-full border-b-2 border-emerald-950"
                      >
                        看有什麼好玩的 ➔
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
                      {selectedRecentlyPlayedGames.map(game => (
                        <div
                          key={game.id}
                          className="bg-white rounded-3xl border border-emerald-50 overflow-hidden shadow-sm flex gap-4 p-4 hover:border-emerald-200 transition-colors duration-200 relative group"
                        >
                          <img
                            src={game.image}
                            alt={game.title}
                            referrerPolicy="no-referrer"
                            className="w-20 h-20 rounded-2xl object-cover shrink-0 border"
                          />
                          <div className="flex flex-col justify-between py-0.5 flex-grow">
                            <div>
                              <h4 className="font-bold text-xs text-gray-800 leading-tight">{game.title}</h4>
                              <p className="text-[10px] text-gray-400 mt-1 line-clamp-2">{game.description}</p>
                            </div>
                            <div className="flex gap-2 justify-between items-center mt-2">
                              {/* Left triggers */}
                              <button
                                onClick={() => handlePlayGame(game.id)}
                                className="bg-[#a7f3d0] hover:bg-emerald-300 text-teal-900 font-bold px-4 py-1.5 rounded-full text-[10px] flex items-center gap-1 transition-colors"
                              >
                                <Play className="w-2.5 h-2.5 fill-teal-900" />
                                繼續玩
                              </button>
                              
                              {/* Clear trash icon */}
                              <button
                                onClick={() => handleRemoveFromHistory(game.id)}
                                title="清除這條足跡"
                                className="p-1 px-2 border border-stone-200 text-stone-400 hover:text-red-500 rounded-full hover:bg-red-50 transition-all flex items-center gap-1 text-[10px]"
                              >
                                <Trash2 className="w-3 h-3" />
                                <span>刪除</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Section B: Liked / Bookmarked Games */}
                <div className="space-y-4 pt-6">
                  <h3 className="text-md font-sans font-bold text-gray-800 flex items-center gap-2 border-b border-gray-100 pb-2">
                    <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
                    我的愛心收藏庫 ({likedGameIds.length} 款)
                  </h3>

                  {selectedLikedGames.length === 0 ? (
                    <div className="bg-white rounded-3xl p-12 border border-gray-50 text-center shadow-sm max-w-sm mx-auto">
                      <span className="text-4xl block mb-2">💖</span>
                      <p className="text-xs text-gray-400 font-bold">目前還沒有點亮愛心收藏喔！</p>
                      <button
                        onClick={() => setCurrentPage('category')}
                        className="mt-4 px-5 py-2 bg-[#765469]/20 text-secondary text-xs font-bold rounded-full"
                      >
                        去逛逛精選庫 ➔
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-8">
                      {selectedLikedGames.map(game => (
                        <div
                          key={game.id}
                          className="bg-white rounded-3xl border border-pink-50 overflow-hidden shadow-sm flex gap-4 p-4 hover:border-pink-200 transition-all duration-200 relative"
                        >
                          <img
                            src={game.image}
                            alt={game.title}
                            referrerPolicy="no-referrer"
                            className="w-20 h-20 rounded-2xl object-cover shrink-0 border"
                          />
                          <div className="flex flex-col justify-between py-0.5 flex-grow">
                            <div>
                              <div className="flex justify-between items-start gap-1">
                                <h4 className="font-bold text-xs text-gray-800 leading-tight block">{game.title}</h4>
                                <button
                                  onClick={() => handleToggleLike(game.id)}
                                  className="text-rose-500 hover:scale-110 duration-150"
                                >
                                  <Heart className="w-3.5 h-3.5 fill-rose-500" />
                                </button>
                              </div>
                              <p className="text-[10px] text-gray-400 mt-1 line-clamp-2">{game.description}</p>
                            </div>
                            <div className="mt-2 text-right">
                              <button
                                onClick={() => handlePlayGame(game.id)}
                                className="bg-[#765469]/10 hover:bg-[#765469]/20 text-secondary font-bold px-4 py-1.5 rounded-full text-[10px] select-none"
                              >
                                立即開玩
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            )}

            {currentPage === 'detail' && (
              <GameDetailView
                gameId={selectedGameId}
                onPlayGame={handlePlayGame}
                likedGameIds={likedGameIds}
                onToggleLike={handleToggleLike}
                loggedInUser={loggedInUser}
              />
            )}

            {currentPage === 'support' && (
              <PolicySupportView
                initialTab={supportTab}
                onNavigateHome={() => {
                  setCurrentPage('home');
                  window.location.hash = '';
                }}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer segment */}
      <Footer />

      {/* Back-to-Top FAB */}
      {showScrollTop && (
        <button
          onClick={handleScrollToTop}
          className="fixed bottom-6 right-6 z-50 p-3 bg-primary hover:bg-emerald-700 text-white border-b-4 border-emerald-950 hover:scale-105 active:translate-y-0.5 rounded-full shadow-lg transition-all duration-300 cursor-pointer"
          title="返會頂部"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}

    </div>
  );
}
