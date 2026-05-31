/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, RotateCcw, Volume2, VolumeX, Sparkles, Trophy, Heart, Flag, Trash2, HelpCircle, Check, Compass, Smile, Eye } from 'lucide-react';

interface MineCell {
  row: number;
  col: number;
  isMine: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  neighborMines: number;
}

type MascotMood = 'idle' | 'happy' | 'scared' | 'sad' | 'win';

const DIFFICULTIES = {
  easy: { label: '簡單 🐢', rows: 8, cols: 9, mines: 10 },
  medium: { label: '靈活 🦊', rows: 10, cols: 10, mines: 18 },
  hard: { label: '挑戰 ⚡', rows: 12, cols: 12, mines: 32 }
};

export default function MiniGameMinesweeper() {
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [board, setBoard] = useState<MineCell[][]>([]);
  const [gameStatus, setGameStatus] = useState<'idle' | 'playing' | 'won' | 'lost'>('idle');
  const [flagsCount, setFlagsCount] = useState<number>(0);
  const [timer, setTimer] = useState<number>(0);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [mascotMood, setMascotMood] = useState<MascotMood>('idle');
  const [firstClick, setFirstClick] = useState<boolean>(true);

  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Play retro synthesizers using Web Audio API safely
  const playSfx = useCallback((type: 'dig' | 'flag' | 'unflag' | 'explode' | 'win' | 'click' | 'powerup') => {
    if (!soundEnabled) return;
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'dig') {
        // High popping slide
        osc.type = 'sine';
        osc.frequency.setValueAtTime(300, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.12);
        gain.gain.setValueAtTime(0.06, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);
        osc.start();
        osc.stop(ctx.currentTime + 0.12);
      } else if (type === 'flag') {
        // Double sweet coin note
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(400, ctx.currentTime);
        osc.frequency.setValueAtTime(550, ctx.currentTime + 0.05);
        gain.gain.setValueAtTime(0.07, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);
        osc.start();
        osc.stop(ctx.currentTime + 0.12);
      } else if (type === 'unflag') {
        // Downward slide
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(450, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.08);
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
        osc.start();
        osc.stop(ctx.currentTime + 0.08);
      } else if (type === 'explode') {
        // Low fuzzy explosion noise mockup
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(100, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(40, ctx.currentTime + 0.4);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
        osc.start();
        osc.stop(ctx.currentTime + 0.41);
      } else if (type === 'win') {
        // Ascending major arpeggio
        osc.type = 'sine';
        const freqs = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50];
        freqs.forEach((f, idx) => {
          const oscNode = ctx.createOscillator();
          const gainNode = ctx.createGain();
          oscNode.connect(gainNode);
          gainNode.connect(ctx.destination);
          oscNode.type = 'sine';
          oscNode.frequency.setValueAtTime(f, ctx.currentTime + idx * 0.08);
          gainNode.gain.setValueAtTime(0.08, ctx.currentTime + idx * 0.08);
          gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + idx * 0.08 + 0.4);
          oscNode.start(ctx.currentTime + idx * 0.08);
          oscNode.stop(ctx.currentTime + idx * 0.08 + 0.45);
        });
      } else if (type === 'click') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(280, ctx.currentTime);
        gain.gain.setValueAtTime(0.04, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
        osc.start();
        osc.stop(ctx.currentTime + 0.05);
      } else if (type === 'powerup') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(350, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.07, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
        osc.start();
        osc.stop(ctx.currentTime + 0.2);
      }
    } catch {
      // Browsers bypass
    }
  }, [soundEnabled]);

  // Mascot Reactions
  const triggerMascotReaction = useCallback((mood: MascotMood, delay: number = 2200) => {
    setMascotMood(mood);
    const timeout = setTimeout(() => {
      setMascotMood('idle');
    }, delay);
    return () => clearTimeout(timeout);
  }, []);

  // Initialize Board
  const initializeBoard = useCallback((difficultyLevel: 'easy' | 'medium' | 'hard', avoidRow?: number, avoidCol?: number): MineCell[][] => {
    const { rows, cols, mines } = DIFFICULTIES[difficultyLevel];
    
    // Create empty cells
    const newBoard: MineCell[][] = Array.from({ length: rows }, (_, r) =>
      Array.from({ length: cols }, (_, c) => ({
        row: r,
        col: c,
        isMine: false,
        isRevealed: false,
        isFlagged: false,
        neighborMines: 0
      }))
    );

    // Place mines randomly, avoiding the first-clicked cell to ensure standard helpful opening
    let placedMines = 0;
    while (placedMines < mines) {
      const randR = Math.floor(Math.random() * rows);
      const randC = Math.floor(Math.random() * cols);

      // Check if candidate matches safe condition
      const isStartSafeCell = avoidRow !== undefined && avoidCol !== undefined &&
        Math.abs(randR - avoidRow) <= 1 && Math.abs(randC - avoidCol) <= 1;

      if (!newBoard[randR][randC].isMine && !isStartSafeCell) {
        newBoard[randR][randC].isMine = true;
        placedMines++;
      }
    }

    // Double check: if still empty because of too small grids with too many banned cells, relax starting block constraint
    if (placedMines < mines) {
      while (placedMines < mines) {
        const randR = Math.floor(Math.random() * rows);
        const randC = Math.floor(Math.random() * cols);
        const isExactClicked = avoidRow !== undefined && avoidCol !== undefined && randR === avoidRow && randC === avoidCol;

        if (!newBoard[randR][randC].isMine && !isExactClicked) {
          newBoard[randR][randC].isMine = true;
          placedMines++;
        }
      }
    }

    // Populate neighbor values
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (newBoard[r][c].isMine) continue;
        let neighbors = 0;
        
        // 3x3 surrounding check
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            const nr = r + dr;
            const nc = c + dc;
            if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
              if (newBoard[nr][nc].isMine) neighbors++;
            }
          }
        }
        newBoard[r][c].neighborMines = neighbors;
      }
    }

    return newBoard;
  }, []);

  // Safe floodfill reveal helper (dfs or bfs to expand empty spots safely)
  const revealCellInPlace = (grid: MineCell[][], startR: number, startC: number, rowsCount: number, colsCount: number) => {
    const queue: [number, number][] = [[startR, startC]];
    const visited = new Set<string>();

    while (queue.length > 0) {
      const [currR, currC] = queue.shift()!;
      const key = `${currR}-${currC}`;
      if (visited.has(key)) continue;
      visited.add(key);

      const cell = grid[currR][currC];
      if (cell.isRevealed || cell.isFlagged) continue;

      cell.isRevealed = true;

      // If neighbors has no mines, expand further surrounding
      if (cell.neighborMines === 0 && !cell.isMine) {
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            const nr = currR + dr;
            const nc = currC + dc;
            if (nr >= 0 && nr < rowsCount && nc >= 0 && nc < colsCount) {
              if (!grid[nr][nc].isRevealed && !grid[nr][nc].isFlagged) {
                queue.push([nr, nc]);
              }
            }
          }
        }
      }
    }
  };

  // Check victory condition
  const checkVictory = (grid: MineCell[][], difficultyLevel: 'easy' | 'medium' | 'hard') => {
    const { rows, cols } = DIFFICULTIES[difficultyLevel];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const cell = grid[r][c];
        // Game has won when all non-mine cells are successfully revealed!
        if (!cell.isMine && !cell.isRevealed) {
          return false;
        }
      }
    }
    return true;
  };

  // Quick Action Start
  const handleStartGame = useCallback(() => {
    playSfx('powerup');
    const { rows, cols } = DIFFICULTIES[difficulty];
    
    // Construct dummy preliminary board for visuals before clicking
    const preliminaryBoard: MineCell[][] = Array.from({ length: rows }, (_, r) =>
      Array.from({ length: cols }, (_, c) => ({
        row: r,
        col: c,
        isMine: false,
        isRevealed: false,
        isFlagged: false,
        neighborMines: 0
      }))
    );

    setBoard(preliminaryBoard);
    setGameStatus('playing');
    setFlagsCount(0);
    setTimer(0);
    setFirstClick(true);
    triggerMascotReaction('idle');
  }, [difficulty, playSfx, triggerMascotReaction]);

  // Click handler to reveal a cell
  const handleCellClick = (r: number, c: number) => {
    if (gameStatus !== 'playing') return;

    let currentBoard = [...board.map(row => row.map(cell => ({ ...cell })))];
    const { rows, cols, mines } = DIFFICULTIES[difficulty];

    // 1. Generate real mines mapping on first-click to guarantee a zero-danger clear area
    if (firstClick) {
      currentBoard = initializeBoard(difficulty, r, c);
      setFirstClick(false);
    }

    const cell = currentBoard[r][c];
    if (cell.isRevealed || cell.isFlagged) return;

    // 2. Play Audio FX
    playSfx('dig');

    // 3. Hit Mine Case
    if (cell.isMine) {
      // Reveal all mines as sleeping moles popping up of earth
      currentBoard.forEach(rowArr => {
        rowArr.forEach(item => {
          if (item.isMine) item.isRevealed = true;
        });
      });
      setBoard(currentBoard);
      setGameStatus('lost');
      playSfx('explode');
      triggerMascotReaction('sad', 4000);
      return;
    }

    // 4. Reveal Safe cells recursively
    revealCellInPlace(currentBoard, r, c, rows, cols);

    // 5. Update and check victory
    const hasWon = checkVictory(currentBoard, difficulty);
    if (hasWon) {
      setBoard(currentBoard);
      setGameStatus('won');
      playSfx('win');
      triggerMascotReaction('win', 6000);
      
      // Auto flag all mines nicely
      currentBoard.forEach(rowArr => {
        rowArr.forEach(item => {
          if (item.isMine) item.isFlagged = true;
        });
      });
      setFlagsCount(mines);
    } else {
      setBoard(currentBoard);
      triggerMascotReaction('happy', 1200);
    }
  };

  // Flag cell toggle
  const handleCellRightClick = (e: React.MouseEvent | React.TouchEvent, r: number, c: number) => {
    e.preventDefault();
    if (gameStatus !== 'playing') return;

    const currentBoard = board.map(row => row.map(cell => ({ ...cell })));
    const cell = currentBoard[r][c];
    if (cell.isRevealed) return;

    const limit = DIFFICULTIES[difficulty].mines;

    if (cell.isFlagged) {
      cell.isFlagged = false;
      setFlagsCount(f => Math.max(0, f - 1));
      playSfx('unflag');
    } else {
      if (flagsCount >= limit + 5) return; // Prevent excessive protective flag hoarding
      cell.isFlagged = true;
      setFlagsCount(f => f + 1);
      playSfx('flag');
      triggerMascotReaction('scared', 1200);
    }

    setBoard(currentBoard);
  };

  // Timer Tick Effect
  useEffect(() => {
    if (gameStatus === 'playing' && !firstClick) {
      timerIntervalRef.current = setInterval(() => {
        setTimer(t => t + 1);
      }, 1000);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [gameStatus, firstClick]);

  // Autoload a board on first mount
  useEffect(() => {
    handleStartGame();
  }, [difficulty]);

  const formatTime = (secs: number): string => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // Style helper for neighbor indicator numbers
  const getNumberColorClass = (n: number) => {
    switch (n) {
      case 1: return 'text-sky-500 font-extrabold';
      case 2: return 'text-emerald-700 font-extrabold';
      case 3: return 'text-rose-500 font-extrabold';
      case 4: return 'text-indigo-800 font-black';
      case 5: return 'text-amber-700 font-black';
      case 6: return 'text-purple-700 font-black';
      case 7: return 'text-teal-600 font-black';
      case 8: return 'text-stone-700 font-black';
      default: return 'text-stone-300';
    }
  };

  const limitMines = DIFFICULTIES[difficulty].mines;
  const remainingMines = Math.max(0, limitMines - flagsCount);

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6 select-none bg-emerald-50/10 rounded-3xl border border-emerald-100/30 shadow-sm font-sans">
      
      {/* Title Header Panel */}
      <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-4 rounded-2xl border border-emerald-50/60 shadow-sm gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-100 text-emerald-800 rounded-xl flex items-center justify-center font-bold text-xl shadow-inner">
            🐰
          </div>
          <div className="text-left">
            <h3 className="font-sans font-bold text-xs text-stone-800 flex items-center gap-1.5">
              <span>萌兔胡蘿蔔探險 (Minesweeper Garden)</span>
              <span className="bg-amber-100 text-amber-800 text-[9px] font-extrabold px-1.5 py-0.5 rounded-full border border-amber-200">
                花園益智
              </span>
            </h3>
            <p className="text-[10px] text-zinc-400 font-medium mt-0.5">
              幫助萌兔搜救埋在泥土裡的飽滿胡蘿蔔，繞開愛惡作劇的土中頑皮地鼠！
            </p>
          </div>
        </div>

        {/* Action controllers */}
        <div className="flex gap-4 items-center">
          <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-950 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200/50">
            <Trophy className="w-3.5 h-3.5 text-amber-500 fill-amber-500 animate-pulse" />
            <span>搜救計時:</span>
            <span className="font-mono text-sm ml-1">{formatTime(timer)}</span>
          </div>

          <button
            onClick={() => {
              setSoundEnabled(!soundEnabled);
              playSfx('click');
            }}
            className={`p-1.5 rounded-full border transition-all ${soundEnabled ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-stone-50 border-stone-100 text-stone-400'}`}
            title={soundEnabled ? "打開音效" : "關閉音效"}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Playboard Area LEFT */}
        <div className="lg:col-span-8 flex flex-col items-center space-y-4">
          
          {/* Garden inventory bar */}
          <div className="w-full flex justify-between items-center bg-white border border-stone-100 px-5 py-3 rounded-2xl shadow-sm">
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-stone-400 font-bold block uppercase tracking-wider">未排除地鼠數</span>
              <div className="flex items-center gap-1.5 bg-amber-50 text-amber-900 text-xs px-2.5 py-1 rounded-full font-black border border-amber-200/50 font-mono">
                <span>🦫</span>
                <span>{remainingMines} 只</span>
              </div>
            </div>

            <div className="text-[11.5px] text-stone-500 font-bold flex items-center gap-1.5">
              <span>🌾 已設防護網:</span>
              <span className="text-emerald-700 font-mono font-black">{flagsCount} / {limitMines}</span>
            </div>
          </div>

          {/* Minesweeper Visual Board Frame */}
          <div className="relative w-full aspect-auto max-w-[460px] bg-amber-900/10 rounded-3xl p-3 border-4 border-amber-900/15 shadow-md flex items-center justify-center select-none overflow-hidden">
            
            <div 
              className="grid gap-[2px] w-full bg-stone-250 p-1.5 rounded-2xl shadow-inner border border-stone-300"
              style={{
                gridTemplateRows: `repeat(${DIFFICULTIES[difficulty].rows}, minmax(0, 1fr))`,
                gridTemplateColumns: `repeat(${DIFFICULTIES[difficulty].cols}, minmax(0, 1fr))`
              }}
            >
              {board.map((rowArr, rIdx) => 
                rowArr.map((cell, cIdx) => {
                  const isRevealed = cell.isRevealed;
                  const isFlagged = cell.isFlagged;
                  const isMine = cell.isMine;
                  const count = cell.neighborMines;

                  return (
                    <div
                      key={`${rIdx}-${cIdx}`}
                      onClick={() => handleCellClick(rIdx, cIdx)}
                      onContextMenu={(e) => handleCellRightClick(e, rIdx, cIdx)}
                      onTouchEnd={(e) => {
                        // Support double tapping or context triggers if needed, but right click simulated via hold or buttons works best
                      }}
                      className={`relative flex items-center justify-center aspect-square select-none cursor-pointer transition-all duration-150 rounded ${
                        isRevealed
                          ? isMine 
                            ? 'bg-rose-100 border border-rose-300 shadow-inner scale-95' 
                            : 'bg-amber-50/100 border border-amber-100/50 shadow-inner'
                          : 'bg-[#98bf64] hover:bg-[#a6d16e] border-b-2 border-emerald-900/20 active:translate-y-[1px] active:border-b-0 shadow'
                      }`}
                    >
                      {/* Contents */}
                      {isRevealed ? (
                        isMine ? (
                          <span className="text-base sm:text-lg animate-bounce" title="頑皮地鼠！">🦫</span>
                        ) : count > 0 ? (
                          <span className={`text-sm sm:text-base font-mono font-extrabold ${getNumberColorClass(count)}`}>
                            {count}
                          </span>
                        ) : (
                          // Zero surrounding mines sprouts a fresh cute carrot asset leaf
                          <span className="text-xs sm:text-sm animate-pulse" title="長出超級甜胡蘿蔔🌱">🥕</span>
                        )
                      ) : (
                        isFlagged && (
                          <span 
                            className="text-xs sm:text-sm text-rose-600 font-bold filter drop-shadow animate-ping-once" 
                            title="胡蘿蔔防護標誌"
                          >
                            🚩
                          </span>
                        )
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Exploded / Game Over Screen Overlay */}
            {gameStatus === 'lost' && (
              <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-[2px] flex items-center justify-center z-30 animate-in fade-in duration-200">
                <div className="bg-white p-6 rounded-3xl border-t-8 border-rose-500 text-center max-w-[260px] space-y-3.5 shadow-2xl">
                  <span className="text-4xl block animate-shake">🚜💨</span>
                  <div>
                    <h4 className="font-bold text-stone-800 text-sm">地鼠軍團獲勝啦！</h4>
                    <p className="text-[10px] text-zinc-400 mt-1 font-medium leading-relaxed">
                      不小心驚動了頑皮地鼠 🦫！地鼠們跑出來把萌兔朵朵辛勤種植的胡蘿蔔通通搶走囉。重新來一盤吧！
                    </p>
                  </div>
                  <button
                    onClick={handleStartGame}
                    className="marshmallow-button w-full bg-primary text-white hover:bg-emerald-700 py-2.5 rounded-full text-xs font-bold"
                  >
                    重新出發 ➔
                  </button>
                </div>
              </div>
            )}

            {/* Victory Gained Screen Overlay */}
            {gameStatus === 'won' && (
              <div className="absolute inset-0 bg-emerald-950/40 backdrop-blur-[3px] flex items-center justify-center z-30 animate-in zoom-in-95 duration-200">
                <div className="bg-white p-6 rounded-3xl border-4 border-amber-300 text-center max-w-[295px] space-y-4 shadow-2xl relative">
                  <div className="absolute -top-11 inset-x-0 mx-auto w-fit text-4xl animate-bounce">
                    👑
                  </div>
                  
                  <div className="space-y-1">
                    <h4 className="font-sans font-bold text-sm text-emerald-800">🎉 大功告成！豐收之王</h4>
                    <p className="text-[10px] text-amber-900/70 font-bold uppercase tracking-wider bg-amber-50 rounded-full py-0.5 w-fit mx-auto px-2">
                      守護難度: {difficulty === 'easy' ? '輕鬆 🐢' : difficulty === 'medium' ? '活力 🦊' : '神速 ⚡'}
                    </p>
                  </div>

                  <p className="text-xs text-stone-500 font-medium leading-relaxed">
                    萌兔朵朵跳起了歡樂香甜的兔子之舞！花園泥土底下所有的胡蘿蔔都被你安全救起，太有邏輯天賦啦！
                  </p>

                  <div className="bg-emerald-50 rounded-2xl p-3 border border-emerald-100 flex flex-col gap-1.5 text-xs">
                    <div className="flex justify-between font-medium text-stone-600">
                      <span>冒險計數:</span>
                      <span className="font-mono font-bold text-emerald-800">{formatTime(timer)}</span>
                    </div>
                    <div className="flex justify-between font-medium text-stone-600">
                      <span>搜救成功:</span>
                      <span className="font-mono font-bold text-[#765469]">100% 🥕</span>
                    </div>
                  </div>

                  <button
                    onClick={handleStartGame}
                    className="marshmallow-button w-full bg-primary text-white hover:bg-emerald-700 py-3 rounded-full text-xs font-bold border-b-4 border-emerald-950 animate-pulse"
                  >
                    再收穫一盤 🚀
                  </button>
                </div>
              </div>
            )}

          </div>

          {/* Controller Support Guidelines for Mobile or Drag flag tool */}
          <div className="w-full max-w-[460px] bg-white border border-stone-100 rounded-2xl p-3.5 shadow shadow-stone-100 flex flex-col sm:flex-row justify-between items-center text-xs text-zinc-400 gap-3">
            <span className="text-left leading-relaxed text-[10px]">
              💡 <strong>操作秘訣</strong>：在格子按 <strong>滑鼠右鍵</strong> 即可插上/拔除胡蘿蔔防禦標誌 🚩。手機或平板用戶可以藉由「長按格子」進行標記防禦喔。
            </span>
            <button
              onClick={handleStartGame}
              className="py-1 px-3 bg-stone-50 hover:bg-stone-100 border border-stone-200 text-stone-600 rounded-full text-[10.5px] font-bold shrink-0 flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>重新洗牌</span>
            </button>
          </div>

        </div>

        {/* Mascot / Guidelines Column RIGHT */}
        <div className="lg:col-span-4 space-y-4 text-left">
          
          {/* Mascot Box */}
          <div className="bg-white p-4 rounded-3xl border border-stone-100 shadow-sm text-center relative overflow-hidden flex flex-col items-center">
            
            {/* Mascot header dialog box */}
            <div className="min-h-[50px] w-full mt-2 flex items-center justify-center px-1">
              <div className="relative bg-[#fcf5e3]/90 border border-amber-100/60 p-2.5 rounded-2xl text-[10px] text-amber-950 font-bold font-sans max-w-[210px] leading-relaxed select-none shrink-0">
                <div className="absolute w-2 h-2 bg-[#fcf5e3] border-b border-l border-amber-100/60 rotate-45 -bottom-1 left-1/2 -translate-x-1/2" />
                
                {mascotMood === 'idle' && (
                  <span>
                    {gameStatus === 'won' 
                      ? "哇哇哇！全數收割成功啦，我們是拔胡蘿蔔神射手！" 
                      : "哈囉！我是朵朵。點擊草地來收集乾淨胡蘿蔔吧，一定要看清周圍的數字喔！"}
                  </span>
                )}
                {mascotMood === 'happy' && (
                  <span>哇！挖出一顆草莓金蘿蔔 🥕！數字寫著 {board.flat().find(c => c.isRevealed && c.neighborMines > 0)?.neighborMines || 2}，說明九宮周圍藏著對等的地鼠喔。</span>
                )}
                {mascotMood === 'scared' && (
                  <span>哦哦！插上防護小紅旗 🚩，這裡鎖定住了躲在泥巴底下的頑皮地鼠！</span>
                )}
                {mascotMood === 'sad' && (
                  <span>嗚... 土地公公發抖了！地鼠突然竄出吞掉了所有好吃的。不要緊，再接再厲！</span>
                )}
                {mascotMood === 'win' && (
                  <span>太不可思議了！所有的地鼠都被我們用愛感化了！快來吃金燦燦的多汁大胡蘿蔔吧 🥕🏆✨</span>
                )}
              </div>
            </div>

            {/* Animated Mascot State */}
            <div className="text-6xl my-4 select-none h-16 flex items-center justify-center animate-bounce">
              {mascotMood === 'happy' ? '🐰✨' :
               mascotMood === 'scared' ? '🐰💦' :
               mascotMood === 'sad' ? '🐰💔' :
               mascotMood === 'win' ? '🐰👑' : '🐰👒'}
            </div>

            <div className="text-left w-full border-t border-stone-50 pt-3.5 space-y-1">
              <span className="text-[11px] font-bold text-gray-800 block">萌兔朵朵 🐰👒</span>
              <span className="text-[9.5px] text-stone-400 font-medium leading-relaxed block">
                在陽光絢爛的胡蘿蔔地長大。膽子有點小，但對甜脆蘿蔔的氣味判斷非常精準！
              </span>
            </div>
          </div>

          {/* Difficulty Selection Column */}
          <div className="bg-white p-4 rounded-2xl border border-stone-100 shadow-sm space-y-3">
            <span className="block text-[9.5px] font-bold text-gray-400 uppercase tracking-widest border-b pb-1">花園面積等級</span>
            <div className="grid grid-cols-3 gap-1 px-0.5">
              {(['easy', 'medium', 'hard'] as const).map(level => {
                const isActive = difficulty === level;
                return (
                  <button
                    key={level}
                    onClick={() => {
                      playSfx('click');
                      setDifficulty(level);
                    }}
                    className={`py-1.5 rounded-xl text-[10px] font-bold text-center border transition-all ${
                      isActive 
                        ? 'bg-[#1b6b4f] border-[#124b37] text-white shadow-inner font-black' 
                        : 'bg-stone-50 hover:bg-stone-100 text-gray-500 border-zinc-150'
                    }`}
                  >
                    {DIFFICULTIES[level].label}
                  </button>
                );
              })}
            </div>

            <button
              onClick={handleStartGame}
              className="marshmallow-button w-full bg-[#1b6b4f] text-white hover:bg-emerald-700 font-bold py-2.5 rounded-full text-xs flex items-center justify-center gap-1 border-b-4 border-emerald-950"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>整修花園泥土 ⚙️</span>
            </button>
          </div>

          {/* Tutorial guides */}
          <div className="bg-stone-50 p-4 rounded-2xl border border-stone-100 space-y-3">
            <span className="block text-[9px] font-bold text-[#1b6b4f] uppercase tracking-widest flex items-center gap-1">
              <HelpCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>新手拔蘿蔔基礎手冊</span>
            </span>
            <ul className="text-[10px] text-gray-500 font-medium leading-relaxed space-y-1.5 font-sans">
              <li>📌 <strong>基本理念</strong>：避開所有的「地鼠 🦫」，點出所有藏有「胡蘿蔔 🥕」的泥土。</li>
              <li>📌 <strong>數字解密</strong>：點開的格子中顯示的數字（例如 1），代表<strong>周圍八個格子</strong>中一共有 1 隻隱藏的地鼠。</li>
              <li>📌 <strong>智慧排雷</strong>：
                <ul className="pl-3 list-disc mt-0.5 text-stone-400 space-y-0.5">
                  <li>第一步點擊是絕對安全的！放心開始。</li>
                  <li>如果推導出某個格子有地鼠，在該格按下 <strong>滑鼠右鍵</strong> 鎖定插旗 🚩 標記。</li>
                  <li>當你標出了所有地鼠且打開了其他所有安全胡蘿蔔格子時，即取得完美豐收大滿貫！</li>
                </ul>
              </li>
            </ul>
          </div>

        </div>

      </div>

    </div>
  );
}
