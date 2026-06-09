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
  X, 
  Info,
  ChevronRight,
  Flame
} from 'lucide-react';

interface Obstacle {
  x: number;
  width: number;
  topHeight: number;
  bottomHeight: number;
  passed: boolean;
  hasLantern: boolean;
  lanternSway: number;
}

interface Item {
  x: number;
  y: number;
  type: 'coin' | 'peach';
  collected: boolean;
  pulse: number;
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
  type: 'star' | 'petal' | 'sparkle';
}

type SkinId = 'sparrow' | 'crane';

export default function MiniGameFlipperBird() {
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'paused' | 'gameover'>('idle');
  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(0);
  const [coinsCollected, setCoinsCollected] = useState<number>(0);
  const [peachPowerActive, setPeachPowerActive] = useState<boolean>(false);
  const [shieldActive, setShieldActive] = useState<boolean>(false);
  const [peachTimer, setPeachTimer] = useState<number>(0);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [selectedSkin, setSelectedSkin] = useState<SkinId>('sparrow');
  const [showHelp, setShowHelp] = useState<boolean>(false);
  const [speedrunDifficulty, setSpeedrunDifficulty] = useState<'normal' | 'hard'>('normal');

  // Audio mute helper
  const soundEnabledRef = useRef(soundEnabled);
  useEffect(() => {
    soundEnabledRef.current = soundEnabled;
  }, [soundEnabled]);

  // Mascot Speech System
  const [mascotChat, setMascotChat] = useState<string>('小仙雀正在林間撲翼熱身，準備好與牠一起凌雲御風了嗎？☁️🐣');
  
  // High score tracking
  useEffect(() => {
    const saved = localStorage.getItem('minigame_flipper_hiscore');
    if (saved) setHighScore(parseInt(saved, 10));
    const savedCoins = localStorage.getItem('minigame_flipper_coins_total');
    if (savedCoins) setCoinsCollected(parseInt(savedCoins, 10));
  }, []);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  
  // Game state values in refs for canvas loop accuracy
  const stateRef = useRef(gameState);
  const scoreRef = useRef(score);
  const shieldRef = useRef(shieldActive);
  const peachRef = useRef(peachPowerActive);
  const difficultyRef = useRef(speedrunDifficulty);

  useEffect(() => { stateRef.current = gameState; }, [gameState]);
  useEffect(() => { scoreRef.current = score; }, [score]);
  useEffect(() => { shieldRef.current = shieldActive; }, [shieldActive]);
  useEffect(() => { peachRef.current = peachPowerActive; }, [peachPowerActive]);
  useEffect(() => { difficultyRef.current = speedrunDifficulty; }, [speedrunDifficulty]);

  // SFX Synth function
  const playSfx = useCallback((type: 'flap' | 'coin' | 'peach' | 'shield_break' | 'gong_gameover' | 'click') => {
    if (!soundEnabledRef.current) return;
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();

      if (type === 'flap') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(320, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(580, ctx.currentTime + 0.08);
        gain.gain.setValueAtTime(0.04, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
        osc.start();
        osc.stop(ctx.currentTime + 0.09);
      } else if (type === 'coin') {
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();
        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);

        osc1.type = 'sine';
        osc2.type = 'sine';
        osc1.frequency.setValueAtTime(988, ctx.currentTime); // B5
        osc2.frequency.setValueAtTime(1318, ctx.currentTime + 0.06); // E6

        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);

        osc1.start();
        osc1.stop(ctx.currentTime + 0.3);
        osc2.start();
        osc2.stop(ctx.currentTime + 0.3);
      } else if (type === 'peach') {
        // Celestial arpeggio
        const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.05);
          gain.gain.setValueAtTime(0.04, ctx.currentTime + idx * 0.05);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.05 + 0.2);
          osc.start(ctx.currentTime + idx * 0.05);
          osc.stop(ctx.currentTime + idx * 0.05 + 0.22);
        });
      } else if (type === 'shield_break') {
        // Shuttering glassy sound
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.06, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);
        osc.start();
        osc.stop(ctx.currentTime + 0.23);
      } else if (type === 'gong_gameover') {
        // Dramatic Chinese Gong simulation
        const oscLow = ctx.createOscillator();
        const oscMod = ctx.createOscillator();
        const modGain = ctx.createGain();
        const mainGain = ctx.createGain();

        // Low heavy hum
        oscLow.type = 'triangle';
        oscLow.frequency.setValueAtTime(140, ctx.currentTime);
        oscLow.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.8);

        // Clang frequency modulation
        oscMod.type = 'sawtooth';
        oscMod.frequency.setValueAtTime(220, ctx.currentTime);
        oscMod.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + 0.4);

        modGain.gain.setValueAtTime(40, ctx.currentTime);
        modGain.gain.exponentialRampToValueAtTime(1, ctx.currentTime + 0.6);

        // Connect synthesis
        oscMod.connect(modGain);
        modGain.connect(oscLow.frequency);

        oscLow.connect(mainGain);
        mainGain.connect(ctx.destination);

        mainGain.gain.setValueAtTime(0.12, ctx.currentTime);
        mainGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);

        oscLow.start();
        oscLow.stop(ctx.currentTime + 1.3);
        oscMod.start();
        oscMod.stop(ctx.currentTime + 0.7);
      } else if (type === 'click') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
        osc.start();
        osc.stop(ctx.currentTime + 0.06);
      }
    } catch (e) {
      console.warn("Audio context not ready:", e);
    }
  }, []);

  // Set selected skin on start screen
  const selectSkin = (skin: SkinId) => {
    playSfx('click');
    setSelectedSkin(skin);
    if (skin === 'crane') {
      setMascotChat('仙鶴君儀態萬方，舒展雪翼！在紅蓮花與綠荷葉間展露高雅身段！🦢🌸');
    } else {
      setMascotChat('小仙雀圓潤如金丸，最擅長御風走泥，啾啾一聲，福氣臨門！🐣🏮');
    }
  };

  // Switch difficulty
  const changeDifficulty = (diff: 'normal' | 'hard') => {
    playSfx('click');
    setSpeedrunDifficulty(diff);
    if (diff === 'hard') {
      setMascotChat('暴風雷雨將至！彩燈古閣移速加快，間距更窄，極致考驗您的凌雲身手！⚡⛈️');
    } else {
      setMascotChat('祥和春風吹拂，小仙雀在林間慢行，最適合攜手同游、悠然自在。🎐🌾');
    }
  };

  // Handle bird action (Flapping)
  const birdYRef = useRef<number>(200);
  const birdVelocityRef = useRef<number>(0);
  const birdAngleRef = useRef<number>(0);

  const triggerFlap = useCallback(() => {
    if (stateRef.current === 'idle') {
      // Start the game!
      setGameState('playing');
      setMascotChat('急風拂羽，穩住身姿！收集散落的金錢幣和靈果野桃！✨💰');
      birdVelocityRef.current = -4.9;
      playSfx('flap');
    } else if (stateRef.current === 'playing') {
      // Regular flap
      birdVelocityRef.current = -4.9;
      playSfx('flap');
    } else if (stateRef.current === 'gameover') {
      // Re-initialize
      setScore(0);
      setPeachPowerActive(false);
      setShieldActive(false);
      birdYRef.current = 200;
      birdVelocityRef.current = 0;
      birdAngleRef.current = 0;
      setGameState('playing');
      setMascotChat('逆風前行！相信仙雀定能衝破彩燈古閣的包圍！🪽🔥');
      playSfx('flap');
    }
  }, [playSfx]);

  // Handle keyboard flap
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['Space', 'ArrowUp', 'KeyW'].includes(e.code)) {
        e.preventDefault();
        triggerFlap();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [triggerFlap]);

  // Primary game loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;

    // Game variables defined locally for clean tick
    const width = 400;
    const height = 540;
    canvas.width = width;
    canvas.height = height;

    const gravity = 0.22;
    const pipeSpeedBase = 2.0;

    let obstacles: Obstacle[] = [];
    let items: Item[] = [];
    let particles: Particle[] = [];
    let backgroundScroll = 0;
    let distanceTraveled = 0;
    let spawnTimer = 0;

    // Add initial obstacle slightly offscreen
    const spawnObstacle = (spawnX: number) => {
      const minHeight = 80;
      const maxHeight = 280;
      const gap = difficultyRef.current === 'hard' ? 140 : 170; // wider gap for easier passage

      // Random position for obstacle slit
      const topHeight = Math.floor(Math.random() * (maxHeight - minHeight)) + minHeight;
      const bottomHeight = height - topHeight - gap - 40; // 40 for ground margin

      obstacles.push({
        x: spawnX,
        width: 62,
        topHeight,
        bottomHeight,
        passed: false,
        hasLantern: Math.random() > 0.4,
        lanternSway: Math.random() * Math.PI,
      });

      // Spawn golden coins or magical peaches in between
      if (Math.random() > 0.3) {
        // Spawn coin in the gap center
        items.push({
          x: spawnX + 31,
          y: topHeight + gap / 2,
          type: Math.random() > 0.85 ? 'peach' : 'coin',
          collected: false,
          pulse: Math.random() * Math.PI
        });
      }
    };

    // Initialize initial placements
    birdYRef.current = 240;
    birdVelocityRef.current = 0;
    birdAngleRef.current = 0;
    spawnObstacle(width + 80);
    spawnObstacle(width + 330);

    // Create persistent particles like peach blossoms blowing in sky
    for (let i = 0; i < 15; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: -(Math.random() * 0.8 + 0.3),
        vy: Math.random() * 0.5 + 0.2,
        size: Math.random() * 5 + 3,
        color: `rgba(${240 + Math.floor(Math.random() * 15)}, ${160 + Math.floor(Math.random() * 40)}, ${170 + Math.floor(Math.random() * 40)}, ${Math.random() * 0.6 + 0.3})`,
        alpha: Math.random() * 0.6 + 0.4,
        life: 0,
        maxLife: 200,
        type: 'petal'
      });
    }

    const gameTick = () => {
      const currentState = stateRef.current;
      const targetSpeed = difficultyRef.current === 'hard' ? 3.0 : 2.1;

      // 1. UPDATE STATES
      if (currentState === 'playing' || currentState === 'paused' || currentState === 'idle') {
        const speedMultiplier = (currentState === 'playing') ? 1 : 0;
        
        // Scroll backgrounds
        backgroundScroll = (backgroundScroll + 0.35 * speedMultiplier) % width;
        distanceTraveled += 1 * speedMultiplier;

        if (currentState === 'playing') {
          // Bird gravity physics
          birdVelocityRef.current += gravity;
          birdYRef.current += birdVelocityRef.current;

          // Bird tilt angle
          birdAngleRef.current = Math.min(Math.PI / 3, Math.max(-Math.PI / 6, birdVelocityRef.current * 0.08));

          // Ceiling and ground collisions
          if (birdYRef.current < 15) {
            birdYRef.current = 15;
            birdVelocityRef.current = 0.5;
          }

          // Ground hit!
          if (birdYRef.current > height - 60) {
            birdYRef.current = height - 60;
            // Game Over
            triggerGameOver();
          }

          // Spawn new obstacles dynamically based on last obstacle position to avoid overlays!
          if (obstacles.length > 0) {
            const lastObstacle = obstacles[obstacles.length - 1];
            const spacing = difficultyRef.current === 'hard' ? 220 : 250;
            if (lastObstacle.x < (width + 50) - spacing) {
              spawnObstacle(width + 50);
            }
          } else {
            spawnObstacle(width + 50);
          }

          // Update Peach Power depletion timer
          if (peachRef.current) {
            setPeachTimer(prev => {
              if (prev <= 1) {
                setPeachPowerActive(false);
                setMascotChat('太棒了！仙雀的神奇仙桃效力消退了，重新御春風！🌸🍡');
                return 0;
              }
              return prev - 1;
            });
          }

          // Obstacles loop
          for (let i = obstacles.length - 1; i >= 0; i--) {
            const obs = obstacles[i];
            obs.x -= targetSpeed;
            obs.lanternSway += 0.04;

            // Remove out-of-screen obstacles
            if (obs.x + obs.width < -10) {
              obstacles.splice(i, 1);
              continue;
            }

            // Score point award trigger on pass
            if (!obs.passed && obs.x + obs.width / 2 < 100) {
              obs.passed = true;
              setScore(prev => {
                const step = peachRef.current ? 2 : 1;
                const newScore = prev + step;
                // Mascot congratulations on milestones
                if (newScore === 10) {
                  setMascotChat('登峰造極！拿到 10 分了，仙雀的御風技巧漸入佳境！👑✨');
                } else if (newScore === 25) {
                  setMascotChat('天之驕子！解鎖了雪白尊貴的「仙鶴外觀」！快到首頁換裝吧！🦢🏆');
                } else if (newScore === 50) {
                  setMascotChat('凌雲真仙！50分的神奇造化，你已經徹底掌控了氣流！💨⚡');
                }
                return newScore;
              });
              // Tiny bell sound on pass
              playSfx('flap');
            }

            // High precision circular bubble-sparrow collision checking (More forgiving hitbox)
            const birdRadius = 11;
            const birdX = 100;
            const birdY = birdYRef.current;

            const boxLeft = obs.x;
            const boxRight = obs.x + obs.width;
            
            // Check top pillar collision box
            if (
              birdX + birdRadius > boxLeft &&
              birdX - birdRadius < boxRight &&
              (birdY - birdRadius < obs.topHeight || birdY + birdRadius > height - obs.bottomHeight - 40)
            ) {
              // Barrier impact! Handle shield bypass or crash
              if (shieldRef.current) {
                // Break shield rather than death
                setShieldActive(false);
                playSfx('shield_break');
                setMascotChat('好險！護體仙桃神光替你抵擋了一次碰撞！小心前行！🏮🛡️');
                // Remove this obstacle to prevent instant double collision
                obstacles.splice(i, 1);
                
                // Explode massive star shields
                for (let k = 0; k < 20; k++) {
                  particles.push({
                    x: birdX,
                    y: birdY,
                    vx: (Math.random() - 0.5) * 6,
                    vy: (Math.random() - 0.5) * 6,
                    size: Math.random() * 6 + 3,
                    color: '#38bdf8',
                    alpha: 1.0,
                    life: 0,
                    maxLife: 40,
                    type: 'star'
                  });
                }
              } else {
                // Instantly crash
                triggerGameOver();
              }
            }
          }

          // Items loop (Coins and Peaches)
          for (let i = items.length - 1; i >= 0; i--) {
            const item = items[i];
            item.x -= targetSpeed;
            item.pulse += 0.08;

            if (item.x < -20) {
              items.splice(i, 1);
              continue;
            }

            // Core item capture distance check
            const dist = Math.hypot(item.x - 100, item.y - birdYRef.current);
            if (!item.collected && dist < 28) {
              item.collected = true;
              
              if (item.type === 'coin') {
                playSfx('coin');
                setCoinsCollected(prev => {
                  const n = prev + 1;
                  localStorage.setItem('minigame_flipper_coins_total', n.toString());
                  return n;
                });
                setScore(prev => prev + 2); // coins give extra +2 bonus score!
                
                // Spawn sparkles
                for (let k = 0; k < 8; k++) {
                  particles.push({
                    x: item.x,
                    y: item.y,
                    vx: (Math.random() - 0.5) * 4,
                    vy: (Math.random() - 0.5) * 4,
                    size: Math.random() * 4 + 2,
                    color: '#eab308', // Shiny gold
                    alpha: 1.0,
                    life: 0,
                    maxLife: 30,
                    type: 'star'
                  });
                }
              } else if (item.type === 'peach') {
                playSfx('peach');
                setShieldActive(true);
                setPeachPowerActive(true);
                setPeachTimer(400); // 400 frames of shield and double score!
                setMascotChat('天賜福緣！吞食了仙桃，獲得「護身氣泡罩」與「分數翻倍」特效！🍑🫧');
                
                // Spawn rich pink sparkles
                for (let k = 0; k < 18; k++) {
                  particles.push({
                    x: item.x,
                    y: item.y,
                    vx: (Math.random() - 0.5) * 5,
                    vy: (Math.random() - 0.5) * 5,
                    size: Math.random() * 5 + 3,
                    color: '#ec4899', // bright pink
                    alpha: 1.0,
                    life: 0,
                    maxLife: 45,
                    type: 'petal'
                  });
                }
              }
              items.splice(i, 1);
            }
          }
        }

        // Particle updates
        for (let i = particles.length - 1; i >= 0; i--) {
          const p = particles[i];
          p.x += p.vx;
          p.y += p.vy;
          p.life++;

          if (p.type === 'petal') {
            p.vx += Math.sin(p.life * 0.05) * 0.02; // swaying petals
            if (p.x < -10) p.x = width + 10;
            if (p.y > height) p.y = -10;
          } else {
            p.alpha = 1 - p.life / p.maxLife;
            if (p.life >= p.maxLife) {
              particles.splice(i, 1);
            }
          }
        }
      }

      // 2. RENDER THE PRETTY IMAGERY
      ctx.clearRect(0, 0, width, height);

      // Deep Traditional Chinese Backdrop Gradient (Peach Dawn Sky)
      const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
      skyGrad.addColorStop(0, '#fef2f2'); // soft cherry cream
      skyGrad.addColorStop(0.3, '#ffedd5'); // apricot sun rays
      skyGrad.addColorStop(0.75, '#e0f2fe'); // gentle spring breeze teal
      skyGrad.addColorStop(1, '#bae6fd'); // warm pond blue
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, height);

      // Draw Sun in sky
      ctx.beginPath();
      // Draw a soft stylized red sunrise sun with rays
      const sunGrad = ctx.createRadialGradient(280, 110, 5, 280, 110, 50);
      sunGrad.addColorStop(0, 'rgba(239, 68, 68, 0.45)'); // Sunset vermilion
      sunGrad.addColorStop(0.5, 'rgba(249, 115, 22, 0.2)'); // solar gold glow
      sunGrad.addColorStop(1, 'rgba(254, 215, 170, 0)');
      ctx.fillStyle = sunGrad;
      ctx.arc(280, 110, 50, 0, Math.PI * 2);
      ctx.fill();

      // Draw Distant Lavender Chinese Mountains silhouettes
      ctx.fillStyle = 'rgba(129, 140, 248, 0.12)';
      ctx.beginPath();
      ctx.moveTo(0, height);
      ctx.lineTo(0, 320);
      ctx.quadraticCurveTo(80, 290, 140, 340);
      ctx.quadraticCurveTo(240, 260, 310, 360);
      ctx.quadraticCurveTo(360, 310, width, 330);
      ctx.lineTo(width, height);
      ctx.fill();

      // Draw Midground Forest / Pagodas silhouettes
      ctx.fillStyle = 'rgba(74, 222, 128, 0.08)';
      ctx.beginPath();
      ctx.moveTo(0, height);
      ctx.lineTo(0, 390);
      ctx.lineTo(50, 360);
      ctx.lineTo(100, 390);
      ctx.quadraticCurveTo(180, 350, 260, 400);
      ctx.lineTo(320, 370);
      ctx.lineTo(width, 410);
      ctx.lineTo(width, height);
      ctx.fill();

      // Draw Auspicious Cloud illustrations ("祥雲" scrolling background)
      const cloudOffset = backgroundScroll;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      const drawCloud = (cx: number, cy: number, scale: number) => {
        ctx.beginPath();
        ctx.arc(cx, cy, 14 * scale, 0, Math.PI * 2);
        ctx.arc(cx - 10 * scale, cy + 4, 10 * scale, 0, Math.PI * 2);
        ctx.arc(cx + 10 * scale, cy + 4, 10 * scale, 0, Math.PI * 2);
        ctx.arc(cx - 18 * scale, cy + 8, 7 * scale, 0, Math.PI * 2);
        ctx.arc(cx + 18 * scale, cy + 8, 7 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Decorative scroll tail for auspicious clouds
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.lineWidth = 2 * scale;
        ctx.beginPath();
        ctx.moveTo(cx - 20 * scale, cy + 12);
        ctx.bezierCurveTo(cx - 25 * scale, cy + 15, cx - 15 * scale, cy + 20, cx, cy + 13);
        ctx.stroke();
      };

      drawCloud((100 - cloudOffset + width) % width, 80, 1.2);
      drawCloud((280 - cloudOffset + width) % width, 140, 0.9);
      drawCloud((390 - cloudOffset + width) % width, 60, 1.1);

      // Draw Active Obstacles (Ancient Pagoda Towers & Hanging Lanterns)
      obstacles.forEach(obs => {
        // Top Pagoda Column
        const topGrad = ctx.createLinearGradient(obs.x, 0, obs.x + obs.width, 0);
        topGrad.addColorStop(0, '#b91c1c'); // Deep Vermilion Chinese Red
        topGrad.addColorStop(0.3, '#ef4444'); // Highlight red
        topGrad.addColorStop(1, '#7f1d1d'); // shadow red

        ctx.fillStyle = topGrad;
        // Tower main block
        ctx.fillRect(obs.x + 4, 0, obs.width - 8, obs.topHeight - 12);

        // Tower stone ridges & patterns
        ctx.fillStyle = '#fde047'; // golden bricks
        for (let y = 30; y < obs.topHeight - 20; y += 45) {
          ctx.fillRect(obs.x + 8, y, obs.width - 16, 4);
          ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
          ctx.fillRect(obs.x + 8, y + 4, obs.width - 16, 6);
          ctx.fillStyle = '#fde047';
        }

        // Pagoda styled roof cap at the bottom tip of top pipe
        ctx.fillStyle = '#065f46'; // forest green glazed tiles
        ctx.beginPath();
        ctx.moveTo(obs.x - 6, obs.topHeight - 12);
        ctx.lineTo(obs.x + obs.width + 6, obs.topHeight - 12);
        ctx.lineTo(obs.x + obs.width - 3, obs.topHeight);
        ctx.lineTo(obs.x + 3, obs.topHeight);
        ctx.closePath();
        ctx.fill();

        // Golden bell tip
        ctx.fillStyle = '#eab308';
        ctx.fillRect(obs.x + 8, obs.topHeight - 4, obs.width - 16, 4);

        // Bottom Pagoda Column
        const bottomY = height - obs.bottomHeight - 40;
        ctx.fillStyle = topGrad;
        ctx.fillRect(obs.x + 4, bottomY + 12, obs.width - 8, obs.bottomHeight);

        // Golden highlights on bottom tower
        ctx.fillStyle = '#fde047';
        for (let y = bottomY + 35; y < height - 40; y += 45) {
          ctx.fillRect(obs.x + 8, y, obs.width - 16, 4);
          ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
          ctx.fillRect(obs.x + 8, y + 4, obs.width - 16, 6);
          ctx.fillStyle = '#fde047';
        }

        // Glazed tile roof cap on top of bottom pagoda Column
        ctx.fillStyle = '#065f46';
        ctx.beginPath();
        ctx.moveTo(obs.x - 6, bottomY + 12);
        ctx.lineTo(obs.x + obs.width + 6, bottomY + 12);
        ctx.lineTo(obs.x + obs.width - 3, bottomY);
        ctx.lineTo(obs.x + 3, bottomY);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#eab308';
        ctx.fillRect(obs.x + 8, bottomY, obs.width - 16, 4);

        // Swaying Red Festive Lantern under top Pagoda eaves
        if (obs.hasLantern) {
          const swayAngle = Math.sin(obs.lanternSway) * 0.18;
          const lx = obs.x + obs.width / 2;
          const ly = obs.topHeight + 12;

          ctx.save();
          ctx.translate(lx, ly);
          ctx.rotate(swayAngle);

          // Black thread
          ctx.strokeStyle = '#1e293b';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(0, -14);
          ctx.lineTo(0, 0);
          ctx.stroke();

          // Lantern glowing body
          const lanternGrad = ctx.createRadialGradient(-2, 8, 1, 0, 8, 11);
          lanternGrad.addColorStop(0, '#fca5a5'); // Glowing centers
          lanternGrad.addColorStop(0.5, '#ef4444'); // Classic festive red
          lanternGrad.addColorStop(1, '#b91c1c');
          ctx.fillStyle = lanternGrad;
          ctx.beginPath();
          ctx.ellipse(0, 10, 12, 10, 0, 0, Math.PI * 2);
          ctx.fill();

          // Gold fittings
          ctx.fillStyle = '#fbbf24';
          ctx.fillRect(-6, 0, 12, 2);
          ctx.fillRect(-6, 18, 12, 2);

          // Red tassels hanging bottom
          ctx.strokeStyle = '#dc2626';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(0, 20);
          ctx.lineTo(0, 29);
          ctx.moveTo(-3, 20);
          ctx.lineTo(-3, 27);
          ctx.moveTo(3, 20);
          ctx.lineTo(3, 27);
          ctx.stroke();

          ctx.restore();
        }
      });

      // Draw Items (Coins & Peaches)
      items.forEach(item => {
        // Soft glowing circle background
        const floatY = item.y + Math.sin(item.pulse) * 4;
        
        ctx.save();
        ctx.shadowBlur = 10;
        ctx.shadowColor = item.type === 'peach' ? '#ec4899' : '#fbbf24';

        if (item.type === 'coin') {
          // Traditional Square-Hole copper coins "古錢幣"
          ctx.fillStyle = '#fbbf24'; // main gold
          ctx.strokeStyle = '#b45309'; // bronze rim
          ctx.lineWidth = 1.5;

          ctx.beginPath();
          ctx.arc(item.x, floatY, 9, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          // Square hole inside
          ctx.fillStyle = skyGrad; // clear opening matches gradient background
          ctx.fillRect(item.x - 2.8, floatY - 2.8, 5.6, 5.6);
          ctx.strokeStyle = '#b45309';
          ctx.lineWidth = 1;
          ctx.strokeRect(item.x - 2.8, floatY - 2.8, 5.6, 5.6);
        } else if (item.type === 'peach') {
          // Sacred Peach of longevity ("仙桃")
          // White to pink fleshy body
          const peachGrad = ctx.createRadialGradient(item.x - 3, floatY + 2, 2, item.x, floatY, 12);
          peachGrad.addColorStop(0, '#ffffff'); // bright cream fleshy interior
          peachGrad.addColorStop(0.5, '#fbcfe8'); // soft pink skin
          peachGrad.addColorStop(1, '#db2777'); // deep ruby peak
          ctx.fillStyle = peachGrad;

          ctx.beginPath();
          // Draw sweet bulbous peach shape with pointed tip
          ctx.moveTo(item.x, floatY - 11);
          ctx.bezierCurveTo(item.x - 12, floatY - 9, item.x - 12, floatY + 9, item.x, floatY + 11);
          ctx.bezierCurveTo(item.x + 12, floatY + 9, item.x + 12, floatY - 9, item.x, floatY - 11);
          ctx.closePath();
          ctx.fill();

          // Green leaf
          ctx.fillStyle = '#16a34a';
          ctx.beginPath();
          ctx.ellipse(item.x - 6, floatY + 8, 6, 3, Math.PI / 4, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      });

      // Draw all interactive particles (Blossoms and stars)
      particles.forEach(p => {
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;

        if (p.type === 'petal') {
          // Drifting cherry blossom petal (oval tapered)
          ctx.beginPath();
          ctx.ellipse(p.x, p.y, p.size, p.size * 0.5, Math.PI / 5 + p.life * 0.02, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Shouting gold star
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      });

      // Draw the playable CHARACTER (Bird/Crane)
      const birdX = 100;
      const birdY = birdYRef.current;
      const bAngle = birdAngleRef.current;

      ctx.save();
      ctx.translate(birdX, birdY);
      ctx.rotate(bAngle);

      // Draw Shield Aura if active
      if (shieldRef.current) {
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.85)';
        ctx.lineWidth = 3.5;
        ctx.shadowBlur = 12;
        ctx.shadowColor = '#0ea5e9';
        
        ctx.beginPath();
        ctx.arc(0, 0, 24 + Math.sin(distanceTraveled * 0.1) * 2, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = 'rgba(56, 189, 248, 0.12)';
        ctx.fill();
      }

      if (selectedSkin === 'crane') {
        // Elegant white red-crowned Crane "仙鶴"
        // Chubby white round crane body
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(0, 0, 15, 0, Math.PI * 2);
        ctx.fill();

        // Charcoal black feather accents on tail
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.moveTo(-12, -4);
        ctx.quadraticCurveTo(-22, -10, -24, -2);
        ctx.quadraticCurveTo(-18, 5, -12, 6);
        ctx.closePath();
        ctx.fill();

        // Scarlet red forehead crest crown
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(5, -14, 4.5, 0, Math.PI * 2);
        ctx.fill();

        // Cute long yellow beak
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.moveTo(13, -2);
        ctx.lineTo(26, -1);
        ctx.lineTo(13, 2);
        ctx.closePath();
        ctx.fill();

        // Big sparkling eye
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.arc(5, -6, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(6, -7, 0.9, 0, Math.PI * 2);
        ctx.fill();

        // Flapping Wing
        const wingsGrad = ctx.createLinearGradient(-5, -5, -1, 12);
        wingsGrad.addColorStop(0, '#ffffff');
        wingsGrad.addColorStop(1, '#f1f5f9');
        ctx.fillStyle = wingsGrad;
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 1;

        ctx.save();
        // flapping wing oscillation
        const flapRate = (currentState === 'playing') ? Math.sin(distanceTraveled * 0.35) * 0.45 : 0;
        ctx.rotate(flapRate);
        ctx.beginPath();
        ctx.ellipse(-4, 0, 6, 12, Math.PI / 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();

      } else {
        // Chubby little brown-orange Celestial Sparrow "萌仙雀"
        // Orange Peach gradient body
        const bodyGrad = ctx.createRadialGradient(-3, -3, 2, 0, 0, 15);
        bodyGrad.addColorStop(0, '#fef08a'); // soft cream face
        bodyGrad.addColorStop(0.5, '#f97316'); // lovely light orange body
        bodyGrad.addColorStop(1, '#ea580c'); // darker feathers
        ctx.fillStyle = bodyGrad;

        ctx.beginPath();
        ctx.arc(0, 0, 15, 0, Math.PI * 2);
        ctx.fill();

        // Rosy cheeks
        ctx.fillStyle = 'rgba(244, 63, 94, 0.4)';
        ctx.beginPath();
        ctx.arc(8, 2, 4, 0, Math.PI * 2);
        ctx.fill();

        // Big anime eyes with star sparkle
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(7, -4, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(8.5, -5, 1, 0, Math.PI * 2);
        ctx.beginPath();
        ctx.arc(6, -3, 0.5, 0, Math.PI * 2);
        ctx.fill();

        // Golden beak
        ctx.fillStyle = '#fde047';
        ctx.strokeStyle = '#ca8a04';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(13, -2);
        ctx.lineTo(19, 1);
        ctx.lineTo(13, 3);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Stylized Floating Red Ribbons behind ("仙雀緞帶") sways
        ctx.strokeStyle = '#dc2626';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        const ribbonSwayY = Math.sin(distanceTraveled * 0.16) * 3;
        ctx.moveTo(-14, 0);
        ctx.bezierCurveTo(-22, -6 + ribbonSwayY, -24, 6 - ribbonSwayY, -35, ribbonSwayY);
        ctx.stroke();

        // Small wing flapping
        const wingFlap = (currentState === 'playing') ? Math.sin(distanceTraveled * 0.42) * 6 : 0;
        ctx.fillStyle = '#ea580c';
        ctx.strokeStyle = '#fde047';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.ellipse(-2, 3, 8, 6 + Math.abs(wingFlap) * 0.3, Math.PI / 6 + wingFlap * 0.05, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }

      ctx.restore();

      // Ground / Lawn overlay scrolling at bottom
      const groundY = height - 40;
      const groundScrollOffset = backgroundScroll;

      // Draw stylized soil/mud bottom
      ctx.fillStyle = '#78350f'; // warm rich mud
      ctx.fillRect(0, groundY + 12, width, 28);

      // Draw green lawn layer with diagonal geometric grassy sward
      ctx.fillStyle = '#15803d'; // rich dark turf
      ctx.fillRect(0, groundY, width, 12);

      // Lawn highlights pattern
      ctx.fillStyle = '#22c55e'; // bright grass
      for (let x = -30; x < width + 30; x += 15) {
        const offset = groundScrollOffset % 15;
        ctx.beginPath();
        ctx.moveTo(x - offset, groundY);
        ctx.lineTo(x - offset + 8, groundY + 12);
        ctx.lineTo(x - offset - 4, groundY + 12);
        ctx.closePath();
        ctx.fill();
      }

      animationId = requestAnimationFrame(gameTick);
    };

    const triggerGameOver = () => {
      setGameState('gameover');
      playSfx('gong_gameover');
      
      // Update high scores and save
      const currentScore = scoreRef.current;
      const savedHigh = localStorage.getItem('minigame_flipper_hiscore');
      const numericHigh = savedHigh ? parseInt(savedHigh, 10) : 0;

      if (currentScore > numericHigh) {
        setHighScore(currentScore);
        localStorage.setItem('minigame_flipper_hiscore', currentScore.toString());
        setMascotChat('天人感應！締造了全新的御風傳奇高分！太不可思議了！🎊🐣');
      } else {
        // evaluate results
        if (currentScore >= 40) {
          setMascotChat('極佳氣運！登臨「凌雲真仙」之境界，仙雀為你舞紅綢！👑');
        } else if (currentScore >= 20) {
          setMascotChat('凌風傲骨！實力已達「御風大師」，指尖敏捷如風！⚡');
        } else if (currentScore >= 8) {
          setMascotChat('功德圓滿！已經掌握了雲遊林閣的規律，下次必定能大吉！💡');
        } else {
          setMascotChat('勝敗乃行軍常事，重整旗鼓，小仙雀再陪你沖上雲霄！🍀🐾');
        }
      }
    };

    // Run the animation frame
    animationId = requestAnimationFrame(gameTick);

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [gameState, speedrunDifficulty, playSfx]);

  // Retrieve traditional Chinese level evaluation label
  const getEvaluationLabel = (points: number) => {
    if (points >= 50) return { label: '凌雲真仙', color: 'text-amber-600 bg-amber-50 border-amber-200' };
    if (points >= 25) return { label: '御風大師', color: 'text-purple-600 bg-purple-50 border-purple-200' };
    if (points >= 10) return { label: '漸入佳境', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' };
    return { label: '初出茅廬', color: 'text-slate-500 bg-slate-50 border-slate-200' };
  };

  const currentEval = getEvaluationLabel(score);

  return (
    <div className="w-full max-w-4xl mx-auto p-3 md:p-6" id="flipper_bird_main">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* LEFT SIMULATOR ZONE: 7 cols */}
        <div className="lg:col-span-7 flex flex-col items-center bg-white rounded-3xl p-4 md:p-5 border border-red-50 shadow-sm" id="flipper_game_canvas_wrapper">
          
          {/* Header Stats Panel */}
          <div className="w-full max-w-[400px] flex items-center justify-between mb-3 bg-red-50/40 px-3 py-2 rounded-2xl border border-red-100" id="game_stats_header">
            <div className="flex items-center gap-2">
              <div className="bg-amber-400 p-1.5 rounded-full text-amber-950 shadow-inner">
                <Trophy className="w-4 h-4" />
              </div>
              <div>
                <span className="block text-[9px] text-red-700/80 font-bold leading-none">最高御風記錄</span>
                <span className="text-sm font-black font-mono text-amber-950 leading-none">{highScore}</span>
              </div>
            </div>

            {/* Current Game Score */}
            <div className="text-center">
              <span className="text-[10px] text-red-500 font-bold block leading-none">當前修為</span>
              <span className="text-2xl font-black font-mono text-red-600 leading-none animate-pulse">{score}</span>
            </div>

            {/* Collected Coins */}
            <div className="flex items-center gap-1 bg-amber-100/60 px-2.5 py-1 rounded-full border border-amber-200">
              <Coins className="w-3.5 h-3.5 text-amber-600 animate-spin" />
              <span className="text-[10px] font-bold text-amber-800 font-mono">{coinsCollected}</span>
            </div>
          </div>

          {/* Interactive Canvas Container */}
          <div className="relative w-full max-w-[400px] aspect-[40/54] rounded-2.5xl overflow-hidden border-4 border-red-100 shadow-md bg-sky-100 select-none cursor-pointer"
               onClick={triggerFlap}>
            
            <canvas 
              ref={canvasRef} 
              className="w-full h-full block" 
            />

            {/* Active Buff Shield/Double indicators */}
            <div className="absolute top-3 left-3 flex flex-col gap-1.5 pointer-events-none">
              <AnimatePresence>
                {peachPowerActive && (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="flex items-center gap-1 bg-pink-500/90 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-md"
                  >
                    <Flame className="w-3.5 h-3.5 animate-bounce text-yellow-300" />
                    <span>仙桃狂暴(2x)</span>
                    <span className="font-mono text-[9px] bg-pink-600 px-1 rounded">{Math.ceil(peachTimer / 60)}s</span>
                  </motion.div>
                )}

                {shieldActive && (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="flex items-center gap-1 bg-sky-500/90 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-md"
                  >
                    <Shield className="w-3.5 h-3.5 animate-pulse text-white" />
                    <span>護身氣泡</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Game state overlays: IDLE Start HUD */}
            {gameState === 'idle' && (
              <div className="absolute inset-0 bg-red-950/20 backdrop-blur-xs flex flex-col items-center justify-center text-center p-6 bg-radial-gradient">
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="bg-white/95 border-2 border-red-200 p-5 rounded-3xl max-w-[320px] shadow-xl flex flex-col items-center gap-4"
                >
                  <div className="relative">
                    <div className="bg-amber-100 p-3.5 rounded-full text-amber-600 animate-bounce">
                      <Sparkles className="w-7 h-7" />
                    </div>
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                    </span>
                  </div>

                  <div>
                    <h3 className="font-black text-gray-800 text-lg leading-tight">萌羽仙雀凌雲行</h3>
                    <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
                      點擊畫面或點擊下方按鈕引導仙雀高飛！避開古色古香的樓台燈柱。
                    </p>
                  </div>

                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setGameState('playing');
                      setMascotChat('逆風前進！金燦錢幣和美味野仙桃就在前方！💰✨');
                      playSfx('click');
                    }}
                    className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2.5 rounded-full shadow-md border-b-4 border-red-700 text-sm transition-transform active:translate-y-0.5 flex items-center justify-center gap-1.5"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    開始凌雲修行
                  </button>

                  <div className="flex items-center gap-1.5 text-[9px] text-gray-400 font-medium bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
                    <kbd className="px-1.5 py-0.5 bg-white border border-gray-200 rounded font-bold shadow-xs">鍵盤空白鍵</kbd>
                    <span>或</span>
                    <kbd className="px-1.5 py-0.5 bg-white border border-gray-200 rounded font-bold shadow-xs">滑鼠點擊</kbd>
                    <span>控制升降</span>
                  </div>
                </motion.div>
              </div>
            )}

            {/* Game state overlays: GAMEOVER Results HUD */}
            {gameState === 'gameover' && (
              <div className="absolute inset-0 bg-red-950/40 backdrop-blur-xs flex flex-col items-center justify-center text-center p-6">
                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="bg-white/95 border-4 border-red-100 p-5 rounded-3xl max-w-[320px] shadow-2xl flex flex-col items-center gap-4"
                >
                  <div className="bg-red-550 border-4 border-red-50 p-2.5 rounded-full text-red-500 bg-red-50 shadow-inner">
                    <Award className="w-8 h-8 animate-spin" />
                  </div>

                  <div>
                    <span className="text-[10px] font-black text-red-500 tracking-widest block uppercase">修行結束</span>
                    <h3 className="font-black text-gray-800 text-lg leading-tight mt-0.5">功德圓滿，御風折翼</h3>
                  </div>

                  {/* Results summary stats */}
                  <div className="grid grid-cols-2 gap-3.5 w-full bg-slate-50 px-4 py-3 rounded-2xl border border-slate-100 font-mono">
                    <div className="text-left border-r border-slate-200/80 pr-1">
                      <span className="text-[9px] text-slate-400 font-bold block leading-none">本次積分</span>
                      <span className="text-xl font-black text-red-500">{score}</span>
                    </div>
                    <div className="text-left pl-1">
                      <span className="text-[9px] text-slate-400 font-bold block leading-none">修為評級</span>
                      <span className={`text-[11px] font-black px-1.5 py-0.5 rounded border inline-block mt-0.5 ${currentEval.color}`}>
                        {currentEval.label}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2 w-full justify-stretch">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setScore(0);
                        setPeachPowerActive(false);
                        setShieldActive(false);
                        setGameState('playing');
                        setMascotChat('凌風傲骨，重振旗鼓！讓我們再次出征！🍃🐣');
                        playSfx('click');
                      }}
                      className="flex-grow bg-red-500 hover:bg-red-600 text-white font-bold py-2.5 rounded-full shadow-md border-b-4 border-red-700 text-xs transition-transform active:translate-y-0.5 flex items-center justify-center gap-1"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      重新修行
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </div>

          {/* Quick interactive flap touch trigger button below if screen is small */}
          <div className="w-full max-w-[400px] mt-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                triggerFlap();
              }}
              className="w-full active:scale-95 transition-transform bg-[#0d9488] border-b-4 border-teal-800 text-white shadow font-bold py-3 px-4 rounded-2xl text-xs flex items-center justify-center gap-1.5 uppercase tracking-wide leading-none select-none"
            >
              <Sparkles className="w-3.5 h-3.5" />
              點擊此處振翅 (或直接點擊上方畫面)
            </button>
          </div>
        </div>

        {/* RIGHT SIDE CHARACTER PANEL: 5 cols */}
        <div className="lg:col-span-5 space-y-4" id="flipper_customization_controls">
          
          {/* Mascot speech window */}
          <div className="bg-emerald-50/50 rounded-3xl p-4 border border-emerald-100/60 flex items-start gap-3" id="mascot_flipper_speech_box">
            <div className="w-12 h-12 bg-emerald-100 rounded-full flex-shrink-0 flex items-center justify-center text-2xl border-2 border-emerald-300 shadow-sm">
              🏮
            </div>
            <div className="space-y-1">
              <span className="block text-[9px] font-bold text-emerald-800 uppercase tracking-widest leading-none">雀仙胖胖</span>
              <p className="text-xs text-emerald-950 font-medium leading-relaxed">
                {mascotChat}
              </p>
            </div>
          </div>

          {/* Controls Settings Card */}
          <div className="bg-white rounded-3xl p-4 md:p-5 border border-slate-100 shadow-xs space-y-4" id="flipper_customization_body">
            
            {/* Header */}
            <div className="border-b border-slate-100 pb-3">
              <span className="block text-[10px] font-black text-rose-500 uppercase tracking-widest leading-none mb-1">修行配置</span>
              <h4 className="font-bold text-sm text-gray-800">身段與難度自選</h4>
            </div>

            {/* Customization: Skin Selector */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-gray-500 block">1. 選擇仙鳥身段</span>
              <div className="grid grid-cols-2 gap-2.5">
                
                {/* Sparrow Selection */}
                <button
                  type="button"
                  onClick={() => selectSkin('sparrow')}
                  className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all gap-1.5 relative overflow-hidden ${
                    selectedSkin === 'sparrow'
                      ? 'border-orange-200 bg-orange-50/40 text-orange-950 ring-2 ring-orange-500/10'
                      : 'border-slate-100 bg-slate-50/40 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-[17px]">🐣</span>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-orange-100 text-orange-700">默認</span>
                  </div>
                  <div>
                    <span className="block text-xs font-black leading-none">香黏小仙雀</span>
                    <span className="text-[10px] text-slate-400 block mt-1 leading-tight">胖嘟嘟，啾啾叫</span>
                  </div>
                </button>

                {/* Crane Selection */}
                <button
                  type="button"
                  onClick={() => selectSkin('crane')}
                  className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all gap-1.5 relative overflow-hidden ${
                    selectedSkin === 'crane'
                      ? 'border-teal-200 bg-teal-50/40 text-teal-900 ring-2 ring-teal-500/10'
                      : 'border-slate-100 bg-slate-50/40 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-[17px]">🦢</span>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-teal-100 text-teal-700">25分或點選</span>
                  </div>
                  <div>
                    <span className="block text-xs font-black leading-none">靈瑞仙鶴君</span>
                    <span className="text-[10px] text-slate-400 block mt-1 leading-tight">高雅素潔，仙風道骨</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Customization: Wind Speed Difficulty */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-gray-500 block">2. 微調林間風速</span>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => changeDifficulty('normal')}
                  className={`py-2 px-3 rounded-xl text-center border text-xs font-bold transition-all ${
                    speedrunDifficulty === 'normal'
                      ? 'bg-emerald-550 bg-emerald-50 border-emerald-300 text-emerald-800'
                      : 'bg-slate-50 text-slate-600 border-transparent hover:bg-slate-100'
                  }`}
                >
                  春風溫和 (普通)
                </button>
                <button
                  type="button"
                  onClick={() => changeDifficulty('hard')}
                  className={`py-2 px-3 rounded-xl text-center border text-xs font-bold transition-all ${
                    speedrunDifficulty === 'hard'
                      ? 'bg-rose-50 border-rose-300 text-rose-800'
                      : 'bg-slate-50 text-slate-600 border-transparent hover:bg-slate-100'
                  }`}
                >
                  急風暴雷 (困難)
                </button>
              </div>
            </div>

            {/* Controls sound toggling */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
              <span className="font-bold text-gray-500">遊戲雅樂聲效</span>
              <button
                type="button"
                onClick={() => {
                  playSfx('click');
                  setSoundEnabled(!soundEnabled);
                }}
                className={`p-2 rounded-xl border flex items-center justify-center gap-1.5 font-bold transition-colors ${
                  soundEnabled 
                    ? 'border-emerald-250 bg-emerald-50 text-emerald-800 hover:bg-emerald-100' 
                    : 'border-slate-200 bg-slate-50 text-slate-400 hover:bg-slate-100'
                }`}
                title={soundEnabled ? "音效開啟中" : "音效已靜音"}
              >
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                <span>{soundEnabled ? "開啟" : "靜音"}</span>
              </button>
            </div>
            
          </div>

          {/* Guidelines info */}
          <div className="bg-slate-50 rounded-3xl p-4 border border-slate-100" id="flipper_rules_guidelines">
            <div className="flex items-center gap-2 mb-2">
              <Info className="w-4 h-4 text-rose-500" />
              <span className="font-bold text-xs text-gray-800">修仙小錦囊 (遊玩攻略)</span>
            </div>
            <ul className="text-[11px] text-slate-500 space-y-1.5 list-disc list-inside leading-relaxed">
              <li>收集 <span className="font-black text-amber-600">古錢幣 (+2積分)</span> 能迅速大幅提高您的修為記錄！</li>
              <li>吞食 <span className="font-black text-pink-650 text-pink-600">仙桃</span> 能帶來長達 7 秒的雙倍積分爆發並自帶一隻 <strong className="text-sky-600">護體氣泡</strong> 擋刀。</li>
              <li>困難模式下古閣將會更快出現，且柱子高低起伏更加陡峭，專為神手打造！</li>
            </ul>
          </div>

        </div>

      </div>
    </div>
  );
}
