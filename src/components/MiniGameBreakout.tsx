/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, RotateCcw, Volume2, VolumeX, Trophy, Heart, Star, Sparkles, Zap, Award, HelpCircle, AlertCircle, RefreshCw, Layers } from 'lucide-react';

interface Brick {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  points: number;
  hits: number;    // how many hits remaining
  maxHits: number;
  type: 'honey' | 'candy' | 'leaf' | 'gold_nest';
}

interface Ball {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  sticky: boolean;
}

interface PowerUp {
  x: number;
  y: number;
  vy: number;
  radius: number;
  type: 'grow_paddle' | 'triple_ball' | 'sticky_paddle' | 'shield' | 'extra_life';
  color: string;
}

type GameState = 'idle' | 'playing' | 'paused' | 'gameover' | 'victory';
type GameMode = 'classic' | 'falling_rain' | 'speedrun';

export default function MiniGameBreakout() {
  const [gameState, setGameState] = useState<GameState>('idle');
  const [gameMode, setGameMode] = useState<GameMode>('classic');
  const [score, setScore] = useState<number>(0);
  const [hiScore, setHiScore] = useState<number>(0);
  const [lives, setLives] = useState<number>(3);
  const [round, setRound] = useState<number>(1);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [mascotMood, setMascotMood] = useState<'chatting' | 'cheering' | 'anxious' | 'victory' | 'sad'>('chatting');
  const [mascotSpeech, setMascotSpeech] = useState<string>('小熊巴魯正抱著大橡葉，等你發射第一顆蜜糖露珠哦！🍯🐾');
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [speedrunTimer, setSpeedrunTimer] = useState<number>(120); // 120 seconds for speedrun

  // Canvas ref
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // High score persistent storage
  useEffect(() => {
    const saved = localStorage.getItem('minigame_breakout_hiscore');
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

  // Web Audio Synthesizer
  const playSfx = useCallback((type: 'bounce' | 'break' | 'powerup' | 'win' | 'lose' | 'click') => {
    if (!soundEnabled) return;
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();

      if (type === 'bounce') {
        // High cute bubble pop
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(500, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(750, ctx.currentTime + 0.08);
        gain.gain.setValueAtTime(0.06, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.005, ctx.currentTime + 0.1);
        osc.start();
        osc.stop(ctx.currentTime + 0.11);
      } else if (type === 'break') {
        // High frequency sugar cracking noise
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        osc1.type = 'sawtooth';
        osc1.frequency.setValueAtTime(900, ctx.currentTime);
        osc1.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.14);
        gain1.gain.setValueAtTime(0.05, ctx.currentTime);
        gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

        // Sub noise
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(440, ctx.currentTime);
        gain2.gain.setValueAtTime(0.04, ctx.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);

        osc1.start();
        osc2.start();
        osc1.stop(ctx.currentTime + 0.16);
        osc2.stop(ctx.currentTime + 0.13);
      } else if (type === 'powerup') {
        // Sparkling bubbly upward sweep
        const notes = [330, 392, 523, 659, 783, 1046];
        notes.forEach((freq, idx) => {
          const oscNode = ctx.createOscillator();
          const gainNode = ctx.createGain();
          oscNode.connect(gainNode);
          gainNode.connect(ctx.destination);
          oscNode.type = 'sine';
          oscNode.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.05);
          gainNode.gain.setValueAtTime(0.08, ctx.currentTime + idx * 0.05);
          gainNode.gain.exponentialRampToValueAtTime(0.005, ctx.currentTime + idx * 0.05 + 0.2);
          oscNode.start(ctx.currentTime + idx * 0.05);
          oscNode.stop(ctx.currentTime + idx * 0.05 + 0.22);
        });
      } else if (type === 'win') {
        // Triumphant cute fan-fare
        const freqs = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98];
        freqs.forEach((freq, idx) => {
          const oscNode = ctx.createOscillator();
          const gainNode = ctx.createGain();
          oscNode.connect(gainNode);
          gainNode.connect(ctx.destination);
          oscNode.type = 'triangle';
          oscNode.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.075);
          gainNode.gain.setValueAtTime(0.08, ctx.currentTime + idx * 0.075);
          gainNode.gain.exponentialRampToValueAtTime(0.005, ctx.currentTime + idx * 0.075 + 0.4);
          oscNode.start(ctx.currentTime + idx * 0.075);
          oscNode.stop(ctx.currentTime + idx * 0.075 + 0.45);
        });
      } else if (type === 'lose') {
        // Descending sad sweep
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(330, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(110, ctx.currentTime + 0.5);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.51);
        osc.start();
        osc.stop(ctx.currentTime + 0.52);
      } else if (type === 'click') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        gain.gain.setValueAtTime(0.07, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.002, ctx.currentTime + 0.06);
        osc.start();
        osc.stop(ctx.currentTime + 0.07);
      }
    } catch (e) {
      console.warn('AudioContext failed to start', e);
    }
  }, [soundEnabled]);

  // Mascot dynamic quotes and state controls
  const updateSpeech = useCallback((mood: typeof mascotMood, phrase: string) => {
    setMascotMood(mood);
    setMascotSpeech(phrase);
  }, []);

  // Bricks, Balls, Paddle & Power-ups configurations
  const paddleRef = useRef({
    x: 250,
    y: 430,
    width: 90,
    height: 14,
    speed: 7,
    stickyEffect: false,
    shieldActive: false,
  });

  const ballsRef = useRef<Ball[]>([]);
  const bricksRef = useRef<Brick[]>([]);
  const powerUpsRef = useRef<PowerUp[]>([]);
  const lastTimeRef = useRef<number>(0);

  // Active keys
  const keysPressed = useRef<{ [key: string]: boolean }>({});

  // Touch state
  const touchStartRef = useRef<number | null>(null);

  // Initialize Bricks array based on levels
  const setupBricks = useCallback((currentRound: number) => {
    const list: Brick[] = [];
    const cols = 7;
    const rows = Math.min(4 + Math.floor(currentRound / 2), 7);
    const startY = 40;
    const brickW = 60;
    const brickH = 18;
    const spaceX = 8;
    const spaceY = 6;
    const startX = (500 - (cols * brickW + (cols - 1) * spaceX)) / 2;

    // Sweet cozy candy candy-bar theme palette colors
    const colors = [
      '#fbbf24', // honey gold (honey)
      '#f472b6', // strawberry pink (candy)
      '#34d399', // forest mint (leaf)
      '#60a5fa', // blue flower (dewdrop)
      '#a78bfa', // taro lavender
    ];

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        // Let's create varying brick levels & patterns
        const rowColor = colors[r % colors.length];
        const hits = r === 0 ? 2 : 1; // Top row has two health points
        const points = hits * 100 + (r * 20);

        let type: Brick['type'] = 'honey';
        if (r === 0) type = 'gold_nest';
        else if (r === 1) type = 'candy';
        else if (r === 2) type = 'leaf';

        list.push({
          id: r * cols + c,
          x: startX + c * (brickW + spaceX),
          y: startY + r * (brickH + spaceY),
          width: brickW,
          height: brickH,
          color: rowColor,
          points: points,
          hits: hits,
          maxHits: hits,
          type: type,
        });
      }
    }
    bricksRef.current = list;
  }, []);

  // Set up game parameters
  const initGame = useCallback(() => {
    paddleRef.current = {
      x: 205,
      y: 430,
      width: 90,
      height: 14,
      speed: 7,
      stickyEffect: false,
      shieldActive: false,
    };

    ballsRef.current = [{
      x: 250,
      y: 410,
      vx: 2.2,
      vy: -3.5,
      radius: 7,
      sticky: true,
    }];

    powerUpsRef.current = [];
    setupBricks(round);
  }, [round, setupBricks]);

  // Handle paddle movement input loop
  const updatePaddle = useCallback(() => {
    const pad = paddleRef.current;
    if (keysPressed.current['ArrowLeft'] || keysPressed.current['a'] || keysPressed.current['A']) {
      pad.x -= pad.speed;
    }
    if (keysPressed.current['ArrowRight'] || keysPressed.current['d'] || keysPressed.current['D']) {
      pad.x += pad.speed;
    }

    // Constraints bounds check
    if (pad.x < 10) pad.x = 10;
    if (pad.x + pad.width > 490) pad.x = 490 - pad.width;
  }, []);

  const spawnPowerUp = useCallback((bx: number, by: number) => {
    const chance = Math.random();
    if (chance > 0.35) return; // 35% drop rate

    const types: PowerUp['type'][] = ['grow_paddle', 'triple_ball', 'sticky_paddle', 'shield', 'extra_life'];
    const pType = types[Math.floor(Math.random() * types.length)];
    let color = '#fb7185'; // Rose red pink for extra life

    if (pType === 'grow_paddle') color = '#34d399'; // Emerald green
    else if (pType === 'triple_ball') color = '#60a5fa'; // Sky blue
    else if (pType === 'sticky_paddle') color = '#fbbf24'; // Honey Amber
    else if (pType === 'shield') color = '#a78bfa'; // Purple

    powerUpsRef.current.push({
      x: bx,
      y: by,
      vy: 1.8,
      radius: 8,
      type: pType,
      color: color,
    });
  }, []);

  // Ball bounce and updates
  const updatePhysics = useCallback(() => {
    const balls = ballsRef.current;
    const pad = paddleRef.current;
    const bricks = bricksRef.current;
    const pows = powerUpsRef.current;

    // 1. Move power-ups & handle collisions
    for (let i = pows.length - 1; i >= 0; i--) {
      const p = pows[i];
      p.y += p.vy;

      // caught by paddle
      if (
        p.x >= pad.x - p.radius &&
        p.x <= pad.x + pad.width + p.radius &&
        p.y >= pad.y - p.radius &&
        p.y <= pad.y + pad.height + p.radius
      ) {
        // Collect sound
        playSfx('powerup');
        pows.splice(i, 1);

        // Apply item effect
        if (p.type === 'grow_paddle') {
          pad.width = Math.min(180, pad.width + 30);
          updateSpeech('cheering', '哇！小橡樹葉變大了，這下接到蜜糖就容易多了！🌿🐻🍒');
        } else if (p.type === 'triple_ball') {
          // Clone two active balls
          if (balls.length > 0) {
            const seed = balls[0];
            balls.push(
              { x: seed.x, y: seed.y, vx: -seed.vx - 1, vy: seed.vy, radius: seed.radius, sticky: false },
              { x: seed.x, y: seed.y, vx: seed.vx + 1, vy: seed.vy - 1, radius: seed.radius, sticky: false }
            );
          }
          updateSpeech('cheering', '分裂花粉！蜜糖露珠一分為三，彈力滿分！🤩💦🌟');
        } else if (p.type === 'sticky_paddle') {
          pad.stickyEffect = true;
          updateSpeech('cheering', '黏黏蜂蜜！快看，蜜糖露珠被黏在葉子上隨心重新發射囉！🍯🎯');
        } else if (p.type === 'shield') {
          pad.shieldActive = true;
          updateSpeech('cheering', '橡樹防護罩啟動！再也不怕漏掉蜜糖掉落囉！🛡️🌲✨');
        } else if (p.type === 'extra_life') {
          setLives(prev => {
            const n = prev + 1;
            updateSpeech('cheering', `太讚了！多喝一口草莓蜜茶，生命值加一！💖 (目前生命: ${n})`);
            return n;
          });
        }
        continue;
      }

      // out of bounds
      if (p.y > 450) {
        pows.splice(i, 1);
      }
    }

    // 2. Adjust dynamic falling bricks (if falling rain mode)
    if (gameMode === 'falling_rain') {
      // Very slowly lower bricks at interval or continuously
      // If bricks get too low, gameover
      let tooLow = false;
      for (const b of bricks) {
        b.y += 0.02; // slow drift downwards
        if (b.y > 330) {
          tooLow = true;
        }
      }
      if (tooLow) {
        setGameState('gameover');
        playSfx('lose');
        updateSpeech('sad', '哎呀，甜糖塊落到地面了，被地鼠米奧通通啃光光了！😭💔');
      }

      // Spawn new topmost rows if empty
      const topmostY = bricks.length > 0 ? Math.min(...bricks.map(b => b.y)) : 0;
      if (bricks.length === 0 || topmostY > 60) {
        // Spawn top row
        const colors = ['#fbbf24', '#f472b6', '#34d399', '#60a5fa', '#a78bfa'];
        const cols = 7;
        const brickW = 60;
        const brickH = 18;
        const spaceX = 8;
        const startX = (500 - (cols * brickW + (cols - 1) * spaceX)) / 2;
        const rColor = colors[Math.floor(Math.random() * colors.length)];

        const startY = 40;
        for (let c = 0; c < cols; c++) {
          bricksRef.current.push({
            id: Date.now() + c,
            x: startX + c * (brickW + spaceX),
            y: startY - 20, // offscreen slightly
            width: brickW,
            height: brickH,
            color: rColor,
            points: 120,
            hits: 1,
            maxHits: 1,
            type: 'honey',
          });
        }
      }
    }

    // 3. Move and bounce balls
    for (let i = balls.length - 1; i >= 0; i--) {
      const b = balls[i];

      if (b.sticky) {
        // Sticky balls stick relative to paddle center state
        b.x = pad.x + pad.width / 2;
        b.y = pad.y - b.radius;
        continue;
      }

      // Move physics step
      b.x += b.vx;
      b.y += b.vy;

      // Wall bounce left/right
      if (b.x - b.radius < 10) {
        b.x = 10 + b.radius;
        b.vx = -b.vx;
        playSfx('bounce');
      }
      if (b.x + b.radius > 490) {
        b.x = 490 - b.radius;
        b.vx = -b.vx;
        playSfx('bounce');
      }

      // Wall bounce top
      if (b.y - b.radius < 10) {
        b.y = 10 + b.radius;
        b.vy = -b.vy;
        playSfx('bounce');
      }

      // Shield active bottom guard
      if (pad.shieldActive && b.y + b.radius >= 445) {
        b.vy = -Math.abs(b.vy);
        pad.shieldActive = false; // consume shield protect
        playSfx('bounce');
        updateSpeech('chatting', '橡樹護盾發揮功用！保護了這顆蜜糖露珠，呼～ 🛡️🐻');
        continue;
      }

      // Out of bounds bottom
      if (b.y - b.radius > 460) {
        balls.splice(i, 1);
        continue;
      }

      // Paddle bounce check
      if (
        b.y + b.radius >= pad.y &&
        b.y - b.radius <= pad.y + pad.height &&
        b.x >= pad.x - b.radius &&
        b.x <= pad.x + pad.width + b.radius
      ) {
        // Sticky power up check
        if (pad.stickyEffect) {
          b.sticky = true;
          b.vx = 0;
          b.vy = 0;
          playSfx('bounce');
          updateSpeech('cheering', '蜜糖露珠吸附附著！按空白鍵、下方發射鍵或向上滑動來再次發射！🍯🌱');
          continue;
        }

        // Standard physics angle modification depending on hitting left/right edge of leaf paddle
        const paddleCenter = pad.x + pad.width / 2;
        const collisionOffset = b.x - paddleCenter;
        const normalizedCollisionOffset = collisionOffset / (pad.width / 2); // -1 to 1

        const bounceAngle = normalizedCollisionOffset * (Math.PI / 3); // Max 60 degrees

        const currentSpeed = Math.sqrt(b.vx * b.vx + b.vy * b.vy);
        const newSpeed = Math.min(7.5, currentSpeed + 0.1); // slightly expedite game speed

        b.vx = newSpeed * Math.sin(bounceAngle);
        b.vy = -newSpeed * Math.cos(bounceAngle);

        // Limit vertical speed to prevent infinite horizontal bounces
        if (Math.abs(b.vy) < 1.5) {
          b.vy = -1.5;
        }

        playSfx('bounce');
        continue;
      }

      // Brick collisions
      for (let j = bricks.length - 1; j >= 0; j--) {
        const br = bricks[j];

        // Rect-circle intersection check
        const closestX = Math.max(br.x, Math.min(b.x, br.x + br.width));
        const closestY = Math.max(br.y, Math.min(b.y, br.y + br.height));

        const distanceX = b.x - closestX;
        const distanceY = b.y - closestY;
        const distanceSquared = distanceX * distanceX + distanceY * distanceY;

        if (distanceSquared < b.radius * b.radius) {
          // We hit the brick! Apply physics bounce direction
          const overlapX = b.radius - Math.abs(distanceX);
          const overlapY = b.radius - Math.abs(distanceY);

          if (overlapX < overlapY) {
            b.vx = distanceX > 0 ? Math.abs(b.vx) : -Math.abs(b.vx);
          } else {
            b.vy = distanceY > 0 ? Math.abs(b.vy) : -Math.abs(b.vy);
          }

          // Damage brick
          br.hits -= 1;
          playSfx('break');

          if (br.hits <= 0) {
            // Crumble brick! Gain scores
            setScore(prev => {
              const next = prev + br.points;
              if (next > hiScore) {
                setHiScore(next);
                localStorage.setItem('minigame_breakout_hiscore', next.toString());
              }
              return next;
            });

            // Trigger potential item drop
            spawnPowerUp(br.x + br.width / 2, br.y + br.height / 2);

            // Remove brick item
            bricks.splice(j, 1);
          }

          break; // break brick inner-loop, check next physical aspect
        }
      }
    }

    // 4. Lost all active balls, deduct life check
    if (balls.length === 0) {
      setLives(prev => {
        const next = prev - 1;
        if (next <= 0) {
          setGameState('gameover');
          playSfx('lose');
          updateSpeech('sad', '唔，小橡葉沒接住甜蜜露珠，小熊巴魯正抱著肚子傷心嘆氣啦～ 🍯🥺');
        } else {
          // Spawn new sticky ball in paddle center
          ballsRef.current = [{
            x: pad.x + pad.width / 2,
            y: pad.y - 7,
            vx: 2.2,
            vy: -3.5,
            radius: 7,
            sticky: true,
          }];
          updateSpeech('anxious', '哎呀！漏掉了，別氣餒，快調好角度重新把糖球彈起來吧！✊🐻🍬');
        }
        return next;
      });
    }

    // 5. Classic Mode victory check (all bricks cleared)
    if (gameMode === 'classic' && bricks.length === 0) {
      setGameState('victory');
      playSfx('win');
      updateSpeech('victory', '大捷！你太棒了！所有五彩甜蜜糖塊被完美消滅，快帶蜂蜜巴魯去慶功宴！🥳🍯🎉');
    }
  }, [gameMode, hiScore, playSfx, spawnPowerUp, updateSpeech]);

  // Launch initial or sticky balls
  const launchBall = useCallback(() => {
    const balls = ballsRef.current;
    let launched = false;
    for (const b of balls) {
      if (b.sticky) {
        b.sticky = false;
        b.vx = (Math.random() * 2 - 1) + 1.5; // randomize slightly offset direction
        b.vy = -3.8;
        launched = true;
      }
    }
    if (launched) {
      playSfx('bounce');
    }
  }, [playSfx]);

  // Main game animation rendering loop
  useEffect(() => {
    let animationFrameId: number;

    const gameLoop = (timestamp: number) => {
      if (gameState === 'playing') {
        updatePaddle();
        updatePhysics();
      }

      // Canvas Rendering logic
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          // Clear and styling background
          ctx.clearRect(0, 0, 500, 450);

          // Wood texture grid panel frame bounds
          ctx.strokeStyle = '#e2e8f0';
          ctx.lineWidth = 4;
          // Draw a lovely forest garden board line border
          ctx.fillStyle = '#fefeff';
          ctx.fillRect(8, 8, 484, 434);
          ctx.strokeRect(8, 8, 484, 434);

          // Grid decorative cute small dots on background
          ctx.fillStyle = '#f0fdf4';
          for (let gx = 30; gx < 480; gx += 40) {
            for (let gy = 30; gy < 440; gy += 40) {
              ctx.beginPath();
              ctx.arc(gx, gy, 1.5, 0, Math.PI * 2);
              ctx.fill();
            }
          }

          // Render Bricks
          for (const b of bricksRef.current) {
            // Draw cute pill-shaped rounded cozy sugar bricks
            ctx.fillStyle = b.color;
            ctx.beginPath();
            const radius = 5;
            ctx.roundRect(b.x, b.y, b.width, b.height, radius);
            ctx.fill();

            // Highlight shine glow on top edge of brick
            ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
            ctx.beginPath();
            ctx.roundRect(b.x + 2, b.y + 2, b.width - 4, 3, 2);
            ctx.fill();

            // Border color depending on hit health points (hits)
            if (b.hits > 1) {
              ctx.strokeStyle = '#f59e0b';
              ctx.lineWidth = 1.5;
              ctx.beginPath();
              ctx.roundRect(b.x, b.y, b.width, b.height, radius);
              ctx.stroke();
            }

            // Draw cute decorative honey texture patterns inside the brick
            if (b.type === 'honey') {
              ctx.fillStyle = 'rgba(251, 191, 36, 0.4)';
              ctx.beginPath();
              ctx.arc(b.x + b.width / 2, b.y + b.height / 2, 4, 0, Math.PI * 2);
              ctx.fill();
            } else if (b.type === 'candy') {
              ctx.fillStyle = 'rgba(244, 114, 182, 0.4)';
              ctx.beginPath();
              ctx.arc(b.x + b.width - 15, b.y + b.height / 2, 3, 0, Math.PI * 2);
              ctx.fill();
            }
          }

          // Render Paddle (Emerald Oak Leaf / Forest Paddle)
          const pad = paddleRef.current;
          // Leaf body green
          ctx.fillStyle = '#10b981';
          ctx.beginPath();
          ctx.roundRect(pad.x, pad.y, pad.width, pad.height, 7);
          ctx.fill();

          // Sticky honey on leaf indicator
          if (pad.stickyEffect) {
            ctx.fillStyle = 'rgba(251, 191, 36, 0.7)';
            ctx.beginPath();
            ctx.roundRect(pad.x + 10, pad.y - 2, pad.width - 20, 5, 2);
            ctx.fill();
          }

          // Draw yellow-green leaves decorative stalk veins
          ctx.strokeStyle = '#a7f3d0';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(pad.x, pad.y + pad.height / 2);
          ctx.lineTo(pad.x + pad.width, pad.y + pad.height / 2);
          ctx.stroke();

          // Leaf outline accent
          ctx.strokeStyle = '#047857';
          ctx.lineWidth = 2;
          ctx.strokeRect(pad.x, pad.y, pad.width, pad.height);

          // Draw active shield under the paddle as a cool bright lavender protective neon lane
          if (pad.shieldActive) {
            ctx.strokeStyle = '#a78bfa';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(15, 442);
            ctx.lineTo(485, 442);
            ctx.stroke();

            // Glow dots
            ctx.fillStyle = '#c084fc';
            ctx.beginPath();
            ctx.arc(15, 442, 4, 0, Math.PI * 2);
            ctx.arc(485, 442, 4, 0, Math.PI * 2);
            ctx.fill();
          }

          // Render Power-Ups (falling spheres)
          for (const p of powerUpsRef.current) {
            // Draw candy star pill icon with a spinning circle glow
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1.5;
            ctx.stroke();

            // Draw inner symbol
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 9px monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            let symbol = '★';
            if (p.type === 'grow_paddle') symbol = '↔';
            else if (p.type === 'triple_ball') symbol = '❸';
            else if (p.type === 'sticky_paddle') symbol = '♥';
            else if (p.type === 'shield') symbol = '⛨';
            else if (p.type === 'extra_life') symbol = '❤';

            ctx.fillText(symbol, p.x, p.y);
          }

          // Render Balls (Honey Dewdrops)
          ctx.fillStyle = '#38bdf8'; // glossy sky blue water dew drop color
          for (const b of ballsRef.current) {
            ctx.beginPath();
            ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
            ctx.fill();

            // White shiny glaze dot
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(b.x - 2, b.y - 2, 2, 0, Math.PI * 2);
            ctx.fill();

            // Inner dark neon tone
            ctx.strokeStyle = '#0284c7';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
            ctx.stroke();
          }

          // If game is in idle or paused, draw a neat subtle play overlays on Canvas
          if (gameState === 'idle') {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
            ctx.fillRect(10, 10, 480, 430);

            ctx.fillStyle = '#1e293b';
            ctx.font = 'bold 20px "Space Grotesk", system-ui, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('萌熊蜜糖碰碰樂', 250, 140);

            ctx.fillStyle = '#64748b';
            ctx.font = '14px "Inter", sans-serif';
            ctx.fillText('與小熊巴魯一起歡快擊碎五彩果凍糖塊！', 250, 180);

            ctx.fillStyle = '#10b981';
            ctx.font = 'bold 13px "Inter", sans-serif';
            ctx.fillText('點下方「開始收集蜂蜜」冒險暢玩', 250, 230);
          } else if (gameState === 'paused') {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
            ctx.fillRect(10, 10, 480, 430);

            ctx.fillStyle = '#f59e0b';
            ctx.font = 'bold 24px "Space Grotesk", system-ui, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('已 暫 停', 250, 200);

            ctx.fillStyle = '#64748b';
            ctx.font = '13px "Inter", sans-serif';
            ctx.fillText('再度點擊「暫停」或「繼續」解鎖遊戲', 250, 240);
          }
        }
      }

      animationFrameId = requestAnimationFrame(gameLoop);
    };

    animationFrameId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [gameState, gameMode, updatePaddle, updatePhysics]);

  // Handle speedrun ticking timer logic
  useEffect(() => {
    if (gameState !== 'playing' || gameMode !== 'speedrun') return;

    const t = setInterval(() => {
      setSpeedrunTimer(prev => {
        if (prev <= 1) {
          clearInterval(t);
          setGameState('victory');
          playSfx('win');
          updateSpeech('victory', `時間到！恭喜你完成了限時蜂王速消，贏得了 ${score} 大額糖果積分！🏆🐻👑`);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(t);
  }, [gameState, gameMode, playSfx, score, updateSpeech]);

  // Key event listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current[e.key] = true;

      // Spacebar launch or re-launch
      if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        if (gameState === 'playing') {
          launchBall();
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current[e.key] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState, launchBall]);

  // Start new / next series round
  const startGame = (mode: GameMode = 'classic') => {
    playSfx('click');
    setGameMode(mode);
    setScore(0);
    setLives(mode === 'classic' ? 3 : 2); // lower life for survival falling rain
    setRound(1);
    setSpeedrunTimer(120);
    setGameState('playing');
    initGame();
    // Reset paddle position explicitly
    paddleRef.current.x = 205;
    // Launch dynamic speech
    updateSpeech('cheering', `小太棒了！啟動「${mode === 'classic' ? '經典蜜糖盤' : mode === 'falling_rain' ? '狂暴蜜晶雨' : '120秒蜂王挑戰'}」！快彈起露珠開始收集糖果吧！🐻🍰`);
  };

  // Toggle Pause/Play
  const togglePause = () => {
    playSfx('click');
    if (gameState === 'playing') {
      setGameState('paused');
      updateSpeech('chatting', '巴魯去嚼一顆榛果軟糖先，隨時點繼續哦～ 🌰🐻');
    } else if (gameState === 'paused') {
      setGameState('playing');
      updateSpeech('cheering', '吃飽滿血復活！蜜糖露珠再度起彈，加油！✊🐻🍭');
    }
  };

  // Paddle drag listener for Mouse & Touch support on Canvas container
  const handleDrag = (clientX: number, rectLeft: number, rectWidth: number) => {
    if (gameState !== 'playing') return;
    const pad = paddleRef.current;
    
    // Convert coordinate inside canvas (500 width)
    const relativeX = ((clientX - rectLeft) / rectWidth) * 500;
    
    // Position paddle centrally under user's finger or cursor
    pad.x = relativeX - pad.width / 2;
    
    // bounds check
    if (pad.x < 10) pad.x = 10;
    if (pad.x + pad.width > 490) pad.x = 490 - pad.width;
  };

  // For touch swipe gesture to trigger launching honey dewdrop
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      touchStartRef.current = e.touches[0].clientY;
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartRef.current !== null && e.changedTouches.length > 0) {
      const diffY = touchStartRef.current - e.changedTouches[0].clientY;
      if (diffY > 30) { // Swiped up!
        launchBall();
      }
    }
    touchStartRef.current = null;
  };

  return (
    <div id="breakout-view" className="w-full max-w-5xl mx-auto px-1 py-4 md:p-6 text-gray-800">
      
      {/* Game Layout Main Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-[#f0fdf4]/50 border-4 border-emerald-100 rounded-3xl p-4 md:p-6 shadow-xl relative overflow-hidden backdrop-blur-md">
        
        {/* Left column: Controls, speech, mascot status */}
        <div className="lg:col-span-4 flex flex-col justify-between space-y-6">
          <div>
            {/* Header branding */}
            <div className="flex items-center space-x-3 bg-white p-3 rounded-2xl border-2 border-emerald-100 shadow-sm">
              <div className="bg-[#fbbf24] p-2 rounded-xl text-white">
                <Zap className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800 tracking-tight">萌熊蜜糖碰碰樂</h2>
                <p className="text-xs text-emerald-600 font-mono">Bear Honey Breakout</p>
              </div>
            </div>

            {/* Mascot Baru Bubble card layout */}
            <div className="mt-5 bg-white rounded-2xl border-2 border-emerald-100 p-4 relative shadow-sm">
              <div className="flex items-start space-x-3">
                {/* 3D claymation animated state avatar placeholder */}
                <div className="flex-shrink-0 relative">
                  <div className="w-14 h-14 rounded-full bg-orange-100 border-2 border-amber-300 flex items-center justify-center text-3xl shadow-inner animate-bounce">
                    {mascotMood === 'cheering' && '🤠'}
                    {mascotMood === 'anxious' && '😳'}
                    {mascotMood === 'sad' && '😿'}
                    {mascotMood === 'victory' && '👑'}
                    {mascotMood === 'chatting' && '🐻'}
                  </div>
                  <span className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full flex items-center justify-center">
                    <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></span>
                  </span>
                </div>
                <div className="flex-1 bg-amber-50/70 rounded-xl p-3 border border-amber-100">
                  <div className="text-xs font-bold text-amber-800 mb-0.5">小熊巴魯：</div>
                  <p className="text-gray-700 text-xs leading-relaxed">{mascotSpeech}</p>
                </div>
              </div>
            </div>

            {/* Selection modes panel */}
            <div className="mt-5 bg-white rounded-2xl border-2 border-emerald-100 p-4 shadow-sm">
              <h3 className="text-xs font-bold text-[#1b6b4f] mb-3 flex items-center">
                <Layers className="w-4 h-4 mr-1 text-[#10b981]" /> 選擇遊戲特訓冒險形式：
              </h3>
              <div className="grid grid-cols-1 gap-2.5">
                <button
                  id="mode-classic-btn"
                  onClick={() => startGame('classic')}
                  className={`w-full py-2 px-3 rounded-xl text-left border-2 duration-200 text-xs flex justify-between items-center ${
                    gameMode === 'classic' && gameState !== 'idle'
                      ? 'bg-emerald-500 border-emerald-500 text-white shadow-md'
                      : 'bg-emerald-50 border-emerald-100 text-emerald-800 hover:bg-emerald-100/60'
                  }`}
                >
                  <div className="flex items-center space-x-1.5">
                    <Star className="w-4 h-4" />
                    <strong>經典蜜糖盤 (Classic)</strong>
                  </div>
                  <span className="text-[10px] opacity-90">清除全部</span>
                </button>

                <button
                  id="mode-falling-btn"
                  onClick={() => startGame('falling_rain')}
                  className={`w-full py-2 px-3 rounded-xl text-left border-2 duration-200 text-xs flex justify-between items-center ${
                    gameMode === 'falling_rain' && gameState !== 'idle'
                      ? 'bg-[#fbbf24] border-[#fbbf24] text-white shadow-md'
                      : 'bg-[#fffbeb] border-amber-100 text-amber-800 hover:bg-[#fef3c7]/60'
                  }`}
                >
                  <div className="flex items-center space-x-1.5">
                    <Zap className="w-4 h-4" />
                    <strong>狂暴蜜晶雨 (Rain)</strong>
                  </div>
                  <span className="text-[10px] opacity-90">無盡生存</span>
                </button>

                <button
                  id="mode-speedrun-btn"
                  onClick={() => startGame('speedrun')}
                  className={`w-full py-2 px-3 rounded-xl text-left border-2 duration-200 text-xs flex justify-between items-center ${
                    gameMode === 'speedrun' && gameState !== 'idle'
                      ? 'bg-[#fb7185] border-[#fb7185] text-white shadow-md'
                      : 'bg-rose-50 border-rose-100 text-rose-800 hover:bg-rose-100/60'
                  }`}
                >
                  <div className="flex items-center space-x-1.5">
                    <Trophy className="w-4 h-4" />
                    <strong>120秒蜂王挑戰 (Timer)</strong>
                  </div>
                  <span className="text-[10px] opacity-90">限時速消</span>
                </button>
              </div>
            </div>
          </div>

          {/* Quick instructions indicator box */}
          <div className="bg-[#fbbf24]/10 rounded-2xl border border-[#fbbf24]/30 p-3 text-xs leading-relaxed text-amber-900 shadow-sm">
            <div className="font-bold flex items-center text-amber-950 mb-1">
              <HelpCircle className="w-4 h-4 mr-1 text-amber-500" /> 滑鼠或極簡方向鍵操作：
            </div>
            <p>• 點按或按<strong> A / D 或是 左右方向鍵</strong>來平移橡葉。</p>
            <p>• 蜜糖露珠被黏住時，按<strong>空白鍵</strong>或<strong>拉動或發射鍵</strong>再度出發！</p>
          </div>
        </div>

        {/* Center column: Main interactive canvas playground */}
        <div className="lg:col-span-8 flex flex-col items-center">
          
          {/* Real-time score statistics dashboard panel */}
          <div className="w-full flex items-center justify-between bg-white px-5 py-3 rounded-2xl border-2 border-emerald-100 shadow-sm mb-4">
            <div className="flex items-center space-x-4">
              <div>
                <span className="text-[10px] text-gray-500 block uppercase tracking-wider">糖果積分</span>
                <span className="text-xl font-black font-mono text-emerald-600">{score}</span>
              </div>
              <div className="border-l border-emerald-100 h-8"></div>
              <div>
                <span className="text-[10px] text-gray-500 block uppercase tracking-wider">最高紀錄</span>
                <span className="text-sm font-bold font-mono text-gray-700">{hiScore}</span>
              </div>
            </div>

            {/* Special timer layout for speedrun mode */}
            {gameMode === 'speedrun' && gameState === 'playing' && (
              <div className="bg-rose-50 text-rose-600 font-bold px-3 py-1 rounded-xl border border-rose-200 font-mono text-xs animate-pulse">
                ⏰ 限時：{speedrunTimer} 秒
              </div>
            )}

            <div className="flex items-center space-x-3.5">
              {/* Life Hearts counts loop */}
              <div className="flex items-center space-x-1 bg-[#fffbeb] px-3 py-1.5 rounded-xl border border-amber-200">
                <span className="text-[10px] text-amber-700 font-bold mr-1">生命值:</span>
                {Array.from({ length: Math.max(0, lives) }).map((_, li) => (
                  <Heart key={li} className="w-3.5 h-3.5 text-rose-500 fill-rose-500 animate-pulse" />
                ))}
                {lives <= 0 && <span className="text-red-500 font-mono font-bold text-xs">0 💔</span>}
              </div>

              {/* Sound configurations */}
              <button
                onClick={() => setSoundEnabled(prev => !prev)}
                className="p-2 rounded-xl bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-900 border border-gray-200 transition-colors"
                title={soundEnabled ? '靜音' : '開啟音效'}
              >
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Canvas Wrapper */}
          <div 
            className="relative w-full overflow-hidden rounded-3xl bg-white border-4 border-emerald-50 shadow-md touch-none"
            style={{ maxWidth: '500px', height: '450px' }}
            onMouseMove={(e) => {
              const bounds = e.currentTarget.getBoundingClientRect();
              handleDrag(e.clientX, bounds.left, bounds.width);
            }}
            onTouchMove={(e) => {
              if (e.touches.length > 0) {
                const bounds = e.currentTarget.getBoundingClientRect();
                handleDrag(e.touches[0].clientX, bounds.left, bounds.width);
              }
            }}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <canvas
              id="breakout-canvas"
              ref={canvasRef}
              width={500}
              height={450}
              className="absolute inset-0 block w-full h-full"
            />

            {/* Overlays overlays */}
            <AnimatePresence>
              {gameState === 'gameover' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-white/95 flex flex-col items-center justify-center p-6 text-center z-10"
                >
                  <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center text-4xl mb-4 shadow-md">
                    😭
                  </div>
                  <h3 className="text-2xl font-bold text-red-600 truncate mb-2">特訓失敗了哦</h3>
                  <p className="text-xs text-gray-500 max-w-xs mb-6">
                    小蜜糖露珠掉光光了，小熊巴魯拍拍肚肚來安慰你。沒關係，重新擺好心態再來一次！
                  </p>
                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 w-full max-w-xs">
                    <button
                      id="gameover-retry-btn"
                      onClick={() => startGame(gameMode)}
                      className="flex-1 py-3 bg-emerald-500 font-bold text-white rounded-2xl hover:bg-emerald-600 shadow-md flex items-center justify-center space-x-1.5 duration-200 text-sm"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>再特訓一次</span>
                    </button>
                    <button
                      onClick={() => {
                        playSfx('click');
                        setGameState('idle');
                      }}
                      className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-2xl border duration-200 text-sm"
                    >
                      回主頁面
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
                  <div className="w-16 h-16 bg-yellow-100 text-[#fbbf24] rounded-full flex items-center justify-center text-4xl mb-3 shadow-md animate-bounce">
                    🏆
                  </div>
                  <h3 className="text-2xl font-black text-amber-500 mb-1">蜜糖大獲全勝！</h3>
                  <div className="text-[#10b981] font-mono text-sm font-semibold mb-3">
                    最終獲得糖果積分：{score} 點
                  </div>
                  <p className="text-xs text-gray-500 max-w-xs mb-6">
                    小熊巴魯露出了極其滿足的笑容，正抱著裝得滿滿的蜂巢和蜂蜜罐在大草原跳圓舞曲呢！🐻🌻
                  </p>
                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 w-full max-w-xs">
                    <button
                      id="victory-next-btn"
                      onClick={() => {
                        const nextG = round + 1;
                        setRound(nextG);
                        startGame(gameMode);
                      }}
                      className="flex-1 py-3 bg-emerald-500 font-bold text-white rounded-2xl hover:bg-emerald-600 shadow-md flex items-center justify-center space-x-1.5 duration-200 text-sm"
                    >
                      <Sparkles className="w-4 h-4 animate-spin" />
                      <span>挑戰下一關 (Round {round + 1})</span>
                    </button>
                    <button
                      onClick={() => {
                        playSfx('click');
                        setGameState('idle');
                      }}
                      className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-2xl border duration-200 text-sm"
                    >
                      回主頁
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Interactive controls button interface below canvas for responsive click/touch players */}
          <div className="w-full max-w-[500px] grid grid-cols-4 gap-3 mt-4">
            <button
              id="launch-dewdrop-btn"
              onClick={launchBall}
              disabled={gameState !== 'playing'}
              className="col-span-2 py-3 px-2 bg-[#fbbf24] hover:bg-amber-500 disabled:opacity-40 disabled:cursor-not-allowed font-bold text-neutral-900 rounded-2xl shadow-sm text-xs transition-transform duration-100 active:scale-95 flex items-center justify-center space-x-1"
            >
              <Zap className="w-4 h-4 animate-bounce" />
              <span>發射蜜糖彈珠 !</span>
            </button>

            {gameState === 'playing' ? (
              <button
                id="pause-btn"
                onClick={togglePause}
                className="col-span-1 py-3 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-xs transition-colors"
              >
                暫停遊戲
              </button>
            ) : (
              <button
                id="play-primary-btn"
                onClick={() => startGame(gameMode)}
                className="col-span-1 py-3 px-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-2xl text-xs flex items-center justify-center space-x-1"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>開始玩</span>
              </button>
            )}

            <button
              id="quick-reset-btn"
              onClick={() => startGame(gameMode)}
              className="col-span-1 py-3 px-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-2xl text-xs font-bold transition-all flex items-center justify-center space-x-1"
              title="重新啟動本關卡"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>重來</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
