/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useTransition, useMemo } from 'react';
import { Game, Comment } from '../types';
import { GAMES_DATA, INITIAL_COMMENTS } from '../data';
import MiniGameCafe from './MiniGameCafe';
import MiniGameJelly from './MiniGameJelly';
import MiniGameWood from './MiniGameWood';
import { Heart, Star, Send, Share2, Play, ChevronRight, Gamepad2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface GameDetailViewProps {
  gameId: string;
  onPlayGame: (gameId: string) => void;
  likedGameIds: string[];
  onToggleLike: (gameId: string) => void;
  loggedInUser: { username: string; avatarUrl: string } | null;
}

const SIDEBAR_GAMES = [
  { id: 'bunny_garden', title: '兔兔花園', rating: 4.8, image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDQxIUEwWhAvy9lj2DToHEYSIm3AZLanAsCszB2uUkzvrJ7lGsqx-jpJJVUYIzn7uO3qGv1sf_ufEfhDO-fuqt4pdPpuI9sD_aqOJiNKhQ_zkgotpFO_6Wcaiaa1CN-bFovtjZ35MQXH-Hw7u4Up4lBsbkCSnBIlchwvEfZEUg5yecR8KfhMlmpcmos2oCVy4Uo6x2stwv0-ICreAz2OaMsTonMavmfIuJOvNHhPKjCdCDRpPrsYlKk3jVcqxpiBr2fzWnG_rvFf6Ba' },
  { id: 'kitty_bakery', title: '貓咪麵包店', rating: 4.9, image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDgMsfAvVobHXlb1fNUrnCHDhtlEeou9x4HUanPs-hKgb2xIvYgjTfZE_6oRkTLtc0zwapXyQ6W54TZBZkbDletUxmfnlfDTKEpMS59OC7tBFONrBbg1QjkxvSqeWTEqQ3zw8IeohceY055QDV-BV33_fqWbeMpaEKCCz_0NEogou0msh78fSd6AnCeQ0jaolmCAmBMLSwYGBzhV8fRODnIaClc42sQpKKW-4v2-o0Qu0PQc6FF8LOS3G97teQvT9wXRl6HwVMXx4sh' },
  { id: 'hamster_camp', title: '倉鼠露營記', rating: 4.7, image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA3XuYzljF14aACbh4TKbZkleLBlueuUDcSlcO0ozbB_JwjSdqE8NGGmaATKNxWJVMNpaCeUTD0LHzJ0HbSi5uohjNG17sjgSJY8gpKRuljeVZu13o_1vueROsI7GaFJHBOwlMFHTj1IhvB-CAS7j10NwCSm8bNUJ5oBoTELbmByqnYV6XW2_nqr8hxkItRWIyBvaUbmbygGYIRn-I96ERp8GTyHpDVm92cr4hO4E7QieJFj0SLuxR8jd1-9MQFyA6bK2iy4Me11hDq' },
];

export default function GameDetailView({
  gameId,
  onPlayGame,
  likedGameIds,
  onToggleLike,
  loggedInUser,
}: GameDetailViewProps) {
  // Find current active game record
  const game = useMemo(() => {
    return GAMES_DATA.find(g => g.id === gameId) || GAMES_DATA[0];
  }, [gameId]);

  // Track comments submitted in-memory
  const [commentInput, setCommentInput] = useState('');
  const [customComments, setCustomComments] = useState<Record<string, Comment[]>>({});
  const [isPending, startTransition] = useTransition();

  const isLiked = likedGameIds.includes(game.id);

  // Load reviews list combining hardcoded ones and player edits
  const commentsList = useMemo(() => {
    const listInitial = INITIAL_COMMENTS[game.id] || [];
    const listAdded = customComments[game.id] || [];
    return [...listAdded, ...listInitial];
  }, [game.id, customComments]);

  // Emit comment submission
  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;

    const newComment: Comment = {
      id: `custom_${Date.now()}`,
      author: loggedInUser ? loggedInUser.username : '森林小訪客 🦌',
      avatar: loggedInUser ? loggedInUser.avatarUrl : 'https://lh3.googleusercontent.com/aida-public/AB6AXuCIbpPAVJYf9pTccLQsaOk-IYcP5Cu0unzqkpFhbn1boKQwDg66qPyufc0kD-lJ8XqTjxYRgGi18YtwZ02vDhSD3HmVB6XGZO-Iw5GYVJNs4SGjN2-6GJxXBzwV_BY4ywU9VG2crSKCj_N-_2Z7ni5ji9RLQ6jVmGb0T6U8jD5rlMSBRajuYfNCIZZic4PsKxFClQttRrL0HEZIfmlut8oxJGjd5dtxeCIUKh-n7Swuw0hs-ppsmNH_Vvonc4_hwQ2zzeezli5thFRW',
      content: commentInput,
      timeAgo: '剛剛',
      likes: 0
    };

    setCustomComments(prev => ({
      ...prev,
      [game.id]: [newComment, ...(prev[game.id] || [])]
    }));
    setCommentInput('');
  };

  return (
    <div className="max-w-[1240px] mx-auto px-6 py-4 space-y-6">
      
      {/* Breadcrumb Path Trail */}
      <nav className="flex items-center gap-1 text-[10px] font-bold text-gray-400 select-none uppercase tracking-widest text-left">
        <span className="hover:text-primary cursor-pointer">萌萌主頁</span>
        <ChevronRight className="w-3 h-3" />
        <span>{game.categoryName}</span>
        <ChevronRight className="w-3 h-3" />
        <span className="text-[#1b6b4f]">{game.title}</span>
      </nav>

      {/* Main Content Pane Left, Sidebar Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Play Space Column */}
        <div className="lg:col-span-2 space-y-6 text-left">
          
          {/* Header Title Metadata */}
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="bg-[#a7f3d0] text-teal-900 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-teal-200">
                  {game.categoryName}
                </span>
                <span className="text-xs text-amber-500 font-bold flex items-center gap-0.5">
                  <Star className="w-4 h-4 fill-amber-500" /> {game.rating} (打分人數 800+)
                </span>
              </div>
              <h2 className="text-xl font-sans font-bold text-gray-800 tracking-tight mt-1.5">{game.title}</h2>
            </div>

            {/* Favorite & Share Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => onToggleLike(game.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold border transition-colors cursor-pointer ${
                  isLiked
                    ? 'bg-rose-50 border-rose-200 text-rose-600'
                    : 'bg-white border-gray-100 hover:bg-gray-50 text-gray-500'
                }`}
              >
                <Heart className={`w-4 h-4 ${isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
                <span>{isLiked ? '已收藏' : '收藏遊戲'}</span>
              </button>
              
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  alert('分享連結已複製到您的剪貼簿！📋');
                }}
                className="p-2.5 bg-white hover:bg-gray-50 border border-gray-100 rounded-full text-gray-500 transition-colors"
                title="複製遊玩分享網址"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Core Interactive Simulation Viewport */}
          <div className="space-y-2">
            <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">【互動預覽模擬器】</span>
            
            {/* Condition Embeddings */}
            <div className="bg-gray-50 rounded-3xl overflow-hidden shadow-inner border border-emerald-50">
              {game.id === 'cafe' && <MiniGameCafe />}
              {game.id === 'jelly' && <MiniGameJelly />}
              {game.id === 'wood' && <MiniGameWood />}
              
              {/* Fallback games display for non-playable cards */}
              {game.id !== 'cafe' && game.id !== 'jelly' && game.id !== 'wood' && (
                <div className="p-8 text-center flex flex-col items-center justify-center min-h-[360px] max-w-lg mx-auto bg-white rounded-3xl border-4 border-teal-50 my-4 shadow-md">
                  <div className="bg-[#a7f3d0] p-4 rounded-full text-[#1b6b4f] mb-4 animate-bounce">
                    <Gamepad2 className="w-10 h-10" />
                  </div>
                  <h4 className="font-bold text-sm text-gray-800">《{game.title}》預覽加載中</h4>
                  <p className="text-xs text-gray-400 max-w-xs mt-1 leading-relaxed">
                    本款休閒療癒作正在進行微細節融合。在完整版釋出前，您可以體驗下方高人氣果凍三消！
                  </p>
                  
                  {/* Quick-play fallback option below */}
                  <div className="w-full mt-6 pt-6 border-t border-gray-100">
                    <p className="text-[10px] font-bold text-gray-400 mb-3">（為您推薦另一款可玩小遊戲：）</p>
                    <button
                      onClick={() => onPlayGame('jelly')}
                      className="marshmallow-button bg-primary text-white hover:bg-[#1b6b4f]/85 font-bold px-6 py-2 rounded-full text-xs flex items-center gap-1 border-b-2 border-emerald-800 mx-auto"
                    >
                      <Play className="w-3.5 h-3.5 fill-white" />
                      立即玩《彩色果凍三消》
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Rulebook Details Tab Rows */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm leading-relaxed">
            
            {/* Play Manual */}
            <div className="space-y-2.5">
              <h4 className="font-sans font-bold text-xs text-[#1b6b4f] border-b border-gray-50 pb-1.5 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">menu_book</span>
                如何遊玩
              </h4>
              <ul className="text-xs text-gray-500 font-medium space-y-1.5">
                {game.id === 'cafe' ? (
                  <>
                    <li>• 1: 接待來到咖啡廳的可愛小動物顧客。</li>
                    <li>• 2: 根據客人的訂單，配製對應美味甜點。</li>
                    <li>• 3: 賺取愛心金幣，解鎖更多咖啡裝潢。</li>
                  </>
                ) : game.id === 'jelly' ? (
                  <>
                    <li>• 1: 點擊選擇任何一塊精緻香軟果凍。</li>
                    <li>• 2: 點擊周圍相鄰那一格果凍進行位置互換。</li>
                    <li>• 3: 湊齊橫向或縱向 3 個同色触发水果大連爆！</li>
                  </>
                ) : game.id === 'wood' ? (
                  <>
                    <li>• 1: 點擊選中被困在棋盤中的木條。</li>
                    <li>• 2: 點擊下方操控按鍵可以相應滑移。</li>
                    <li>• 3: 清出障礙放行 🔑 金色木塊使其達到最右出口！</li>
                  </>
                ) : (
                  <>
                    <li>• 1: 通過可愛的美工與舒緩背景琴曲享受休閒。</li>
                    <li>• 2: 跟隨引導操作積累分數解鎖新的場景。</li>
                    <li>• 3: 分享推薦給親友一起放鬆下午。</li>
                  </>
                )}
              </ul>
            </div>

            {/* Controller Specs */}
            <div className="space-y-2.5">
              <h4 className="font-sans font-bold text-xs text-[#1b6b4f] border-b border-gray-50 pb-1.5 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">sports_esports</span>
                控制說明
              </h4>
              <div className="text-xs text-gray-500 font-medium space-y-1.5">
                <p>• <span className="font-bold text-gray-700">滑鼠點擊/觸摸觸碰：</span> 遊戲中的絕大部分按鈕/素材皆支持點按點選。</p>
                <p>• <span className="font-bold text-gray-700">數據存檔：</span> 本遊戲預覽包含關卡進度與金幣跟隨，重置或重載網頁前有效。</p>
              </div>
            </div>

          </div>

          {/* Social Player Reviews Section */}
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-5">
            <h4 className="font-sans font-bold text-xs text-gray-800 border-b border-gray-100 pb-3 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-primary text-[18px]">forum</span>
              玩家評價留言（共 {commentsList.length} 條）
            </h4>

            {/* Add Comments Form */}
            <form onSubmit={handleCommentSubmit} className="flex gap-2">
              <input
                type="text"
                required
                maxLength={100}
                placeholder={loggedInUser ? `以 ${loggedInUser.username} 身份發表您的療癒體驗...` : "發表你的可愛玩後感... (登入後可以自定義頭像)"}
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                className="flex-grow bg-gray-50 border border-gray-100 focus:border-[#1b6b4f] placeholder-gray-400 text-xs font-bold px-4 py-3 rounded-2xl focus:ring-2 focus:ring-[#a7f3d0] outline-none shadow-inner"
              />
              <button
                type="submit"
                className="marshmallow-button bg-primary text-white hover:bg-emerald-700 font-bold px-5 py-3 rounded-2xl text-xs flex items-center gap-1 border-emerald-950 shadow-sm"
              >
                <Send className="w-3.5 h-3.5" />
                發送
              </button>
            </form>

            {/* List of active reviews */}
            <div className="space-y-4 pt-2">
              <AnimatePresence mode="popLayout">
                {commentsList.map(comment => (
                  <motion.div
                    key={comment.id}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ x: 50, opacity: 0 }}
                    className="flex gap-3 text-xs leading-relaxed border-b border-gray-50 pb-4 last:border-0"
                  >
                    <img
                      src={comment.avatar}
                      alt={comment.author}
                      className="w-9 h-9 rounded-full object-cover shrink-0 border border-gray-100"
                    />
                    <div className="flex-grow space-y-1">
                      <div className="flex justify-between items-center text-gray-400">
                        <span className="font-bold text-gray-700">{comment.author}</span>
                        <span>{comment.timeAgo}</span>
                      </div>
                      <p className="text-gray-500 font-medium">{comment.content}</p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

          </div>

        </div>

        {/* Sidebar recommendations right column */}
        <aside className="space-y-6 text-left">
          
          <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-primary flex items-center gap-1 border-b border-gray-100 pb-3">
              <span className="material-symbols-outlined text-[16px] text-amber-500">spark</span>
              精選推薦
            </h3>

            {/* Recommended side list items */}
            <div className="flex flex-col gap-3">
              {SIDEBAR_GAMES.map(item => (
                <div
                  key={item.id}
                  onClick={() => onPlayGame(item.id)}
                  className="flex gap-3 p-2.5 rounded-2xl hover:bg-gray-50 transition-all duration-200 cursor-pointer border border-transparent hover:border-teal-50 shadow-sm"
                >
                  <img
                    src={item.image}
                    alt={item.title}
                    referrerPolicy="no-referrer"
                    className="w-16 h-16 rounded-xl object-cover shrink-0 border"
                  />
                  <div className="flex flex-col justify-between py-0.5">
                    <div>
                      <h4 className="font-bold text-xs text-gray-850 leading-tight">{item.title}</h4>
                      <p className="text-[10px] text-gray-400 font-mono mt-0.5">Rating: {item.rating}</p>
                    </div>
                    <span className="text-[10px] text-primary font-bold flex items-center gap-0.5 mt-1 hover:underline">
                      立即進入遊玩 ➔
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </aside>

      </div>
    </div>
  );
}
