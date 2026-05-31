/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useTransition } from 'react';
import { motion } from 'motion/react';

interface WoodBlock {
  id: string;
  row: number; // 0 to 4
  col: number; // 0 to 4
  size: number; // length unit
  orientation: 'h' | 'v';
  isKey?: boolean;
  color: string;
  name: string;
}

const INITIAL_BLOCKS: WoodBlock[] = [
  { id: 'key', row: 2, col: 0, size: 2, orientation: 'h', isKey: true, color: 'bg-amber-400 border-amber-600 text-amber-950', name: '🔑 關鍵金木塊' },
  { id: 'b2', row: 0, col: 2, size: 2, orientation: 'v', color: 'bg-orange-100 border-orange-300', name: '輕質松木塊' },
  { id: 'b3', row: 1, col: 3, size: 2, orientation: 'v', color: 'bg-orange-100 border-orange-300', name: '輕質檜木塊' },
  { id: 'b4', row: 4, col: 1, size: 3, orientation: 'h', color: 'bg-orange-200 border-orange-400', name: '重質橡木條' },
  { id: 'b5', row: 3, col: 0, size: 2, orientation: 'v', color: 'bg-amber-100 border-amber-300', name: '松木矮立塊' },
  { id: 'b6', row: 0, col: 0, size: 2, orientation: 'h', color: 'bg-amber-100 border-amber-300', name: '松木高平塊' },
];

