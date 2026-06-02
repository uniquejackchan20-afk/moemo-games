/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, RefreshCw, HelpCircle, Trophy, Sparkle, ShoppingBag, Eye, Zap, RefreshCw as ShuffleIcon, AlertCircle, Award, Volume2, VolumeX, Heart, ChevronRight, Gamepad2 } from 'lucide-react';

// Tile Definition Interface
interface TileData {
  symbol: string;
  label: string;
  suit: 'dragon' | 'wind' | 'wan' | 'sou' | 'pin' | 'flower';
  color: string;
  bgSymbol?: string;
}

// Active board tile instance
interface TileInstance {
  id: string;
  symbol: string;
  label: string;
  suit: 'dragon' | 'wind' | 'wan' | 'sou' | 'pin' | 'flower';
  color: string;
  x: number; // grid x
  y: number; // grid y
  z: number; // grid layer
  isMatched: boolean;
}

// Yaku (Fortune Hands) Completed Tracker
interface YakuHand {
  name: string;
  desc: string;
  points: number;
  icon: string;
  isUnlocked: boolean;
  reqs: string;
}

// Traditional Mahjong Tile Pool Reference
const TILE_TEMPLATES: TileData[] = [
  { symbol: '🀄', label: '紅中', suit: 'dragon', color: 'text-red-600' },
  { symbol: '🀅', label: '發財', suit: 'dragon', color: 'text-emerald-700' },
  { symbol: '🀆', label: '白板', suit: 'dragon', color: 'text-sky-600/80' },
  
  { symbol: '🀀', label: '東風', suit: 'wind', color: 'text-slate-800' },
  { symbol: '🀁', label: '南風', suit: 'wind', color: 'text-slate-800' },
  { symbol: '🀂', label: '西風', suit: 'wind', color: 'text-slate-800' },
  { symbol: '🀃', label: '北風', suit: 'wind', color: 'text-slate-800' },

  { symbol: '🀇', label: '一萬', suit: 'wan', color: 'text-red-700' },
  { symbol: '🀋', label: '五萬', suit: 'wan', color: 'text-red-700' },
  { symbol: '🀏', label: '九萬', suit: 'wan', color: 'text-red-700' },

  { symbol: '🀐', label: '一條', suit: 'sou', color: 'text-emerald-600' },
  { symbol: '🀔', label: '五條', suit: 'sou', color: 'text-emerald-600' },
  { symbol: '🀘', label: '九條', suit: 'sou', color: 'text-emerald-600' },

  { symbol: '🀙', label: '一筒', suit: 'pin', color: 'text-blue-700' },
  { symbol: '🀝', label: '五筒', suit: 'pin', color: 'text-blue-700' },
  { symbol: '🀡', label: '九筒', suit: 'pin', color: 'text-blue-700' },

  { symbol: '🀦', label: '春風', suit: 'flower', color: 'text-purple-600' },
  { symbol: '🀧', label: '夏荷', suit: 'flower', color: 'text-pink-600' },
  { symbol: '🀨', label: '秋菊', suit: 'flower', color: 'text-amber-600' },
  { symbol: '🀩', label: '冬梅', suit: 'flower', color: 'text-blue-600' },
];

