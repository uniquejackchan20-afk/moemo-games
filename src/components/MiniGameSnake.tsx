/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { Play, RotateCcw, Volume2, VolumeX, Sparkles, Trophy, Flame, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, HelpCircle } from 'lucide-react';

// Direction constants
type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
interface Point {
  x: number;
  y: number;
}

interface Skin {
  id: string;
  name: string;
  headEmoji: string;
  bodyChar: string;
  bodyColorClass: string;
  accentColorClass: string;
  unlockedScore: number;
}

const SKINS: Skin[] = [
  { id: 'cute-green', name: '森林萌綠蛇', headEmoji: '🐱', bodyChar: '🟢', bodyColorClass: 'bg-emerald-400', accentColorClass: 'bg-emerald-100 text-emerald-800', unlockedScore: 0 },
  { id: 'pink-blossom', name: '櫻花軟粉蛇', headEmoji: '🐹', bodyChar: '🌸', bodyColorClass: 'bg-rose-400', accentColorClass: 'bg-rose-100 text-rose-800', unlockedScore: 100 },
  { id: 'golden-emperor', name: '黃金極道皇', headEmoji: '👑', bodyChar: '✨', bodyColorClass: 'bg-amber-400 animate-pulse', accentColorClass: 'bg-amber-100 text-amber-800 border border-amber-300', unlockedScore: 300 },
  { id: 'cosmic-star', name: '幻影幽靈', headEmoji: '👻', bodyChar: '💜', bodyColorClass: 'bg-indigo-400', accentColorClass: 'bg-indigo-100 text-indigo-800', unlockedScore: 500 }
];

interface Food {
  point: Point;
  emoji: string;
  points: number;
  type: 'strawberry' | 'peach' | 'grape' | 'star';
  effectText?: string;
}

const FOOD_TYPES: Omit<Food, 'point'>[] = [
  { emoji: '🍓', points: 10, type: 'strawberry' },
  { emoji: '🍑', points: 25, type: 'peach', effectText: '飽嗝~ +25!' },
  { emoji: '🍇', points: 15, type: 'grape', effectText: '敏捷! +15' },
  { emoji: '🌟', points: 50, type: 'star', effectText: '絕頂幸運! +50' }
];

const GRID_SIZE = 16;
const DEFAULT_SPEED = 180; // ms

