/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, RotateCcw, Volume2, VolumeX, Trophy, Heart, Star, Sparkles, Zap, Award, HelpCircle, RefreshCw, Layers } from 'lucide-react';

interface Bubble {
  color: string;
  colorId: number;
}

interface Point {
  x: number;
  y: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  radius: number;
  alpha: number;
  life: number;
}

type GameState = 'idle' | 'playing' | 'paused' | 'gameover' | 'victory';
type GameMode = 'classic' | 'endless' | 'speedrun';

const BUBBLE_RADIUS = 17;
const ROW_HEIGHT = 29.5; // BUBBLE_RADIUS * 2 * sin(60) = 34 * 0.866 ~ 29.5
const GRID_COLS_EVEN = 11;
const GRID_COLS_ODD = 10;
const CANVAS_WIDTH = 440;
const CANVAS_HEIGHT = 480;
const LEFT_MARGIN = 22; // centering bubbles grid: (440 - (11 * 34)) / 2 = (440 - 374) / 2 = 33, let's adjust:
// 11 bubbles: 11 * 34 = 374. Let's make radius 18, diam 36. 
// 11 * 36 = 396. Margin = (440 - 396)/2 = 22.
// Row height for radius 18: 36 * 0.866 = 31.18.
// Let's use Radius = 18 for high visibility.

const RADIUS = 18;
const DIAMETER = RADIUS * 2;
const ROW_SPAN = RADIUS * Math.sqrt(3); // ~ 31.18

const COLORS = [
  '#f43f5e', // Strawberry Rose
  '#3b82f6', // Blueberry Ocean
  '#eab308', // Honey Lemon
  '#10b981', // Mint Leaf
  '#a855f7', // Lavender Grape
  '#f97316', // Orange Tang
];

const COLOR_NAMES = ['草莓粉', '海洋藍', '檸檬黃', '薄荷綠', '薰衣紫', '蜜柑橙'];