export default function MiniGameMahjongBig() {
  const [activeBoardName, setActiveBoardName] = useState<'pyramid' | 'bagua' | 'gate'>('pyramid');
  const [boardTiles, setBoardTiles] = useState<TileInstance[]>([]);
  const [trayTiles, setTrayTiles] = useState<TileInstance[]>([]);
  const [allMatchedList, setAllMatchedList] = useState<TileInstance[]>([]);
  
  // Game states
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    return Number(localStorage.getItem('mahjong_big_highscore') || '0');
  });
  const [hintIndex, setHintIndex] = useState<string[]>([]);
  const [hintCooldown, setHintCooldown] = useState(false);
  const [activeMessage, setActiveMessage] = useState('吉兆麻將開局，歡迎閣下！');
  const [shakeMsgTrigger, setShakeMsgTrigger] = useState(false);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'won' | 'lost'>('idle');
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  // Master combos / yaku completed
  const [yakuHands, setYakuHands] = useState<YakuHand[]>([
    { name: '大三元吉兆', desc: '收集齊 紅中、發財、白板 雙對', points: 600, icon: '🀄🀅🀆', isUnlocked: false, reqs: 'dragon-all' },
    { name: '四風大團圓', desc: '收集齊 東、南、西、北 四對風牌', points: 1000, icon: '🀀🀁🀂🀃', isUnlocked: false, reqs: 'wind-all' },
    { name: '清一色神運', desc: '收集同一系列花色（如全是萬子/條子/筒子）共 6 對', points: 800, icon: '🀇🀏🀙🀡', isUnlocked: false, reqs: 'flush-6' },
    { name: '四季報春暉', desc: '收集齊 春、夏、秋、冬 四種時節花牌', points: 500, icon: '🀦🀧🀨🀩', isUnlocked: false, reqs: 'flower-all' },
    { name: '五福迎財門', desc: '進行 5 次以上的連續快速消除（消疊加分）', points: 400, icon: '🪙🎋🐾', isUnlocked: false, reqs: 'combo-5' }
  ]);
  const [lastUnlockedYaku, setLastUnlockedYaku] = useState<string | null>(null);

  // Adorable Host Status
  const [hostMood, setHostMood] = useState<'idle' | 'happy' | 'thinking' | 'victory' | 'sad'>('idle');
  const hostTimer = useRef<NodeJS.Timeout | null>(null);

  // Initialize Audio-Visual Feedback System
  const playSound = (type: 'match' | 'select' | 'error' | 'yaku' | 'shuffle' | 'win' | 'lost') => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      if (type === 'select') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(330, audioCtx.currentTime); // E4
        osc.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 0.08); // A4
        gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.1);
      } else if (type === 'match') {
        // Double chime like a traditional scale string
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
        osc.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.08); // E5
        osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.2); // A5
        gain.gain.setValueAtTime(0.18, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.35);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.35);
      } else if (type === 'error') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(180, audioCtx.currentTime); 
        osc.frequency.linearRampToValueAtTime(110, audioCtx.currentTime + 0.15); 
        gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.2);
      } else if (type === 'yaku') {
        // High luxury golden gong harp sound
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, audioCtx.currentTime);
        osc.frequency.setValueAtTime(554.37, audioCtx.currentTime + 0.06);
        osc.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.12);
        osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.18);
        osc.frequency.setValueAtTime(1109, audioCtx.currentTime + 0.24);
        gain.gain.setValueAtTime(0.25, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.005, audioCtx.currentTime + 0.7);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.7);
      } else if (type === 'shuffle') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(300, audioCtx.currentTime);
        osc.frequency.linearRampToValueAtTime(600, audioCtx.currentTime + 0.25);
        gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.3);
      } else if (type === 'win') {
        // Triumphant ascending scale
        const notes = [523.25, 587.33, 659.25, 698.46, 783.99, 880, 987.77, 1046.5];
        notes.forEach((freq, idx) => {
          const noteOsc = audioCtx.createOscillator();
          const noteGain = audioCtx.createGain();
          noteOsc.type = 'sine';
          noteOsc.frequency.setValueAtTime(freq, audioCtx.currentTime + idx * 0.07);
          noteGain.connect(audioCtx.destination);
          noteOsc.connect(noteGain);
          noteGain.gain.setValueAtTime(0.15, audioCtx.currentTime + idx * 0.07);
          noteGain.gain.exponentialRampToValueAtTime(0.005, audioCtx.currentTime + idx * 0.07 + 0.3);
          noteOsc.start(audioCtx.currentTime + idx * 0.07);
          noteOsc.stop(audioCtx.currentTime + idx * 0.07 + 0.35);
        });
      } else if (type === 'lost') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, audioCtx.currentTime);
        osc.frequency.linearRampToValueAtTime(90, audioCtx.currentTime + 0.5);
        gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.5);
      }
    } catch (e) {
      console.log('Audio error:', e);
    }
  };

  const triggerHostMood = (mood: 'happy' | 'thinking' | 'victory' | 'sad') => {
    setHostMood(mood);
    if (hostTimer.current) clearTimeout(hostTimer.current);
    hostTimer.current = setTimeout(() => {
      setHostMood('idle');
    }, 4000);
  };

  // Build Board Configuration layout slots
  const generateLayoutCoordinates = (layout: 'pyramid' | 'bagua' | 'gate'): { x: number; y: number; z: number }[] => {
    const coords: { x: number; y: number; z: number }[] = [];

    if (layout === 'pyramid') {
      // Pyramid layout - total 64 slots (guaranteed even matching pairs)
      // Layer 0: 32 spots in outer perimeter/grid (spacing grid units is 2 units per tile)
      // x: 0 to 10 step 2, y: 0 to 6 step 2
      for (let y = 0; y <= 6; y += 2) {
        for (let x = 0; x <= 10; x += 2) {
          // Hollow out the extreme edges to look like a beautiful smooth layout
          if ((x === 0 || x === 10) && (y === 0 || y === 6)) continue;
          coords.push({ x, y, z: 0 });
        }
      }
      // Layer 1: 18 spots in intermediate centering ring
      // x: 1 to 9 step 2, y: 1 to 5 step 2
      for (let y = 1.3; y <= 4.7; y += 1.7) {
        for (let x = 1.6; x <= 8.4; x += 1.7) {
          coords.push({ x, y, z: 1 });
        }
      }
      // Layer 2: 10 spots centrally nestled
      coords.push({ x: 3.5, y: 2, z: 2 });
      coords.push({ x: 5.5, y: 2, z: 2 });
      coords.push({ x: 3.5, y: 3.5, z: 2 });
      coords.push({ x: 5.5, y: 3.5, z: 2 });
      coords.push({ x: 4.5, y: 1, z: 2 });
      coords.push({ x: 4.5, y: 4.5, z: 2 });
      coords.push({ x: 2, y: 3, z: 2 });
      coords.push({ x: 7, y: 3, z: 2 });
      coords.push({ x: 3.5, y: 5, z: 2 });
      coords.push({ x: 5.5, y: 5, z: 2 });

      // Layer 3: 4 spots near crown
      coords.push({ x: 4, y: 2.5, z: 3 });
      coords.push({ x: 6, y: 2.5, z: 3 });
      coords.push({ x: 4, y: 3.5, z: 3 });
      coords.push({ x: 6, y: 3.5, z: 3 });

    } else if (layout === 'bagua') {
      // Bagua balance circular structure - 48 slots
      // Center focal core (Layer 2 & 1) and surrounding circular nodes
      // Layer 0 ring: 24 positions
      const radius0 = 4.2;
      for (let i = 0; i < 24; i++) {
        const angle = (i * 2 * Math.PI) / 24;
        const x = Math.round((5 + radius0 * Math.cos(angle)) * 10) / 10;
        const y = Math.round((3 + radius0 * 0.7 * Math.sin(angle)) * 10) / 10;
        coords.push({ x, y, z: 0 });
      }
      // Layer 1 ring: 16 positions
      const radius1 = 2.8;
      for (let i = 0; i < 16; i++) {
        const angle = (i * 2 * Math.PI) / 16 + 0.2;
        const x = Math.round((5 + radius1 * Math.cos(angle)) * 10) / 10;
        const y = Math.round((3 + radius1 * 0.7 * Math.sin(angle)) * 10) / 10;
        coords.push({ x, y, z: 1 });
      }
      // Layer 2 core: 8 positions
      const radius2 = 1.3;
      for (let i = 0; i < 8; i++) {
        const angle = (i * 2 * Math.PI) / 8 + 0.4;
        const x = Math.round((5 + radius2 * Math.cos(angle)) * 10) / 10;
        const y = Math.round((3 + radius2 * 0.7 * Math.sin(angle)) * 10) / 10;
        coords.push({ x, y, z: 2 });
      }
    } else {
      // Custom "Gate of Fortune" symmetrical arch layout - 50 slots
      // Twin columns on left and right spanning heights, and a linking overhead lintel
      // Left Arch Tower
      for (let z = 0; z <= 2; z++) {
        coords.push({ x: 1, y: 1, z });
        coords.push({ x: 1, y: 3, z });
        coords.push({ x: 1, y: 5, z });
        coords.push({ x: 2.5, y: 2, z });
        coords.push({ x: 2.5, y: 4, z });
      }
      // Right Arch Tower
      for (let z = 0; z <= 2; z++) {
        coords.push({ x: 8, y: 1, z });
        coords.push({ x: 8, y: 3, z });
        coords.push({ x: 8, y: 5, z });
        coords.push({ x: 9.5, y: 2, z });
        coords.push({ x: 9.5, y: 4, z });
      }
      // Center linking lintel archways
      coords.push({ x: 4.5, y: 1, z: 0 });
      coords.push({ x: 6, y: 1, z: 0 });
      coords.push({ x: 4.5, y: 2.5, z: 0 });
      coords.push({ x: 6, y: 2.5, z: 0 });

      coords.push({ x: 4.5, y: 1, z: 1 });
      coords.push({ x: 6, y: 1, z: 1 });
      coords.push({ x: 4.5, y: 2.5, z: 1 });
      coords.push({ x: 6, y: 2.5, z: 1 });

      coords.push({ x: 5.2, y: 1.8, z: 2 });
      coords.push({ x: 5.2, y: 2.8, z: 2 });
    }

    // Force layouts to strictly consist of even amounts of tiles for matching parity!
    if (coords.length % 2 !== 0) {
      coords.pop();
    }
    return coords;
  };

  // Generate starting tile dataset matching layout slots perfectly
  const initializeGame = () => {
    const slots = generateLayoutCoordinates(activeBoardName);
    const tileCount = slots.length;

    // Generate balanced tile types. Each type must come in matching pairs (e.g. 2 or 4 of each tile)
    const activeTileSet: TileData[] = [];
    let templatePtr = 0;
    
    // Fill with pairs
    for (let i = 0; i < tileCount; i += 2) {
      const template = TILE_TEMPLATES[templatePtr % TILE_TEMPLATES.length];
      activeTileSet.push(template);
      activeTileSet.push(template); // Must be a pair!
      templatePtr++;
    }

    // Shuffle tile contents randomly to preserve fairness
    for (let i = activeTileSet.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = activeTileSet[i];
      activeTileSet[i] = activeTileSet[j];
      activeTileSet[j] = temp;
    }

    // Bind templates to coordinate positions on current board layout
    const finalInstances: TileInstance[] = slots.map((coord, idx) => {
      const t = activeTileSet[idx];
      return {
        id: `tile_${idx}_${Date.now()}`,
        symbol: t.symbol,
        label: t.label,
        suit: t.suit,
        color: t.color,
        x: coord.x,
        y: coord.y,
        z: coord.z,
        isMatched: false,
      };
    });

    setBoardTiles(finalInstances);
    setTrayTiles([]);
    setAllMatchedList([]);
    setScore(0);
    setGameState('playing');
    setHintIndex([]);
    
    // Reset Yaku
    setYakuHands(prev => prev.map(y => ({ ...y, isUnlocked: false })));
    setLastUnlockedYaku(null);
    setActiveMessage('✨ 新祥瑞閣樓成形！請點選「空曠無覆蓋及夾擊」的牌面放入下方聚寶盆中！');
    triggerHostMood('happy');
    playSound('shuffle');
  };

  // Trigger setup on mounting and layout swapping
  useEffect(() => {
    initializeGame();
  }, [activeBoardName]);

  // Mahjong blocking rules:
  // Tile is blocked if:
  // 1) There is any other active tile sitting on a strictly higher z layer (e.g. other.z > tile.z)
  //    AND physically overlaps. We verify if the center distance between tiles is < 1.8 grid units.
  // 2) It is horizontally pinched on BOTH its left AND right sides by other active tiles on its exact layer.
  const isTileBlocked = (tile: TileInstance) => {
    const list = boardTiles.filter(t => !t.isMatched);

    // 1. Check if overlapped from above
    const hasTileAbove = list.some(other => {
      if (other.id === tile.id || other.z <= tile.z) return false;
      return Math.abs(other.x - tile.x) < 1.7 && Math.abs(other.y - tile.y) < 1.7;
    });

    if (hasTileAbove) return true;

    // 2. Check left side blocker and right side blocker
    const hasLeftNeighbor = list.some(other => {
      if (other.id === tile.id || other.z !== tile.z) return false;
      return (other.x < tile.x) && Math.abs(other.x - tile.x) < 1.9 && Math.abs(other.y - tile.y) < 0.8;
    });

    const hasRightNeighbor = list.some(other => {
      if (other.id === tile.id || other.z !== tile.z) return false;
      return (other.x > tile.x) && Math.abs(other.x - tile.x) < 1.9 && Math.abs(other.y - tile.y) < 0.8;
    });

    // Blocked only if pinched from BOTH lateral sides
    return hasLeftNeighbor && hasRightNeighbor;
  };

  // Trigger notification messaging
  const showAlertMsg = (msg: string) => {
    setActiveMessage(msg);
    setShakeMsgTrigger(true);
    setTimeout(() => {
      setShakeMsgTrigger(false);
    }, 600);
  };

  // Click handler for tiles
  const handleTileClick = (tile: TileInstance) => {
    if (gameState !== 'playing') return;

    // 1. Check if tile is locked/occluded
    if (isTileBlocked(tile)) {
      playSound('error');
      triggerHostMood('thinking');
      showAlertMsg('❌ 哎呀！這張牌被壓住或是左右合圍了，請先消除它兩旁的開口牌！');
      return;
    }

    // 2. Check if tray already has this tile type to merge
    // Smoothly fly tile into tray
    playSound('select');
    
    // Hide tile on layout instantly (marked as matched conceptually, but sent to matching buffer tray)
    setBoardTiles(prev => prev.map(t => {
      if (t.id === tile.id) return { ...t, isMatched: true };
      return t;
    }));

    // Check if Tray already contains ONE matching symbol
    const existingIndex = trayTiles.findIndex(t => t.symbol === tile.symbol);

    if (existingIndex !== -1) {
      // SUCCESSFUL FUSION! Clear both from tray and add to allMatched records
      const partner = trayTiles[existingIndex];
      
      // Update Tray (remove partner, do not add clicked tile since they fuse!)
      setTrayTiles(prev => prev.filter((_, idx) => idx !== existingIndex));
      setAllMatchedList(prev => [...prev, partner, tile]);
      
      // Multiplier score based on suit complexity (dragons > winds > flowers > simple suits)
      let ptsGained = 100;
      if (tile.suit === 'dragon') ptsGained = 200;
      if (tile.suit === 'wind') ptsGained = 150;
      if (tile.suit === 'flower') ptsGained = 180;

      setScore(prev => {
        const nextScore = prev + ptsGained;
        if (nextScore > highScore) {
          setHighScore(nextScore);
          localStorage.setItem('mahjong_big_highscore', String(nextScore));
        }
        return nextScore;
      });

      // Clear hints if used
      setHintIndex([]);
      
      playSound('match');
      triggerHostMood('happy');
      
      const luckyAffirmations = [
        `🀄 妙手生花！消除了一對吉祥的【${tile.label}】！`,
        `🪵 雀仙引路！【${tile.label}】成功聚喜圓滿！`,
        `✨ 手氣亨通！【${tile.label}】消去，祥瑞氣息大增！`,
        `🌸 意境妙契！合拍銷去【${tile.label}】！`
      ];
      setActiveMessage(luckyAffirmations[Math.floor(Math.random() * luckyAffirmations.length)]);

      // Check Yaku completion
      checkYakuAwards([...allMatchedList, partner, tile]);

    } else {
      // No match currently in tray. Check if tray is full
      if (trayTiles.length >= 4) {
        // Tray full! Return the tile back to board to prevent softlock
        setBoardTiles(prev => prev.map(t => {
          if (t.id === tile.id) return { ...t, isMatched: false };
          return t;
        }));
        playSound('error');
        triggerHostMood('sad');
        showAlertMsg('⚠️ 聚寶盆儲存格（4格）已滿！請先將盆中現有的牌進行配對融合！');
        return;
      }

      // Safe to insert into tray
      setTrayTiles(prev => [...prev, tile]);
      setActiveMessage(`📥 已將【${tile.label}】暫存入聚寶盆，快解除封印找出另一張進行融合！`);
    }
  };

  // Inspect the matched inventory against the five mythical Yaku/Combos
  const checkYakuAwards = (matchedPool: TileInstance[]) => {
    // Helper tracker
    const counts: Record<string, number> = {};
    matchedPool.forEach(t => {
      counts[t.symbol] = (counts[t.symbol] || 0) + 1;
    });

    let yakuFound = false;
    let yakuName = '';

    const nextYaku = yakuHands.map(yaku => {
      if (yaku.isUnlocked) return yaku;

      let isCompleted = false;

      if (yaku.reqs === 'dragon-all') {
        // Must contain pairs (min 2 of each) of 🀄, 🀅, 🀆
        isCompleted = (counts['🀄'] >= 2) && (counts['🀅'] >= 2) && (counts['🀆'] >= 2);
      } else if (yaku.reqs === 'wind-all') {
        // Must contain pairs of 🀀 🀁 🀂 🀃
        isCompleted = (counts['🀀'] >= 2) && (counts['🀁'] >= 2) && (counts['🀂'] >= 2) && (counts['🀃'] >= 2);
      } else if (yaku.reqs === 'flower-all') {
        // Matches flower symbols 春夏秋冬 (or any 4 flower tiles)
        const flowerCount = matchedPool.filter(t => t.suit === 'flower').length;
        isCompleted = flowerCount >= 6; // 3 pairs
      } else if (yaku.reqs === 'flush-6') {
        // Same suit has more than 6 pairs (12 tiles total)
        const suits = ['dragon', 'wind', 'wan', 'sou', 'pin'];
        isCompleted = suits.some(s => {
          return matchedPool.filter(t => t.suit === s).length >= 10;
        });
      } else if (yaku.reqs === 'combo-5') {
        // Score based milestone
        isCompleted = matchedPool.length >= 14; 
      }

      if (isCompleted) {
        yakuFound = true;
        yakuName = yaku.name;
        
        // Add Yaku score bonus
        setScore(prev => {
          const sBonus = prev + yaku.points;
          if (sBonus > highScore) {
            localStorage.setItem('mahjong_big_highscore', String(sBonus));
          }
          return sBonus;
        });

        return { ...yaku, isUnlocked: true };
      }

      return yaku;
    });

    if (yakuFound) {
      setLastUnlockedYaku(yakuName);
      setYakuHands(nextYaku);
      playSound('yaku');
      triggerHostMood('victory');
      setTimeout(() => {
        setLastUnlockedYaku(null);
      }, 5000);
    }
  };

  // Check overall Victory / Defeat outcome whenever board state changes
  useEffect(() => {
    if (gameState !== 'playing') return;

    const remainingOnBoard = boardTiles.filter(t => !t.isMatched).length;
    const itemsInTray = trayTiles.length;

    // Victory: No tiles remaining on board and tray empty
    if (remainingOnBoard === 0 && itemsInTray === 0) {
      setGameState('won');
      playSound('win');
      triggerHostMood('victory');
      setActiveMessage('👑 【祥瑞圓滿・大吉大利】！閣下慧眼奪目，成功降服了所有大牌，晉升為新一代雀仙之皇！✨');
      return;
    }

    // Checking if there are any playable pairs at all (on-board or between board and tray)
    // A playable pair exists if:
    // a) A free tile of symbol X matches another free tile of symbol X
    // b) A free tile of symbol X matches a tile of symbol X already sitting inside the tray
    const freeTiles = boardTiles.filter(t => !t.isMatched && !isTileBlocked(t));

    let hasMoves = false;

    // Check matches inside tray vs free tiles
    for (const freeT of freeTiles) {
      if (trayTiles.some(trayT => trayT.symbol === freeT.symbol)) {
        hasMoves = true;
        break;
      }
    }

    // Check match pairs among free tiles themselves
    if (!hasMoves) {
      for (let i = 0; i < freeTiles.length; i++) {
        for (let j = i + 1; j < freeTiles.length; j++) {
          if (freeTiles[i].symbol === freeTiles[j].symbol) {
            hasMoves = true;
            break;
          }
        }
        if (hasMoves) break;
      }
    }

    // Defeat block check:
    // If no moves are left, AND tray is full OR shuffle is exhausted, player might be locked.
    // However, to make this game highly friendly, we do not abruptly crash. Instead we hint them to use the "shuffle" powerup!
    if (!hasMoves && remainingOnBoard > 0) {
      // If tray is full, they are genuinely lost!
      if (itemsInTray >= 4) {
        setGameState('lost');
        playSound('lost');
        triggerHostMood('sad');
        setActiveMessage('🕯️ 【棋局凝滯】聚寶盆已滿且棋盤無可配對。别氣餒！大師亦有失手時，何不點擊「重新起局」再求一卦？ 🐇');
      }
    }
  }, [boardTiles, trayTiles, gameState]);

  // POWERUP 1: Hint Helper (透視天眼)
  // Finds any playable match on the board or with the tray
  const triggerHint = () => {
    if (gameState !== 'playing' || hintCooldown) return;

    const freeTiles = boardTiles.filter(t => !t.isMatched && !isTileBlocked(t));
    
    // Check match with tray
    for (const freeT of freeTiles) {
      const matchInTray = trayTiles.find(t => t.symbol === freeT.symbol);
      if (matchInTray) {
        setHintIndex([freeT.id]);
        setActiveMessage(`🔍 雀仙密啟：聚寶盆中的【${freeT.label}】可以跟棋盤頂端的對應牌立即消除！`);
        playSound('select');
        return;
      }
    }

    // Check matching pair in free tiles
    for (let i = 0; i < freeTiles.length; i++) {
      for (let j = i + 1; j < freeTiles.length; j++) {
        if (freeTiles[i].symbol === freeTiles[j].symbol) {
          setHintIndex([freeTiles[i].id, freeTiles[j].id]);
          setActiveMessage(`🔍 雀仙指引：看見了！【${freeTiles[i].label}】與【${freeTiles[j].label}】正隱居可消位置！`);
          playSound('select');
          
          setHintCooldown(true);
          setTimeout(() => setHintCooldown(false), 3000); // 3 sec reuse cooldown
          return;
        }
      }
    }

    showAlertMsg('🔮 算卦顯示：當前牌桌已無直接自由配對，請儘快點擊「神符重排」來解碼活局！');
  };

  // POWERUP 2: Hand Reshuffle (乾坤大挪移)
  // Keeps coordinates but shuffles symbols to guarantee matching paths
  const triggerReshuffle = () => {
    if (gameState !== 'playing') return;

    const unmatchedTiles = boardTiles.filter(t => !t.isMatched);
    if (unmatchedTiles.length <= 1) return;

    // Extrapolate list of unmatched symbols
    const symbolsPool = unmatchedTiles.map(t => ({
      symbol: t.symbol,
      label: t.label,
      suit: t.suit,
      color: t.color
    }));

    // Shuffle symbols array
    for (let i = symbolsPool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = symbolsPool[i];
      symbolsPool[i] = symbolsPool[j];
      symbolsPool[j] = temp;
    }

    // Map back onto existing physical spatial coordinates
    let index = 0;
    const nextTiles = boardTiles.map(original => {
      if (original.isMatched) return original;
      const shuf = symbolsPool[index++];
      return {
        ...original,
        symbol: shuf.symbol,
        label: shuf.label,
        suit: shuf.suit,
        color: shuf.color
      };
    });

    setBoardTiles(nextTiles);
    setHintIndex([]);
    playSound('shuffle');
    triggerHostMood('happy');
    setActiveMessage('✨ 乾坤大挪移！閣主施展瑞氣大手印，洗牌福運，新路開啟！🌱');
  };

  // Return to tray tiles back to the board (Undo/Release Basin)
  // Extremely friendly feature!
  const handleRemoveFromTray = (trayTile: TileInstance) => {
    // Return tile to board (mark as unmatched)
    setBoardTiles(prev => prev.map(t => {
      if (t.id === trayTile.id) return { ...t, isMatched: false };
      return t;
    }));
    
    // Remove from tray layout
    setTrayTiles(prev => prev.filter(t => t.id !== trayTile.id));
    playSound('select');
    setActiveMessage(`📤 已將【${trayTile.label}】移回牌堆！位置重排`);
  };

  return (
    <div className="p-4 md:p-6 text-slate-800 text-left relative max-w-[1120px] mx-auto animate-in fade-in duration-300">
      
      {/* Decorative Full-screen Yaku Gong Banner overlay */}
      <AnimatePresence>
        {lastUnlockedYaku && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed inset-0 m-auto z-50 w-full max-w-sm h-fit bg-gradient-to-br from-amber-400 via-rose-500 to-amber-500 rounded-3xl p-6 border-4 border-yellow-200 text-center text-white shadow-2xl space-y-3 pointer-events-none"
          >
            <div className="text-5xl animate-bounce">🀄🧧✨</div>
            <h3 className="text-xl font-black tracking-tight text-yellow-100">【{lastUnlockedYaku}】</h3>
            <p className="text-xs font-semibold">恭喜閣下湊成祥瑞大牌！福澤連連，福氣分數大加持！🐾</p>
            <div className="bg-white/10 text-[10px] uppercase tracking-widest py-1 px-3 rounded-full font-bold w-fit mx-auto">
              LUCKY BLESSING ACTIVE
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Grid Wrapper */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left column info & control box */}
        <div className="lg:col-span-8 flex flex-col gap-5">
          
          {/* Main Top Header Details */}
          <div className="bg-gradient-to-r from-teal-50/60 via-[#fef9c3]/30 to-pink-50/40 p-5 rounded-3xl border-2 border-emerald-50 shadow-sm relative overflow-hidden flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            
            {/* Title / Description */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="bg-emerald-200 text-[#1b6b4f] text-[9px] uppercase tracking-widest font-black px-2 py-0.5 rounded-full">
                  MAHJONG BIG SOLITAIRE
                </span>
                <span className="text-[10px] text-gray-400 font-bold">• 萌仙吉兆雀神樂</span>
              </div>
              <h2 className="text-xl font-black tracking-tight text-gray-800">萌仙吉兆雀神樂 🀄</h2>
              <p className="text-slate-500 font-semibold text-xs max-w-md">
                點擊邊緣無遮蓋的牌存入聚寶盆，2張相同即可配對消除！湊齊特定大牌（如大三元、四風等）更有神諭加成！
              </p>
            </div>

            {/* Score box */}
            <div className="flex gap-3 shrink-0">
              <div className="bg-white border border-yellow-100 px-4 py-2.5 rounded-2xl text-center shadow-sm relative min-w-[100px]">
                <span className="block text-[9px] text-yellow-600 font-extrabold uppercase tracking-wider">
                  吉兆神氣分
                </span>
                <span className="text-lg font-black text-amber-700">{score}</span>
              </div>
              <div className="bg-slate-50 border border-slate-100 px-4 py-2.5 rounded-2xl text-center shadow-sm min-w-[100px]">
                <span className="block text-[9px] text-gray-400 font-black uppercase tracking-wider flex items-center justify-center gap-1">
                  <Trophy className="w-3 h-3 text-yellow-500" /> 高分紀錄
                </span>
                <span className="text-lg font-black text-slate-700">{highScore}</span>
              </div>
            </div>
          </div>

          {/* Active Gaming Stage Box */}
          <div 
            id="mahjong-table-surface"
            className="bg-stone-100/40 rounded-3xl border-4 border-stone-200 p-6 shadow-inner relative overflow-hidden flex flex-col items-center justify-center min-h-[460px]"
            style={{
              backgroundImage: 'radial-gradient(circle, #f3efe5 0%, #e0d8c8 100%)',
            }}
          >
            {/* Soft decorative background Chinese gold coin stamps */}
            <div className="absolute inset-0 opacity-[0.03] select-none pointer-events-none text-9xl font-black font-serif flex items-center justify-center text-rose-950">
              福 🀄 祿 喜
            </div>

            {/* Host status and speech balloon */}
            <div className="absolute top-3 left-4 flex items-center gap-3 z-20">
              {/* Host avatar */}
              <div className="relative">
                <div className="w-14 h-14 bg-[#fae8ff] border-2 border-pink-200 rounded-full flex items-center justify-center text-3xl shadow-md cursor-pointer animate-bounce">
                  🐧
                </div>
                {/* Host indicator tag */}
                <span className="absolute -bottom-1 -right-1 bg-pink-100 text-pink-700 ring-2 ring-white text-[8px] font-extrabold px-1.5 py-0.5 rounded-full">
                  胖胖
                </span>
              </div>

              {/* Speech bubble */}
              <div className="bg-white shadow-md border border-pink-100 rounded-2xl p-2.5 max-w-xs relative text-xs font-semibold text-slate-700">
                {/* Arrow */}
                <div className="absolute top-1/2 -left-2 w-0 h-0 border-t-4 border-b-4 border-r-8 border-t-transparent border-b-transparent border-r-white -translate-y-1/2"></div>
                <p>
                  {hostMood === 'idle' && '🀄：來碰個大三元讓胖胖瞧瞧吉祥！'}
                  {hostMood === 'happy' && '🎉：精彩！這牌消得真是妙筆生花！'}
                  {hostMood === 'thinking' && '🧐：嗯... 被壓住的牌是不可以點的噢！'}
                  {hostMood === 'victory' && '👑：福光滿面啊！高分好運滾滾來！'}
                  {hostMood === 'sad' && '💦：不妙，看來前路被阻隔了，洗洗牌？'}
                </p>
              </div>
            </div>

            {/* Layout control tray */}
            <div className="absolute top-4 right-4 flex gap-1.5 z-20">
              <button
                onClick={() => { setActiveBoardName('pyramid'); }}
                className={`py-1.5 px-3 rounded-xl font-bold text-[10px] border transition-all ${
                  activeBoardName === 'pyramid'
                    ? 'bg-[#1b6b4f] text-white border-emerald-900 shadow-sm'
                    : 'bg-white hover:bg-stone-50 text-slate-600 border-stone-200'
                }`}
              >
                金字塔 ( Pyramid )
              </button>
              <button
                onClick={() => { setActiveBoardName('bagua'); }}
                className={`py-1.5 px-3 rounded-xl font-bold text-[10px] border transition-all ${
                  activeBoardName === 'bagua'
                    ? 'bg-[#1b6b4f] text-white border-emerald-900 shadow-sm'
                    : 'bg-white hover:bg-stone-50 text-slate-600 border-stone-200'
                }`}
              >
                太極圖 ( Circular )
              </button>
              <button
                onClick={() => { setActiveBoardName('gate'); }}
                className={`py-1.5 px-3 rounded-xl font-bold text-[10px] border transition-all ${
                  activeBoardName === 'gate'
                    ? 'bg-[#1b6b4f] text-white border-emerald-900 shadow-sm'
                    : 'bg-white hover:bg-stone-50 text-slate-600 border-stone-200'
                }`}
              >
                如意拱門 ( Symmetrical )
              </button>
            </div>

            {/* Board representation arena */}
            <div className="relative w-full max-w-[550px] aspect-[4/3] flex items-center justify-center my-6">
              
              {gameState === 'playing' ? (
                <div className="relative w-full h-full">
                  {boardTiles.map((tile) => {
                    const isBlockedStatus = isTileBlocked(tile);
                    const isHinted = hintIndex.includes(tile.id);
                    
                    // Spatial positioning translations from abstract layout grid (assuming scale grid limits x: 0 to 11, y: 0 to 7)
                    // Transform coordinates perfectly centering within boundaries
                    const leftPercent = 5 + (tile.x * 7.5); // x offset %
                    const topPercent = 12 + (tile.y * 10); // y offset %
                    
                    // Z index based stacking order
                    const currentZIndex = 10 + tile.z;

                    return (
                      <AnimatePresence key={tile.id}>
                        {!tile.isMatched && (
                          <motion.button
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            onClick={() => handleTileClick(tile)}
                            className={`absolute select-none pointer-events-auto transition-transform ${tile.color} duration-200`}
                            style={{
                              left: `${leftPercent}%`,
                              top: `${topPercent}%`,
                              zIndex: currentZIndex,
                              width: '44px',
                              height: '56px',
                            }}
                          >
                            {/* Handcarved physical 3D traditional ivory tile visual structure */}
                            <div 
                              className={`w-full h-full rounded-md flex flex-col justify-between p-1 bg-[#fffbf2] border-2 shadow-md relative group transition-all-300 ${
                                isBlockedStatus 
                                  ? 'brightness-75 border-[#d6cfb8] opacity-80 cursor-not-allowed' 
                                  : 'border-[#dfd7c2] active:translate-y-0.5 cursor-pointer hover:scale-105 active:scale-95'
                              } ${
                                isHinted 
                                  ? 'ring-4 ring-yellow-400 animate-pulse border-yellow-400 scale-105 shadow-xl bg-amber-50' 
                                  : ''
                              }`}
                              style={{
                                // Custom layer lateral offsets to signify real physical thickness
                                transform: `translate3d(${-tile.z * 2}px, ${-tile.z * 3}px, 0)`,
                                boxShadow: `${tile.z * 1}px ${tile.z * 1.5}px 0px #cac2ac, ${tile.z + 2}px ${tile.z + 3}px 6px rgba(0,0,0,0.15)`,
                              }}
                            >
                              
                              {/* Green backing jade edge decoration line */}
                              <div className="absolute right-0 top-0 bottom-0 w-1 bg-emerald-800 rounded-r-md"></div>
                              
                              {/* Standard micro indices top/bottom */}
                              <div className="flex justify-between items-center w-full px-0.5">
                                <span className="text-[7px] font-black tracking-tight">{tile.label}</span>
                                <span className="text-[7px] font-mono font-extrabold">{tile.z + 1}F</span>
                              </div>

                              {/* Central main high quality symbol */}
                              <div className="text-2xl font-black font-serif text-center flex-grow flex items-center justify-center filter drop-shadow">
                                {tile.symbol}
                              </div>

                              {/* Gold trim seal for visual luxury */}
                              <div className="w-full text-right text-[6px] text-amber-500 font-bold px-0.5">
                                吉
                              </div>
                            </div>
                          </motion.button>
                        )}
                      </AnimatePresence>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-8 text-center bg-white/95 rounded-3xl border-2 border-amber-200 shadow-xl max-w-sm mx-auto space-y-4">
                  
                  {gameState === 'won' ? (
                    <>
                      <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center text-5xl animate-bounce shadow-md">
                        👑
                      </div>
                      <h3 className="text-xl font-black text-amber-800 tracking-tight">🎉 恭喜大牌大圓滿！</h3>
                      <p className="text-xs text-slate-600 leading-relaxed font-semibold">
                        閣下思路敏銳、氣勢如虹！手牌已全數消除融合，福運常伴吾身！最終贏得神氣分 <strong>{score}</strong>。
                      </p>
                    </>
                  ) : gameState === 'lost' ? (
                    <>
                      <div className="w-20 h-20 bg-rose-100 rounded-full flex items-center justify-center text-5xl animate-shake shadow-md">
                        🕯️
                      </div>
                      <h3 className="text-xl font-black text-rose-800 tracking-tight">無可消配，牌局已終</h3>
                      <p className="text-xs text-slate-600 leading-relaxed font-semibold">
                        聚寶盆已滿格，或棋牌之上無任何可見連消。別焦慮，萬事皆有起落，請點下方按鈕為自己再求一局好運！
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center text-5xl shadow-md">
                        🀄
                      </div>
                      <h3 className="text-xl font-black text-teal-800 tracking-tight">吉兆雀神樂開局</h3>
                      <p className="text-xs text-slate-600 font-semibold">
                        準備好展現大呼百勝的麻將配對天梯實力了嗎？萌貓閣主胖胖隨時候教！
                      </p>
                    </>
                  )}

                  <button
                    onClick={initializeGame}
                    className="marshmallow-button bg-[#1b6b4f] hover:bg-emerald-700 text-white font-black py-3 px-8 rounded-full text-xs shadow-md shadow-emerald-950/20 duration-150 cursor-pointer"
                  >
                    🎲 即刻開啟好運新局
                  </button>
                </div>
              )}
            </div>

            {/* Notification and warning alert system */}
            <div className="w-full max-w-xl text-center z-10">
              <div 
                className={`inline-block bg-white/95 backdrop-blur-sm border-2 border-stone-200 px-5 py-3 rounded-2xl shadow-md font-bold text-xs max-w-md ${
                  shakeMsgTrigger ? 'animate-shake border-red-300 bg-red-50 text-red-950' : 'text-stone-700 border-yellow-100'
                }`}
              >
                {activeMessage}
              </div>
            </div>
          </div>

          {/* Tray Basin System: 聚寶盆 (Holds up to 4 temporary tiles for match) */}
          <div className="bg-gradient-to-r from-amber-50 to-amber-100/50 rounded-3xl border-2 border-amber-200/60 p-5 shadow-sm">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-xs font-black text-amber-900 flex items-center gap-1">
                <ShoppingBag className="w-4 h-4 text-amber-700" /> 
                暫托聚寶盆（當前: {trayTiles.length}/4 個）
              </h3>
              <span className="text-[10px] text-amber-700 bg-amber-200/50 px-2 py-0.5 rounded-full font-extrabold uppercase tracking-widest">
                AUTOMATIC COMBINE
              </span>
            </div>

            {/* Slot deck */}
            <div className="grid grid-cols-4 gap-4 bg-amber-900/10 p-4 rounded-2xl min-h-[90px] items-center justify-center">
              {Array.from({ length: 4 }).map((_, idx) => {
                const item = trayTiles[idx];
                return (
                  <div
                    key={`slot_${idx}`}
                    className="w-full aspect-[4/5] max-w-[56px] bg-amber-950/25 border-2 border-dashed border-amber-700/30 rounded-xl flex items-center justify-center relative mx-auto"
                  >
                    <AnimatePresence>
                      {item ? (
                        <motion.button
                          initial={{ scale: 0.5, y: -20, opacity: 0 }}
                          animate={{ scale: 1, y: 0, opacity: 1 }}
                          exit={{ scale: 0.5, y: 10, opacity: 0 }}
                          onClick={() => handleRemoveFromTray(item)}
                          title="點選移回上方棋盤自由排序"
                          className={`w-[44px] h-[54px] rounded-lg bg-orange-50 border-2 border-amber-200 ${item.color} flex flex-col justify-between p-1 shadow-md hover:-translate-y-1 transition-all cursor-pointer`}
                        >
                          <span className="text-[7px] font-black">{item.label}</span>
                          <span className="text-2xl font-black font-serif text-center">{item.symbol}</span>
                          <span className="text-[6px] text-stone-400 font-extrabold text-right">盆</span>
                        </motion.button>
                      ) : (
                        <span className="text-amber-800/40 text-[10px] font-bold">空盆</span>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>

            {/* Tool actions shelf */}
            <div className="flex gap-3 justify-end mt-4">
              <button
                onClick={triggerHint}
                disabled={gameState !== 'playing'}
                className="font-black text-[10px] bg-white border border-yellow-200 hover:bg-yellow-50 py-2 px-4 rounded-xl text-amber-800 flex items-center gap-1 shadow-sm transition-all disabled:opacity-50 cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>透視天眼 (HINTS)</span>
              </button>
              
              <button
                onClick={triggerReshuffle}
                disabled={gameState !== 'playing'}
                className="font-black text-[10px] bg-[#1b6b4f] hover:bg-emerald-700 border border-emerald-950 py-2 px-4 rounded-xl text-white flex items-center gap-1 shadow-sm transition-all disabled:opacity-50 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>乾坤重洗 (SHUFFLE)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Matched lists, Fortune Hands, Combo Yaku */}
        <div className="lg:col-span-4 space-y-5">
          
          {/* Audio toggle and initialization helper */}
          <div className="bg-white border border-slate-100 rounded-2xl p-4 flex justify-between items-center shadow-sm">
            <span className="text-xs font-bold text-slate-500">音效切換</span>
            <button
              onClick={() => {
                setSoundEnabled(prev => !prev);
                playSound('select');
              }}
              className="p-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all border border-slate-100 text-slate-600 cursor-pointer"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-[#1b6b4f]" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
            </button>
          </div>

          {/* Master Fortune Hands (Yaku Achievements) */}
          <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-4">
            <div className="border-b pb-3">
              <h3 className="text-xs font-black text-gray-800 uppercase tracking-widest flex items-center gap-1">
                <Award className="w-4 h-4 text-[#1b6b4f]" /> 
                閣內吉兆大牌番
              </h3>
              <p className="text-[10px] text-gray-400 font-bold">配對消除相應花色將觸發大額翻倍金</p>
            </div>

            <div className="space-y-3">
              {yakuHands.map((yaku, idx) => (
                <div 
                  key={`yaku_${idx}`}
                  className={`border rounded-2xl p-3 flex justify-between items-center gap-2 transition-all ${
                    yaku.isUnlocked 
                      ? 'bg-gradient-to-r from-amber-50 to-yellow-100/50 border-amber-300 ring-2 ring-yellow-200' 
                      : 'border-slate-100 bg-stone-50/50'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-black text-slate-800">{yaku.name}</span>
                      <span className="text-lg">{yaku.icon}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-bold leading-relaxed">{yaku.desc}</p>
                    <span className="inline-block text-[9px] text-[#1b6b4f] bg-emerald-50 px-2 py-0.5 rounded font-extrabold uppercase tracking-tight">
                      +{yaku.points} 分數 bonus
                    </span>
                  </div>

                  <div className="shrink-0">
                    {yaku.isUnlocked ? (
                      <span className="bg-amber-100 border border-amber-300 text-amber-800 text-[10px] font-black px-2 py-1 rounded-full animate-pulse shadow-sm">
                        🎉 已自摸!
                      </span>
                    ) : (
                      <span className="bg-slate-100 text-slate-400 text-[10px] font-bold px-2 py-1 rounded-full">
                        待聽牌
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Matched Registry Log (All matches achieved in high fidelity) */}
          <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-3 max-h-[280px] overflow-y-auto">
            <h3 className="text-xs font-black text-gray-800 uppercase tracking-widest flex items-center gap-1 pb-2 border-b">
              <Sparkle className="w-4 h-4 text-emerald-600 animate-pulse" /> 
              本局自摸牌譜 (共 {allMatchedList.length / 2} 對)
            </h3>

            {allMatchedList.length === 0 ? (
              <p className="text-[10px] text-gray-400 text-center py-6 font-semibold">
                尚未與本局配對過任何一雙吉祥玉珠牌...
              </p>
            ) : (
              <div className="grid grid-cols-4 gap-2">
                {allMatchedList.filter((_, idx) => idx % 2 === 0).map((t, idx) => (
                  <div 
                    key={`match_record_${idx}`}
                    className="bg-stone-50 border border-stone-200/80 rounded-xl p-1.5 text-center flex flex-col items-center justify-center relative shadow-sm"
                  >
                    <span className="text-lg">{t.symbol}</span>
                    <span className="text-[8px] text-[#1b6b4f] font-black tracking-tight">{t.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
