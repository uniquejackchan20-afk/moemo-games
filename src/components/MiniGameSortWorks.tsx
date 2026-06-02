/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, RotateCcw, Volume2, VolumeX, Heart, Star, Sparkles, Undo, ArrowUpCircle, HelpCircle, Layers, ShieldCheck, Award, Zap, RefreshCw, PlusCircle, CheckCircle2 } from 'lucide-react';

interface BeadType {
  id: number;
  name: string;
  emoji: string;
  color: string; // Tailwind bg color class
  glowColor: string; // Tailwind filter shadow/color
  blessing: string;
}

interface Flask {
  id: number;
  beads: number[]; // Array of BeadTypeId (top of the array is the top of the flask)
  isCompleted: boolean;
}

type GameState = 'idle' | 'playing' | 'victory';
type Difficulty = 'easy' | 'medium' | 'hard';

const BEAD_TYPES: BeadType[] = [
  { id: 0, name: '金璨珠', emoji: '🌟', color: 'from-amber-300 to-yellow-500', glowColor: 'shadow-yellow-400/50', blessing: '金玉滿堂' },
  { id: 1, name: '木華珠', emoji: '🎋', color: 'from-emerald-300 to-green-600', glowColor: 'shadow-green-400/50', blessing: '青春常駐' },
  { id: 2, name: '水靈珠', emoji: '❄️', color: 'from-cyan-300 to-blue-600', glowColor: 'shadow-blue-400/50', blessing: '歲歲平安' },
  { id: 3, name: '火羽珠', emoji: '🔥', color: 'from-rose-400 to-red-600', glowColor: 'shadow-rose-400/50', blessing: '紅紅火火' },
  { id: 4, name: '土瑞珠', emoji: '🪵', color: 'from-amber-600 to-amber-900', glowColor: 'shadow-amber-700/50', blessing: '厚德載物' },
];

const MAX_BEADS = 4;