export default function MiniGameBubbleShooter() {
  const [gameState, setGameState] = useState<GameState>('idle');
  const [gameMode, setGameMode] = useState<GameMode>('classic');
  const [score, setScore] = useState<number>(0);
  const [hiScore, setHiScore] = useState<number>(0);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [mascotMood, setMascotMood] = useState<'chatting' | 'cheering' | 'anxious' | 'victory' | 'sad'>('chatting');
  const [mascotSpeech, setMascotSpeech] = useState<string>('小兔朵朵拿起魔法吹管，隨時預備為您吹出夢幻的彩色氣泡！兔兔衝衝衝～🐰🌸');
  const [speedrunTimer, setSpeedrunTimer] = useState<number>(90); // 90s speedrun
  const [shotsCount, setShotsCount] = useState<number>(0);
  const [isMobile, setIsMobile] = useState<boolean>(false);

  // Core Game variables stored in refs to avoid React re-render lag
  const gridRef = useRef<(Bubble | null)[][]>([]); // 15 rows of hexagonal bubbles
  const shooterRef = useRef({
    x: CANVAS_WIDTH / 2,
    y: CANVAS_HEIGHT - 35,
    angle: -Math.PI / 2, // facing up
    colorId: 0,
    nextColorId: 0,
    isShooting: false,
    bulletX: 0,
    bulletY: 0,
    bulletVx: 0,
    bulletVy: 0,
    specialType: 'normal' as 'normal' | 'rainbow' | 'bomb',
  });

  const particlesRef = useRef<Particle[]>([]);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Load High score
  useEffect(() => {
    const saved = localStorage.getItem('minigame_bubble_hiscore');
    if (saved) {
      setHiScore(parseInt(saved, 10));
    }
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Soft adorable retro-cute synthesizers for sound effects
  const playSfx = useCallback((type: 'shoot' | 'bounce' | 'pop' | 'powerup' | 'win' | 'lose' | 'click') => {
    if (!soundEnabled) return;
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();

      if (type === 'shoot') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(300, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1000, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.002, ctx.currentTime + 0.16);
        osc.start();
        osc.stop(ctx.currentTime + 0.17);
      } else if (type === 'bounce') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(400, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.08);
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.09);
        osc.start();
        osc.stop(ctx.currentTime + 0.1);
      } else if (type === 'pop') {
        // Double sweet bubbly pop sounds
        const createPop = (timeOffset: number, pitch: number) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.type = 'sine';
          osc.frequency.setValueAtTime(pitch, ctx.currentTime + timeOffset);
          osc.frequency.exponentialRampToValueAtTime(pitch * 2, ctx.currentTime + timeOffset + 0.06);
          gain.gain.setValueAtTime(0.07, ctx.currentTime + timeOffset);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + timeOffset + 0.07);
          osc.start(ctx.currentTime + timeOffset);
          osc.stop(ctx.currentTime + timeOffset + 0.08);
        };
        createPop(0, 523); // C5
        createPop(0.04, 659); // E5
      } else if (type === 'powerup') {
        const freqs = [349.23, 440, 523.25, 659.25, 880];
        freqs.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.05);
          gain.gain.setValueAtTime(0.06, ctx.currentTime + idx * 0.05);
          gain.gain.exponentialRampToValueAtTime(0.002, ctx.currentTime + idx * 0.05 + 0.15);
          osc.start(ctx.currentTime + idx * 0.05);
          osc.stop(ctx.currentTime + idx * 0.05 + 0.17);
        });
      } else if (type === 'win') {
        // Triumphant playful melody
        const arpeggio = [523.25, 659.25, 783.99, 1046.5, 1318.51, 1567.98];
        arpeggio.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.1);
          gain.gain.setValueAtTime(0.07, ctx.currentTime + idx * 0.1);
          gain.gain.exponentialRampToValueAtTime(0.002, ctx.currentTime + idx * 0.1 + 0.3);
          osc.start(ctx.currentTime + idx * 0.1);
          osc.stop(ctx.currentTime + idx * 0.1 + 0.35);
        });
      } else if (type === 'lose') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(300, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.4);
        gain.gain.setValueAtTime(0.09, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.002, ctx.currentTime + 0.42);
        osc.start();
        osc.stop(ctx.currentTime + 0.45);
      } else if (type === 'click') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.002, ctx.currentTime + 0.05);
        osc.start();
        osc.stop(ctx.currentTime + 0.06);
      }
    } catch (e) {
      console.warn('AudioContext fails safely:', e);
    }
  }, [soundEnabled]);

  const updateSpeech = useCallback((mood: typeof mascotMood, text: string) => {
    setMascotMood(mood);
    setMascotSpeech(text);
  }, []);

  // Map hexagonal row, col to exact 2D Cartesian offset canvas coordinates
  const getCartesianCoords = (row: number, col: number): Point => {
    const isOdd = row % 2 !== 0;
    const offsetLeft = isOdd ? RADIUS : 0;
    const x = LEFT_MARGIN + col * DIAMETER + RADIUS + offsetLeft;
    const y = 30 + row * ROW_SPAN + RADIUS;
    return { x, y };
  };

  // Setup bubble colors on initial launch board setup
  const initBoard = useCallback(() => {
    const grid: (Bubble | null)[][] = [];
    const initialRows = 6;
    const maxGridRows = 14;

    for (let r = 0; r < maxGridRows; r++) {
      const rowCols = r % 2 === 0 ? GRID_COLS_EVEN : GRID_COLS_ODD;
      const rowArr: (Bubble | null)[] = [];
      for (let c = 0; c < rowCols; c++) {
        if (r < initialRows) {
          // Fill top rows with random colorful magical bubbles
          const randomColorId = Math.floor(Math.random() * COLORS.length);
          rowArr.push({
            color: COLORS[randomColorId],
            colorId: randomColorId,
          });
        } else {
          rowArr.push(null);
        }
      }
      grid.push(rowArr);
    }

    gridRef.current = grid;

    // Pre-determine colors for current and next shooter bubbles
    shooterRef.current.colorId = Math.floor(Math.random() * COLORS.length);
    shooterRef.current.nextColorId = Math.floor(Math.random() * COLORS.length);
    shooterRef.current.isShooting = false;
    shooterRef.current.specialType = 'normal';
    setShotsCount(0);
  }, []);

  // Find bubble slot that is closest to coordinate (bullet landing location)
  const getNearestSlot = (x: number, y: number) => {
    let minDistance = Infinity;
    let closestRow = -1;
    let closestCol = -1;

    for (let r = 0; r < gridRef.current.length; r++) {
      const colsInRow = r % 2 === 0 ? GRID_COLS_EVEN : GRID_COLS_ODD;
      for (let c = 0; c < colsInRow; c++) {
        // Exclude filled slots
        if (gridRef.current[r][c] !== null) continue;

        const pos = getCartesianCoords(r, c);
        const dx = pos.x - x;
        const dy = pos.y - y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < minDistance) {
          minDistance = dist;
          closestRow = r;
          closestCol = c;
        }
      }
    }

    return { row: closestRow, col: closestCol };
  };

  // Get matching connected nodes via floodfill BFS algorithm
  const getConnectedMatches = (startRow: number, startCol: number, targetColorId: number) => {
    const queue: { r: number; c: number }[] = [{ r: startRow, c: startCol }];
    const visited = new Set<string>();
    const matches: { r: number; c: number }[] = [];

    const key = (r: number, c: number) => `${r},${c}`;
    visited.add(key(startRow, startCol));

    while (queue.length > 0) {
      const current = queue.shift()!;
      matches.push(current);

      const neighbors = getNeighbors(current.r, current.c);
      for (const n of neighbors) {
        const nKey = key(n.r, n.c);
        if (!visited.has(nKey)) {
          const bubble = gridRef.current[n.r]?.[n.c];
          if (bubble && (bubble.colorId === targetColorId || shooterRef.current.specialType === 'rainbow')) {
            visited.add(nKey);
            queue.push(n);
          }
        }
      }
    }

    return matches;
  };

  // Fetch 6 surrounding hexagonal neighbor coordinates relative to grid
  const getNeighbors = (row: number, col: number) => {
    const neighbors: { r: number; c: number }[] = [];
    const isOdd = row % 2 !== 0;

    // Left right offsets
    const offsets = isOdd
      ? [
          { dr: -1, dc: 0 }, { dr: -1, dc: 1 },
          { dr: 0, dc: -1 }, { dr: 0, dc: 1 },
          { dr: 1, dc: 0 }, { dr: 1, dc: 1 },
        ]
      : [
          { dr: -1, dc: -1 }, { dr: -1, dc: 0 },
          { dr: 0, dc: -1 }, { dr: 0, dc: 1 },
          { dr: 1, dc: -1 }, { dr: 1, dc: 0 },
        ];

    for (const off of offsets) {
      const nr = row + off.dr;
      const nc = col + off.dc;

      if (nr >= 0 && nr < gridRef.current.length) {
        const colsLimit = nr % 2 === 0 ? GRID_COLS_EVEN : GRID_COLS_ODD;
        if (nc >= 0 && nc < colsLimit) {
          neighbors.push({ r: nr, c: nc });
        }
      }
    }

    return neighbors;
  };

  // Drop any stray bubbles that are completely floating dis-attached from the ceiling top row
  const dropFloatingBubbles = (): { r: number; c: number }[] => {
    const rowsCount = gridRef.current.length;
    const visited = new Set<string>();
    const queue: { r: number; c: number }[] = [];

    const key = (r: number, c: number) => `${r},${c}`;

    // 1. Floodfill start point is any bubbles directly nested at top row (row == 0)
    for (let c = 0; c < GRID_COLS_EVEN; c++) {
      if (gridRef.current[0]?.[c]) {
        queue.push({ r: 0, c });
        visited.add(key(0, c));
      }
    }

    while (queue.length > 0) {
      const current = queue.shift()!;
      const neighbors = getNeighbors(current.r, current.c);

      for (const n of neighbors) {
        const nKey = key(n.r, n.c);
        if (!visited.has(nKey) && gridRef.current[n.r]?.[n.c]) {
          visited.add(nKey);
          queue.push(n);
        }
      }
    }

    // 2. Identify and pack any un-visited bubble nodes representing floating bubbles
    const dropped: { r: number; c: number }[] = [];
    for (let r = 0; r < rowsCount; r++) {
      const colsInRow = r % 2 === 0 ? GRID_COLS_EVEN : GRID_COLS_ODD;
      for (let c = 0; c < colsInRow; c++) {
        if (gridRef.current[r][c] && !visited.has(key(r, c))) {
          dropped.push({ r, c });
        }
      }
    }

    // Erase dropped bubbles from game coordinate matrix
    for (const d of dropped) {
      gridRef.current[d.r][d.c] = null;
    }

    return dropped;
  };

  // Spark pop tiny adorable circular particles
  const spawnPopParticles = (x: number, y: number, color: string, count = 8) => {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 2.8 + 1.2;
      particlesRef.current.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: color,
        radius: Math.random() * 4 + 2,
        alpha: 1.0,
        life: 1.0,  // starts full life
      });
    }
  };

  // Launch Shooter Magical Bubble
  const shootBubble = () => {
    const shoot = shooterRef.current;
    if (shoot.isShooting || gameState !== 'playing') return;

    // Play bubble shot sweet sound
    playSfx('shoot');

    shoot.isShooting = true;
    shoot.bulletX = shoot.x;
    shoot.bulletY = shoot.y;

    const bulletSpeed = 9.8;
    shoot.bulletVx = Math.cos(shoot.angle) * bulletSpeed;
    shoot.bulletVy = Math.sin(shoot.angle) * bulletSpeed;
  };

  // Swap current shooting bubble with the previewed reserve back-up bubble color
  const swapShootingBubble = () => {
    if (shooterRef.current.isShooting || gameState !== 'playing') return;
    playSfx('click');
    const b = shooterRef.current;
    const temp = b.colorId;
    b.colorId = b.nextColorId;
    b.nextColorId = temp;
    updateSpeech('chatting', `兔兔魔法吹管快速切換！下一個是 ${COLOR_NAMES[b.nextColorId]} 氣泡噢 🔮🐰`);
  };

  // Trigger Endlessly/survival shifting down row mechanics
  const shiftRowsDown = useCallback(() => {
    const grid = gridRef.current;
    
    // Check if bottom-most active row hits limit before shifting (row 12+)
    let hitOver = false;
    const colCountCheck = grid[12] ? grid[12].length : 0;
    for (let c = 0; c < colCountCheck; c++) {
      if (grid[12]?.[c] !== null) {
        hitOver = true;
      }
    }

    if (hitOver) {
      setGameState('gameover');
      playSfx('lose');
      updateSpeech('sad', '氣泡疊得太高，壓垮了朵朵的花果架，大作戰結束了哦～ 😭🐰');
      return;
    }

    // Shift bottom rows downwards by inserting random new colors row at top
    // Since row shift alters honeycomb layout (Even column swap), we must shift with even/odd indexes.
    const newTopRow: (Bubble | null)[] = [];
    const rndCols = GRID_COLS_EVEN; // top is always even index row as row 0

    for (let c = 0; c < rndCols; c++) {
      const randomColorId = Math.floor(Math.random() * COLORS.length);
      newTopRow.push({
        color: COLORS[randomColorId],
        colorId: randomColorId,
      });
    }

    // Shift arrays
    grid.pop(); // discard bottom row
    grid.unshift(newTopRow); // shift current layout downward

    // Since we unshift row, the evenness of other rows swaps, let's make sure dimensions align
    // The sizes of rows must alternate. e.g. Row 0: 11, Row 1: 10, etc.
    // Let's sweep array and trim columns so index row 0 has 11, row 1 has 10, row 2 has 11, etc.
    for (let r = 0; r < grid.length; r++) {
      const targetCols = r % 2 === 0 ? GRID_COLS_EVEN : GRID_COLS_ODD;
      if (grid[r].length > targetCols) {
        grid[r] = grid[r].slice(0, targetCols);
      } else if (grid[r].length < targetCols) {
        while (grid[r].length < targetCols) {
          grid[r].push(null);
        }
      }
    }

    playSfx('bounce');
    updateSpeech('anxious', '不好了！氣泡雲往下壓了一格，朵朵有些小緊張，抓緊清除它們！💥🐰');
  }, [playSfx, updateSpeech]);

  // Main animation updates & canvas renderer
  useEffect(() => {
    let animationFrameId: number;

    const mainLoop = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // 1. Move active shooter bullet bullet
      const shoot = shooterRef.current;
      if (shoot.isShooting) {
        shoot.bulletX += shoot.bulletVx;
        shoot.bulletY += shoot.bulletVy;

        // Bounce left right boundary wall borders
        if (shoot.bulletX - RADIUS < 10) {
          shoot.bulletX = 10 + RADIUS;
          shoot.bulletVx = -shoot.bulletVx;
          playSfx('bounce');
        }
        if (shoot.bulletX + RADIUS > CANVAS_WIDTH - 10) {
          shoot.bulletX = CANVAS_WIDTH - 10 - RADIUS;
          shoot.bulletVx = -shoot.bulletVx;
          playSfx('bounce');
        }

        // Top ceiling border check
        let isCollided = false;
        if (shoot.bulletY - RADIUS < 20) {
          isCollided = true;
        }

        // Grid collision check against existing bubble circles
        if (!isCollided) {
          outerLoop: for (let r = 0; r < gridRef.current.length; r++) {
            const colsLimit = r % 2 === 0 ? GRID_COLS_EVEN : GRID_COLS_ODD;
            for (let c = 0; c < colsLimit; c++) {
              const b = gridRef.current[r][c];
              if (b !== null) {
                const pos = getCartesianCoords(r, c);
                const dx = pos.x - shoot.bulletX;
                const dy = pos.y - shoot.bulletY;
                const distance = Math.sqrt(dx * dx + dy * dy);

                // Check collision radius overlap tolerance limit (slightly tighter to feel satisfying)
                if (distance < DIAMETER - 3) {
                  isCollided = true;
                  break outerLoop;
                }
              }
            }
          }
        }

        // On Collision (Lands in grid)
        if (isCollided) {
          shoot.isShooting = false;

          // Align bubble perfectly into closest vacant honeycomb cell coordinate
          const { row, col } = getNearestSlot(shoot.bulletX, shoot.bulletY);

          if (row !== -1 && col !== -1) {
            // Apply landing to grid matrix
            const bubbleColorId = shoot.colorId;
            gridRef.current[row][col] = {
              color: COLORS[bubbleColorId],
              colorId: bubbleColorId,
            };

            // BFS find connected popping groups
            const matchedList = getConnectedMatches(row, col, bubbleColorId);

            if (matchedList.length >= 3) {
              // 1. Spark pop audio
              playSfx('pop');

              // 2. Erase popped bubbles and create sweet splash particles
              let popReward = 0;
              for (const m of matchedList) {
                const bubbleObj = gridRef.current[m.r][m.c];
                if (bubbleObj) {
                  const pos = getCartesianCoords(m.r, m.c);
                  spawnPopParticles(pos.x, pos.y, bubbleObj.color, 9);
                }
                gridRef.current[m.r][m.c] = null;
                popReward += 100;
              }

              // 3. Drop disconnected floats
              const droppedList = dropFloatingBubbles();
              let dropReward = 0;
              for (const dr of droppedList) {
                const pos = getCartesianCoords(dr.r, dr.c);
                spawnPopParticles(pos.x, pos.y, '#e4e4e7', 4); // gray smoke dust for drop
                dropReward += 200; // floating double bonuses
              }

              // Increment totals scores
              setScore(prev => {
                const add = popReward + dropReward;
                const next = prev + add;
                if (next > hiScore) {
                  setHiScore(next);
                  localStorage.setItem('minigame_bubble_hiscore', next.toString());
                }
                return next;
              });

              // Play cheerful responses depending on batch popped sizes
              if (matchedList.length >= 6 || droppedList.length > 0) {
                updateSpeech('cheering', `哇！大爆發！瞬間清空了大片氣泡，獲得了 ${popReward + dropReward} 分！兔兔瘋狂為您鼓掌！🐰✨💖`);
              } else {
                updateSpeech('cheering', '幹得好！完美的魔法碰撞！🎈🐰');
              }
            } else {
              // Increment global shot count used for survival endless rows descending timers
              setShotsCount(prev => {
                const val = prev + 1;
                // Every 5 missed pop clearing shots, drop rows
                if (gameMode === 'endless' && val % 5 === 0) {
                  shiftRowsDown();
                }
                return val;
              });

              // Check if newly landed bubble triggers Gameover limits
              if (row >= 13) {
                setGameState('gameover');
                playSfx('lose');
                updateSpeech('sad', '唔，氣泡疊得太低，壓垮了朵朵的花果架，大作戰結束了哦～ 😭🐰');
              }
            }

            // Check if board Classic mode is finished (victory)
            let remainingCount = 0;
            for (let r = 0; r < gridRef.current.length; r++) {
              const colsLimit = r % 2 === 0 ? GRID_COLS_EVEN : GRID_COLS_ODD;
              for (let c = 0; c < colsLimit; c++) {
                if (gridRef.current[r][c] !== null) remainingCount++;
              }
            }

            if (gameMode === 'classic' && remainingCount === 0) {
              setGameState('victory');
              playSfx('win');
              updateSpeech('victory', '大勝利！花園裏所有的彩色氣泡都被我們消滅乾淨啦！太愛你啦！🏆🎖️🐰🌸');
            }
          }

          // Reload launcher bubble queue colors
          shoot.colorId = shoot.nextColorId;
          shoot.nextColorId = Math.floor(Math.random() * COLORS.length);
        }
      }

      // 2. Clear + Draw Canvas Playground
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Pretty paper garden backdrop frame outline border
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(8, 8, CANVAS_WIDTH - 16, CANVAS_HEIGHT - 16);

      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 4;
      ctx.strokeRect(8, 8, CANVAS_WIDTH - 16, CANVAS_HEIGHT - 16);

      // Soft decorative flower fields graphic background dots
      ctx.fillStyle = '#fdf2f8';
      for (let px = 30; px < CANVAS_WIDTH; px += 40) {
        for (let py = 30; py < CANVAS_HEIGHT; py += 40) {
          ctx.beginPath();
          ctx.arc(px, py, 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // 3. Draw grid bubbles
      for (let r = 0; r < gridRef.current.length; r++) {
        const colsLimit = r % 2 === 0 ? GRID_COLS_EVEN : GRID_COLS_ODD;
        for (let c = 0; c < colsLimit; c++) {
          const b = gridRef.current[r][c];
          if (b !== null) {
            const pos = getCartesianCoords(r, c);

            // Draw glossy circular sweet magical bubble ball
            ctx.fillStyle = b.color;
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, RADIUS - 1, 0, Math.PI * 2);
            ctx.fill();

            // White glaze high gloss reflections
            ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
            ctx.beginPath();
            ctx.arc(pos.x - 5, pos.y - 5, 4, 0, Math.PI * 2);
            ctx.fill();

            // Soft radial shadow/glow effect
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      // 4. Draw aiming dotted trajectory guide projection line when in playing
      if (gameState === 'playing' && !shoot.isShooting) {
        ctx.strokeStyle = 'rgba(236, 72, 153, 0.35)'; // Pink dash line
        ctx.lineWidth = 2.5;
        ctx.setLineDash([6, 6]);

        ctx.beginPath();
        ctx.moveTo(shoot.x, shoot.y);
        // Cast a nice long aiming target pointer
        const aimLength = 160;
        const targetX = shoot.x + Math.cos(shoot.angle) * aimLength;
        const targetY = shoot.y + Math.sin(shoot.angle) * aimLength;
        ctx.lineTo(targetX, targetY);
        ctx.stroke();
        ctx.setLineDash([]); // Reset line dashes

        // Tiny aiming soft dot circle
        ctx.fillStyle = '#ec4899';
        ctx.beginPath();
        ctx.arc(targetX, targetY, 4, 0, Math.PI * 2);
        ctx.fill();
      }

      // 5. Draw active floating particles
      const particles = particlesRef.current;
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.08; // subtle downward gravity
        p.life -= 0.035; // fade away speed

        if (p.life <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0; // Reset canvas transparency
      }

      // 6. Draw incoming/shooting bullet on the fly
      if (shoot.isShooting) {
        const bulletColor = COLORS[shoot.colorId];
        ctx.fillStyle = bulletColor;
        ctx.beginPath();
        ctx.arc(shoot.bulletX, shoot.bulletY, RADIUS - 1, 0, Math.PI * 2);
        ctx.fill();

        // White shine
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.beginPath();
        ctx.arc(shoot.bulletX - 5, shoot.bulletY - 5, 4, 0, Math.PI * 2);
        ctx.fill();
      }

      // 7. Render shooter base mechanism panel (Cute magical Bunny bubble blower shape)
      ctx.fillStyle = '#fce7f3'; // pastel pink flower stand base
      ctx.beginPath();
      ctx.arc(shoot.x, shoot.y + 15, 26, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#db2777';
      ctx.lineWidth = 1.8;
      ctx.stroke();

      // Outer golden gear
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(shoot.x, shoot.y + 15, 30, 0, Math.PI * 2);
      ctx.stroke();

      // Draw pointer blower pipe nozzle
      ctx.save();
      ctx.translate(shoot.x, shoot.y);
      ctx.rotate(shoot.angle);
      
      // Little blower pipe
      ctx.fillStyle = '#db2777';
      ctx.fillRect(0, -7, 34, 14);

      ctx.fillStyle = '#f472b6';
      ctx.fillRect(28, -9, 9, 18); // pipe head
      
      ctx.restore();

      // Draw inside preview shooter bead inside blower
      if (!shoot.isShooting) {
        const currentBubbleColor = COLORS[shoot.colorId];
        ctx.fillStyle = currentBubbleColor;
        ctx.beginPath();
        ctx.arc(shoot.x, shoot.y, RADIUS - 1, 0, Math.PI * 2);
        ctx.fill();

        // White reflection
        ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
        ctx.beginPath();
        ctx.arc(shoot.x - 5, shoot.y - 5, 4, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw queue preview reserve bubble nearby next stand
      const queueX = shoot.x - 70;
      const queueY = shoot.y + 15;
      ctx.fillStyle = '#e2e8f0';
      ctx.beginPath();
      ctx.arc(queueX, queueY, RADIUS + 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      const reserveBubbleColor = COLORS[shoot.nextColorId];
      ctx.fillStyle = reserveBubbleColor;
      ctx.beginPath();
      ctx.arc(queueX, queueY, RADIUS - 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.beginPath();
      ctx.arc(queueX - 3, queueY - 3, 3.5, 0, Math.PI * 2);
      ctx.fill();

      // Swapping button text hint tag
      ctx.fillStyle = '#64748b';
      ctx.font = 'bold 9px "Inter", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('交換 ⇅', queueX, queueY + RADIUS + 16);

      // 8. Warning ceiling line (danger warning line at row 12 coordinates)
      // Any bubbles crossed this boundary line triggers warning
      const warnY = 30 + 12 * ROW_SPAN + RADIUS + 12;
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.35)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(10, warnY);
      ctx.lineTo(CANVAS_WIDTH - 10, warnY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw "DEADLINE" text nearby
      ctx.fillStyle = 'rgba(239, 68, 68, 0.55)';
      ctx.font = 'bold 9px "Inter", sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText('安全防禦線 ☠', CANVAS_WIDTH - 15, warnY - 5);

      animationFrameId = requestAnimationFrame(mainLoop);
    };

    animationFrameId = requestAnimationFrame(mainLoop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [gameState, gameMode, playSfx, shiftRowsDown, updateSpeech]);

  // Key direction aiming controllers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const b = shooterRef.current;
      const angleSpeed = 0.055;

      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        b.angle = Math.max(-Math.PI + 0.2, b.angle - angleSpeed);
      }
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        b.angle = Math.min(-0.2, b.angle + angleSpeed);
      }
      if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        shootBubble();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState]);

  // Speedrun game countdown ticked
  useEffect(() => {
    if (gameState !== 'playing' || gameMode !== 'speedrun') return;

    const t = setInterval(() => {
      setSpeedrunTimer(prev => {
        if (prev <= 1) {
          clearInterval(t);
          setGameState('victory');
          playSfx('win');
          updateSpeech('victory', `時間到！您完成魔法兔限時爆破特訓！共獲取了 ${score} 頂尖美味積分！🎖️🐰🍓`);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(t);
  }, [gameState, gameMode, playSfx, score, updateSpeech]);

  // Quick initiate game parameters on round click
  const startGame = (mode: GameMode = 'classic') => {
    playSfx('click');
    setGameMode(mode);
    setScore(0);
    setSpeedrunTimer(90);
    initBoard();
    setGameState('playing');
    updateSpeech('cheering', `「${mode === 'classic' ? '經典奇幻盤' : mode === 'endless' ? '無盡泡泡雨' : '90秒大對決'}」啟動！請移動滑鼠進行瞄準，點擊即可發射露珠！🎯🐰🌸`);
  };

  // Drag moving or slider mouse aiming events
  const handlePointerAim = (clientX: number, rectLeft: number, rectWidth: number) => {
    if (gameState !== 'playing') return;
    const shoot = shooterRef.current;
    
    // Calculate aiming angle vector relative to center blower
    const relativeX = ((clientX - rectLeft) / rectWidth) * CANVAS_WIDTH;
    const dx = relativeX - shoot.x;
    // Aiming goes vertically upwards, y-offset is negative
    const dy = -300; // artificial high focal length offset
    
    const angle = Math.atan2(dy, dx);
    // Limit angle to prevent shooting downward or horizontally too shallow
    shoot.angle = Math.max(-Math.PI + 0.15, Math.min(-0.15, angle));
  };

  return (
    <div id="bubble-shooter-view" className="w-full max-w-5xl mx-auto px-1 py-4 md:p-6 text-gray-800">
      
      {/* Game Layout Main Column grids */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-rose-50/40 border-4 border-rose-100/80 rounded-3xl p-4 md:p-6 shadow-xl relative overflow-hidden backdrop-blur-md">
        
        {/* Left Side: Instructions, rabbits quotes & controls panel */}
        <div className="lg:col-span-4 flex flex-col justify-between space-y-5">
          <div>
            {/* Header Identity */}
            <div className="flex items-center space-x-3 bg-white p-3 rounded-2xl border-2 border-rose-100 shadow-sm">
              <div className="bg-rose-500 p-2.5 rounded-xl text-white">
                <Sparkles className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800 tracking-tight">萌兔花園氣泡彈</h2>
                <p className="text-xs text-rose-500 font-mono">DuoDuo Garden Bubble</p>
              </div>
            </div>

            {/* Rabbit Rabbit DuoDuo Mascot Reaction panel */}
            <div className="mt-5 bg-white rounded-2xl border-2 border-rose-100 p-4 relative shadow-sm">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 relative">
                  <div className="w-14 h-14 rounded-full bg-rose-100 border-2 border-rose-300 flex items-center justify-center text-3xl shadow-inner animate-bounce">
                    {mascotMood === 'cheering' && '🐰'}
                    {mascotMood === 'anxious' && '🥺'}
                    {mascotMood === 'sad' && '😿'}
                    {mascotMood === 'victory' && '👑'}
                    {mascotMood === 'chatting' && '🐰'}
                  </div>
                  <span className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full flex items-center justify-center">
                    <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></span>
                  </span>
                </div>
                <div className="flex-1 bg-rose-50/70 rounded-xl p-3 border border-rose-100">
                  <div className="text-xs font-bold text-rose-800 mb-0.5">花園萌兔朵朵：</div>
                  <p className="text-gray-700 text-xs leading-relaxed">{mascotSpeech}</p>
                </div>
              </div>
            </div>

            {/* Challenge Mode Selections */}
            <div className="mt-5 bg-white rounded-2xl border-2 border-rose-100 p-4 shadow-sm">
              <h3 className="text-xs font-bold text-rose-800 mb-2.5 flex items-center">
                <Layers className="w-4 h-4 mr-1 text-rose-500" /> 選擇玩法特訓形式：
              </h3>
              <div className="grid grid-cols-1 gap-2.5">
                <button
                  id="mode-classic-btn"
                  onClick={() => startGame('classic')}
                  className={`w-full py-2.5 px-3.5 rounded-xl text-left border-2 duration-200 text-xs flex justify-between items-center ${
                    gameMode === 'classic' && gameState !== 'idle'
                      ? 'bg-rose-500 border-rose-500 text-white shadow-md'
                      : 'bg-rose-50 border-rose-100 text-rose-800 hover:bg-rose-100/50'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Star className="w-4 h-4" />
                    <strong>經典奇幻盤 (Classic)</strong>
                  </div>
                  <span className="text-[10px] opacity-90">清除全部</span>
                </button>

                <button
                  id="mode-endless-btn"
                  onClick={() => startGame('endless')}
                  className={`w-full py-2.5 px-3.5 rounded-xl text-left border-2 duration-200 text-xs flex justify-between items-center ${
                    gameMode === 'endless' && gameState !== 'idle'
                      ? 'bg-amber-500 border-amber-500 text-white shadow-md'
                      : 'bg-amber-50 border-amber-100 text-amber-800 hover:bg-amber-100/40'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Zap className="w-4 h-4" />
                    <strong>無盡意境雨 (Endless)</strong>
                  </div>
                  <span className="text-[10px] opacity-90">泡泡緩慢下移</span>
                </button>

                <button
                  id="mode-speedrun-btn"
                  onClick={() => startGame('speedrun')}
                  className={`w-full py-2.5 px-3.5 rounded-xl text-left border-2 duration-200 text-xs flex justify-between items-center ${
                    gameMode === 'speedrun' && gameState !== 'idle'
                      ? 'bg-[#a855f7] border-[#a855f7] text-white shadow-md'
                      : 'bg-[#faf5ff] border-[#f3e8ff] text-purple-800 hover:bg-purple-100/40'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Trophy className="w-4 h-4" />
                    <strong>90秒大對決 (Speedrun)</strong>
                  </div>
                  <span className="text-[10px] opacity-90">限時拿高分</span>
                </button>
              </div>
            </div>
          </div>

          {/* Quick Guidance Box */}
          <div className="bg-rose-50 rounded-2xl border border-rose-100/60 p-3.5 text-xs text-rose-950 shadow-sm leading-relaxed">
            <div className="font-bold flex items-center text-rose-900 mb-1">
              <HelpCircle className="w-4 h-4 mr-1 text-rose-500" /> 花園特訓操作法：
            </div>
            <p>• 移動滑鼠或用手指在畫布上<strong>左右滑動</strong>來決定瞄準的角度。</p>
            <p>• <strong>單擊左鍵或點按發射</strong>即可投擲氣泡珠。</p>
            <p>• 連結達到 <strong>3 個或以上同色氣泡</strong>即可引發彩色大爆炸！</p>
          </div>
        </div>

        {/* Center column: Main high-performance canvas area */}
        <div className="lg:col-span-8 flex flex-col items-center">
          
          {/* Header scores bar */}
          <div className="w-full flex items-center justify-between bg-white px-5 py-3 rounded-2xl border-2 border-rose-100 shadow-sm mb-4">
            <div className="flex items-center space-x-4">
              <div>
                <span className="text-[10px] text-gray-400 block uppercase tracking-wider font-semibold">當前積分</span>
                <span className="text-xl font-black font-mono text-rose-500">{score}</span>
              </div>
              <div className="border-l border-rose-100 h-8"></div>
              <div>
                <span className="text-[10px] text-gray-400 block uppercase tracking-wider font-semibold">最高特訓紀錄</span>
                <span className="text-sm font-bold font-mono text-gray-600">{hiScore}</span>
              </div>
            </div>

            {/* Countdown layout for speedrun mode */}
            {gameMode === 'speedrun' && gameState === 'playing' && (
              <div className="bg-purple-50 text-purple-600 font-bold px-3 py-1.5 rounded-xl border border-purple-200 font-mono text-xs animate-pulse">
                ⏰ 限時：{speedrunTimer} 秒
              </div>
            )}

            {/* Endless trigger indicator */}
            {gameMode === 'endless' && gameState === 'playing' && (
              <div className="bg-amber-50 text-amber-700 font-bold px-3.5 py-1.5 rounded-xl border border-amber-200 font-mono text-xs">
                🚨 泡泡下壓倒數: {5 - (shotsCount % 5)} 次發射
              </div>
            )}

            <div className="flex items-center space-x-2">
              {/* Sound Option Toggle */}
              <button
                onClick={() => setSoundEnabled(prev => !prev)}
                className="p-2.5 rounded-xl bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-900 border border-gray-200 transition-colors"
                title={soundEnabled ? '靜音' : '開啟音效'}
              >
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Interactive Bubble Canvas */}
          <div
            id="bubble-canvas-container"
            className="relative overflow-hidden rounded-3xl bg-white border-4 border-rose-50 shadow-md touch-none"
            style={{ width: `${CANVAS_WIDTH}px`, height: `${CANVAS_HEIGHT}px` }}
            onMouseMove={(e) => {
              const bounds = e.currentTarget.getBoundingClientRect();
              handlePointerAim(e.clientX, bounds.left, bounds.width);
            }}
            onTouchMove={(e) => {
              if (e.touches.length > 0) {
                const bounds = e.currentTarget.getBoundingClientRect();
                handlePointerAim(e.touches[0].clientX, bounds.left, bounds.width);
              }
            }}
            onClick={shootBubble}
          >
            <canvas
              ref={canvasRef}
              width={CANVAS_WIDTH}
              height={CANVAS_HEIGHT}
              className="absolute inset-0 block w-full h-full cursor-crosshair"
            />

            {/* In-game overlay modules */}
            <AnimatePresence>
              {gameState === 'idle' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-white/95 flex flex-col items-center justify-center p-6 text-center z-10"
                >
                  <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center text-4xl mb-4 shadow-md animate-pulse">
                    🎈🐰
                  </div>
                  <h3 className="text-2xl font-black text-rose-600 mb-2">萌兔花園氣泡彈</h3>
                  <p className="text-xs text-gray-500 max-w-xs mb-6">
                    與勇敢的兔子朵朵一起，吹發彩色夢幻氣泡拼湊魔法！點擊下方開始按鈕與多姿多彩的森林花粉來一場精彩特訓吧！
                  </p>
                  <button
                    id="initiate-play-btn"
                    onClick={() => startGame(gameMode)}
                    className="py-3 px-8 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-2xl shadow-md transition-all scale-100 active:scale-95 text-sm flex items-center space-x-1.5"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>開始特訓氣泡</span>
                  </button>
                </motion.div>
              )}

              {gameState === 'gameover' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-white/95 flex flex-col items-center justify-center p-6 text-center z-10"
                >
                  <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center text-4xl mb-4 shadow-md">
                    😭
                  </div>
                  <h3 className="text-2xl font-bold text-red-600 mb-1">特訓結束啦</h3>
                  <div className="text-gray-500 text-xs mb-5">累積總得分: {score} 積分</div>
                  <p className="text-xs text-gray-500 max-w-xs mb-6 leading-relaxed">
                    彩色氣泡壓平了朵朵的花果草莓堆，但朵朵覺得你表現得特別勇敢喔！
                  </p>
                  <div className="flex flex-col sm:flex-row space-y-2.5 sm:space-y-0 sm:space-x-3 w-full max-w-xs">
                    <button
                      id="gameover-retry-btn"
                      onClick={() => startGame(gameMode)}
                      className="flex-1 py-3 bg-rose-500 hover:bg-rose-600 font-bold text-white rounded-2xl shadow-md flex items-center justify-center space-x-1 duration-200 text-xs"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>重新特訓</span>
                    </button>
                    <button
                      onClick={() => {
                        playSfx('click');
                        setGameState('idle');
                      }}
                      className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-2xl border duration-200 text-xs"
                    >
                      返回主屏
                    </button>
                  </div>
                </motion.div>
              )}

              {gameState === 'victory' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-white/95 flex flex-col items-center justify-center p-6 text-center z-10"
                >
                  <div className="w-16 h-16 bg-yellow-50 text-yellow-500 rounded-full flex items-center justify-center text-4xl mb-3 shadow-md animate-bounce">
                    🏆
                  </div>
                  <h3 className="text-2xl font-black text-[#d97706] mb-1">大獲全勝！</h3>
                  <div className="text-rose-500 font-mono text-sm font-semibold mb-4">
                    最終完美消除積分: {score} 點
                  </div>
                  <p className="text-xs text-gray-500 max-w-xs mb-6">
                    小兔朵朵在溫暖和煦的陽光花園裏開心地打起滾來，所有漫天亂舞的泡泡都被驅散啦！🌸🐰🌷
                  </p>
                  <div className="flex flex-col sm:flex-row space-y-2.5 sm:space-y-0 sm:space-x-3 w-full max-w-xs">
                    <button
                      id="victory-retry-btn"
                      onClick={() => startGame(gameMode)}
                      className="flex-1 py-3 bg-rose-500 hover:bg-rose-600 font-bold text-white rounded-2xl shadow-md flex items-center justify-center space-x-1 duration-200 text-xs"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>再挑戰一次</span>
                    </button>
                    <button
                      onClick={() => {
                        playSfx('click');
                        setGameState('idle');
                      }}
                      className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-2xl border duration-200 text-xs"
                    >
                      返回主頁
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Shooting swap secondary actions interface below canvas */}
          <div className="w-full max-w-[440px] grid grid-cols-4 gap-3 mt-4">
            <button
              id="bubble-shoot-trigger"
              onClick={shootBubble}
              disabled={gameState !== 'playing' || shooterRef.current.isShooting}
              className="col-span-2 py-3.5 bg-rose-500 hover:bg-rose-600 disabled:opacity-40 font-bold text-white rounded-2xl shadow-sm text-xs transition-all flex items-center justify-center space-x-1 active:scale-95"
            >
              <Zap className="w-4 h-4 animate-bounce" />
              <span>點擊發射魔法泡泡！</span>
            </button>

            <button
              id="bubble-swap-trigger"
              onClick={swapShootingBubble}
              disabled={gameState !== 'playing'}
              className="col-span-1 py-3.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-2xl text-xs flex items-center justify-center space-x-1"
              title="與備用氣泡交換顏色"
            >
              <span>交換 (Swap)</span>
            </button>

            <button
              id="game-reset-trigger"
              onClick={() => startGame(gameMode)}
              className="col-span-1 py-3.5 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-2xl text-xs font-bold border flex items-center justify-center space-x-1"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>重開</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
