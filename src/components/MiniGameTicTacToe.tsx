/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, RotateCcw, Volume2, VolumeX, Trophy, Users, Cpu, HelpCircle, Heart, Star, Sparkles, AlertCircle } from 'lucide-react';

type Owner = 'kitty' | 'puppy' | null;
type GameMode = 'vs_ai' | 'two_player';
type AIDifficulty = 'easy' | 'medium' | 'hard';
type MascotMood = 'chatting' | 'winning' | 'losing' | 'tie' | 'thinking';

interface ScoreTracker {
  kittyWins: number;
  puppyWins: number;
  ties: number;
}

export default function MiniGameTicTacToe() {
  const [board, setBoard] = useState<Owner[]>(Array(9).fill(null));
  const [gameMode, setGameMode] = useState<GameMode>('vs_ai');
  const [difficulty, setDifficulty] = useState<AIDifficulty>('medium');
  const [currentTurn, setCurrentTurn] = useState<'kitty' | 'puppy'>('kitty'); // 'kitty' is Player 1 (X), 'puppy' is 2 (O)
  const [winner, setWinner] = useState<Owner | 'draw' | null>(null);
  const [winningLine, setWinningLine] = useState<number[] | null>(null);
  const [score, setScore] = useState<ScoreTracker>({ kittyWins: 0, puppyWins: 0, ties: 0 });
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [mascotMood, setMascotMood] = useState<MascotMood>('chatting');
  const [mascotSpeech, setMascotSpeech] = useState<string>('跟我比劃貓拳吧！你能打破我的爪爪棋防禦嗎？🐱🐾');
  const [isAiThinking, setIsAiThinking] = useState<boolean>(false);

  // Sound Synthesizer via Web Audio API
  const playSfx = useCallback((type: 'meow' | 'bark' | 'win' | 'lose' | 'tie' | 'click' | 'menu') => {
    if (!soundEnabled) return;
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();

      // Sound synth configurations
      if (type === 'meow') {
        // High-pitched slide matching a happy kitten meow
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        // Meow slide up and down quickly
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.08);
        osc.frequency.exponentialRampToValueAtTime(700, ctx.currentTime + 0.25);
        gain.gain.setValueAtTime(0.06, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.005, ctx.currentTime + 0.25);
        osc.start();
        osc.stop(ctx.currentTime + 0.26);
      } else if (type === 'bark') {
        // Double punch bark sound for puppy
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        osc1.type = 'sawtooth';
        osc1.frequency.setValueAtTime(250, ctx.currentTime);
        osc1.frequency.linearRampToValueAtTime(100, ctx.currentTime + 0.08);
        gain1.gain.setValueAtTime(0.06, ctx.currentTime);
        gain1.gain.exponentialRampToValueAtTime(0.002, ctx.currentTime + 0.08);

        osc1.start();
        osc1.stop(ctx.currentTime + 0.09);
      } else if (type === 'win') {
        // Cheerful ascending arpeggio
        const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50];
        notes.forEach((freq, idx) => {
          const oscNode = ctx.createOscillator();
          const gainNode = ctx.createGain();
          oscNode.connect(gainNode);
          gainNode.connect(ctx.destination);
          oscNode.type = 'sine';
          oscNode.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.06);
          gainNode.gain.setValueAtTime(0.07, ctx.currentTime + idx * 0.06);
          gainNode.gain.exponentialRampToValueAtTime(0.005, ctx.currentTime + idx * 0.06 + 0.25);
          oscNode.start(ctx.currentTime + idx * 0.06);
          oscNode.stop(ctx.currentTime + idx * 0.06 + 0.26);
        });
      } else if (type === 'lose') {
        // Descending low sweep, melancholic
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(280, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(140, ctx.currentTime + 0.4);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.002, ctx.currentTime + 0.4);
        osc.start();
        osc.stop(ctx.currentTime + 0.41);
      } else if (type === 'tie') {
        // Gentle neutral beep
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(330, ctx.currentTime);
        osc.frequency.setValueAtTime(392, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.002, ctx.currentTime + 0.2);
        osc.start();
        osc.stop(ctx.currentTime + 0.21);
      } else if (type === 'click') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(450, ctx.currentTime);
        gain.gain.setValueAtTime(0.03, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
        osc.start();
        osc.stop(ctx.currentTime + 0.05);
      } else if (type === 'menu') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(587, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
        osc.start();
        osc.stop(ctx.currentTime + 0.12);
      }
    } catch {
      // Audio bypass if browser restricts it
    }
  }, [soundEnabled]);

  // Mascot dynamic quotes generator
  const triggerMascotReaction = useCallback((mood: MascotMood, overrideText?: string) => {
    setMascotMood(mood);
    if (overrideText) {
      setMascotSpeech(overrideText);
      return;
    }

    const quotes = {
      chatting: [
        '喵喵～到我們過招了，看好了喵！🐱🐾',
        '汪汪！在棋盤上，狗牙可是無比鋒利的哦！🐶🍖',
        '雙方你來我往才是最快樂的～❤️',
        '不要分心，把棋尖對準最中央的關鍵領地唷！',
      ],
      winning: [
        '哇！貓拳大獲全勝，魚乾要分一成給我喵！🐱🐟🏆',
        '年糕汪在奔跑！守衛棋盤大勝利！🐶🎉🌟',
        '太厲害了，爪爪組合簡直完美無瑕！'
      ],
      losing: [
        '可惡喵...我的雷達貓耳剛才好像失靈了🐾',
        '汪汪？剛才發生了什麼（咬手骨）？再打一局嘛！',
        '下一次一定能攔截住防禦圈，哼氣！🐰😤'
      ],
      tie: [
        '唔，這是一盤完美的友誼爪爪棋！喵汪和睦！🐱🤝🐶',
        '勢均力敵！既然這樣，大家都有魚乾吃囉～🍰'
      ],
      thinking: [
        '喵嗚... 抱著小腦袋，正在大腦內部飛速運算！💻🌟',
        '汪汪，不要急... 好好想想下一爪要蓋印在哪個肉墊格！'
      ]
    };

    const randArr = quotes[mood];
    const phrase = randArr[Math.floor(Math.random() * randArr.length)];
    setMascotSpeech(phrase);
  }, []);

  // Check Game Winner
  const evaluateWinner = (grid: Owner[]) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // Cols
      [0, 4, 8], [2, 4, 6]             // Diagonals
    ];

    for (const [a, b, c] of lines) {
      if (grid[a] && grid[a] === grid[b] && grid[a] === grid[c]) {
        return { winner: grid[a], line: [a, b, c] };
      }
    }

    if (grid.every(cell => cell !== null)) {
      return { winner: 'draw' as Owner | 'draw', line: null };
    }

    return { winner: null, line: null };
  };

  // Minimax Algorithm for AI
  const minimax = useCallback((grid: Owner[], depth: number, isMaximizing: boolean): { score: number; index: number } => {
    const verdict = evaluateWinner(grid);
    if (verdict.winner === 'puppy') return { score: 10 - depth, index: -1 }; // Puppy is the AI (O)
    if (verdict.winner === 'kitty') return { score: depth - 10, index: -1 }; // Kitty is the player (X)
    if (verdict.winner === 'draw') return { score: 0, index: -1 };

    let bestScore = isMaximizing ? -Infinity : Infinity;
    let bestIndex = -1;

    for (let i = 0; i < grid.length; i++) {
      if (grid[i] === null) {
        const nextGrid = [...grid];
        nextGrid[i] = isMaximizing ? 'puppy' : 'kitty';
        const res = minimax(nextGrid, depth + 1, !isMaximizing);

        if (isMaximizing) {
          if (res.score > bestScore) {
            bestScore = res.score;
            bestIndex = i;
          }
        } else {
          if (res.score < bestScore) {
            bestScore = res.score;
            bestIndex = i;
          }
        }
      }
    }

    return { score: bestScore, index: bestIndex };
  }, []);

  // Smarter bot decision-making logic
  const handleAIMove = useCallback((currentGrid: Owner[]) => {
    const availableIndices = currentGrid.map((cell, idx) => cell === null ? idx : null).filter((v): v is number => v !== null);
    if (availableIndices.length === 0) return;

    let targetIndex = -1;

    // 1. Easy Mode: Completely Random placement
    if (difficulty === 'easy') {
      targetIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
    }

    // 2. Medium Mode: Defends threats or takes immediate wins; otherwise picks sweet center or corners randomly
    else if (difficulty === 'medium') {
      // Check if AI can win instantly
      for (const i of availableIndices) {
        const testGrid = [...currentGrid];
        testGrid[i] = 'puppy';
        if (evaluateWinner(testGrid).winner === 'puppy') {
          targetIndex = i;
          break;
        }
      }

      // Check if Player is about to win and block them
      if (targetIndex === -1) {
        for (const i of availableIndices) {
          const testGrid = [...currentGrid];
          testGrid[i] = 'kitty';
          if (evaluateWinner(testGrid).winner === 'kitty') {
            targetIndex = i;
            break;
          }
        }
      }

      // Fallback: choose center (4) if empty, else random
      if (targetIndex === -1) {
        if (currentGrid[4] === null && Math.random() > 0.3) {
          targetIndex = 4;
        } else {
          targetIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
        }
      }
    }

    // 3. Hard Mode: Unbeatable MiniMax Strategy
    else {
      // On first move of O, if central cell is available, take center often
      if (availableIndices.length === 8 && currentGrid[4] === null) {
        targetIndex = 4;
      } else {
        const result = minimax(currentGrid, 0, true);
        targetIndex = result.index;
      }
    }

    setIsAiThinking(true);
    triggerMascotReaction('thinking');

    // Simulate thinking delay for cute personality
    const thinkingTime = 600 + Math.random() * 500;
    setTimeout(() => {
      setIsAiThinking(false);
      if (targetIndex === -1) return;

      const nextBoard = [...currentGrid];
      nextBoard[targetIndex] = 'puppy';
      setBoard(nextBoard);
      playSfx('bark');

      const evaluation = evaluateWinner(nextBoard);
      if (evaluation.winner) {
        handleEndState(evaluation.winner, evaluation.line);
      } else {
        setCurrentTurn('kitty');
        triggerMascotReaction('chatting', '巧用智慧！又輪到勇敢的喵喵出招了，抓穩囉～🐱🐾');
      }
    }, thinkingTime);

  }, [difficulty, minimax, triggerMascotReaction, playSfx]);

  // Handle Game End States
  const handleEndState = (gameWinner: Owner | 'draw', winningCombo: number[] | null) => {
    if (gameWinner === 'kitty') {
      setWinner('kitty');
      if (winningCombo) setWinningLine(winningCombo);
      setScore(prev => ({ ...prev, kittyWins: prev.kittyWins + 1 }));
      playSfx('win');
      triggerMascotReaction('winning', '喵嗚嘿！完美的九宮格閃電戰！喵力爆發啦～🐈✨🏆');
    } else if (gameWinner === 'puppy') {
      setWinner('puppy');
      if (winningCombo) setWinningLine(winningCombo);
      setScore(prev => ({ ...prev, puppyWins: prev.puppyWins + 1 }));
      playSfx('lose');
      triggerMascotReaction('losing', '汪汪汪！骨頭小狗不小心封鎖了全盤線段，勝敗乃兵家常事，再來一輪嘛～🐶');
    } else if (gameWinner === 'draw') {
      setWinner('draw');
      setScore(prev => ({ ...prev, ties: prev.ties + 1 }));
      playSfx('tie');
      triggerMascotReaction('tie');
    }
  };

  // Perform User Turn Click
  const handleCellClick = (idx: number) => {
    if (board[idx] !== null || winner || isAiThinking) return;

    const playerOwner = currentTurn;
    const nextBoard = [...board];
    nextBoard[idx] = playerOwner;
    setBoard(nextBoard);

    // Play specific sound based on character
    if (playerOwner === 'kitty') {
      playSfx('meow');
    } else {
      playSfx('bark');
    }

    // Evaluate
    const evaluation = evaluateWinner(nextBoard);
    if (evaluation.winner) {
      handleEndState(evaluation.winner, evaluation.line);
    } else {
      // Toggle Turn
      if (gameMode === 'vs_ai') {
        setCurrentTurn('puppy');
        handleAIMove(nextBoard);
      } else {
        const nextPlayer = playerOwner === 'kitty' ? 'puppy' : 'kitty';
        setCurrentTurn(nextPlayer);
        triggerMascotReaction('chatting', nextPlayer === 'kitty' 
          ? '現在換「橘喵 🐱」落爪囉～看我的肉墊神功！' 
          : '接下來輪到「白汪 🐶」出手了～搶佔防線！'
        );
      }
    }
  };

  // Restart / Reset Game state
  const handleRestart = useCallback((resetEntireScore = false) => {
    playSfx('click');
    setBoard(Array(9).fill(null));
    setWinner(null);
    setWinningLine(null);
    setCurrentTurn('kitty');
    setIsAiThinking(false);
    
    if (resetEntireScore) {
      setScore({ kittyWins: 0, puppyWins: 0, ties: 0 });
      triggerMascotReaction('chatting', '數據已被清空！新一輪愛意切磋開始了！喵喵必勝🐱');
    } else {
      triggerMascotReaction('chatting', '棋盤修整完成！這回看誰的肉墊與腳印先連成一線！🐾');
    }
  }, [playSfx, triggerMascotReaction]);

  // Handle Game Mode toggle
  const changeGameMode = (mode: GameMode) => {
    playSfx('menu');
    setGameMode(mode);
    setBoard(Array(9).fill(null));
    setWinner(null);
    setWinningLine(null);
    setCurrentTurn('kitty');
    setIsAiThinking(false);

    if (mode === 'vs_ai') {
      triggerMascotReaction('chatting', '啟動【智慧小狗AI對決模式】！挑戰多重智慧體系吧 🐶🖥️');
    } else {
      triggerMascotReaction('chatting', '啟動【雙人攜手同樂模式】！把手機/平板和親密小夥伴分兩端一起玩吧 🐱🤝🐶');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6 select-none bg-orange-50/10 rounded-3xl border border-orange-100/30 shadow-sm font-sans">
      
      {/* Title Header Panel */}
      <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-4 rounded-2xl border border-orange-50/60 shadow-sm gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-100 text-orange-850 rounded-xl flex items-center justify-center font-bold text-xl shadow-inner">
            🐾
          </div>
          <div className="text-left">
            <h3 className="font-sans font-bold text-xs text-stone-800 flex items-center gap-1.5">
              <span>萌喵汪汪爪爪棋 (Kittens & Puppies Tic Tac Toe)</span>
              <span className="bg-amber-100 text-amber-800 text-[10px] font-extrabold px-1.5 py-0.5 rounded-full border border-amber-200">
                傳統圈叉
              </span>
            </h3>
            <p className="text-[10px] text-zinc-400 font-medium mt-0.5">
              與可愛的小橘貓「橘子」和小白汪「年糕」切磋傳統九宮格圈叉棋法，感受超療癒音效！
            </p>
          </div>
        </div>

        {/* Action controllers */}
        <div className="flex gap-3 items-center">
          <button
            onClick={() => {
              setSoundEnabled(!soundEnabled);
              playSfx('click');
            }}
            className={`p-2 rounded-full border transition-all ${soundEnabled ? 'bg-orange-50 border-orange-200 text-orange-850' : 'bg-stone-50 border-stone-100 text-stone-400'}`}
            title={soundEnabled ? "打開音效" : "關閉音效"}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Playboard Area LEFT */}
        <div className="lg:col-span-8 flex flex-col items-center space-y-4">
          
          {/* Main Select Mode & Statistics Dashboard */}
          <div className="w-full grid grid-cols-3 gap-3 bg-white border border-stone-100 p-3 rounded-2xl shadow-sm items-center text-center">
            
            {/* Stats Cat */}
            <div className="bg-orange-50/40 p-2.5 rounded-xl border border-orange-100 flex flex-col items-center">
              <span className="text-[19px] mb-0.5">🐱 橘子勝</span>
              <span className="text-sm font-mono font-black text-orange-800">{score.kittyWins} 次</span>
            </div>

            {/* Stats Tie */}
            <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-150 flex flex-col items-center">
              <span className="text-[19px] mb-0.5">🤝 握手和</span>
              <span className="text-sm font-mono font-black text-stone-600">{score.ties} 次</span>
            </div>

            {/* Stats Dog */}
            <div className="bg-sky-50/40 p-2.5 rounded-xl border border-sky-100 flex flex-col items-center">
              <span className="text-[19px] mb-0.5">🐶 年糕勝</span>
              <span className="text-sm font-mono font-black text-sky-800">{score.puppyWins} 次</span>
            </div>

          </div>

          {/* Current Turn Notification Ribbon */}
          <div className="w-full flex justify-between items-center bg-white border border-zinc-100 px-5 py-2.5 rounded-xl shadow-inner text-xs font-bold text-gray-500">
            <span className="flex items-center gap-1.5">
              🚀 當前模式: 
              <span className="text-primary bg-emerald-50 px-2 py-0.5 rounded-full text-[10px]">
                {gameMode === 'vs_ai' ? '智慧人機對決' : '雙人同屏同樂'}
              </span>
            </span>

            {/* Winner banner inside turn container */}
            <div className="flex items-center gap-2">
              <span>落爪順序:</span>
              <div className="flex items-center gap-1 bg-amber-50 text-amber-900 px-3 py-1 rounded-full text-[10px] border border-amber-200">
                {currentTurn === 'kitty' ? '🐱 橘貓肉墊 (先手)' : '🐶 白汪印記'}
              </div>
            </div>
          </div>

          {/* Core Gameboard */}
          <div className="relative w-full aspect-auto max-w-[420px] bg-amber-950/10 rounded-3xl p-4 border-4 border-amber-900/15 shadow-md flex items-center justify-center select-none overflow-hidden">
            
            <div className="grid grid-cols-3 gap-3 w-full bg-orange-100/40 p-2.5 rounded-2xl shadow-inner border border-orange-200/50">
              {board.map((cell, idx) => {
                const isWinnerCell = winningLine?.includes(idx);
                return (
                  <button
                    key={idx}
                    onClick={() => handleCellClick(idx)}
                    disabled={cell !== null || winner !== null || isAiThinking}
                    className={`relative aspect-square flex items-center justify-center rounded-2xl border transition-all duration-200 cursor-pointer ${
                      cell === 'kitty'
                        ? isWinnerCell
                          ? 'bg-orange-200 border-orange-400 scale-102 shadow-lg animate-pulse'
                          : 'bg-orange-50 border-orange-200 shadow shadow-orange-100'
                        : cell === 'puppy'
                          ? isWinnerCell
                            ? 'bg-sky-200 border-sky-400 scale-102 shadow-lg animate-pulse'
                            : 'bg-sky-50 border-sky-200 shadow shadow-sky-100'
                          : 'bg-white hover:bg-orange-50/50 border-zinc-200 active:scale-95 shadow font-normal'
                    }`}
                  >
                    <AnimatePresence mode="wait">
                      {cell === 'kitty' && (
                        <motion.div
                          key="kitty"
                          initial={{ scale: 0.1, rotate: -20 }}
                          animate={{ scale: 1, rotate: 0 }}
                          exit={{ scale: 0.1 }}
                          transition={{ type: 'spring', stiffness: 220, damping: 15 }}
                          className="flex flex-col items-center justify-center"
                        >
                          <span className="text-4xl sm:text-5xl filter drop-shadow">🐾</span>
                          <span className="text-[9px] text-orange-500 font-extrabold mt-0.5">橘子貓爪</span>
                        </motion.div>
                      )}

                      {cell === 'puppy' && (
                        <motion.div
                          key="puppy"
                          initial={{ scale: 0.1, rotate: 20 }}
                          animate={{ scale: 1, rotate: 0 }}
                          exit={{ scale: 0.1 }}
                          transition={{ type: 'spring', stiffness: 220, damping: 15 }}
                          className="flex flex-col items-center justify-center"
                        >
                          <span className="text-4xl sm:text-5xl filter drop-shadow">🦴</span>
                          <span className="text-[9px] text-sky-500 font-extrabold mt-0.5">年糕汪汪</span>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Glowing highlight indicator for standard wins */}
                    {isWinnerCell && (
                      <div className="absolute inset-0 rounded-2xl border-4 border-amber-400 pointer-events-none animate-ping opacity-60" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Winner Overlay HUD */}
            {winner && (
              <div className="absolute inset-0 bg-stone-950/65 backdrop-blur-[2.5px] flex items-center justify-center z-30 animate-in fade-in duration-200">
                <div className="bg-white p-6 rounded-3xl border-4 border-amber-300 text-center max-w-[280px] space-y-4 shadow-2xl relative">
                  
                  {winner === 'kitty' && (
                    <div className="space-y-2">
                      <span className="text-5xl block animate-bounce">🐱👑🎉</span>
                      <h4 className="font-bold text-orange-800 text-sm">橘貓大發神威！</h4>
                      <p className="text-[10px] text-zinc-400 font-medium leading-relaxed">
                        「橘子」抓住了對手的邏輯漏洞，成功三爪連線！小魚乾裝滿一整桶！
                      </p>
                    </div>
                  )}

                  {winner === 'puppy' && (
                    <div className="space-y-2">
                      <span className="text-5xl block animate-bounce">🐶🍗✨</span>
                      <h4 className="font-bold text-sky-800 text-sm">年糕汪獲得金骨頭！</h4>
                      <p className="text-[10px] text-zinc-400 font-medium leading-relaxed">
                        「年糕」搖著短短的小尾巴，興高采烈地用骨頭劃出了必勝線段！
                      </p>
                    </div>
                  )}

                  {winner === 'draw' && (
                    <div className="space-y-2">
                      <span className="text-5xl block animate-pulse">🐱🤝🐶</span>
                      <h4 className="font-bold text-stone-700 text-sm">和平握手好溫馨！</h4>
                      <p className="text-[10px] text-zinc-400 font-medium leading-relaxed">
                        棋逢敵手，誰也分不出勝負！橘子和年糕依偎在一起睡著了喵。
                      </p>
                    </div>
                  )}

                  <button
                    onClick={() => handleRestart(false)}
                    className="marshmallow-button w-full bg-primary text-white hover:bg-emerald-700 py-3 rounded-full text-xs font-bold shadow border-b-4 border-emerald-950"
                  >
                    再度挑戰小夥伴 ➔
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Quick utility controls bottom */}
          <div className="w-full max-w-[420px] bg-white border border-stone-100 rounded-2xl p-3 shadow-sm flex justify-between items-center text-[11px] text-stone-500 gap-3">
            <button
              onClick={() => handleRestart(false)}
              className="py-1 px-3 bg-stone-50 hover:bg-stone-100 border border-stone-200 text-stone-700 rounded-full font-bold flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>重新洗牌</span>
            </button>

            <button
              onClick={() => handleRestart(true)}
              className="py-1 px-3 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 rounded-full font-bold flex items-center gap-1 transition-colors"
            >
              <span>重置數據</span>
            </button>
          </div>

        </div>

        {/* Mascot / Guidelines Column RIGHT */}
        <div className="lg:col-span-4 space-y-4 text-left">
          
          {/* Mascot Box */}
          <div className="bg-white p-4 rounded-3xl border border-stone-100 shadow-sm text-center relative overflow-hidden flex flex-col items-center">
            
            {/* Speech bubble */}
            <div className="min-h-[50px] w-full mt-2 flex items-center justify-center px-1">
              <div className="relative bg-[#fcf5e3]/90 border border-amber-100/60 p-2.5 rounded-2xl text-[10px] text-amber-950 font-bold font-sans w-full leading-relaxed select-none">
                <div className="absolute w-2 h-2 bg-[#fcf5e3] border-b border-l border-amber-100/60 rotate-45 -bottom-1 left-1/2 -translate-x-1/2" />
                <span>{mascotSpeech}</span>
              </div>
            </div>

            {/* Mascot Avatar Avatar Area */}
            <div className="text-6xl my-4 h-16 flex items-center justify-center select-none animate-bounce">
              {mascotMood === 'winning' ? '🐱🌟👑' :
               mascotMood === 'losing' ? '🐶💔🐾' :
               mascotMood === 'tie' ? '🐱🤝🐶' :
               mascotMood === 'thinking' ? '🐾💻❓' : '🐱🐾🍊'}
            </div>

            <div className="text-left w-full border-t border-stone-50 pt-3.5 space-y-1">
              <span className="text-[11px] font-bold text-gray-800 block">小貓「橘子」與小狗「年糕」🐱🐶</span>
              <span className="text-[9.5px] text-stone-400 font-medium leading-relaxed block">
                生活在暖和的向日葵地毯上。橘爪尖銳靈巧，白汪憨厚實誠，最喜歡在木桌上舉辦爪爪連線大賽！
              </span>
            </div>
          </div>

          {/* Mode Selector Panel */}
          <div className="bg-white p-4 rounded-2xl border border-stone-100 shadow-sm space-y-3.5">
            <span className="block text-[9.5px] font-bold text-gray-400 uppercase tracking-widest border-b pb-1">遊戲戰局模式</span>
            
            <div className="grid grid-cols-2 gap-2 text-center">
              <button
                onClick={() => changeGameMode('vs_ai')}
                className={`p-2 rounded-xl text-[10.5px] font-bold border transition-all flex flex-col items-center gap-1.5 ${
                  gameMode === 'vs_ai'
                    ? 'bg-[#1b6b4f] border-[#124b37] text-white'
                    : 'bg-stone-50 hover:bg-stone-100 text-stone-500 border-zinc-200'
                }`}
              >
                <Cpu className="w-4 h-4" />
                <span>機智AI對抗</span>
              </button>

              <button
                onClick={() => changeGameMode('two_player')}
                className={`p-2 rounded-xl text-[10.5px] font-bold border transition-all flex flex-col items-center gap-1.5 ${
                  gameMode === 'two_player'
                    ? 'bg-[#1b6b4f] border-[#124b37] text-white'
                    : 'bg-stone-50 hover:bg-stone-100 text-stone-500 border-zinc-200'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>雙人同樂對策</span>
              </button>
            </div>

            {/* AI level select under vs AI */}
            {gameMode === 'vs_ai' && (
              <div className="space-y-1.5 bg-orange-50/25 p-2 rounded-xl border border-orange-100">
                <span className="block text-[9px] font-bold text-orange-800 uppercase tracking-wider">小白汪 AI 智力難度:</span>
                <div className="grid grid-cols-3 gap-1">
                  {(['easy', 'medium', 'hard'] as const).map(lvl => {
                    const isLvlActive = difficulty === lvl;
                    const labels = { easy: '散步 🐾', medium: '特訓 🍖', hard: '汪王 👑' };
                    return (
                      <button
                        key={lvl}
                        onClick={() => {
                          setDifficulty(lvl);
                          playSfx('click');
                          triggerMascotReaction('chatting', `白汪年糕切換到「${labels[lvl]}」級智商！看招喵！🐾`);
                        }}
                        className={`py-1 rounded-lg text-[9.5px] font-bold border ${
                          isLvlActive
                            ? 'bg-orange-100 border-orange-300 text-orange-900 font-extrabold'
                            : 'bg-white text-stone-500 border-stone-200 hover:bg-stone-50'
                        }`}
                      >
                        {labels[lvl]}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Quick Manual Guide */}
          <div className="bg-stone-50 p-4 rounded-2xl border border-stone-100 space-y-3">
            <span className="block text-[9px] font-bold text-[#1b6b4f] uppercase tracking-widest flex items-center gap-1">
              <HelpCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>毛茸茸爪爪連線說明</span>
            </span>
            <ul className="text-[10px] text-gray-500 font-medium leading-relaxed space-y-1.5">
              <li>📌 <strong>經典博弈</strong>：每個人輪流在 3x3 棋盤中蓋下屬於自己的爪印或者骨頭標記。</li>
              <li>📌 <strong>連線狂歡</strong>：最先在橫排、豎列或對角線上排滿 <strong>三個相同標記</strong> 的玩家取得金牌勝利！</li>
              <li>📌 <strong>對戰策略</strong>：
                <ul className="pl-3 list-disc mt-0.5 text-stone-400 space-y-0.5">
                  <li><strong>機智AI模式</strong>下，您將扮演先手橘貓，小白汪由高智商AI操縱。</li>
                  <li><strong>雙人同屏模式</strong>下，兩位小夥伴可以輪流按順序操作，趣味翻倍。</li>
                  <li>「汪王 👑」AI難度採用了嚴謹的 MiniMax 計算，毫無漏洞，挑戰你的腦速峰值！</li>
                </ul>
              </li>
            </ul>
          </div>

        </div>

      </div>

    </div>
  );
}
