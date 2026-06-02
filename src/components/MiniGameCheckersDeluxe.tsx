/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, HelpCircle, Trophy, Volume2, VolumeX, RotateCcw, Award, Play, Swords, Heart, ShieldAlert, Cpu, Crown, User, RefreshCw, Palette } from 'lucide-react';

// Design interfaces
interface CheckerPiece {
  id: string;
  side: 'player' | 'opponent'; // player = Red lucky lions, opponent = Jade prosperity bunnies
  isKing: boolean;
  row: number;
  col: number;
}

interface Move {
  fromRow: number;
  fromCol: number;
  toRow: number;
  toCol: number;
  isJump: boolean;
  jumpedRow?: number;
  jumpedCol?: number;
}

interface HighScore {
  wins: number;
  losses: number;
  totalGames: number;
  piecesCaptured: number;
  kingsCrowned: number;
}

// Color theme combinations
interface BoardTheme {
  id: string;
  name: string;
  lightCell: string;
  darkCell: string;
  boardBorder: string;
  bgGradient: string;
  accessoryText: string;
}

const THEMES: BoardTheme[] = [
  {
    id: 'red_gold',
    name: '祥瑞紅金 (Imperial Red)',
    lightCell: 'bg-[#faf0df]', // Warm ivory light cells
    darkCell: 'bg-[#962529]', // Royal red dark cells
    boardBorder: 'border-[#c43339] bg-[#7a191c]',
    bgGradient: 'from-amber-50 to-orange-50/50',
    accessoryText: 'text-red-800'
  },
  {
    id: 'jade_white',
    name: '溫潤翠玉 (Mild Emerald)',
    lightCell: 'bg-[#f0f9f4]', // Warm tea-white light cells
    darkCell: 'bg-[#1e6146]', // Soft emerald dark cells
    boardBorder: 'border-[#2d8761] bg-[#11402c]',
    bgGradient: 'from-teal-50 to-emerald-50/40',
    accessoryText: 'text-emerald-800'
  },
  {
    id: 'retro_sandal',
    name: '古木沉香 (Sandalwood)',
    lightCell: 'bg-[#f4ebe1]', // Soft light bamboo
    darkCell: 'bg-[#5c3e34]', // Deep mahogany sandalwood
    boardBorder: 'border-[#825c4f] bg-[#422c24]',
    bgGradient: 'from-amber-50/70 to-stone-100',
    accessoryText: 'text-stone-800'
  }
];