export default function MiniGameSortWorks() {
  const [gameState, setGameState] = useState<GameState>('idle');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [score, setScore] = useState<number>(0);
  const [hiScore, setHiScore] = useState<number>(0);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  
  // Game states
  const [flasks, setFlasks] = useState<Flask[]>([]);
  const [selectedFlaskId, setSelectedFlaskId] = useState<number | null>(null);
  
  // Boosters and help features
  const [undoHistory, setUndoHistory] = useState<string[]>([]); // Serialized flask states for multi-step UNDO
  const [undoCount, setUndoCount] = useState<number>(3);
  const [extraFlaskAdded, setExtraFlaskAdded] = useState<boolean>(false);

  // Mascot Red Panda interactions
  const [mascotMood, setMascotMood] = useState<'chatting' | 'cheering' | 'thinking' | 'victory' | 'sad'>('chatting');
  const [mascotSpeech, setMascotSpeech] = useState<string>('福運安康！我是玲瓏閣閣主「小禾」🐿️🌾 五彩珠子散落各處，快幫我把它們按屬性歸類到竹筒或青瓷盞內，五福臨門就看你囉！');

  // Load high score
  useEffect(() => {
    const saved = localStorage.getItem('minigame_sortworks_hiscore');
    if (saved) {
      setHiScore(parseInt(saved, 10));
    }
  }, []);

  // Ambient synth and audio system
  const playSfx = useCallback((type: 'click' | 'select' | 'drop' | 'complete' | 'powerup' | 'win' | 'error') => {
    if (!soundEnabled) return;
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();

      if (type === 'click') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
        osc.start();
        osc.stop(ctx.currentTime + 0.06);
      } else if (type === 'select') {
        // High soft chime up
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.08);
        gain.gain.setValueAtTime(0.06, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.09);
        osc.start();
        osc.stop(ctx.currentTime + 0.1);
      } else if (type === 'drop') {
        // Bamboo thud/wood block down sound
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(330, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(180, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
        osc.start();
        osc.stop(ctx.currentTime + 0.14);
      } else if (type === 'complete') {
        // Star sparkle sound
        const notes = [659.25, 783.99, 987.77, 1318.51]; // E5, G5, B5, E6 pentatonic cascade
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.05);
          gain.gain.setValueAtTime(0.06, ctx.currentTime + idx * 0.05);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.05 + 0.15);
          osc.start(ctx.currentTime + idx * 0.05);
          osc.stop(ctx.currentTime + idx * 0.05 + 0.2);
        });
      } else if (type === 'powerup') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(293.66, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1174.66, ctx.currentTime + 0.25);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.28);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      } else if (type === 'win') {
        // Multi-note joyful traditional scale
        const notes = [523.25, 587.33, 659.25, 783.99, 880, 1046.5, 1174.66, 1318.51];
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);
          gain.gain.setValueAtTime(0.08, ctx.currentTime + idx * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.08 + 0.25);
          osc.start(ctx.currentTime + idx * 0.08);
          osc.stop(ctx.currentTime + idx * 0.08 + 0.3);
        });
      } else if (type === 'error') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(140, ctx.currentTime);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
        osc.start();
        osc.stop(ctx.currentTime + 0.18);
      }
    } catch (e) {
      console.warn('Audio Failsafe:', e);
    }
  }, [soundEnabled]);

  const updateSpeech = useCallback((mood: typeof mascotMood, text: string) => {
    setMascotMood(mood);
    setMascotSpeech(text);
  }, []);

  // Setup / Initialize a level
  const generateLevel = useCallback((diff: Difficulty) => {
    setSelectedFlaskId(null);
    setUndoHistory([]);
    setExtraFlaskAdded(false);
    setUndoCount(3);
    
    // Choose bead color count based on difficulty
    let colorCount = 3;
    let emptyFlasks = 2;
    if (diff === 'easy') {
      colorCount = 3; // 3 filled, 2 empty = 5 total
    } else if (diff === 'medium') {
      colorCount = 4; // 4 filled, 2 empty = 6 total
    } else {
      colorCount = 5; // 5 filled, 2 empty = 7 total
    }

    // Build perfect pool of 4 beads per group
    const pool: number[] = [];
    for (let i = 0; i < colorCount; i++) {
      pool.push(i, i, i, i);
    }

    // Shuffle pool completely
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }

    // Distribute into flasks
    const list: Flask[] = [];
    let idx = 0;
    for (let f = 0; f < colorCount; f++) {
      const tubeBeads: number[] = [];
      for (let b = 0; b < MAX_BEADS; b++) {
        tubeBeads.push(pool[idx++]);
      }
      list.push({
        id: f,
        beads: tubeBeads,
        isCompleted: false, // will check if already complete (highly unlikely on startup but good to track)
      });
    }

    // Add empty flasks
    for (let e = 0; e < emptyFlasks; e++) {
      list.push({
        id: colorCount + e,
        beads: [],
        isCompleted: false,
      });
    }

    setFlasks(list);
  }, []);

  // Start playing
  const startGame = (diffVal: Difficulty = 'medium') => {
    playSfx('click');
    setDifficulty(diffVal);
    setScore(0);
    setGameState('playing');
    generateLevel(diffVal);

    const levelDetails = { easy: '小試新歲 🌸', medium: '玲瓏五行 🍊', hard: '乾坤圓滿 🌺' };
    updateSpeech('cheering', `「${levelDetails[diffVal]}」仙境開局！點選任意竹筒，將頂部的福瑞玉珠倒入另一相同頂部玉珠、或有空位的竹筒中吧！加油！🐿️💖`);
  };

  // Check if target move is legal, then execute it
  const handleFlaskClick = (targetId: number) => {
    if (gameState !== 'playing') return;

    if (selectedFlaskId === null) {
      // Step 1: Selecting source flask
      const sourceFlask = flasks.find(f => f.id === targetId);
      if (!sourceFlask || sourceFlask.beads.length === 0) {
        playSfx('error');
        updateSpeech('thinking', '欸？選了空空的竹筒呀，仙珠都溜走了，請選擇有五行玉珠的竹筒喔！🐿️🍃');
        return;
      }
      
      // If flask is already completely sorted, you can't touch it!
      const isComplete = sourceFlask.beads.length === MAX_BEADS && sourceFlask.beads.every(b => b === sourceFlask.beads[0]);
      if (isComplete) {
        playSfx('error');
        updateSpeech('cheering', '這個竹筒已完美歸類了仙珠，福至氣祥，不需要再調撥它啦！🎉🐿️');
        return;
      }

      playSfx('select');
      setSelectedFlaskId(targetId);
      updateSpeech('thinking', '選定上空的仙珠囉！打算把它安頓在哪個竹筒裏呢？🌾🐿️');
    } else {
      // Step 2: Selecting destination flask
      if (selectedFlaskId === targetId) {
        // Deselect
        playSfx('click');
        setSelectedFlaskId(null);
        return;
      }

      const sourceFlask = flasks.find(f => f.id === selectedFlaskId);
      const destFlask = flasks.find(f => f.id === targetId);

      if (!sourceFlask || !destFlask) {
        setSelectedFlaskId(null);
        return;
      }

      const movingBeadId = sourceFlask.beads[sourceFlask.beads.length - 1];

      // Verifying destination flask space
      if (destFlask.beads.length >= MAX_BEADS) {
        playSfx('error');
        updateSpeech('thinking', '糟糕，那個竹筒已經裝滿 4 顆玉珠，裝不下啦，換一個容器吧！🎒🐿️');
        setSelectedFlaskId(null);
        return;
      }

      // Rules for non-empty flask: must match the color of the top-most item
      if (destFlask.beads.length > 0) {
        const topDestBeadVal = destFlask.beads[destFlask.beads.length - 1];
        if (topDestBeadVal !== movingBeadId) {
          playSfx('error');
          updateSpeech('thinking', '顏色不合乎規矩呢！相同吉祥色彩的仙珠才能在同一個竹筒內疊加喔～ 🚫🐿️');
          setSelectedFlaskId(null);
          return;
        }
      }

      // Move is valid! Push state copy to history first
      saveStateToHistory();

      // How many consecutive same beads can we move in one go? (Classic water sort convenience rule, players find it extremely pleasant)
      let consecutiveCount = 0;
      const beadsToMove: number[] = [];
      const updatedSourceBeads = [...sourceFlask.beads];

      while (updatedSourceBeads.length > 0 && 
             updatedSourceBeads[updatedSourceBeads.length - 1] === movingBeadId &&
             destFlask.beads.length + consecutiveCount < MAX_BEADS) {
        beadsToMove.push(updatedSourceBeads.pop()!);
        consecutiveCount++;
      }

      // Execute local update
      let newlyCompletedType = -1;
      const updatedFlasks = flasks.map(f => {
        if (f.id === selectedFlaskId) {
          return { ...f, beads: updatedSourceBeads };
        }
        if (f.id === targetId) {
          const finalBeads = [...f.beads, ...beadsToMove];
          const isComplete = finalBeads.length === MAX_BEADS && finalBeads.every(b => b === finalBeads[0]);
          if (isComplete) {
            newlyCompletedType = finalBeads[0];
          }
          return { ...f, beads: finalBeads, isCompleted: isComplete };
        }
        return f;
      });

      playSfx('drop');
      setFlasks(updatedFlasks);
      setSelectedFlaskId(null);

      // Handle newly completed column
      if (newlyCompletedType !== -1) {
        setTimeout(() => {
          playSfx('complete');
          setScore(prev => {
            const added = 400;
            const newScore = prev + added;
            if (newScore > hiScore) {
              setHiScore(newScore);
              localStorage.setItem('minigame_sortworks_hiscore', newScore.toString());
            }
            return newScore;
          });

          const beadName = BEAD_TYPES[newlyCompletedType]?.name;
          const bless = BEAD_TYPES[newlyCompletedType]?.blessing;
          const emoji = BEAD_TYPES[newlyCompletedType]?.emoji;

          updateSpeech('cheering', `巧手通天！成功歸類一整筒 ${emoji}${beadName}，喜獲「${bless}」！加 400 幸運分！🎋🐿️🎉`);
          
          // Verify final overall win state
          checkVictory(updatedFlasks);
        }, 150);
      } else {
        // Simple chat lines
        const casualPraise = [
          '步步為營，好極了！仙氣愈發順暢！💨',
          '很有條理呢，不愧是博古通今的解密大師！🦉',
          '小松鼠把乾淨的竹勺洗好備好了，繼續歸類吧！',
        ];
        updateSpeech('chatting', casualPraise[Math.floor(Math.random() * casualPraise.length)]);
      }
    }
  };

  const saveStateToHistory = () => {
    const serialized = JSON.stringify(flasks);
    setUndoHistory(prev => [serialized, ...prev].slice(0, 10)); // Keep up to 10 moves
  };

  // Booster 1: UNDO last move
  const triggerUndo = () => {
    if (gameState !== 'playing' || undoCount <= 0 || undoHistory.length === 0) {
      playSfx('error');
      return;
    }

    playSfx('powerup');
    const previousStateString = undoHistory[0];
    const parsed: Flask[] = JSON.parse(previousStateString);

    setFlasks(parsed);
    setUndoHistory(prev => prev.slice(1));
    setUndoCount(prev => prev - 1);
    setSelectedFlaskId(null);
    updateSpeech('chatting', '仙珠回溯！把剛才的調配往回撤銷一步，讓我們精打細算！⏰🐿️');
  };

  // Booster 2: ADD TEMP TUBE (Provides a golden blank tube to solve gridlocks)
  const triggerAddFlask = () => {
    if (gameState !== 'playing' || extraFlaskAdded) {
      playSfx('error');
      return;
    }

    playSfx('powerup');
    saveStateToHistory();

    const currentFlaskIds = flasks.map(f => f.id);
    const nextId = Math.max(...currentFlaskIds) + 1;

    setFlasks(prev => [
      ...prev,
      { id: nextId, beads: [], isCompleted: false }
    ]);
    setExtraFlaskAdded(true);
    updateSpeech('cheering', '神力降靈！玲瓏閣閣主阿吉搬出了一個尊貴的「百寶如意琉璃罐」，供你中轉玉珠！🏆🐿️');
  };

  // Reset current layout entirely to clear block states
  const triggerRestart = () => {
    playSfx('powerup');
    generateLevel(difficulty);
    updateSpeech('sad', '太極重啟！玲瓏閣玉珠全部歸位了。別氣餒，我們重振旗鼓，再次通關！🌾🌪️🐿️');
  };

  // Victory checker
  const checkVictory = (currentFlasks: Flask[]) => {
    // All tubes must either be empty OR be completely full of identical values
    const ok = currentFlasks.every(f => {
      if (f.beads.length === 0) return true;
      if (f.beads.length === MAX_BEADS) {
        return f.beads.every(b => b === f.beads[0]);
      }
      return false;
    });

    if (ok) {
      setTimeout(() => {
        setGameState('victory');
        playSfx('win');
        updateSpeech('victory', '大功告成！太絢爛了！五福玲瓏閣的九重封印被你解開，福祿滿堂，阿吉愛死你啦！🐿️👑🌟🎇✨');
      }, 350);
    }
  };

  return (
    <div id="sort-works-game-view" className="w-full max-w-5xl mx-auto px-1 py-4 md:p-6 text-gray-800">
      
      {/* Outer framing envelope */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-emerald-50/40 border-4 border-emerald-100/80 rounded-3xl p-4 md:p-6 shadow-xl relative overflow-hidden backdrop-blur-md">
        
        {/* Left side: branding, squirrel interactions, guidelines */}
        <div className="lg:col-span-4 flex flex-col justify-between space-y-5">
          <div>
            {/* Logo Badge banner */}
            <div className="flex items-center space-x-3 bg-white p-3.5 rounded-2xl border-2 border-emerald-100 shadow-sm">
              <div className="bg-gradient-to-br from-emerald-400 to-teal-600 p-2.5 rounded-xl text-white shadow-md">
                <Sparkles className="w-5.5 h-5.5 animate-pulse" />
              </div>
              <div>
                <h2 className="text-xl font-black text-gray-800 tracking-tight">萌寵五福玲瓏閣</h2>
                <p className="text-xs text-emerald-600 font-mono font-semibold">Lucky Bead Sorter</p>
              </div>
            </div>

            {/* Squirrel chat speech card */}
            <div className="mt-5 bg-white rounded-2xl border-2 border-emerald-100 p-4 relative shadow-sm">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 relative">
                  <div className="w-13 h-13 rounded-full bg-orange-100 border-2 border-orange-200 flex items-center justify-center text-3xl shadow-inner">
                    {mascotMood === 'cheering' && '🐿️'}
                    {mascotMood === 'thinking' && '🧐'}
                    {mascotMood === 'sad' && '🥺'}
                    {mascotMood === 'victory' && '👑'}
                    {mascotMood === 'chatting' && '🐿️'}
                  </div>
                  <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full flex items-center justify-center">
                    <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></span>
                  </span>
                </div>
                <div className="flex-1 bg-emerald-50/40 rounded-xl p-3 border border-emerald-100/50">
                  <div className="text-xs font-bold text-emerald-800 mb-0.5">玲瓏使小禾：</div>
                  <p className="text-gray-700 text-xs leading-relaxed">{mascotSpeech}</p>
                </div>
              </div>
            </div>

            {/* Level difficulty options */}
            <div className="mt-5 bg-white rounded-2xl border-2 border-emerald-100 p-4 shadow-sm">
              <h3 className="text-xs font-bold text-emerald-900 mb-2.5 flex items-center">
                <Layers className="w-4 h-4 mr-1 text-emerald-600" /> 選擇神廚玲瓏難度：
              </h3>
              <div className="grid grid-cols-1 gap-2.5">
                <button
                  id="diff-easy-btn"
                  onClick={() => startGame('easy')}
                  className={`w-full py-2.5 px-3.5 rounded-xl text-left border-2 duration-200 text-xs flex justify-between items-center ${
                    difficulty === 'easy' && gameState !== 'idle'
                      ? 'bg-emerald-500 border-emerald-500 text-white shadow-md font-bold'
                      : 'bg-[#f0fdf4] border-emerald-100 text-[#166534] hover:bg-emerald-100/50'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Star className="w-4 h-4 fill-current text-yellow-400" />
                    <span>小試新歲 🌸 (簡單 - 5筒)</span>
                  </div>
                  <span className="text-[10px] opacity-90">上手速消</span>
                </button>

                <button
                  id="diff-medium-btn"
                  onClick={() => startGame('medium')}
                  className={`w-full py-2.5 px-3.5 rounded-xl text-left border-2 duration-200 text-xs flex justify-between items-center ${
                    difficulty === 'medium' && gameState !== 'idle'
                      ? 'bg-amber-500 border-amber-500 text-white shadow-md font-bold'
                      : 'bg-amber-50/50 border-amber-100 text-amber-800 hover:bg-amber-100/30'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Zap className="w-4 h-4 text-amber-500 fill-current" />
                    <span>玲瓏五行 🍊 (中等 - 6筒)</span>
                  </div>
                  <span className="text-[10px] opacity-90">標準挑戰</span>
                </button>

                <button
                  id="diff-hard-btn"
                  onClick={() => startGame('hard')}
                  className={`w-full py-2.5 px-3.5 rounded-xl text-left border-2 duration-200 text-xs flex justify-between items-center ${
                    difficulty === 'hard' && gameState !== 'idle'
                      ? 'bg-rose-500 border-rose-500 text-white shadow-md font-bold'
                      : 'bg-rose-50/50 border-rose-100 text-rose-800 hover:bg-rose-100/30'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Award className="w-4 h-4 text-rose-300 fill-current" />
                    <span>乾坤圓滿 🌺 (困難 - 7筒)</span>
                  </div>
                  <span className="text-[10px] opacity-90">硬核解密</span>
                </button>
              </div>
            </div>
          </div>

          {/* Quick interactive rule summary */}
          <div className="bg-emerald-50/90 rounded-2xl border border-emerald-100/60 p-3.5 text-xs text-[#14532d] shadow-sm leading-relaxed">
            <div className="font-bold flex items-center text-emerald-900 mb-1">
              <HelpCircle className="w-4 h-4 mr-1 text-emerald-600" /> 五福玲瓏解密小神法：
            </div>
            <p>• 點選裝有玉珠的竹筒，竹筒上方會浮起頂部的仙珠。</p>
            <p>• 點選另一個有 <strong>空位</strong> 的竹筒，且其頂端仙珠 <strong>顏色相同</strong> 即可落入。</p>
            <p>• 所有瓶子均 <strong>完美歸檔 4 顆相同玉珠</strong>（或完全放空）即大功告成！</p>
          </div>
        </div>

        {/* Center column: Playing board with tubes and controllers */}
        <div className="lg:col-span-8 flex flex-col items-center">
          
          {/* Header Score bar */}
          <div className="w-full flex items-center justify-between bg-white px-5 py-3.5 rounded-2xl border-2 border-emerald-100 shadow-sm mb-4">
            <div className="flex items-center space-x-4">
              <div>
                <span className="text-[10px] text-gray-400 block uppercase tracking-wider font-semibold">閣主累積成就分</span>
                <span className="text-xl font-black font-mono text-emerald-600">{score}</span>
              </div>
              <div className="border-l border-emerald-100 h-8"></div>
              <div>
                <span className="text-[10px] text-gray-400 block uppercase tracking-wider font-semibold">最高玲瓏寶錄</span>
                <span className="text-sm font-bold font-mono text-gray-600">{hiScore}</span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setSoundEnabled(prev => !prev)}
                className="p-2.5 rounded-xl bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200 transition-colors"
                title={soundEnabled ? '靜音' : '開啟音效'}
              >
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Main Bamboo sorter screen */}
          <div className="relative w-full aspect-[4/5] sm:aspect-[4/4.2] bg-[#fcfcf9] border-4 border-stone-200 rounded-3xl overflow-hidden shadow-inner flex flex-col justify-between p-6 bg-[radial-gradient(#d1fae5_1.2px,transparent_1.2px)] [background-size:24px_24px]">
            
            {/* Upper deck where the selected hovering bead stays temporarily */}
            <div className="relative w-full h-12 flex justify-around px-2 mb-1">
              {flasks.map(flask => {
                const isSelected = selectedFlaskId === flask.id;
                const topBeadId = flask.beads[flask.beads.length - 1];
                const beadType = BEAD_TYPES[topBeadId];

                return (
                  <div key={`hover-${flask.id}`} className="w-14 flex justify-center items-center">
                    <AnimatePresence>
                      {isSelected && beadType && (
                        <motion.div
                          initial={{ y: 20, scale: 0.1, opacity: 0 }}
                          animate={{ y: 0, scale: 1, opacity: 1 }}
                          exit={{ y: 30, scale: 0.5, opacity: 0 }}
                          transition={{ type: 'spring', stiffness: 400, damping: 18 }}
                          className={`w-11 h-11 rounded-full bg-gradient-to-br ${beadType.color} flex items-center justify-center text-xl shadow-lg ${beadType.glowColor} border-2 border-white`}
                        >
                          <span className="select-none animate-bounce">{beadType.emoji}</span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>

            {/* Bamboo flasks display container */}
            <div className="flex-1 flex justify-around items-end items-stretch w-full mt-2 select-none">
              {flasks.map(flask => {
                const isSelected = selectedFlaskId === flask.id;
                const isComplete = flask.isCompleted;

                return (
                  <motion.div
                    key={`flask-${flask.id}`}
                    id={`flask-container-${flask.id}`}
                    onClick={() => handleFlaskClick(flask.id)}
                    className={`w-[60px] max-w-[64px] rounded-3xl flex flex-col items-center justify-end relative cursor-pointer group transition-all duration-200 select-none ${
                      isSelected
                        ? 'bg-amber-500/10 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                        : isComplete
                        ? 'bg-emerald-500/5 border-emerald-400'
                        : 'bg-emerald-50/30 hover:bg-emerald-50/70'
                    }`}
                    style={{
                      height: '240px',
                    }}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    
                    {/* Glowing completion sparkles ring overlay */}
                    {isComplete && (
                      <div className="absolute -top-3 inset-x-0 flex justify-center text-teal-500 animate-pulse z-20">
                        <CheckCircle2 className="w-6 h-6 fill-white" />
                      </div>
                    )}

                    {/* Outer tube borders representing elegant dark-green bamboo sections */}
                    <div className={`absolute inset-0 rounded-3xl border-4 pointer-events-none z-10 ${
                      isSelected 
                        ? 'border-amber-400 border-b-8' 
                        : isComplete
                        ? 'border-emerald-500 border-b-8 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                        : 'border-slate-300 border-b-8'
                    }`}>
                      {/* Visual bamboo dividing ridge */}
                      <div className={`absolute left-0 right-0 h-1 top-1/2 opacity-35 ${isSelected ? 'bg-amber-400' : isComplete ? 'bg-emerald-400' : 'bg-slate-400'}`}></div>
                    </div>

                    {/* Stacked beads inside the container */}
                    <div className="flex flex-col-reverse justify-start items-center space-y-reverse space-y-1.5 w-full pb-3.5 z-0 select-none">
                      {flask.beads.map((beadId, bIdx) => {
                        const beadType = BEAD_TYPES[beadId];
                        // If selected, we hide the actual top-most bead on the list because it's hovering above in the upper dock!
                        const isTop = bIdx === flask.beads.length - 1;
                        if (isTop && isSelected) return null;

                        return (
                          <motion.div
                            key={`bead-${flask.id}-${bIdx}`}
                            layoutId={`bead-motion-${flask.id}-${bIdx}-${beadId}`}
                            initial={{ y: -50, scale: 0.4 }}
                            animate={{ y: 0, scale: 1 }}
                            exit={{ scale: 0.1, opacity: 0 }}
                            transition={{ type: 'spring', stiffness: 350, damping: 22 }}
                            className={`w-11 h-11 rounded-full bg-gradient-to-br ${beadType.color} flex items-center justify-center text-xl shadow-md ${beadType.glowColor} border-2 border-white select-none`}
                          >
                            <span className="select-none text-base">{beadType.emoji}</span>
                          </motion.div>
                        );
                      })}

                      {/* Ghost guidelines fill icons when completely empty tube */}
                      {flask.beads.length === 0 && (
                        <div className="w-11 h-11 rounded-full border-2 border-dashed border-slate-200 flex items-center justify-center opacity-30 select-none">
                          <span className="text-[9px] font-sans font-bold">空</span>
                        </div>
                      )}
                    </div>

                    {/* Bamboo heavy ceramic custom foot stand base design */}
                    <div className="absolute -bottom-2 w-full h-2.5 rounded-full bg-amber-900/30 border-t border-white pointer-events-none"></div>
                  </motion.div>
                );
              })}
            </div>

            {/* Overlapping game status templates */}
            <AnimatePresence>
              {gameState === 'idle' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-x-5 top-14 bottom-14 bg-white/95 rounded-2xl flex flex-col items-center justify-center p-6 text-center z-40 shadow-xl border-2 border-emerald-100"
                >
                  <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center text-4xl mb-4 shadow-md animate-bounce">
                    🐿️🏮
                  </div>
                  <h3 className="text-2xl font-black text-emerald-800 mb-2">萌寵五福玲瓏閣</h3>
                  <p className="text-xs text-slate-500 max-w-sm mb-6 leading-relaxed">
                    閣內玲瓏五行玉珠雜亂堆放，快展現你的調配才智！將散落的珠子完整歸類，啟動大吉利！由招財大尾紅panda「小禾」為你常駐祥兆。
                  </p>
                  <div className="flex flex-col sm:flex-row space-y-2.5 sm:space-y-0 sm:space-x-3 w-full justify-center">
                    <button
                      onClick={() => startGame('easy')}
                      className="py-2.5 px-6 bg-emerald-500 hover:bg-emerald-600 font-bold text-white rounded-xl text-xs flex items-center justify-center space-x-1 duration-200"
                    >
                      <span>初試玲瓏 (EASY)</span>
                    </button>
                    <button
                      id="default-start-btn"
                      onClick={() => startGame('medium')}
                      className="py-2.5 px-6 bg-amber-500 hover:bg-amber-600 font-bold text-white rounded-xl text-xs flex items-center justify-center space-x-1 duration-200 shadow-md scale-100 active:scale-95"
                    >
                      <Play className="w-4 h-4 fill-current" />
                      <span>啟動大福運挑戰</span>
                    </button>
                  </div>
                </motion.div>
              )}

              {gameState === 'victory' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-x-5 top-14 bottom-14 bg-white/95 rounded-2xl flex flex-col items-center justify-center p-6 text-center z-40 shadow-xl border-2 border-yellow-200"
                >
                  <div className="w-18 h-18 bg-yellow-50 text-yellow-500 rounded-full flex items-center justify-center text-4xl mb-3 shadow-md animate-bounce">
                    👑
                  </div>
                  <h3 className="text-2xl font-black text-amber-800 mb-1">五鳳齊鳴！五福臨門</h3>
                  <div className="text-emerald-600 font-mono text-sm font-black mb-4">
                    大福運終極挑戰積分: {score} 點
                  </div>
                  <p className="text-xs text-gray-500 max-w-sm mb-6 leading-relaxed">
                    小禾捧著沉甸甸的玉盤對你歡快大喝！閣中雜亂的珠子被你順利消釋，天降福至，前程錦繡，萬事平安！
                  </p>
                  <div className="flex space-x-3 w-full max-w-xs justify-center">
                    <button
                      id="victory-retry-btn"
                      onClick={() => startGame(difficulty)}
                      className="py-2.5 px-6 bg-emerald-500 hover:bg-emerald-600 font-bold text-white rounded-xl shadow-md flex items-center justify-center space-x-1 duration-200 text-xs flex-1"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>再展神功一局</span>
                    </button>
                    <button
                      onClick={() => {
                        playSfx('click');
                        setGameState('idle');
                      }}
                      className="py-2.5 px-6 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl border duration-200 text-xs flex-1"
                    >
                      返回主堂
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Boosting utility row */}
          <div className="w-full max-w-[440px] grid grid-cols-3 gap-3.5 mt-5">
            <button
              id="booster-undo"
              onClick={triggerUndo}
              disabled={gameState !== 'playing' || undoCount <= 0 || undoHistory.length === 0}
              className={`py-2.5 rounded-2xl flex flex-col items-center justify-center border-2 bg-white transition-all duration-200 text-xs ${
                undoCount > 0 && undoHistory.length > 0 
                  ? 'border-emerald-200 text-emerald-600 hover:bg-emerald-50 active:scale-95 shadow-sm font-bold' 
                  : 'opacity-40 cursor-not-allowed border-gray-100 text-gray-400 font-normal'
              }`}
            >
              <Undo className="w-4.5 h-4.5 mb-1" />
              <div>時光回退 (撤銷)</div>
              <span className="text-[9px] font-mono mt-0.5 bg-emerald-100 text-emerald-700 px-1.5 py-0.2 rounded-full">
                剩 {undoCount} 
              </span>
            </button>

            <button
              id="booster-add-tube"
              onClick={triggerAddFlask}
              disabled={gameState !== 'playing' || extraFlaskAdded}
              className={`py-2.5 rounded-2xl flex flex-col items-center justify-center border-2 bg-white transition-all duration-200 text-xs ${
                extraFlaskAdded 
                  ? 'opacity-40 cursor-not-allowed border-gray-100 text-gray-400 font-normal' 
                  : 'border-amber-200 text-amber-700 hover:bg-amber-50 active:scale-95 shadow-sm font-bold'
              }`}
            >
              <PlusCircle className="w-4.5 h-4.5 mb-1" />
              <div>召引神罐 (加筒)</div>
              <span className="text-[9px] font-mono mt-0.5 bg-amber-100 text-amber-700 px-1.5 py-0.2 rounded-full">
                {extraFlaskAdded ? '已使用' : '神力 +1'}
              </span>
            </button>

            <button
              id="booster-restart"
              onClick={triggerRestart}
              disabled={gameState !== 'playing'}
              className={`py-2.5 rounded-2xl flex flex-col items-center justify-center border-2 bg-white transition-all duration-200 text-xs ${
                gameState === 'playing'
                  ? 'border-gray-300 text-gray-700 hover:bg-gray-50 active:scale-95 shadow-sm font-bold'
                  : 'opacity-40 cursor-not-allowed border-gray-100 text-gray-400 font-normal'
              }`}
            >
              <RefreshCw className="w-4.5 h-4.5 mb-0.5 animate-spin-slow" />
              <div className="mt-0.5">重排乾坤 (重置)</div>
              <span className="text-[9px] opacity-70 font-sans mt-0.5 px-1 rounded-full">
                無限制
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
