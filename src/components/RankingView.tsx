/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useTransition } from 'react';
import { Game } from '../types';
import { GAMES_DATA, OTHER_LEADERBOARD } from '../data';
import { Trophy, Flame, Play, Star } from 'lucide-react';
import { motion } from 'motion/react';

interface RankingViewProps {
  onPlayGame: (gameId: string) => void;
}

export default function RankingView({ onPlayGame }: RankingViewProps) {
  const [isPending, startTransition] = useTransition();

  // Top Rank items mapping
  const rank1 = GAMES_DATA.find(g => g.id === 'hamster') || GAMES_DATA[0];
  const rank2 = GAMES_DATA.find(g => g.id === 'cloud_cat') || GAMES_DATA[1];
  const rank3 = GAMES_DATA.find(g => g.id === 'dream_fox') || GAMES_DATA[2];

  // List Item Rows: 4, 5, 6 from GAMES_DATA. 7, 8, 9, 10 from OTHER_LEADERBOARD
  const listGAMES = [
    { ...GAMES_DATA.find(g => g.id === 'cake_puzzle'), rank: 4, customTitle: '草莓蛋糕拼拼樂', hotKey: 89, isOther: false },
    { ...GAMES_DATA.find(g => g.id === 'rainy_duck'), rank: 5, customTitle: '雨中散步小鴨', hotKey: 85, isOther: false },
    { ...GAMES_DATA.find(g => g.id === 'balloon_bunny'), rank: 6, customTitle: '氣球兔兔飛行記', hotKey: 78, isOther: false },
  ];

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
        <p className="text-xs text-gray-500 font-medium leading-relaxed">
          計算全站玩家總計累積玩過熱度、愛心收藏次數與五星打分比例。快來試試大家都愛不釋手的超療癒作品吧！
        </p>
      </div>

      {/* Podium Anim section (Top 3) */}
      <div className="flex flex-col md:flex-row justify-center items-end gap-6 pt-12 text-center max-w-4xl mx-auto">
        
        {/* Silver Rank 2 - Display Left */}
        <div className="order-2 md:order-1 flex-1 w-full bg-white rounded-3xl border border-gray-100 p-5 shadow-md flex flex-col justify-between hover:scale-102 transition-transform duration-300">
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
              <h4 className="font-heading font-bold text-xs text-gray-800">{rank2.title}</h4>
              <p className="text-[10px] text-gray-400 mt-0.5">熱度: {rank2.hotness}% (🔥超高人氣)</p>
            </div>
            <p className="text-[11px] text-gray-500 leading-relaxed max-w-[200px] mx-auto">
              {rank2.description}
            </p>
          </div>

          <div className="pt-4 border-t border-gray-50 mt-4">
            <button
              onClick={() => onPlayGame(rank2.id)}
              className="marshmallow-button w-full bg-[#765469]/20 hover:bg-[#765469]/30 text-secondary font-bold py-2.5 rounded-full text-xs"
            >
              進入冒險 ➔
            </button>
          </div>
        </div>

        {/* Gold Rank 1 - Display Center (Tallest) */}
        <div className="order-1 md:order-2 flex-1 w-full bg-white rounded-3xl border-4 border-amber-300 p-6 shadow-xl flex flex-col justify-between relative transform -translate-y-4 hover:scale-102 transition-transform duration-300">
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
              <p className="text-[10px] text-teal-800 font-bold mt-0.5">熱度: {rank1.hotness}% (🔥全站極熱門)</p>
            </div>
            <p className="text-xs text-gray-500 font-medium leading-relaxed max-w-[220px] mx-auto">
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

        {/* Bronze Rank 3 - Display Right */}
        <div className="order-3 flex-1 w-full bg-white rounded-3xl border border-gray-100 p-5 shadow-md flex flex-col justify-between hover:scale-102 transition-transform duration-300">
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
              <h4 className="font-heading font-bold text-xs text-gray-800">{rank3.title}</h4>
              <p className="text-[10px] text-gray-400 mt-0.5">熱度: {rank3.hotness}% (🔥療癒推薦)</p>
            </div>
            <p className="text-[11px] text-gray-500 leading-relaxed max-w-[200px] mx-auto">
              {rank3.description}
            </p>
          </div>

          <div className="pt-4 border-t border-gray-50 mt-4">
            <button
              onClick={() => onPlayGame(rank3.id)}
              className="marshmallow-button w-full bg-[#765469]/20 hover:bg-[#765469]/30 text-secondary font-bold py-2.5 rounded-full text-xs"
            >
              進入冒險 ➔
            </button>
          </div>
        </div>

      </div>

      {/* Ranks 4 to 10 List Sheet */}
      <section className="max-w-3xl mx-auto space-y-4">
        <h3 className="text-md font-sans font-bold text-gray-800 text-left flex items-center gap-2 border-b border-gray-100 pb-2">
          <span className="material-symbols-outlined text-primary text-[20px]">leaderboard</span>
          人氣風雲排行（4 - 10名）
        </h3>

        {/* Dynamic score listing */}
        <div className="space-y-3">
          
          {/* Top 4-6 from model games list */}
          {listGAMES.map((row) => {
            return (
              <div
                key={row.rank}
                onClick={() => onPlayGame(row.id || 'jelly')}
                className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100 hover:border-[#a7f3d0] transition-colors shadow-sm cursor-pointer hover:translate-x-1 duration-150 text-left"
              >
                <div className="flex items-center gap-4">
                  <span className="font-mono text-sm font-bold w-6 text-center text-gray-400">
                    {row.rank}
                  </span>
                  <img
                    src={row.image}
                    alt={row.customTitle}
                    referrerPolicy="no-referrer"
                    className="w-12 h-12 rounded-xl object-cover border"
                  />
                  <div>
                    <h4 className="font-bold text-xs text-gray-800">{row.customTitle}</h4>
                    <p className="text-[10px] text-gray-400 font-medium">全站累積：{row.timesPlayed?.toLocaleString()} 次播放</p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  {/* Hotness stats */}
                  <div className="text-right">
                    <span className="text-[10px] text-rose-500 font-bold flex items-center gap-0.5">
                      <Flame className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                      {row.hotKey}% 熱度
                    </span>
                    <p className="text-[9px] text-gray-400 font-medium">穩定上升中</p>
                  </div>
                  
                  {/* Play circle icon */}
                  <span className="bg-gray-50 hover:bg-emerald-50 text-primary p-2.5 rounded-full border border-gray-100 flex items-center justify-center shadow-sm">
                    <Play className="w-3 h-3 fill-emerald-800 text-emerald-800" />
                  </span>
                </div>
              </div>
            );
          })}

          {/* Top 7-10 from other list to fully populate */}
          {OTHER_LEADERBOARD.map((item) => (
            <div
              key={item.rank}
              className="flex items-center justify-between p-4 bg-gray-50/50 rounded-2xl border border-gray-100/60 text-left"
            >
              <div className="flex items-center gap-4">
                <span className="font-mono text-sm font-bold w-6 text-center text-gray-400">
                  {item.rank}
                </span>
                {/* Visual Category symbol */}
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center border font-bold ${item.bgClass} ${item.iconClass}`}>
                  <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                </div>
                <div>
                  <h4 className="font-bold text-xs text-gray-700">{item.title}</h4>
                  <p className="text-[10px] text-gray-405 font-medium">療癒類別：{item.category}</p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-right">
                  <span className="text-[10px] text-gray-500 font-bold flex items-center gap-0.5">
                    <Flame className="w-3.5 h-3.5 text-gray-300" />
                    {item.hotness}% 熱度
                  </span>
                  <p className="text-[9px] text-gray-400 font-medium font-mono">Rank {item.rank}</p>
                </div>
                
                {/* Disabled placeholder play */}
                <span className="bg-white/40 text-gray-300 p-2.5 rounded-full border border-gray-200/50 flex items-center justify-center shadow-sm cursor-not-allowed">
                  <Play className="w-3 h-3 text-gray-300" />
                </span>
              </div>
            </div>
          ))}

        </div>
      </section>

    </div>
  );
}