export default function MiniGameCheckersDeluxe() {
  // Game states
  const [isPlaying, setIsPlaying] = useState(false);
  const [boardTheme, setBoardTheme] = useState<BoardTheme>(THEMES[0]);
  const [gameMode, setGameMode] = useState<'ai' | 'local'>('ai');
  const [aiDifficulty, setAiDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Turn states: 'player' = Active Red pieces, 'opponent' = Active Jade pieces
  const [currentTurn, setCurrentTurn] = useState<'player' | 'opponent'>('player');
  const [pieces, setPieces] = useState<CheckerPiece[]>([]);
  const [selectedPiece, setSelectedPiece] = useState<CheckerPiece | null>(null);
  const [validMoves, setValidMoves] = useState<Move[]>([]);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'victory' | 'gameover' | 'draw'>('idle');

  // Referee / Mascot mascot status words
  const [mascotWords, setMascotWords] = useState('🦁：有請各位棋士各就各位！「萌獅呈祥跳跳棋」大賽正式鳴鑼起跑！🧧');
  const [mascotMood, setMascotMood] = useState<'idle' | 'dancing' | 'thinking' | 'victory' | 'sad' | 'excited'>('idle');

  // Sparkly capture firework and crown triggers
  const [capturedParticles, setCapturedParticles] = useState<{ id: number; r: number; c: number; emoji: string }[]>([]);
  const [crownAura, setCrownAura] = useState<{ r: number; c: number } | null>(null);

  // Sound Synth Context Ref
  const soundContextRef = useRef<AudioContext | null>(null);

  // Local Statistics load / save
  const [stats, setStats] = useState<HighScore>(() => {
    return JSON.parse(localStorage.getItem('retrogames_checkers_stats') || JSON.stringify({
      wins: 0,
      losses: 0,
      totalGames: 0,
      piecesCaptured: 0,
      kingsCrowned: 0
    }));
  });

  useEffect(() => {
    localStorage.setItem('retrogames_checkers_stats', JSON.stringify(stats));
  }, [stats]);

  // Audio synths using cute oriental scales
  const playSound = (type: 'pluck' | 'muyu' | 'crown' | 'victory' | 'lost' | 'click' | 'turn') => {
    if (!soundEnabled) return;
    try {
      if (!soundContextRef.current) {
        soundContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = soundContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      const now = ctx.currentTime;

      if (type === 'pluck') {
        // High crisp Guzheng pluck frequency
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, now); // C5 note
        osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.15); // G5 note
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.26);
      } else if (type === 'muyu') {
        // Wooden temple block resonance
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(293.66, now); // D4 note
        osc.frequency.setValueAtTime(349.23, now + 0.05); // F4 note
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.2);
      } else if (type === 'crown') {
        // Sparkling brass bells for crowns
        const notes = [440, 554, 659, 880];
        notes.forEach((freq, i) => {
          const oscNode = ctx.createOscillator();
          const gainNode = ctx.createGain();
          oscNode.type = 'sine';
          oscNode.frequency.setValueAtTime(freq, now + i * 0.06);
          gainNode.gain.setValueAtTime(0.15, now + i * 0.06);
          gainNode.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.4);
          oscNode.connect(gainNode);
          gainNode.connect(ctx.destination);
          oscNode.start(now + i * 0.06);
          oscNode.stop(now + i * 0.06 + 0.45);
        });
      } else if (type === 'turn') {
        // Soft bamboo rustling turn sound
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(392, now);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.1);
      } else if (type === 'victory') {
        // Royal ancient triple bells (Pentatonic fanfare)
        const scale = [261.63, 293.66, 329.63, 392, 440, 523.25];
        for (let round = 0; round < 2; round++) {
          scale.forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq * (1 + round * 0.5), now + idx * 0.08 + round * 0.5);
            gain.gain.setValueAtTime(0.12, now + idx * 0.08 + round * 0.5);
            gain.gain.exponentialRampToValueAtTime(0.002, now + idx * 0.08 + round * 0.5 + 0.35);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now + idx * 0.08 + round * 0.5);
            osc.stop(now + idx * 0.08 + round * 0.5 + 0.4);
          });
        }
      } else if (type === 'lost') {
        // Comedic deep slide
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.linearRampToValueAtTime(70, now + 0.45);
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.46);
      } else if (type === 'click') {
        // Minor wood click
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.06);
      }
    } catch (e) {
      console.log('Synthesizer Error:', e);
    }
  };

  // Setup / Initialize Game Pieces
  const initGamePieces = () => {
    playSound('turn');
    const list: CheckerPiece[] = [];
    
    // Opponent (Jade Bunnies 🐰) at rows 0, 1, 2 on dark squares
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 8; c++) {
        if ((r + c) % 2 === 1) {
          list.push({
            id: `opp_p_${r}_${c}`,
            side: 'opponent',
            isKing: false,
            row: r,
            col: c
          });
        }
      }
    }

    // Player (Red Lions 🦁) at rows 5, 6, 7 on dark squares
    for (let r = 5; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        if ((r + c) % 2 === 1) {
          list.push({
            id: `play_p_${r}_${c}`,
            side: 'player',
            isKing: false,
            row: r,
            col: c
          });
        }
      }
    }

    setPieces(list);
    setSelectedPiece(null);
    setValidMoves([]);
    setCurrentTurn('player');
    setGameState('playing');
    setMascotMood('idle');
    setMascotWords('🦁：開局大吉！「萌仙紅獅」率先發起進攻。點擊紅獅棋子並在紅格落步！🍎');
  };

  const terminateGame = () => {
    playSound('click');
    setGameState('idle');
    setPieces([]);
    setSelectedPiece(null);
    setValidMoves([]);
    setMascotMood('idle');
    setMascotWords('🦁：有請各位棋士各就各位！「萌獅呈祥跳跳棋」大賽正式鳴鑼起跑！🧧');
  };

  // Core movement and jump captures logic
  // Calculate moves for a specific checker piece based on current board position
  const getMovesForPiece = (piece: CheckerPiece, boardState: CheckerPiece[]): Move[] => {
    const list: Move[] = [];
    const r = piece.row;
    const c = piece.col;

    // Pawns move diagonally forwards: Red moves UP (row - 1), Jade moves DOWN (row + 1). Kings can do both
    const directions: { rDir: number; cDir: number }[] = [];
    if (piece.isKing) {
      directions.push({ rDir: -1, cDir: -1 });
      directions.push({ rDir: -1, cDir: 1 });
      directions.push({ rDir: 1, cDir: -1 });
      directions.push({ rDir: 1, cDir: 1 });
    } else {
      if (piece.side === 'player') {
        directions.push({ rDir: -1, cDir: -1 });
        directions.push({ rDir: -1, cDir: 1 });
      } else {
        directions.push({ rDir: 1, cDir: -1 });
        directions.push({ rDir: 1, cDir: 1 });
      }
    }

    // Check normal slides and single jump captures
    directions.forEach(({ rDir, cDir }) => {
      const nextR = r + rDir;
      const nextC = c + cDir;

      // In bounds?
      if (nextR >= 0 && nextR < 8 && nextC >= 0 && nextC < 8) {
        const pieceAtNext = boardState.find(p => p.row === nextR && p.col === nextC);
        
        if (!pieceAtNext) {
          // Empty, normal move
          list.push({
            fromRow: r,
            fromCol: c,
            toRow: nextR,
            toCol: nextC,
            isJump: false
          });
        } else if (pieceAtNext.side !== piece.side) {
          // Opponent piece there, check if we can jump over it
          const jumpR = nextR + rDir;
          const jumpC = nextC + cDir;

          if (jumpR >= 0 && jumpR < 8 && jumpC >= 0 && jumpC < 8) {
            const pieceBehind = boardState.find(p => p.row === jumpR && p.col === jumpC);
            if (!pieceBehind) {
              // Valid jump capture!
              list.push({
                fromRow: r,
                fromCol: c,
                toRow: jumpR,
                toCol: jumpC,
                isJump: true,
                jumpedRow: nextR,
                jumpedCol: nextC
              });
            }
          }
        }
      }
    });

    return list;
  };

  // Get all valid moves for a side ('player' or 'opponent')
  const getAllMovesForSide = (side: 'player' | 'opponent', boardState: CheckerPiece[]): Move[] => {
    let all: Move[] = [];
    const sidePieces = boardState.filter(p => p.side === side);
    sidePieces.forEach(p => {
      all = all.concat(getMovesForPiece(p, boardState));
    });

    // Official rule enforcement: If jump captures exist on the board, the side MUST choose a jump capture
    const jumps = all.filter(m => m.isJump);
    if (jumps.length > 0) {
      return jumps; // Filters out only the forces
    }
    return all;
  };

  // Action: Select Piece (from grid clicks)
  const handleCellClick = (r: number, c: number) => {
    if (gameState !== 'playing') return;

    // Is there a piece of the CURRENT side at this square?
    const piece = pieces.find(p => p.row === r && p.col === c);

    if (piece) {
      if (piece.side === currentTurn) {
        playSound('click');
        setSelectedPiece(piece);
        
        // Find valid moves for this selected piece. Check if force-jump constraints apply!
        const allSideMoves = getAllMovesForSide(currentTurn, pieces);
        const pieceMoves = getMovesForPiece(piece, pieces);

        // Filter valid piece moves by the global jump-forces
        const isJumpEnforced = allSideMoves.some(m => m.isJump);
        if (isJumpEnforced) {
          // If force jump is active, keep only jumps for this piece
          setValidMoves(pieceMoves.filter(m => m.isJump));
          setMascotWords(
            currentTurn === 'player'
              ? '🦁：注意！有機會跳吃敵方棋子！根據古法跳跳棋規則，必須優先進行跳吃突襲！💥'
              : '🐰：敵方有強制跳吃步，正暗藏攻勢！'
          );
          setMascotMood('excited');
        } else {
          setValidMoves(pieceMoves);
          if (currentTurn === 'player') {
            setMascotWords(`🦁：已鎖定紅獅 [${r}, ${c}]。請點擊四周的高亮紅格，引導紅獅向前飛躚！`);
            setMascotMood('idle');
          }
        }
      }
    } else {
      // Is this clicked cell inside one of our highlighted destination steps?
      const targetMove = validMoves.find(m => m.toRow === r && m.toCol === c);
      if (targetMove && selectedPiece) {
        executeMove(targetMove);
      } else {
        // Deselect or click blank cancels
        setSelectedPiece(null);
        setValidMoves([]);
      }
    }
  };

  // Execute actual move on the board
  const executeMove = (move: Move) => {
    let list = [...pieces];
    const pieceIdx = list.findIndex(p => p.row === move.fromRow && p.col === move.fromCol);
    if (pieceIdx === -1) return;

    const currentPiece = list[pieceIdx];
    let isCrownedJustNow = false;

    // Update piece slot
    const updatedPiece = {
      ...currentPiece,
      row: move.toRow,
      col: move.toCol,
    };

    // Coronation threshold Check: Row 0 for Player, Row 7 for Opponent
    if (!currentPiece.isKing) {
      if ((currentPiece.side === 'player' && move.toRow === 0) || (currentPiece.side === 'opponent' && move.toRow === 7)) {
        updatedPiece.isKing = true;
        isCrownedJustNow = true;
        
        setCrownAura({ r: move.toRow, c: move.toCol });
        setTimeout(() => setCrownAura(null), 1500);

        // Update HighScore metrics
        if (currentPiece.side === 'player') {
          setStats(s => ({ ...s, kingsCrowned: s.kingsCrowned + 1 }));
        }
      }
    }

    list[pieceIdx] = updatedPiece;

    // Handle captures
    if (move.isJump && move.jumpedRow !== undefined && move.jumpedCol !== undefined) {
      const jumpedR = move.jumpedRow;
      const jumpedC = move.jumpedCol;
      const capturedObj = list.find(p => p.row === jumpedR && p.col === jumpedC);

      // Animation particle effects
      if (capturedObj) {
        const emoji = capturedObj.isKing ? '👑☠️' : (capturedObj.side === 'player' ? '🦁' : '🐰');
        setCapturedParticles(prev => [
          ...prev, 
          { id: Date.now(), r: jumpedR, c: jumpedC, emoji }
        ]);
        setTimeout(() => {
          setCapturedParticles(p => p.slice(1));
        }, 1200);
      }

      list = list.filter(p => !(p.row === jumpedR && p.col === jumpedC));
      playSound('muyu');

      if (currentPiece.side === 'player') {
        const blessingWords = ['喜氣騰騰！成功消滅對手一卒！', '招財進寶！吃掉敵方，好彩頭！🍉', '威震八方，瑞獅猛烈跳吃！🎉'];
        setMascotWords('🦁：' + blessingWords[Math.floor(Math.random() * blessingWords.length)]);
        setMascotMood('dancing');
        setStats(s => ({ ...s, piecesCaptured: s.piecesCaptured + 1 }));
      }
    } else {
      playSound('pluck');
    }

    if (isCrownedJustNow) {
      playSound('crown');
      setMascotWords(
        currentPiece.side === 'player'
          ? '👑✨ 獅王加冕！紅獅登上對岸寶座，受封「祥瑞棋王」，現在可任意前後飛馳啦！🎉'
          : '👑⚠️ 警報！對方玉兔抵達彼岸，獲加冠「兔王」尊榮！'
      );
      setMascotMood('excited');
    }

    setPieces(list);
    setSelectedPiece(null);
    setValidMoves([]);

    // Check Win/Loss states
    const status = checkVictoryConditions(list);
    if (status !== 'playing') {
      endGame(status);
      return;
    }

    // Switch turns
    const nextTurn = currentLevelTurn(currentPiece.side);
    setCurrentTurn(nextTurn);

    if (gameMode === 'ai' && nextTurn === 'opponent') {
      // Trigger AI strategy thread
      setTimeout(() => {
        executeAiTurn(list);
      }, 700);
    }
  };

  const currentLevelTurn = (lastOpponent: 'player' | 'opponent') => {
    return lastOpponent === 'player' ? 'opponent' : 'player';
  };

  // Check victory / deadlock states
  const checkVictoryConditions = (boardState: CheckerPiece[]): 'playing' | 'player_win' | 'opponent_win' | 'draw' => {
    const playerPieces = boardState.filter(p => p.side === 'player');
    const opponentPieces = boardState.filter(p => p.side === 'opponent');

    if (playerPieces.length === 0) return 'opponent_win';
    if (opponentPieces.length === 0) return 'player_win';

    // Verify if next active side is locked and has absolutely no valid moves
    const pendingTurn = currentTurn === 'player' ? 'opponent' : 'player';
    const activeMoves = getAllMovesForSide(pendingTurn, boardState);
    if (activeMoves.length === 0) {
      // No legal moves left! Standard tournament rule implies player with no moves left loses,
      // or we can count piece scores as tiebreaker. Let's declare the other player as the winner!
      return pendingTurn === 'player' ? 'opponent_win' : 'player_win';
    }

    return 'playing';
  };

  // High score register & wrap up
  const endGame = (outcome: 'player_win' | 'opponent_win' | 'draw') => {
    if (outcome === 'player_win') {
      playSound('victory');
      setGameState('victory');
      setMascotMood('victory');
      setMascotWords('🏆👑 萌獅大顯神威！你成功戰勝了對手，贏得「萌獅呈祥跳跳棋」金禧大賽桂冠！祝祥瑞永隨、福氣沖天！🧧🪙');
      setStats(s => ({
        ...s,
        wins: s.wins + 1,
        totalGames: s.totalGames + 1
      }));
    } else if (outcome === 'opponent_win') {
      playSound('lost');
      setGameState('gameover');
      setMascotMood('sad');
      setMascotWords('🦁 惜敗一招！對手玉兔棋力高深，暫奪冠軍。勝敗乃兵家常事，快快重整思路，下一盤必定鴻運當頭！💡');
      setStats(s => ({
        ...s,
        losses: s.losses + 1,
        totalGames: s.totalGames + 1
      }));
    } else {
      playSound('pluck');
      setGameState('draw');
      setMascotWords('🦁 均勢成和！雙方握手言和，實乃圍棋雅量、棋局大和局！祝和氣生財！🍂');
      setStats(s => ({
        ...s,
        totalGames: s.totalGames + 1
      }));
    }
  };

  // --- BRAIN ENGINE: HEURISTICS AI ---
  const executeAiTurn = (boardState: CheckerPiece[]) => {
    const aiMoves = getAllMovesForSide('opponent', boardState);
    if (aiMoves.length === 0) {
      endGame('player_win');
      return;
    }

    setMascotWords('🐰：玉兔正在凝神思索、觀照棋局奧妙中... 🍃');
    setMascotMood('thinking');

    // Pick a move depending on difficulty
    let chosenMove: Move | null = null;

    if (aiDifficulty === 'easy') {
      // Pick completely random
      chosenMove = aiMoves[Math.floor(Math.random() * aiMoves.length)];
    } else if (aiDifficulty === 'medium') {
      // Strategic scoring moves heuristic
      chosenMove = evaluateMediumAiMove(aiMoves, boardState);
    } else {
      // MiniMax Alpha-Beta search deep evaluation!
      chosenMove = evaluateHardAiMove(aiMoves, boardState);
    }

    if (chosenMove) {
      const move = chosenMove;
      setTimeout(() => {
        executeMove(move);
      }, 500);
    }
  };

  // Heuristic Scoring for Medium AI
  const evaluateMediumAiMove = (moves: Move[], boardState: CheckerPiece[]): Move => {
    // Priority 1: Jumps are already prioritized by `getAllMovesForSide` which limits them
    let bestScore = -9999;
    let candidates: Move[] = [];

    moves.forEach(m => {
      let score = 0;

      // Prefer jumps
      if (m.isJump) {
        score += 50;
      }

      // Promote to King!
      if (m.toRow === 7) {
        score += 30;
      }

      // Center control (Cols 2, 3, 4, 5 are premium territory)
      if (m.toCol >= 2 && m.toCol <= 5) {
        score += 2;
      }

      // Safe outer edges where pieces cannot be jumped (cols 0 and 7)
      if (m.toCol === 0 || m.toCol === 7) {
        score += 4;
      }

      // Avoid exposing this piece to immediate player capture (if possible to calculate simply)
      // Standard easy lookup: If landing cell can be captured, penalize
      const simulatedBoard = applySimulatedMove(m, boardState);
      const playerReplies = getAllMovesForSide('player', simulatedBoard);
      const isExposed = playerReplies.some(reply => reply.isJump && reply.jumpedRow === m.toRow && reply.jumpedCol === m.toCol);
      if (isExposed) {
        score -= 15;
      }

      if (score > bestScore) {
        bestScore = score;
        candidates = [m];
      } else if (score === bestScore) {
        candidates.push(m);
      }
    });

    return candidates[Math.floor(Math.random() * candidates.length)];
  };

  // MiniMax Search Evaluator for Hard AI (Depth 3 Alpha-Beta lookahead)
  const evaluateHardAiMove = (moves: Move[], boardState: CheckerPiece[]): Move => {
    let bestVal = -99999;
    let bestMove = moves[0];

    // Evaluate each option by launching minimax search recursion
    moves.forEach(m => {
      const nextBoard = applySimulatedMove(m, boardState);
      // Minimax values: AI maximises positive score, player minimizes it
      const moveVal = minimax(nextBoard, 3, -100000, 100000, false);
      if (moveVal > bestVal) {
        bestVal = moveVal;
        bestMove = m;
      }
    });

    return bestMove;
  };

  // Standard minimax with Alpha-Beta pruning
  const minimax = (
    board: CheckerPiece[],
    depth: number,
    alpha: number,
    beta: number,
    isMaximising: boolean
  ): number => {
    // Base evaluations
    if (depth === 0) {
      return evaluateBoardScore(board);
    }

    const playerPieces = board.filter(p => p.side === 'player');
    const opponentPieces = board.filter(p => p.side === 'opponent');
    if (playerPieces.length === 0) return 99999; // AI win
    if (opponentPieces.length === 0) return -99999; // Player win

    if (isMaximising) {
      let maxEval = -99999;
      const moves = getAllMovesForSide('opponent', board);
      if (moves.length === 0) return -99999; // Draw/stalemated

      for (let i = 0; i < moves.length; i++) {
        const nextB = applySimulatedMove(moves[i], board);
        const evaluation = minimax(nextB, depth - 1, alpha, beta, false);
        maxEval = Math.max(maxEval, evaluation);
        alpha = Math.max(alpha, evaluation);
        if (beta <= alpha) break; // Cutoff
      }
      return maxEval;
    } else {
      let minEval = 99999;
      const moves = getAllMovesForSide('player', board);
      if (moves.length === 0) return 99999;

      for (let i = 0; i < moves.length; i++) {
        const nextB = applySimulatedMove(moves[i], board);
        const evaluation = minimax(nextB, depth - 1, alpha, beta, true);
        minEval = Math.min(minEval, evaluation);
        beta = Math.min(beta, evaluation);
        if (beta <= alpha) break;
      }
      return minEval;
    }
  };

  // Static board evaluator
  const evaluateBoardScore = (board: CheckerPiece[]): number => {
    let score = 0;

    board.forEach(p => {
      const weight = p.isKing ? 30 : 10;
      let positionalBonus = 0;

      if (p.side === 'opponent') {
        // AI Side
        score += weight;
        
        // Push pawns towards row 7 to become Kings
        if (!p.isKing) {
          positionalBonus += p.row; // row 0 to 7 (higher is closer to player side)
        }
        // Center occupation
        if (p.col >= 2 && p.col <= 5) {
          positionalBonus += 2;
        }
        score += positionalBonus;

      } else {
        // Player Side
        score -= weight;

        if (!p.isKing) {
          positionalBonus += (7 - p.row); // row 7 to 0 (lower row is closer to AI crown limits)
        }
        if (p.col >= 2 && p.col <= 5) {
          positionalBonus += 2;
        }
        score -= positionalBonus;
      }
    });

    return score;
  };

  // Helper simulator updates
  const applySimulatedMove = (m: Move, boardState: CheckerPiece[]): CheckerPiece[] => {
    let copy = boardState.map(p => ({ ...p }));
    const pIdx = copy.findIndex(p => p.row === m.fromRow && p.col === m.fromCol);
    if (pIdx !== -1) {
      const p = copy[pIdx];
      let isKingNow = p.isKing;
      if ((p.side === 'player' && m.toRow === 0) || (p.side === 'opponent' && m.toRow === 7)) {
        isKingNow = true;
      }
      copy[pIdx] = {
        ...p,
        row: m.toRow,
        col: m.toCol,
        isKing: isKingNow
      };
    }

    if (m.isJump && m.jumpedRow !== undefined && m.jumpedCol !== undefined) {
      copy = copy.filter(p => !(p.row === m.jumpedRow && p.col === m.jumpedCol));
    }

    return copy;
  };

  return (
    <div className="p-4 md:p-6 text-slate-800 text-left relative max-w-[1100px] mx-auto animate-in fade-in duration-300">
      
      {/* Title & Stats Ribbon */}
      <div className="bg-gradient-to-r from-red-900 via-yellow-950 to-red-900 p-4 rounded-3xl border-2 border-red-700 shadow-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-yellow-100 relative overflow-hidden">
        <div className="absolute inset-0 bg-white/[0.03] pointer-events-none"></div>
        
        <div className="space-y-1 z-10">
          <div className="flex items-center gap-2">
            <span className="bg-amber-400 text-red-950 text-[10px] uppercase font-black px-2 py-0.5 rounded-full tracking-wider animate-pulse">
              Deluxe Checkers
            </span>
            <span className="text-[10px] text-yellow-300 font-extrabold">• 萌獅呈祥跳跳棋 🦁🐰</span>
          </div>
          <h2 className="text-xl md:text-2xl font-black tracking-tight flex items-center gap-2 font-serif">
            神獸宮廷棋・大吉版
          </h2>
        </div>

        {/* Global Record Panel */}
        <div className="flex gap-2 text-xs font-bold z-10 shrink-0">
          <div className="bg-red-950/80 border border-yellow-600/30 px-3 py-1.5 rounded-2xl flex flex-col justify-center text-center shadow-inner min-w-[75px]">
            <span className="text-[8px] text-yellow-400 font-extrabold tracking-wider block">勝場 WINS</span>
            <span className="text-sm font-black text-amber-300 font-mono">{stats.wins}</span>
          </div>
          <div className="bg-red-950/80 border border-red-800 px-3 py-1.5 rounded-2xl flex flex-col justify-center text-center shadow-inner min-w-[75px]">
            <span className="text-[8px] text-red-300 font-extrabold tracking-wider block">敗場 LOSS</span>
            <span className="text-sm font-black text-rose-300 font-mono">{stats.losses}</span>
          </div>
          <div className="bg-red-950/80 border border-yellow-600/30 px-3 py-1.5 rounded-2xl flex flex-col justify-center text-center shadow-inner min-w-[75px]">
            <span className="text-[8px] text-yellow-400 font-extrabold tracking-wider block">超渡消子 CAP</span>
            <span className="text-sm font-black text-amber-200 font-mono">🏆 {stats.piecesCaptured}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start mt-6">
        
        {/* Left Section: Checker Board Grid inside Traditional Hand Scrolls layout */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          
          {/* Mascot dialog box banner */}
          <div className="bg-white rounded-3xl border border-slate-100 p-4 shadow-sm flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <motion.div
                animate={
                  mascotMood === 'dancing'
                    ? { y: [0, -12, 0], rotate: [0, 15, -15, 0] }
                    : mascotMood === 'victory'
                    ? { scale: [1, 1.25, 0.95, 1.15, 1], rotate: [0, 360, 0] }
                    : mascotMood === 'thinking'
                    ? { rotate: [0, 10, -10, 0] }
                    : mascotMood === 'sad'
                    ? { y: [0, 3, 0], opacity: [1, 0.6, 1] }
                    : { y: [0, -3, 0] }
                }
                transition={
                  mascotMood === 'dancing'
                    ? { repeat: Infinity, duration: 0.65 }
                    : mascotMood === 'idle'
                    ? { repeat: Infinity, duration: 2.2, ease: 'easeInOut' }
                    : { duration: 0.9 }
                }
                className="text-4xl shrink-0 cursor-pointer"
                onClick={() => {
                  playSound('muyu');
                  setMascotMood('dancing');
                  setTimeout(() => setMascotMood('idle'), 1500);
                }}
              >
                🦁
              </motion.div>
              <div className="space-y-0.5">
                <span className="bg-amber-400 text-red-950 text-[8px] font-black px-1.5 py-0.5 rounded-full inline-block">
                  金仙裁判：喜瑞獅王
                </span>
                <p className="text-[11px] md:text-xs font-black text-slate-700 leading-normal">
                  {mascotWords}
                </p>
              </div>
            </div>

            {/* Turn Marker indicator */}
            {gameState === 'playing' && (
              <div className="shrink-0 flex items-center gap-1.5 bg-slate-50 border px-3 py-1.5 rounded-2xl">
                <span className="text-[9px] font-black uppercase text-slate-400 block mr-1">
                  當前回合
                </span>
                <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[10px] ${
                  currentTurn === 'player' ? 'bg-red-600 text-white' : 'bg-emerald-600 text-white'
                }`}>
                  {currentTurn === 'player' ? '🦁' : '🐰'}
                </span>
                <span className="text-[10px] font-black text-slate-800">
                  {currentTurn === 'player' ? '紅獅' : '玉兔'}
                </span>
              </div>
            )}
          </div>

          {/* Core Checker-Board Graphic cabinet */}
          <div className="bg-[#2a130f] rounded-3xl p-3 md:p-6 border-4 border-amber-800 shadow-2xl relative select-none">
            
            {/* Visual Traditional Paper-cut Scroll Frames */}
            <div className="absolute inset-2 border-2 border-red-900 pointer-events-none opacity-40 rounded-2xl"></div>
            <div className="absolute inset-3 border border-amber-700 pointer-events-none opacity-25 rounded-2xl"></div>

            {/* Checker Board Wrapper */}
            <div className={`p-1.5 rounded-2xl ${boardTheme.boardBorder} relative shadow-inner overflow-hidden`}>
              
              {/* Captured piece floating particle animations */}
              <AnimatePresence>
                {capturedParticles.map(p => (
                  <motion.div
                    key={p.id}
                    initial={{ scale: 1.5, opacity: 1, y: 0, rotate: 0 }}
                    animate={{ scale: [1.5, 3, 0], opacity: [1, 1, 0], y: -80, rotate: 360 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.2, ease: 'easeOut' }}
                    className="absolute z-50 text-4xl select-none"
                    style={{
                      left: `calc(${p.c} * 12.5% + 4%)`,
                      top: `calc(${p.r} * 12.5% + 4%)`,
                    }}
                  >
                    🚀 {p.emoji}
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Coronation highlight crown effect */}
              {crownAura && (
                <div 
                  className="absolute pointer-events-none animate-ping z-30 bg-amber-400/40 rounded-full w-14 h-14 translate-x-[-15%] translate-y-[-15%]"
                  style={{
                    left: `calc(${crownAura.c} * 12.5% + 6.25%)`,
                    top: `calc(${crownAura.r} * 12.5% + 6.25%)`,
                  }}
                ></div>
              )}

              {/* Main 8x8 squares grid container */}
              <div className="grid grid-cols-8 grid-rows-8 aspect-square w-full rounded-xl overflow-hidden relative">
                {Array.from({ length: 64 }).map((_, slotIdx) => {
                  const rIdx = Math.floor(slotIdx / 8);
                  const cIdx = slotIdx % 8;
                  const isDark = (rIdx + cIdx) % 2 === 1;
                  const cellColor = isDark ? boardTheme.darkCell : boardTheme.lightCell;
                  
                  // Piece rendering
                  const currentPiece = pieces.find(p => p.row === rIdx && p.col === cIdx);
                  const isPieceSelected = selectedPiece?.id === currentPiece?.id;

                  // Valid move target?
                  const isMoveTarget = validMoves.some(m => m.toRow === rIdx && m.toCol === cIdx);
                  const associatedMove = validMoves.find(m => m.toRow === rIdx && m.toCol === cIdx);

                  return (
                    <div
                      key={`cell_${rIdx}_${cIdx}`}
                      onClick={() => handleCellClick(rIdx, cIdx)}
                      className={`aspect-square relative flex items-center justify-center cursor-pointer transition-all duration-150 ${cellColor} ${
                        isMoveTarget ? 'ring-2 ring-amber-300 ring-inset bg-amber-400/40' : ''
                      }`}
                    >
                      {/* Interactive Coordinates */}
                      <span className="absolute bottom-0.5 right-1 text-[7px] text-black/20 font-mono select-none">
                        {String.fromCharCode(65 + cIdx)}{8 - rIdx}
                      </span>

                      {/* Valid target spot glow indicator */}
                      {isMoveTarget && (
                        <div className={`absolute rounded-full w-2.5 h-2.5 bg-yellow-400 animate-pulse ring-4 ring-yellow-300 shadow-[0_0_12px_#fbbf24] ${
                          associatedMove?.isJump ? 'bg-red-500 ring-red-400 shadow-[0_0_15px_#f87171] scale-125' : ''
                        }`}></div>
                      )}

                      {/* Checker piece display */}
                      {currentPiece && (
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          className={`w-4/5 h-4/5 rounded-full flex flex-col items-center justify-center relative shadow-lg ${
                            currentPiece.side === 'player'
                              ? 'bg-gradient-to-b from-red-500 via-red-600 to-red-800 border-2 border-yellow-400 shadow-red-950/40'
                              : 'bg-gradient-to-b from-emerald-500 via-emerald-600 to-emerald-800 border-2 border-slate-100 shadow-emerald-950/40'
                          } ${
                            isPieceSelected 
                              ? 'ring-4 ring-yellow-400 scale-105 z-10 brightness-110 shadow-xl' 
                              : ''
                          }`}
                        >
                          {/* King crowns styling */}
                          {currentPiece.isKing && (
                            <div className="absolute -top-3.5 z-10 filter drop-shadow">
                              <Crown className="w-5 h-5 text-yellow-300 fill-yellow-400 animate-bounce" />
                            </div>
                          )}

                          {/* Standard Mascot Emoji */}
                          <span className="text-xl md:text-2xl pt-0.5">
                            {currentPiece.side === 'player' ? '🦁' : '🐰'}
                          </span>

                          {/* Subtitle wording */}
                          <span className="text-[6.5px] tracking-tighter text-white font-extrabold leading-tight">
                            {currentPiece.isKing ? '棋王' : (currentPiece.side === 'player' ? '紅獅' : '玉兔')}
                          </span>
                        </motion.div>
                      )}
                    </div>
                  );
                })}
              </div>

            </div>

            {/* Big overlay screens (Idle start, victory, gameover) */}
            {gameState !== 'playing' && (
              <div className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center text-center p-6 z-40 rounded-3xl border border-red-900">
                <AnimatePresence>
                  {gameState === 'idle' && (
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="space-y-6 max-w-md p-6 bg-red-950 rounded-3xl border border-red-700/60 text-yellow-100 shadow-2xl"
                    >
                      <div className="text-6xl animate-bounce">🦁🆚🐰</div>
                      
                      <div className="space-y-2">
                        <h3 className="text-2xl font-black font-serif text-yellow-300">
                          萌獅呈祥跳跳棋 大囍合
                        </h3>
                        <p className="text-xs text-red-200">
                          指掌之間祥光曜，點兵點將分輸贏！帶領威風凜凜的「萌仙紅獅」，戰勝仙山萌閣的「玉兔仙子」。
                        </p>
                      </div>

                      {/* Configurations Selector inside Cabinet */}
                      <div className="bg-red-900/65 rounded-2xl p-4 border border-red-800 flex flex-col gap-4 text-left">
                        
                        {/* Mode selectors */}
                        <div className="space-y-1">
                          <span className="text-[10px] text-red-300 font-extrabold tracking-widest block uppercase">
                            遊戲模式 SELECT MODE
                          </span>
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              onClick={() => { playSound('click'); setGameMode('ai'); }}
                              className={`py-2 px-3 rounded-xl hover:bg-red-800 text-xs font-black border transition-all text-center flex items-center justify-center gap-1 cursor-pointer ${
                                gameMode === 'ai' 
                                  ? 'bg-yellow-400 text-red-950 border-yellow-500' 
                                  : 'bg-red-950 border-red-800 text-yellow-100/80'
                              }`}
                            >
                              <Cpu className="w-3.5 h-3.5" />
                              <span>神獸人機對戰</span>
                            </button>
                            <button
                              onClick={() => { playSound('click'); setGameMode('local'); }}
                              className={`py-2 px-3 rounded-xl hover:bg-red-800 text-xs font-black border transition-all text-center flex items-center justify-center gap-1 cursor-pointer ${
                                gameMode === 'local' 
                                  ? 'bg-yellow-400 text-red-950 border-yellow-500' 
                                  : 'bg-red-950 border-red-800 text-yellow-100/80'
                              }`}
                            >
                              <Swords className="w-3.5 h-3.5" />
                              <span>同屏雙人博弈</span>
                            </button>
                          </div>
                        </div>

                        {/* Difficulty selecors (if AI mode) */}
                        {gameMode === 'ai' && (
                          <div className="space-y-1">
                            <span className="text-[10px] text-red-300 font-extrabold tracking-widest block uppercase">
                              對手難度 DIFFICULTY
                            </span>
                            <div className="grid grid-cols-3 gap-1.5 text-center">
                              {(['easy', 'medium', 'hard'] as const).map(level => {
                                const names = { easy: '初學小獅', medium: '手談弟子', hard: '棋聖仙鶴' };
                                const colors = { easy: 'hover:text-amber-300', medium: 'hover:text-yellow-300', hard: 'hover:text-rose-300' };
                                return (
                                  <button
                                    key={level}
                                    onClick={() => { playSound('click'); setAiDifficulty(level); }}
                                    className={`py-1.5 px-1.5 rounded-lg text-[10px] font-black border uppercase transition-all cursor-pointer ${colors[level]} ${
                                      aiDifficulty === level
                                        ? 'bg-red-700 text-yellow-200 border-amber-400'
                                        : 'bg-red-950 border-red-800 text-red-300/60'
                                    }`}
                                  >
                                    {names[level]}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}

                      </div>

                      <button
                        onClick={initGamePieces}
                        className="w-full bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-300 hover:brightness-110 active:translate-y-0.5 text-red-950 font-black py-3 px-6 rounded-2xl text-sm shadow-xl border border-amber-500 cursor-pointer flex items-center justify-center gap-2"
                      >
                        <Play className="w-4 h-4 text-red-950 fill-red-950" />
                        <span>擂鼓開局 START GAME</span>
                      </button>
                    </motion.div>
                  )}

                  {/* Victory outcome banner */}
                  {gameState === 'victory' && (
                    <motion.div
                      initial={{ scale: 0.6, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="space-y-4 max-w-sm p-6 bg-red-950 border-4 border-yellow-400 rounded-3xl text-yellow-200 shadow-2xl relative"
                    >
                      <div className="text-6xl animate-bounce">🏆🦁✨</div>
                      <h3 className="text-2xl font-serif font-black text-yellow-300 leading-tight">
                        吉慶高照！榮獲魁首！
                      </h3>
                      <p className="text-xs text-red-200">
                        紅獅歡騰起舞，大敗玉兔棋仙。已獲取 +118 銅錢吉運！在神獸排行榜中名列前行！
                      </p>
                      <button
                        onClick={initGamePieces}
                        className="w-full bg-yellow-400 hover:bg-yellow-300 text-red-950 py-2.5 px-6 rounded-2xl text-xs font-black shadow-lg cursor-pointer"
                      >
                        再戰一局 AGAIN
                      </button>
                    </motion.div>
                  )}

                  {/* Fail outcome banner */}
                  {gameState === 'gameover' && (
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="space-y-4 max-w-sm p-6 bg-stone-900 border border-stone-800 rounded-3xl text-stone-200 shadow-2xl"
                    >
                      <div className="text-6xl">🐰🍂💡</div>
                      <h3 className="text-xl font-serif font-black text-amber-500 leading-tight">
                        棋差一招・勝敗常在
                      </h3>
                      <p className="text-xs text-stone-400">
                        對方玉兔技高一籌。神仙對弈，和氣大局！休整數秒，重新排兵列陣！
                      </p>
                      <button
                        onClick={initGamePieces}
                        className="w-full bg-amber-500 hover:bg-amber-400 text-red-950 py-2.5 px-6 rounded-2xl text-xs font-black shadow-lg cursor-pointer"
                      >
                        重整旗鼓 AGAIN
                      </button>
                    </motion.div>
                  )}

                  {/* Draw score outcome */}
                  {gameState === 'draw' && (
                    <motion.div
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      className="space-y-4 max-w-sm p-6 bg-stone-900 rounded-3xl text-amber-200"
                    >
                      <div className="text-6xl">🤝🍂</div>
                      <h3 className="text-xl font-serif font-black">
                        不分軒輊・握手言和
                      </h3>
                      <p className="text-xs text-stone-300">
                        妙棋橫生，秋毫未犯。實乃頂峰手談之局！
                      </p>
                      <button
                        onClick={initGamePieces}
                        className="w-full bg-amber-500 hover:bg-amber-400 text-red-950 py-2.5 px-6 rounded-2xl text-xs font-black shadow-lg cursor-pointer"
                      >
                        重啟切磋 AGAIN
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

          </div>

          {/* Manual controls buttons footer */}
          {gameState === 'playing' && (
            <div className="bg-red-900 p-4 rounded-3xl border-2 border-red-800 text-center flex flex-wrap justify-between items-center gap-3">
              <div className="text-xs text-red-100 font-bold flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></span>
                <span>棋局正常運作中... 紅黃棋子輪替交替進行，遵循斜退或斜進法則</span>
              </div>
              <button
                onClick={terminateGame}
                className="bg-black/40 hover:bg-black/60 border border-red-700 hover:border-red-600 text-[11px] font-black text-yellow-300 py-2.5 px-5 rounded-xl transition-all cursor-pointer flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>投子认输 (QUIT)</span>
              </button>
            </div>
          )}

        </div>

        {/* Right column: Configurations, instructions and sound switches */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Sound switches and profile settings */}
          <div className="bg-white border border-slate-100 rounded-3xl p-4 flex justify-between items-center shadow-sm">
            <div className="space-y-0.5">
              <span className="text-xs font-black text-slate-800 block">嗩吶音效</span>
              <p className="text-[9px] text-slate-400 font-semibold">開啟宮廷古琴傳統手琴及木魚模擬音效</p>
            </div>
            <button
              onClick={() => {
                setSoundEnabled(prev => !prev);
                playSound('pluck');
              }}
              className="p-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all border border-slate-100 text-slate-600 cursor-pointer"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-600" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
            </button>
          </div>

          {/* Traditional Palace Theme Config */}
          <div className="bg-white border border-slate-100 rounded-3xl p-4 shadow-sm space-y-3">
            <h4 className="text-xs font-black text-slate-800 flex items-center gap-1.5 border-b pb-2">
              <Palette className="w-4 h-4 text-red-600" />
              宮廷棋盤漆色調色盤
            </h4>
            <div className="grid grid-cols-1 gap-2">
              {THEMES.map(theme => (
                <button
                  key={theme.id}
                  onClick={() => {
                    playSound('click');
                    setBoardTheme(theme);
                  }}
                  className={`w-full py-2.5 px-3 rounded-xl border text-[11px] font-black flex items-center justify-between transition-all cursor-pointer ${
                    boardTheme.id === theme.id
                      ? 'border-yellow-500 bg-amber-50 text-amber-950 font-black shadow-inner shadow-yellow-500/10'
                      : 'border-slate-100 bg-slate-50 hover:bg-slate-100/60 text-slate-600'
                  }`}
                >
                  <span>{theme.name}</span>
                  <div className="flex gap-1 shrink-0">
                    <span className="w-4 h-4 rounded border" style={{ backgroundColor: theme.lightCell.replace('bg-[', '').replace(']', '') }}></span>
                    <span className="w-4 h-4 rounded border" style={{ backgroundColor: theme.darkCell.replace('bg-[', '').replace(']', '') }}></span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Quick Retro Guide */}
          <div className="bg-amber-50/50 border border-amber-200/60 rounded-3xl p-4 shadow-sm text-xs text-amber-900/90 leading-relaxed font-semibold">
            <h4 className="font-black text-amber-950 flex items-center gap-1 mb-1 shadow-none">
              <HelpCircle className="w-4 h-4 text-amber-700" />
              「西洋跳棋」宮廷棋規秘籍：
            </h4>
            <ul className="list-disc pl-4 space-y-1 text-[10.5px]">
              <li><strong>行棋規則</strong>：所有萌獅與玉兔棋子均可在 <strong>深色格</strong> Diagonal（斜線）前行。</li>
              <li><strong>跳吃捕掠</strong>：若鄰格存在敵軍棋子，且其背後斜格空無一子，即可 <strong>跳過其上進行捕殺</strong>！</li>
              <li><strong>大吉棋王 Coronation</strong>：棋子若奮勇殺敵抵達對手最底一排，即可 <strong>受封「👑 棋王」</strong>！棋王不受前後束縛，能任意四面斜行！</li>
              <li><strong>棋力高低</strong>：人機仙人對抗共有3大難度，仙鶴棋王更支持 MiniMax 電子算力思維哦！</li>
            </ul>
          </div>

        </div>

      </div>
    </div>
  );
}
