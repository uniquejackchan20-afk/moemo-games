/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useTransition } from 'react';
import { Game } from '../types';
import { GAMES_DATA } from '../data';
import { Zap, Puzzle, Heart, Coffee, Star, Play, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

interface HomeViewProps {
  onNavigate: (page: string, extra?: string) => void;
  onSelectCategory: (category: string) => void;
  onPlayGame: (gameId: string) => void;
}

export default function HomeView({
  onNavigate,
  onSelectCategory,
  onPlayGame,
}: HomeViewProps) {
  const [isPending, startTransition] = useTransition();

  // Filter puzzle items specifically for Section: "益智類遊戲"
  const puzzleGames = GAMES_DATA.filter(g => g.category === 'puzzle');

  // Suggested item rows mapped to developed games
  const recommendedBig = GAMES_DATA.find(g => g.id === 'cafe') || GAMES_DATA[0];
  const recommendedSm1 = GAMES_DATA.find(g => g.id === 'jelly') || GAMES_DATA[1];
  const recommendedSm2 = GAMES_DATA.find(g => g.id === 'wood') || GAMES_DATA[2];

  // Random Recommendation Picker
  const handleRandomPlay = () => {
    const randomIndex = Math.floor(Math.random() * GAMES_DATA.length);
    const chosenGame = GAMES_DATA[randomIndex];
    onPlayGame(chosenGame.id);
  };

  return (
    <div className="max-w-[1240px] mx-auto px-6 py-8 space-y-12">
      
      {/* Hero Banner Area */}
      <div className="relative rounded-3xl overflow-hidden shadow-2xl border bg-white flex flex-col-reverse lg:flex-row items-center justify-between min-h-[440px]">
        {/* Absolute warm radial gradient background */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(242,229,128,0.2),transparent_70%)] pointer-events-none" />

        {/* Text Area */}
        <div className="flex-1 p-8 lg:p-12 space-y-5 z-10 max-w-xl text-left">
          <div className="bg-[#a7f3d0] text-teal-800 text-[10px] font-bold tracking-widest uppercase py-1 px-3.5 rounded-full w-fit shadow-inner">
            ✨ 精選療癒線上遊戲
          </div>
          <h1 className="text-3xl lg:text-4xl font-sans font-bold tracking-tight text-[#1b6b4f] leading-tight">
            歡迎來到萌萌遊戲天堂！
          </h1>
          <p className="text-gray-500 font-medium text-sm leading-relaxed">
            在這裡，每一個角落都充滿驚喜。讓可愛的小動物、芬芳的麵包香氣與繽紛的拼圖，陪你度過最安逸溫馨的午後時光。
          </p>
          <div className="flex flex-wrap gap-4 pt-4">
            <button
              onClick={() => onPlayGame('cafe')}
              className="marshmallow-button bg-primary text-white hover:bg-emerald-700 font-bold px-8 py-3.5 rounded-full text-xs flex items-center gap-2 border-emerald-950 shadow-md"
            >
              <Play className="w-4 h-4 fill-white" />
              立即開玩 (小動物咖啡廳)
            </button>
            <button
              onClick={handleRandomPlay}
              className="marshmallow-button bg-pink-100 hover:bg-pink-100/90 text-pink-700 font-bold px-6 py-3.5 rounded-full text-xs flex items-center gap-1.5 border-pink-200 shadow-sm"
            >
              <Sparkles className="w-4 h-4 text-pink-500 animate-spin" />
              隨機推薦
            </button>
          </div>
        </div>

        {/* Hero Image Viewport */}
        <div className="flex-1 w-full lg:w-1/2 aspect-[4/3] lg:aspect-auto h-full min-h-[300px] lg:min-h-[440px] relative">
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBS84TmphOqbWStZyoOxno59BF9Se1A4CUKxR7NY3V05peGQPy2TzVDm7nsesDt8tRRc5iKD2Y3F-_SztMiXvYNrnYQ-SWQMaiPy_fOIJLfMfjj9S66nFPnbHWHC-7sIxWqXk_RTgUN-03rXtRI0Y3PoycQA2GFsPHB-PTp8wbQJIAqRr02HsyYFw5YrwpnsxFJeYfqwRUYVDjvBO7tfbz7PHEdn9olnTs894u908O0a3lj5YrBdnI26dneoANEDoLhx39BKdttIl5z"
            alt="Animal Cafe Cozy Room Decoration"
            className="absolute inset-0 w-full h-full object-cover"
          />
          {/* Subtle fade shadow overlay on image */}
          <div className="absolute inset-0 bg-gradient-to-r from-white via-transparent to-transparent hidden lg:block" />
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white to-transparent lg:hidden" />
        </div>
      </div>

      {/* 熱門分類 Area */}
      <section className="space-y-4">
        <h3 className="text-md font-sans font-bold text-gray-800 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[20px]">grid_view</span>
          熱門分類
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          <button
            onClick={() => onSelectCategory('puzzle')}
            className="marshmallow-button flex items-center gap-4 bg-[#fdd0ea]/35 hover:bg-[#fdd0ea]/50 border-b-2 border-[#765469]/10 p-5 rounded-2xl cursor-pointer text-left transition-colors duration-200"
          >
            <div className="bg-pink-100 p-3 rounded-xl text-pink-700 shadow-sm">
              <Puzzle className="w-5 h-5 fill-pink-700" />
            </div>
            <div>
              <h4 className="font-sans font-bold text-xs text-pink-900">經典益智</h4>
              <p className="text-[10px] text-pink-700 font-medium">連線、推木板與思考力挑戰</p>
            </div>
          </button>

          <button
            onClick={() => onSelectCategory('simulation')}
            className="marshmallow-button flex items-center gap-4 bg-[#a7f3d0]/35 hover:bg-[#a7f3d0]/50 border-b-2 border-[#1b6b4f]/10 p-5 rounded-2xl cursor-pointer text-left transition-colors duration-200"
          >
            <div className="bg-[#a7f3d0] p-3 rounded-xl text-teal-800 shadow-sm">
              <Coffee className="w-5 h-5 text-teal-800" />
            </div>
            <div>
              <h4 className="font-sans font-bold text-xs text-teal-900">經營模擬</h4>
              <p className="text-[10px] text-teal-700 font-medium font-sans">小動物咖啡廳與悠閒下午茶</p>
            </div>
          </button>

        </div>
      </section>

      {/* 為你推薦 (Featured highlight grid) */}
      <section className="space-y-4">
        <h3 className="text-md font-sans font-bold text-gray-800 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[20px]">thumb_up</span>
          為你推薦
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Big Featured Left Card */}
          <div className="lg:col-span-2 bg-white rounded-3xl border border-emerald-50 overflow-hidden shadow-lg flex flex-col md:flex-row bubble-card transition-all duration-300 min-h-[300px]">
            <div className="md:w-1/2 relative min-h-[220px]">
              <img
                src={recommendedBig.image}
                alt={recommendedBig.title}
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
            <div className="md:w-1/2 p-6 flex flex-col justify-between text-left">
              <div className="space-y-3">
                <div className="flex gap-2 items-center">
                  <span className="bg-pink-100 text-pink-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-pink-200">
                    推薦首選
                  </span>
                  <span className="text-xs text-amber-500 font-bold flex items-center gap-0.5">
                    <Star className="w-3.5 h-3.5 fill-amber-500" /> {recommendedBig.rating}
                  </span>
                </div>
                <h4 className="font-sans font-bold text-gray-900 text-md">{recommendedBig.title}</h4>
                <p className="text-xs text-gray-500 font-medium leading-relaxed">
                  {recommendedBig.description}
                </p>
              </div>

              <div className="pt-4 flex justify-between items-center border-t border-gray-50">
                <span className="text-[10px] text-gray-405 font-bold">已玩次數: {recommendedBig.timesPlayed.toLocaleString()}</span>
                <button
                  onClick={() => onPlayGame(recommendedBig.id)}
                  className="marshmallow-button bg-[#765469] text-white hover:bg-[#5c3d51] px-5 py-2 rounded-full text-xs font-bold border-b-2 border-[#5c3d51] shadow"
                >
                  開始闖關 ➔
                </button>
              </div>
            </div>
          </div>

          {/* Right Sub-items */}
          <div className="flex flex-col gap-4 text-left">
            
            {/* Sm Item 1 */}
            <div 
              onClick={() => onPlayGame(recommendedSm1.id)}
              className="flex gap-4 p-4 bg-white rounded-2xl border border-gray-100 hover:border-teal-200 hover:-translate-y-1 transition-all duration-200 cursor-pointer shadow-sm"
            >
              <img
                src={recommendedSm1.image}
                alt={recommendedSm1.title}
                className="w-20 h-20 rounded-xl object-cover shrink-0"
              />
              <div className="flex flex-col justify-between py-1">
                <div>
                  <h5 className="font-bold text-xs text-gray-900">{recommendedSm1.title}</h5>
                  <p className="text-[10px] text-gray-400 line-clamp-2 mt-1">{recommendedSm1.description}</p>
                </div>
                <span className="text-[10px] text-amber-500 font-bold flex items-center gap-0.5 mt-1">
                  <Star className="w-3 h-3 fill-amber-500 text-amber-500" /> {recommendedSm1.rating}
                </span>
              </div>
            </div>

            {/* Sm Item 2 */}
            <div 
              onClick={() => onPlayGame(recommendedSm2.id)}
              className="flex gap-4 p-4 bg-white rounded-2xl border border-gray-100 hover:border-teal-200 hover:-translate-y-1 transition-all duration-200 cursor-pointer shadow-sm"
            >
              <img
                src={recommendedSm2.image}
                alt={recommendedSm2.title}
                className="w-20 h-20 rounded-xl object-cover shrink-0"
              />
              <div className="flex flex-col justify-between py-1">
                <div>
                  <h5 className="font-bold text-xs text-gray-900">{recommendedSm2.title}</h5>
                  <p className="text-[10px] text-gray-400 line-clamp-2 mt-1">{recommendedSm2.description}</p>
                </div>
                <span className="text-[10px] text-amber-500 font-bold flex items-center gap-0.5 mt-1">
                  <Star className="w-3 h-3 fill-amber-500 text-amber-500" /> {recommendedSm2.rating}
                </span>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 益智類遊戲 (Classic Puzzle row - matches Screen 1 specifications) */}
      <section className="space-y-6 pt-4">
        <div className="flex justify-between items-center border-b border-gray-100 pb-3">
          <h3 className="text-md font-sans font-bold text-gray-800 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[20px]">smart_toy</span>
            益智類遊戲
          </h3>
          <button
            onClick={() => onSelectCategory('puzzle')}
            className="text-xs font-bold text-primary hover:text-emerald-700 flex items-center gap-1 cursor-pointer"
          >
            查看全部 ➔
          </button>
        </div>

        {/* 6-game grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {puzzleGames.map(game => (
            <div
              key={game.id}
              className="bg-white rounded-3xl border border-emerald-100/60 overflow-hidden shadow-md flex flex-col justify-between bubble-card transition-all duration-300 text-left cursor-pointer"
              onClick={() => onPlayGame(game.id)}
            >
              <div className="relative aspect-[16/10] overflow-hidden">
                <img
                  src={game.image}
                  alt={game.title}
                  className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-300"
                />
                
                {/* Floating Tags Overlay */}
                <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
                  {game.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="bg-white/95 backdrop-blur-sm text-[#1b6b4f] text-[9px] font-bold tracking-wider px-2 py-0.5 rounded-full border border-teal-50 shadow-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Score floating indicator */}
                <div className="absolute bottom-3 right-3 bg-black/50 backdrop-blur-sm text-yellow-400 text-[10px] font-mono font-bold px-2 py-1 rounded-full flex items-center gap-0.5">
                  <Star className="w-3 h-3 fill-yellow-400" />
                  <span>{game.rating}</span>
                </div>
              </div>

              {/* Desc fields */}
              <div className="p-5 flex-grow flex flex-col justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <h4 className="font-sans font-bold text-sm text-gray-800 tracking-tight group-hover:text-primary transition-colors">
                      {game.title}
                    </h4>
                  </div>
                  <p className="text-[11px] text-gray-400 font-medium leading-relaxed line-clamp-2">
                    {game.description}
                  </p>
                </div>

                {/* Card CTA Footer */}
                <div className="flex justify-between items-center pt-3 border-t border-gray-50 text-[10px] font-bold text-gray-400">
                  <span>🎮 {game.timesPlayed.toLocaleString()} 人玩過</span>
                  <span className="text-secondary font-sans font-medium hover:underline text-xs">
                    立即試玩 ➔
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
