/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Trophy, Sparkles, HelpCircle, ArrowLeft, ArrowRight, ArrowDown, ArrowUp, RefreshCw, Zap, Flame, Star, Award, Info, ZapOff } from 'lucide-react';

// Tetris configs
const COLS = 10;
const ROWS = 20;

type CellType = 0 | string; // 0 for empty, otherwise color key string
type BlockType = 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L' | 'STONE';

interface Tetromino {
  shape: number[][];
  color: string;
  borderColor: string;
  shadowColor: string;
  emoji: string;
  type: BlockType;
}

const TETROMINOES: Record<Exclude<BlockType, 'STONE'>, Tetromino> = {
  I: { shape: [[1, 1, 1, 1]], color: 'bg-rose-450', borderColor: 'border-rose-500', shadowColor: 'shadow-rose-100', emoji: '🍓', type: 'I' },
  O: { shape: [[1, 1], [1, 1]], color: 'bg-amber-400', borderColor: 'border-amber-500', shadowColor: 'shadow-amber-100', emoji: '🍋', type: 'O' },
  T: { shape: [[0, 1, 0], [1, 1, 1]], color: 'bg-violet-400', borderColor: 'border-violet-500', shadowColor: 'shadow-violet-100', emoji: '🍇', type: 'T' },
  S: { shape: [[0, 1, 1], [1, 1, 0]], color: 'bg-emerald-400', borderColor: 'border-emerald-500', shadowColor: 'shadow-emerald-100', emoji: '🍏', type: 'S' },
  Z: { shape: [[1, 1, 0], [0, 1, 1]], color: 'bg-red-400', borderColor: 'border-red-500', shadowColor: 'shadow-red-100', emoji: '🍒', type: 'Z' },
  J: { shape: [[1, 0, 0], [1, 1, 1]], color: 'bg-sky-400', borderColor: 'border-sky-500', shadowColor: 'shadow-sky-100', emoji: '🫐', type: 'J' },
  L: { shape: [[0, 0, 1], [1, 1, 1]], color: 'bg-orange-400', borderColor: 'border-orange-500', shadowColor: 'shadow-orange-100', emoji: '🍊', type: 'L' }
};

type GameMode = 'classic' | 'obstacle' | 'rush'; // classic with normal speed, obstacle with stone floors, rush with countdown and speeds

