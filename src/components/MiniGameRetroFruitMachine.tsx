/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, HelpCircle, Trophy, Volume2, VolumeX, Plus, RotateCcw, Coins, Award, Gem, Flame, ShieldAlert, ArrowUpRight } from 'lucide-react';

// Define Fruit Slot cell model
interface FruitSlot {
  index: number;
  col: number;
  row: number;
  id: string;
  name: string;
  chinese: string;
  emoji: string;
  color: string;
  bgClass: string;
  multiplier: number;
  type: 'bar' | 'star' | 'seven' | 'watermelon' | 'bell' | 'mango' | 'orange' | 'apple' | 'lucky';
}

// Bet Category model
interface BetCategory {
  type: 'bar' | 'star' | 'seven' | 'watermelon' | 'bell' | 'mango' | 'orange' | 'apple';
  chinese: string;
  emoji: string;
  color: string;
  multiplier: number;
  description: string;
}

// 24 slots clock-wise around an 8x6 grid
const FRUIT_SLOTS: FruitSlot[] = [
  // Top Row (Row 0, Col 0..7)
  { index: 0, col: 0, row: 0, id: 'slot_0', name: 'bar', chinese: '黃金元寶', emoji: '🪙', color: 'text-amber-500', bgClass: 'from-amber-100 to-yellow-50', multiplier: 120, type: 'bar' },
  { index: 1, col: 1, row: 0, id: 'slot_1', name: 'apple', chinese: '富貴蘋果', emoji: '🍎', color: 'text-rose-500', bgClass: 'from-rose-50 to-pink-50', multiplier: 5, type: 'apple' },
  { index: 2, col: 2, row: 0, id: 'slot_2', name: 'bell', chinese: '金運瑞鐘', emoji: '🔔', color: 'text-yellow-600', bgClass: 'from-yellow-50 to-amber-50', multiplier: 20, type: 'bell' },
  { index: 3, col: 3, row: 0, id: 'slot_3', name: 'orange', chinese: '大吉桔子', emoji: '🍊', color: 'text-orange-500', bgClass: 'from-orange-50 to-yellow-50', multiplier: 10, type: 'orange' },
  { index: 4, col: 4, row: 0, id: 'slot_4', name: 'lucky', chinese: '祥瑞福袋', emoji: '🧧', color: 'text-red-600 font-extrabold', bgClass: 'from-red-100 to-red-50/70', multiplier: 0, type: 'lucky' },
  { index: 5, col: 5, row: 0, id: 'slot_5', name: 'mango', chinese: '金瑞香芒', emoji: '🥭', color: 'text-yellow-500', bgClass: 'from-yellow-50 to-amber-50', multiplier: 15, type: 'mango' },
  { index: 6, col: 6, row: 0, id: 'slot_6', name: 'watermelon', chinese: '清甜西瓜', emoji: '🍉', color: 'text-emerald-500', bgClass: 'from-emerald-50 to-green-50', multiplier: 20, type: 'watermelon' },
  { index: 7, col: 7, row: 0, id: 'slot_7', name: 'seven', chinese: '雙喜臨門', emoji: '囍', color: 'text-rose-600', bgClass: 'from-pink-100 to-rose-50', multiplier: 30, type: 'seven' },
  
  // Right Column (Col 7, Row 1..5)
  { index: 8, col: 7, row: 1, id: 'slot_8', name: 'apple', chinese: '富貴蘋果', emoji: '🍎', color: 'text-rose-500', bgClass: 'from-rose-50 to-pink-50', multiplier: 5, type: 'apple' },
  { index: 9, col: 7, row: 2, id: 'slot_9', name: 'bar', chinese: '黃金元寶', emoji: '🪙', color: 'text-amber-500', bgClass: 'from-amber-100 to-yellow-50', multiplier: 50, type: 'bar' },
  { index: 10, col: 7, row: 3, id: 'slot_10', name: 'bell', chinese: '金運瑞鐘', emoji: '🔔', color: 'text-yellow-600', bgClass: 'from-yellow-50 to-amber-50', multiplier: 20, type: 'bell' },
  { index: 11, col: 7, row: 4, id: 'slot_11', name: 'orange', chinese: '大吉桔子', emoji: '🍊', color: 'text-orange-500', bgClass: 'from-orange-50 to-yellow-50', multiplier: 10, type: 'orange' },
  { index: 12, col: 7, row: 5, id: 'slot_12', name: 'lucky', chinese: '祥瑞福袋', emoji: '🧧', color: 'text-red-600 font-extrabold', bgClass: 'from-red-100 to-red-50/70', multiplier: 0, type: 'lucky' },
  
  // Bottom Row (Row 5, Col 6..0)
  { index: 13, col: 6, row: 5, id: 'slot_13', name: 'mango', chinese: '金瑞香芒', emoji: '🥭', color: 'text-yellow-500', bgClass: 'from-yellow-50 to-amber-50', multiplier: 15, type: 'mango' },
  { index: 14, col: 5, row: 5, id: 'slot_14', name: 'watermelon', chinese: '清甜西瓜', emoji: '🍉', color: 'text-emerald-500', bgClass: 'from-emerald-50 to-green-50', multiplier: 20, type: 'watermelon' },
  { index: 15, col: 4, row: 5, id: 'slot_15', name: 'seven', chinese: '雙喜臨門', emoji: '囍', color: 'text-rose-600', bgClass: 'from-pink-100 to-rose-50', multiplier: 30, type: 'seven' },
  { index: 16, col: 3, row: 5, id: 'slot_16', name: 'apple', chinese: '富貴蘋果', emoji: '🍎', color: 'text-rose-500', bgClass: 'from-rose-50 to-pink-50', multiplier: 5, type: 'apple' },
  { index: 17, col: 2, row: 5, id: 'slot_17', name: 'bell', chinese: '金運瑞鐘', emoji: '🔔', color: 'text-yellow-600', bgClass: 'from-yellow-50 to-amber-50', multiplier: 20, type: 'bell' },
  { index: 18, col: 1, row: 5, id: 'slot_18', name: 'orange', chinese: '大吉桔子', emoji: '🍊', color: 'text-orange-500', bgClass: 'from-orange-50 to-yellow-50', multiplier: 10, type: 'orange' },
  { index: 19, col: 0, row: 5, id: 'slot_19', name: 'star', chinese: '祥瑞翡翠', emoji: '💎', color: 'text-cyan-500', bgClass: 'from-cyan-50 to-teal-50', multiplier: 40, type: 'star' },
  
  // Left Column (Col 0, Row 4..1)
  { index: 20, col: 0, row: 4, id: 'slot_20', name: 'lucky', chinese: '祥瑞福袋', emoji: '🧧', color: 'text-red-600 font-extrabold', bgClass: 'from-red-100 to-red-50/70', multiplier: 0, type: 'lucky' },
  { index: 21, col: 0, row: 3, id: 'slot_21', name: 'mango', chinese: '金瑞香芒', emoji: '🥭', color: 'text-yellow-500', bgClass: 'from-yellow-50 to-amber-50', multiplier: 15, type: 'mango' },
  { index: 22, col: 0, row: 2, id: 'slot_22', name: 'watermelon', chinese: '清甜西瓜', emoji: '🍉', color: 'text-emerald-500', bgClass: 'from-emerald-50 to-green-50', multiplier: 20, type: 'watermelon' },
  { index: 23, col: 0, row: 1, id: 'slot_23', name: 'seven', chinese: '雙喜臨門', emoji: '囍', color: 'text-rose-600', bgClass: 'from-pink-100 to-rose-50', multiplier: 30, type: 'seven' }
];

