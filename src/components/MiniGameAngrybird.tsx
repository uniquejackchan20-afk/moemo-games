/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Trophy, 
  Sparkles, 
  Target, 
  Flame, 
  Award, 
  HelpCircle, 
  RefreshCw,
  ChevronRight,
  Zap,
  Bomb,
  Layers,
  Skull
} from 'lucide-react';

// Define types for coordinate structures
interface Point {
  x: number;
  y: number;
}

// Rigid bodies in the physical simulation
interface PhysicalObject {
  id: string;
  type: 'wood' | 'glass' | 'stone' | 'tnt' | 'enemy';
  shape: 'rect' | 'circle';
  x: number;
  y: number;
  vx: number;
  vy: number;
  width?: number;
  height?: number;
  radius?: number;
  mass: number;
  angle: number;
  angularVelocity: number;
  health: number;
  maxHealth: number;
  scoreValue: number;
}

// Spawning types for Birds
interface BirdConfig {
  type: 'red' | 'blue' | 'yellow' | 'black';
  name: string;
  color: string;
  abilityName: string;
  abilityIcon: string;
  description: string;
  mass: number;
  radius: number;
}

const BIRD_TYPES: BirdConfig[] = [
  { 
    type: 'red', 
    name: '赤炎神雀', 
    color: '#ef4444', 
    abilityName: '重鳴音波', 
    abilityIcon: '🔊', 
    description: '身重如山，發動時釋放擴散音波，將前方障礙硬生震飛！',
    mass: 1.2,
    radius: 14 
  },
  { 
    type: 'blue', 
    name: '碧空幻雀', 
    color: '#06b6d4', 
    abilityName: '流影三分', 
    abilityIcon: '👥', 
    description: '在空中分裂為三隻小神雀，呈扇形大範圍擊打脆弱青瓦！',
    mass: 0.8,
    radius: 11
  },
  { 
    type: 'yellow', 
    name: '金旋風雀', 
    color: '#f59e0b', 
    abilityName: '金光神速', 
    abilityIcon: '⚡', 
    description: '空中點按即刻化為一道金色流光向前直衝，極速刺穿石牆！',
    mass: 1.0,
    radius: 12
  },
  { 
    type: 'black', 
    name: '玄煞火雀', 
    color: '#1e293b', 
    abilityName: '九天玄雷', 
    abilityIcon: '💥', 
    description: '撞擊或點擊時直接引發墨色玄雷大爆炸，移平整座巍峨仙閣！',
    mass: 2.0,
    radius: 17
  }
];

// Sound generator helper
const generateSfx = (type: 'sling' | 'launch' | 'wood_hit' | 'glass_hit' | 'stone_hit' | 'explode' | 'enemy_die' | 'ability' | 'victory' | 'fail' | 'click', enabled: boolean) => {
  if (!enabled) return;
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    if (type === 'sling') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(140, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(260, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc.start();
      osc.stop(ctx.currentTime + 0.16);
    } else if (type === 'launch') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(200, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.25);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      osc.start();
      osc.stop(ctx.currentTime + 0.26);
    } else if (type === 'ability') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(880, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      osc.start();
      osc.stop(ctx.currentTime + 0.11);
    } else if (type === 'wood_hit') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(120, ctx.currentTime);
      osc.frequency.setValueAtTime(80, ctx.currentTime + 0.05);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
      osc.start();
      osc.stop(ctx.currentTime + 0.13);
    } else if (type === 'glass_hit') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(900, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1400, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      osc.start();
      osc.stop(ctx.currentTime + 0.11);
    } else if (type === 'stone_hit') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(80, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.16);
      osc.start();
      osc.stop(ctx.currentTime + 0.17);
    } else if (type === 'explode') {
      // Noise buffer based explosion
      const bufferSize = ctx.sampleRate * 0.45;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(250, ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(10, ctx.currentTime + 0.4);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noise.start();
      noise.stop(ctx.currentTime + 0.45);
    } else if (type === 'enemy_die') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.18);
      gain.gain.setValueAtTime(0.07, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
      osc.start();
      osc.stop(ctx.currentTime + 0.19);
    } else if (type === 'victory') {
      const notes = [293, 330, 392, 440, 587, 659, 880]; // Auspicious Chinese melody
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);
        gain.gain.setValueAtTime(0.05, ctx.currentTime + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.08 + 0.25);
        osc.start(ctx.currentTime + idx * 0.08);
        osc.stop(ctx.currentTime + idx * 0.08 + 0.28);
      });
    } else if (type === 'fail') {
      const notes = [220, 196, 165, 130];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.12);
        gain.gain.setValueAtTime(0.06, ctx.currentTime + idx * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.12 + 0.2);
        osc.start(ctx.currentTime + idx * 0.12);
        osc.stop(ctx.currentTime + idx * 0.12 + 0.22);
      });
    } else if (type === 'click') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(450, ctx.currentTime);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.06);
      osc.start();
      osc.stop(ctx.currentTime + 0.07);
    }
  } catch (e) {
    console.warn("Audio Context failure:", e);
  }
};

// Global constant Slingshot parameters to prevent re-triggering dependency updates on every render
const slingshotPos: Point = { x: 140, y: 270 };
const maxPullRadius = 45;

function checkCollision(objA: PhysicalObject, objB: PhysicalObject): boolean {
  if (objA.shape === 'rect' && objB.shape === 'rect') {
    // Rect-to-Rect AABB intersection check
    const wA = objA.width! / 2;
    const hA = objA.height! / 2;
    const wB = objB.width! / 2;
    const hB = objB.height! / 2;

    return (
      Math.abs(objA.x - objB.x) < (wA + wB) &&
      Math.abs(objA.y - objB.y) < (hA + hB)
    );
  } else if (objA.shape === 'circle' && objB.shape === 'circle') {
    // Circle-to-Circle distance check
    const rA = objA.radius!;
    const rB = objB.radius!;
    const dist = Math.hypot(objA.x - objB.x, objA.y - objB.y);
    return dist < (rA + rB);
  } else {
    // Circle-to-Rect collision check
    const rect = objA.shape === 'rect' ? objA : objB;
    const circle = objA.shape === 'circle' ? objA : objB;

    const halfW = rect.width! / 2;
    const halfH = rect.height! / 2;

    const closestX = Math.max(rect.x - halfW, Math.min(circle.x, rect.x + halfW));
    const closestY = Math.max(rect.y - halfH, Math.min(circle.y, rect.y + halfH));

    const distanceX = circle.x - closestX;
    const distanceY = circle.y - closestY;
    const distanceSquared = (distanceX * distanceX) + (distanceY * distanceY);

    return distanceSquared < (circle.radius! * circle.radius!);
  }
}

