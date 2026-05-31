/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, RotateCcw, Volume2, VolumeX, Trophy, Sparkles, HelpCircle, Heart, Zap, ShieldAlert, Award, Flame, FlameKindling, Info } from 'lucide-react';

type Choice = 'rock' | 'paper' | 'scissors' | null;
type GameState = 'idle' | 'countdown' | 'reveal' | 'round_end' | 'game_over';
type Mode = 'classic' | 'magic_cards'; // classic with rage, card mode with trick cards
type GameResult = 'win' | 'lose' | 'draw';

interface HistoryEntry {
  round: number;
  player: Choice;
  opponent: Choice;
  result: GameResult;
}

export default function MiniGameRockPaperScissors() {
  const [gameState, setGameState] = useState<GameState>('idle');
  const [gameMode, setGameMode] = useState<Mode>('classic');
  const [playerChoice, setPlayerChoice] = useState<Choice>(null);
  const [opponentChoice, setOpponentChoice] = useState<Choice>(null);
  const [roundResult, setRoundResult] = useState<GameResult | null>(null);
  
  // Stats
  const [playerScore, setPlayerScore] = useState<number>(0);
  const [opponentScore, setOpponentScore] = useState<number>(0);
  const [roundCount, setRoundCount] = useState<number>(1);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  
  // Custom Mechanics: Rage / Special Items
  const [playerRage, setPlayerRage] = useState<number>(0); // 0 to 100
  const [opponentRage, setOpponentRage] = useState<number>(0);
  const [isSuperActive, setIsSuperActive] = useState<boolean>(false);
  const [helperEnergy, setHelperEnergy] = useState<number>(3); // card tricks left in Magic Mode
  const [magicEffect, setMagicEffect] = useState<'reveal' | 'shield' | 'boost' | null>(null);
  
  // Mascot system
  const [balloonText, setBalloonText] = useState<string>('嗨！我是小熊巴魯 🐻，快選出拳，打落松鼠皮皮的小松果吧！');
  const [pipiSpeech, setPipiSpeech] = useState<string>('哼哼！我的尾巴絕不吃土！🐿️ 松果防線無動於衷！');
  const [bearMood, setBearMood] = useState<'happy' | 'thinking' | 'sad' | 'idle' | 'super'>('idle');
  const [squirrelMood, setSquirrelMood] = useState<'happy' | 'suspicious' | 'giddy' | 'idle' | 'angry'>('idle');
  
  const [countdown, setCountdown] = useState<number>(3);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Sound Synthesizer via Web Audio API
  const playSfx = useCallback((type: 'select' | 'win' | 'lose' | 'tie' | 'ultimate' | 'tick' | 'magic' | 'click') => {
    if (!soundEnabled) return;
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();

      if (type === 'tick') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(450, ctx.currentTime);
        gain.gain.setValueAtTime(0.04, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
        osc.start();
        osc.stop(ctx.currentTime + 0.09);
      } else if (type === 'select') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(330, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(660, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
        osc.start();
        osc.stop(ctx.currentTime + 0.13);
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
      } else if (type === 'win') {
        // Ascending major chord
        const notes = [261.63, 329.63, 392.00, 523.25];
        notes.forEach((freq, idx) => {
          const oscNode = ctx.createOscillator();
          const gainNode = ctx.createGain();
          oscNode.connect(gainNode);
          gainNode.connect(ctx.destination);
          oscNode.type = 'sine';
          oscNode.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);
          gainNode.gain.setValueAtTime(0.06, ctx.currentTime + idx * 0.08);
          gainNode.gain.exponentialRampToValueAtTime(0.005, ctx.currentTime + idx * 0.08 + 0.25);
          oscNode.start(ctx.currentTime + idx * 0.08);
          oscNode.stop(ctx.currentTime + idx * 0.08 + 0.26);
        });
      } else if (type === 'lose') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(220, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(110, ctx.currentTime + 0.35);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.002, ctx.currentTime + 0.35);
        osc.start();
        osc.stop(ctx.currentTime + 0.36);
      } else if (type === 'tie') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(300, ctx.currentTime);
        gain.gain.setValueAtTime(0.03, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
        osc.start();
        osc.stop(ctx.currentTime + 0.21);
      } else if (type === 'ultimate') {
        // Epic sound for rage activation
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();
        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);
        osc1.type = 'sawtooth';
        osc2.type = 'sine';
        osc1.frequency.setValueAtTime(150, ctx.currentTime);
        osc1.frequency.linearRampToValueAtTime(600, ctx.currentTime + 0.4);
        osc2.frequency.setValueAtTime(300, ctx.currentTime);
        osc2.frequency.linearRampToValueAtTime(1200, ctx.currentTime + 0.4);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
        osc1.start();
        osc1.stop(ctx.currentTime + 0.42);
        osc2.start();
        osc2.stop(ctx.currentTime + 0.42);
      } else if (type === 'magic') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1174.66, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.06, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
        osc.start();
        osc.stop(ctx.currentTime + 0.21);
      }
    } catch {
      // safe fallback
    }
  }, [soundEnabled]);

  // Evaluate the standard results
  const checkRoundWinner = (p: Choice, o: Choice): GameResult => {
    if (p === o) return 'draw';
    if (
      (p === 'rock' && o === 'scissors') ||
      (p === 'paper' && o === 'rock') ||
      (p === 'scissors' && o === 'paper')
    ) {
      return 'win';
    }
    return 'lose';
  };

  // Perform opponent smart AI logic
  const getOpponentChoice = useCallback((): Choice => {
    // 1. If magic effect "Reveal" is enabled, AI tries to counter player or just pick randomly
    // Let's create an AI personality: Pipi the Squirrel 🐿️
    // If the play pattern shows trends, squirrel may defend
    if (history.length === 0) {
      const choices: Choice[] = ['rock', 'paper', 'scissors'];
      return choices[Math.floor(Math.random() * choices.length)];
    }

    // Smart prediction: see what choice player makes most and choose counter
    const playerChoices = history.map(h => h.player);
    const count = playerChoices.reduce((acc, curr) => {
      if (curr) acc[curr] = (acc[curr] || 0) + 1;
      return acc;
    }, { rock: 0, paper: 0, scissors: 0 } as Record<string, number>);

    // If opponent rage is 100%, sometimes they throw high probability rock/scissors with special quote
    if (opponentRage >= 100 && Math.random() > 0.4) {
      return 'rock'; // Squirrel throws heavy hazelnut rock
    }

    // Default heuristics:
    const rand = Math.random();
    if (rand < 0.4) {
      // Pick counter to player's most popular choice
      let mostPopular: Choice = 'rock';
      if (count.paper > count.rock && count.paper > count.scissors) mostPopular = 'paper';
      if (count.scissors > count.rock && count.scissors > count.paper) mostPopular = 'scissors';

      if (mostPopular === 'rock') return 'paper';
      if (mostPopular === 'paper') return 'scissors';
      return 'rock';
    } else if (rand < 0.7) {
      // Counter what player played in the previous round (win-stay, lose-shift strategy mimic)
      const lastPlayerChoice = history[history.length - 1].player;
      if (lastPlayerChoice === 'rock') return 'paper';
      if (lastPlayerChoice === 'paper') return 'scissors';
      if (lastPlayerChoice === 'scissors') return 'rock';
    }

    const standard: Choice[] = ['rock', 'paper', 'scissors'];
    return standard[Math.floor(Math.random() * standard.length)];

  }, [history, opponentRage]);

  // Activate Super Bears Rage Burst!
  const activateSuperPower = () => {
    if (playerRage < 100 || isSuperActive) return;
    playSfx('ultimate');
    setIsSuperActive(true);
    setBearMood('super');
    setBalloonText('🐻🔥 小熊巴魯進入【狂暴巨熊拳】狀態！下一拳威力無比，如果獲勝將能獲得雙倍得分，且自動化解對方的防御！');
  };

  // Magic Card Trinket tricks
  const triggerMagicTrinket = (trick: 'reveal' | 'shield' | 'boost') => {
    if (helperEnergy <= 0) return;
    playSfx('magic');
    setHelperEnergy(prev => prev - 1);
    setMagicEffect(trick);

    if (trick === 'reveal') {
      // Pre-calculate opponent move
      const nextOpp = getOpponentChoice();
      setOpponentChoice(nextOpp);
      setBearMood('happy');
      setBalloonText(`🔮【山林預言卡】生效！松鼠皮皮正在手縮，本輪牠將出： ${
        nextOpp === 'rock' ? '石頭拳 ✊' : nextOpp === 'paper' ? '布布掌 ✋' : '超級剪刀 ✌️'
      }。快快根據預示克制牠！`);
    } else if (trick === 'shield') {
      setBalloonText('🛡️【橡樹防護盾】開啟！本輪即使落敗，也不會扣分或丟失連勝！');
    } else if (trick === 'boost') {
      setBalloonText('⚡【金色閃光號角】已吹響！下一局獲勝能額外獲得 30 點怒氣與雙倍積分！');
    }
  };

  // Run user actual play sequence
  const executePlay = useCallback((choice: Choice) => {
    if (gameState === 'countdown' || gameState === 'reveal') return;
    playSfx('select');
    setPlayerChoice(choice);
    
    // Set up round countdown
    setGameState('countdown');
    setCountdown(3);
    
    let timerCount = 3;
    const interval = setInterval(() => {
      timerCount -= 1;
      setCountdown(timerCount);
      playSfx('tick');
      
      if (timerCount === 0) {
        clearInterval(interval);
        
        // Compute Results
        const finalOpponent = opponentChoice || getOpponentChoice();
        setOpponentChoice(finalOpponent);

        let verdict = checkRoundWinner(choice, finalOpponent);

        // Account for Rage Super Power Double Damage / Shield Magic Effect
        if (isSuperActive) {
          if (verdict === 'win') {
            // Triple boost score
            setPlayerScore(prev => prev + 2);
            setBalloonText('🐻✨ 必殺巨熊拳大成功！一拳把樹頂橡果晃下來，雙倍得分！');
          } else if (verdict === 'lose') {
            // Force Draw or half loss in ultimate
            verdict = 'draw';
            setBalloonText('🐻 狂暴爆發下，松鼠皮皮的普通防禦崩潰，強行打平！');
          }
          setIsSuperActive(false);
          setPlayerRage(0);
        }

        if (magicEffect === 'shield') {
          if (verdict === 'lose') {
            verdict = 'draw';
            setBalloonText('🛡️ 橡樹防護盾粉碎！完美抵銷了本次的失敗！');
          }
          setMagicEffect(null);
        }

        if (magicEffect === 'boost') {
          if (verdict === 'win') {
            setPlayerScore(prev => prev + 1);
            setPlayerRage(prev => Math.min(100, prev + 30));
          }
          setMagicEffect(null);
        }

        setRoundResult(verdict);
        setGameState('reveal');

        // Apply point tallies & mascot speech
        setTimeout(() => {
          if (verdict === 'win') {
            playSfx('win');
            setPlayerScore(prev => prev + 1);
            setPlayerRage(prev => Math.min(100, prev + 15));
            setOpponentRage(prev => Math.min(100, prev + 25)); // Loser gains double rage
            
            setBearMood('happy');
            setSquirrelMood('angry');
            setBalloonText('巴魯（贏）：哈哈，我太幸運了！小松果是我們的啦 🌰🏆');
            setPipiSpeech('皮皮（輸）：哼，只是風吹歪了我的發梢！下次我要狂出剪刀剪你的熊毛！');
          } else if (verdict === 'lose') {
            playSfx('lose');
            setOpponentScore(prev => prev + 1);
            setPlayerRage(prev => Math.min(100, prev + 25));
            setOpponentRage(prev => Math.min(100, prev + 15));
            
            setBearMood('sad');
            setSquirrelMood('happy');
            setBalloonText('巴魯（輸）：哎呀... 皮皮這手出得太巧妙了，巴魯拍了拍小肚肚表示佩服。');
            setPipiSpeech('皮皮（贏）：喔吼吼！森林第一拳師在下！橡果防線堅不可摧！✨🐿️');
          } else {
            playSfx('tie');
            setPlayerRage(prev => Math.min(100, prev + 10));
            setOpponentRage(prev => Math.min(100, prev + 10));
            
            setBearMood('idle');
            setSquirrelMood('giddy');
            setBalloonText('巴魯（平）：哎呀！心有靈犀，想一塊去啦！握握爪～🐾');
            setPipiSpeech('皮皮（平）：這局我們都在吹口哨，看來彼此想法驚人合拍嘛！');
          }

          // Add to Round History Log
          setHistory(prev => [
            {
              round: roundCount,
              player: choice,
              opponent: finalOpponent,
              result: verdict
            },
            ...prev
          ]);
          setRoundCount(prev => prev + 1);
          setGameState('round_end');

          // Check ultimate winner condition in Best-of-5
          if (playerScore >= 5 || opponentScore >= 5) {
            setGameState('game_over');
          }
        }, 1200);
      }
    }, 400);

  }, [gameState, opponentChoice, isSuperActive, magicEffect, playerRage, opponentRage, getOpponentChoice, playerScore, opponentScore, roundCount, playSfx]);

  // Restart Round Match Hand
  const restartRound = () => {
    playSfx('click');
    setPlayerChoice(null);
    setOpponentChoice(null);
    setRoundResult(null);
    setGameState('idle');
    setBearMood('idle');
    setSquirrelMood('idle');
    setBalloonText('加油！下一局森林對決開始！瞄準對手的局勢！✊✌️✋');
  };

  // Reset entire match scoring table
  const resetEntireGame = () => {
    playSfx('click');
    setGameState('idle');
    setPlayerChoice(null);
    setOpponentChoice(null);
    setRoundResult(null);
    setPlayerScore(0);
    setOpponentScore(0);
    setRoundCount(1);
    setHistory([]);
    setPlayerRage(0);
    setOpponentRage(0);
    setIsSuperActive(false);
    setHelperEnergy(3);
    setMagicEffect(null);
    setBearMood('idle');
    setSquirrelMood('idle');
    setBalloonText('全新的森林大作戰！這回巴魯不會再手下留情囉 🐻🌰');
    setPipiSpeech('哼！森林霸權大賽開盤，讓我皮皮來迎戰！🐿️');
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6 select-none bg-emerald-50/10 rounded-3xl border border-emerald-150/30 shadow-sm font-sans text-left">
      
      {/* Upper header action controller */}
      <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-4 rounded-2xl border border-emerald-100/50 shadow-sm gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-100 text-[#1b6b4f] rounded-xl flex items-center justify-center font-bold text-xl shadow-inner">
            🐿️
          </div>
          <div>
            <h3 className="font-sans font-bold text-xs text-stone-800 flex items-center gap-1.5">
              <span>萌寵森友猜猜拳 (Cute Pets Forest Friends RSP)</span>
              <span className="bg-emerald-100 text-[#1b6b4f] text-[10px] font-extrabold px-1.5 py-0.5 rounded-full border border-emerald-200">
                剪刀石頭布
              </span>
            </h3>
            <p className="text-[10px] text-zinc-400 font-medium mt-0.5">
              與森林小萌寵熊熊「巴魯」與松鼠「皮皮」共同展開超療癒的拳技交鋒，解鎖魔法預示与蓄力怒氣！
            </p>
          </div>
        </div>

        <div className="flex gap-3 items-center">
          <button
            onClick={() => {
              setSoundEnabled(!soundEnabled);
              playSfx('click');
            }}
            className={`p-2 rounded-full border transition-all ${soundEnabled ? 'bg-emerald-50 border-emerald-200 text-[#1b6b4f]' : 'bg-stone-50 border-stone-100 text-stone-400'}`}
            title={soundEnabled ? "開啟音效" : "關閉音效"}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Core Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Interactive Arena Panel */}
        <div className="lg:col-span-8 space-y-4">
          
          {/* Dashboard Stats */}
          <div className="grid grid-cols-3 gap-3 bg-white border border-stone-100 p-3 rounded-2xl shadow-sm text-center">
            
            {/* Bear score */}
            <div className="bg-amber-50/40 p-2.5 rounded-xl border border-amber-100 flex flex-col items-center relative">
              <span className="text-xs font-bold text-amber-900 flex items-center gap-1">
                🐻 小熊巴魯 (玩家)
              </span>
              <span className="text-xl font-mono font-black text-amber-800 mt-1">{playerScore} 分</span>
              
              {/* Rage Indicator Bar */}
              <div className="w-full bg-stone-100 h-2.5 rounded-full mt-2 overflow-hidden border">
                <div 
                  className="bg-amber-500 h-full transition-all duration-300"
                  style={{ width: `${playerRage}%` }}
                />
              </div>
              <span className="text-[9px] text-amber-600 mt-1 font-mono font-bold">怒氣值: {playerRage}%</span>
            </div>

            {/* General state panel */}
            <div className="bg-emerald-50/30 p-2.5 rounded-xl border border-emerald-100/60 flex flex-col items-center justify-center">
              <span className="text-[9.5px] uppercase font-extrabold tracking-widest text-[#1b6b4f]">當前回合</span>
              <span className="text-sm font-black font-mono text-emerald-800 mt-0.5">ROUND {roundCount}</span>
              <span className="text-[9px] text-zinc-400 mt-1">搶先達到 5 分獲勝</span>
            </div>

            {/* Squirrel score */}
            <div className="bg-emerald-50/40 p-2.5 rounded-xl border border-emerald-150 flex flex-col items-center relative">
              <span className="text-xs font-bold text-[#124b37] flex items-center gap-1">
                🐿️ 松鼠皮皮 (AI)
              </span>
              <span className="text-xl font-mono font-black text-emerald-800 mt-1">{opponentScore} 分</span>

              {/* Opponent Rage indicator bar */}
              <div className="w-full bg-stone-100 h-2.5 rounded-full mt-2 overflow-hidden border">
                <div 
                  className="bg-red-400 h-full transition-all duration-300"
                  style={{ width: `${opponentRage}%` }}
                />
              </div>
              <span className="text-[9px] text-red-500 mt-1 font-mono font-bold">怒氣值: {opponentRage}%</span>
            </div>

          </div>

          {/* Interactive Battle Stage */}
          <div className="relative bg-emerald-900/10 rounded-3xl p-6 border-4 border-emerald-900/15 shadow-md flex flex-col items-center justify-between min-h-[380px] overflow-hidden">
            
            {/* Background forest canopy look */}
            <div className="absolute inset-x-0 top-0 h-2 bg-gradient-to-b from-emerald-800/15 to-transparent pointer-events-none" />

            {/* Dual Mascot Duel visual space */}
            <div className="w-full grid grid-cols-2 gap-4 items-center justify-center py-4">
              
              {/* Player Bear Avatar Container */}
              <div className="flex flex-col items-center space-y-2 text-center">
                <div className="relative">
                  <div className={`w-20 h-20 rounded-full border-4 flex items-center justify-center text-4xl shadow-md transition-all ${
                    isSuperActive 
                      ? 'bg-amber-400 border-amber-600 scale-105 animate-pulse shadow-amber-300' 
                      : 'bg-amber-100 border-amber-200'
                  }`}>
                    {bearMood === 'happy' && '🐻✨'}
                    {bearMood === 'sad' && '🐻💧'}
                    {bearMood === 'thinking' && '🐻💭'}
                    {bearMood === 'super' && '🐻🔥'}
                    {bearMood === 'idle' && '🐻'}
                  </div>

                  {/* Super power fiery tag */}
                  {isSuperActive && (
                    <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white font-black text-[8.5px] px-2 py-0.5 rounded-full border border-red-700 animate-bounce flex items-center gap-0.5">
                      <Flame className="w-2.5 h-2.5" /> 巨熊
                    </span>
                  )}
                </div>
                <div className="text-[10px] font-extrabold text-stone-700">小熊巴魯</div>
                
                {/* Visual choice display during Reveal or round end */}
                <div className="min-h-[70px] mt-2 flex items-center justify-center">
                  <AnimatePresence mode="wait">
                    {gameState === 'countdown' && (
                      <motion.div 
                        initial={{ scale: 0.8 }} 
                        animate={{ scale: [1, 1.2, 1] }} 
                        transition={{ repeat: Infinity, duration: 0.6 }}
                        className="text-2xl bg-amber-200 p-2.5 rounded-full border border-amber-300"
                      >
                        ✊
                      </motion.div>
                    )}

                    {(gameState === 'reveal' || gameState === 'round_end') && playerChoice && (
                      <motion.div
                        key={playerChoice}
                        initial={{ scale: 0.1, y: 15 }}
                        animate={{ scale: 1, y: 0 }}
                        className={`text-4xl p-4 rounded-3xl border shadow-xl ${
                          isSuperActive 
                            ? 'bg-gradient-to-tr from-red-200 to-amber-200 border-red-400' 
                            : 'bg-white border-stone-200'
                        }`}
                      >
                        {playerChoice === 'rock' && '✊'}
                        {playerChoice === 'paper' && '✋'}
                        {playerChoice === 'scissors' && '✌️'}
                        {isSuperActive && <span className="absolute -bottom-2 translate-x-1 text-[8.5px] bg-red-600 text-white font-black px-1.5 py-0.5 rounded">炎</span>}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Opponent Squirrel Avatar Container */}
              <div className="flex flex-col items-center space-y-2 text-center">
                <div className="relative">
                  <div className={`w-20 h-20 rounded-full border-4 flex items-center justify-center text-4xl shadow-md transition-all ${
                    opponentRage >= 100 
                      ? 'bg-rose-100 border-red-400 scale-102 animate-ping shadow-lg duration-1000' 
                      : 'bg-emerald-100 border-emerald-200'
                  }`}>
                    {squirrelMood === 'happy' && '🐿️🌟'}
                    {squirrelMood === 'angry' && '🐿️💢'}
                    {squirrelMood === 'giddy' && '🐿️😆'}
                    {squirrelMood === 'suspicious' && '🐿️🔭'}
                    {squirrelMood === 'idle' && '🐿️'}
                  </div>

                  {/* Opponent Super Power Fiery Tag */}
                  {opponentRage >= 100 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-red-650 text-white font-black text-[8.5px] px-2 py-0.5 rounded-full border border-red-800 animate-pulse flex items-center gap-0.5">
                      <FlameKindling className="w-2.5 h-2.5" /> 爆裂
                    </span>
                  )}
                </div>
                <div className="text-[10px] font-extrabold text-[#1b6b4f]">松鼠皮皮</div>

                {/* Visual choice display during Reveal or round end */}
                <div className="min-h-[70px] mt-2 flex items-center justify-center">
                  <AnimatePresence mode="wait">
                    {gameState === 'countdown' && (
                      <motion.div 
                        initial={{ scale: 0.8 }} 
                        animate={{ scale: [1, 1.2, 1] }} 
                        transition={{ repeat: Infinity, duration: 0.6 }}
                        className="text-2xl bg-teal-200 p-2.5 rounded-full border border-teal-300"
                      >
                        ✊
                      </motion.div>
                    )}

                    {(gameState === 'reveal' || gameState === 'round_end') && opponentChoice && (
                      <motion.div
                        key={opponentChoice}
                        initial={{ scale: 0.1, y: 15 }}
                        animate={{ scale: 1, y: 0 }}
                        className="text-4xl p-4 rounded-3xl bg-white border border-stone-200 shadow-xl"
                      >
                        {opponentChoice === 'rock' && '✊'}
                        {opponentChoice === 'paper' && '✋'}
                        {opponentChoice === 'scissors' && '✌️'}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

            </div>

            {/* Midline Versus symbol or Countdown countdown indicator */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
              {gameState === 'countdown' && (
                <motion.div 
                  initial={{ scale: 0.1, rotate: -180 }}
                  animate={{ scale: 1.5, rotate: 0 }}
                  exit={{ scale: 0.1 }}
                  className="w-16 h-16 rounded-full bg-amber-500 border-4 border-white text-white flex items-center justify-center font-mono font-black text-3xl shadow-xl shadow-amber-200/50"
                >
                  {countdown}
                </motion.div>
              )}

              {gameState === 'reveal' && roundResult && (
                <motion.div 
                  initial={{ scale: 0.5 }}
                  animate={{ scale: 1.2 }}
                  className={`px-6 py-2.5 rounded-full border-4 shadow-2xl text-xs font-black select-none ${
                    roundResult === 'win'
                      ? 'bg-emerald-600 border-emerald-300 text-white text-sm'
                      : roundResult === 'lose'
                        ? 'bg-rose-600 border-rose-300 text-white text-sm'
                        : 'bg-stone-500 border-stone-300 text-white text-sm'
                  }`}
                >
                  {roundResult === 'win' && '🎉 玩家回合獲勝！'}
                  {roundResult === 'lose' && '💔 皮皮棋先一著！'}
                  {roundResult === 'draw' && '⚖️ 難分伯仲，平局！'}
                </motion.div>
              )}
            </div>

            {/* Round end controls */}
            {gameState === 'round_end' && (
              <div className="z-20 w-full flex justify-center py-2">
                <button
                  onClick={restartRound}
                  className="marshmallow-button bg-primary hover:bg-[#124b37] text-white font-extrabold text-xs px-6 py-3 rounded-full border-b-4 border-emerald-950 flex items-center gap-1 shadow-lg"
                >
                  <span>進行下一輪猜拳對決 ➔</span>
                </button>
              </div>
            )}

            {/* Game Over Modal Inside view parent */}
            {gameState === 'game_over' && (
              <div className="absolute inset-0 bg-stone-900/70 backdrop-blur-[2.5px] flex items-center justify-center z-30 animate-in fade-in duration-200">
                <div className="bg-white p-6 rounded-3xl border-4 border-amber-300 text-center max-w-[290px] space-y-4 shadow-2xl">
                  
                  {playerScore >= 5 ? (
                    <div className="space-y-2">
                      <span className="text-5xl block animate-bounce">🏆🐻🍒</span>
                      <h4 className="font-bold text-amber-800 text-sm">巴魯攀上森林頂峰！</h4>
                      <p className="text-[10px] text-zinc-400 font-medium leading-relaxed">
                        恭喜你！在多輪緊張刺激的對抗後，成功阻擊松鼠皮皮，守衛了一整籃的森林松果紅櫻桃！
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <span className="text-5xl block animate-pulse">🐿️🌰💥</span>
                      <h4 className="font-bold text-emerald-800 text-sm">皮皮拿到了松果皇冠！</h4>
                      <p className="text-[10px] text-zinc-400 font-medium leading-relaxed">
                        皮皮的聰慧小腦袋瓜子轉得太快了！小熊巴魯這次棋差一著，抓抓腦袋，表示還要來過！
                      </p>
                    </div>
                  )}

                  <button
                    onClick={resetEntireGame}
                    className="marshmallow-button w-full bg-primary text-white hover:bg-emerald-700 py-3 rounded-full text-xs font-bold shadow border-b-4 border-emerald-950"
                  >
                    重整旗鼓開新對決
                  </button>
                </div>
              </div>
            )}

          </div>

          {/* Quick choices board pane */}
          <div className="bg-white border border-stone-150 p-4 rounded-3xl shadow-sm space-y-3">
            <div className="flex justify-between items-center px-1">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                選擇你的手招大招:
              </span>

              {/* Rage Super Button */}
              <button
                onClick={activateSuperPower}
                disabled={playerRage < 100 || isSuperActive || gameState !== 'idle'}
                className={`py-1 px-3 rounded-full text-[9.5px] font-bold flex items-center gap-1 transition-all ${
                  playerRage >= 100 && !isSuperActive && gameState === 'idle'
                    ? 'bg-gradient-to-r from-red-500 to-amber-500 text-white animate-bounce shadow-lg border border-red-400'
                    : isSuperActive
                      ? 'bg-amber-500 border border-amber-600 text-white'
                      : 'bg-stone-50 border border-stone-100 text-stone-400 cursor-not-allowed'
                }`}
              >
                <Zap className="w-3 h-3" />
                <span>狂暴巨熊拳 ({isSuperActive ? '已加持' : playerRage >= 100 ? '可啟動' : '未滿'})</span>
              </button>
            </div>

            {/* Standard Choices Cards */}
            <div className="grid grid-cols-3 gap-3">
              {(['rock', 'paper', 'scissors'] as const).map(choice => {
                const labels = { rock: '石頭 ✊', paper: '布布 ✋', scissors: '剪刀 ✌️' };
                const isSelected = playerChoice === choice;
                return (
                  <button
                    key={choice}
                    onClick={() => executePlay(choice)}
                    disabled={gameState !== 'idle'}
                    className={`p-4 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 aspect-square transition-all duration-200 cursor-pointer ${
                      gameState !== 'idle'
                        ? 'bg-stone-50 border-stone-100 opacity-60 cursor-not-allowed'
                        : isSelected
                          ? 'bg-emerald-50 border-[#124b37] scale-98 shadow-inner'
                          : 'bg-white hover:bg-emerald-50/50 border-zinc-200 active:scale-95 shadow-sm'
                    }`}
                  >
                    <span className="text-4xl">
                      {choice === 'scissors' && '✌️'}
                      {choice === 'paper' && '✋'}
                      {choice === 'rock' && '✊'}
                    </span>
                    <span className="text-xs font-black text-stone-800">{labels[choice]}</span>
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* Right Mascot details / Settings column */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Bear speech box */}
          <div className="bg-white p-4 rounded-3xl border border-stone-100 shadow-sm space-y-4 relative overflow-hidden text-center flex flex-col items-center">
            
            <span className="text-[9px] font-bold text-amber-600 tracking-wider">小熊巴魯的提示 🐻💡</span>
            
            <div className="min-h-[55px] w-full mt-1 flex items-center justify-center">
              <div className="text-[10px] text-amber-900 bg-amber-50/60 p-3 rounded-2xl leading-relaxed border border-amber-100 relative font-medium">
                <div className="absolute w-2.5 h-2.5 bg-amber-50/60 border-b border-l border-amber-100/60 rotate-45 -bottom-1.5 left-1/2 -translate-x-1/2" />
                <span>{balloonText}</span>
              </div>
            </div>

            {/* Squirrel speech box */}
            <div className="bg-emerald-50/20 p-3 rounded-2xl border border-emerald-100/55 w-full space-y-1.5 text-left">
              <span className="text-[9.5px] font-bold text-[#1b6b4f] flex items-center gap-1">
                🐿️ 皮皮對局碎碎唸:
              </span>
              <p className="text-[10px] text-neutral-500 font-medium leading-relaxed italic">
                "{pipiSpeech}"
              </p>
            </div>
          </div>

          {/* Magic Trinket cards / Trick items (Helper energy) */}
          <div className="bg-white p-4 rounded-2xl border border-stone-100 shadow-sm space-y-3">
            <div className="flex justify-between items-center border-b pb-1">
              <span className="block text-[9.5px] font-bold text-gray-400 uppercase tracking-widest">
                山林奇術魔法卡
              </span>
              <span className="text-[9.5px] bg-[#e1f5fe] text-[#0288d1] font-extrabold px-2 py-0.5 rounded-full border border-sky-200 flex items-center gap-0.5">
                卡槽: {helperEnergy} 張
              </span>
            </div>

            <p className="text-[9.5px] text-zinc-400 leading-tight">
              耗用山林能量釋放卡牌奇術，巧妙看穿皮皮的出招、或保護自身防線！每局最多使用 3 次。
            </p>

            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => triggerMagicTrinket('reveal')}
                disabled={helperEnergy <= 0 || gameState !== 'idle' || magicEffect !== null}
                className="p-2 rounded-xl text-[9px] font-bold border border-zinc-200 hover:bg-stone-50 transition-all flex flex-col items-center text-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed"
                title="預看皮皮本局出的手勢"
              >
                <span className="text-xl">🔮</span>
                <span>天眼預知</span>
              </button>

              <button
                onClick={() => triggerMagicTrinket('shield')}
                disabled={helperEnergy <= 0 || gameState !== 'idle' || magicEffect !== null}
                className="p-2 rounded-xl text-[9px] font-bold border border-zinc-200 hover:bg-stone-50 transition-all flex flex-col items-center text-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed"
                title="抵消本回合可能產生的失利"
              >
                <span className="text-xl">🛡️</span>
                <span>松樹護盾</span>
              </button>

              <button
                onClick={() => triggerMagicTrinket('boost')}
                disabled={helperEnergy <= 0 || gameState !== 'idle' || magicEffect !== null}
                className="p-2 rounded-xl text-[9px] font-bold border border-zinc-200 hover:bg-stone-50 transition-all flex flex-col items-center text-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed"
                title="獲勝可額外獲取怒氣"
              >
                <span className="text-xl">⚡</span>
                <span>雷霆增益</span>
              </button>
            </div>

            {magicEffect && (
              <div className="bg-[#fff9c4] text-[#f57f17] p-2 rounded-xl text-[9px] font-extrabold border border-yellow-250 flex items-center gap-1.5 animate-pulse">
                <Info className="w-3.5 h-3.5 shrink-0" />
                <span>
                  當前已啟動：{
                    magicEffect === 'reveal' ? '山林天眼預知魔法' : 
                    magicEffect === 'shield' ? '重盾庇護防線' : '金色狂暴增幅'
                  }（本局結束後移除效果）
                </span>
              </div>
            )}
          </div>

          {/* Guidelines / rules */}
          <div className="bg-stone-50 p-4 rounded-2xl border border-stone-100 space-y-3">
            <span className="block text-[9px] font-bold text-[#1b6b4f] uppercase tracking-widest flex items-center gap-1 border-b pb-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>森友猜猜拳競技規約</span>
            </span>
            <ul className="text-[10px] text-gray-500 font-medium leading-relaxed space-y-1.5">
              <li>🍀 <strong>基礎規則</strong>：剪刀勝布，布勝石頭，石頭勝剪刀。雙方打平不扣不加。</li>
              <li>🍀 <strong>怒氣暴擊</strong>：每次落敗可積攢 25 點怒氣，獲勝或打平分別可積攢 15 或 10 點。</li>
              <li>🍀 <strong>終極憤怒拳</strong>：當怒氣滿 100% 時，您可以釋放「狂暴巨熊拳」，下回合大捷可爆出 2 倍積分，平局或失利能強行不敗！</li>
              <li>🍀 <strong>智慧卡牌</strong>：巧借卡牌道具預卜松鼠皮皮的手牌、或者張貼金色護盾。</li>
            </ul>
          </div>

          {/* Quick global reset utility */}
          <div className="bg-white border border-stone-150 p-3 rounded-2xl shadow-sm text-center">
            <button
              onClick={resetEntireGame}
              className="py-1.5 px-4 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 rounded-full font-bold text-[10px] flex items-center gap-1 transition-colors mx-auto"
            >
              <RotateCcw className="w-3 h-3" />
              <span>清空所有猜拳成就記錄</span>
            </button>
          </div>

        </div>

      </div>

      {/* History log entries */}
      {history.length > 0 && (
        <div className="bg-white p-4 rounded-2xl border border-stone-100 shadow-sm space-y-2 text-left">
          <span className="block text-[9px] font-bold text-gray-400 uppercase tracking-widest pb-1 border-b">
            競技猜拳交戰卷軸 (當前戰場紀錄)
          </span>
          <div className="flex flex-col gap-1.5 max-h-[140px] overflow-y-auto pr-1">
            {history.map((h, index) => (
              <div 
                key={index}
                className="flex justify-between items-center bg-stone-50 p-2 rounded-xl text-[10.5px] hover:bg-stone-100/50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[9px] bg-stone-200/60 px-1.5 py-0.5 rounded text-neutral-500 font-extrabold select-none">
                    R{h.round}
                  </span>
                  <span className="font-bold text-gray-700">
                    小熊巴魯出：{
                      h.player === 'rock' ? '✊ 石頭' : h.player === 'paper' ? '✋ 布布' : '✌️ 剪刀'
                    }
                  </span>
                  <span className="text-stone-300">|</span>
                  <span className="font-bold text-gray-600">
                    松鼠皮皮出：{
                      h.opponent === 'rock' ? '✊ 石頭' : h.opponent === 'paper' ? '✋ 布布' : '✌️ 剪刀'
                    }
                  </span>
                </div>

                <div className="flex items-center">
                  {h.result === 'win' && (
                    <span className="bg-emerald-100 text-emerald-800 font-extrabold px-2 py-0.5 rounded-full text-[9px] border border-emerald-200">
                      獲勝 🎉
                    </span>
                  )}
                  {h.result === 'lose' && (
                    <span className="bg-rose-100 text-rose-800 font-extrabold px-2 py-0.5 rounded-full text-[9px] border border-rose-200">
                      落敗 💔
                    </span>
                  )}
                  {h.result === 'draw' && (
                    <span className="bg-stone-200 text-stone-700 font-extrabold px-2 py-0.5 rounded-full text-[9px] border border-stone-300">
                      平手 ⚖️
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