const BET_CATEGORIES: BetCategory[] = [
  { type: 'bar', chinese: '黃金元寶', emoji: '🪙', color: 'text-amber-600', multiplier: 50, description: '最高可觸發 x120 爆獎！' },
  { type: 'star', chinese: '祥瑞翡翠', emoji: '💎', color: 'text-cyan-600', multiplier: 40, description: '古玉通靈，福運恆常。' },
  { type: 'seven', chinese: '雙喜臨門', emoji: '囍', color: 'text-red-600', multiplier: 30, description: '好事成雙，大吉大利。' },
  { type: 'watermelon', chinese: '清甜西瓜', emoji: '🍉', color: 'text-emerald-600', multiplier: 20, description: '清香沁脾，甘甜連連。' },
  { type: 'bell', chinese: '金運瑞鐘', emoji: '🔔', color: 'text-yellow-600', multiplier: 20, description: '瑞音裊裊，金鐘報禧。' },
  { type: 'mango', chinese: '金瑞香芒', emoji: '🥭', color: 'text-amber-500', multiplier: 15, description: '香氣盈懷，黃金滿溢。' },
  { type: 'orange', chinese: '大吉桔子', emoji: '🍊', color: 'text-orange-500', multiplier: 10, description: '大吉大利，歲歲平安。' },
  { type: 'apple', chinese: '富貴蘋果', emoji: '🍎', color: 'text-rose-500', multiplier: 5, description: '平平安安，富貴無疆。' }
];

