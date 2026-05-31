/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, startTransition } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface Tile {
  id: string;
  type: number; // 0: Strawberry Pink, 1: Lime Green, 2: Lemon Yellow, 3: Blueberry Blue, 4: Orange Peach
  isMatched?: boolean;
}

const COLORS = [
  { bg: 'bg-[#fdd0ea]', border: 'border-[#79576c]', text: '🍓', color: '#fdd0ea', name: '草莓果凍' },
  { bg: 'bg-[#a7f3d0]', border: 'border-[#1b6b4f]', text: '🍏', color: '#a7f3d0', name: '青蘋果凍' },
  { bg: 'bg-[#f3e580]', border: 'border-[#695f02]', text: '🍋', color: '#f3e580', name: '檸檬果凍' },
  { bg: 'bg-sky-200', border: 'border-sky-700', text: '🍇', color: '#bae6fd', name: '藍莓果凍' },
  { bg: 'bg-orange-200', border: 'border-orange-600', text: '🍊', color: '#fed7aa', name: '蜜橘果凍' },
];

export default function MiniGameJelly() {
  const [grid, setGrid] = useState<Tile[][]>([]);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<{ r: number; c: number } | null>(null);
  const [message, setMessage] = useState<string | null>('點擊相鄰果凍進行交換！湊滿三個同色引爆！');

  // Initialize a match-free grid
  const initGrid = () => {
    let newGrid: Tile[][] = [];
    for (let r = 0; r < 6; r++) {
      let row: Tile[] = [];
      for (let c = 0; c < 6; c++) {
        let type: number;
        // Keep choosing type until there's no initial match
        do {
          type = Math.floor(Math.random() * COLORS.length);
        } while (
          (r >= 2 && newGrid[r - 1][c].type === type && newGrid[r - 2][c].type === type) ||
          (c >= 2 && row[c - 1].type === type && row[c - 2].type === type)
        );
        row.push({
          id: `${r}-${c}-${Math.random()}`,
          type,
        });
      }
      newGrid.push(row);
    }
    setGrid(newGrid);
    setScore(0);
    setSelected(null);
    setMessage('果凍排列完畢，開始你的連線消消樂！');
  };

  useEffect(() => {
    initGrid();
  }, []);

  // Check for matches
  const checkAndClearMatches = (currentGrid: Tile[][]) => {
    let matchFound = false;
    let marked: Tile[][] = currentGrid.map(row => row.map(tile => ({ ...tile, isMatched: false })));

    // Check horizontal
    for (let r = 0; r < 6; r++) {
      for (let c = 0; c < 4; c++) {
        let t1 = marked[r][c].type;
        if (t1 === marked[r][c + 1].type && t1 === marked[r][c + 2].type) {
          marked[r][c].isMatched = true;
          marked[r][c + 1].isMatched = true;
          marked[r][c + 2].isMatched = true;
          matchFound = true;
        }
      }
    }

    // Check vertical
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 6; c++) {
        let t1 = marked[r][c].type;
        if (t1 === marked[r + 1][c].type && t1 === marked[r + 2][c].type) {
          marked[r][c].isMatched = true;
          marked[r + 1][c].isMatched = true;
          marked[r + 2][c].isMatched = true;
          matchFound = true;
        }
      }
    }

    if (matchFound) {
      // Calculate matches count
      let matchesCount = 0;
      marked.forEach(row => row.forEach(t => { if (t.isMatched) matchesCount++; }));

      // Animate cleared grid and refill
      setTimeout(() => {
        let nextGrid: Tile[][] = marked.map(row => row.map(t => t.isMatched ? { ...t, type: -1 } : t));
        
        // Let them cascade fall down
        for (let c = 0; c < 6; c++) {
          let colTiles: Tile[] = [];
          for (let r = 0; r < 6; r++) {
            if (nextGrid[r][c].type !== -1) {
              colTiles.push(nextGrid[r][c]);
            }
          }
          let needed = 6 - colTiles.length;
          let newTiles: Tile[] = [];
          for (let i = 0; i < needed; i++) {
            newTiles.push({
              id: `fall-${c}-${Date.now()}-${Math.random()}`,
              type: Math.floor(Math.random() * COLORS.length),
            });
          }
          let fullCol = [...newTiles, ...colTiles];
          for (let r = 0; r < 6; r++) {
            nextGrid[r][c] = fullCol[r];
          }
        }
        
        setScore(prev => prev + matchesCount * 10);
        setGrid(nextGrid);
        setMessage(`太棒了！消除得 ${matchesCount * 10} 分！✨`);
        
        // Recursively check for cascaded secondary matches
        setTimeout(() => checkAndClearMatches(nextGrid), 350);
      }, 300);
    }
    return matchFound;
  };

  const handleTileClick = (r: number, c: number) => {
    if (!selected) {
      setSelected({ r, c });
    } else {
      const isNeighbor =
        (Math.abs(selected.r - r) === 1 && selected.c === c) ||
        (Math.abs(selected.c - c) === 1 && selected.r === r);

      if (isNeighbor) {
        // Swap them
        const nextGrid = grid.map(row => row.map(t => ({ ...t })));
        const temp = nextGrid[selected.r][selected.c];
        nextGrid[selected.r][selected.c] = nextGrid[r][c];
        nextGrid[r][c] = temp;

        setGrid(nextGrid);
        setSelected(null);

        // Check if swap made a match
        setTimeout(() => {
          const matched = checkAndClearMatches(nextGrid);
          if (!matched) {
            // Swap back if no match made
            const rolledBackGrid = nextGrid.map(row => row.map(t => ({ ...t })));
            const tempRoll = rolledBackGrid[selected.r][selected.c];
            rolledBackGrid[selected.r][selected.c] = rolledBackGrid[r][c];
            rolledBackGrid[r][c] = tempRoll;
            setGrid(rolledBackGrid);
            setMessage('不行喔，這裡交換無法湊成消消樂！再試一次！💡');
          }
        }, 150);
      } else {
        // Select new tile if not neighbor
        setSelected({ r, c });
      }
    }
  };

  return (
    <div className="flex flex-col items-center bg-white p-6 rounded-2xl border-4 border-emerald-100 shadow-lg select-none">
      <div className="flex flex-col sm:flex-row justify-between items-center w-full gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-50 px-4 py-2 rounded-full border-2 border-primary-container flex items-center gap-2 shadow-sm">
            <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>stars</span>
            <span className="font-mono text-xl font-bold text-primary">Score: {score}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              startTransition(() => {
                initGrid();
              });
            }}
            className="marshmallow-button bg-primary text-white hover:bg-emerald-700 font-bold px-4 py-2 rounded-full flex items-center gap-2 border-emerald-800 text-sm shadow-sm"
          >
            <span className="material-symbols-outlined text-[16px]">restart_alt</span>
            重新排列
          </button>
        </div>
      </div>

      {message && (
        <div className="bg-orange-50/70 border border-orange-200 text-orange-800 rounded-xl px-4 py-2 text-xs mb-4 text-center max-w-sm">
          {message}
        </div>
      )}

      {/* 6x6 Play Grid */}
      <div className="grid grid-cols-6 gap-2 bg-emerald-50/60 p-4 rounded-3xl border-2 border-emerald-100 w-full max-w-[340px] aspect-square shadow-inner">
        {grid.map((row, r) =>
          row.map((tile, c) => {
            const colorSpec = COLORS[tile?.type] || { bg: 'bg-gray-100', border: 'border-gray-300', text: '', color: '#ddd' };
            const isSelected = selected && selected.r === r && selected.c === c;
            const isMatched = tile?.isMatched;

            return (
              <motion.div
                key={tile?.id}
                onClick={() => handleTileClick(r, c)}
                layout
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                animate={{
                  scale: isMatched ? [1, 1.2, 0] : 1,
                  opacity: isMatched ? [1, 1, 0] : 1,
                  rotate: isSelected ? [0, -3, 3, -3, 0] : 0,
                }}
                transition={{
                  duration: 0.25,
                }}
                className={`
                  aspect-square rounded-2xl flex items-center justify-center text-2xl cursor-pointer shadow-md border-b-4 transition-colors select-none relative overflow-hidden
                  ${colorSpec.bg} ${colorSpec.border}
                  ${isSelected ? 'ring-4 ring-orange-400 scale-105 border-b-2' : ''}
                `}
                id={`tile-${r}-${c}`}
              >
                {/* 3D Sheen highlight */}
                <div className="absolute top-1 left-1.5 w-1/3 h-1/6 bg-white/40 rounded-full" />
                <span>{colorSpec.text}</span>
              </motion.div>
            );
          })
        )}
      </div>

      <div className="flex justify-center gap-3 mt-4 flex-wrap text-[11px] text-gray-400 font-medium">
        {COLORS.map((col, idx) => (
          <div key={idx} className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-full border border-gray-100 shadow-sm">
            <span>{col.text}</span>
            <span>{col.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