export default function MiniGameTetris() {
  // Game state
  const [board, setBoard] = useState<CellType[][]>(() => Array(ROWS).fill(null).map(() => Array(COLS).fill(0)));
  const [currentPiece, setCurrentPiece] = useState<{ shape: number[][]; x: number; y: number; type: BlockType; color: string; borderColor: string; emoji: string } | null>(null);
  const [nextPieceType, setNextPieceType] = useState<Exclude<BlockType, 'STONE'>>('I');
  
  // Game Controls
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [gameMode, setGameMode] = useState<GameMode>('classic');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  
  // Scoring / Progress metrics
  const [score, setScore] = useState<number>(0);
  const [linesCleared, setLinesCleared] = useState<number>(0);
  const [level, setLevel] = useState<number>(1);
  const [highScore, setHighScore] = useState<number>(() => {
    try {
      return Number(localStorage.getItem('tetris_high_score') || '1200');
    } catch {
      return 1200;
    }
  });
  
  // Mode parameters
  const [timeLeft, setTimeLeft] = useState<number>(120); // 2 minutes for Rush mode
  const [clearingRows, setClearingRows] = useState<number[]>([]); // for flash animations
  const [blocksPlaced, setBlocksPlaced] = useState<number>(0); // count to trigger stone generation in Obstacle Mode
  
  // Mascot interactions
  const [bearText, setBearText] = useState<string>('嗨！我是小熊巴魯 🐻，快把五彩繽紛、QQ彈彈的「果凍糖果積木」拼入收納盒中吧！');
  const [bearMood, setBearMood] = useState<'happy' | 'thinking' | 'sad' | 'idle' | 'fear'>('idle');

  // Key handlers Ref to guard duplicate listeners
  const boardRef = useRef<CellType[][]>(board);
  const currentPieceRef = useRef(currentPiece);
  const isPlayingRef = useRef(isPlaying);
  const isPausedRef = useRef(isPaused);
  const isGameOverRef = useRef(isGameOver);

  // Sync refs so callbacks have fresh access
  useEffect(() => {
    boardRef.current = board;
  }, [board]);

  useEffect(() => {
    currentPieceRef.current = currentPiece;
  }, [currentPiece]);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
    isPausedRef.current = isPaused;
    isGameOverRef.current = isGameOver;
  }, [isPlaying, isPaused, isGameOver]);

  // Sound Synthesizer via Web Audio API
  const playSfx = useCallback((type: 'move' | 'rotate' | 'drop' | 'clear' | 'gameover' | 'levelup' | 'stone' | 'click') => {
    if (!soundEnabled) return;
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();

      if (type === 'move') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(300, ctx.currentTime);
        gain.gain.setValueAtTime(0.03, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
        osc.start();
        osc.stop(ctx.currentTime + 0.06);
      } else if (type === 'rotate') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.08);
        gain.gain.setValueAtTime(0.04, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
        osc.start();
        osc.stop(ctx.currentTime + 0.11);
      } else if (type === 'drop') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(150, ctx.currentTime);
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
        osc.start();
        osc.stop(ctx.currentTime + 0.12);
      } else if (type === 'clear') {
        // Multi-tone chime major chord
        const freqs = [523.25, 659.25, 783.99, 1046.50]; // C Major
        freqs.forEach((freq, idx) => {
          const oscNode = ctx.createOscillator();
          const gainNode = ctx.createGain();
          oscNode.connect(gainNode);
          gainNode.connect(ctx.destination);
          oscNode.type = 'sine';
          oscNode.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.06);
          gainNode.gain.setValueAtTime(0.05, ctx.currentTime + idx * 0.06);
          gainNode.gain.exponentialRampToValueAtTime(0.002, ctx.currentTime + idx * 0.06 + 0.25);
          oscNode.start(ctx.currentTime + idx * 0.06);
          oscNode.stop(ctx.currentTime + idx * 0.06 + 0.26);
        });
      } else if (type === 'gameover') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(180, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(70, ctx.currentTime + 0.6);
        gain.gain.setValueAtTime(0.06, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.65);
        osc.start();
        osc.stop(ctx.currentTime + 0.7);
      } else if (type === 'levelup') {
        const notes = [261.63, 392.00, 523.25, 783.99, 1046.50];
        notes.forEach((freq, idx) => {
          const oscNode = ctx.createOscillator();
          const gainNode = ctx.createGain();
          oscNode.connect(gainNode);
          gainNode.connect(ctx.destination);
          oscNode.type = 'triangle';
          oscNode.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);
          gainNode.gain.setValueAtTime(0.04, ctx.currentTime + idx * 0.08);
          gainNode.gain.exponentialRampToValueAtTime(0.002, ctx.currentTime + idx * 0.08 + 0.3);
          oscNode.start(ctx.currentTime + idx * 0.08);
          oscNode.stop(ctx.currentTime + idx * 0.08 + 0.32);
        });
      } else if (type === 'stone') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(110, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(55, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.06, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
        osc.start();
        osc.stop(ctx.currentTime + 0.2);
      } else if (type === 'click') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(520, ctx.currentTime);
        gain.gain.setValueAtTime(0.03, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
        osc.start();
        osc.stop(ctx.currentTime + 0.06);
      }
    } catch {
      // safe fallback
    }
  }, [soundEnabled]);

  // Generate random piece Type
  const getRandomPieceType = (): Exclude<BlockType, 'STONE'> => {
    const types: Exclude<BlockType, 'STONE'>[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];
    return types[Math.floor(Math.random() * types.length)];
  };

  // Setup initial stone row obstacle (Obstacle Mode)
  const generateObstacleFloor = (currentBoard: CellType[][]): CellType[][] => {
    const newBoard = currentBoard.map(row => [...row]);
    // Set 3 random single stones at the very bottom row, and 2 at row 18
    const stoneShape = 'STONE_COLOR'; // special stone string
    
    // Choose 3 random columns for row 19 (bottom-most)
    const colIndices1 = Array(COLS).fill(0).map((_, i) => i).sort(() => Math.random() - 0.5).slice(0, 4);
    colIndices1.forEach(col => {
      newBoard[ROWS - 1][col] = stoneShape;
    });

    // Choose 2 random columns for row 18
    const colIndices2 = Array(COLS).fill(0).map((_, i) => i).sort(() => Math.random() - 0.5).slice(0, 2);
    colIndices2.forEach(col => {
      newBoard[ROWS - 2][col] = stoneShape;
    });

    return newBoard;
  };

  // Collision inspector
  const checkCollision = useCallback((
    pieceShape: number[][],
    offsetX: number,
    offsetY: number,
    currentBoard: CellType[][]
  ): boolean => {
    for (let r = 0; r < pieceShape.length; r++) {
      for (let c = 0; c < pieceShape[r].length; c++) {
        if (pieceShape[r][c] !== 0) {
          const nextX = offsetX + c;
          const nextY = offsetY + r;

          // Out of bounds
          if (nextX < 0 || nextX >= COLS || nextY >= ROWS) {
            return true;
          }

          // Collide with filled board cell (only if checking bottom cells)
          if (nextY >= 0 && currentBoard[nextY][nextX] !== 0) {
            return true;
          }
        }
      }
    }
    return false;
  }, []);

  // Spawn new tetromino
  const spawnPiece = useCallback((currentType: Exclude<BlockType, 'STONE'>, nextType: Exclude<BlockType, 'STONE'>, currentBoard: CellType[][]) => {
    const proto = TETROMINOES[currentType];
    const shape = proto.shape;
    const width = shape[0].length;
    // Spawn centered horizontally at the top y = -1 or 0
    const startX = Math.floor((COLS - width) / 2);
    const startY = 0;

    // Check if the newly spawned piece immediately collides - Game Over!
    if (checkCollision(shape, startX, startY, currentBoard)) {
      setIsGameOver(true);
      setIsPlaying(false);
      playSfx('gameover');
      setBearMood('fear');
      setBearText('啊！保鮮盒滿溢出來了，果凍積木掉落了一地！🐻💧 快點重試一局吧，巴魯一直在這裡等你！');
      return;
    }

    setCurrentPiece({
      shape: shape,
      x: startX,
      y: startY,
      type: proto.type,
      color: proto.color,
      borderColor: proto.borderColor,
      emoji: proto.emoji
    });
    setNextPieceType(nextType);

    // Random dynamic encouraging quotes from bear
    if (Math.random() > 0.72) {
      const quotes = [
        '巴魯拍了拍手：疊得太漂亮了！繼續保持喔 🐻✨',
        '加油！看好下一格糖果的形狀，旋轉一下更完美！🐻🍓',
        '哇！果凍盒空出了好多位置，你真是收納小高手！🐻💡',
        '小心，積木堆得有點稍微高了，讓我們趕快消除吧！🐻💭'
      ];
      setBearText(quotes[Math.floor(Math.random() * quotes.length)]);
    }
  }, [checkCollision, playSfx]);

  // Start a fresh new game
  const startNewGame = (mode: GameMode) => {
    playSfx('click');
    
    // Clear board
    let initialBoard = Array(ROWS).fill(null).map(() => Array(COLS).fill(0));
    if (mode === 'obstacle') {
      initialBoard = generateObstacleFloor(initialBoard);
    }

    setBoard(initialBoard);
    setIsGameOver(false);
    setIsPaused(false);
    setIsPlaying(true);
    setScore(0);
    setLinesCleared(0);
    setLevel(1);
    setBlocksPlaced(0);
    setTimeLeft(120);
    setClearingRows([]);
    setGameMode(mode);

    // Generate first and second queue pieces
    const first = getRandomPieceType();
    const second = getRandomPieceType();

    spawnPiece(first, second, initialBoard);
    setBearMood('happy');
    
    if (mode === 'classic') {
      setBearText('【經典保鮮特訓】已啟動！平地起高樓，巴魯陪你拼盡每一格，一起拿個亮眼的高分吧！🐻🍯');
    } else if (mode === 'obstacle') {
      setBearText('⚠️【山石阻礙特訓】開啟！底部生出了頑固的石塊，牠們不能被消除，可得巧妙鋪墊前進才行喔！🐻⛰️');
    } else {
      setBearText('⚡【120秒限時速消】！倒計時已經敲響，手速拉滿，在時間歸零前爆發出最高的果凍消除能量吧！🐻⏰');
    }
  };

  // Save High Score helper
  const updateHighScoreIfNeeded = (finalScore: number) => {
    if (finalScore > highScore) {
      setHighScore(finalScore);
      try {
        localStorage.setItem('tetris_high_score', String(finalScore));
      } catch {
        // quiet fail
      }
    }
  };

  // Merge block into grid board
  const mergePieceToBoard = useCallback((
    piece: NonNullable<typeof currentPiece>,
    currentBoard: CellType[][]
  ) => {
    const updatedBoard = currentBoard.map(row => [...row]);
    const { shape, x, y, color } = piece;

    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (shape[r][c] !== 0) {
          const boardY = y + r;
          const boardX = x + c;
          if (boardY >= 0 && boardY < ROWS && boardX >= 0 && boardX < COLS) {
            updatedBoard[boardY][boardX] = piece.type; // Save piece type name as identification
          }
        }
      }
    }

    // Line Clear Logic
    const clearedIndices: number[] = [];
    for (let r = 0; r < ROWS; r++) {
      let isRowFilled = true;
      for (let c = 0; c < COLS; c++) {
        // Elements of STONE or Standard Tetromino types count as filled
        if (updatedBoard[r][c] === 0) {
          isRowFilled = false;
          break;
        }
      }
      if (isRowFilled) {
        clearedIndices.push(r);
      }
    }

    let nextBoard = updatedBoard;
    let addedScore = 0;
    let rowsClearCount = clearedIndices.length;

    if (rowsClearCount > 0) {
      playSfx('clear');
      setClearingRows(clearedIndices);

      // Flash feedback, then wipe clear
      // Map clear sizes to standard score multipliers
      const scoreLookup = [0, 100, 300, 500, 800]; // Tetris is 800 for 4 lines
      addedScore = (scoreLookup[rowsClearCount] || 800) * level;

      // Filter cleared out
      nextBoard = updatedBoard.filter((_, idx) => !clearedIndices.includes(idx));
      // Re-populate from the top with empty zero rows
      const emptyLayers = Array(rowsClearCount).fill(null).map(() => Array(COLS).fill(0));
      nextBoard = [...emptyLayers, ...nextBoard];

      // Tally state metrics
      setScore(prev => {
        const val = prev + addedScore;
        updateHighScoreIfNeeded(val);
        return val;
      });
      setLinesCleared(prev => {
        const nextLines = prev + rowsClearCount;
        // Elevate level state
        const calculatedLevel = Math.floor(nextLines / 10) + 1;
        if (calculatedLevel > level) {
          setLevel(calculatedLevel);
          playSfx('levelup');
          setBearMood('happy');
          setBearText(`🎉 太厲害了！積木大賽升級到了第 ${calculatedLevel} 階！速度會變得稍微快一點喔！🍒`);
        }
        return nextLines;
      });

      // Show specific lines-cleared cute comments
      if (rowsClearCount === 4) {
        setBearMood('happy');
        setBearText('🤩 四行全消！【果凍大爆炸】！巴魯高興地蹦了一下，這太驚艷了！🍬🧁');
      } else if (rowsClearCount === 3) {
        setBearMood('happy');
        setBearText('🥰 乾淨俐落！一連消除了三行！再接再厲！🍏');
      }

    } else {
      // Just normal lock
      playSfx('drop');
    }

    // Set board state and clear temporary flashing
    setBoard(nextBoard);
    setTimeout(() => {
      setClearingRows([]);
    }, 150);

    const nextPiece = getRandomPieceType();
    
    // In Obstacle Mode, sometimes spawn an extra persistent Stone inside board if we place 8 blocks
    setBlocksPlaced(prev => {
      const nextPlaced = prev + 1;
      if (gameMode === 'obstacle' && nextPlaced % 7 === 0) {
        // Spawn stone in a random unfilled column in top or middle rows
        setTimeout(() => {
          setBoard(b => {
            const tempBoard = b.map(row => [...row]);
            // Search rows 10 to 17 (avoid too high in top)
            const targetRow = Math.floor(Math.random() * 6) + 12; // row 12 to 17
            const emptyCols: number[] = [];
            for (let cols = 0; cols < COLS; cols++) {
              if (tempBoard[targetRow][cols] === 0) {
                emptyCols.push(cols);
              }
            }
            if (emptyCols.length > 0) {
              const randCol = emptyCols[Math.floor(Math.random() * emptyCols.length)];
              tempBoard[targetRow][randCol] = 'STONE_COLOR'; // solid stone
              playSfx('stone');
              setBearText('⛰️ 咕嚕嚕！保鮮盒一側滾進了一塊「林地堅硬山石」！可得想辦法繞開疊放喔！');
            }
            return tempBoard;
          });
        }, 300);
      }
      return nextPlaced;
    });

    spawnPiece(nextPieceType, nextPiece, nextBoard);

  }, [nextPieceType, level, gameMode, playSfx, spawnPiece]);

  // Movement methods
  const moveHorizontally = useCallback((dir: number) => {
    const piece = currentPieceRef.current;
    if (!piece || !isPlayingRef.current || isPausedRef.current || isGameOverRef.current) return;

    if (!checkCollision(piece.shape, piece.x + dir, piece.y, boardRef.current)) {
      playSfx('move');
      setCurrentPiece(prev => {
        if (!prev) return prev;
        return { ...prev, x: prev.x + dir };
      });
    }
  }, [checkCollision, playSfx]);

  const rotatePiece = useCallback(() => {
    const piece = currentPieceRef.current;
    if (!piece || !isPlayingRef.current || isPausedRef.current || isGameOverRef.current) return;

    // Standard transpose & reverse matrix
    const newShape = piece.shape[0].map((_, colIndex) =>
      piece.shape.map(row => row[colIndex]).reverse()
    );

    // Guard rotate collision with wall-kick offsets (tries left, right, or up to fit)
    let finalX = piece.x;
    let finalY = piece.y;
    let canRotate = false;

    // Check offsets: 0, -1, +1, -2, +2
    const kicks = [0, -1, 1, -2, 2];
    for (const kick of kicks) {
      if (!checkCollision(newShape, piece.x + kick, piece.y, boardRef.current)) {
        finalX = piece.x + kick;
        canRotate = true;
        break;
      }
    }

    if (canRotate) {
      playSfx('rotate');
      setCurrentPiece(prev => {
        if (!prev) return prev;
        return { ...prev, shape: newShape, x: finalX, y: finalY };
      });
    }
  }, [checkCollision, playSfx]);

  const dropPiece = useCallback(() => {
    const piece = currentPieceRef.current;
    if (!piece || !isPlayingRef.current || isPausedRef.current || isGameOverRef.current) return;

    if (!checkCollision(piece.shape, piece.x, piece.y + 1, boardRef.current)) {
      setCurrentPiece(prev => {
        if (!prev) return prev;
        return { ...prev, y: prev.y + 1 };
      });
      // Small score for manual soft drop
      setScore(prev => prev + 1);
    } else {
      mergePieceToBoard(piece, boardRef.current);
    }
  }, [checkCollision, mergePieceToBoard]);

  const hardDropPiece = useCallback(() => {
    const piece = currentPieceRef.current;
    if (!piece || !isPlayingRef.current || isPausedRef.current || isGameOverRef.current) return;

    let targetY = piece.y;
    while (!checkCollision(piece.shape, piece.x, targetY + 1, boardRef.current)) {
      targetY += 1;
    }

    const dropDistance = targetY - piece.y;
    const finalPiece = { ...piece, y: targetY };
    
    // Tally extra score points for quick slam
    setScore(prev => prev + (dropDistance * 2));
    
    // Instant lock in targetY
    mergePieceToBoard(finalPiece, boardRef.current);
  }, [checkCollision, mergePieceToBoard]);

  // Hook keyboard game controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault(); // suppress scroll
      }

      if (!isPlayingRef.current || isPausedRef.current || isGameOverRef.current) {
        return;
      }

      switch (e.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
          moveHorizontally(-1);
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          moveHorizontally(1);
          break;
        case 'ArrowUp':
        case 'w':
        case 'W':
          rotatePiece();
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          dropPiece();
          break;
        case ' ': // spacebar helper
          hardDropPiece();
          break;
        case 'p':
        case 'P':
          setIsPaused(prev => !prev);
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [moveHorizontally, rotatePiece, dropPiece, hardDropPiece]);

  // Game loop interval timer
  useEffect(() => {
    if (!isPlaying || isPaused || isGameOver) return;

    // Speed formula based on current level state: higher level, shorter delay interval
    const initialDelay = 850;
    const speedMultiplier = Math.max(120, initialDelay - (level - 1) * 80);

    const id = setInterval(() => {
      dropPiece();
    }, speedMultiplier);

    return () => clearInterval(id);
  }, [isPlaying, isPaused, isGameOver, level, dropPiece]);

  // Countdown clock timer specifically for Time Attack Mode
  useEffect(() => {
    if (!isPlaying || isPaused || isGameOver || gameMode !== 'rush') return;

    const id = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(id);
          setIsPlaying(false);
          setIsGameOver(true);
          playSfx('gameover');
          setBearMood('happy');
          setBearText(`⏰【120秒衝刺特訓結束！】你成功消除了果凍保鮮盒，最終在櫻桃加分下，收割了滿滿的 ${score} 分！真是太酷了！👑`);
          updateHighScoreIfNeeded(score);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(id);
  }, [isPlaying, isPaused, isGameOver, gameMode, score]);

  // Mascot dynamic ambient behavior (blinking or small gestures)
  useEffect(() => {
    const id = setInterval(() => {
      if (isGameOver) return;
      
      // If stack is reaching top rows (>13 built rows in middle rows), bear looks worried/worried-mood
      let maxOccupiedHeight = 0;
      for (let r = 0; r < ROWS; r++) {
        const hasBlock = board[r].some(cell => cell !== 0);
        if (hasBlock) {
          maxOccupiedHeight = ROWS - r;
          break;
        }
      }

      if (maxOccupiedHeight >= 12) {
        setBearMood('fear');
        setBearText('😰 哎呀呀，果凍糖果堆得好高了！巴魯緊握小爪毛，打醒十二分精神，加油消除吧！💦');
      } else if (Math.random() > 0.8) {
        setBearMood('thinking');
        const funnyTips = [
          '小提示 🐻🍭：可以使用空白鍵【瞬降】積木噢，那樣能為小糖果盒獲得額外雙倍得分點！',
          '巴魯小聲吹哨 🐻🍒：聽說多消除四行，五彩繽紛糖果果凍就能融化成美味巨熊爆破！',
          '糖果特訓 🐻🍏：如果覺得速度變快了，可以在頂部的按鈕臨時【暫停】休息喝口蜜糖水唷。',
        ];
        setBearText(funnyTips[Math.floor(Math.random() * funnyTips.length)]);
      } else {
        setBearMood('idle');
      }
    }, 15000);

    return () => clearInterval(id);
  }, [board, isGameOver]);

  // Combine live stack block values to draw visually
  const renderGrid = () => {
    // Clone board to build live render copy
    const gridToDisplay = board.map(row => [...row]);

    // Stamp current piece onto display grid
    if (currentPiece && !isPaused) {
      const { shape, x, y, type } = currentPiece;
      for (let r = 0; r < shape.length; r++) {
        for (let c = 0; c < shape[r].length; c++) {
          if (shape[r][c] !== 0) {
            const boardY = y + r;
            const boardX = x + c;
            if (boardY >= 0 && boardY < ROWS && boardX >= 0 && boardX < COLS) {
              gridToDisplay[boardY][boardX] = type;
            }
          }
        }
      }
    }

    return gridToDisplay.map((row, rIdx) => (
      <div key={rIdx} className="flex">
        {row.map((cell, cIdx) => {
          let cellStyle = 'bg-[#f5f5f4]/35 border border-dashed border-[#e7e5e4]';
          let innerContent = null;
          const isFlashing = clearingRows.includes(rIdx);

          if (isFlashing) {
            cellStyle = 'bg-white border-2 border-[#124b37] scale-95 transition-all duration-75 shadow-lg shadow-emerald-200 z-10';
            innerContent = <span className="text-xl animate-ping">✨</span>;
          } else if (cell !== 0) {
            // Check filled cell style matching colors
            if (cell === 'STONE_COLOR' || cell === 'STONE') {
              cellStyle = 'bg-stone-500 border-2 border-stone-600 shadow-inner rounded-md';
              innerContent = <span className="text-sm">⛰️</span>;
            } else {
              const proto = TETROMINOES[cell as Exclude<BlockType, 'STONE'>];
              if (proto) {
                // Apply soft roundings and custom sweet gradients
                cellStyle = `${proto.color} border-2 ${proto.borderColor} shadow-xs rounded-[5px] transition-all duration-100 flex items-center justify-center relative select-none`;
                innerContent = (
                  <div className="absolute inset-x.5 top-0.5 bottom-1 rounded-[4px] bg-white/20 flex items-center justify-center text-xs">
                    <span className="drop-shadow-xs">{proto.emoji}</span>
                  </div>
                );
              }
            }
          }

          return (
            <div
              key={cIdx}
              className={`w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center transition-all ${cellStyle}`}
            >
              {innerContent}
            </div>
          );
        })}
      </div>
    ));
  };

  // Keyboard ghost display helpers (What block is coming next inside widget bubble)
  const drawNextPiecePreview = () => {
    const proto = TETROMINOES[nextPieceType];
    if (!proto) return null;
    const shape = proto.shape;

    return (
      <div className="flex flex-col gap-1 items-center justify-center p-3.5 bg-stone-50 rounded-2xl border border-stone-200/50 shadow-inner min-h-[90px] w-28 mx-auto">
        {shape.map((row, rIdx) => (
          <div key={rIdx} className="flex">
            {row.map((cell, cIdx) => (
              <div
                key={cIdx}
                className={`w-6 h-6 m-0.5 rounded flex items-center justify-center text-xs transition-all ${
                  cell !== 0 ? `${proto.color} border border-${proto.borderColor} text-white` : 'invisible'
                }`}
              >
                {cell !== 0 ? proto.emoji : ''}
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  };

  const formattedTimeLeft = () => {
    const mins = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6 select-none bg-emerald-50/10 rounded-3xl border border-emerald-150/30 shadow-sm font-sans text-left">
      
      {/* Top dashboard row details */}
      <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-4 rounded-2xl border border-emerald-100/50 shadow-sm gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-100 text-amber-800 rounded-xl flex items-center justify-center font-bold text-xl shadow-inner">
            🐻
          </div>
          <div>
            <h3 className="font-sans font-bold text-xs text-stone-800 flex items-center gap-1.5">
              <span>萌熊果凍積木盒 (Cute Bear Jelly Block Box)</span>
              <span className="bg-amber-100 text-amber-800 text-[10px] font-extrabold px-1.5 py-0.5 rounded-full border border-amber-200">
                經典方塊
              </span>
            </h3>
            <p className="text-[10px] text-zinc-400 font-medium mt-0.5">
              與可愛蓬鬆小熊巴魯一塊，轉動繽紛夢幻果凍積木放入收納盒，解鎖極致消除暢爽體驗！
            </p>
          </div>
        </div>

        <div className="flex gap-3 items-center">
          <button
            onClick={() => {
              setSoundEnabled(!soundEnabled);
              playSfx('click');
            }}
            className={`p-2 rounded-full border transition-all ${soundEnabled ? 'bg-amber-50 border-amber-200 text-amber-800' : 'bg-stone-50 border-stone-100 text-stone-400'}`}
            title={soundEnabled ? "開啟音效" : "關閉音效"}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Core Tetris Arena Grid panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Interactive Arena Grid: 20 rows by 10 cols */}
        <div className="lg:col-span-8 flex flex-col items-center">
          
          {/* Top Score banner panel */}
          <div className="w-full grid grid-cols-3 gap-3 bg-white border border-stone-100 p-3 rounded-2xl shadow-sm text-center mb-4">
            
            {/* Score item */}
            <div className="bg-amber-50/40 p-2 rounded-xl border border-amber-100 flex flex-col items-center justify-center">
              <span className="text-[9.5px] uppercase font-bold tracking-widest text-amber-900">當前積分</span>
              <span className="text-xl font-mono font-black text-amber-800 mt-1">{score} 分</span>
              <span className="text-[9px] text-[#b45309] font-medium font-mono">🏆 High: {highScore}</span>
            </div>

            {/* Mode & time limit or lines */}
            <div className="bg-emerald-50/30 p-2 rounded-xl border border-emerald-100/60 flex flex-col items-center justify-center">
              <span className="text-[9.5px] uppercase font-extrabold tracking-widest text-[#1b6b4f]">
                {gameMode === 'rush' ? '計時衝刺' : '消除行數'}
              </span>
              <span className="text-lg font-black font-mono text-emerald-800 mt-0.5">
                {gameMode === 'rush' ? formattedTimeLeft() : `${linesCleared} 行`}
              </span>
              <span className="text-[9px] text-zinc-400 mt-1 leading-none capitalize">
                {gameMode === 'classic' && '經典特訓 🎨'}
                {gameMode === 'obstacle' && '障礙硬仗 ⛰️'}
                {gameMode === 'rush' && '速消對決 ⏰'}
              </span>
            </div>

            {/* Current Speed Level */}
            <div className="bg-rose-50/40 p-2 rounded-xl border border-rose-100 flex flex-col items-center justify-center">
              <span className="text-[9.5px] uppercase font-bold text-rose-800 flex items-center gap-0.5">
                <Flame className="w-3.5 h-3.5 text-rose-500 fill-rose-100" />
                <span>特訓速度等級</span>
              </span>
              <span className="text-xl font-mono font-black text-rose-800 mt-1">LV. {level}</span>
              <span className="text-[9px] text-zinc-400 mt-1">
                {level >= 6 ? '極限疾速 🔥' : level >= 3 ? '手腦敏捷 🍏' : '佛系悠閒 🍒'}
              </span>
            </div>

          </div>

          {/* Core play board wrapper */}
          <div className="relative bg-stone-900 text-white rounded-3xl p-4 border-[6px] border-amber-250 shadow-lg flex flex-col items-center justify-center min-h-[460px] max-w-[360px] overflow-hidden">
            
            {/* Play Grid area */}
            <div className="bg-stone-950/90 rounded-2xl p-2.5 shadow-inner border border-stone-850 justify-center">
              {renderGrid()}
            </div>

            {/* Not Playing overlay screen */}
            {!isPlaying && !isGameOver && (
              <div className="absolute inset-0 bg-stone-900/90 backdrop-blur-[3px] flex flex-col items-center justify-center text-center p-6 space-y-4">
                <span className="text-5xl block animate-bounce">🐻🌈🧁</span>
                <h4 className="font-sans font-bold text-white text-base">萌熊積木特訓營!</h4>
                <p className="text-xs text-stone-300 leading-relaxed max-w-[260px] mx-auto">
                  歡迎來到巴魯果凍箱！有多種不同的手速遊戲規則供您遊玩噢，快點擊按鈕來一局！
                </p>

                <div className="flex flex-col gap-2.5 w-full max-w-[220px]">
                  <button
                    onClick={() => startNewGame('classic')}
                    className="py-2.5 px-4 bg-amber-400 hover:bg-amber-500 text-amber-950 font-bold rounded-full text-xs transition-transform flex items-center justify-center gap-1 border-b-4 border-amber-700 shadow"
                  >
                    <span>🎯 開啟 經典消消樂</span>
                  </button>
                  <button
                    onClick={() => startNewGame('obstacle')}
                    className="py-2.5 px-4 bg-emerald-600 hover:bg-[#124b37] text-white font-bold rounded-full text-xs transition-transform flex items-center justify-center gap-1 border-b-4 border-emerald-950 shadow"
                  >
                    <span>⛰️ 開啟 頑石山嶺關卡</span>
                  </button>
                  <button
                    onClick={() => startNewGame('rush')}
                    className="py-2.5 px-4 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-full text-xs transition-transform flex items-center justify-center gap-1 border-b-4 border-rose-800 shadow"
                  >
                    <span>⏰ 開啟 120秒限時衝刺</span>
                  </button>
                </div>
              </div>
            )}

            {/* Paused state screen overlay */}
            {isPaused && (
              <div className="absolute inset-0 bg-stone-900/80 backdrop-blur-[2px] flex flex-col items-center justify-center text-center z-20 space-y-4">
                <span className="text-4xl block animate-pulse">⏸️🐻</span>
                <h3 className="font-bold text-white text-md">特訓臨時小憩中</h3>
                <p className="text-[10px] text-stone-300 max-w-[180px]">
                  巴魯給您遞上美味橡果櫻桃汁！按下方按鈕或鍵盤的「P」鍵恢復特訓吧！
                </p>
                <button
                  onClick={() => setIsPaused(false)}
                  className="py-2 px-6 bg-amber-400 text-stone-900 rounded-full font-bold text-xs border-b-4 border-amber-600 hover:bg-amber-500"
                >
                  繼續果凍拼圖
                </button>
              </div>
            )}

            {/* Game Over modal overlay */}
            {isGameOver && (
              <div className="absolute inset-0 bg-stone-950/90 backdrop-blur-[3.5px] flex flex-col items-center justify-center text-center z-30 p-6 space-y-4">
                <div className="bg-white text-stone-900 p-5 rounded-3xl border-4 border-amber-300 max-w-[280px] space-y-4 shadow-2xl">
                  {timeLeft === 0 && gameMode === 'rush' ? (
                    <div className="space-y-1.5">
                      <span className="text-4xl block animate-bounce font-serif">🍒🏆🐻</span>
                      <h4 className="font-extrabold text-amber-800 text-xs">倒計時歸零！挑戰大凱旋！</h4>
                      <p className="text-[10px] text-zinc-500 font-medium leading-relaxed">
                        小蜜蜂為您點亮了皇冠！您在限時 2 分鐘內爆發戰鬥力，共得到了 <span className="font-bold text-amber-700">{score}</span> 積分！
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <span className="text-4xl block animate-pulse">🍭💦🧱</span>
                      <h4 className="font-extrabold text-amber-800 text-xs text-balance">保鮮盒滿啦，特訓大圓滿！</h4>
                      <p className="text-[10px] text-zinc-500 font-medium leading-relaxed">
                        糖果和果凍多到塞不下囉！你本場累計消除了 <span className="font-bold text-[#1b6b4f]">{linesCleared}</span> 排，得到了 <span className="font-bold text-amber-700">{score}</span> 積分！
                      </p>
                    </div>
                  )}

                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => startNewGame(gameMode)}
                      className="w-full bg-primary text-white hover:bg-emerald-700 py-2 rounded-full text-xs font-bold border-b-4 border-emerald-950"
                    >
                      重新開始當前模式
                    </button>
                    <button
                      onClick={() => {
                        setIsGameOver(false);
                        setIsPlaying(false);
                      }}
                      className="w-full bg-stone-100 hover:bg-stone-200 py-1.5 rounded-full text-[10px] text-stone-700 font-medium"
                    >
                      返回主菜單選關
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Handy Screen touch buttons for handheld screens and accessibility layout */}
          {isPlaying && !isPaused && !isGameOver && (
            <div className="w-full max-w-[360px] bg-white border border-stone-150 p-3 rounded-2xl shadow-sm space-y-2 mt-4">
              <div className="text-[9px] text-zinc-400 text-center font-bold tracking-wider uppercase mb-1">
                手動點擊或鍵盤方向鍵 (A/W/S/D | P 暫停)
              </div>
              <div className="grid grid-cols-5 gap-1.5 justify-center">
                
                {/* Rotate Up button */}
                <button
                  onClick={rotatePiece}
                  className="p-2 bg-stone-50 active:bg-stone-200 border border-stone-200 rounded-xl flex flex-col items-center justify-center gap-0.5 active:scale-95"
                  title="旋轉鍵 (Up)"
                >
                  <ArrowUp className="w-4 h-4 text-amber-800" />
                  <span className="text-[8.5px] font-bold text-stone-500">旋轉</span>
                </button>

                {/* Left button */}
                <button
                  onClick={() => moveHorizontally(-1)}
                  className="p-2 bg-stone-50 active:bg-stone-200 border border-stone-200 rounded-xl flex flex-col items-center justify-center gap-0.5 active:scale-95"
                  title="左移 (Left)"
                >
                  <ArrowLeft className="w-4 h-4 text-stone-800" />
                  <span className="text-[8.5px] font-bold text-stone-500">左移</span>
                </button>

                {/* Soft drop down button */}
                <button
                  onClick={dropPiece}
                  className="p-2 bg-stone-50 active:bg-stone-200 border border-stone-200 rounded-xl flex flex-col items-center justify-center gap-0.5 active:scale-95"
                  title="加速下落 (Down)"
                >
                  <ArrowDown className="w-4 h-4 text-stone-800" />
                  <span className="text-[8.5px] font-bold text-stone-500">加速</span>
                </button>

                {/* Right button */}
                <button
                  onClick={() => moveHorizontally(1)}
                  className="p-2 bg-stone-50 active:bg-stone-200 border border-stone-200 rounded-xl flex flex-col items-center justify-center gap-0.5 active:scale-95"
                  title="右移 (Right)"
                >
                  <ArrowRight className="w-4 h-4 text-stone-800" />
                  <span className="text-[8.5px] font-bold text-stone-500">右移</span>
                </button>

                {/* Hard bottom drop instant button */}
                <button
                  onClick={hardDropPiece}
                  className="p-2 bg-amber-50 active:bg-amber-100 border border-amber-200 rounded-xl flex flex-col items-center justify-center gap-0.5 active:scale-95"
                  title="瞬降 (Space)"
                >
                  <RefreshCw className="w-4 h-4 text-amber-700" />
                  <span className="text-[8.5px] font-black text-amber-850">瞬降</span>
                </button>

              </div>
            </div>
          )}

        </div>

        {/* Right Mascot details / Settings column */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Bear speech box and next queue */}
          <div className="bg-white p-4 rounded-3xl border border-stone-100 shadow-sm space-y-4 relative overflow-hidden text-center flex flex-col items-center">
            
            <span className="text-[9px] font-bold text-amber-600 tracking-wider">小熊巴魯的特訓叮嚀 🐻🍬</span>
            
            <div className="min-h-[55px] w-full mt-1 flex items-center justify-center">
              <div className="text-[10px] text-amber-900 bg-amber-50/60 p-3 rounded-2xl leading-relaxed border border-amber-100 relative font-medium">
                <div className="absolute w-2.5 h-2.5 bg-amber-50/60 border-b border-l border-amber-100/60 rotate-45 -bottom-1.5 left-1/2 -translate-x-1/2" />
                <span>{bearText}</span>
              </div>
            </div>

            {/* Next Queue Piece block */}
            {isPlaying && (
              <div className="w-full bg-stone-100/50 p-2.5 rounded-2xl border border-stone-150 space-y-1.5">
                <span className="text-[9px] font-bold text-stone-400 block tracking-wider uppercase">
                  下一個果凍預告：
                </span>
                {drawNextPiecePreview()}
              </div>
            )}

            {/* mascot mood facial expressions */}
            <div className="relative pt-2">
              <div className="w-16 h-16 rounded-full border-4 border-amber-100 flex items-center justify-center text-3xl shadow-inner bg-amber-50">
                {bearMood === 'happy' && '🐻✨'}
                {bearMood === 'sad' && '🐻💧'}
                {bearMood === 'thinking' && '🐻💭'}
                {bearMood === 'fear' && '🐻😰'}
                {bearMood === 'idle' && '🐻'}
              </div>
              <span className="text-[9px] text-zinc-400 font-extrabold block mt-1">
                {bearMood === 'fear' ? '好緊張...' : bearMood === 'happy' ? '大成功！' : '加油中...'}
              </span>
            </div>

          </div>

          {/* Quick mode switches button when playing */}
          {isPlaying && (
            <div className="bg-white p-3 rounded-2xl border border-stone-100 shadow-sm text-center">
              <button
                onClick={() => {
                  setIsPlaying(false);
                  setIsPaused(false);
                  setIsGameOver(false);
                }}
                className="py-1.5 px-4 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 rounded-full font-bold text-[10px] flex items-center gap-1 transition-colors mx-auto"
              >
                <RotateCcw className="w-3 h-3" />
                <span>結束當前局，返回選關</span>
              </button>
            </div>
          )}

          {/* Guidelines / rules */}
          <div className="bg-stone-50 p-4 rounded-2xl border border-stone-100 space-y-3">
            <span className="block text-[9px] font-bold text-amber-800 uppercase tracking-widest flex items-center gap-1 border-b pb-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
              <span>萌熊糖果盒遊玩規約</span>
            </span>
            <ul className="text-[10px] text-stone-500 font-medium leading-relaxed space-y-1.5">
              <li>🍭 <strong>經典消消樂</strong>：經典的果凍方塊墜落規則。當某一行完全被繽紛糖果填滿，即可連鎖QQ消除並獲得高分積分。</li>
              <li>🍭 <strong>頑石障礙關</strong>：底部自動產生出一些無法被消除的「堅硬山石」⛰️，此外每置落 7 個方塊還會隨機出現一個山石，非常考驗收納思維！</li>
              <li>🍭 <strong>120秒計時速消</strong>：120 秒倒計時完畢前，不增加速度難度，需要瘋狂衝刺，爭取消行以解鎖櫻桃霸名！</li>
              <li>🍭 <strong>控制說明</strong>：強烈推薦在電腦案板上游玩 ➔ 方向鍵【左右】橫移，方向鍵【上】旋轉變向，方向鍵【下】加速下墜，【空格鍵】一鍵瞬降高分！</li>
            </ul>
          </div>

        </div>

      </div>

    </div>
  );
}