export default function MiniGameRetroFruitMachine() {
  // Game state
  const [balance, setBalance] = useState(() => {
    return Number(localStorage.getItem('fruit_machine_balance') || '500');
  });
  const [bestPayout, setBestPayout] = useState(() => {
    return Number(localStorage.getItem('fruit_machine_best_payout') || '0');
  });
  const [bets, setBets] = useState<Record<string, number>>({
    bar: 0,
    star: 0,
    seven: 0,
    watermelon: 0,
    bell: 0,
    mango: 0,
    orange: 0,
    apple: 0
  });

  const [activeLight, setActiveLight] = useState<number | null>(null);
  const [bonusLights, setBonusLights] = useState<number[]>([]); // Extra lights lit up in "Lucky 福袋" event
  const [isSpinning, setIsSpinning] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [hostMood, setHostMood] = useState<'idle' | 'dancing' | 'thinking' | 'victory' | 'sad'>('idle');
  const [machineStatusLabel, setMachineStatusLabel] = useState('🌟 招財小獅「金金」守護，請放置投注並啟動發財輪盤！');
  const [coinRain, setCoinRain] = useState<{ id: number; left: number; delay: number }[]>([]);
  const [lastWin, setLastWin] = useState<number | null>(null);
  const [marqTick, setMarqTick] = useState(false);

  const loopTimer = useRef<NodeJS.Timeout | null>(null);
  const soundContextRef = useRef<AudioContext | null>(null);

  // Toggle Marquee Lights
  useEffect(() => {
    const timer = setInterval(() => {
      setMarqTick(prev => !prev);
    }, 450);
    return () => clearInterval(timer);
  }, []);

  // Sync balance to standard storage
  useEffect(() => {
    localStorage.setItem('fruit_machine_balance', String(balance));
  }, [balance]);

  // Audio system utilizing clean synthesized frequency scales
  const playSound = (type: 'tick' | 'bet' | 'clear' | 'bonus' | 'win' | 'big_win' | 'lost' | 'start') => {
    if (!soundEnabled) return;
    try {
      if (!soundContextRef.current) {
        soundContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = soundContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;

      if (type === 'tick') {
        // High ticking arcade node
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(880, now);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        osc.start(now);
        osc.stop(now + 0.06);
      } else if (type === 'bet') {
        // Wooden mechanical block sound
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(554, now + 0.08);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
      } else if (type === 'clear') {
        // Releasing slide
        osc.type = 'sine';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.linearRampToValueAtTime(150, now + 0.15);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.16);
      } else if (type === 'start') {
        // Energizing arcade sweep
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.25);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.26);
      } else if (type === 'bonus') {
        // Sparkle magical trills
        const nowTime = ctx.currentTime;
        [523, 659, 784, 1046].forEach((f, idx) => {
          const bOsc = ctx.createOscillator();
          const bGain = ctx.createGain();
          bOsc.type = 'sine';
          bOsc.frequency.setValueAtTime(f, nowTime + idx * 0.08);
          bGain.connect(ctx.destination);
          bOsc.connect(bGain);
          bGain.gain.setValueAtTime(0.15, nowTime + idx * 0.08);
          bGain.gain.exponentialRampToValueAtTime(0.001, nowTime + idx * 0.08 + 0.25);
          bOsc.start(nowTime + idx * 0.08);
          bOsc.stop(nowTime + idx * 0.08 + 0.26);
        });
      } else if (type === 'win') {
        // Happy major sweep (Pentatonic Chinese traditional vibe)
        const notes = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25];
        notes.forEach((f, idx) => {
          const wOsc = ctx.createOscillator();
          const wGain = ctx.createGain();
          wOsc.type = 'sine';
          wOsc.frequency.setValueAtTime(f, now + idx * 0.06);
          wGain.connect(ctx.destination);
          wOsc.connect(wGain);
          wGain.gain.setValueAtTime(0.15, now + idx * 0.06);
          wGain.gain.exponentialRampToValueAtTime(0.002, now + idx * 0.06 + 0.3);
          wOsc.start(now + idx * 0.06);
          wOsc.stop(now + idx * 0.06 + 0.35);
        });
      } else if (type === 'big_win') {
        // Festive triple horns and whistles sounding like a celebratory gong
        const notes = [392, 494, 587, 784, 987, 1174, 1568];
        for (let i = 0; i < 3; i++) {
          notes.forEach((f, idx) => {
            const wOsc = ctx.createOscillator();
            const wGain = ctx.createGain();
            wOsc.type = 'triangle';
            wOsc.frequency.setValueAtTime(f * (1 + i * 0.02), now + idx * 0.05 + i * 0.15);
            wGain.connect(ctx.destination);
            wOsc.connect(wGain);
            wGain.gain.setValueAtTime(0.15, now + idx * 0.05 + i * 0.15);
            wGain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + i * 0.15 + 0.4);
            wOsc.start(now + idx * 0.05 + i * 0.15);
            wOsc.stop(now + idx * 0.05 + i * 0.15 + 0.4);
          });
        }
      } else if (type === 'lost') {
        // Low comical down-frequency
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.linearRampToValueAtTime(75, now + 0.4);
        gain.gain.setValueAtTime(0.16, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        osc.start(now);
        osc.stop(now + 0.4);
      }
    } catch (e) {
      console.log('Synthesizer state:', e);
    }
  };

  // Click handler for betting categories
  const handleBetChange = (categoryType: string, amount: number) => {
    if (isSpinning) return;

    // Check if enough funds
    if (amount > 0 && balance < amount) {
      playSound('lost');
      setMachineStatusLabel('⚠️ 瑞氣財庫餘額不足！請稍待或重新起局領取開運金！');
      return;
    }

    // Add or remove bets
    setBets(prev => {
      const currentBet = prev[categoryType] || 0;
      const nextBet = Math.max(0, currentBet + amount);

      // Deduct or refund balance
      const delta = nextBet - currentBet;
      setBalance(b => b - delta);

      if (delta !== 0) {
        playSound('bet');
      }

      return {
        ...prev,
        [categoryType]: nextBet
      };
    });
  };

  // Betting Actions Shortcuts
  const clearAllBets = () => {
    if (isSpinning) return;
    playSound('clear');
    let totalBets = 0;
    Object.keys(bets).forEach(key => {
      totalBets += bets[key] || 0;
    });
    setBalance(b => b + totalBets);
    setBets({
      bar: 0,
      star: 0,
      seven: 0,
      watermelon: 0,
      bell: 0,
      mango: 0,
      orange: 0,
      apple: 0
    });
    setMachineStatusLabel('🧼 盤中籌碼已全數清空！');
  };

  const handleMaxBetAll = () => {
    if (isSpinning) return;
    const betCount = 8;
    const coinsPerSeat = Math.floor(balance / betCount);

    if (coinsPerSeat <= 0) {
      playSound('lost');
      setMachineStatusLabel('⚠️ 財庫空虛，請先點擊重置領取天降好利！');
      return;
    }

    playSound('bet');
    setBets(prev => {
      const updated: Record<string, number> = {};
      Object.keys(prev).forEach(key => {
        updated[key] = (prev[key] || 0) + coinsPerSeat;
      });
      return updated;
    });
    setBalance(b => b % betCount);
    setMachineStatusLabel('🔥 諸神退避，乾坤一擲！已均分投注到所有水果席位中！');
  };

  // Perform Spin
  const triggerSpin = () => {
    if (isSpinning) return;

    // Must place at least some bets!
    const totalBetCoins = Object.keys(bets).reduce((sum, key) => sum + (bets[key] || 0), 0);
    if (totalBetCoins <= 0) {
      playSound('lost');
      setMachineStatusLabel('🎟️ 爆冷提醒：投注不可為空！請點擊加號配置你的福運水果盤。');
      return;
    }

    setIsSpinning(true);
    setBonusLights([]);
    setLastWin(null);
    setHostMood('thinking');
    setMachineStatusLabel('🍥 輪盤極速旋轉中，天星移轉，發財吉光穿梭！...');
    playSound('start');

    // Decide winning index (0 to 23)
    const finalWinIndex = Math.floor(Math.random() * 24);

    let currentIdx = activeLight !== null ? activeLight : 0;
    let currentSpeed = 40; // milliseconds per step
    let stepsCount = 0;
    const targetSteps = 48 + finalWinIndex; // Circle at least 2 full rounds before stopped

    const tickHandler = () => {
      currentIdx = (currentIdx + 1) % 24;
      setActiveLight(currentIdx);
      playSound('tick');

      stepsCount++;

      if (stepsCount < targetSteps) {
        // Smoothly decay deceleration
        if (targetSteps - stepsCount < 14) {
          currentSpeed += 24; // Decelerate sharply near endpoint
        } else if (targetSteps - stepsCount < 25) {
          currentSpeed += 12; // Gradual initial slow-down
        }
        loopTimer.current = setTimeout(tickHandler, currentSpeed);
      } else {
        // Wheel stopped! Evaluate payout outcome
        evaluateWinner(finalWinIndex);
      }
    };

    loopTimer.current = setTimeout(tickHandler, currentSpeed);
  };

  // Evaluate the Spin Win / Multipliers
  const evaluateWinner = (winningIndex: number) => {
    const winnerCell = FRUIT_SLOTS[winningIndex];
    let finalEarnings = 0;
    let detailLabel = '';

    if (winnerCell.type === 'lucky') {
      // TRIGGER "天降送燈" (Lucky random extra spots!)
      playSound('bonus');
      setHostMood('dancing');
      
      // Select 1 to 3 random extra fruit spots on the board
      const extraCount = Math.floor(Math.random() * 3) + 1; // 1 to 3 extra slots
      const extras: number[] = [];
      while (extras.length < extraCount) {
        const rand = Math.floor(Math.random() * 24);
        if (rand !== winningIndex && !extras.includes(rand) && FRUIT_SLOTS[rand].type !== 'lucky') {
          extras.push(rand);
        }
      }

      setBonusLights(extras);
      detailLabel += `🧧 獲得瑞氣「祥瑞送燈」！額外獲贈 ${extraCount} 盞好運金禧燈：`;

      // Accumulate pay for all active spots
      let totalLuckyEarn = 0;
      const spotNames: string[] = [];

      extras.forEach(idx => {
        const cell = FRUIT_SLOTS[idx];
        const categoryBet = bets[cell.type] || 0;
        const reward = categoryBet * cell.multiplier;
        totalLuckyEarn += reward;
        if (reward > 0) {
          spotNames.push(`【${cell.chinese} x${cell.multiplier}】點爆贏得 ${reward} 銅錢`);
        } else {
          spotNames.push(`【${cell.chinese} x${cell.multiplier}】(未投注)`);
        }
      });

      finalEarnings = totalLuckyEarn;
      
      if (finalEarnings > 0) {
        detailLabel += spotNames.join(' + ') + `！共贏得 ${finalEarnings} 金金喜！`;
      } else {
        detailLabel += spotNames.join(' + ') + `！可惜沒有點中投注項目，再接再厲！`;
      }

    } else {
      // Standard target fruit payout
      const categoryBet = bets[winnerCell.type] || 0;
      finalEarnings = categoryBet * winnerCell.multiplier;

      if (finalEarnings > 0) {
        detailLabel = `👑 恭喜！指針點亮 ${winnerCell.emoji}【${winnerCell.chinese} x${winnerCell.multiplier}】，投注 ${categoryBet} 金獲得 ${finalEarnings} 倍增獎賞！🧧`;
      } else {
        detailLabel = `🕯️ 指針點亮 ${winnerCell.emoji}【${winnerCell.chinese} x${winnerCell.multiplier}】。此次沒有投注它，下回調整布局，好氣運必然重來！🍃`;
      }
    }

    // Set payout outputs and stats
    if (finalEarnings > 0) {
      setBalance(b => b + finalEarnings);
      setLastWin(finalEarnings);

      if (finalEarnings >= 150) {
        playSound('big_win');
        setHostMood('victory');
        triggerCoinRain();
      } else {
        playSound('win');
        setHostMood('dancing');
      }

      if (finalEarnings > bestPayout) {
        setBestPayout(finalEarnings);
        localStorage.setItem('fruit_machine_best_payout', String(finalEarnings));
      }
    } else {
      playSound('lost');
      setHostMood('sad');
    }

    setMachineStatusLabel(detailLabel);
    setIsSpinning(false);
  };

  // Launch Coin Rain celebrations inside cabinet
  const triggerCoinRain = () => {
    const array = Array.from({ length: 28 }).map((_, idx) => ({
      id: Date.now() + idx,
      left: Math.random() * 92,
      delay: Math.random() * 2.2
    }));
    setCoinRain(array);
    setTimeout(() => {
      setCoinRain([]);
    }, 4500);
  };

  const handleResetOpenFunds = () => {
    if (isSpinning) return;
    playSound('bonus');
    setBalance(300);
    setBets({
      bar: 0,
      star: 0,
      seven: 0,
      watermelon: 0,
      bell: 0,
      mango: 0,
      orange: 0,
      apple: 0
    });
    setMachineStatusLabel('🦁 招財小獅「金金」為您呈上 300 瑞氣開運金！祝大吉大利！🏺');
    setHostMood('victory');
  };

  return (
    <div className="p-4 md:p-6 text-slate-800 text-left relative max-w-[1120px] mx-auto animate-in fade-in duration-300">
      
      {/* Decorative Gold Coin Rain Overlay inside App */}
      <AnimatePresence>
        {coinRain.length > 0 && (
          <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
            {coinRain.map(coin => (
              <motion.div
                key={coin.id}
                initial={{ y: -60, opacity: 0, rotate: 0 }}
                animate={{ 
                  y: window.innerHeight + 100, 
                  opacity: [0, 1, 1, 0], 
                  rotate: 720 
                }}
                transition={{ 
                  duration: 2.5, 
                  delay: coin.delay,
                  ease: 'linear'
                }}
                className="absolute text-3xl select-none"
                style={{ left: `${coin.left}%` }}
              >
                🪙
              </motion.div>
            ))}
            {/* Red gold firework overlay text banner */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: [0.5, 1.2, 1], opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 m-auto w-fit h-fit bg-red-600 outline-double outline-4 outline-amber-300 border-4 border-red-700 text-yellow-100 px-10 py-6 rounded-3xl shadow-2xl text-center flex flex-col items-center justify-center gap-2"
            >
              <div className="text-4xl">🏅 元寶雨降臨 🏅</div>
              <p className="text-xs tracking-widest font-bold">【祥瑞通天・爆燈大吉】</p>
              {lastWin && (
                <div className="text-3xl font-black text-yellow-300 font-mono">
                  + {lastWin} 銅錢
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left section: Retro Marquee Cabinet */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          
          {/* Header Banner info with gold coins statistics */}
          <div className="bg-gradient-to-r from-red-900 via-yellow-950 to-red-900 p-4 rounded-3xl border-2 border-red-700 shadow-md relative overflow-hidden flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            
            {/* Title */}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="bg-amber-400 text-red-950 text-[10px] uppercase font-black px-2 py-0.5 rounded-full tracking-wider animate-pulse">
                  Retro Fortune Slot
                </span>
                <span className="text-[10px] text-yellow-300 font-extrabold">• 國潮禧瑞水果盤</span>
              </div>
              <h2 className="text-xl font-black text-yellow-100 tracking-tight flex items-center gap-1.5 font-serif">
                金禧瑞獸水果盤 🎰
              </h2>
            </div>

            {/* Statistics */}
            <div className="flex gap-3 shrink-0">
              <div className="bg-red-950/80 border border-yellow-600/50 px-4 py-1.5 rounded-2xl text-center shadow-inner min-w-[100px]">
                <span className="block text-[8px] text-yellow-400 font-extrabold uppercase tracking-widest">
                  瑞氣金庫 balance
                </span>
                <span className="text-base font-black text-amber-300 font-mono flex items-center justify-center gap-1">
                  <Coins className="w-4 h-4 text-amber-400 animate-spin" /> {balance}
                </span>
              </div>
              <div className="bg-red-950/80 border border-red-700 px-4 py-1.5 rounded-2xl text-center shadow-inner min-w-[100px]">
                <span className="block text-[8px] text-red-300 font-black uppercase tracking-widest">
                  單次醉高贏 payout
                </span>
                <span className="text-base font-black text-yellow-200 font-mono flex items-center justify-center gap-0.5">
                  🏆 {bestPayout}
                </span>
              </div>
            </div>
          </div>

          {/* Cabinet Stage Main Wheel Loop */}
          <div 
            id="retro-cabinet-body"
            className="rounded-3xl border-[6px] border-red-700 bg-red-950 shadow-2xl relative p-3 md:p-6 select-none"
            style={{
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), inset 0 0 60px rgba(0,0,0,0.9)'
            }}
          >
            {/* Outer LED marquee flashing bulbs */}
            <div className="absolute inset-0.5 rounded-2xl border-2 border-amber-400 pointer-events-none opacity-20"></div>

            {/* Grid container with exactly 8 columns and 6 rows */}
            <div className="grid grid-cols-8 gap-1.5 md:gap-2 relative">
              
              {/* Loop the Perimeter 24 slots */}
              {FRUIT_SLOTS.map((slot) => {
                const isCurrent = activeLight === slot.index;
                const isBonus = bonusLights.includes(slot.index);
                const hasLocalBet = (bets[slot.type] || 0) > 0;

                // Absolute position calculations for cells mapping on standard 8x6 layout
                return (
                  <div
                    key={slot.id}
                    className={`aspect-square rounded-xl flex flex-col items-center justify-between p-1 transition-all relative ${slot.bgClass} ${
                      isCurrent 
                        ? 'ring-4 ring-yellow-400 scale-105 z-20 shadow-lg brightness-110 border-yellow-300 border bg-gradient-to-tr from-yellow-300 to-amber-200' 
                        : isBonus
                        ? 'ring-4 ring-red-500 scale-105 z-20 animate-pulse bg-gradient-to-tr from-rose-400 to-red-100 border-red-400'
                        : 'border border-red-900/40 opacity-90'
                    }`}
                    style={{
                      gridColumnStart: slot.col + 1,
                      gridRowStart: slot.row + 1,
                    }}
                  >
                    {/* Hot flashing corner bulbs */}
                    {isCurrent && (
                      <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                      </span>
                    )}

                    {/* Small multiplier top-right indicator */}
                    <div className="w-full flex justify-between items-center px-0.5">
                      {slot.multiplier > 0 ? (
                        <span className="text-[8px] font-black text-red-900 leading-none">
                          x{slot.multiplier}
                        </span>
                      ) : (
                        <span className="bg-red-600 text-[8px] text-white px-0.5 rounded leading-none font-bold scale-90">
                          LUCKY
                        </span>
                      )}
                      
                      {/* Active green bet signal indicator */}
                      {hasLocalBet && (
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 ring-1 ring-white"></span>
                      )}
                    </div>

                    {/* Emoji Mascot Symbol */}
                    <span className={`text-2xl md:text-3xl filter hover:scale-110 transition-transform ${slot.color}`}>
                      {slot.emoji}
                    </span>

                    {/* Name subtitle */}
                    <span className="text-[7px] text-red-950 bg-white/40 px-1 rounded font-extrabold max-w-full truncate leading-tight">
                      {slot.chinese.substring(2)}
                    </span>
                  </div>
                );
              })}

              {/* Inner Center display panel area (spanning cols 2..7, rows 2..5) */}
              <div 
                className="col-span-6 row-span-4 bg-gradient-to-b from-[#1c0205] to-[#2e0105] rounded-2xl border-2 border-red-900 p-4 flex flex-col items-center justify-between relative shadow-inner overflow-hidden text-center"
                style={{
                  gridColumnStart: 2,
                  gridRowStart: 2,
                }}
              >
                {/* Vintage arcade lighting effects */}
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-200 via-red-900 to-transparent pointer-events-none"></div>

                {/* Left Side: Host Mascot Assistant Lion (金金) */}
                <div className="flex w-full justify-between items-center gap-4 relative z-10 flex-grow py-1">
                  
                  {/* Avatar wrapper */}
                  <div className="flex flex-col items-center shrink-0">
                    <motion.div 
                      animate={
                        hostMood === 'dancing' 
                          ? { y: [0, -10, 0], rotate: [0, 15, -15, 0] } 
                          : hostMood === 'victory'
                          ? { scale: [1, 1.2, 0.9, 1.1, 1], rotate: [0, 360, 0] }
                          : hostMood === 'sad'
                          ? { y: [0, 2, 0], opacity: [1, 0.7, 1] }
                          : { y: [0, -2, 0] }
                      }
                      transition={
                        hostMood === 'dancing'
                          ? { repeat: Infinity, duration: 0.6 }
                          : hostMood === 'idle'
                          ? { repeat: Infinity, duration: 1.8, ease: 'easeInOut' }
                          : { duration: 0.8 }
                      }
                      className="text-5xl cursor-pointer"
                    >
                      🦁
                    </motion.div>
                    <div className="bg-amber-400 text-red-950 text-[8px] font-black px-1.5 py-0.5 rounded-full mt-1.5 border border-amber-300">
                      瑞獸金金
                    </div>
                  </div>

                  {/* Speech Dialog */}
                  <div className="bg-red-950/90 border border-yellow-600/30 rounded-2xl p-2.5 flex-grow relative text-left text-yellow-100 max-w-[320px]">
                    <div className="absolute top-1/2 -left-2 w-0 h-0 border-t-4 border-b-4 border-r-8 border-t-transparent border-b-transparent border-r-red-950/90 -translate-y-1/2"></div>
                    <p className="text-[11px] font-black text-yellow-200/90 leading-normal">
                      {hostMood === 'idle' && '🦁：投注「黃金元寶」最高可獲 120 倍財源噢！'}
                      {hostMood === 'thinking' && '🌀：諸天星曜轉盤旋，財氣正在尋覓有緣的主人！...'}
                      {hostMood === 'dancing' && '🏮：爆亮大發！天降好彩頭！恭喜發財！'}
                      {hostMood === 'victory' && '🧧：神光照頂啦！富貴滿庫，再接再厲！'}
                      {hostMood === 'sad' && '🦁：勝敗乃兵家常事，金金看好你下一局爆燈！'}
                    </p>
                  </div>
                </div>

                {/* Running lights or status label feedback */}
                <div className="w-full bg-black/60 border border-red-950 rounded-xl px-3 py-2 text-[10px] md:text-xs font-bold text-yellow-300 min-h-[48px] flex items-center justify-center relative z-10">
                  <span className="leading-relaxed">
                    {machineStatusLabel}
                  </span>
                </div>

                {/* Multi-colored physical LED bulb loops */}
                <div className="flex gap-2.5 mt-2 justify-center">
                  {[...Array(6)].map((_, i) => (
                    <div
                      key={`led_${i}`}
                      className={`w-2 h-2 rounded-full border border-black/50 shadow-sm ${
                        marqTick 
                          ? i % 2 === 0 ? 'bg-orange-400 shadow-[0_0_8px_#f97316]' : 'bg-green-400 shadow-[0_0_8px_#22c55e]'
                          : i % 2 === 0 ? 'bg-red-500 shadow-[0_0_8px_#ef4444]' : 'bg-yellow-400 shadow-[0_0_8px_#eab308]'
                      }`}
                    ></div>
                  ))}
                </div>

              </div>

            </div>
          </div>

          {/* Interactive controls: Start / Spin / Betting tools panel */}
          <div className="bg-red-900 p-5 rounded-3xl border-2 border-red-700/60 shadow-md grid grid-cols-12 gap-4 items-center">
            
            {/* Short actions shortcuts */}
            <div className="col-span-12 sm:col-span-3 flex flex-row sm:flex-col gap-2.5 justify-between w-full">
              <button
                onClick={clearAllBets}
                disabled={isSpinning}
                className="w-full font-black text-[10px] md:text-xs bg-red-950 hover:bg-black hover:text-red-100 border border-red-700 text-yellow-300 py-3 px-4 rounded-xl shadow-md transition-all active:translate-y-0.5 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5 text-yellow-500" />
                <span>清除投注 (CLEAR)</span>
              </button>
              
              <button
                onClick={handleMaxBetAll}
                disabled={isSpinning}
                className="w-full font-black text-[10px] md:text-xs bg-amber-400 hover:bg-amber-300 border border-amber-500 text-red-950 py-3 px-4 rounded-xl shadow-md transition-all active:translate-y-0.5 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5 text-red-950" />
                <span>全投均分 (MAX BET)</span>
              </button>
            </div>

            {/* Central status summary betting count */}
            <div className="col-span-12 sm:col-span-5 bg-red-950/60 p-4 rounded-2xl border border-red-800 text-center space-y-2">
              <span className="text-[10px] text-red-300 uppercase tracking-widest font-black block">
                盤面投注籌碼 (Total Bet)
              </span>
              <div className="text-2xl font-black text-rose-300 font-mono">
                {Object.keys(bets).reduce((sum, key) => sum + (bets[key] || 0), 0)} <span className="text-xs text-red-400 font-bold">銅錢</span>
              </div>
              <p className="text-[8.5px] text-red-400">所有押注均會在指針停在對應項目時，依倍數派彩！</p>
            </div>

            {/* Main Spin Button */}
            <div className="col-span-12 sm:col-span-4 flex items-center justify-center">
              <button
                onClick={triggerSpin}
                disabled={isSpinning}
                className={`py-4 px-8 w-full font-black text-base tracking-widest rounded-2xl shadow-lg border transition-all transform hover:scale-102 flex items-center justify-center gap-2 cursor-pointer ${
                  isSpinning 
                    ? 'bg-red-800 text-red-500 border-red-950 cursor-not-allowed' 
                    : 'bg-gradient-to-tr from-yellow-300 via-amber-400 to-yellow-300 hover:brightness-110 active:translate-y-1 text-red-950 border-amber-500 hover:shadow-yellow-400/20 shadow-xl'
                }`}
              >
                <Flame className={`w-5 h-5 ${isSpinning ? 'text-red-500' : 'text-red-950 animate-bounce'}`} />
                <span>{isSpinning ? '吉星運行中' : '啟動輪盤 SPIN'}</span>
              </button>
            </div>

          </div>
        </div>

        {/* Right column: Fruit Bet Grid & Sound parameters */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Sound controller */}
          <div className="bg-white border border-slate-100 rounded-3xl p-4 flex justify-between items-center shadow-sm">
            <div className="space-y-0.5">
              <span className="text-xs font-black text-slate-800 block">嗩吶音效開關</span>
              <p className="text-[9px] text-slate-400">開啟傳統與復古電子爆笑合成音效</p>
            </div>
            <button
              onClick={() => {
                setSoundEnabled(prev => !prev);
                playSound('tick');
              }}
              className="p-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all border border-slate-100 text-slate-600 cursor-pointer"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-600" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
            </button>
          </div>

          {/* Detailed Bet Sheet Category Board */}
          <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-3.5">
            <div className="border-b pb-3 flex justify-between items-center bg-gradient-to-r from-red-50/50 to-transparent p-2 rounded-xl">
              <div className="space-y-0.5">
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1">
                  <Award className="w-4 h-4 text-red-600" /> 
                  金禧福祿水果台
                </h3>
                <p className="text-[9px] text-slate-400">點擊水果投注（可進行無限次增投）</p>
              </div>
              <span className="text-[9px] text-red-700 bg-red-100 px-2 py-0.5 rounded-full font-black animate-pulse">
                CHINESE NEW YEAR EDITION
              </span>
            </div>

            {/* Betting Cards Map */}
            <div className="grid grid-cols-2 gap-3">
              {BET_CATEGORIES.map((cat) => {
                const currentBet = bets[cat.type] || 0;
                
                return (
                  <div
                    key={cat.type}
                    className={`border rounded-2xl p-3 flex flex-col justify-between gap-1 px-3 py-2.5 transition-all relative overflow-hidden group hover:border-amber-300 ${
                      currentBet > 0 
                        ? 'border-amber-400 bg-gradient-to-tr from-yellow-50/60 to-amber-50/30' 
                        : 'border-slate-100 bg-slate-50/40'
                    }`}
                  >
                    {/* Tiny decorative absolute layout bubble */}
                    <span className="absolute -right-3 -top-3 text-4xl opacity-[0.06] select-none pointer-events-none filter saturate-150">
                      {cat.emoji}
                    </span>

                    {/* Emoji, Title & Multipliers */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-xl ${cat.color} filter drop-shadow-sm`}>{cat.emoji}</span>
                        <span className="text-[11px] font-black tracking-tight text-slate-700 group-hover:text-red-700">
                          {cat.chinese}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono font-black text-red-600">
                        x{cat.multiplier}
                      </span>
                    </div>

                    {/* Bet placement controls */}
                    <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-dashed border-slate-200/60 gap-1">
                      {/* Left decrement */}
                      <button
                        onClick={() => handleBetChange(cat.type, -5)}
                        disabled={currentBet <= 0 || isSpinning}
                        className="p-1 px-2 border border-slate-200/80 bg-white hover:bg-slate-50 text-slate-600 rounded-lg text-[9px] font-extrabold disabled:opacity-40 select-none cursor-pointer"
                      >
                        -5
                      </button>

                      {/* Middle displaying size count */}
                      <span className="text-xs font-black text-slate-800 font-mono tracking-tight shrink-0">
                        {currentBet}
                      </span>

                      {/* Right increments */}
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleBetChange(cat.type, 1)}
                          disabled={isSpinning}
                          className="p-1 border border-slate-200/80 bg-white hover:bg-slate-50 text-slate-600 rounded-lg text-[9px] font-extrabold select-none cursor-pointer"
                        >
                          +1
                        </button>
                        <button
                          onClick={() => handleBetChange(cat.type, 10)}
                          disabled={isSpinning}
                          className="p-1 border border-slate-200/80 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-[9px] font-extrabold select-none cursor-pointer border-red-100"
                        >
                          +10
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bankruptcy Open Funds Shield */}
            {balance <= 0 && Object.keys(bets).reduce((sum, key) => sum + (bets[key] || 0), 0) === 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-red-50 border border-red-200 p-4 rounded-2xl flex flex-col gap-2 items-center text-center mt-3"
              >
                <div className="text-red-600 font-black text-[11px] flex items-center gap-1 justify-center">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>財源凝滯（餘額歸零）</span>
                </div>
                <p className="text-[10.5px] text-red-950 font-bold leading-relaxed">
                  哎呀，看來投注金暫時告罄了。點擊下方「瑞氣充盈」小獅將長設吉星，贈您 300 開局金重整大吉！
                </p>
                <button
                  onClick={handleResetOpenFunds}
                  className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-extrabold py-2 px-6 rounded-xl text-xs active:translate-y-0.5 shadow-md flex items-center gap-1 cursor-pointer"
                >
                  🦁 領取 300 金開口笑
                </button>
              </motion.div>
            )}

          </div>

          {/* Quick Retro Guide */}
          <div className="bg-amber-50/50 border border-amber-200/60 rounded-3xl p-4 shadow-sm text-xs text-amber-900/90 leading-relaxed font-semibold">
            <h4 className="font-black text-amber-950 flex items-center gap-1 mb-1 shadow-none">
              <HelpCircle className="w-4 h-4 text-amber-700" />
              福運水輪盤玩法秘籍：
            </h4>
            <ul className="list-disc pl-4 space-y-1 text-[10.5px]">
              <li>當指針停在「黃金元寶」上，將獲取最高 <strong>120 倍</strong> 或 50 倍驚喜提振資產！</li>
              <li>指針停在「祥瑞福袋 🧧」時，必將點爆 <strong>「祥瑞送燈」</strong>，天降 1-3 盞額外水果贈獎燈！</li>
              <li>隨時點按 <span className="bg-amber-200 px-1 rounded text-red-950">全投均分</span>，將您當前金庫籌碼均衡下注，喜迎富貴！</li>
            </ul>
          </div>

        </div>

      </div>
    </div>
  );
}
