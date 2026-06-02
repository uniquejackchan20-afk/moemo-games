/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, RotateCcw, Volume2, VolumeX, Trophy, Heart, Star, Sparkles, Undo, Shuffle, ArrowUpCircle, HelpCircle, Layers, ShieldCheck, Award, Zap } from 'lucide-react';

interface TileType {
  id: number;
  emoji: string;
  name: string;
  blessing: string;
  color: string;
  borderColor: string;
}

interface Tile {
  id: string;
  typeId: number;
  x: number;
  y: number;
  layer: number;
  status: 'board' | 'tray' | 'bench' | 'eliminated';
  uniqueKey: number; // for Framer Motion animation stability
}

type GameState = 'idle' | 'playing' | 'victory' | 'gameover';
type Difficulty = 'easy' | 'medium' | 'hard';

const TILE_WIDTH = 54;
const TILE_HEIGHT = 62;

// 10 auspicious traditional Chinese theme tile types with cute meanings
const TILE_TYPES: TileType[] = [
  { id: 0, emoji: '🍅', name: '柿子', blessing: '柿柿如意', color: 'bg-orange-50', borderColor: 'border-orange-200 text-orange-600' },
  { id: 1, emoji: '🍊', name: '桔子', blessing: '大吉大利', color: 'bg-amber-50', borderColor: 'border-amber-200 text-amber-600' },
  { id: 2, emoji: '🍎', name: '蘋果', blessing: '平平安安', color: 'bg-rose-50', borderColor: 'border-rose-200 text-rose-600' },
  { id: 3, emoji: '🍑', name: '仙桃', blessing: '福壽安康', color: 'bg-pink-50', borderColor: 'border-pink-200 text-pink-600' },
  { id: 4, emoji: '🥜', name: '花生', blessing: '花開富貴', color: 'bg-yellow-50', borderColor: 'border-yellow-200 text-yellow-600' },
  { id: 5, emoji: '🥟', name: '餃子', blessing: '招財進寶', color: 'bg-stone-50', borderColor: 'border-stone-200 text-stone-600' },
  { id: 6, emoji: '🥮', name: '月餅', blessing: '花好月圓', color: 'bg-amber-100/40', borderColor: 'border-amber-300 text-amber-700' },
  { id: 7, emoji: '🍵', name: '香茗', blessing: '清新愜意', color: 'bg-emerald-50', borderColor: 'border-emerald-200 text-emerald-600' },
  { id: 8, emoji: '🎋', name: '翠竹', blessing: '節節高升', color: 'bg-green-50', borderColor: 'border-green-200 text-green-600' },
  { id: 9, emoji: '🌰', name: '毛栗', blessing: '躚躚起舞', color: 'bg-amber-50', borderColor: 'border-amber-200/80 text-amber-800' },
];

