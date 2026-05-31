/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useTransition } from 'react';
import { GAMES_DATA } from '../data';
import { Trophy } from 'lucide-react';

interface RankingViewProps {
  onPlayGame: (gameId: string) => void;
}

export default function RankingView({ onPlayGame }: RankingViewProps) {
  const [isPending, startTransition] = useTransition();

  // Top Rank items mapping explicitly to our developed games
  const rank1 = GAMES_DATA.find(g => g.id === 'cafe') || GAMES_DATA[0];
  const rank2 = GAMES_DATA.find(g => g.id === 'jelly') || GAMES_DATA[1];
  const rank3 = GAMES_DATA.find(g => g.id === 'wood') || GAMES_DATA[2];

  return (
    <div className="max-w-[1240px] mx-auto px-6 py-8 space-y-12 select-none">
      
      {/* Page Header Introduction */}
      <div className="text-center space-y-3 max-w-xl mx-auto">
        <div className="bg-[#fdd0ea]/60 px-4 py-1.5 rounded-full text-[#765469] text-xs font-bold w-fit mx-auto flex items-center gap-1.5 shadow-sm border border-pink-200">
          <Trophy className="w-4 h-4 text-rose-500 fill-rose-500" />
          <span>萌萌本週熱門度風雲榜</span>
        </div>
        <h2 className="text-2xl lg:text-3xl font-sans font-bold text-gray-800">
          受歡迎的人氣大碰撞！
        </h2>
        <p className="text-xs text-gray-500 font-medium leading-relaxed font-sans">
          計算全站玩家總計累積玩過熱度、愛心收藏次數與五星打分比例。快來試試大家都愛不釋手的超療癒作品吧！
        </p>
      </div>

      {/* Podium Anim section (Top 3) */}
      <div className="flex flex-col md:flex-row justify-center items-stretch gap-6 pt-12 text-center max-w-4xl mx-auto">
        
        {/* Silver Rank 2 - Display Left */}
        {rank2 && (
          <div className="flex-1 w-full bg-white rounded-3xl border border-gray-100 p-5 shadow-md flex flex-col justify-between hover:scale-102 transition-transform duration-300">
            <div className="space-y-4">
              {/* Rank badge */}
              <div className="relative mx-auto w-fit">
                <span className="text-3xl">🥈</span>
                <div className="absolute -top-3 -right-3 bg-stone-100 text-[#765469] font-mono text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center border border-stone-200 shadow-inner">
                  2
                </div>
              </div>

              <img
                src={rank2.image}
                alt={rank2.title}
                referrerPolicy="no-referrer"
                className="w-24 h-24 rounded-full object-cover mx-auto border-4 border-stone-100 shadow"
              />

              <div>
                <h4 className="font-sans font-bold text-xs text-gray-800">{rank2.title}</h4>
                <p className="text-[10px] text-gray-400 mt-0.5 font-bold">熱度: {rank2.hotness}% (🔥超高人氣)</p>
              </div>
              <p className="text-[11px] text-gray-500 leading-relaxed max-w-[200px] mx-auto font-sans">
                {rank2.description}
              </p>
            </div>

            <div className="pt-4 border-t border-gray-50 mt-4">
              <button
                onClick={() => onPlayGame(rank2.id)}
                className="marshmallow-button w-full bg-[#765469]/20 hover:bg-[#765469]/30 text-[#765469] font-bold py-2.5 rounded-full text-xs"
              >
                進入冒險 ➔
              </button>
            </div>
          </div>
        )}

        {/* Gold Rank 1 - Display Center (Tallest) */}
        {rank1 && (
          <div className="flex-1 w-full bg-white rounded-3xl border-4 border-amber-300 p-6 shadow-xl flex flex-col justify-between relative hover:scale-102 transition-transform duration-300 transform -translate-y-4">
            {/* Floating crown decorator */}
            <div className="absolute -top-8 inset-x-0 mx-auto w-fit text-4xl animate-bounce">
              👑
            </div>

            <div className="space-y-4">
              {/* Rank badge */}
              <div className="relative mx-auto w-fit">
                <span className="text-4xl">🥇</span>
                <div className="absolute -top-2 -right-2 bg-amber-400 text-amber-950 font-mono text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center border border-amber-600 shadow-md">
                  1
                </div>
              </div>

              <img
                src={rank1.image}
                alt={rank1.title}
                referrerPolicy="no-referrer"
                className="w-28 h-28 rounded-full object-cover mx-auto border-4 border-amber-200 shadow-md"
              />

              <div>
                <h4 className="font-sans font-bold text-sm text-[#1b6b4f]">{rank1.title}</h4>
                <p className="text-[10px] text-[#1b6b4f] font-bold mt-0.5">熱度: {rank1.hotness}% (🔥全站極熱門)</p>
              </div>
              <p className="text-xs text-gray-500 font-medium leading-relaxed max-w-[220px] mx-auto font-sans">
                {rank1.description}
              </p>
            </div>

            <div className="pt-4 border-t border-gray-100 mt-4">
              <button
                onClick={() => onPlayGame(rank1.id)}
                className="marshmallow-button w-full bg-primary text-white hover:bg-emerald-700 font-bold py-3 rounded-full text-xs border-emerald-950"
              >
                立即瘋玩 🚀
              </button>
            </div>
          </div>
        )}

        {/* Bronze Rank 3 - Display Right */}
        {rank3 && (
          <div className="flex-1 w-full bg-white rounded-3xl border border-gray-100 p-5 shadow-md flex flex-col justify-between hover:scale-102 transition-transform duration-300">
            <div className="space-y-4">
              {/* Rank badge */}
              <div className="relative mx-auto w-fit">
                <span className="text-3xl">🥉</span>
                <div className="absolute -top-3 -right-3 bg-amber-200 text-[#695f02] font-mono text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center border border-amber-300 shadow-inner">
                  3
                </div>
              </div>

              <img
                src={rank3.image}
                alt={rank3.title}
                referrerPolicy="no-referrer"
                className="w-24 h-24 rounded-full object-cover mx-auto border-4 border-orange-100 shadow"
              />

              <div>
                <h4 className="font-sans font-bold text-xs text-gray-800">{rank3.title}</h4>
                <p className="text-[10px] text-gray-400 mt-0.5 font-bold">熱度: {rank3.hotness}% (🔥療癒推薦)</p>
              </div>
              <p className="text-[11px] text-gray-500 leading-relaxed max-w-[200px] mx-auto font-sans">
                {rank3.description}
              </p>
            </div>

            <div className="pt-4 border-t border-gray-50 mt-4">
              <button
                onClick={() => onPlayGame(rank3.id)}
                className="marshmallow-button w-full bg-[#765469]/20 hover:bg-[#765469]/30 text-[#765469] font-bold py-2.5 rounded-full text-xs"
              >
                進入冒險 ➔
              </button>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
