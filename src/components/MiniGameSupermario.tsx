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
  Shield, 
  Coins, 
  Award, 
  HelpCircle, 
  ArrowLeft, 
  ArrowRight, 
  ArrowUp,
  Heart,
  Flag,
  Flame,
  CheckCircle2
} from 'lucide-react';

interface Block {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'ground' | 'brick' | 'cloud_block' | 'question' | 'spike';
  hitAnimation?: number; // Y offset when headbutted
  content?: 'coin' | 'peach' | 'empty';
}

interface Enemy {
  x: number;
  y: number;
  vx: number;
  width: number;
  height: number;
  alive: boolean;
  squashTimer?: number;
  type: 'bun' | 'cloud_imp';
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
  type: 'star' | 'petal' | 'score_popup' | 'dust';
  text?: string;
}

interface Item {
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  type: 'coin' | 'peach';
  collected: boolean;
  grounded: boolean;
}

export default function MiniGameSupermario() {
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'paused' | 'gameover' | 'victory'>('idle');
  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(0);
  const [coinsCollected, setCoinsCollected] = useState<number>(0);
  const [peachPowerActive, setPeachPowerActive] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [showHelp, setShowHelp] = useState<boolean>(false);
  const [lives, setLives] = useState<number>(3);
  const [currentLevel, setCurrentLevel] = useState<number>(1);

  // Sound enablement ref
  const soundEnabledRef = useRef(soundEnabled);
  useEffect(() => {
    soundEnabledRef.current = soundEnabled;
  }, [soundEnabled]);

  // Mascot Speech System
  const [mascotChat, setMascotChat] = useState<string>('小小紅熊貓正在擦亮竹棍，準備前往神秘的桃源福地探險！🐾🎍');

  // Persistence
  useEffect(() => {
    const saved = localStorage.getItem('minigame_mario_hiscore');
    if (saved) setHighScore(parseInt(saved, 10));
    const savedCoins = localStorage.getItem('minigame_mario_coins');
    if (savedCoins) setCoinsCollected(parseInt(savedCoins, 10));
  }, []);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Keep state variables in refs for strict canvas loop timing
  const stateRef = useRef(gameState);
  const scoreRef = useRef(score);
  const livesRef = useRef(lives);
  const peachRef = useRef(peachPowerActive);
  const levelRef = useRef(currentLevel);

  useEffect(() => { stateRef.current = gameState; }, [gameState]);
  useEffect(() => { scoreRef.current = score; }, [score]);
  useEffect(() => { livesRef.current = lives; }, [lives]);
  useEffect(() => { peachRef.current = peachPowerActive; }, [peachPowerActive]);
  useEffect(() => { levelRef.current = currentLevel; }, [currentLevel]);

  // SFX Synth function utilizing Web Audio API
  const playSfx = useCallback((type: 'jump' | 'coin' | 'powerup' | 'kick' | 'hurt' | 'powerdown' | 'victory' | 'gameover' | 'click') => {
    if (!soundEnabledRef.current) return;
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();

      if (type === 'jump') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(204, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(780, ctx.currentTime + 0.16);
        gain.gain.setValueAtTime(0.06, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.16);
        osc.start();
        osc.stop(ctx.currentTime + 0.17);
      } else if (type === 'coin') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(988, ctx.currentTime); // B5
        osc.frequency.setValueAtTime(1318, ctx.currentTime + 0.08); // E6
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
        osc.start();
        osc.stop(ctx.currentTime + 0.36);
      } else if (type === 'powerup') {
        // Glorious traditional pentatonic rise
        const notes = [330, 392, 440, 523, 587, 659]; // E, G, A, C, D, E
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.06);
          gain.gain.setValueAtTime(0.04, ctx.currentTime + idx * 0.06);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.06 + 0.15);
          osc.start(ctx.currentTime + idx * 0.06);
          osc.stop(ctx.currentTime + idx * 0.06 + 0.18);
        });
      } else if (type === 'kick') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.07, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.11);
        osc.start();
        osc.stop(ctx.currentTime + 0.12);
      } else if (type === 'hurt') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(300, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(100, ctx.currentTime + 0.25);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.26);
        osc.start();
        osc.stop(ctx.currentTime + 0.27);
      } else if (type === 'powerdown') {
        const notes = [440, 349, 293, 220]; // Pentatonic drop
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);
          gain.gain.setValueAtTime(0.05, ctx.currentTime + idx * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.08 + 0.12);
          osc.start(ctx.currentTime + idx * 0.08);
          osc.stop(ctx.currentTime + idx * 0.08 + 0.14);
        });
      } else if (type === 'victory') {
        // Full pentatonic celebration chime
        const notes = [523, 587, 659, 784, 880, 1047, 1175, 1318];
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);
          gain.gain.setValueAtTime(0.05, ctx.currentTime + idx * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.08 + 0.3);
          osc.start(ctx.currentTime + idx * 0.08);
          osc.stop(ctx.currentTime + idx * 0.08 + 0.32);
        });
      } else if (type === 'gameover') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(260, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(60, ctx.currentTime + 1.1);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.1);
        osc.start();
        osc.stop(ctx.currentTime + 1.2);
      } else if (type === 'click') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, ctx.currentTime);
        gain.gain.setValueAtTime(0.04, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
        osc.start();
        osc.stop(ctx.currentTime + 0.06);
      }
    } catch (e) {
      console.warn("Audio context not ready:", e);
    }
  }, []);

  // Controls input map
  const keysPressedRef = useRef<{ [key: string]: boolean }>({});
  const leftPressed = useRef(false);
  const rightPressed = useRef(false);

  // Key handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressedRef.current[e.code] = true;
      if (['Space', 'KeyW', 'ArrowUp', 'KeyA', 'ArrowLeft', 'KeyD', 'ArrowRight'].includes(e.code)) {
        e.preventDefault();
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressedRef.current[e.code] = false;
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Trigger level transition
  const restartGame = () => {
    playSfx('click');
    setScore(0);
    setLives(3);
    setPeachPowerActive(false);
    setCurrentLevel(1);
    setGameState('playing');
    setMascotChat('踏青登頂，桃花灼灼！擊破驚喜寶箱、奪取頂峰青蓮福旗吧！🎮🐼');
  };

  const startNextLevel = () => {
    playSfx('click');
    setPeachPowerActive(false);
    setCurrentLevel(prev => prev + 1);
    setGameState('playing');
    setMascotChat('道行益深！前方山石更奇特，包子精怪走速也變快了，加油！⛰️🎆');
  };

  // Primary Platformer Game Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const width = 480;
    const height = 320;
    canvas.width = width;
    canvas.height = height;

    // Camera viewport offset
    let cameraX = 0;
    const worldLength = 2200; // total scrollable level width

    // Physics
    const gravity = 0.45;
    const friction = 0.85;

    // Player character
    const player = {
      x: 60,
      y: 200,
      vx: 0,
      vy: 0,
      width: 22,
      height: 28,
      grounded: false,
      facingRight: true,
      invincibilityTimer: 0,
      isJumping: false,
      jumpGrace: 0,
    };

    // Lists
    let blocks: Block[] = [];
    let enemies: Enemy[] = [];
    let items: Item[] = [];
    let particles: Particle[] = [];

    // Construct level dynamically based on level number
    const buildLevel = () => {
      blocks = [];
      enemies = [];
      items = [];
      particles = [];

      // Ground segments (flat solid blocks layered with beautiful stylized turf)
      for (let x = 0; x < worldLength; x += 32) {
        // Gaps in the ground for jumping challenge
        if (x > 400 && x < 464) continue; // Gap 1
        if (x > 880 && x < 960) continue; // Gap 2
        if (x > 1400 && x < 1496) continue; // Gap 3

        blocks.push({
          x,
          y: height - 32,
          width: 32,
          height: 32,
          type: 'ground'
        });
      }

      // Add floating Chinese-style glazed blocks and auspicious cloud question panels
      const addFloater = (bx: number, by: number, type: 'brick' | 'cloud_block' | 'question', content: 'coin' | 'peach' | 'empty' = 'empty') => {
        blocks.push({
          x: bx,
          y: by,
          width: 24,
          height: 20,
          type,
          content
        });
      };

      // Intro area questions
      addFloater(150, 200, 'question', 'coin');
      addFloater(210, 160, 'brick');
      addFloater(234, 160, 'question', 'peach'); // longevity peach upgrade!
      addFloater(258, 160, 'brick');
      addFloater(320, 200, 'question', 'coin');

      // Spike traps
      blocks.push({ x: 500, y: height - 32 - 10, width: 24, height: 12, type: 'spike' });

      // Mid area platform bridges
      addFloater(540, 180, 'cloud_block');
      addFloater(580, 150, 'cloud_block');
      addFloater(620, 180, 'cloud_block');

      // Question staircase
      addFloater(700, 210, 'brick');
      addFloater(724, 210, 'question', 'coin');
      addFloater(748, 210, 'brick');
      addFloater(772, 210, 'question', 'coin');

      // Floating items
      items.push({ x: 580, y: 110, vx: 0, vy: 0, width: 14, height: 14, type: 'coin', collected: false, grounded: true });

      // Post-gap 2 bricks
      addFloater(1020, 170, 'question', 'coin');
      addFloater(1044, 170, 'brick');
      addFloater(1068, 170, 'question', 'peach');

      // Spikes 2
      blocks.push({ x: 1120, y: height - 32 - 10, width: 24, height: 12, type: 'spike' });
      blocks.push({ x: 1144, y: height - 32 - 10, width: 24, height: 12, type: 'spike' });

      // Tall cloud castle platforms
      for (let x = 1220; x < 1360; x += 40) {
        addFloater(x, 140, 'cloud_block');
        items.push({ x: x + 10, y: 100, vx: 0, vy: 0, width: 14, height: 14, type: 'coin', collected: false, grounded: true });
      }

      // Final staircase leading to flagpole
      for (let i = 0; i < 5; i++) {
        // Stair Blocks
        for (let j = 0; j <= i; j++) {
          blocks.push({
            x: 1700 + i * 24,
            y: (height - 32 - 20) - j * 20,
            width: 24,
            height: 20,
            type: 'brick'
          });
        }
      }

      // Enemies setup
      const addEnemy = (ex: number, ey: number, type: 'bun' | 'cloud_imp') => {
        enemies.push({
          x: ex,
          y: ey,
          vx: type === 'bun' ? -0.8 : -1.2,
          width: 20,
          height: 18,
          alive: true,
          type
        });
      };

      // Intro enemy
      addEnemy(280, height - 52, 'bun');
      
      // Post first gap enemies
      addEnemy(560, height - 52, 'bun');
      addEnemy(720, height - 52, 'bun');
      addEnemy(820, height - 52, 'cloud_imp');

      // More enemies
      addEnemy(1080, height - 52, 'bun');
      addEnemy(1255, height - 52, 'cloud_imp');
      addEnemy(1560, height - 52, 'bun');
      addEnemy(1640, height - 52, 'cloud_imp');
    };

    buildLevel();

    // Reset player position
    player.x = 60;
    player.y = 120;
    player.vx = 0;
    player.vy = 0;

    const gameTick = () => {
      const state = stateRef.current;
      const isSuper = peachRef.current;

      if (state === 'playing') {
        const keys = keysPressedRef.current;
        
        // 1. INPUT PROCESSING
        let moveSpeed = isSuper ? 1.4 : 1.1;
        
        if (keys['KeyA'] || keys['ArrowLeft'] || leftPressed.current) {
          player.vx -= moveSpeed;
          player.facingRight = false;
        }
        if (keys['KeyD'] || keys['ArrowRight'] || rightPressed.current) {
          player.vx += moveSpeed;
          player.facingRight = true;
        }

        // Jump mechanics
        if (player.grounded) {
          player.jumpGrace = 6; // coyote time frames
        } else if (player.jumpGrace > 0) {
          player.jumpGrace--;
        }

        if ((keys['Space'] || keys['ArrowUp'] || keys['KeyW']) && player.jumpGrace > 0 && !player.isJumping) {
          player.vy = isSuper ? -7.2 : -6.5; // mega jump height when big!
          player.grounded = false;
          player.isJumping = true;
          player.jumpGrace = 0;
          playSfx('jump');
        }

        // Handle jump key release to control jump height
        if (!(keys['Space'] || keys['ArrowUp'] || keys['KeyW']) && player.vy < -2.5) {
          player.vy = -2.5; // damp upward velocity
        }

        // Prevent jump spamming unless key released
        if (!(keys['Space'] || keys['ArrowUp'] || keys['KeyW'])) {
          player.isJumping = false;
        }

        // Decelerate and apply gravity
        player.vx *= friction;
        player.vy += gravity;

        // Terminal velocity guard
        if (player.vy > 9) player.vy = 9;

        // 2. PLAYER POSITION UPDATE & COLLISION CHECKING
        player.x += player.vx;
        
        // X Boundaries check
        if (player.x < 5) {
          player.x = 5;
          player.vx = 0;
        }
        if (player.x > worldLength - 50) {
          // Trigger flagpole / victory gate!
          triggerVictory();
        }

        // Resolve X block solid collisions
        let playerHeight = isSuper ? 34 : 26;
        let playerWidth = 18;

        for (const block of blocks) {
          // Spikes don't cause solid x-stop
          if (block.type === 'spike') continue;

          if (
            player.x + playerWidth > block.x &&
            player.x < block.x + block.width &&
            player.y + playerHeight > block.y &&
            player.y < block.y + block.height
          ) {
            // Collision on horizontal!
            if (player.vx > 0) {
              player.x = block.x - playerWidth;
            } else if (player.vx < 0) {
              player.x = block.x + block.width;
            }
            player.vx = 0;
          }
        }

        // Apply Y movement
        player.y += player.vy;
        player.grounded = false;

        // Resolve Y solid collisions
        for (const block of blocks) {
          if (block.type === 'spike') {
            // Check dangerous spike bottom collision
            if (
              player.x + playerWidth > block.x + 2 &&
              player.x < block.x + block.width - 2 &&
              player.y + playerHeight > block.y + 4 &&
              player.y < block.y + block.height
            ) {
              handlePlayerHit();
            }
            continue;
          }

          if (
            player.x + playerWidth > block.x &&
            player.x < block.x + block.width &&
            player.y + playerHeight > block.y &&
            player.y < block.y + block.height
          ) {
            if (player.vy > 0) {
              // landing on top
              player.y = block.y - playerHeight;
              player.vy = 0;
              player.grounded = true;
            } else if (player.vy < 0) {
              // headbutt under block
              player.y = block.y + block.height;
              player.vy = 0.5; // bounce slightly down
              
              // Trigger headbutt mechanics (tile reactions!)
              triggerBlockHeadbutt(block);
            }
          }
        }

        // Fall into pit of death
        if (player.y > height + 20) {
          handlePlayerDeath();
        }

        // Update Invincibility timer
        if (player.invincibilityTimer > 0) {
          player.invincibilityTimer--;
        }

        // 3. COLLISION WITH ITEMS
        for (let i = items.length - 1; i >= 0; i--) {
          const item = items[i];
          
          // Apply physics to peaches that bounce
          if (item.type === 'peach') {
            item.vy += gravity * 0.8;
            item.x += item.vx;
            item.y += item.vy;

            // Simple item collision with other blocks
            item.grounded = false;
            for (const b of blocks) {
              if (b.type === 'spike') continue;
              if (
                item.x + item.width > b.x &&
                item.x < b.x + b.width &&
                item.y + item.height > b.y &&
                item.y < b.y + b.height
              ) {
                // Ground hit
                item.y = b.y - item.height;
                item.vy = -2.5; // bounce upwards!
                item.vx = item.vx === 0 ? 0.9 : item.vx; // start moving!
                item.grounded = true;
              }
            }

            // Screen boundaries for bouncing peach
            if (item.x < 0 || item.x > worldLength) {
              item.vx = -item.vx;
            }
          }

          // Check grab
          if (
            player.x + playerWidth > item.x &&
            player.x < item.x + item.width &&
            player.y + playerHeight > item.y &&
            player.y < item.y + item.height &&
            !item.collected
          ) {
            item.collected = true;
            if (item.type === 'coin') {
              playSfx('coin');
              setCoinsCollected(prev => {
                const n = prev + 1;
                localStorage.setItem('minigame_mario_coins', n.toString());
                return n;
              });
              setScore(prev => prev + 10);
              
              // Spawn star bursts
              for (let j = 0; j < 5; j++) {
                particles.push({
                  x: item.x + 5,
                  y: item.y + 5,
                  vx: (Math.random() - 0.5) * 3,
                  vy: (Math.random() - 0.5) * 3,
                  size: Math.random() * 3 + 2,
                  color: '#fbbf24',
                  alpha: 1,
                  life: 0,
                  maxLife: 20,
                  type: 'star'
                });
              }
            } else if (item.type === 'peach') {
              playSfx('powerup');
              setPeachPowerActive(true);
              setScore(prev => prev + 50);
              setMascotChat('道友福緣深厚！吃下萬壽仙桃，體質成倍暴漲！獲得一次額外「護體金光」！🍑💫');
              
              // Big custom popup particle
              particles.push({
                x: player.x,
                y: player.y - 15,
                vx: 0,
                vy: -0.6,
                size: 11,
                color: '#db2777',
                alpha: 1,
                life: 0,
                maxLife: 40,
                type: 'score_popup',
                text: '仙桃金身'
              });
            }
            items.splice(i, 1);
          }
        }

        // 4. ENEMIES physics AND collision checking
        for (let i = enemies.length - 1; i >= 0; i--) {
          const enemy = enemies[i];
          if (!enemy.alive) {
            enemy.squashTimer = (enemy.squashTimer ?? 0) + 1;
            if (enemy.squashTimer > 25) {
              enemies.splice(i, 1);
            }
            continue;
          }

          // Enemy locomotion
          enemy.x += enemy.vx;

          // Enemy collision with environment blocks (reverse walk at walls)
          for (const b of blocks) {
            if (b.type === 'spike') continue;
            if (
              enemy.x + enemy.width > b.x &&
              enemy.x < b.x + b.width &&
              enemy.y + enemy.height > b.y &&
              enemy.y < b.y + b.height
            ) {
              enemy.vx = -enemy.vx;
              if (enemy.vx > 0) {
                enemy.x = b.x + b.width;
              } else {
                enemy.x = b.x - enemy.width;
              }
            }
          }

          // Gravity for enemies if floating high
          let enemyGrounded = false;
          for (const b of blocks) {
            if (enemy.x + enemy.width > b.x && enemy.x < b.x + b.width && Math.abs((enemy.y + enemy.height) - b.y) < 2) {
              enemyGrounded = true;
            }
          }
          if (!enemyGrounded && enemy.type === 'bun') {
            enemy.y += 1.5;
            if (enemy.y > height - 52) enemy.y = height - 52;
          }

          // Check impact with player
          let pBottom = player.y + playerHeight;
          let pRight = player.x + playerWidth;

          if (
            pRight > enemy.x &&
            player.x < enemy.x + enemy.width &&
            pBottom > enemy.y &&
            player.y < enemy.y + enemy.height
          ) {
            // Check if player landed on top (Squash enemy!)
            if (player.vy > 0.4 && pBottom < enemy.y + 12) {
              enemy.alive = false;
              enemy.squashTimer = 0;
              player.vy = -4.5; // bounce high up!
              playSfx('kick');
              setScore(prev => prev + 30);
              setMascotChat('好腿法！踩碎了搗蛋的「大福包子精」！繼續往前方高台衝！💨🥟');

              // Small squashed score feedback popup
              particles.push({
                x: enemy.x + 8,
                y: enemy.y - 10,
                vx: 0,
                vy: -0.8,
                size: 10,
                color: '#22c55e',
                alpha: 1,
                life: 0,
                maxLife: 30,
                type: 'score_popup',
                text: '+30'
              });
            } else {
              // Hitting enemy from side (takes damage)
              handlePlayerHit();
            }
          }
        }

        // Camera smoothly tracks player target
        const targetCamX = player.x - width / 2.8;
        cameraX += (targetCamX - cameraX) * 0.12;
        // Restrict camera to level bounds
        if (cameraX < 0) cameraX = 0;
        if (cameraX > worldLength - width) cameraX = worldLength - width;
      }

      // 5. UPDATE TILE HIT ANIMATIONS & PARTICLES
      for (const block of blocks) {
        if (block.hitAnimation !== undefined && block.hitAnimation > 0) {
          block.hitAnimation -= 1.5;
          if (block.hitAnimation < 0) block.hitAnimation = 0;
        }
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life++;
        p.alpha = 1 - p.life / p.maxLife;
        if (p.life >= p.maxLife) {
          particles.splice(i, 1);
        }
      }

      // Ground wind-blown peach blossoms (cosmetic aesthetic backdrops)
      if (Math.random() > 0.94 && state === 'playing') {
        particles.push({
          x: cameraX + width + 10,
          y: Math.random() * (height - 60),
          vx: -(Math.random() * 1.5 + 0.8),
          vy: Math.random() * 0.5 + 0.1,
          size: Math.random() * 4 + 2,
          color: '#fbcfe8',
          alpha: 0.8,
          life: 0,
          maxLife: 150,
          type: 'petal'
        });
      }

      // 6. RENDER DEEP DETAILED BACKGROUNDS
      ctx.clearRect(0, 0, width, height);

      // Traditional landscape ink sky gradient
      const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
      bgGrad.addColorStop(0, '#fef5e7'); // Warm silk white
      bgGrad.addColorStop(0.5, '#fed7aa'); // Soft apricot mist
      bgGrad.addColorStop(1, '#bae6fd'); // Sky pond turquoise
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      ctx.save();
      ctx.translate(-cameraX, 0);

      // Far landscape distant pagodas
      ctx.fillStyle = 'rgba(219, 137, 50, 0.08)';
      ctx.beginPath();
      ctx.moveTo(100, height - 32);
      ctx.lineTo(150, height - 120);
      ctx.lineTo(200, height - 32);
      ctx.moveTo(350, height - 32);
      ctx.lineTo(410, height - 140);
      ctx.lineTo(470, height - 32);
      ctx.moveTo(800, height - 32);
      ctx.lineTo(870, height - 160);
      ctx.lineTo(940, height - 32);
      ctx.moveTo(1400, height - 32);
      ctx.lineTo(1490, height - 150);
      ctx.lineTo(1580, height - 32);
      ctx.fill();

      // Draw flagpole victory shrine at the very end
      const poleX = worldLength - 200;
      const poleY = height - 32;

      // Gate poles
      ctx.fillStyle = '#dc2626'; // Vermilion Red pillars
      ctx.fillRect(poleX - 5, poleY - 140, 10, 140);

      // Shrine roof top
      ctx.fillStyle = '#115e59'; // Spruce teal roofing tiles
      ctx.beginPath();
      ctx.moveTo(poleX - 25, poleY - 140);
      ctx.lineTo(poleX + 25, poleY - 140);
      ctx.lineTo(poleX + 15, poleY - 152);
      ctx.lineTo(poleX - 15, poleY - 152);
      ctx.closePath();
      ctx.fill();

      // Golden bells on eaves
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(poleX - 20, poleY - 138, 3, 0, Math.PI * 2);
      ctx.arc(poleX + 20, poleY - 138, 3, 0, Math.PI * 2);
      ctx.fill();

      // Cyan flags (青蓮福旗) of victory waving on flagpole
      ctx.fillStyle = '#06b6d4';
      ctx.strokeStyle = '#22d3ee';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      const waveOffset = Math.sin(distanceTraveled() * 0.1) * 3;
      ctx.moveTo(poleX, poleY - 110);
      ctx.lineTo(poleX + 38, poleY - 120 + waveOffset);
      ctx.lineTo(poleX, poleY - 130);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Draw blocks
      for (const block of blocks) {
        let drawY = block.y;
        if (block.hitAnimation !== undefined) {
          drawY -= block.hitAnimation;
        }

        if (block.type === 'ground') {
          // Rich ancient red clay ground blocks with green grass rim on top
          const blockGrad = ctx.createLinearGradient(block.x, drawY, block.x, drawY + block.height);
          blockGrad.addColorStop(0, '#7c2d12'); // top mud
          blockGrad.addColorStop(1, '#451a03'); // shadow dark mud
          ctx.fillStyle = blockGrad;
          ctx.fillRect(block.x, drawY, block.width, block.height);

          // Grass line highlight
          ctx.fillStyle = '#16a34a';
          ctx.fillRect(block.x, drawY, block.width, 5);

          // Diagonal grass spikes
          ctx.fillStyle = '#4ade80';
          ctx.beginPath();
          ctx.moveTo(block.x, drawY + 5);
          ctx.lineTo(block.x + 8, drawY + 11);
          ctx.lineTo(block.x + 16, drawY + 5);
          ctx.lineTo(block.x + 24, drawY + 11);
          ctx.lineTo(block.x + 32, drawY + 5);
          ctx.lineTo(block.x + 32, drawY);
          ctx.lineTo(block.x, drawY);
          ctx.fill();
        } else if (block.type === 'brick') {
          // Engraved red tile bricks
          ctx.fillStyle = '#b91c1c';
          ctx.fillRect(block.x, drawY, block.width, block.height);
          
          // Brick border
          ctx.strokeStyle = '#ca8a04'; // gold borders for fancy国潮 look
          ctx.lineWidth = 1;
          ctx.strokeRect(block.x + 1, drawY + 1, block.width - 2, block.height - 2);

          // brick pattern lines
          ctx.strokeStyle = 'rgba(0,0,0,0.2)';
          ctx.beginPath();
          ctx.moveTo(block.x + block.width / 2, drawY + 1);
          ctx.lineTo(block.x + block.width / 2, drawY + block.height - 1);
          ctx.stroke();
        } else if (block.type === 'cloud_block') {
          // Fluffy cloud solid block
          ctx.fillStyle = '#f1f5f9';
          ctx.beginPath();
          ctx.arc(block.x + 6, drawY + 10, 8, 0, Math.PI * 2);
          ctx.arc(block.x + 14, drawY + 8, 10, 0, Math.PI * 2);
          ctx.arc(block.x + 20, drawY + 11, 8, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = '#cbd5e1';
          ctx.lineWidth = 1;
          ctx.stroke();
        } else if (block.type === 'question') {
          // Lucky gold box
          const qBoxGrad = ctx.createLinearGradient(block.x, drawY, block.x, drawY + block.height);
          
          if (block.content === 'empty') {
            // inactive hit block
            qBoxGrad.addColorStop(0, '#64748b'); // cold steel grey
            qBoxGrad.addColorStop(1, '#475569');
            ctx.fillStyle = qBoxGrad;
            ctx.fillRect(block.x, drawY, block.width, block.height);
            ctx.strokeStyle = '#334155';
            ctx.strokeRect(block.x, drawY, block.width, block.height);
          } else {
            // Active Question block
            qBoxGrad.addColorStop(0, '#fef08a');
            qBoxGrad.addColorStop(1, '#eab308');
            ctx.fillStyle = qBoxGrad;
            ctx.fillRect(block.x, drawY, block.width, block.height);

            ctx.strokeStyle = '#d97706';
            ctx.lineWidth = 1.5;
            ctx.strokeRect(block.x, drawY, block.width, block.height);

            // Shimmering star outline inside
            ctx.fillStyle = '#b45309';
            ctx.font = 'bold 11px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('吉', block.x + block.width / 2, drawY + 14); // "吉" (Fortune) in center!
          }
        } else if (block.type === 'spike') {
          // Spiky silver bamboo shoot spikes
          ctx.fillStyle = '#94a3b8';
          ctx.strokeStyle = '#475569';
          ctx.lineWidth = 1.5;

          ctx.beginPath();
          ctx.moveTo(block.x, drawY + block.height);
          ctx.lineTo(block.x + block.width / 4, drawY);
          ctx.lineTo(block.x + block.width / 2, drawY + block.height / 2);
          ctx.lineTo(block.x + (block.width * 3) / 4, drawY);
          ctx.lineTo(block.x + block.width, drawY + block.height);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        }
      }

      // Draw items
      for (const item of items) {
        if (item.type === 'coin') {
          // Copper cash coins
          ctx.fillStyle = '#fbbf24';
          ctx.strokeStyle = '#b45309';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(item.x + 7, item.y + 7, 7, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          // square inner hole
          ctx.fillStyle = '#fed7aa';
          ctx.fillRect(item.x + 5.5, item.y + 5.5, 3, 3);
        } else if (item.type === 'peach') {
          // Pink Sacred Peach
          const itemPeach = ctx.createRadialGradient(item.x + 4, item.y + 5, 2, item.x + 7, item.y + 7, 8);
          itemPeach.addColorStop(0, '#ffffff');
          itemPeach.addColorStop(0.6, '#fbcfe8');
          itemPeach.addColorStop(1, '#db2777');
          ctx.fillStyle = itemPeach;
          ctx.beginPath();
          ctx.ellipse(item.x + 7, item.y + 7, 7, 8, 0, 0, Math.PI * 2);
          ctx.fill();

          // Leaves
          ctx.fillStyle = '#15803d';
          ctx.beginPath();
          ctx.ellipse(item.x + 2, item.y + 11, 4, 2, Math.PI / 4, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Draw active enemies
      for (const enemy of enemies) {
        if (!enemy.alive) {
          // Squashed flat bun monster representation
          ctx.fillStyle = 'rgba(254, 240, 138, 0.4)';
          ctx.strokeStyle = '#d97706';
          ctx.lineWidth = 1;
          ctx.fillRect(enemy.x, enemy.y + enemy.height - 4, enemy.width, 4);
          continue;
        }

        if (enemy.type === 'bun') {
          // Cute steamed bun with angry evil face (包子精怪)
          ctx.fillStyle = '#fffbeb'; // soft white dough
          ctx.strokeStyle = '#eab308';
          ctx.lineWidth = 1.5;

          ctx.beginPath();
          ctx.arc(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, enemy.width / 2, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          // Red dot on forehead as traditional bun brand
          ctx.fillStyle = '#ef4444';
          ctx.beginPath();
          ctx.arc(enemy.x + enemy.width / 2, enemy.y + 6, 2, 0, Math.PI * 2);
          ctx.fill();

          // Angry facial expressions
          ctx.strokeStyle = '#1e293b';
          ctx.lineWidth = 1;
          ctx.beginPath();
          // Angry eyes "/" and "\"
          ctx.moveTo(enemy.x + 6, enemy.y + 10);
          ctx.lineTo(enemy.x + 9, enemy.y + 12);
          ctx.moveTo(enemy.x + 14, enemy.y + 10);
          ctx.lineTo(enemy.x + 11, enemy.y + 12);

          // grumpy mouth
          ctx.moveTo(enemy.x + 7, enemy.y + 15);
          ctx.quadraticCurveTo(enemy.x + 10, enemy.y + 13, enemy.x + 13, enemy.y + 15);
          ctx.stroke();
        } else if (enemy.type === 'cloud_imp') {
          // Little blue cloud spirit (祥雲邪怪)
          ctx.fillStyle = '#e0f2fe';
          ctx.strokeStyle = '#0284c7';
          ctx.lineWidth = 1.5;

          ctx.beginPath();
          ctx.arc(enemy.x + 6, enemy.y + 10, 6, 0, Math.PI * 2);
          ctx.arc(enemy.x + 14, enemy.y + 8, 8, 0, Math.PI * 2);
          ctx.arc(enemy.x + 20, enemy.y + 11, 5, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          // Angry features
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(enemy.x + 7, enemy.y + 6, 2, 2);
          ctx.fillRect(enemy.x + 12, enemy.y + 6, 2, 2);
        }
      }

      // Draw particles
      for (const p of particles) {
        ctx.save();
        ctx.globalAlpha = p.alpha;

        if (p.type === 'score_popup' && p.text) {
          ctx.fillStyle = p.color;
          ctx.font = 'bold 9px "Inter", sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(p.text, p.x, p.y);
        } else if (p.type === 'petal') {
          // cherry blossom
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.ellipse(p.x, p.y, p.size, p.size * 0.5, Math.PI / 4, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      // 7. DRAW THE PROTAGONIST (Cute Red Panda Hero)
      ctx.save();
      ctx.translate(player.x + 9, player.y + (isSuper ? 17 : 13));

      // Flashing damage effect if invincible
      if (player.invincibilityTimer === 0 || Math.floor(player.invincibilityTimer / 4) % 2 === 0) {
        if (!player.facingRight) {
          ctx.scale(-1, 1); // Flip horizontally depending on gaze direction
        }

        // Hitbox debug representation - omitted for production polish
        // Drawing beautiful custom-composed vector Red Panda
        
        // Shiny Red Panda Body
        const scale = isSuper ? 1.35 : 1.0;
        ctx.save();
        ctx.scale(scale, scale);

        // Golden outline aura for Super Hero State!
        if (isSuper) {
          ctx.strokeStyle = 'rgba(234, 179, 8, 0.65)';
          ctx.lineWidth = 3.5;
          ctx.shadowBlur = 10;
          ctx.shadowColor = '#eab308';
          ctx.beginPath();
          ctx.arc(0, 0, 15, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Round chubby head base
        ctx.fillStyle = '#ea580c'; // main orange
        ctx.beginPath();
        ctx.arc(0, -6, 11, 0, Math.PI * 2);
        ctx.fill();

        // Fluffy large white ears
        ctx.fillStyle = '#fffbeb';
        ctx.beginPath();
        ctx.ellipse(-8, -14, 5, 8, -Math.PI / 6, 0, Math.PI * 2);
        ctx.ellipse(8, -14, 5, 8, Math.PI / 6, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ea580c';
        ctx.beginPath();
        ctx.ellipse(-8, -13, 3, 5, -Math.PI / 6, 0, Math.PI * 2);
        ctx.ellipse(8, -13, 3, 5, Math.PI / 6, 0, Math.PI * 2);
        ctx.fill();

        // White cheeks / brows mask
        ctx.fillStyle = '#fffbeb';
        ctx.beginPath();
        ctx.ellipse(-5, -4, 4, 3, 0, 0, Math.PI * 2);
        ctx.ellipse(5, -4, 4, 3, 0, 0, Math.PI * 2);
        ctx.fill();

        // Chubby nose muzzle snout
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(0, -2, 3, 0, Math.PI * 2);
        ctx.fill();

        // Tiny black nose tip
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.arc(0, -3, 1.2, 0, Math.PI * 2);
        ctx.fill();

        // Twinkling cartoon eyes
        ctx.fillStyle = '#111827';
        ctx.beginPath();
        ctx.arc(-4, -6, 1.8, 0, Math.PI * 2);
        ctx.arc(4, -6, 1.8, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(-3.5, -6.5, 0.7, 0, Math.PI * 2);
        ctx.arc(4.5, -6.5, 0.7, 0, Math.PI * 2);
        ctx.fill();

        // Ancient Headband ribbon on red panda (大俠額帶)
        ctx.strokeStyle = '#dc2626';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(-11, -9);
        ctx.lineTo(11, -9);
        ctx.stroke();

        // Hanging headband tails sways behind
        ctx.fillStyle = '#dc2626';
        ctx.beginPath();
        ctx.moveTo(-11, -9);
        const tailOffset = Math.sin(distanceTraveled() * 0.1) * 3;
        ctx.lineTo(-18, -4 + tailOffset);
        ctx.lineTo(-15, -12);
        ctx.closePath();
        ctx.fill();

        // Chubby dark brown limbs and torso
        ctx.fillStyle = '#451a03'; // extreme dark brown torso
        ctx.beginPath();
        ctx.arc(0, 5, 8, 0, Math.PI * 2);
        ctx.fill();

        // Fluffy large red-and-black striped tail waving behind
        ctx.save();
        ctx.translate(-8, 5);
        ctx.rotate(Math.sin(distanceTraveled() * 0.12) * 0.25);
        
        ctx.fillStyle = '#ea580c';
        ctx.beginPath();
        ctx.ellipse(-8, 0, 10, 5, -Math.PI / 8, 0, Math.PI * 2);
        ctx.fill();

        // Black stripe stripes on tail
        ctx.fillStyle = '#451a03';
        ctx.beginPath();
        ctx.ellipse(-12, -1, 3, 4, -Math.PI / 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Running legs loop animation when moving
        const isWalking = Math.abs(player.vx) > 0.1 && player.grounded;
        const swing = isWalking ? Math.sin(distanceTraveled() * 0.35) * 5 : 0;
        
        ctx.fillStyle = '#451a03';
        // Left foot
        ctx.fillRect(-6, 9 + swing * 0.5, 3.5, 4);
        // Right foot
        ctx.fillRect(2.5, 9 - swing * 0.5, 3.5, 4);

        ctx.restore();
      }

      ctx.restore();
      ctx.restore(); // end camera projection

      animId = requestAnimationFrame(gameTick);
    };

    // Trigger headbutt on blocks
    const triggerBlockHeadbutt = (block: Block) => {
      block.hitAnimation = 6;
      playSfx('kick');

      if (block.type === 'question' && block.content && block.content !== 'empty') {
        const dropType = block.content;
        block.content = 'empty';

        if (dropType === 'coin') {
          playSfx('coin');
          setCoinsCollected(prev => {
            const n = prev + 1;
            localStorage.setItem('minigame_mario_coins', n.toString());
            return n;
          });
          setScore(prev => prev + 15);

          // Spawn high-flying jumping coin that flies up and disappears!
          particles.push({
            x: block.x + block.width / 2,
            y: block.y - 12,
            vx: 0,
            vy: -4,
            size: 6,
            color: '#fbbf24',
            alpha: 1,
            life: 0,
            maxLife: 20,
            type: 'star'
          });

          // Small score text popup
          particles.push({
            x: block.x + block.width / 2,
            y: block.y - 25,
            vx: 0,
            vy: -0.4,
            size: 9,
            color: '#fbbf24',
            alpha: 1,
            life: 0,
            maxLife: 25,
            type: 'score_popup',
            text: '+15'
          });
        } else if (dropType === 'peach') {
          // Release longevity peach that jumps up out of box and falls onto platforms
          playSfx('powerup');
          items.push({
            x: block.x,
            y: block.y - 22,
            vx: 0.9,
            vy: -4.5,
            width: 14,
            height: 14,
            type: 'peach',
            collected: false,
            grounded: false
          });

          setMascotChat('天桃出世！快去吃掉跳落的仙桃，激發無敵金身法力！🍑✨');
        }
      }
    };

    // Damage checking
    const handlePlayerHit = () => {
      if (player.invincibilityTimer > 0) return;

      if (peachRef.current) {
        // Demote from big peach state with buffer protection, rather than instant failure
        setPeachPowerActive(false);
        player.invincibilityTimer = 60; // 1 second of flashes
        playSfx('powerdown');
        setMascotChat('小心！你的仙桃護體金身破裂了，現出原形！再受到一次撞擊將會受傷！💥🐼');
      } else {
        // Lose one life
        handlePlayerDeath();
      }
    };

    // Handle standard death
    const handlePlayerDeath = () => {
      playSfx('hurt');
      setLives(prev => {
        const nextLives = prev - 1;
        if (nextLives <= 0) {
          triggerGameOver();
          return 0;
        } else {
          // Restart at beginning of level
          player.x = 60;
          player.y = 120;
          player.vx = 0;
          player.vy = 0;
          player.invincibilityTimer = 75; // longer flash safety
          setMascotChat('修行阻滯，好在神祇庇護！損失了一枚道心，抓緊時間重返仙途！❤️‍🩹🎋');
          return nextLives;
        }
      });
    };

    const triggerGameOver = () => {
      setGameState('gameover');
      playSfx('gameover');
      setMascotChat('太遺憾了，仙路坎坷，元神歸位！快點擊下方重整旗鼓，再次問鼎桃林！🥀🌀');
    };

    const triggerVictory = () => {
      setGameState('victory');
      playSfx('victory');

      // Save high scores
      const finalScore = scoreRef.current;
      const savedHigh = localStorage.getItem('minigame_mario_hiscore');
      const numericHigh = savedHigh ? parseInt(savedHigh, 10) : 0;
      if (finalScore > numericHigh) {
        setHighScore(finalScore);
        localStorage.setItem('minigame_mario_hiscore', finalScore.toString());
      }

      setMascotChat('功德登天，金仙降臨！你已奪得「青蓮星君」無上福祿！道友手法真乃仙界第一！🎖️🎉');
    };

    const distanceTraveled = () => {
      return player.x;
    };

    animId = requestAnimationFrame(gameTick);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [gameState, currentLevel, playSfx]);

  return (
    <div className="w-full max-w-4xl mx-auto p-3 md:p-6" id="super_mario_main_card">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* LEFT PLAYABLE GAMEZONE: 7 cols */}
        <div className="lg:col-span-7 flex flex-col items-center bg-white rounded-3xl p-4 md:p-5 border border-amber-50 shadow-sm" id="game_box_wrapper">
          
          {/* Header Stats Panel */}
          <div className="w-full max-w-[480px] flex items-center justify-between mb-3 bg-amber-50/40 px-3 py-2 rounded-2xl border border-amber-100" id="supermario_header">
            {/* High score */}
            <div className="flex items-center gap-1.5">
              <div className="bg-amber-400 p-1.5 rounded-full text-amber-950">
                <Trophy className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="block text-[8px] text-amber-800 font-bold leading-none">最高福星度</span>
                <span className="text-xs font-black font-mono text-amber-950 leading-none">{highScore}</span>
              </div>
            </div>

            {/* Lives */}
            <div className="flex items-center gap-1 bg-red-50 px-2.5 py-1 rounded-full border border-red-100">
              <span className="text-[8px] font-bold text-red-600 mr-1">道心</span>
              <div className="flex items-center gap-0.5">
                {[...Array(3)].map((_, idx) => (
                  <Heart 
                    key={idx} 
                    className={`w-3.5 h-3.5 ${idx < lives ? 'fill-red-500 text-red-500' : 'text-slate-200'}`} 
                  />
                ))}
              </div>
            </div>

            {/* Score */}
            <div className="text-center">
              <span className="text-[9px] text-amber-600 font-bold block leading-none">積分</span>
              <span className="text-lg font-black font-mono text-amber-800 leading-none">{score}</span>
            </div>

            {/* Coins */}
            <div className="flex items-center gap-0.5 bg-yellow-100/60 px-2 py-0.5 rounded-full border border-yellow-200">
              <Coins className="w-3.5 h-3.5 text-yellow-600" />
              <span className="text-[10px] font-black text-yellow-800 font-mono">{coinsCollected}</span>
            </div>
          </div>

          {/* Actual Canvas */}
          <div className="relative w-full max-w-[480px] aspect-[48/32] rounded-2.5xl overflow-hidden border-4 border-amber-100 shadow-md bg-stone-150 select-none">
            
            <canvas 
              ref={canvasRef} 
              className="w-full h-full block" 
            />

            {/* Active Buff State Banner overlay */}
            <div className="absolute top-3 left-3 flex flex-col gap-1.5 pointer-events-none">
              <AnimatePresence>
                {peachPowerActive && (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="flex items-center gap-1 bg-pink-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-md"
                  >
                    <Shield className="w-3 h-3 text-white animate-pulse" />
                    <span>天仙護法 (桃源金身)</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* LEVEL indicator flag */}
            <div className="absolute top-2 right-2 bg-slate-900/40 px-2 py-0.5 rounded text-[10px] text-white font-mono font-bold pointer-events-none">
              LEVEL: {currentLevel}
            </div>

            {/* IDLE state starting HUD screen */}
            {gameState === 'idle' && (
              <div className="absolute inset-0 bg-orange-950/20 backdrop-blur-xs flex flex-col items-center justify-center text-center p-6">
                <motion.div 
                  initial={{ scale: 0.85, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="bg-white/95 border-2 border-amber-200 p-5 rounded-3xl max-w-[320px] shadow-xl flex flex-col items-center gap-3.5"
                >
                  <div className="bg-red-50 p-3 rounded-full text-red-500 animate-bounce">
                    <Sparkles className="w-6 h-6" />
                  </div>

                  <div>
                    <h3 className="font-black text-gray-800 text-base leading-tight">桃源吉星大冒險</h3>
                    <p className="text-[10px] text-slate-400 mt-1 leading-normal">
                      化身小小紅熊貓大俠躍跳闖關！在鍵盤上使用 WASD / 方向鍵行走跳躍，頂碎黃金 Question 寶箱，獲取靈桃福祿！
                    </p>
                  </div>

                  <button 
                    onClick={() => {
                      setGameState('playing');
                      setMascotChat('大俠出征！注意地上會移動的包子精怪，避開危險的地煞鋼刺！🤺🔥');
                      playSfx('click');
                    }}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 rounded-full shadow-md border-b-4 border-orange-700 text-xs transition-transform active:translate-y-0.5 flex items-center justify-center gap-1"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    開始神仙大闖關
                  </button>

                  {/* Keys legend */}
                  <div className="flex gap-2 text-[8px] text-slate-400 font-semibold bg-slate-50 px-2.5 py-1 rounded">
                    <span>左右: A / D</span>
                    <span>•</span>
                    <span>跳躍: W / Space</span>
                  </div>
                </motion.div>
              </div>
            )}

            {/* GAMEOVER Failed HUD screen */}
            {gameState === 'gameover' && (
              <div className="absolute inset-0 bg-red-950/30 backdrop-blur-xs flex flex-col items-center justify-center text-center p-6">
                <motion.div 
                  initial={{ y: 15, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="bg-white/95 border-2 border-red-200 p-5 rounded-3xl max-w-[300px] shadow-2xl flex flex-col items-center gap-3"
                >
                  <div className="bg-red-50 p-3 rounded-full text-red-500">
                    <Heart className="w-6 h-6 text-red-400" />
                  </div>

                  <div>
                    <span className="text-[9px] font-black text-red-500 tracking-wider block uppercase">仙折歸位</span>
                    <h3 className="font-black text-gray-800 text-base leading-tight mt-0.5">修行戛止，需重新修煉</h3>
                  </div>

                  {/* Summary score */}
                  <div className="bg-slate-50 px-4 py-2 rounded-xl border border-slate-100 font-mono w-full">
                    <span className="text-[9px] text-slate-400 font-bold block">獲得福氣值</span>
                    <span className="text-xl font-extrabold text-amber-800">{score}</span>
                  </div>

                  <button 
                    onClick={restartGame}
                    className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2 rounded-full shadow-md border-b-4 border-red-700 text-xs transition-transform active:translate-y-0.5 flex items-center justify-center gap-1"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    重置仙緣
                  </button>
                </motion.div>
              </div>
            )}

            {/* VICTORY complete Level screen */}
            {gameState === 'victory' && (
              <div className="absolute inset-0 bg-teal-950/20 backdrop-blur-xs flex flex-col items-center justify-center text-center p-6">
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="bg-white/95 border-4 border-teal-100 p-5 rounded-3xl max-w-[320px] shadow-2xl flex flex-col items-center gap-3.5"
                >
                  <div className="bg-teal-50 p-3 rounded-full text-teal-600 animate-spin">
                    <Award className="w-7 h-7" />
                  </div>

                  <div>
                    <span className="text-[9px] font-black text-teal-600 tracking-wider block uppercase">大吉大利</span>
                    <h3 className="font-black text-gray-800 text-base leading-tight mt-0.5">功德圓滿，御賜青蓮！</h3>
                    <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                      恭喜成功奪取青蓮福旗！身法圓滿、福報加身。
                    </p>
                  </div>

                  {/* Score breakdown */}
                  <div className="grid grid-cols-2 gap-2 w-full bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-left">
                    <div className="border-r border-slate-200 font-mono pl-1">
                      <span className="text-[8px] text-slate-400 font-bold block">總積分</span>
                      <span className="text-base font-black text-teal-600">{score}</span>
                    </div>
                    <div className="font-mono pl-3">
                      <span className="text-[8px] text-slate-400 font-bold block">採集古錢</span>
                      <span className="text-base font-black text-yellow-600">{coinsCollected} 緡</span>
                    </div>
                  </div>

                  <div className="flex gap-2 w-full justify-stretch">
                    <button 
                      onClick={restartGame}
                      className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2 rounded-full text-[11px] transition-transform active:translate-y-0.5 border-b-2 border-slate-300"
                    >
                      重新挑戰
                    </button>
                    <button 
                      onClick={startNextLevel}
                      className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 rounded-full text-[11px] transition-transform active:translate-y-0.5 border-b-4 border-teal-800"
                    >
                      下一重天
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </div>

          {/* D-Pad Responsive on-screen touching layout for smooth tablet gaming! */}
          <div className="w-full max-w-[480px] mt-4 p-3 bg-orange-50/50 rounded-2xl border border-orange-100/50 flex items-center justify-between gap-6" id="super_mario_touch_control_pad">
            <div className="flex items-center gap-2">
              <button
                onTouchStart={() => leftPressed.current = true}
                onTouchEnd={() => leftPressed.current = false}
                onMouseDown={() => leftPressed.current = true}
                onMouseUp={() => leftPressed.current = false}
                onMouseLeave={() => leftPressed.current = false}
                className="w-12 h-12 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-90 text-white flex items-center justify-center shadow transition-all border-b-4 border-amber-700"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <button
                onTouchStart={() => rightPressed.current = true}
                onTouchEnd={() => rightPressed.current = false}
                onMouseDown={() => rightPressed.current = true}
                onMouseUp={() => rightPressed.current = false}
                onMouseLeave={() => rightPressed.current = false}
                className="w-12 h-12 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-90 text-white flex items-center justify-center shadow transition-all border-b-4 border-amber-700"
              >
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>

            <button
              onClick={() => {
                // simulate direct jump command
                keysPressedRef.current['Space'] = true;
                setTimeout(() => {
                  keysPressedRef.current['Space'] = false;
                }, 100);
              }}
              className="px-6 h-12 rounded-xl bg-red-500 hover:bg-red-600 active:scale-90 text-white font-extrabold flex items-center justify-center gap-1.5 shadow transition-all border-b-4 border-red-700 text-xs"
            >
              <ArrowUp className="w-4 h-4" />
              施展輕功 (跳躍)
            </button>
          </div>
        </div>

        {/* RIGHT SIDE DETAILS AND MASCOT ADVICE PANEL: 5 cols */}
        <div className="lg:col-span-5 space-y-4" id="game_controls_settings_panel">
          
          {/* Mascot Speech Bubble */}
          <div className="bg-emerald-50 rounded-3xl p-4 border border-emerald-100 flex items-start gap-3" id="supermario_mascot_chat">
            <div className="w-12 h-12 bg-emerald-100 rounded-full flex-shrink-0 flex items-center justify-center text-2xl border-2 border-emerald-300 shadow-sm">
              🐼
            </div>
            <div className="space-y-1">
              <span className="block text-[9px] font-bold text-emerald-800 uppercase tracking-widest leading-none">祥瑞熊貓</span>
              <p className="text-xs text-emerald-950 font-medium leading-relaxed">
                {mascotChat}
              </p>
            </div>
          </div>

          {/* Preferences controller block */}
          <div className="bg-white rounded-3xl p-4 md:p-5 border border-slate-100 shadow-xs space-y-4" id="preferences_card">
            <div className="border-b border-slate-100 pb-2.5 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-amber-500" />
                <h4 className="font-bold text-gray-800 text-sm">修行控制盤</h4>
              </div>

              {/* Sound controller */}
              <button 
                onClick={() => {
                  playSfx('click');
                  setSoundEnabled(prev => !prev);
                }}
                className={`p-1.5 rounded-full border transition-all ${soundEnabled ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-slate-50 text-slate-400 border-slate-200'}`}
              >
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>
            </div>

            {/* Game rules card details */}
            <div className="space-y-2.5" id="game_mario_instructions">
              <div className="flex items-start gap-2.5 bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-left">
                <div className="bg-amber-100 p-1.5 rounded-lg text-amber-700 text-xs font-mono font-bold">1</div>
                <div>
                  <h5 className="text-[11px] font-bold text-gray-800">踏青尋奇</h5>
                  <p className="text-[10px] text-gray-400 leading-normal">
                    用 A/D (或螢幕方向按鈕) 左右移動；W/Space (或輕功按鈕) 施展空中跳躍。
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-left">
                <div className="bg-pink-100 p-1.5 rounded-lg text-pink-700 text-xs font-mono font-bold">2</div>
                <div>
                  <h5 className="text-[11px] font-bold text-gray-800">福星高照（萬壽仙桃）</h5>
                  <p className="text-[10px] text-gray-400 leading-normal">
                    用手部／頭部撞擊黃金 Question 箱，可產出萬壽仙桃。吃下仙桃可獲得一次額外「血量緩衝」，免受死亡危險！
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-left">
                <div className="bg-emerald-100 p-1.5 rounded-lg text-emerald-700 text-xs font-mono font-bold">3</div>
                <div>
                  <h5 className="text-[11px] font-bold text-gray-800">退散精怪</h5>
                  <p className="text-[10px] text-gray-400 leading-normal">
                    大福包子怪等行屍走肉生猛。踩上牠們的頭部可以直接擊碎牠們並獲得敏捷反彈！從側面撞擊會跌倒唷。
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-left">
                <div className="bg-cyan-100 p-1.5 rounded-lg text-cyan-700 text-xs font-mono font-bold">4</div>
                <div>
                  <h5 className="text-[11px] font-bold text-gray-800">圓滿通關</h5>
                  <p className="text-[10px] text-gray-400 leading-normal">
                    一直向右前進 2000 米，找到最底端的「朱漆牌坊」與「青蓮福旗」，一觸即通向全新仙界重天。
                  </p>
                </div>
              </div>
            </div>

            {/* Quick action info */}
            <div className="bg-[#eff6ff]/50 rounded-2xl p-3 border border-blue-100 flex items-center justify-between text-left">
              <div>
                <span className="block text-[8px] text-blue-800 font-bold uppercase tracking-wider">相容性認證</span>
                <span className="text-[11px] text-blue-950 font-black">極致流暢 HTML5 Canvas 技術</span>
              </div>
              <Sparkles className="w-5 h-5 text-blue-500 animate-pulse" />
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