export default function MiniGameWood() {
  const [blocks, setBlocks] = useState<WoodBlock[]>(INITIAL_BLOCKS);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [hasWon, setHasWon] = useState(false);
  const [moves, setMoves] = useState(0);
  const [isPending, startTransition] = useTransition();

  const resetGame = () => {
    setBlocks(JSON.parse(JSON.stringify(INITIAL_BLOCKS)));
    setSelectedBlockId(null);
    setHasWon(false);
    setMoves(0);
  };

  const getOccupiedCells = (tempBlocks: WoodBlock[], excludeId?: string) => {
    let occupied = new Set<string>();
    tempBlocks.forEach(b => {
      if (b.id === excludeId) return;
      for (let i = 0; i < b.size; i++) {
        let r = b.orientation === 'v' ? b.row + i : b.row;
        let c = b.orientation === 'h' ? b.col + i : b.col;
        occupied.add(`${r}-${c}`);
      }
    });
    return occupied;
  };

  const tryMove = (blockId: string, direction: 'up' | 'down' | 'left' | 'right') => {
    let blockIdx = blocks.findIndex(b => b.id === blockId);
    if (blockIdx === -1) return;

    let b = blocks[blockIdx];
    let newRow = b.row;
    let newCol = b.col;

    if (b.orientation === 'h') {
      if (direction === 'left') newCol -= 1;
      else if (direction === 'right') newCol += 1;
      else return; // H Blocks can only slide horizontally
    } else {
      if (direction === 'up') newRow -= 1;
      else if (direction === 'down') newRow += 1;
      else return; // V Blocks can only slide vertically
    }

    // Border constraints
    if (newRow < 0 || newCol < 0) return;
    if (b.orientation === 'v' && newRow + b.size > 5) return;
    if (b.orientation === 'h' && newCol + b.size > 5) return;

    // Grid collision constraints
    let occupied = getOccupiedCells(blocks, blockId);
    let collision = false;
    for (let i = 0; i < b.size; i++) {
      let r = b.orientation === 'v' ? newRow + i : newRow;
      let c = b.orientation === 'h' ? newCol + i : newCol;
      if (occupied.has(`${r}-${c}`)) {
        collision = true;
        break;
      }
    }

    if (!collision) {
      const nextBlocks = blocks.map((item, idx) => {
        if (idx === blockIdx) {
          return { ...item, row: newRow, col: newCol };
        }
        return item;
      });

      setBlocks(nextBlocks);
      setMoves(prev => prev + 1);

      // Check win condition (key reaches col 3, which occupies col 3 and col 4: exit!)
      const keyBlock = nextBlocks.find(item => item.id === 'key');
      if (keyBlock && keyBlock.col === 3) {
        setHasWon(true);
      }
    }
  };

  const selectedBlock = blocks.find(b => b.id === selectedBlockId);

  return (
    <div className="flex flex-col items-center bg-amber-50/20 p-5 rounded-3xl border-4 border-amber-100 shadow-xl max-w-sm mx-auto select-none">
      <div className="flex justify-between items-center w-full mb-3">
        <div className="text-xs font-bold text-amber-800 bg-amber-100 border border-amber-200 px-3 py-1 rounded-full flex items-center gap-1">
          <span className="material-symbols-outlined text-[14px]">stairs</span>
          <span>步數: {moves}</span>
        </div>
        <button
          onClick={resetGame}
          className="marshmallow-button bg-[#765469] text-white hover:bg-[#5c3d51] px-4 py-1.5 rounded-full text-xs font-bold border-stone-800 shadow-sm flex items-center gap-1"
        >
          <span className="material-symbols-outlined text-[14px]">restart_alt</span>
          重置關卡
        </button>
      </div>

      {hasWon && (
        <div className="bg-emerald-100 text-emerald-800 font-bold border border-emerald-300 rounded-xl px-4 py-2 text-xs mb-3 text-center w-full shadow-md animate-bounce">
          🎉 恭喜通關！金鑰匙滑出大門，益智挑戰成功！
        </div>
      )}

      {/* Slide Instructions */}
      <p className="text-[10px] text-gray-500 mb-4 text-center">
        💡 點擊選擇任何木塊，再點擊下方的方向箭頭來滑動它，把 🔑 金木塊移到右側出口！
      </p>

      {/* 5x5 absolute board */}
      <div className="relative w-full aspect-square bg-orange-950/20 rounded-2xl border-4 border-orange-900/40 p-1 bg-[radial-gradient(#fed7aa_1px,transparent_1px)] [background-size:16px_16px]">
        {/* Draw exit marker on golden key horizontal track (Row 2, col 4 exit) */}
        <div className="absolute right-0 top-[40%] translate-y-2 w-1.5 h-[50px] bg-amber-400 rounded-l animate-pulse z-10" />

        {/* Draw static grid guide dots */}
        <div className="grid grid-cols-5 gap-1.5 h-full w-full opacity-30 select-none">
          {Array.from({ length: 25 }).map((_, i) => (
            <div key={i} className="bg-orange-900/30 rounded-lg aspect-square" />
          ))}
        </div>

        {/* Absolute blocks layer */}
        <div className="absolute inset-1.5">
          {blocks.map(b => {
            const isSelected = selectedBlockId === b.id;
            // Block styling parameters
            const cellSpan = 18.5; // percentage per cell
            const gapSize = 1.35; // percentage gap

            const left = b.col * (cellSpan + gapSize);
            const top = b.row * (cellSpan + gapSize);
            const width = b.orientation === 'h' ? b.size * cellSpan + (b.size - 1) * gapSize : cellSpan;
            const height = b.orientation === 'v' ? b.size * cellSpan + (b.size - 1) * gapSize : cellSpan;

            return (
              <motion.div
                key={b.id}
                onClick={() => setSelectedBlockId(b.id)}
                layout
                style={{
                  left: `${left}%`,
                  top: `${top}%`,
                  width: `${width}%`,
                  height: `${height}%`,
                }}
                className={`
                  absolute rounded-xl flex flex-col items-center justify-center cursor-pointer shadow-md select-none border-b-4 text-center transition-all overflow-hidden
                  ${b.color}
                  ${isSelected ? 'ring-4 ring-orange-500 scale-[1.03] z-10' : ''}
                `}
              >
                {/* Wood grain highlight simulation */}
                <div className="absolute inset-0 bg-gradient-to-tr from-black/5 to-white/5 opacity-80 pointer-events-none" />
                {b.isKey ? (
                  <span className="text-sm font-bold animate-pulse">🔑 金</span>
                ) : (
                  <span className="text-[10px] opacity-70 font-bold whitespace-nowrap overflow-hidden text-ellipsis w-full px-1">
                    {b.orientation === 'h' ? '▬▬' : '▍'}
                  </span>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Selected Block Controls Panel */}
      <div className="w-full mt-4 bg-orange-100/40 p-3 rounded-2xl border border-orange-200 shadow-inner flex flex-col items-center select-none min-h-[105px]">
        {selectedBlock ? (
          <>
            <p className="text-[10px] font-bold text-orange-850 mb-2">
              操控: {selectedBlock.name} ({selectedBlock.orientation === 'h' ? '橫向條' : '縱向條'})
            </p>
            {/* Sliding Arrow buttons depending on direction */}
            <div className="flex gap-2.5">
              {selectedBlock.orientation === 'v' ? (
                <>
                  <button
                    onClick={() => tryMove(selectedBlock.id, 'up')}
                    className="w-10 h-10 bg-white hover:bg-orange-50 text-orange-900 border-b-2 border-orange-300 xl:active:scale-95 duration-100 rounded-full flex items-center justify-center font-bold shadow-md cursor-pointer"
                  >
                    <span className="material-symbols-outlined">arrow_upward</span>
                  </button>
                  <button
                    onClick={() => tryMove(selectedBlock.id, 'down')}
                    className="w-10 h-10 bg-white hover:bg-orange-50 text-orange-900 border-b-2 border-orange-300 xl:active:scale-95 duration-100 rounded-full flex items-center justify-center font-bold shadow-md cursor-pointer"
                  >
                    <span className="material-symbols-outlined">arrow_downward</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => tryMove(selectedBlock.id, 'left')}
                    className="w-10 h-10 bg-white hover:bg-orange-50 text-orange-900 border-b-2 border-orange-300 xl:active:scale-95 duration-100 rounded-full flex items-center justify-center font-bold shadow-md cursor-pointer"
                  >
                    <span className="material-symbols-outlined">arrow_back</span>
                  </button>
                  <button
                    onClick={() => tryMove(selectedBlock.id, 'right')}
                    className="w-10 h-10 bg-white hover:bg-orange-50 text-orange-900 border-b-2 border-orange-300 xl:active:scale-95 duration-100 rounded-full flex items-center justify-center font-bold shadow-md cursor-pointer"
                  >
                    <span className="material-symbols-outlined">arrow_forward</span>
                  </button>
                </>
              )}
            </div>
          </>
        ) : (
          <span className="text-xs text-stone-400 italic my-auto">⚠️ 請先在上方滑板中點擊選擇一塊木頭條！</span>
        )}
      </div>
    </div>
  );
}