export default function MiniGameTileMatching() {
  const [gameState, setGameState] = useState<GameState>('idle');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [score, setScore] = useState<number>(0);
  const [hiScore, setHiScore] = useState<number>(0);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  
  // Game state representation
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [tray, setTray] = useState<Tile[]>([]);
  const [bench, setBench] = useState<Tile[]>([]); // "移出" items holder
  
  // Booster counts
  const [undoCount, setUndoCount] = useState<number>(1);
  const [benchCount, setBenchCount] = useState<number>(1);
  const [shuffleCount, setShuffleCount] = useState<number>(1);

  // Mascot interactions
  const [mascotMood, setMascotMood] = useState<'chatting' | 'cheering' | 'anxious' | 'victory' | 'sad'>('chatting');
  const [mascotSpeech, setMascotSpeech] = useState<string>('大吉大利！吾乃招財小松鼠「阿吉」，特來助你破解這柿柿疊疊消之局。每一消皆是如意祥瑞喔～ 🐿️🍊');

  // Track history for UNDO function
  const lastActionRef = useRef<Tile | null>(null);

  // Load high score
  useEffect(() => {
    const saved = localStorage.getItem('minigame_tile_matching_hiscore');
    if (saved) {
      setHiScore(parseInt(saved, 10));
    }
  }, []);

  // Soft adorable traditional-style synths
  const playSfx = useCallback((type: 'click' | 'place' | 'match' | 'powerup' | 'win' | 'lose' | 'error') => {
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
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.05);
        gain.gain.setValueAtTime(0.06, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);
        osc.start();
        osc.stop(ctx.currentTime + 0.07);
      } else if (type === 'place') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(392, ctx.currentTime); // G4
        osc.frequency.exponentialRampToValueAtTime(587.33, ctx.currentTime + 0.08);
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.09);
        osc.start();
        osc.stop(ctx.currentTime + 0.1);
      } else if (type === 'match') {
        // Bright Pentatonic Chinese chime
        const melody = [523.25, 587.33, 659.25, 783.99, 880]; // C, D, E, G, A
        melody.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.04);
          gain.gain.setValueAtTime(0.07, ctx.currentTime + idx * 0.04);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.04 + 0.15);
          osc.start(ctx.currentTime + idx * 0.04);
          osc.stop(ctx.currentTime + idx * 0.04 + 0.2);
        });
      } else if (type === 'powerup') {
        const freqs = [330, 440, 554, 660, 880];
        freqs.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.06);
          gain.gain.setValueAtTime(0.05, ctx.currentTime + idx * 0.06);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.06 + 0.18);
          osc.start(ctx.currentTime + idx * 0.06);
          osc.stop(ctx.currentTime + idx * 0.06 + 0.22);
        });
      } else if (type === 'win') {
        // Grand festive melody (Chinese Pentatonic theme)
        const notes = [523.25, 659.25, 587.33, 783.99, 659.25, 880, 1046.5];
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.12);
          gain.gain.setValueAtTime(0.08, ctx.currentTime + idx * 0.12);
          gain.gain.exponentialRampToValueAtTime(0.002, ctx.currentTime + idx * 0.12 + 0.25);
          osc.start(ctx.currentTime + idx * 0.12);
          osc.stop(ctx.currentTime + idx * 0.12 + 0.3);
        });
      } else if (type === 'lose') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(261.63, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(130.81, ctx.currentTime + 0.45);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.47);
        osc.start();
        osc.stop(ctx.currentTime + 0.5);
      } else if (type === 'error') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(180, ctx.currentTime);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.002, ctx.currentTime + 0.15);
        osc.start();
        osc.stop(ctx.currentTime + 0.18);
      }
    } catch (e) {
      console.warn('AudioContext Failsafe:', e);
    }
  }, [soundEnabled]);

  const updateSpeech = useCallback((mood: typeof mascotMood, text: string) => {
    setMascotMood(mood);
    setMascotSpeech(text);
  }, []);

  // Check if tile is covered by any tile in a higher layer that overlaps it
  const isTileBlocked = useCallback((tile: Tile, allTiles: Tile[]): boolean => {
    if (tile.status !== 'board') return false;

    return allTiles.some(other => {
      if (other.id === tile.id) return false;
      if (other.status !== 'board') return false;
      if (other.layer <= tile.layer) return false;

      // Overlap bounding box checks with a generous tolerance size (width=54, height=62, overlap bounds)
      const xOverlap = Math.abs(tile.x - other.x) < TILE_WIDTH - 6;
      const yOverlap = Math.abs(tile.y - other.y) < TILE_HEIGHT - 6;

      return xOverlap && yOverlap;
    });
  }, []);

  // Layout generators based on difficulty setting
  const generateLevel = useCallback((diff: Difficulty) => {
    const list: Tile[] = [];
    let uniqueCounter = 0;

    let totalPairsNeed = 0;
    let allowedTypes: number[] = [];
    let layersCount = 0;

    if (diff === 'easy') {
      // 6 types * 3 = 18 tiles
      totalPairsNeed = 6; 
      allowedTypes = [0, 1, 2, 3, 4, 5];
      layersCount = 2;
    } else if (diff === 'medium') {
      // 8 types * 6 = 48 tiles
      totalPairsNeed = 16;
      allowedTypes = [0, 1, 2, 3, 4, 5, 6, 7];
      layersCount = 3;
    } else {
      // 10 types * 9 = 90 tiles! Heavy stack
      totalPairsNeed = 30; // 30 triplets = 90 tiles
      allowedTypes = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
      layersCount = 4;
    }

    // Generate random triplets list of Types
    const pool: number[] = [];
    for (let i = 0; i < totalPairsNeed; i++) {
      const typeId = allowedTypes[i % allowedTypes.length];
      pool.push(typeId, typeId, typeId);
    }

    // Shuffle pool
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }

    // Build layered pattern
    // We want visually aligned overlapping layouts. We can define a set of grid clusters.
    let poolIndex = 0;

    // Center coordinates parameters
    const boardWidth = 360;
    const centerX = boardWidth / 2;

    for (let layer = 0; layer < layersCount; layer++) {
      // Different layers can have slightly shifted grids or offsets
      const layerOffset = layer * 8; // shift slightly to look 3D

      if (layer === 0) {
        // Bottom layer: simple dense grid
        const cols = diff === 'easy' ? 3 : diff === 'medium' ? 4 : 5;
        const rows = diff === 'easy' ? 3 : diff === 'medium' ? 4 : 5;
        const startX = centerX - (cols * TILE_WIDTH) / 2;
        const startY = 30;

        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            if (poolIndex >= pool.length) break;
            list.push({
              id: `tile_l${layer}_r${r}_c${c}`,
              typeId: pool[poolIndex++],
              x: startX + c * TILE_WIDTH + layerOffset,
              y: startY + r * TILE_HEIGHT - (layer * 4),
              layer: layer,
              status: 'board',
              uniqueKey: ++uniqueCounter,
            });
          }
        }
      } else if (layer === 1) {
        // Layer 1: shifted overlapping grid
        const cols = diff === 'easy' ? 2 : diff === 'medium' ? 3 : 4;
        const rows = diff === 'easy' ? 2 : diff === 'medium' ? 3 : 4;
        const startX = centerX - (cols * TILE_WIDTH) / 2 + TILE_WIDTH / 2;
        const startY = 30 + TILE_HEIGHT / 2;

        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            if (poolIndex >= pool.length) break;
            list.push({
              id: `tile_l${layer}_r${r}_c${c}`,
              typeId: pool[poolIndex++],
              x: startX + c * TILE_WIDTH - 4,
              y: startY + r * TILE_HEIGHT - 6,
              layer: layer,
              status: 'board',
              uniqueKey: ++uniqueCounter,
            });
          }
        }
      } else if (layer === 2) {
        // Layer 2: Ring or diamond outline
        const customCoords = [
          { x: centerX - TILE_WIDTH, y: 70 },
          { x: centerX + TILE_WIDTH - 20, y: 70 },
          { x: centerX - TILE_WIDTH - 20, y: 150 },
          { x: centerX + TILE_WIDTH, y: 150 },
          { x: centerX, y: 110 },
          { x: centerX, y: 200 },
          { x: centerX - TILE_WIDTH / 2, y: 110 },
          { x: centerX + TILE_WIDTH / 2, y: 110 },
        ];

        for (const coord of customCoords) {
          if (poolIndex >= pool.length) break;
          list.push({
            id: `tile_l${layer}_custom_${uniqueCounter}`,
            typeId: pool[poolIndex++],
            x: coord.x,
            y: coord.y,
            layer: layer,
            status: 'board',
            uniqueKey: ++uniqueCounter,
          });
        }
      } else {
        // Top-most Level 3: Crown pattern near the center
        const topCoords = [
          { x: centerX - TILE_WIDTH / 2, y: 90 },
          { x: centerX + TILE_WIDTH / 2, y: 90 },
          { x: centerX, y: 140 },
          { x: centerX - TILE_WIDTH, y: 140 },
          { x: centerX + TILE_WIDTH, y: 140 },
        ];

        for (const coord of topCoords) {
          if (poolIndex >= pool.length) break;
          list.push({
            id: `tile_l${layer}_top_${uniqueCounter}`,
            typeId: pool[poolIndex++],
            x: coord.x,
            y: coord.y,
            layer: layer,
            status: 'board',
            uniqueKey: ++uniqueCounter,
          });
        }
      }
    }

    // In case pool is not fully exhausted, cluster remaining tiles neatly near the bottom center
    while (poolIndex < pool.length) {
      const typeId = pool[poolIndex++];
      const offsetAmt = (poolIndex % 4) * 12;
      list.push({
        id: `tile_overflow_${poolIndex}`,
        typeId: typeId,
        x: centerX - TILE_WIDTH / 2 + offsetAmt - 18,
        y: 280 + (poolIndex % 2) * 10,
        layer: 0,
        status: 'board',
        uniqueKey: ++uniqueCounter,
      });
    }

    setTiles(list);
    setTray([]);
    setBench([]);

    // Recover booster counts
    setUndoCount(1);
    setBenchCount(1);
    setShuffleCount(1);
    lastActionRef.current = null;
  }, []);

  // Kickstart game
  const startGame = (diffVal: Difficulty = 'medium') => {
    playSfx('click');
    setDifficulty(diffVal);
    setScore(0);
    setGameState('playing');
    generateLevel(diffVal);

    const diffNames = { easy: '柿柿萌芽 🌸', medium: '柿柿如意 🍊', hard: '祥瑞大圓滿 🌺' };
    updateSpeech('cheering', `「${diffNames[diffVal]}」開局成功！滑鼠點擊任意明亮的頂層方塊，收集 3 個即可消去，考驗大腦的時候到啦！🐿️✨`);
  };

  // Click handler to select and move file to bottom deck
  const handleTileClick = (clickedTile: Tile) => {
    if (gameState !== 'playing') return;

    // Verify if covered
    if (isTileBlocked(clickedTile, tiles)) {
      playSfx('error');
      updateSpeech('anxious', '噯呀！這顆吉祥方塊被壓在下面了，要先消去上頭的阻擋物哦～ 🥺🐿️');
      return;
    }

    playSfx('place');

    // Move to tray logic
    // Add to history first
    lastActionRef.current = { ...clickedTile };

    // Move state
    const updatedTiles = tiles.map(t => {
      if (t.id === clickedTile.id) {
        return { ...t, status: 'tray' as const };
      }
      return t;
    });

    const refreshedTray = [...tray, clickedTile];
    
    // Sort tray items so same types stack together beautifully! This is crucial for clear view
    refreshedTray.sort((a, b) => a.typeId - b.typeId);

    // Group and check for matches
    // See if there's any 3-matching tiles
    const counts: Record<number, Tile[]> = {};
    refreshedTray.forEach(item => {
      if (!counts[item.typeId]) counts[item.typeId] = [];
      counts[item.typeId].push(item);
    });

    let matchedTypeId = -1;
    for (const tid in counts) {
      if (counts[tid].length === 3) {
        matchedTypeId = parseInt(tid, 10);
        break;
      }
    }

    if (matchedTypeId !== -1) {
      // Eliminate!
      setTimeout(() => {
        playSfx('match');

        // Filter out matched tiles
        const remainingTray = refreshedTray.filter(t => t.typeId !== matchedTypeId);
        setTray(remainingTray);

        const currentMatchedId = matchedTypeId;
        setTiles(prevTiles => prevTiles.map(t => {
          if (t.typeId === currentMatchedId && t.status === 'tray') {
            return { ...t, status: 'eliminated' as const };
          }
          return t;
        }));

        // Reward lucky score point
        setScore(prevVal => {
          const nextVal = prevVal + 300;
          if (nextVal > hiScore) {
            setHiScore(nextVal);
            localStorage.setItem('minigame_tile_matching_hiscore', nextVal.toString());
          }
          return nextVal;
        });

        // High praises speaking text
        const blessingText = TILE_TYPES[currentMatchedId]?.blessing || '如意連連';
        const nameText = TILE_TYPES[currentMatchedId]?.emoji + TILE_TYPES[currentMatchedId]?.name;
        
        updateSpeech('cheering', `天祥瑞照！消去了 ${nameText}，祝你「${blessingText}」！獲得了 300 點好運積分！🐿️🎉🏆`);

        // Check victory (no tiles on board, tray or bench)
        setTiles(all => {
          const leftCount = all.filter(t => t.status === 'board' || t.status === 'tray' || t.status === 'bench').length - 3; // subtracting the 3 going to eliminate in this closure state
          if (leftCount <= 0) {
            setGameState('victory');
            playSfx('win');
            updateSpeech('victory', '大圓滿！所有吉祥方塊已被你盡數消去，瑞氣盈門，小吉在此拜服！🏆🐿️🌾⭐');
          }
          return all;
        });

        // Reset last action so player cannot undo into eliminated tiles
        lastActionRef.current = null;
      }, 250);
    } else {
      // No match yet, update state directly
      setTray(refreshedTray);
      setTiles(updatedTiles);

      // Check if slot filled gameover (7 tiles in tray)
      if (refreshedTray.length >= 7) {
        setGameState('gameover');
        playSfx('lose');
        updateSpeech('sad', '糟糕！如意金缽（儲存架）已經塞滿了 7 個，無法再騰出空位啦！局終啦～ 🥺🐿️');
      }
    }
  };

  // Booster 1: UNDO - Pull last tile back to board
  const triggerUndo = () => {
    if (gameState !== 'playing' || undoCount <= 0 || !lastActionRef.current) {
      playSfx('error');
      return;
    }

    playSfx('powerup');
    const lastId = lastActionRef.current.id;

    // Remove from tray
    setTray(prevTray => prevTray.filter(t => t.id !== lastId));

    // Put back onto board
    setTiles(prevTiles => prevTiles.map(t => {
      if (t.id === lastId) {
        return { ...t, status: 'board' };
      }
      return t;
    }));

    setUndoCount(prev => prev - 1);
    lastActionRef.current = null;
    updateSpeech('chatting', '時光倒流！小吉動用尾巴倒轉乾坤，把最後一個方塊挪回去囉！⏳🐿️');
  };

  // Booster 2: SHIFT OUT - Put 3 items from tray onto temporary side deck
  const triggerBenchOut = () => {
    if (gameState !== 'playing' || benchCount <= 0 || tray.length === 0) {
      playSfx('error');
      return;
    }

    playSfx('powerup');

    // Take out up to 3 tiles from tray and move to bench
    const moveCount = Math.min(tray.length, 3);
    const toMove = tray.slice(0, moveCount);
    const remainingInTray = tray.slice(moveCount);

    setTray(remainingInTray);
    setBench(prev => [...prev, ...toMove]);

    // Update coordinates & status of these tiles
    const toMoveIds = new Set(toMove.map(t => t.id));
    setTiles(prev => prev.map(t => {
      if (toMoveIds.has(t.id)) {
        return { ...t, status: 'bench' };
      }
      return t;
    }));

    setBenchCount(prev => prev - 1);
    lastActionRef.current = null;
    updateSpeech('chatting', '乾坤挪移！把 3 個堆在缽底的方塊放進我的松果小揹簍中，立刻騰空了位置！🎒🐿️');
  };

  // Take tile back from bench to tray on Click
  const handleBenchTileClick = (benchTile: Tile) => {
    if (gameState !== 'playing') return;

    // Tray cannot exceed 7
    if (tray.length >= 7) {
      playSfx('error');
      updateSpeech('anxious', '金缽已經滿溢啦，沒辦法把揹簍裏的方塊拿出來喔！先去消除別的吧～ 🥺🐿️');
      return;
    }

    playSfx('place');

    // Remove from bench
    setBench(prev => prev.filter(t => t.id !== benchTile.id));

    // Add to tray
    const refreshedTray = [...tray, benchTile];
    refreshedTray.sort((a, b) => a.typeId - b.typeId);

    // Update status
    setTiles(prev => prev.map(t => {
      if (t.id === benchTile.id) {
        return { ...t, status: 'tray' };
      }
      return t;
    }));

    // Check match combinations
    const counts: Record<number, Tile[]> = {};
    refreshedTray.forEach(item => {
      if (!counts[item.typeId]) counts[item.typeId] = [];
      counts[item.typeId].push(item);
    });

    let matchedTypeId = -1;
    for (const tid in counts) {
      if (counts[tid].length === 3) {
        matchedTypeId = parseInt(tid, 10);
        break;
      }
    }

    if (matchedTypeId !== -1) {
      setTimeout(() => {
        playSfx('match');
        const remainingInTray = refreshedTray.filter(t => t.typeId !== matchedTypeId);
        setTray(remainingInTray);

        const currentMatchedId = matchedTypeId;
        setTiles(prev => prev.map(t => {
          if (t.typeId === currentMatchedId && t.status === 'tray') {
            return { ...t, status: 'eliminated' };
          }
          return t;
        }));

        setScore(prevVal => prevVal + 300);
        updateSpeech('cheering', `巧奪天工！從松果揹簍抓出的方塊成功消除了！獲得 300 點如意點數！🏆🐿️🌸`);
        lastActionRef.current = null;
      }, 250);
    } else {
      setTray(refreshedTray);
    }
  };

  // Booster 3: SHUFFLE - Recombine board remaining items randomly
  const triggerShuffle = () => {
    if (gameState !== 'playing' || shuffleCount <= 0) {
      playSfx('error');
      return;
    }

    playSfx('powerup');

    // Extract all tile types from current active board tiles
    const activeBoardTiles = tiles.filter(t => t.status === 'board');
    const activeTypeIds = activeBoardTiles.map(t => t.typeId);

    // Shuffle activeTypeIds list
    for (let i = activeTypeIds.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [activeTypeIds[i], activeTypeIds[j]] = [activeTypeIds[j], activeTypeIds[i]];
    }

    // Remap shuffled types back to tiles
    let poolIndex = 0;
    setTiles(prev => prev.map(t => {
      if (t.status === 'board') {
        return { ...t, typeId: activeTypeIds[poolIndex++] };
      }
      return t;
    }));

    setShuffleCount(prev => prev - 1);
    lastActionRef.current = null;
    updateSpeech('chatting', '祥雲百變！小松鼠使出旋風掃葉風，幫你把全場的吉祥物全部重現洗牌了喔！🌪️🐿️');
  };

  return (
    <div id="tile-matching-view" className="w-full max-w-5xl mx-auto px-1 py-4 md:p-6 text-gray-800">
      
      {/* Outer framing wrapper */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-amber-50/40 border-4 border-amber-100/80 rounded-3xl p-4 md:p-6 shadow-xl relative overflow-hidden backdrop-blur-md">
        
        {/* Left column: Mascots, scoring, statistics & actions header */}
        <div className="lg:col-span-4 flex flex-col justify-between space-y-5">
          <div>
            {/* Game Header logo badge */}
            <div className="flex items-center space-x-3 bg-white p-3.5 rounded-2xl border-2 border-orange-100 shadow-sm">
              <div className="bg-gradient-to-br from-amber-400 to-orange-500 p-2.5 rounded-xl text-white shadow-md">
                <Sparkles className="w-5.5 h-5.5 animate-pulse" />
              </div>
              <div>
                <h2 className="text-xl font-black text-gray-800 tracking-tight">萌獸柿柿如意消</h2>
                <p className="text-xs text-orange-600 font-mono font-semibold">Lucky Shishi Stack Match</p>
              </div>
            </div>

            {/* Mascot Squirrel speak deck */}
            <div className="mt-5 bg-white rounded-2xl border-2 border-amber-100 p-4 relative shadow-sm">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 relative">
                  <div className="w-13 h-13 rounded-full bg-amber-100 border-2 border-amber-300 flex items-center justify-center text-3xl shadow-inner animate-bounce">
                    {mascotMood === 'cheering' && '🐿️'}
                    {mascotMood === 'anxious' && '🥺'}
                    {mascotMood === 'sad' && '😿'}
                    {mascotMood === 'victory' && '👑'}
                    {mascotMood === 'chatting' && '🐿️'}
                  </div>
                  <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full flex items-center justify-center">
                    <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></span>
                  </span>
                </div>
                <div className="flex-1 bg-amber-50/60 rounded-xl p-3 border border-amber-100/50">
                  <div className="text-xs font-bold text-amber-800 mb-0.5">如意使松鼠阿吉：</div>
                  <p className="text-gray-700 text-xs leading-relaxed">{mascotSpeech}</p>
                </div>
              </div>
            </div>

            {/* Level selector list */}
            <div className="mt-5 bg-white rounded-2xl border-2 border-amber-100 p-4 shadow-sm">
              <h3 className="text-xs font-bold text-amber-800 mb-2.5 flex items-center">
                <Layers className="w-4 h-4 mr-1 text-amber-500" /> 選擇吉兆關卡難度：
              </h3>
              <div className="grid grid-cols-1 gap-2.5">
                <button
                  id="level-easy-btn"
                  onClick={() => startGame('easy')}
                  className={`w-full py-2.5 px-3.5 rounded-xl text-left border-2 duration-200 text-xs flex justify-between items-center ${
                    difficulty === 'easy' && gameState !== 'idle'
                      ? 'bg-amber-500 border-amber-500 text-white shadow-md font-bold'
                      : 'bg-orange-50/50 border-orange-100 text-amber-800 hover:bg-orange-100/30'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Star className="w-4 h-4 fill-current text-yellow-400" />
                    <span>柿柿萌芽 🌸 (簡單 - 18塊)</span>
                  </div>
                  <span className="text-[10px] opacity-90">上手試玩</span>
                </button>

                <button
                  id="level-medium-btn"
                  onClick={() => startGame('medium')}
                  className={`w-full py-2.5 px-3.5 rounded-xl text-left border-2 duration-200 text-xs flex justify-between items-center ${
                    difficulty === 'medium' && gameState !== 'idle'
                      ? 'bg-orange-500 border-orange-500 text-white shadow-md font-bold'
                      : 'bg-orange-50/50 border-orange-100 text-orange-800 hover:bg-orange-100/30'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Zap className="w-4 h-4 text-amber-400" />
                    <span>柿柿如意 🍊 (中等 - 48塊)</span>
                  </div>
                  <span className="text-[10px] opacity-90">標準挑戰</span>
                </button>

                <button
                  id="level-hard-btn"
                  onClick={() => startGame('hard')}
                  className={`w-full py-2.5 px-3.5 rounded-xl text-left border-2 duration-200 text-xs flex justify-between items-center ${
                    difficulty === 'hard' && gameState !== 'idle'
                      ? 'bg-rose-500 border-rose-500 text-white shadow-md font-bold'
                      : 'bg-rose-50/50 border-rose-100 text-rose-800 hover:bg-rose-100/30'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Award className="w-4 h-4 text-rose-300" />
                    <span>祥瑞大圓滿 🌺 (困難 - 90塊)</span>
                  </div>
                  <span className="text-[10px] opacity-90">地獄燒腦</span>
                </button>
              </div>
            </div>
          </div>

          {/* Guidelines info */}
          <div className="bg-orange-50/80 rounded-2xl border border-orange-100/60 p-3.5 text-xs text-amber-950 shadow-sm leading-relaxed">
            <div className="font-bold flex items-center text-amber-900 mb-1">
              <HelpCircle className="w-4 h-4 mr-1 text-orange-500" /> 祥瑞大消除秘訣：
            </div>
            <p>• 被覆蓋暗化的方塊是鎖定的，需優先消去壓在其上層的明亮塊體。</p>
            <p>• 點擊會將方塊置入底下的金缽，達 <strong>3 個同類</strong>即刻消除大吉！</p>
            <p>• 善用「撤銷」、「揹簍移出」及「百變打亂」三大吉星法寶渡過難關。</p>
          </div>
        </div>

        {/* Center column: Active tile boards & tray holder */}
        <div className="lg:col-span-8 flex flex-col items-center">
          
          {/* Scoring Header board */}
          <div className="w-full flex items-center justify-between bg-white px-5 py-3.5 rounded-2xl border-2 border-orange-100 shadow-sm mb-4">
            <div className="flex items-center space-x-4">
              <div>
                <span className="text-[10px] text-gray-400 block uppercase tracking-wider font-semibold">當前大運積分</span>
                <span className="text-xl font-black font-mono text-orange-500">{score}</span>
              </div>
              <div className="border-l border-orange-100 h-8"></div>
              <div>
                <span className="text-[10px] text-gray-400 block uppercase tracking-wider font-semibold">松果庫最高紀錄</span>
                <span className="text-sm font-bold font-mono text-gray-600">{hiScore}</span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <div className="bg-amber-50 text-indigo-800 px-3 py-1 rounded-xl font-mono text-xs border border-amber-100 font-bold">
                剩餘方塊: {tiles.filter(t => t.status === 'board' || t.status === 'tray' || t.status === 'bench').length} 個
              </div>
              <button
                onClick={() => setSoundEnabled(prev => !prev)}
                className="p-2.5 rounded-xl bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200 transition-colors"
                title={soundEnabled ? '靜音' : '開啟音效'}
              >
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Playing main layer card view area */}
          <div className="relative w-full aspect-[4/5] sm:aspect-[4/4.2] bg-stone-100/80 border-4 border-stone-200 rounded-3xl overflow-hidden shadow-inner flex flex-col justify-between p-4 bg-[radial-gradient(#fed7aa_1px,transparent_1px)] [background-size:24px_24px]">
            
            {/* Main Overlapping Grid Wrapper */}
            <div className="relative w-full flex-1 max-w-[420px] mx-auto">
              <AnimatePresence>
                {tiles.map(tile => {
                  if (tile.status !== 'board') return null;

                  const tileType = TILE_TYPES[tile.typeId];
                  if (!tileType) return null;

                  const blocked = isTileBlocked(tile, tiles);

                  return (
                    <motion.div
                      key={tile.id}
                      initial={{ scale: 0.1, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                      onClick={() => handleTileClick(tile)}
                      className={`absolute w-[53px] h-[61px] rounded-xl flex flex-col items-center justify-between py-1.5 border-2 border-b-6 cursor-pointer select-none transition-all duration-200 ${
                        tileType.color
                      } ${tileType.borderColor} ${
                        blocked 
                          ? 'brightness-50 saturate-[0.6] shadow-sm translate-y-0.5 cursor-not-allowed border-b-2' 
                          : 'shadow-md active:translate-y-1 active:border-b-2 hover:scale-105 hover:shadow-lg'
                      }`}
                      style={{
                        left: `${tile.x}px`,
                        top: `${tile.y}px`,
                        zIndex: 10 + tile.layer * 5,
                      }}
                    >
                      <span className="text-2xl filter drop-shadow-sm select-none">{tileType.emoji}</span>
                      <span className="text-[10px] font-bold tracking-tight select-none opacity-85 leading-none">
                        {tileType.name}
                      </span>
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {/* Game state overlay templates */}
              <AnimatePresence>
                {gameState === 'idle' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-x-0 top-12 bottom-12 bg-white/95 rounded-2xl flex flex-col items-center justify-center p-6 text-center z-40 shadow-xl border-2 border-amber-100"
                  >
                    <div className="w-18 h-18 bg-amber-50 text-orange-500 rounded-full flex items-center justify-center text-4xl mb-4 shadow-md animate-pulse">
                      🐿️🍊
                    </div>
                    <h3 className="text-2xl font-black text-orange-600 mb-2">萌獸柿柿如意消</h3>
                    <p className="text-xs text-gray-500 max-w-xs mb-6 leading-relaxed">
                      經典多層次 3 連消大挑戰！解鎖與松鼠「阿吉」的朝氣博弈，將所有疊放的吉祥花果拼入鉢中，消災納福，萬事如意！
                    </p>
                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 w-full justify-center">
                      <button
                        onClick={() => startGame('easy')}
                        className="py-2.5 px-6 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-1 duration-200"
                      >
                        <span>柿柿萌芽 (初學者)</span>
                      </button>
                      <button
                        id="default-start-btn"
                        onClick={() => startGame('medium')}
                        className="py-2.5 px-6 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-1 duration-200 shadow-md scale-100 active:scale-95"
                      >
                        <Play className="w-4 h-4 fill-current" />
                        <span>標準開運挑戰</span>
                      </button>
                    </div>
                  </motion.div>
                )}

                {gameState === 'victory' && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-x-0 top-12 bottom-12 bg-white/95 rounded-2xl flex flex-col items-center justify-center p-6 text-center z-40 shadow-xl border-2 border-amber-100"
                  >
                    <div className="w-16 h-16 bg-yellow-50 text-yellow-500 rounded-full flex items-center justify-center text-4xl mb-3 shadow-md animate-bounce">
                      🏆
                    </div>
                    <h3 className="text-2xl font-black text-orange-700 mb-1">萬事大吉！滿堂彩</h3>
                    <div className="text-red-500 font-mono text-sm font-black mb-4">
                      福壽無量最終大吉分: {score} 
                    </div>
                    <p className="text-xs text-gray-500 max-w-xs mb-6 leading-relaxed">
                      小松鼠阿吉提著松果狂放鞭炮作揖！感謝你的妙手神思，幫忙化解了神花園的全部疊放阻礙喔！
                    </p>
                    <div className="flex space-x-3 w-full max-w-xs justify-center">
                      <button
                        id="victory-retry-btn"
                        onClick={() => startGame(difficulty)}
                        className="py-2.5 px-6 bg-orange-500 hover:bg-orange-600 font-bold text-white rounded-xl shadow-md flex items-center justify-center space-x-1 duration-200 text-xs flex-1"
                      >
                        <RotateCcw className="w-4 h-4" />
                        <span>再添一祥之局</span>
                      </button>
                      <button
                        onClick={() => {
                          playSfx('click');
                          setGameState('idle');
                        }}
                        className="py-2.5 px-6 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl border duration-200 text-xs flex-1"
                      >
                        返回主盤
                      </button>
                    </div>
                  </motion.div>
                )}

                {gameState === 'gameover' && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-x-0 top-12 bottom-12 bg-white/95 rounded-2xl flex flex-col items-center justify-center p-6 text-center z-40 shadow-xl border-2 border-red-100"
                  >
                    <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center text-4xl mb-3 shadow-md">
                      😿
                    </div>
                    <h3 className="text-xl font-bold text-red-600 mb-1">金缽已滿，局棋受阻</h3>
                    <div className="text-gray-500 text-xs mb-4">累積總運得分: {score} 點</div>
                    <p className="text-xs text-gray-500 max-w-xs mb-6 leading-relaxed">
                      底下的收集卡槽塞滿了 7 個阻礙，別灰心，下次挑戰時要更注意吉祥圖案的先後疊放層次哦！
                    </p>
                    <div className="flex space-x-3 w-full max-w-xs justify-center">
                      <button
                        id="gameover-retry-btn"
                        onClick={() => startGame(difficulty)}
                        className="py-2.5 px-6 bg-orange-500 hover:bg-orange-600 font-bold text-white rounded-xl shadow-md flex items-center justify-center space-x-1 duration-200 text-xs flex-1"
                      >
                        <RotateCcw className="w-4 h-4" />
                        <span>重新開一局</span>
                      </button>
                      <button
                        onClick={() => {
                          playSfx('click');
                          setGameState('idle');
                        }}
                        className="py-2.5 px-6 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl border duration-200 text-xs flex-1"
                      >
                        返回首頁
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Bottom Temporary Slot holder: 松果小揹簍 Bench Holder (Up to 3 tiles) */}
            {bench.length > 0 && (
              <div id="pine-bench-holder" className="w-full max-w-[390px] mx-auto bg-amber-50/50 border-2 border-dashed border-amber-200 rounded-2xl p-2 mb-3 shadow-inner">
                <div className="text-[9px] uppercase tracking-wider text-amber-600 font-semibold mb-1 text-center flex items-center justify-center">
                  <span>🐿️ 阿吉的松果小揹簍 (點擊即可召回)</span>
                </div>
                <div className="flex justify-center space-x-2">
                  <AnimatePresence>
                    {bench.map(item => {
                      const tileType = TILE_TYPES[item.typeId];
                      return (
                        <motion.button
                          key={item.id}
                          initial={{ scale: 0.6, y: 15 }}
                          animate={{ scale: 1, y: 0 }}
                          exit={{ scale: 0.6, opacity: 0 }}
                          onClick={() => handleBenchTileClick(item)}
                          className={`w-[48px] h-[54px] rounded-lg border flex flex-col items-center justify-center py-1 transition-all shadow-sm ${tileType?.color} ${tileType?.borderColor} hover:scale-105 active:scale-95`}
                        >
                          <span className="text-xl leading-none">{tileType?.emoji}</span>
                          <span className="text-[8px] font-bold leading-none mt-1">{tileType?.name}</span>
                        </motion.button>
                      );
                    })}
                  </AnimatePresence>
                </div>
              </div>
            )}

            {/* Bottom Collection Holder (Tray slots: limit 7) */}
            <div id="gold-tray-holder" className="w-full max-w-[400px] mx-auto bg-stone-200/90 border-4 border-amber-300 rounded-2xl py-3 px-2 shadow-md relative min-h-[82px] flex items-center justify-center">
              
              {/* Overlay golden cup logo */}
              <div className="absolute top-1 left-2.5 flex items-center space-x-1 opacity-45">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
                <span className="text-[9px] font-bold text-amber-800">如意金缽 (卡槽限7)</span>
              </div>

              {tray.length === 0 ? (
                <div className="text-[11px] font-bold text-amber-800/60 font-serif animate-pulse">
                  點擊吉祥物收集，湊齊 3 個消去...
                </div>
              ) : (
                <div className="flex w-full justify-start space-x-1.5 px-1.5">
                  <AnimatePresence>
                    {tray.map((item, index) => {
                      const tileType = TILE_TYPES[item.typeId];
                      return (
                        <motion.div
                          key={`${item.id}_tray_${index}`}
                          initial={{ scale: 0.6, y: -30, opacity: 0 }}
                          animate={{ scale: 1, y: 0, opacity: 1 }}
                          exit={{ scale: 0.5, opacity: 0 }}
                          transition={{ type: 'spring', stiffness: 350, damping: 20 }}
                          className={`w-[46px] h-[52px] rounded-lg flex flex-col items-center justify-center py-1 border border-b-3 shadow-inner ${tileType?.color} ${tileType?.borderColor}`}
                        >
                          <span className="text-lg leading-none">{tileType?.emoji}</span>
                          <span className="text-[8px] font-bold leading-none mt-1 whitespace-nowrap">{tileType?.name}</span>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </div>

          {/* Three magical boosters row */}
          <div className="w-full max-w-[420px] grid grid-cols-3 gap-3.5 mt-5">
            <button
              id="booster-undo"
              onClick={triggerUndo}
              disabled={gameState !== 'playing' || undoCount <= 0 || !lastActionRef.current}
              className={`py-2.5 rounded-2xl flex flex-col items-center justify-center border-2 bg-white transition-all duration-200 text-xs ${
                undoCount > 0 && lastActionRef.current 
                  ? 'border-orange-200 text-orange-600 hover:bg-orange-50 active:scale-95 shadow-sm' 
                  : 'opacity-40 cursor-not-allowed border-gray-100 text-gray-400'
              }`}
            >
              <Undo className="w-5 h-5 mb-1" />
              <div className="font-bold">柿柿順心 (撤銷)</div>
              <span className="text-[9px] font-mono mt-0.5 bg-orange-100 text-orange-700 px-1.5 py-0.2 rounded-full">
                剩 {undoCount}
              </span>
            </button>

            <button
              id="booster-bench"
              onClick={triggerBenchOut}
              disabled={gameState !== 'playing' || benchCount <= 0 || tray.length === 0}
              className={`py-2.5 rounded-2xl flex flex-col items-center justify-center border-2 bg-white transition-all duration-200 text-xs ${
                benchCount > 0 && tray.length > 0 
                  ? 'border-amber-200 text-amber-700 hover:bg-amber-50 active:scale-95 shadow-sm' 
                  : 'opacity-40 cursor-not-allowed border-gray-100 text-gray-400'
              }`}
            >
              <ArrowUpCircle className="w-5 h-5 mb-1" />
              <div className="font-bold">大吉大利 (移出)</div>
              <span className="text-[9px] font-mono mt-0.5 bg-amber-100 text-amber-700 px-1.5 py-0.2 rounded-full">
                剩 {benchCount}
              </span>
            </button>

            <button
              id="booster-shuffle"
              onClick={triggerShuffle}
              disabled={gameState !== 'playing' || shuffleCount <= 0}
              className={`py-2.5 rounded-2xl flex flex-col items-center justify-center border-2 bg-white transition-all duration-200 text-xs ${
                shuffleCount > 0 
                  ? 'border-purple-200 text-purple-600 hover:bg-purple-50 active:scale-95 shadow-sm' 
                  : 'opacity-40 cursor-not-allowed border-gray-100 text-gray-400'
              }`}
            >
              <Shuffle className="w-5 h-5 mb-1" />
              <div className="font-bold">祥雲變幻 (隨機)</div>
              <span className="text-[9px] font-mono mt-0.5 bg-purple-100 text-purple-700 px-1.5 py-0.2 rounded-full">
                剩 {shuffleCount}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