export default function MiniGameAngrybird() {
  const [gameState, setGameState] = useState<'idle' | 'aiming' | 'flying' | 'settling' | 'victory' | 'defeat'>('idle');
  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(0);
  const [selectedLevel, setSelectedLevel] = useState<number>(1);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [showHelp, setShowHelp] = useState<boolean>(false);
  const [mascotChat, setMascotChat] = useState<string>('拉開神皇大彈弓，放出五彩怒羽雀！奪回被綠皮包子怪偷走的蟠桃！⚔️🍑');

  // Active state tracks
  const [activeBirdIndex, setActiveBirdIndex] = useState<number>(0);
  const [birdsQueue] = useState<BirdConfig[]>([
    BIRD_TYPES[0], // Red Sprite
    BIRD_TYPES[1], // Blue Splitter
    BIRD_TYPES[2], // Yellow Windseeker
    BIRD_TYPES[3]  // Black Obsidian
  ]);

  const [starsRating, setStarsRating] = useState<number>(0);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const hasLaunchedRef = useRef<boolean>(false);
  const isStructureActiveRef = useRef<boolean>(false);

  // Persistence
  useEffect(() => {
    const saved = localStorage.getItem('minigame_angrybirds_hiscore');
    if (saved) setHighScore(parseInt(saved, 10));
  }, []);

  const triggerSfx = useCallback((type: 'sling' | 'launch' | 'wood_hit' | 'glass_hit' | 'stone_hit' | 'explode' | 'enemy_die' | 'ability' | 'victory' | 'fail' | 'click') => {
    generateSfx(type, soundEnabled);
  }, [soundEnabled]);

  // Rigid engine objects
  const objectsRef = useRef<PhysicalObject[]>([]);
  
  // Active flying single bird ref
  const birdRef = useRef<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    radius: number;
    mass: number;
    type: 'red' | 'blue' | 'yellow' | 'black';
    abilityUsed: boolean;
    hasExploded?: boolean;
    impactCounter?: number;
  } | null>(null);

  // Extra splitted birds for blue bird
  const extraBirdsRef = useRef<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    radius: number;
    type: 'blue';
  }[]>([]);

  // Elastic drag interactions
  const isDraggingRef = useRef<boolean>(false);
  const dragPosRef = useRef<Point>({ x: 140, y: 270 });

  // Trails
  const trailRef = useRef<Point[]>([]);

  // Debris animation
  const debrisRef = useRef<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    color: string;
    alpha: number;
    life: number;
    maxLife: number;
    angle: number;
    shape: 'rect' | 'circle';
  }[]>([]);

  // Score Popups
  const scorePopupsRef = useRef<{
    x: number;
    y: number;
    text: string;
    color: string;
    life: number;
    maxLife: number;
  }[]>([]);

  // Level loaders
  const loadLevels = useCallback((levelNum: number) => {
    hasLaunchedRef.current = false;
    isStructureActiveRef.current = false;
    const arr: PhysicalObject[] = [];

    // Helper to spawn blocks
    const addBlock = (id: string, type: 'wood' | 'glass' | 'stone' | 'tnt', shape: 'rect'|'circle', x: number, y: number, wOrRadius: number, h?: number) => {
      let maxH = 100;
      let m = 1.0;
      let scoreVal = 100;

      if (type === 'wood') {
        maxH = 150;
        m = 1.2;
        scoreVal = 120;
      } else if (type === 'glass') {
        maxH = 60;
        m = 0.8;
        scoreVal = 150;
      } else if (type === 'stone') {
        maxH = 400;
        m = 2.8;
        scoreVal = 200;
      } else if (type === 'tnt') {
        maxH = 20;
        m = 1.0;
        scoreVal = 500;
      }

      arr.push({
        id,
        type,
        shape,
        x,
        y,
        vx: 0,
        vy: 0,
        width: shape === 'rect' ? wOrRadius : undefined,
        height: shape === 'rect' ? h : undefined,
        radius: shape === 'circle' ? wOrRadius : undefined,
        mass: m,
        angle: 0,
        angularVelocity: 0,
        health: maxH,
        maxHealth: maxH,
        scoreValue: scoreVal
      });
    };

    // Helper to spawn enemy imps
    const addEnemy = (id: string, x: number, y: number, radius: number) => {
      arr.push({
        id,
        type: 'enemy',
        shape: 'circle',
        x,
        y,
        vx: 0,
        vy: 0,
        radius,
        mass: 1.5,
        angle: 0,
        angularVelocity: 0,
        health: 50,
        maxHealth: 50,
        scoreValue: 1000
      });
    };

    if (levelNum === 1) {
      // LEVEL 1: Clean easy wooden gate (Auspicious Pavilion Portal)
      // Base wood floor resting exactly on the ground floor (bottom = 360)
      addBlock('wood_floor', 'wood', 'rect', 480, 352, 120, 16);
      
      // Pillars on sides sitting exactly on bottom base (bottom = 344)
      addBlock('wood_pil_left', 'wood', 'rect', 440, 304, 16, 80);
      addBlock('wood_pil_right', 'wood', 'rect', 520, 304, 16, 80);

      // Transverse header sitting exactly on pillars (bottom = 264)
      addBlock('wood_roof', 'wood', 'rect', 480, 256, 140, 16);

      // Glass decorative crown sitting exactly on roof (bottom = 248)
      addBlock('decor_glass', 'glass', 'circle', 480, 236, 12);

      // Target Enemy seated under roof on the floor (bottom = 344)
      addEnemy('enemy_master', 480, 330, 14);
    } 

    else if (levelNum === 2) {
      // LEVEL 2: Double-gabled pagoda with TNT (Fortress of Greedy Imps)
      // Heavy stone base sitting directly on ground floor
      addBlock('stone_base', 'stone', 'rect', 480, 350, 140, 20);

      // Ground deck pillars sitting exactly on foundation
      addBlock('wood_1', 'wood', 'rect', 420, 300, 16, 80);
      addBlock('wood_2', 'wood', 'rect', 540, 300, 16, 80);

      // TNT barrel seated center
      addBlock('barrel_tnt', 'tnt', 'circle', 480, 328, 12);

      // Glass bridge holding level 2 sitting exactly on columns
      addBlock('bridge_glass', 'glass', 'rect', 480, 253, 150, 14);

      // Level 2 columns sitting exactly on bridge
      addBlock('glass_col_left', 'glass', 'rect', 440, 221, 14, 50);
      addBlock('glass_col_right', 'glass', 'rect', 520, 221, 14, 50);

      // Stone cap sitting exactly on upper columns
      addBlock('stone_cap', 'stone', 'rect', 480, 188, 110, 16);

      // Level 2 targets
      addEnemy('enemy_top', 480, 169, 11);
      addEnemy('enemy_mid', 480, 235, 11);
    } 
    else {
      // LEVEL 3: Celestial Palace Triple Scaffold (High difficulty stone fort)
      // Heavy stone pillars sitting directly on the ground
      addBlock('stone_col_1', 'stone', 'rect', 410, 320, 18, 80);
      addBlock('stone_col_2', 'stone', 'rect', 480, 320, 18, 80);
      addBlock('stone_col_3', 'stone', 'rect', 550, 320, 18, 80);

      // Lower wood decks sitting exactly on pillars
      addBlock('beam_wood_lower_l', 'wood', 'rect', 480, 272, 170, 16);

      // Second story glass columns sitting exactly on wood deck
      addBlock('upper_glass_l', 'glass', 'rect', 435, 234, 14, 60);
      addBlock('upper_glass_r', 'glass', 'rect', 525, 234, 14, 60);

      // Stone cap sitting exactly on upper columns
      addBlock('stone_cap', 'stone', 'rect', 480, 196, 120, 16);

      // Explosives TNT on platform
      addBlock('tnt_l', 'tnt', 'circle', 480, 252, 12);

      // Three Boss Pig Imps
      addEnemy('imp_l', 445, 348, 12);
      addEnemy('imp_r', 515, 348, 12);
      addEnemy('imp_king', 480, 174, 14);
    }

    objectsRef.current = arr;
    birdRef.current = null;
    extraBirdsRef.current = [];
    trailRef.current = [];
    debrisRef.current = [];
    scorePopupsRef.current = [];
    isDraggingRef.current = false;
    dragPosRef.current = { ...slingshotPos };
  }, [slingshotPos]);

  // Soft starter
  useEffect(() => {
    loadLevels(selectedLevel);
    setGameState('aiming');
  }, [selectedLevel, loadLevels]);

  // Helper calculation
  const getVelocityFromPull = (pullPos: Point): Point => {
    // vector from pullPos to slingshotPos
    const dx = slingshotPos.x - pullPos.x;
    const dy = slingshotPos.y - pullPos.y;
    // Slingshot velocity scale multiplier
    return {
      x: dx * 0.17,
      y: dy * 0.17
    };
  };

  const getDottedParabolaPoints = (): Point[] => {
    if (gameState !== 'aiming') return [];
    
    const points: Point[] = [];
    const pull = dragPosRef.current;
    const vel = getVelocityFromPull(pull);
    
    let x = slingshotPos.x;
    let y = slingshotPos.y;
    let vx = vel.x;
    let vy = vel.y;

    for (let i = 0; i < 22; i++) {
      if (i % 2 === 0) {
        points.push({ x, y });
      }
      x += vx;
      y += vy;
      vy += 0.22; // simulated grav loop
    }
    return points;
  };

  // Launch currently held bird
  const launchBird = () => {
    const currentBirdType = birdsQueue[activeBirdIndex];
    if (!currentBirdType) return;

    const pull = dragPosRef.current;
    const vel = getVelocityFromPull(pull);

    // Limit minimal pulls
    const dist = Math.hypot(pull.x - slingshotPos.x, pull.y - slingshotPos.y);
    if (dist < 6) return;

    triggerSfx('launch');
    birdRef.current = {
      x: slingshotPos.x,
      y: slingshotPos.y,
      vx: vel.x,
      vy: vel.y,
      radius: currentBirdType.radius,
      mass: currentBirdType.mass,
      type: currentBirdType.type,
      abilityUsed: false
    };

    setGameState('flying');
    hasLaunchedRef.current = true;
    trailRef.current = [];
    
    const messages = [
      '嗖！神雀穿空！衝擊敵陣！🔥🐦',
      '看我流星神雀印！碎裂九天！💫☄️',
      '玄雷將至！九關振響！💥🏰',
      '一擊必殺！看招！🎯🍃'
    ];
    setMascotChat(messages[Math.floor(Math.random() * messages.length)]);
  };

  // Activate Bird Ability Mid-air
  const triggerAbility = () => {
    const b = birdRef.current;
    if (!b || b.abilityUsed) return;

    b.abilityUsed = true;
    triggerSfx('ability');

    if (b.type === 'red') {
      // 赤羽雀 Red Sprite soundwave compression shock!
      isStructureActiveRef.current = true;
      // Instantly push all nearby physical objects with outward blast force!
      objectsRef.current.forEach(obj => {
        const dx = obj.x - b.x;
        const dy = obj.y - b.y;
        const distance = Math.hypot(dx, dy);
        if (distance < 110) {
          const force = (110 - distance) * 0.14;
          const angle = Math.atan2(dy, dx);
          obj.vx += Math.cos(angle) * force;
          obj.vy += Math.sin(angle) * force;
          obj.health -= 35; // direct soundwave damage!
        }
      });

      // Spawn visual ripple shock rings
      for (let i = 0; i < 15; i++) {
        const ang = (i / 15) * Math.PI * 2;
        debrisRef.current.push({
          x: b.x,
          y: b.y,
          vx: Math.cos(ang) * 4.5,
          vy: Math.sin(ang) * 4.5,
          size: Math.random() * 3 + 2,
          color: '#fa5252',
          alpha: 1,
          life: 0,
          maxLife: 30,
          angle: ang,
          shape: 'circle'
        });
      }

      setMascotChat('喝！赤羽雀神威震地！九百里音波轟鳴撕裂結構！🔊💥');
      scorePopupsRef.current.push({
        x: b.x,
        y: b.y - 15,
        text: '重鳴碎骨波!',
        color: '#ef4444',
        life: 0,
        maxLife: 45
      });
    } 
    else if (b.type === 'blue') {
      // 藍羽雀 Blue Splitter split into 3 birds!
      const currentSpeed = Math.hypot(b.vx, b.vy);
      const angle = Math.atan2(b.vy, b.vx);

      // Bird 1: slightly upwards
      const b1 = {
        x: b.x,
        y: b.y - 6,
        vx: Math.cos(angle + 0.18) * currentSpeed,
        vy: Math.sin(angle + 0.18) * currentSpeed,
        radius: b.radius - 2,
        type: 'blue' as const
      };

      // Bird 2: slightly downwards
      const b2 = {
        x: b.x,
        y: b.y + 6,
        vx: Math.cos(angle - 0.18) * currentSpeed,
        vy: Math.sin(angle - 0.18) * currentSpeed,
        radius: b.radius - 2,
        type: 'blue' as const
      };

      extraBirdsRef.current.push(b1, b2);
      
      // Make main bird smaller too
      b.radius -= 2;

      setMascotChat('謔！碧空幻雀一分為三！大範圍清掃青瓦樓頂！👥✨');
      scorePopupsRef.current.push({
        x: b.x,
        y: b.y - 15,
        text: '三分流影化身!',
        color: '#22d3ee',
        life: 0,
        maxLife: 45
      });
    } 
    else if (b.type === 'yellow') {
      // 黃風雀 Yellow Windseeker acceleration thrust dash!
      const speed = Math.hypot(b.vx, b.vy);
      const angle = Math.atan2(b.vy, b.vx);
      const newSpeed = Math.max(speed * 2.2, 14.0); // Extreme golden speed boost!

      b.vx = Math.cos(angle) * newSpeed;
      b.vy = Math.sin(angle) * newSpeed;

      // Spawn sonic spark lines
      for (let i = 0; i < 10; i++) {
        debrisRef.current.push({
          x: b.x - Math.cos(angle) * i * 3,
          y: b.y - Math.sin(angle) * i * 3,
          vx: -b.vx * 0.1,
          vy: -b.vy * 0.1,
          size: Math.random() * 3 + 1,
          color: '#fbbf24',
          alpha: 0.9,
          life: 0,
          maxLife: 15,
          angle: angle,
          shape: 'rect'
        });
      }

      setMascotChat('好個白虹貫日！黃風嘯天，直破石門！⚡🎖️');
      scorePopupsRef.current.push({
        x: b.x,
        y: b.y - 15,
        text: '金光遁！',
        color: '#fbbf24',
        life: 0,
        maxLife: 45
      });
    } 
    else if (b.type === 'black') {
      // 玄煞火雀 Black Obsidian instablast explosion!
      triggerExplosion(b.x, b.y, 110);
    }
  };

  // Explosion mechanic
  const triggerExplosion = (ex: number, ey: number, radius: number) => {
    isStructureActiveRef.current = true;
    if (birdRef.current?.type === 'black') {
      birdRef.current.hasExploded = true;
    }

    triggerSfx('explode');

    // Inflict high blast damage and force vectors in radius
    objectsRef.current.forEach(obj => {
      const dx = obj.x - ex;
      const dy = obj.y - ey;
      const dist = Math.hypot(dx, dy);
      if (dist < radius) {
        const force = (radius - dist) * 0.22;
        const angle = Math.atan2(dy, dx);
        obj.vx += Math.cos(angle) * force;
        obj.vy += Math.sin(angle) * force;
        obj.health -= 120; // High explosive damage
      }
    });

    // Ink clouds & fire flower display particles
    for (let i = 0; i < 35; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 7 + 2;
      const isRed = Math.random() > 0.5;
      debrisRef.current.push({
        x: ex,
        y: ey,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 11 + 4,
        color: isRed ? '#f97316' : '#27272a', // orange & charcoal ink
        alpha: 0.9,
        life: 0,
        maxLife: Math.random() * 20 + 25,
        angle: angle,
        shape: 'circle'
      });
    }

    setMascotChat('轟天烈地！玄煞火雀引燃真氣爆炸，滿山飛瓦！🎆🌋');
    scorePopupsRef.current.push({
      x: ex,
      y: ey - 22,
      text: '玄煞真火劫!',
      color: '#f97316',
      life: 0,
      maxLife: 55
    });
  };

  // Reset/Reset level completely
  const resetLevel = () => {
    triggerSfx('click');
    loadLevels(selectedLevel);
    setScore(0);
    setActiveBirdIndex(0);
    setGameState('aiming');
    setMascotChat('陣前重整兵馬，大仙定能百發百中，凱旋而歸！🏹🍑');
  };

  // Next level trigger
  const goToNextLevel = () => {
    triggerSfx('click');
    const nextLvl = selectedLevel === 3 ? 1 : selectedLevel + 1;
    setSelectedLevel(nextLvl);
    setScore(0);
    setActiveBirdIndex(0);
    setGameState('aiming');
    setMascotChat(`升九霄入第 ${nextLvl} 仙閣！精怪更頑固了，快去迎敵！⚔️🛡️`);
  };

  // Physics and Render main loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const width = 640;
    const height = 400;
    canvas.width = width;
    canvas.height = height;

    const gravity = 0.22;

    const gameTick = () => {
      // 1. UPDATE FLYING BIRDS (MAIN BIRD + EXTRAS)
      let currentActiveBird = birdRef.current;

      if (gameState === 'flying' && currentActiveBird) {
        // Save current bird coordinates to trail
        if (Math.random() > 0.4) {
          trailRef.current.push({ x: currentActiveBird.x, y: currentActiveBird.y });
          if (trailRef.current.length > 20) {
            trailRef.current.shift();
          }
        }

        // Apply physics to main sparrow
        currentActiveBird.vy += gravity;
        currentActiveBird.x += currentActiveBird.vx;
        currentActiveBird.y += currentActiveBird.vy;

        // Apply drag/friction air resistance
        currentActiveBird.vx *= 0.995;
        currentActiveBird.vy *= 0.995;

        // Ground/Wall boundaries check for active bird
        if (currentActiveBird.y > height - 40 - currentActiveBird.radius) {
          currentActiveBird.y = height - 40 - currentActiveBird.radius;
          currentActiveBird.vx *= 0.7; // roll on floor friction
          currentActiveBird.vy = -currentActiveBird.vy * 0.4; // bounce
          
          if (Math.abs(currentActiveBird.vy) < 0.5) currentActiveBird.vy = 0;

          // Black bird auto-explodes on heavy impact with ground!
          if (currentActiveBird.type === 'black' && !currentActiveBird.hasExploded) {
            triggerExplosion(currentActiveBird.x, currentActiveBird.y, 110);
          }
        }

        // Boundaries exit safely
        if (currentActiveBird.x > width + 40 || currentActiveBird.x < -30) {
          // Retire this bird, check if any remaining objects and decide next
          retireActiveBird();
        }

        // Check if bird has stopped moving completely on floor
        const speed = Math.hypot(currentActiveBird.vx, currentActiveBird.vy);
        if (speed < 0.2 && currentActiveBird.y >= height - 40 - currentActiveBird.radius - 2) {
          if (currentActiveBird.impactCounter === undefined) {
            currentActiveBird.impactCounter = 0;
          }
          currentActiveBird.impactCounter++;
          if (currentActiveBird.impactCounter > 60) {
            // Explode black bird if it hasn't before settling!
            if (currentActiveBird.type === 'black' && !currentActiveBird.hasExploded) {
              triggerExplosion(currentActiveBird.x, currentActiveBird.y, 110);
            }
            retireActiveBird();
          }
        }

        // 2. EXTRA DISSOCIATED BIRDS COLLISION & PHYSICS
        extraBirdsRef.current.forEach((eb, idx) => {
          eb.vy += gravity;
          eb.x += eb.vx;
          eb.y += eb.vy;

          if (eb.y > height - 40 - eb.radius) {
            eb.y = height - 40 - eb.radius;
            eb.vx *= 0.7;
            eb.vy = -eb.vy * 0.4;
          }

          // Check hit with objects
          objectsRef.current.forEach(obj => {
            if (obj.health <= 0) return;

            let hited = false;
            if (obj.shape === 'rect') {
              hited = (
                eb.x + eb.radius > obj.x - (obj.width! / 2) &&
                eb.x - eb.radius < obj.x + (obj.width! / 2) &&
                eb.y + eb.radius > obj.y - (obj.height! / 2) &&
                eb.y - eb.radius < obj.y + (obj.height! / 2)
              );
            } else {
              const distance = Math.hypot(eb.x - obj.x, eb.y - obj.y);
              hited = distance < (eb.radius + obj.radius!);
            }

            if (hited) {
              isStructureActiveRef.current = true;
              const impactSpeed = Math.hypot(eb.vx, eb.vy);
              obj.health -= impactSpeed * 32;
              
              // Bounce
              eb.vx = -eb.vx * 0.4;
              eb.vy = -eb.vy * 0.4;

              // Play minor splinter sound
              triggerSfx(obj.type === 'glass' ? 'glass_hit' : 'wood_hit');

              // Create minor splatter debris
              for (let d = 0; d < 3; d++) {
                debrisRef.current.push({
                  x: eb.x,
                  y: eb.y,
                  vx: (Math.random() - 0.5) * 3,
                  vy: (Math.random() - 0.5) * 3,
                  size: Math.random() * 4 + 2,
                  color: obj.type === 'wood' ? '#854d0e' : '#22d3ee',
                  alpha: 1,
                  life: 0,
                  maxLife: 20,
                  angle: Math.random() * Math.PI,
                  shape: 'rect'
                });
              }
            }
          });
        });
      }

      // 3. COLLISION: FLYING BIRD vs PHYSICAL BLOCKS
      currentActiveBird = birdRef.current;
      if (gameState === 'flying' && currentActiveBird && !currentActiveBird.hasExploded) {
        objectsRef.current.forEach(obj => {
          if (obj.health <= 0) return;

          let isCollision = false;

          if (obj.shape === 'rect') {
            // AABB with circle
            const halfW = obj.width! / 2;
            const halfH = obj.height! / 2;
            const closestX = Math.max(obj.x - halfW, Math.min(currentActiveBird!.x, obj.x + halfW));
            const closestY = Math.max(obj.y - halfH, Math.min(currentActiveBird!.y, obj.y + halfH));
            
            const distanceX = currentActiveBird!.x - closestX;
            const distanceY = currentActiveBird!.y - closestY;
            const distanceSquared = (distanceX * distanceX) + (distanceY * distanceY);
            
            isCollision = distanceSquared < (currentActiveBird!.radius * currentActiveBird!.radius);
          } else {
            // Circle with circle
            const dist = Math.hypot(currentActiveBird!.x - obj.x, currentActiveBird!.y - obj.y);
            isCollision = dist < (currentActiveBird!.radius + obj.radius!);
          }

          if (isCollision) {
            isStructureActiveRef.current = true;
            // Resolve Impact vector
            const speed = Math.hypot(currentActiveBird!.vx, currentActiveBird!.vy);
            
            // Apply damage based on speed and mass
            const damage = speed * 42 * currentActiveBird!.mass;
            obj.health -= damage;

            // Trigger acoustic hits
            if (obj.type === 'wood') triggerSfx('wood_hit');
            else if (obj.type === 'glass') triggerSfx('glass_hit');
            else if (obj.type === 'stone') triggerSfx('stone_hit');
            else if (obj.type === 'tnt') {
              // TNT barrel immediate trigger explode!
              obj.health = 0;
              triggerExplosion(obj.x, obj.y, 110);
            } else if (obj.type === 'enemy') {
              triggerSfx('enemy_die');
              obj.health = 0; // immediate pop on direct bird hit!
            }

            // Push object based on bird velocity
            obj.vx += currentActiveBird!.vx * 0.45 * (currentActiveBird!.mass / obj.mass);
            obj.vy += currentActiveBird!.vy * 0.45 * (currentActiveBird!.mass / obj.mass);

            // Deflect bird velocity
            currentActiveBird!.vx = -currentActiveBird!.vx * 0.35;
            currentActiveBird!.vy = -currentActiveBird!.vy * 0.35 + 0.1;

            // Explode black bird if it hasn't on heavy collision!
            if (currentActiveBird!.type === 'black' && !currentActiveBird!.hasExploded) {
              triggerExplosion(currentActiveBird!.x, currentActiveBird!.y, 110);
            }

            // Spawn dynamic splatter debris from collision point
            const debrisColor = obj.type === 'wood' ? '#ea580c' : obj.type === 'glass' ? '#67e8f9' : obj.type === 'stone' ? '#94a3b8' : '#e11d48';
            for (let j = 0; j < 8; j++) {
              debrisRef.current.push({
                x: obj.x,
                y: obj.y,
                vx: (Math.random() * 6 - 3) + currentActiveBird!.vx * 0.1,
                vy: (Math.random() * 6 - 3) + currentActiveBird!.vy * 0.1,
                size: Math.random() * 5 + 3,
                color: debrisColor,
                alpha: 1,
                life: 0,
                maxLife: Math.random() * 15 + 20,
                angle: Math.random() * Math.PI * 2,
                shape: obj.shape
              });
            }
          }
        });
      }

      // 4. RIGID ENGINE INTERNAL PHYSICAL SOLIDS UPDATE & COLLISION INTERACTION
      if (isStructureActiveRef.current) {
        const physicsUpdatesCount = 1; // single precision pass
        for (let pass = 0; pass < physicsUpdatesCount; pass++) {
          objectsRef.current.forEach((obj, idx) => {
            if (obj.health <= 0) return;

            // Apply Gravity only if flying or unstable
            if (obj.y < height - 40 - (obj.shape === 'rect' ? obj.height! / 2 : obj.radius!)) {
              obj.vy += gravity * 0.6; // slightly lighter gravity for bricks
            }

            // Apply physical coordinates delta
            obj.x += obj.vx;
            obj.y += obj.vy;

            // Apply angular momentum dampening
            obj.angle += obj.angularVelocity;
            obj.angularVelocity *= 0.96;

            // Slow down sliding friction
            obj.vx *= 0.975;
            obj.vy *= 0.975;

            // Level baseline floor stop
            const floorY = height - 40;
            if (obj.shape === 'rect') {
              const bottomY = obj.y + obj.height! / 2;
              if (bottomY > floorY) {
                const penetration = bottomY - floorY;
                obj.y -= penetration;
                obj.vy = -obj.vy * 0.12; // bounce offset
                obj.vx *= 0.82; // massive friction on dry dirt floor
                if (Math.abs(obj.vy) < 0.2) obj.vy = 0;
              }
            } else {
              const bottomY = obj.y + obj.radius!;
              if (bottomY > floorY) {
                const penetration = bottomY - floorY;
                obj.y -= penetration;
                obj.vy = -obj.vy * 0.12;
                obj.vx *= 0.82;
                if (Math.abs(obj.vy) < 0.2) obj.vy = 0;
              }
            }

            // Bound limits
            if (obj.x < 150) {
              obj.x = 150;
              obj.vx = -obj.vx * 0.1;
            }
            if (obj.x > width + 40) {
              obj.health = 0; // fall out of screen dies!
            }

            // Check structural cross-collisions between blocks (Object to Object rigid collision)
            for (let j = idx + 1; j < objectsRef.current.length; j++) {
              const other = objectsRef.current[j];
              if (other.health <= 0) continue;

              // Check precise collision using bounding box / circle checks
              if (checkCollision(obj, other)) {
                // COLLISION! Transfer kinetic energy vectors
                const dx = other.x - obj.x;
                const dy = other.y - obj.y;
                const angle = Math.atan2(dy, dx);
                
                const relativeVX = obj.vx - other.vx;
                const relativeVY = obj.vy - other.vy;
                const relativeSpeed = Math.hypot(relativeVX, relativeVY);

                // Gentle physical separation to keep stacked structures stable
                const separationScale = 0.4;
                obj.x -= Math.cos(angle) * separationScale;
                obj.y -= Math.sin(angle) * separationScale;
                other.x += Math.cos(angle) * separationScale;
                other.y += Math.sin(angle) * separationScale;

                // Push velocity correction
                const pushCorrection = 0.12;
                obj.vx -= Math.cos(angle) * pushCorrection;
                obj.vy -= Math.sin(angle) * pushCorrection;
                other.vx += Math.cos(angle) * pushCorrection;
                other.vy += Math.sin(angle) * pushCorrection;

                if (relativeSpeed > 1.5) {
                  // Suffer mutual kinetic pressure damage
                  const pressure = relativeSpeed * 22;
                  obj.health -= pressure;
                  other.health -= pressure;

                  // Sound triggers
                  if (obj.type === 'tnt' && obj.health > 0) {
                    obj.health = 0;
                    triggerExplosion(obj.x, obj.y, 110);
                  }
                  if (other.type === 'tnt' && other.health > 0) {
                    other.health = 0;
                    triggerExplosion(other.x, other.y, 110);
                  }

                  // Transfer forces
                  const pushVal = relativeSpeed * 0.22;
                  obj.vx -= Math.cos(angle) * pushVal;
                  obj.vy -= Math.sin(angle) * pushVal;
                  other.vx += Math.cos(angle) * pushVal;
                  other.vy += Math.sin(angle) * pushVal;

                  // Rotate slightly depending on misalignment
                  obj.angularVelocity += (Math.random() - 0.5) * 0.05;
                  other.angularVelocity += (Math.random() - 0.5) * 0.05;
                }
              }
            }
          });
        }
      }

      // 5. UPDATE POPPED OBJECTS & SCORE GAINS
      objectsRef.current.forEach(obj => {
        if (obj.health <= 0) {
          // Object died! Trigger pop score
          if (obj.scoreValue > 0) {
            setScore(prev => prev + obj.scoreValue);
            
            scorePopupsRef.current.push({
              x: obj.x,
              y: obj.y - 12,
              text: `+${obj.scoreValue}`,
              color: obj.type === 'enemy' ? '#22c55e' : obj.type === 'tnt' ? '#ef4444' : '#64748b',
              life: 0,
              maxLife: 35
            });

            // If an enemy died:
            if (obj.type === 'enemy') {
              triggerSfx('enemy_die');
              
              // Pop extra aesthetic smoke clouds
              for (let i = 0; i < 15; i++) {
                const ang = Math.random() * Math.PI * 2;
                debrisRef.current.push({
                  x: obj.x,
                  y: obj.y,
                  vx: Math.cos(ang) * (Math.random() * 4 + 1),
                  vy: Math.sin(ang) * (Math.random() * 4 + 1),
                  size: Math.random() * 6 + 4,
                  color: '#f0fdf4', // fluffy white green dust
                  alpha: 0.85,
                  life: 0,
                  maxLife: 20,
                  angle: ang,
                  shape: 'circle'
                });
              }
            }

            obj.scoreValue = 0; // prevent double scoring
          }
        }
      });

      // 6. UPDATE DEBRIS PARTICLES & TRACES
      for (let i = debrisRef.current.length - 1; i >= 0; i--) {
        const d = debrisRef.current[i];
        d.x += d.vx;
        d.y += d.vy;
        d.vy += 0.08; // slight gravity
        d.life++;
        d.alpha = 1 - d.life / d.maxLife;
        if (d.life >= d.maxLife) {
          debrisRef.current.splice(i, 1);
        }
      }

      for (let i = scorePopupsRef.current.length - 1; i >= 0; i--) {
        const p = scorePopupsRef.current[i];
        p.y -= 0.6; // float up
        p.life++;
        if (p.life >= p.maxLife) {
          scorePopupsRef.current.splice(i, 1);
        }
      }

      // Check level win/loss conditions
      checkGameProgression();

      // 7. RENDERING SYSTEM
      ctx.clearRect(0, 0, width, height);

      // Traditional ancient mountain landscape backdrop gradient
      const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
      bgGrad.addColorStop(0, '#fdfbf7'); // Silk scroll ivory
      bgGrad.addColorStop(0.6, '#fed7aa'); // Soft sunset orange
      bgGrad.addColorStop(1, '#bae6fd'); // Lake blue bottom
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Ink outlines mountains (Shanshui background)
      ctx.fillStyle = 'rgba(217, 119, 6, 0.04)';
      ctx.beginPath();
      ctx.moveTo(200, height - 40);
      ctx.quadraticCurveTo(280, 100, 360, height - 40);
      ctx.moveTo(300, height - 40);
      ctx.quadraticCurveTo(380, 140, 460, height - 40);
      ctx.fill();

      // Distant clouds
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.beginPath();
      ctx.arc(100, 80, 15, 0, Math.PI * 2);
      ctx.arc(120, 75, 20, 0, Math.PI * 2);
      ctx.arc(138, 80, 14, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(320, 60, 12, 0, Math.PI * 2);
      ctx.arc(335, 55, 17, 0, Math.PI * 2);
      ctx.arc(350, 60, 11, 0, Math.PI * 2);
      ctx.fill();

      // Draw Slingshot Stand support structure (Traditional Chinese lacquer wood style)
      ctx.lineWidth = 6;
      ctx.strokeStyle = '#7c2d12'; // dark brownish mahogany wood
      ctx.beginPath();
      // left leg
      ctx.moveTo(slingshotPos.x - 10, slingshotPos.y + 24);
      ctx.lineTo(slingshotPos.x - 2, slingshotPos.y + 2);
      ctx.lineTo(slingshotPos.x - 2, slingshotPos.y + 110); // bottom pole
      // right leg
      ctx.moveTo(slingshotPos.x + 10, slingshotPos.y + 24);
      ctx.lineTo(slingshotPos.x + 2, slingshotPos.y + 2);
      ctx.stroke();

      // Golden detailing in slingshot crotch connection
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(slingshotPos.x, slingshotPos.y + 12, 5, 0, Math.PI * 2);
      ctx.fill();

      // Draw active sliding trace path
      if (gameState === 'aiming') {
        const points = getDottedParabolaPoints();
        ctx.fillStyle = '#fbbf24';
        points.forEach(pt => {
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 2.5, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      // Draw active elastic leather ropes if dragging
      if (isDraggingRef.current && gameState === 'aiming') {
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        // back line
        ctx.moveTo(slingshotPos.x - 14, slingshotPos.y + 16);
        ctx.lineTo(dragPosRef.current.x, dragPosRef.current.y);
        ctx.moveTo(slingshotPos.x + 14, slingshotPos.y + 16);
        ctx.lineTo(dragPosRef.current.x, dragPosRef.current.y);
        ctx.stroke();
      }

      // Draw background ground deck lines
      ctx.fillStyle = '#451a03'; // Solid deep charcoal mud
      ctx.fillRect(0, height - 40, width, 40);

      // High-contrast turf line
      ctx.fillStyle = '#16a34a';
      ctx.fillRect(0, height - 40, width, 5);

      // Trailing guide traces
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.4)';
      ctx.beginPath();
      trailRef.current.forEach((pt, i) => {
        if (i === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      });
      ctx.stroke();

      // Render physical bricks / objects
      objectsRef.current.forEach(obj => {
        if (obj.health <= 0) return;

        ctx.save();
        ctx.translate(obj.x, obj.y);
        ctx.rotate(obj.angle);

        // Calculate health percentage for crack overlay drawing!
        const healthPct = obj.health / obj.maxHealth;

        if (obj.type === 'wood') {
          // Green bamboo style bars
          const bW = obj.width!;
          const bH = obj.height!;
          ctx.fillStyle = '#15803d'; // bamboo green
          ctx.fillRect(-bW / 2, -bH / 2, bW, bH);
          
          // Bamboo nodes division gold rings
          ctx.fillStyle = '#eab308';
          ctx.fillRect(-bW / 2, -1, bW, 2);

          // Wood border outline
          ctx.strokeStyle = '#14532d';
          ctx.lineWidth = 1;
          ctx.strokeRect(-bW / 2, -bH / 2, bW, bH);

          // Draw stress cracks if damaged
          if (healthPct < 0.65) {
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.35)';
            ctx.beginPath();
            ctx.moveTo(-bW / 3, -bH / 3);
            ctx.lineTo(bW / 4, bH / 4);
            ctx.stroke();
          }
        } 
        else if (obj.type === 'glass') {
          // Turquoise glazed blue tile ceramic bars
          const bW = obj.width!;
          const bH = obj.height!;
          ctx.fillStyle = '#22d3ee'; // gloss cyan
          ctx.fillRect(-bW / 2, -bH / 2, bW, bH);
          
          ctx.strokeStyle = '#0891b2';
          ctx.strokeRect(-bW / 2, -bH / 2, bW, bH);

          // Shiny highlights
          ctx.fillStyle = 'rgba(255,255,255,0.6)';
          ctx.fillRect(-bW / 2 + 2, -bH / 2 + 2, 3, bH - 4);

          // Cracks overlay
          if (healthPct < 0.8) {
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(-bW / 2 + 2, -bH / 2 + 2);
            ctx.lineTo(bW / 2 - 2, bH / 2 - 2);
            ctx.moveTo(bW / 2 - 2, -bH / 2 + 2);
            ctx.lineTo(-bW / 2 + 2, bH / 2 - 2);
            ctx.stroke();
          }
        } 
        else if (obj.type === 'stone') {
          // Ink rock granite blocks
          const bW = obj.width!;
          const bH = obj.height!;
          ctx.fillStyle = '#64748b'; // stone grey
          ctx.fillRect(-bW / 2, -bH / 2, bW, bH);
          
          ctx.strokeStyle = '#334155';
          ctx.strokeRect(-bW / 2, -bH / 2, bW, bH);

          // Draw traditional ink scroll aesthetic detailing
          ctx.fillStyle = 'rgba(0,0,0,0.15)';
          ctx.beginPath();
          ctx.arc(-bW/4, -bH/4, bW/5, 0, Math.PI);
          ctx.fill();

          if (healthPct < 0.7) {
            ctx.strokeStyle = '#1e293b';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(-bW / 2, bH / 3);
            ctx.lineTo(bW / 2, -bH / 4);
            ctx.stroke();
          }
        } 
        else if (obj.type === 'tnt') {
          // Gold Firepowder barrel explosives
          const r = obj.radius!;
          ctx.fillStyle = '#dc2626'; // bright red gunpowder barrel
          ctx.beginPath();
          ctx.arc(0, 0, r, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = '#ea580c';
          ctx.lineWidth = 2;
          ctx.stroke();

          // Barrel yellow belt lines
          ctx.fillStyle = '#fbbf24';
          ctx.font = 'bold 8px Arial';
          ctx.textAlign = 'center';
          ctx.fillText('炸', 0, 3); // "炸" (Boom!) in Chinese
        } 
        else if (obj.type === 'enemy') {
          // Greedy Green Pork Steamed Bun Imp (偷桃綠皮包子怪)
          const r = obj.radius!;
          ctx.fillStyle = '#4ade80'; // pale pork green
          ctx.beginPath();
          ctx.arc(0, 0, r, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = '#15803d';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(0, 0, r, 0, Math.PI * 2);
          ctx.stroke();

          // Tiny funny red traditional hair node cap
          ctx.fillStyle = '#dc2626';
          ctx.beginPath();
          ctx.arc(0, -r, 3, 0, Math.PI * 2);
          ctx.fill();

          // Grumpy eyes
          ctx.fillStyle = '#1e293b';
          ctx.beginPath();
          ctx.arc(-3, -2, 1.5, 0, Math.PI * 2);
          ctx.arc(3, -2, 1.5, 0, Math.PI * 2);
          ctx.fill();

          // Cute pink cheeks
          ctx.fillStyle = 'rgba(239, 68, 68, 0.4)';
          ctx.beginPath();
          ctx.arc(-5, 2, 2.5, 0, Math.PI * 2);
          ctx.arc(5, 2, 2.5, 0, Math.PI * 2);
          ctx.fill();

          // Hold a half-eaten peach in hand
          ctx.fillStyle = '#fbcfe8';
          ctx.beginPath();
          ctx.arc(1, 5, 2.5, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      });

      // Render extra blue bird split fragments if flying
      extraBirdsRef.current.forEach(eb => {
        ctx.fillStyle = '#06b6d4';
        ctx.beginPath();
        ctx.arc(eb.x, eb.y, eb.radius, 0, Math.PI * 2);
        ctx.fill();

        // draw small face design
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(eb.x + 2, eb.y - 1, 1.5, 0, Math.PI * 2);
        ctx.fill();
      });

      // Render active flying main single bird
      currentActiveBird = birdRef.current;
      if (gameState === 'flying' && currentActiveBird && !currentActiveBird.hasExploded) {
        ctx.save();
        ctx.translate(currentActiveBird.x, currentActiveBird.y);
        ctx.rotate(Math.atan2(currentActiveBird.vy, currentActiveBird.vx));

        // Outline fire glow for black or yellow birds
        if (currentActiveBird.type === 'black') {
          ctx.shadowBlur = 10;
          ctx.shadowColor = '#000000';
          ctx.fillStyle = '#1e293b'; // Slate charcoal black obsidian
        } else if (currentActiveBird.type === 'yellow') {
          ctx.shadowBlur = 8;
          ctx.shadowColor = '#fbbf24';
          ctx.fillStyle = '#f59e0b'; // golden yellow windseeker
        } else if (currentActiveBird.type === 'blue') {
          ctx.fillStyle = '#06b6d4'; // teal cyan splitter
        } else {
          ctx.fillStyle = '#ef4444'; // default fire red
        }

        // Draw bird round body sphere
        ctx.beginPath();
        ctx.arc(0, 0, currentActiveBird.radius, 0, Math.PI * 2);
        ctx.fill();

        // Angry beak
        ctx.fillStyle = '#ea580c';
        ctx.beginPath();
        ctx.moveTo(currentActiveBird.radius - 2, -3);
        ctx.lineTo(currentActiveBird.radius + 6, 0);
        ctx.lineTo(currentActiveBird.radius - 2, 3);
        ctx.closePath();
        ctx.fill();

        // White big eye brow patches
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(2, -3, 3, 0, Math.PI * 2);
        ctx.fill();

        // Angry black iris dots
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(3.5, -3, 1.2, 0, Math.PI * 2);
        ctx.fill();

        // Traditional forehead lines
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(-4, -6);
        ctx.lineTo(-1, -7);
        ctx.stroke();

        ctx.restore();
      }

      // Draw active dragging bird loaded on slingshot
      if (gameState === 'aiming' || isDraggingRef.current) {
        const loadPos = isDraggingRef.current ? dragPosRef.current : slingshotPos;
        const currentBirdType = birdsQueue[activeBirdIndex];

        if (currentBirdType) {
          ctx.save();
          ctx.translate(loadPos.x, loadPos.y);

          // Face right default
          ctx.fillStyle = currentBirdType.color;
          ctx.beginPath();
          ctx.arc(0, 0, currentBirdType.radius, 0, Math.PI * 2);
          ctx.fill();

          // Angry beak
          ctx.fillStyle = '#fbbf24';
          ctx.beginPath();
          ctx.moveTo(currentBirdType.radius - 2, -2);
          ctx.lineTo(currentBirdType.radius + 5, 1);
          ctx.lineTo(currentBirdType.radius - 2, 3);
          ctx.closePath();
          ctx.fill();

          // Angry eyes
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(3, -2, 2.8, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#000000';
          ctx.beginPath();
          ctx.arc(4, -2, 1.1, 0, Math.PI * 2);
          ctx.fill();

          ctx.restore();
        }
      }

      // Render aesthetic debris / splinters
      debrisRef.current.forEach(d => {
        ctx.save();
        ctx.globalAlpha = d.alpha;
        ctx.translate(d.x, d.y);
        ctx.rotate(d.angle);
        ctx.fillStyle = d.color;
        if (d.shape === 'rect') {
          ctx.fillRect(-d.size / 2, -d.size / 2, d.size, d.size * 0.4);
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, d.size / 2, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      });

      // Render floating popup points
      scorePopupsRef.current.forEach(p => {
        ctx.font = 'bold 10px "Inter", sans-serif';
        ctx.fillStyle = p.color;
        ctx.textAlign = 'center';
        ctx.fillText(p.text, p.x, p.y);
      });

      animId = requestAnimationFrame(gameTick);
    };

    // Evaluate progression
    const checkGameProgression = () => {
      // Counting remaining targets
      const remainingEnemies = objectsRef.current.filter(obj => obj.type === 'enemy' && obj.health > 0).length;

      if (remainingEnemies === 0 && gameState !== 'victory') {
        setGameState('victory');
        triggerSfx('victory');
        setMascotChat('凱旋而歸，天兵降臨！你僅用彈弓便已平定神宮盜桃之亂！金星護體！🏅🎉');
        
        // Save score if superior
        const highestSoFar = localStorage.getItem('minigame_angrybirds_hiscore');
        const numHigh = highestSoFar ? parseInt(highestSoFar, 10) : 0;
        if (score > numHigh) {
          setHighScore(score);
          localStorage.setItem('minigame_angrybirds_hiscore', score.toString());
        }

        // Star rating determination (3 stars if scored plenty)
        const rating = score > 3500 ? 3 : score > 2000 ? 2 : 1;
        setStarsRating(rating);
      }
    };

    // Transition state
    const retireActiveBird = () => {
      birdRef.current = null;
      extraBirdsRef.current = [];
      trailRef.current = [];

      // Check queued birds
      const nextIdx = activeBirdIndex + 1;
      if (nextIdx < birdsQueue.length) {
        // Prepare next bird
        setActiveBirdIndex(nextIdx);
        setGameState('aiming');
        dragPosRef.current = { ...slingshotPos };
        isDraggingRef.current = false;
      } else {
        // No birds remaining. Evaluate if still has enemies after settled delay
        setTimeout(() => {
          const remainingEnemies = objectsRef.current.filter(obj => obj.type === 'enemy' && obj.health > 0).length;
          if (remainingEnemies > 0) {
            setGameState('defeat');
            triggerSfx('fail');
            setMascotChat('真仙法力失準，驚喜蟠桃未能完全奪回！道友請點按下方重整武器再擊！🥀🛡️');
          }
        }, 1200);
      }
    };

    animId = requestAnimationFrame(gameTick);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [gameState, activeBirdIndex, birdsQueue, selectedLevel, score, triggerSfx]);

  // Slingshot drag calculations mouse/touch handlers
  const handleCanvasStart = (clientX: number, clientY: number) => {
    if (gameState !== 'aiming') {
      // In mid-air/flying state, user click triggers matching special bird ability technique!
      if (gameState === 'flying' && birdRef.current && !birdRef.current.abilityUsed) {
        triggerAbility();
      }
      return;
    }

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    // Relative mouse position
    const touchX = ((clientX - rect.left) / rect.width) * 640;
    const touchY = ((clientY - rect.top) / rect.height) * 400;

    // Check distance to center loaded slingshot stand
    // Increase detection radius to 65px for comfortable, forgiving touch and mouse controls
    const dist = Math.hypot(touchX - slingshotPos.x, touchY - slingshotPos.y);
    if (dist <= 65) {
      isDraggingRef.current = true;
      triggerSfx('sling');
      dragPosRef.current = { x: touchX, y: touchY };
    }
  };

  const handleCanvasMove = (clientX: number, clientY: number) => {
    if (!isDraggingRef.current || gameState !== 'aiming') return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const touchX = ((clientX - rect.left) / rect.width) * 640;
    const touchY = ((clientY - rect.top) / rect.height) * 400;

    // Vector pull limit clamping to max pull radius
    const dx = touchX - slingshotPos.x;
    const dy = touchY - slingshotPos.y;
    const distance = Math.hypot(dx, dy);

    if (distance > maxPullRadius) {
      const angle = Math.atan2(dy, dx);
      dragPosRef.current = {
        x: slingshotPos.x + Math.cos(angle) * maxPullRadius,
        y: slingshotPos.y + Math.sin(angle) * maxPullRadius
      };
    } else {
      dragPosRef.current = { x: touchX, y: touchY };
    }
  };

  const handleCanvasEnd = () => {
    if (!isDraggingRef.current || gameState !== 'aiming') return;
    isDraggingRef.current = false;
    launchBird();
  };

  const activeBirdConfig = birdsQueue[activeBirdIndex];

  return (
    <div className="w-full max-w-5xl mx-auto p-4 md:p-6" id="angrybirds_main_card">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* GAME SCREEN ZONE: 7 cols */}
        <div className="lg:col-span-7 flex flex-col items-center bg-white rounded-3xl p-4 md:p-5 border border-amber-50 shadow-sm" id="game_box_wrapper">
          
          {/* Header Stats Panel */}
          <div className="w-full max-w-[640px] flex items-center justify-between mb-3 bg-amber-50/40 px-3 py-2 rounded-2xl border border-amber-100" id="supermario_header">
            {/* High score */}
            <div className="flex items-center gap-1.5">
              <div className="bg-amber-400 p-1.5 rounded-full text-amber-950">
                <Trophy className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="block text-[8px] text-amber-800 font-bold leading-none">最高福度</span>
                <span className="text-xs font-black font-mono text-amber-950 leading-none">{highScore}</span>
              </div>
            </div>

            {/* Level selector buttons */}
            <div className="flex items-center gap-1">
              {[1, 2, 3].map((num) => (
                <button
                  key={num}
                  id={`btn_level_selector_${num}`}
                  onClick={() => {
                    triggerSfx('click');
                    setSelectedLevel(num);
                    setScore(0);
                    setActiveBirdIndex(0);
                    setGameState('aiming');
                  }}
                  className={`w-7 h-7 text-xs font-black rounded-lg transition-all ${
                    selectedLevel === num 
                      ? 'bg-amber-500 text-amber-950 scale-110 shadow-sm' 
                      : 'bg-amber-100/60 hover:bg-amber-200 text-amber-800'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>

            {/* Score */}
            <div className="text-right">
              <span className="text-[9px] text-amber-600 font-bold block leading-none">本局福運積分</span>
              <span className="text-lg font-black font-mono text-amber-800 leading-none">{score}</span>
            </div>
          </div>

          {/* Interactive HTML5 Canvas Container */}
          <div className="relative w-full max-w-[640px] aspect-[64/40] rounded-2.5xl overflow-hidden border-4 border-amber-100 shadow-md bg-stone-150 select-none">
            <canvas 
              ref={canvasRef} 
              onMouseDown={(e) => handleCanvasStart(e.clientX, e.clientY)}
              onMouseMove={(e) => handleCanvasMove(e.clientX, e.clientY)}
              onMouseUp={handleCanvasEnd}
              onMouseLeave={handleCanvasEnd}
              onTouchStart={(e) => {
                if (e.touches[0]) {
                  handleCanvasStart(e.touches[0].clientX, e.touches[0].clientY);
                }
              }}
              onTouchMove={(e) => {
                if (e.touches[0]) {
                  handleCanvasMove(e.touches[0].clientX, e.touches[0].clientY);
                }
              }}
              onTouchEnd={handleCanvasEnd}
              className="w-full h-full block cursor-crosshair touch-none" 
            />

            {/* Dynamic Interactive overlay labels */}
            {gameState === 'aiming' && (
              <div className="absolute top-3 left-3 bg-amber-900/80 text-amber-50 rounded-lg text-[9px] px-2 py-1 font-bold pointer-events-none uppercase tracking-wide">
                🏹 拉動彈弓發射
              </div>
            )}

            {gameState === 'flying' && birdRef.current && !birdRef.current.abilityUsed && (
              <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-cyan-600/90 text-white rounded-full text-[10px] px-3 py-1 font-bold animate-pulse text-center pointer-events-none">
                ✨ 點擊畫面 觸發【{BIRD_TYPES.find(b => b.type === birdRef.current?.type)?.abilityName}】法術！
              </div>
            )}

            {/* Game States screens */}
            <AnimatePresence>
              {gameState === 'victory' && (
                <motion.div 
                   initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-emerald-950/90 backdrop-blur-sm flex flex-col items-center justify-center text-center p-6 text-white"
                  id="victory_screen_overlay"
                >
                  <motion.div
                    initial={{ y: -20 }}
                    animate={{ y: 0 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 10 }}
                    className="p-3 bg-emerald-500 rounded-full text-white mb-4"
                  >
                    <Award className="w-12 h-12" />
                  </motion.div>
                  
                  <h3 className="text-xl font-black text-emerald-100 mb-1">
                    蟠桃奪回！大獲全勝 🌟
                  </h3>
                  <p className="text-xs text-emerald-300 max-w-xs mb-4">
                    神木彈弓顯神威，狡猾的綠包怪已被砸跑，仙山復歸祥和！
                  </p>

                  <div className="flex items-center justify-center gap-1.5 mb-5 bg-emerald-900/60 p-2.5 rounded-2xl border border-emerald-800">
                    {[1, 2, 3].map((star) => (
                      <Sparkles 
                        key={star} 
                        className={`w-6 h-6 ${star <= starsRating ? 'text-yellow-400 fill-yellow-400' : 'text-emerald-850'}`} 
                      />
                    ))}
                  </div>

                  <div className="flex gap-3">
                    <button
                      id="btn_retry_victory"
                      onClick={resetLevel}
                      className="px-4 py-2 bg-emerald-800 hover:bg-emerald-700 text-xs font-black rounded-xl border border-emerald-600 flex items-center gap-1.5 transition-all active:scale-95"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      再次修行
                    </button>
                    <button
                      id="btn_next_victory"
                      onClick={goToNextLevel}
                      className="px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-slate-950 text-xs font-black rounded-xl flex items-center gap-1.5 transition-all active:scale-95 shadow-md shadow-yellow-950/40 animate-bounce"
                    >
                      下一仙閣
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              )}

              {gameState === 'defeat' && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-red-950/90 backdrop-blur-sm flex flex-col items-center justify-center text-center p-6 text-white"
                  id="defeat_screen_overlay"
                >
                  <div className="p-3 bg-red-500 rounded-full text-white mb-4 animate-shake">
                    <Skull className="w-11 h-11" />
                  </div>
                  
                  <h3 className="text-xl font-black text-red-100 mb-1">
                    仙力耗盡！關卡未破
                  </h3>
                  <p className="text-xs text-red-300 max-w-sm mb-5">
                    所有的神雀都已飛去，可惡的綠包精怪仍佔有仙宮！請大仙重新點算兵馬，調整重力角度重試。
                  </p>

                  <button
                    id="btn_retry_defeat"
                    onClick={resetLevel}
                    className="px-5 py-2.5 bg-yellow-500 hover:bg-yellow-400 text-stone-950 text-xs font-black rounded-xl flex items-center gap-1.5 transition-all active:scale-95 shadow-md animate-pulse"
                  >
                    <RotateCcw className="w-4 h-4" />
                    重整彈弓，再次挑戰！
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Queued birds visualization line */}
          <div className="w-full max-w-[640px] mt-4 flex items-center justify-between bg-stone-50 border border-stone-200/80 rounded-2xl p-2 md:p-3" id="sparrows_paddock">
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] font-black text-stone-500 uppercase">神兵候命區:</span>
              <div className="flex items-center gap-1 ml-1">
                {birdsQueue.map((bird, idx) => {
                  const isFired = idx < activeBirdIndex;
                  const isActive = idx === activeBirdIndex;

                  return (
                    <div 
                      key={idx}
                      id={`paddock_bird_${idx}`}
                      className={`relative w-8 h-8 rounded-full border flex items-center justify-center transition-all ${
                        isFired 
                          ? 'bg-stone-200 border-stone-300 opacity-20 scale-90' 
                          : isActive 
                            ? 'bg-amber-500 border-amber-600 scale-110 shadow-sm ring-2 ring-amber-300 ring-offset-1 z-10' 
                            : 'bg-white border-stone-300 hover:bg-stone-50'
                      }`}
                    >
                      <span className="text-base" style={{ color: isFired ? '#a1a1aa' : bird.color }}>
                        ●
                      </span>
                      {isActive && (
                        <span className="absolute -top-1.5 -right-1 bg-red-500 text-[6px] font-black text-white px-1 py-0.5 rounded-full uppercase scale-90">
                          備戰
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                id="btn_reset_instant"
                onClick={resetLevel}
                className="p-1.5 bg-stone-150 hover:bg-stone-200 text-stone-700 rounded-lg transition-all"
                title="重新啟動關卡"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>

              <button
                id="btn_mute_toggle"
                onClick={() => {
                  triggerSfx('click');
                  setSoundEnabled(!soundEnabled);
                }}
                className="p-1.5 bg-stone-150 hover:bg-stone-200 text-stone-700 rounded-lg transition-all"
                title="切換音效"
              >
                {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

        </div>

        {/* RIGHT STRATEGY TACTICS INFO: 5 cols */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          
          {/* Mascot speech chat panel */}
          <div className="bg-amber-50/70 border border-amber-100 rounded-3xl p-4 flex gap-3 items-start" id="mario_mascot_guide">
            <div className="relative flex-shrink-0 animate-bounce">
              <div className="w-12 h-12 bg-amber-400 rounded-2xl flex items-center justify-center text-xl shadow-md border-2 border-white">
                🐼
              </div>
              <div className="absolute -bottom-1 -right-1 bg-red-500 text-[7px] font-black text-white px-1.5 py-0.5 rounded-full leading-none">
                大俠
              </div>
            </div>
            <div>
              <h4 className="text-xs font-black text-amber-900 leading-none mb-1">
                紅熊貓大俠
              </h4>
              <p className="text-xs text-amber-800 leading-normal font-medium">
                {mascotChat}
              </p>
            </div>
          </div>

          {/* Divine sparrows list of magic abilities */}
          <div className="bg-white rounded-3xl p-4 md:p-5 border border-stone-200/80 shadow-sm" id="game_features_panel">
            <h3 className="text-sm font-black text-stone-900 mb-3 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              神羽飛雀法術錄
            </h3>

            <div className="flex flex-col gap-3">
              {BIRD_TYPES.map((type) => {
                const isCurrent = activeBirdConfig?.type === type.type;

                return (
                  <div 
                    key={type.type}
                    id={`desc_card_bird_${type.type}`}
                    className={`p-3 rounded-2xl border transition-all ${
                      isCurrent 
                        ? 'bg-amber-50/50 border-amber-300 shadow-sm ring-1 ring-amber-100' 
                        : 'bg-stone-50/40 border-stone-200/60'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-lg leading-none" style={{ color: type.color }}>
                          ●
                        </span>
                        <span className="text-xs font-black text-stone-800">{type.name}</span>
                      </div>
                      
                      <span className="text-[10px] font-black bg-stone-200/80 px-2 py-0.5 rounded-full text-stone-700 flex items-center gap-0.5">
                        <span>{type.abilityIcon}</span>
                        <span>{type.abilityName}</span>
                      </span>
                    </div>

                    <p className="text-[11px] leading-relaxed text-stone-600 font-medium">
                      {type.description}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Platform rules guide line */}
            <div className="mt-4 bg-blue-50/50 border border-blue-100 rounded-2xl p-3 text-blue-900" id="tactics_tip">
              <span className="text-[9px] font-black uppercase text-blue-800 tracking-wider block mb-1">
                💡 戰本仙山訣竅
              </span>
              <ul className="text-[10.5px] leading-relaxed font-medium space-y-1 text-blue-800 list-disc list-inside">
                <li>拉得越向後，神雀射出的初速度和力道越強。</li>
                <li><b>竹竿</b>輕巧易坍塌，<b>青瓦</b>脆如薄玉，<b>仙石</b>厚重無比。</li>
                <li>盡情利用<b>炸</b>字火藥箱引爆，可用連鎖衝擊推垮地基！</li>
              </ul>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
