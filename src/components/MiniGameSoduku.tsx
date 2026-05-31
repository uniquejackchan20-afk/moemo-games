/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, RotateCcw, Volume2, VolumeX, Sparkles, Trophy, Heart, Edit3, Trash2, HelpCircle, Check, Compass } from 'lucide-react';

interface GameCell {
  row: number;
  col: number;
  value: number;       // 0 for blank
  correctValue: number; // The target solved value
  isInitial: boolean;   // If it was preset from grid generation
  notes: Set<number>;   // Pencil notes
  isError: boolean;     // Highlight if auto-error checking is active
}

// Animal Mascot Emotes
type MascotMood = 'idle' | 'happy' | 'thinking' | 'victory' | 'sad';

const MASCOTS = [
  { id: 'squirrel', name: '小松鼠米奧 🐿️', description: '最喜歡香脆橡實，最愛九宮格數字魔法' },
  { id: 'panda', name: '大熊貓嘟嘟 🐼', description: '性格溫和，咬著甜竹子陪伴您算算數' }
];

export default function MiniGameSoduku() {
  const [board, setBoard] = useState<GameCell[][]>([]);
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  
  // Game mode properties
  const [isPencilActive, setIsPencilActive] = useState<boolean>(false);
  const [isCozyMode, setIsCozyMode] = useState<boolean>(false); // No penalty if true
  const [mistakes, setMistakes] = useState<number>(0);
  const [maxMistakes] = useState<number>(3);
  const [hintsLeft, setHintsLeft] = useState<number>(3);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [mascot, setMascot] = useState<string>('squirrel');
  const [mascotMood, setMascotMood] = useState<MascotMood>('idle');
  
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [isGameWon, setIsGameWon] = useState<boolean>(false);
  const [timer, setTimer] = useState<number>(0);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Play retro synthesizers using Web Audio API safely
  const playSfx = useCallback((type: 'place' | 'pencil' | 'erase' | 'error' | 'win' | 'hint' | 'click' | 'powerup') => {
    if (!soundEnabled) return;
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'place') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
        osc.start();
        osc.stop(ctx.currentTime + 0.1);
      } else if (type === 'pencil') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        gain.gain.setValueAtTime(0.03, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
        osc.start();
        osc.stop(ctx.currentTime + 0.05);
      } else if (type === 'erase') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, ctx.currentTime);
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
        osc.start();
        osc.stop(ctx.currentTime + 0.08);
      } else if (type === 'error') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(100, ctx.currentTime + 0.25);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
        osc.start();
        osc.stop(ctx.currentTime + 0.25);
      } else if (type === 'win') {
        osc.type = 'sine';
        const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50];
        notes.forEach((freq, idx) => {
          const oscNode = ctx.createOscillator();
          const gainNode = ctx.createGain();
          oscNode.connect(gainNode);
          gainNode.connect(ctx.destination);
          oscNode.type = 'sine';
          oscNode.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);
          gainNode.gain.setValueAtTime(0.1, ctx.currentTime + idx * 0.08);
          gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + idx * 0.08 + 0.3);
          oscNode.start(ctx.currentTime + idx * 0.08);
          oscNode.stop(ctx.currentTime + idx * 0.08 + 0.35);
        });
      } else if (type === 'hint') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, ctx.currentTime);
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.08);
        osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.16);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      } else if (type === 'click') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(330, ctx.currentTime);
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
        osc.start();
        osc.stop(ctx.currentTime + 0.05);
      } else if (type === 'powerup') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(392.00, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(523.25, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
        osc.start();
        osc.stop(ctx.currentTime + 0.2);
      }
    } catch {
      // Audio context blocking bypass
    }
  }, [soundEnabled]);

  // Safe Mood Reacts for little animals
  const triggerMascotReaction = useCallback((mood: MascotMood, delay: number = 2000) => {
    setMascotMood(mood);
    const timeout = setTimeout(() => {
      setMascotMood('idle');
    }, delay);
    return () => clearTimeout(timeout);
  }, []);

  // Backtracking Sudoku Grid Generator - robust list block-shuffling layout generator
  const generateSudokuBoard = useCallback((difficultyLevel: 'easy' | 'medium' | 'hard'): GameCell[][] => {
    // 1. Create a base fully solved Sudoku board
    // Base formula is guaranteed to form a mathematically standard, solved 9x9 grid
    const solution: number[][] = Array.from({ length: 9 }, () => Array(9).fill(0));
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        solution[r][c] = ((r * 3 + Math.floor(r / 3) + c) % 9) + 1;
      }
    }

    // 2. Perform validity-preserving shuffles to randomize completely
    // Let's create a map to swap digits
    const map = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    for (let i = map.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [map[i], map[j]] = [map[j], map[i]];
    }

    // Swap digits through grid
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        solution[r][c] = map[solution[r][c] - 1];
      }
    }

    // Swap columns within the same 3x3 block bands
    const swapColumnsOfBand = (bandIdx: number) => {
      const cols = [bandIdx * 3, bandIdx * 3 + 1, bandIdx * 3 + 2];
      // Shuffle cols
      cols.sort(() => Math.random() - 0.5);
      // Map columns in place
      for (let r = 0; r < 9; r++) {
        const temp0 = solution[r][bandIdx * 3];
        const temp1 = solution[r][bandIdx * 3 + 1];
        const temp2 = solution[r][bandIdx * 3 + 2];
        solution[r][bandIdx * 3] = cols[0] === bandIdx * 3 ? temp0 : cols[0] === bandIdx * 3 + 1 ? temp1 : temp2;
        solution[r][bandIdx * 3 + 1] = cols[1] === bandIdx * 3 ? temp0 : cols[1] === bandIdx * 3 + 1 ? temp1 : temp2;
        solution[r][bandIdx * 3 + 2] = cols[2] === bandIdx * 3 ? temp0 : cols[2] === bandIdx * 3 + 1 ? temp1 : temp2;
      }
    };

    // Swap rows within the same 3x3 block bands
    const swapRowsOfBand = (bandIdx: number) => {
      const rows = [bandIdx * 3, bandIdx * 3 + 1, bandIdx * 3 + 2];
      rows.sort(() => Math.random() - 0.5);
      const rowClone = rows.map(r => [...solution[r]]);
      for (let i = 0; i < 3; i++) {
        solution[bandIdx * 3 + i] = rowClone[i];
      }
    };

    // Apply shuffles to rows & columns several times
    for (let i = 0; i < 3; i++) {
      swapColumnsOfBand(0); swipe: swapColumnsOfBand(1); swapColumnsOfBand(2);
      swapRowsOfBand(0); swapRowsOfBand(1); swapRowsOfBand(2);
    }

    // 3. Build the playable board by removing cells based on difficulty
    // Easy: ~38 cells removed (keeps ~43)
    // Medium: ~48 cells removed (keeps ~33)
    // Hard: ~56 cells removed (keeps ~25)
    let blanksToCreate = 38;
    if (difficultyLevel === 'medium') blanksToCreate = 48;
    else if (difficultyLevel === 'hard') blanksToCreate = 56;

    // We will clone the fully solved grid and pluck random indices
    const playableGrid: GameCell[][] = Array.from({ length: 9 }, (_, r) => 
      Array.from({ length: 9 }, (_, c) => ({
        row: r,
        col: c,
        value: solution[r][c], // temporarily hold original
        correctValue: solution[r][c],
        isInitial: true,
        notes: new Set<number>(),
        isError: false
      }))
    );

    const removedIndices = new Set<string>();
    let blankCount = 0;
    while (blankCount < blanksToCreate) {
      const idxR = Math.floor(Math.random() * 9);
      const idxC = Math.floor(Math.random() * 9);
      const key = `${idxR}-${idxC}`;

      if (!removedIndices.has(key)) {
        removedIndices.add(key);
        playableGrid[idxR][idxC].value = 0;
        playableGrid[idxR][idxC].isInitial = false;
        blankCount++;
      }
    }

    return playableGrid;
  }, []);

  // Start new clean game
  const handleStartGame = useCallback(() => {
    playSfx('powerup');
    const newBoard = generateSudokuBoard(difficulty);
    setBoard(newBoard);
    setSelectedCell(null);
    setMistakes(0);
    setHintsLeft(3);
    setIsPencilActive(false);
    setIsGameOver(false);
    setIsGameWon(false);
    setTimer(0);
    setIsPlaying(true);
    triggerMascotReaction('idle');
  }, [difficulty, generateSudokuBoard, playSfx, triggerMascotReaction]);

  // Handle cell selection
  const handleCellSelect = (r: number, c: number) => {
    if (!isPlaying || isGameOver || isGameWon) return;
    playSfx('click');
    setSelectedCell({ row: r, col: c });
    triggerMascotReaction('thinking', 1500);
  };

  // Safe checks if a specific placement of num is valid currently (standard Sudoku rules verification)
  const isPlacementLegalInGrid = (grid: GameCell[][], r: number, c: number, num: number): boolean => {
    // Check Row
    for (let col = 0; col < 9; col++) {
      if (col !== c && grid[r][col].value === num) return false;
    }
    // Check Col
    for (let row = 0; row < 9; row++) {
      if (row !== r && grid[row][c].value === num) return false;
    }
    // Check Box 3x3
    const boxStartRow = Math.floor(r / 3) * 3;
    const boxStartCol = Math.floor(c / 3) * 3;
    for (let row = boxStartRow; row < boxStartRow + 3; row++) {
      for (let col = boxStartCol; col < boxStartCol + 3; col++) {
        if ((row !== r || col !== c) && grid[row][col].value === num) return false;
      }
    }
    return true;
  };

  // Actions for numbers placement!
  const placeNumber = useCallback((num: number) => {
    if (!selectedCell || !isPlaying || isGameOver || isGameWon) return;
    const { row, col } = selectedCell;
    const targetCell = board[row][col];

    if (targetCell.isInitial) return;

    // 1. If Pencil mode is active, toggle candidate notes instead
    if (isPencilActive) {
      playSfx('pencil');
      setBoard(prev => {
        const nextBoard = prev.map(r => r.map(c => ({ ...c, notes: new Set(c.notes) })));
        const targetNotes = nextBoard[row][col].notes;
        
        if (targetNotes.has(num)) {
          targetNotes.delete(num);
        } else {
          targetNotes.add(num);
        }
        return nextBoard;
      });
      return;
    }

    // 2. Clear notes when placing a solid number
    playSfx('place');
    setBoard(prev => {
      const nextBoard = prev.map(r => r.map(c => ({ ...c, notes: new Set(c.notes) })));
      const cell = nextBoard[row][col];
      
      const isCorrect = (num === cell.correctValue);

      cell.value = num;
      cell.notes.clear(); // erase notes in placed cell

      if (!isCorrect) {
        // High tension error trigger
        cell.isError = true;
        
        // Dynamic mascot feels unhappy or clumsy
        triggerMascotReaction('sad');

        if (!isCozyMode) {
          playSfx('error');
          setMistakes(m => {
            const nextMistakes = m + 1;
            if (nextMistakes >= maxMistakes) {
              setIsGameOver(true);
              setIsPlaying(false);
              playSfx('error');
            }
            return nextMistakes;
          });
        }
      } else {
        cell.isError = false;
        triggerMascotReaction('happy');
      }

      // Check full game victory condition
      // A Sudoku game is completed and fully correct when all cell value matches correctValue
      const isCompleted = nextBoard.every(r => r.every(c => c.value === c.correctValue));
      if (isCompleted) {
        setIsGameWon(true);
        setIsPlaying(false);
        triggerMascotReaction('victory', 5000);
        playSfx('win');
      }

      return nextBoard;
    });

  }, [selectedCell, isPencilActive, board, isPlaying, isGameOver, isGameWon, isCozyMode, maxMistakes, playSfx, triggerMascotReaction]);

  // Clear current non-fixed cell
  const handleClearCell = () => {
    if (!selectedCell || !isPlaying) return;
    const { row, col } = selectedCell;
    if (board[row][col].isInitial) return;

    playSfx('erase');
    setBoard(prev => {
      const next = prev.map(r => r.map(c => ({ ...c, notes: new Set(c.notes) })));
      next[row][col].value = 0;
      next[row][col].isError = false;
      next[row][col].notes.clear();
      return next;
    });
  };

  // Highlight Hint Generator - reveal selected cell's value correctly
  const handleUseHint = () => {
    if (!selectedCell || !isPlaying || hintsLeft <= 0) return;
    const { row, col } = selectedCell;
    const target = board[row][col];
    
    if (target.isInitial || target.value === target.correctValue) return;

    playSfx('hint');
    setHintsLeft(h => h - 1);
    triggerMascotReaction('happy');

    setBoard(prev => {
      const next = prev.map(r => r.map(c => ({ ...c, notes: new Set(c.notes) })));
      next[row][col].value = next[row][col].correctValue;
      next[row][col].isError = false;
      next[row][col].notes.clear();

      // Check win state
      const isCompleted = next.every(r => r.every(c => c.value === c.correctValue));
      if (isCompleted) {
        setIsGameWon(true);
        setIsPlaying(false);
        triggerMascotReaction('victory', 5000);
        playSfx('win');
      }

      return next;
    });
  };

  // Timer tick effect
  useEffect(() => {
    if (isPlaying && !isGameOver && !isGameWon) {
      timerIntervalRef.current = setInterval(() => {
        setTimer(t => t + 1);
      }, 1000);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isPlaying, isGameOver, isGameWon]);

  // Grid Keyboard Controls listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isPlaying || isGameOver || isGameWon || !selectedCell) return;

      const { row, col } = selectedCell;

      if (e.key >= '1' && e.key <= '9') {
        e.preventDefault();
        placeNumber(Number(e.key));
      } else if (e.key === 'Backspace' || e.key === 'Delete') {
        e.preventDefault();
        handleClearCell();
      } else if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        setIsPencilActive(p => !p);
        playSfx('click');
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedCell({ row: Math.max(0, row - 1), col });
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedCell({ row: Math.min(8, row + 1), col });
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setSelectedCell({ row, col: Math.max(0, col - 1) });
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        setSelectedCell({ row, col: Math.min(8, col + 1) });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, isGameOver, isGameWon, selectedCell, placeNumber, playSfx]);

  // Autoload a board on first enter
  useEffect(() => {
    const defaultBoard = generateSudokuBoard('easy');
    setBoard(defaultBoard);
    setIsPlaying(true);
  }, [generateSudokuBoard]);

  // Helper formatting for seconds to normal MM:SS
  const formatTime = (secs: number): string => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // Determine grid cell coordinates visual backgrounds
  const getCellBgClass = (r: number, c: number): string => {
    if (!selectedCell) return 'bg-white';
    const { row, col } = selectedCell;

    const isSelected = row === r && col === c;
    if (isSelected) return 'bg-[#a7f3d0]/80'; // Bright soft neon emerald

    // Match Highlight row/col or box
    const sameRow = row === r;
    const sameCol = col === c;
    const sameBox = Math.floor(row / 3) === Math.floor(r / 3) && Math.floor(col / 3) === Math.floor(c / 3);

    const cellVal = board[r]?.[c]?.value;
    const selectedVal = board[row]?.[col]?.value;

    const hasMatchingNum = selectedVal !== 0 && cellVal === selectedVal;

    if (hasMatchingNum) {
      return 'bg-amber-100/90 ring-2 ring-amber-300 ring-inset'; // Lovely highlight matching keys
    }

    if (sameRow || sameCol || sameBox) {
      return 'bg-[#a7f3d0]/15'; // Very light pastel green guidance
    }

    return 'bg-white';
  };

  const currentMascot = MASCOTS.find(m => m.id === mascot) || MASCOTS[0];

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6 select-none bg-amber-50/15 rounded-3xl border border-amber-100/40 shadow-sm font-sans">
      
      {/* Page Game Banner title */}
      <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-4 rounded-2xl border border-amber-100/60 shadow-sm gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-150 text-amber-800 rounded-xl flex items-center justify-center font-bold text-xl shadow-inner">
            🌸
          </div>
          <div className="text-left">
            <h3 className="font-sans font-bold text-xs text-stone-800 flex items-center gap-1.5">
              <span>萌寵數字九宮格 (Cute Sudoku)</span>
              <span className="bg-emerald-100 text-emerald-800 text-[9px] font-extrabold px-1.5 py-0.5 rounded-full border border-emerald-250">
                療癒版 v1.0
              </span>
            </h3>
            <p className="text-[10px] text-stone-400 font-medium mt-0.5">
              與可愛森林同伴共享邏輯時光！點擊九宮格填入相應數字，增進活力腦力。
            </p>
          </div>
        </div>

        {/* Action Controls & Speed details */}
        <div className="flex gap-4 items-center">
          <div className="flex items-center gap-1 text-[11px] font-bold text-amber-900 bg-amber-100/35 px-3 py-1 rounded-full border border-amber-200/55">
            <Trophy className="w-3.5 h-3.5 text-amber-500 fill-amber-500 animate-pulse" />
            <span>精靈計時:</span>
            <span className="font-mono text-sm ml-1">{formatTime(timer)}</span>
          </div>

          <button
            onClick={() => {
              setSoundEnabled(!soundEnabled);
              playSfx('click');
            }}
            className={`p-1.5 rounded-full border transition-all ${soundEnabled ? 'bg-amber-50 border-amber-200 text-amber-800' : 'bg-stone-50 border-stone-100 text-stone-400'}`}
            title={soundEnabled ? "音效開" : "音效關"}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Playboard Column LEFT */}
        <div className="lg:col-span-8 flex flex-col items-center space-y-4">
          
          {/* Sub Stats Bar Dashboard */}
          <div className="w-full flex justify-between items-center bg-white border border-stone-100 px-5 py-3 rounded-2xl shadow-sm">
            
            {/* Mistakes & Relax Mode indicator */}
            <div className="flex items-center gap-3">
              {isCozyMode ? (
                <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-800 text-xs px-3 py-1 rounded-full border border-emerald-100 font-bold font-sans">
                  <Compass className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>悠悠放鬆模式 (無限容錯)</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 font-bold">
                  <span className="text-[10px] text-zinc-400 font-semibold block uppercase">森林生命力</span>
                  <div className="flex gap-1 ml-1" title={`失誤上限: ${maxMistakes}`}>
                    {Array.from({ length: maxMistakes }).map((_, i) => {
                      const isLost = i < mistakes;
                      return (
                        <Heart 
                          key={i} 
                          className={`w-4 h-4 transition-transform duration-300 ${isLost ? 'text-stone-200 fill-stone-100' : 'text-rose-500 fill-rose-500 scale-105 animate-pulse'}`} 
                        />
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Quick togglers */}
            <div className="flex items-center gap-2 font-sans">
              <span className="text-[10px] text-stone-400 font-bold">休閒溫和(不扣血)</span>
              <button
                onClick={() => {
                  playSfx('click');
                  setIsCozyMode(!isCozyMode);
                }}
                className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 ${isCozyMode ? 'bg-emerald-500' : 'bg-stone-250'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform duration-200 ${isCozyMode ? 'translate-x-4' : 'translate-x-0'}`} />
              </button>
            </div>
          </div>

          {/* Core 9x9 Grid layout */}
          <div className="relative w-full aspect-square max-w-[420px] bg-amber-900/10 rounded-2xl p-1.5 border-4 border-amber-900/15 shadow-md flex items-center justify-center select-none overflow-hidden">
            
            <div className="grid grid-cols-9 grid-rows-9 gap-[1px] w-full h-full bg-stone-350 rounded-lg">
              {board.map((rowArr, rIndex) => 
                rowArr.map((cell, cIndex) => {
                  const isInitial = cell.isInitial;
                  const isErr = cell.isError;
                  const cellVal = cell.value;
                  const bgClass = getCellBgClass(rIndex, cIndex);

                  // Distinct thick borders for 3x3 box boundary separating
                  const borderRight = (cIndex === 2 || cIndex === 5) ? 'border-r-3 border-amber-900/20' : '';
                  const borderBottom = (rIndex === 2 || rIndex === 5) ? 'border-b-3 border-amber-900/20' : '';

                  return (
                    <div
                      key={`${rIndex}-${cIndex}`}
                      onClick={() => handleCellSelect(rIndex, cIndex)}
                      className={`relative flex items-center justify-center aspect-square select-none cursor-pointer transition-all duration-150 ${bgClass} ${borderRight} ${borderBottom} overflow-hidden`}
                    >
                      {cellVal !== 0 ? (
                        <span 
                          className={`text-sm sm:text-lg font-mono font-extrabold ${
                            isInitial 
                              ? 'text-amber-950 font-black' 
                              : isErr 
                                ? 'text-rose-600 font-extrabold animate-shake line-through' 
                                : 'text-emerald-700'
                          }`}
                        >
                          {cellVal}
                        </span>
                      ) : (
                        // Render miniature pencil notes map
                        <div className="absolute inset-0.5 grid grid-cols-3 grid-rows-3 gap-[1px] p-[1px] opacity-80">
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(noteNum => {
                            const hasNote = cell.notes.has(noteNum);
                            return (
                              <div key={noteNum} className="flex items-center justify-center text-[8px] sm:text-[9.5px] font-mono leading-none text-[#765469] font-bold">
                                {hasNote ? noteNum : ''}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Game Over Screen Overlay */}
            {isGameOver && (
              <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-[2px] flex items-center justify-center z-30 animate-in fade-in duration-200">
                <div className="bg-white p-6 rounded-3xl border-t-8 border-rose-500 text-center max-w-[250px] space-y-3 shadow-2xl">
                  <span className="text-4xl block">🥱</span>
                  <div>
                    <h4 className="font-bold text-stone-800 text-sm">腦袋轉得太辛苦囉</h4>
                    <p className="text-[10px] text-zinc-400 mt-1 font-medium leading-relaxed">
                      失誤滿了 3 次！試試啟用「悠悠放鬆模式」可以免去懲罰盡情推理喔。
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

            {/* Game Conquered Victory Screen Overlay */}
            {isGameWon && (
              <div className="absolute inset-0 bg-emerald-950/40 backdrop-blur-[3px] flex items-center justify-center z-30 animate-in zoom-in-95 duration-200">
                <div className="bg-white p-6 rounded-3xl border-4 border-amber-300 text-center max-w-[280px] space-y-4 shadow-2xl relative">
                  <div className="absolute -top-10 inset-x-0 mx-auto w-fit text-4xl animate-bounce">
                    👑
                  </div>
                  
                  <div className="space-y-1">
                    <h4 className="font-sans font-bold text-sm text-emerald-800">🎉 聰敏大滿貫！</h4>
                    <p className="text-[10px] text-amber-900/70 font-bold uppercase tracking-wider bg-amber-50 rounded-full py-0.5 w-fit mx-auto px-2">
                      難度: {difficulty === 'easy' ? '簡單 🐢' : difficulty === 'medium' ? '活力 🦊' : '神速 ⚡'}
                    </p>
                  </div>

                  <p className="text-xs text-stone-500 font-medium leading-relaxed">
                    太神奇了！小動物們為您戴上了數獨國王皇冠！
                    成功完成了整個魔法九宮格。
                  </p>

                  <div className="bg-emerald-50 rounded-2xl p-3 border border-emerald-100 flex flex-col gap-1.5 text-xs">
                    <div className="flex justify-between font-medium text-stone-600">
                      <span>完成秒數:</span>
                      <span className="font-mono font-bold text-emerald-800">{formatTime(timer)}</span>
                    </div>
                    <div className="flex justify-between font-medium text-stone-600">
                      <span>失誤次數:</span>
                      <span className="font-mono font-bold text-[#765469]">{mistakes} 次</span>
                    </div>
                  </div>

                  <button
                    onClick={handleStartGame}
                    className="marshmallow-button w-full bg-primary text-white hover:bg-emerald-700 py-3 rounded-full text-xs font-bold border-b-4 border-emerald-950"
                  >
                    挑戰下一關 🚀
                  </button>
                </div>
              </div>
            )}

          </div>

          {/* Cozy Helper Numbers pad footer */}
          <div className="w-full max-w-[420px] bg-white border border-stone-100 rounded-2xl p-3 shadow-md space-y-2.5">
            <div className="grid grid-cols-9 gap-1.5">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => {
                // Count how many times this number value has been fully placed on grid
                const currentCount = board.flat().filter(c => c.value === num).length;
                const isAllPlaced = currentCount >= 9;

                return (
                  <button
                    key={num}
                    onClick={() => placeNumber(num)}
                    disabled={!selectedCell || isAllPlaced}
                    className={`h-10 text-sm font-mono font-black flex flex-col items-center justify-center rounded-xl transition-all ${
                      isAllPlaced 
                        ? 'bg-stone-50 text-stone-300 border border-stone-100 line-through opacity-40'
                        : selectedCell 
                          ? 'bg-[#edfcf2] hover:bg-primary hover:text-white text-emerald-800 border-b-2 border-[#1b6b4f]/15' 
                          : 'bg-stone-50 text-stone-400 border border-stone-100 cursor-not-allowed'
                    }`}
                  >
                    <span>{num}</span>
                    <span className="text-[8px] font-bold opacity-75 mt-0.5">{currentCount}/9</span>
                  </button>
                );
              })}
            </div>

            {/* Utility togglers */}
            <div className="grid grid-cols-3 gap-2 pt-1 border-t border-stone-50">
              <button
                className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl border-b-2 text-[11px] font-bold transition-all ${
                  isPencilActive 
                    ? 'bg-[#765469]/20 text-[#765469] border-[#765469]/10' 
                    : 'bg-stone-50 hover:bg-stone-100 text-stone-500 border-zinc-200'
                }`}
                onClick={() => {
                  playSfx('click');
                  setIsPencilActive(!isPencilActive);
                }}
                title="鉛筆備註 (按 N 切換)"
              >
                <Edit3 className={`w-3.5 h-3.5 ${isPencilActive ? 'fill-[#765469]/20' : ''}`} />
                <span>草稿筆記: {isPencilActive ? 'ON' : 'OFF'}</span>
              </button>

              <button
                onClick={handleClearCell}
                disabled={!selectedCell || (selectedCell && board[selectedCell.row]?.[selectedCell.col]?.isInitial)}
                className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-stone-50 hover:bg-stone-100 border-b-2 border-zinc-250 text-stone-600 disabled:opacity-45 disabled:pointer-events-none text-[11px] font-bold"
                title="清除格內數字 (Backspace)"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>擦布清除</span>
              </button>

              <button
                onClick={handleUseHint}
                disabled={hintsLeft <= 0 || !selectedCell || (selectedCell && board[selectedCell.row]?.[selectedCell.col]?.isInitial)}
                className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 border-b-2 border-amber-200/60 text-amber-800 disabled:opacity-45 disabled:pointer-events-none text-[11px] font-bold"
                title="顯現正確值"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>神之提示 ({hintsLeft})</span>
              </button>
            </div>
          </div>

        </div>

        {/* Options / Mascot panel Column RIGHT */}
        <div className="lg:col-span-4 space-y-4 text-left">
          
          {/* Mascot Box */}
          <div className="bg-white p-4 rounded-3xl border border-stone-100 shadow-sm text-center relative overflow-hidden flex flex-col items-center">
            
            <div className="absolute top-2.5 right-2.5">
              <select
                className="text-[9px] bg-stone-50 border border-stone-150 rounded-lg px-1.5 py-0.5 font-bold text-gray-500 cursor-pointer"
                value={mascot}
                onChange={(e) => {
                  playSfx('click');
                  setMascot(e.target.value);
                  triggerMascotReaction('idle');
                }}
              >
                {MASCOTS.map(m => (
                  <option key={m.id} value={m.id}>{m.name.split(' ')[0]}</option>
                ))}
              </select>
            </div>

            {/* Mascot Avatar view and Speech bubble */}
            <div className="min-h-[50px] w-full mt-3 flex items-center justify-center px-2">
              <div className="relative bg-amber-50/70 border border-amber-100/60 p-2.5 rounded-2xl text-[10px] text-amber-950 font-bold font-sans max-w-[200px] leading-relaxed select-none shrink-0 animate-pulse">
                <div className="absolute w-2 h-2 bg-amber-50/70 border-b border-l border-amber-100/60 rotate-45 -bottom-1 left-1/2 -translate-x-1/2" />
                {mascotMood === 'idle' && (
                  <span>您好！我是您的伴讀學伴 {currentMascot.name.split(' ')[0]}。一起放鬆算九宮格吧！</span>
                )}
                {mascotMood === 'thinking' && (
                  <span>嗯... 這裡填 1 到 9 的哪一個才對呢？要橫豎和區塊都不一樣喔。</span>
                )}
                {mascotMood === 'happy' && (
                  <span>哇！填對了！好棒妙算，離勝利九宮更近一步了 ✨</span>
                )}
                {mascotMood === 'sad' && (
                  <span>唔，這個數字好像不太合適呢。不要氣餒，再想想看！</span>
                )}
                {mascotMood === 'victory' && (
                  <span>萬歲！我們打通了完美的森林九宮魔法陣！您真是名符其實的數獨精靈！</span>
                )}
              </div>
            </div>

            {/* Animated animal illustration based on mood */}
            <div className="text-6xl my-4 select-none h-16 flex items-center justify-center">
              {mascot === 'squirrel' ? (
                mascotMood === 'happy' ? '🐿️✨' :
                mascotMood === 'sad' ? '🐿️💧' :
                mascotMood === 'thinking' ? '🐿️🎒' :
                mascotMood === 'victory' ? '🐿️👑' : '🐿️'
              ) : (
                mascotMood === 'happy' ? '🐼✨' :
                mascotMood === 'sad' ? '🐼💦' :
                mascotMood === 'thinking' ? '🐼🎋' :
                mascotMood === 'victory' ? '🐼🏆' : '🐼'
              )}
            </div>

            <div className="text-left w-full border-t border-stone-50 pt-3.5 space-y-1">
              <span className="text-[11px] font-bold text-gray-800 block">{currentMascot.name}</span>
              <span className="text-[9.5px] text-stone-400 font-medium leading-relaxed block">{currentMascot.description}</span>
            </div>
          </div>

          {/* Difficulty Tuning Settings */}
          <div className="bg-white p-4 rounded-2xl border border-[#ecebe6] shadow-sm space-y-3">
            <span className="block text-[9px] font-bold text-gray-400 uppercase tracking-widest border-b pb-1">題目難度等級</span>
            <div className="grid grid-cols-3 gap-1 px-0.5">
              {(['easy', 'medium', 'hard'] as const).map(level => {
                const label = level === 'easy' ? '輕鬆 🐢' : level === 'medium' ? '靈活 🦊' : '燒腦 ⚡';
                const isActive = difficulty === level;
                return (
                  <button
                    key={level}
                    onClick={() => {
                      playSfx('click');
                      setDifficulty(level);
                      triggerMascotReaction('idle');
                    }}
                    className={`py-1.5 rounded-xl text-[10px] font-bold text-center border transition-all ${
                      isActive 
                        ? 'bg-primary border-[#1b6b4f] text-white shadow-inner font-black' 
                        : 'bg-stone-50 hover:bg-stone-100 text-gray-500 border-zinc-150'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            <button
              onClick={handleStartGame}
              className="marshmallow-button w-full bg-primary text-white hover:bg-emerald-700 font-bold py-2.5 rounded-full text-xs flex items-center justify-center gap-1 border-b-4 border-emerald-950"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>重啟森林難度九宮</span>
            </button>
          </div>

          {/* Brief Tutorial Rules info box */}
          <div className="bg-stone-50 p-4 rounded-2xl border border-stone-100 space-y-3">
            <span className="block text-[9px] font-bold text-[#1b6b4f] uppercase tracking-widest flex items-center gap-1">
              <HelpCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>九宮魔法陣玩法指引</span>
            </span>
            <ul className="text-[10px] text-gray-500 font-medium leading-relaxed space-y-1.5 font-sans">
              <li>📌 <strong>基本規則</strong>：在每一個 9x9 的格線中，填入 1 至 9。</li>
              <li>📌 <strong>三大限制</strong>：每行、每列，以及每個粗線框起的 3x3 小區塊內，數字 1–9 <strong>皆不能重複</strong>。</li>
              <li>📌 <strong>高分技巧</strong>：
                <ul className="pl-3.5 list-disc mt-0.5 text-stone-400 space-y-0.5">
                  <li>選擇一格後，相同的數字會被高亮（橘底黃邊）。</li>
                  <li>使用「草稿筆記」可以在不確定時，於格子內鉛筆備註，好用又解壓。</li>
                  <li>使用鍵盤的鍵盤 <strong>方向鍵</strong>、<strong>1–9</strong> 與 <strong>Backspace</strong> 退格，算題快無邊！</li>
                </ul>
              </li>
            </ul>
          </div>

        </div>

      </div>

    </div>
  );
}