export default function MiniGameSnake() {
  // Game state variables
  const [snake, setSnake] = useState<Point[]>([
    { x: 8, y: 8 },
    { x: 8, y: 9 },
    { x: 8, y: 10 }
  ]);
  const [direction, setDirection] = useState<Direction>('UP');
  const [nextDirection, setNextDirection] = useState<Direction>('UP');
  
  const [food, setFood] = useState<Food>({ point: { x: 8, y: 4 }, emoji: '🍓', points: 10, type: 'strawberry' });
  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(() => {
    try {
      return Number(localStorage.getItem('snake_high_score')) || 120;
    } catch {
      return 120;
    }
  });

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(DEFAULT_SPEED);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [selectedSkinId, setSelectedSkinId] = useState<string>('cute-green');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [lastNotification, setLastNotification] = useState<string>('');
  const [totalEatenCount, setTotalEatenCount] = useState<number>(0);

  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);

  // Play retro Beep synthesize effects using Web Audio API safely
  const playSynthesizer = useCallback((type: 'eat' | 'crash' | 'click' | 'powerup') => {
    if (!soundEnabled) return;
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'eat') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(320, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(640, ctx.currentTime + 0.12);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);
        osc.start();
        osc.stop(ctx.currentTime + 0.12);
      } else if (type === 'click') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        gain.gain.setValueAtTime(0.06, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
        osc.start();
        osc.stop(ctx.currentTime + 0.05);
      } else if (type === 'powerup') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(350, ctx.currentTime);
        osc.frequency.setValueAtTime(530, ctx.currentTime + 0.08);
        osc.frequency.setValueAtTime(700, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
        osc.start();
        osc.stop(ctx.currentTime + 0.25);
      } else if (type === 'crash') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(180, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.4);
        gain.gain.setValueAtTime(0.18, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      }
    } catch {
      // Browsers block audio before interaction
    }
  }, [soundEnabled]);

  // Generate a random food point that is not occupied by the snake
  const generateNewFood = useCallback((currentSnake: Point[]): Food => {
    let attempts = 0;
    while (attempts < 200) {
      const x = Math.floor(Math.random() * GRID_SIZE);
      const y = Math.floor(Math.random() * GRID_SIZE);
      
      const onSnake = currentSnake.some(seg => seg.x === x && seg.y === y);
      if (!onSnake) {
        // Randomly pick a food template
        const roll = Math.random();
        let foodTemplate = FOOD_TYPES[0]; // defaults strawberry
        
        if (roll > 0.90) {
          foodTemplate = FOOD_TYPES[3]; // Star 🌟 (10% chance)
        } else if (roll > 0.75) {
          foodTemplate = FOOD_TYPES[1]; // Peach 🍑 (15% chance)
        } else if (roll > 0.55) {
          foodTemplate = FOOD_TYPES[2]; // Grape 🍇 (20% chance)
        }

        return {
          point: { x, y },
          ...foodTemplate
        };
      }
      attempts++;
    }
    // Fallback placement
    return { point: { x: 3, y: 3 }, ...FOOD_TYPES[0] };
  }, []);

  // Set Speed based on Difficulty and Snake length
  const getSpeedDelay = useCallback((scoreVal: number, selectedDifficulty: 'easy' | 'medium' | 'hard') => {
    let baseDelay = 220;
    if (selectedDifficulty === 'easy') baseDelay = 240;
    else if (selectedDifficulty === 'hard') baseDelay = 130;
    else baseDelay = 180;

    // Soft speed boost as snake grows longer
    const acceleration = Math.max(30, Math.floor(scoreVal / 70) * 12);
    return Math.max(60, baseDelay - acceleration);
  }, []);

  // Starts or Resets the game
  const handleStartGame = () => {
    playSynthesizer('powerup');
    setSnake([
      { x: 8, y: 8 },
      { x: 8, y: 9 },
      { x: 8, y: 10 }
    ]);
    setDirection('UP');
    setNextDirection('UP');
    setScore(0);
    setTotalEatenCount(0);
    setLastNotification('');
    setIsGameOver(false);
    setIsPlaying(true);
  };

  const handlePauseOrResume = () => {
    playSynthesizer('click');
    setIsPlaying(prev => !prev);
  };

  // Safe direction change updater
  const updateDirection = useCallback((newDir: Direction) => {
    setNextDirection(prev => {
      if (newDir === 'UP' && direction === 'DOWN') return prev;
      if (newDir === 'DOWN' && direction === 'UP') return prev;
      if (newDir === 'LEFT' && direction === 'RIGHT') return prev;
      if (newDir === 'RIGHT' && direction === 'LEFT') return prev;
      return newDir;
    });
  }, [direction]);

  // Handle keypresses for keyboards
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isGameOver) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleStartGame();
        }
        return;
      }

      if (!isPlaying) {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          setIsPlaying(true);
        }
        return;
      }

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          e.preventDefault();
          updateDirection('UP');
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          e.preventDefault();
          updateDirection('DOWN');
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          e.preventDefault();
          updateDirection('LEFT');
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault();
          updateDirection('RIGHT');
          break;
        case 'p':
        case 'P':
          e.preventDefault();
          handlePauseOrResume();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, isGameOver, updateDirection]);

  // Core movement loop
  useEffect(() => {
    if (!isPlaying || isGameOver) {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
      return;
    }

    const gameTick = () => {
      setSnake(prevSnake => {
        const head = prevSnake[0];
        const currentDir = nextDirection;
        setDirection(currentDir); // Sync visual state

        let newHead: Point = { ...head };

        switch (currentDir) {
          case 'UP': newHead.y -= 1; break;
          case 'DOWN': newHead.y += 1; break;
          case 'LEFT': newHead.x -= 1; break;
          case 'RIGHT': newHead.x += 1; break;
        }

        // Check Wall Collisions (Wrap around for warm cozy feeling, or Die!)
        // In our cute 療癒 style, wrapping around borders is way more playful and friendly than instant death,
        // but to make it a competitive "King of Snake" we will implement high-tension border bounds,
        // or let Wrap be a feature. Let's make it typical border wrap, but hitting itself is fatal!
        // This makes the game incredibly satisfying and relaxing yet challenging!
        if (newHead.x < 0) newHead.x = GRID_SIZE - 1;
        if (newHead.x >= GRID_SIZE) newHead.x = 0;
        if (newHead.y < 0) newHead.y = GRID_SIZE - 1;
        if (newHead.y >= GRID_SIZE) newHead.y = 0;

        // Check self crash (fatal!) - skip checking the absolute tail since it moves away
        const hasCrashed = prevSnake.slice(0, -1).some(seg => seg.x === newHead.x && seg.y === newHead.y);
        
        if (hasCrashed) {
          playSynthesizer('crash');
          setIsGameOver(true);
          setIsPlaying(false);
          
          // Store high score
          setHighScore(oldHigh => {
            const finalScore = score;
            const updated = finalScore > oldHigh ? finalScore : oldHigh;
            try {
              localStorage.setItem('snake_high_score', String(updated));
            } catch {}
            return updated;
          });

          return prevSnake;
        }

        const nextSnake = [newHead, ...prevSnake];

        // Check if head landed on food
        if (newHead.x === food.point.x && newHead.y === food.point.y) {
          // Eat!
          playSynthesizer('eat');
          const newScore = score + food.points;
          setScore(newScore);
          setTotalEatenCount(prev => prev + 1);

          // Update text notice
          if (food.effectText) {
            setLastNotification(food.effectText);
            setTimeout(() => setLastNotification(''), 1500);
          } else {
            setLastNotification('好吃! +10');
            setTimeout(() => setLastNotification(''), 1100);
          }

          // Generate next food
          setFood(generateNewFood(nextSnake));
          
          // Re-evaluate current game cycle speed based on score
          setSpeed(getSpeedDelay(newScore, difficulty));
        } else {
          // Remove tail if didn't eat
          nextSnake.pop();
        }

        return nextSnake;
      });
    };

    gameLoopRef.current = setInterval(gameTick, speed);

    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    };
  }, [isPlaying, isGameOver, food, nextDirection, speed, score, difficulty, playSynthesizer, generateNewFood, getSpeedDelay]);

  // Difficulty Selector handler
  const handleDifficultyChange = (level: 'easy' | 'medium' | 'hard') => {
    playSynthesizer('click');
    setDifficulty(level);
    setSpeed(getSpeedDelay(score, level));
  };

  const activeSkin = SKINS.find(s => s.id === selectedSkinId) || SKINS[0];

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-6 space-y-6 select-none bg-emerald-50/20 rounded-3xl border border-emerald-100/50 shadow-sm">
      
      {/* Decorative Game Banner info */}
      <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-4 rounded-2xl border border-emerald-100 shadow-sm gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-100 text-primary rounded-xl flex items-center justify-center font-bold text-xl shadow-inner">
            🐍
          </div>
          <div className="text-left">
            <h3 className="font-sans font-bold text-xs text-gray-800 flex items-center gap-1.5">
              <span>貪食蛇之王 (King of Snake)</span>
              <span className="bg-amber-100 text-amber-800 text-[9px] font-extrabold px-1.5 py-0.5 rounded-full border border-amber-200">
                Cozy v1.2
              </span>
            </h3>
            <p className="text-[10px] text-gray-400 font-sans font-medium mt-0.5">
              控制軟萌蛇身吞噬水果！體驗最療癒、清脆、無負擔的益智樂趣。
            </p>
          </div>
        </div>

        {/* Top Indicators */}
        <div className="flex gap-4 items-center">
          <div className="flex items-center gap-1 text-[11px] font-bold text-[#1b6b4f] bg-[#a7f3d0]/30 px-3 py-1 rounded-full border border-teal-100">
            <Trophy className="w-3.5 h-3.5 text-amber-500 fill-amber-500 animate-pulse" />
            <span>神級高分:</span>
            <span className="font-mono text-sm">{highScore}</span>
          </div>

          <button
            onClick={() => {
              setSoundEnabled(!soundEnabled);
              playSynthesizer('click');
            }}
            className={`p-1.5 rounded-full border transition-colors ${soundEnabled ? 'bg-emerald-50 border-emerald-100 text-[#1b6b4f]' : 'bg-stone-50 border-stone-100 text-stone-400'}`}
            title={soundEnabled ? "音效開" : "音效關"}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Playfield Area LEFT Column */}
        <div className="md:col-span-8 flex flex-col items-center space-y-4">
          
          {/* Dashboard Panel Scoreboard */}
          <div className="w-full flex justify-between items-center bg-white border border-stone-100 px-5 py-3 rounded-2xl shadow-sm">
            <div className="flex items-center gap-3">
              <div className="text-left">
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block">當前所得分</span>
                <span className="text-2xl font-mono font-bold text-emerald-600 block leading-tight">{score}</span>
              </div>
              
              {/* Score alert text */}
              {lastNotification && (
                <span className="bg-rose-100 text-rose-700 text-[10px] font-bold px-2 py-0.5 rounded-lg animate-bounce border border-rose-200 shrink-0">
                  {lastNotification}
                </span>
              )}
            </div>

            <div className="flex gap-2">
              <div className="text-right bg-stone-50 rounded-xl px-3 py-1 border border-stone-100 shrink-0">
                <span className="text-[9px] font-bold text-gray-400 block">吞噬水果</span>
                <span className="text-xs font-mono font-bold text-gray-600 block">{totalEatenCount} 個</span>
              </div>
              <div className="text-right bg-stone-50 rounded-xl px-3 py-1 border border-stone-100 shrink-0">
                <span className="text-[9px] font-bold text-gray-400 block">速度延遲</span>
                <span className="text-xs font-mono font-bold text-gray-600 block">{speed}ms</span>
              </div>
            </div>
          </div>

          {/* Grid Area Box */}
          <div 
            className="relative w-full aspect-square max-w-[360px] bg-[#eefbf4] rounded-2xl overflow-hidden border-4 border-emerald-500/20 shadow-md grid select-none"
            style={{
              gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))`,
              gridTemplateRows: `repeat(${GRID_SIZE}, minmax(0, 1fr))`
            }}
          >
            {/* Background grass grids */}
            {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => {
              const x = i % GRID_SIZE;
              const y = Math.floor(i / GRID_SIZE);
              const isEven = (x + y) % 2 === 0;
              return (
                <div 
                  key={i} 
                  className={`w-full h-full transition-colors duration-300 ${isEven ? 'bg-[#f4fdf8]' : 'bg-[#edfcf2]'}`}
                />
              );
            })}

            {/* Render Food Item */}
            <div
              className="absolute flex items-center justify-center text-lg sm:text-xl transform scale-102 animate-bounce z-10"
              style={{
                width: `${100 / GRID_SIZE}%`,
                height: `${100 / GRID_SIZE}%`,
                left: `${(food.point.x / GRID_SIZE) * 100}%`,
                top: `${(food.point.y / GRID_SIZE) * 100}%`,
                transition: 'all 0.1s ease-out'
              }}
            >
              <span className="drop-shadow-sm">{food.emoji}</span>
            </div>

            {/* Render Snake parts */}
            {snake.map((segment, index) => {
              const isHead = index === 0;
              // Fade color along body
              const opacityPercent = Math.max(0.4, 1 - index / snake.length);

              return (
                <div
                  key={index}
                  className={`absolute flex items-center justify-center p-[1px] z-20 transition-all`}
                  style={{
                    width: `${100 / GRID_SIZE}%`,
                    height: `${100 / GRID_SIZE}%`,
                    left: `${(segment.x / GRID_SIZE) * 100}%`,
                    top: `${(segment.y / GRID_SIZE) * 100}%`,
                    transition: isPlaying ? `left ${speed / 1000}s linear, top ${speed / 1000}s linear` : 'none'
                  }}
                >
                  {isHead ? (
                    <div className="w-full h-full bg-white border border-[#1b6b4f]/20 rounded-full flex items-center justify-center shadow text-xs sm:text-sm scale-110 relative outline outline-2 outline-emerald-300 z-30">
                      <span>{activeSkin.headEmoji}</span>
                    </div>
                  ) : (
                    <div 
                      className={`w-full h-full rounded-full flex items-center justify-center text-[10px] transform hover:scale-105 shadow-inner ${activeSkin.bodyColorClass}`}
                      style={{ 
                        opacity: opacityPercent,
                        transform: `scale(${0.98 - (index * 0.015)})`
                      }}
                    >
                      <span className="scale-75 text-[8px] sm:text-[9px] drop-shadow">{activeSkin.bodyChar}</span>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Pause overlay screen */}
            {!isPlaying && !isGameOver && (
              <div className="absolute inset-0 bg-[#34493e]/40 backdrop-blur-[1px] flex flex-col items-center justify-center space-y-3 z-30 animate-in fade-in duration-200">
                <div className="bg-white px-5 py-4 rounded-3xl text-center space-y-2.5 shadow-xl max-w-[200px]">
                  <p className="text-xs font-bold text-[#1b6b4f] flex items-center justify-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    悠閒暫停中
                  </p>
                  <p className="text-[10px] text-gray-400 font-medium">點按下方按鍵或空格鍵繼續冒險！</p>
                  <button
                    onClick={handlePauseOrResume}
                    className="w-full bg-primary hover:bg-emerald-700 text-white font-bold py-1.5 rounded-full text-[10px] border-b-2 border-emerald-950 flex items-center justify-center gap-1 transition-transform"
                  >
                    <Play className="w-3 h-3 fill-white" />
                    繼續遊玩
                  </button>
                </div>
              </div>
            )}

            {/* Game Over Screen */}
            {isGameOver && (
              <div className="absolute inset-0 bg-rose-950/50 backdrop-blur-[2px] flex flex-col items-center justify-center space-y-4 z-40 animate-in zoom-in-95 duration-200">
                <div className="bg-white p-6 rounded-3xl text-center space-y-3.5 shadow-xl border-t-4 border-rose-500 max-w-[240px]">
                  <span className="text-4xl block">🤕</span>
                  <div>
                    <h4 className="font-sans font-bold text-xs text-rose-950">哎呀！小蛇頭暈了</h4>
                    <p className="text-[10px] text-zinc-400 mt-1 leading-relaxed font-sans font-medium">
                      不小心撞到自己了。
                      您可以重新挑戰，超越自己的極限！
                    </p>
                  </div>

                  <div className="bg-pink-50 rounded-xl px-4 py-2 border border-pink-100 flex justify-between items-center text-xs">
                    <span className="font-bold text-[#765469]">最終分數:</span>
                    <span className="font-mono text-sm font-extrabold text-rose-600">{score}分</span>
                  </div>

                  <button
                    onClick={handleStartGame}
                    className="marshmallow-button w-full bg-primary text-white hover:bg-emerald-700 font-bold py-2 rounded-full text-xs flex items-center justify-center gap-1"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    重新啟航 ➔
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* D-Pad Buttons Controller for tablet / mobile devices */}
          <div className="w-full max-w-[200px] flex flex-col items-center gap-2 select-none border border-emerald-100 bg-[#edfcf2]/40 rounded-3xl p-3 md:hidden">
            <button
              onClick={() => updateDirection('UP')}
              className="w-12 h-10 aspect-video bg-white hover:bg-emerald-100/70 border-b-2 border-gray-100 text-[#1b6b4f] rounded-xl flex items-center justify-center active:bg-emerald-250 active:scale-95 transition-all shadow-sm"
              title="向上"
            >
              <ChevronUp className="w-6 h-6" />
            </button>
            <div className="flex gap-4">
              <button
                onClick={() => updateDirection('LEFT')}
                className="w-12 h-10 bg-white hover:bg-emerald-100/70 border-b-2 border-gray-100 text-[#1b6b4f] rounded-xl flex items-center justify-center active:bg-emerald-250 active:scale-95 transition-all shadow-sm"
                title="向左"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <div className="w-12 h-10 flex items-center justify-center text-xs font-bold text-gray-300">
                ⭐
              </div>
              <button
                onClick={() => updateDirection('RIGHT')}
                className="w-12 h-10 bg-white hover:bg-emerald-100/70 border-b-2 border-gray-100 text-[#1b6b4f] rounded-xl flex items-center justify-center active:bg-emerald-250 active:scale-95 transition-all shadow-sm"
                title="向右"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
            <button
              onClick={() => updateDirection('DOWN')}
              className="w-12 h-10 bg-white hover:bg-emerald-100/70 border-b-2 border-gray-100 text-[#1b6b4f] rounded-xl flex items-center justify-center active:bg-emerald-250 active:scale-95 transition-all shadow-sm"
              title="向下"
            >
              <ChevronDown className="w-6 h-6" />
            </button>
          </div>

        </div>

        {/* Options and Upgrades RIGHT Column */}
        <div className="md:col-span-4 space-y-4 text-left">
          
          {/* Game controls button play/pause/reset */}
          <div className="bg-white p-4 rounded-2xl border border-stone-100 shadow-sm space-y-3">
            <span className="block text-[9px] font-bold text-gray-400 uppercase tracking-widest border-b pb-1">操控面板</span>
            <div className="flex flex-col gap-2.5">
              {!isGameOver && (
                <button
                  onClick={handlePauseOrResume}
                  className="marshmallow-button w-full bg-[#765469]/10 hover:bg-[#765469]/20 text-secondary font-bold py-2 rounded-full text-xs flex items-center justify-center gap-1.5"
                >
                  <Play className="w-3.5 h-3.5 fill-secondary" />
                  <span>{isPlaying ? '暫停冒險' : '繼續前行'}</span>
                </button>
              )}

              <button
                onClick={handleStartGame}
                className="marshmallow-button w-full bg-primary text-white hover:bg-emerald-700 font-bold py-2.5 rounded-full text-xs flex items-center justify-center gap-1 border-b-4 border-emerald-950"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{isGameOver ? '重新啟航' : '重新開始'}</span>
              </button>
            </div>
          </div>

          {/* Difficulty Tuning Settings */}
          <div className="bg-white p-4 rounded-2xl border border-stone-100 shadow-sm space-y-3">
            <span className="block text-[9px] font-bold text-gray-400 uppercase tracking-widest border-b pb-1">速度難度</span>
            <div className="grid grid-cols-3 gap-1 px-0.5">
              {(['easy', 'medium', 'hard'] as const).map(level => {
                const label = level === 'easy' ? '悠閒 🐢' : level === 'medium' ? '活力 🦊' : '神速 ⚡';
                const isActive = difficulty === level;
                return (
                  <button
                    key={level}
                    onClick={() => handleDifficultyChange(level)}
                    className={`py-1.5 rounded-xl text-[10px] font-bold text-center border transition-all ${
                      isActive 
                        ? 'bg-primary border-[#1b6b4f] text-white shadow-inner font-black' 
                        : 'bg-stone-50 hover:bg-stone-100 text-gray-500 border-stone-150'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Skin Shop & Rewards Unlocks */}
          <div className="bg-white p-4 rounded-2xl border border-stone-100 shadow-sm space-y-3">
            <span className="block text-[9px] font-bold text-gray-400 uppercase tracking-widest border-b pb-1">小蛇外觀面板</span>
            <div className="flex flex-col gap-2">
              {SKINS.map(skin => {
                const isLocked = highScore < skin.unlockedScore;
                const isSelected = skin.id === selectedSkinId;

                return (
                  <button
                    key={skin.id}
                    disabled={isLocked}
                    onClick={() => {
                      playSynthesizer('click');
                      setSelectedSkinId(skin.id);
                    }}
                    className={`w-full flex justify-between items-center px-3 py-2 rounded-xl text-left border text-xs font-medium transition-all ${
                      isLocked 
                        ? 'bg-stone-50 border-stone-100 cursor-not-allowed opacity-60' 
                        : isSelected 
                          ? 'bg-[#a7f3d0]/40 border-[#10b981]/50 text-[#1b6b4f] font-bold ring-1 ring-emerald-300' 
                          : 'bg-white hover:bg-stone-50 border-stone-200 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm bg-white border border-stone-100 rounded-lg p-1 w-7 h-7 flex items-center justify-center">
                        {skin.headEmoji}
                      </span>
                      <div>
                        <p className="font-bold text-[11px] leading-snug">{skin.name}</p>
                        <p className="text-[9px] text-gray-400">身體: {skin.bodyChar} 風采</p>
                      </div>
                    </div>
                    
                    {isLocked ? (
                      <span className="text-[8px] bg-stone-200 text-stone-600 px-1.5 py-0.5 rounded-md font-mono">
                        🔒 High: {skin.unlockedScore}
                      </span>
                    ) : (
                      <span className={`text-[8px] px-1.5 py-0.5 rounded-md font-bold ${skin.accentColorClass}`}>
                        {isSelected ? '出戰中' : '可裝備'}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Fruit types details and specs chart */}
          <div className="bg-stone-50 p-3.5 rounded-2xl border border-stone-100 space-y-2.5">
            <span className="block text-[9px] font-bold text-[#1b6b4f] uppercase tracking-widest">
              🍯 森林果物對照表
            </span>
            <div className="grid grid-cols-2 gap-2 text-[10px] text-gray-500 font-medium leading-relaxed font-sans">
              <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-gray-50">
                <span className="text-sm">🍓</span>
                <span>草莓: <strong>+10分</strong></span>
              </div>
              <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-gray-50">
                <span className="text-sm">🍑</span>
                <span>蜜桃: <strong>+25分</strong></span>
              </div>
              <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-gray-50">
                <span className="text-sm">🍇</span>
                <span>葡萄: <strong>+15分</strong></span>
              </div>
              <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-gray-50">
                <span className="text-sm">🌟</span>
                <span>星星: <strong>+50分</strong></span>
              </div>
            </div>
            <div className="pt-1 select-none flex items-start gap-1 text-[9px] text-gray-400">
              <HelpCircle className="w-3 h-3 text-emerald-600 shrink-0 mt-0.5" />
              <p>使用 W, A, S, D 或方向鍵改變小蛇移動方向。按空白鍵或 P 鍵可切換暫停狀態。</p>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
