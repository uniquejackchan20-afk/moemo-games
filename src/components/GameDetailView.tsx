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
import MiniGameSnake from './MiniGameSnake';
import MiniGameSoduku from './MiniGameSoduku';
import MiniGameMinesweeper from './MiniGameMinesweeper';
import MiniGameTicTacToe from './MiniGameTicTacToe';
import MiniGameRockPaperScissors from './MiniGameRockPaperScissors';
import MiniGameTetris from './MiniGameTetris';
import MiniGameBreakout from './MiniGameBreakout';
import MiniGameBubbleShooter from './MiniGameBubbleShooter';
import { Heart, Star, Send, Share2, Play, ChevronRight, Gamepad2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface GameDetailViewProps {
  gameId: string;
  onPlayGame: (gameId: string) => void;
  likedGameIds: string[];
  onToggleLike: (gameId: string) => void;
  loggedInUser: { username: string; avatarUrl: string } | null;
}


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
    <div className="max-w-4xl mx-auto px-6 py-4 space-y-6">
      
      {/* Breadcrumb Path Trail */}
      <nav className="flex items-center gap-1 text-[10px] font-bold text-gray-400 select-none uppercase tracking-widest text-left">
        <span className="hover:text-primary cursor-pointer">萌萌主頁</span>
        <ChevronRight className="w-3 h-3" />
        <span>{game.categoryName}</span>
        <ChevronRight className="w-3 h-3" />
        <span className="text-[#1b6b4f]">{game.title}</span>
      </nav>

      {/* Play Space Details Content */}
      <div className="space-y-6 text-left">
          
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
              {game.id === 'snake' && <MiniGameSnake />}
              {game.id === 'sudoku' && <MiniGameSoduku />}
              {game.id === 'minesweeper' && <MiniGameMinesweeper />}
              {game.id === 'tictactoe' && <MiniGameTicTacToe />}
              {game.id === 'rockpaperscissors' && <MiniGameRockPaperScissors />}
              {game.id === 'tetris' && <MiniGameTetris />}
              {game.id === 'breakout' && <MiniGameBreakout />}
              {game.id === 'bubble' && <MiniGameBubbleShooter />}
              
              {/* Fallback games display for non-playable cards */}
              {game.id !== 'cafe' && game.id !== 'jelly' && game.id !== 'wood' && game.id !== 'snake' && game.id !== 'sudoku' && game.id !== 'minesweeper' && game.id !== 'tictactoe' && game.id !== 'rockpaperscissors' && game.id !== 'tetris' && game.id !== 'breakout' && game.id !== 'bubble' && (
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
                ) : game.id === 'snake' ? (
                  <>
                    <li>• 1: 控制萌趣小蛇穿游，在草地上探索冒險。</li>
                    <li>• 2: 吞食美味的水果（草莓、巨桃、葡萄、星星）以賺取積分與生長蛇節。</li>
                    <li>• 3: 避開咬擊到自己的身體，解鎖更多華麗精美的特色小蛇外觀！</li>
                  </>
                ) : game.id === 'sudoku' ? (
                  <>
                    <li>• 1: 點選格子以選擇想要填補數字或寫草稿的地方。</li>
                    <li>• 2: 點擊下方 1–9 數字鍵盤填值，或啟用「草稿筆記」記錄候選數字。</li>
                    <li>• 3: 完成橫排、豎列與 3x3 各格且數字皆不重疊即可獲勝！</li>
                  </>
                ) : game.id === 'minesweeper' ? (
                  <>
                    <li>• 1: 點開格子來收集安全的胡蘿蔔，避免驚醒小地鼠。</li>
                    <li>• 2: 根據格子中浮現出的提示數字，在推導為地鼠的格子上按右鍵進行「防護標記 🚩」。</li>
                    <li>• 3: 將所有安全格子點開且全部地鼠都防護完畢即可贏得大豐收！</li>
                  </>
                ) : game.id === 'tictactoe' ? (
                  <>
                    <li>• 1: 在棋盤格子中點擊落爪，印上可愛的橘貓肉墊標記 🐾。</li>
                    <li>• 2: 對手（AI 白汪汪 🐶 或您的親密好友）會輪流印上骨頭印記 🦴。</li>
                    <li>• 3: 最先在任意橫向、縱向或斜向對角線端將連續三個標記連成一條線即獲勝！</li>
                  </>
                ) : game.id === 'rockpaperscissors' ? (
                  <>
                    <li>• 1: 點擊出招按鈕選擇「石頭 ✊」、「布布 ✋」或「剪刀 ✌️」。</li>
                    <li>• 2: 敗北時能凝聚更高怒氣 💥。怒氣滿 100% 可引導「狂暴巨熊拳」，大捷時爆發 2 倍積分！</li>
                    <li>• 3: 巧用天眼預知卡 🔮、橡樹護盾卡 🛡️ 等森林奇術巧妙阻擊松鼠皮皮，搶先達到 5 分即可贏得松果桂冠！</li>
                  </>
                ) : game.id === 'tetris' ? (
                  <>
                    <li>• 1: 使用螢幕按鍵或鍵盤方向鍵控制繽紛果凍積木，並拼入小保鮮盒中。</li>
                    <li>• 2: 連續拼滿整行將會觸發 QQ 彈性感消行特效，並給予大額糖果積分！</li>
                    <li>• 3: 體驗頑固巨石阻礙特訓或 120 秒計時速消，解鎖頂級保鮮冠冕！</li>
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
                {game.id === 'sudoku' ? (
                  <>
                    <p>• <span className="font-bold text-gray-700">鍵盤快速控制：</span> 支持鍵盤 <strong>1-9</strong> 數字填空、<strong>Backspace/Delete</strong> 擦拭，以及 <strong>方向鍵</strong> 移動選擇。</p>
                    <p>• <span className="font-bold text-gray-750">手稿切換：</span> 按字母鍵 <strong>N</strong> 可以一鍵切換鉛筆記備註狀態噢。</p>
                  </>
                ) : game.id === 'minesweeper' ? (
                  <>
                    <p>• <span className="font-bold text-gray-700">防護與插旗：</span> 電腦端用戶按 <strong>滑鼠右鍵</strong> 可插旗標記地鼠 🚩，行動端用戶 <strong>長按</strong> 相同位置具有相同效果。</p>
                    <p>• <span className="font-bold text-gray-700">金鐘罩首點：</span> 獨創安全優化，您的 <strong>第一次點擊</strong> 絕不會是地鼠，且周圍必為安全坦途！</p>
                  </>
                ) : game.id === 'tictactoe' ? (
                  <>
                    <p>• <span className="font-bold text-gray-700">雙模式自由行：</span> 支持 <strong>機智AI對抗</strong> 與 <strong>雙人同樂對策</strong>。您可以單獨與不同難度等級的機器汪對陣，或與小夥伴同屏輪流下棋！</p>
                    <p>• <span className="font-bold text-gray-700">不敗汪王智力：</span> 頂級的「汪王 👑」智力搭載了強大的 <strong>Minimax 決策演算法</strong>，算無遺策，等著你來挑戰平局！</p>
                  </>
                ) : game.id === 'rockpaperscissors' ? (
                  <>
                    <p>• <span className="font-bold text-gray-700">卡牌魔法戰：</span> 擁有三款精緻的 <strong>山林道具卡牌</strong> ── 「天眼預知」、「橡樹護盾」、「雷霆增益」，每局限點按使用三次，助您扭轉乾坤！</p>
                    <p>• <span className="font-bold text-gray-700">連勝咆哮：</span> 每次猜拳攻守皆能蓄積小萌獸怒氣，100% 怒氣極限下可啟動 <strong>狂暴巨熊拳</strong>，給松鼠皮皮致命一擊！</p>
                  </>
                ) : game.id === 'tetris' ? (
                  <>
                    <p>• <span className="font-bold text-gray-700">鍵盤快速操控：</span> 電腦端支持鍵盤 <strong>A/D / 左右方向鍵</strong> 調整平移、<strong>W / 上鍵</strong> 快速翻轉、<strong>S / 下鍵</strong> 加速下落、<strong>空白鍵</strong> 瞬降。</p>
                    <p>• <span className="font-bold text-gray-700">萌態大特訓：</span> 可隨心開啟經典消消樂 🎨，頑石關 ⛰️ 與 120 秒計時速消 ⏰，支持音效快速靜音。</p>
                  </>
                ) : (
                  <>
                    <p>• <span className="font-bold text-gray-700">滑鼠點擊/觸摸觸碰：</span> 遊戲中的絕大部分按鈕/素材皆支持點按點選。</p>
                    <p>• <span className="font-bold text-gray-700">數據存檔：</span> 本遊戲預覽包含關卡進度與金幣跟隨，重置或重載網頁前有效。</p>
                  </>
                )}
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
    </div>
  );
}
