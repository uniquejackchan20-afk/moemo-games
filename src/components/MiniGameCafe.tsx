/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useTransition } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface Animal {
  name: string;
  avatar: string; // emoji or graphic
  request: string; // Recipe type
  requestIcon: string;
  requestText: string;
}

const ANIMALS: Animal[] = [
  { name: '紅熊貓 (Acoru)', avatar: '🐼', request: 'strawberry_latte', requestIcon: '🍓☕', requestText: '草莓香濃拿鐵' },
  { name: '雪白免 (Coco)', avatar: '🐰', request: 'strawberry_cake', requestIcon: '🍓🧁', requestText: '草莓甜心蛋糕' },
  { name: '小金倉鼠 (Hamy)', avatar: '🐹', request: 'choco_latte', requestIcon: '🍫☕', requestText: '巧克摩卡咖啡' },
  { name: '害羞松鼠 (Nutty)', avatar: '🐿️', request: 'choco_cake', requestIcon: '🍫🧁', requestText: '朱古力杯蛋糕' },
];

interface UpgradeItem {
  id: string;
  name: string;
  emoji: string;
  price: number;
}

const SHOP_ITEMS: UpgradeItem[] = [
  { id: 'cozy_sofa', name: '櫻花雲朵沙發', emoji: '🛋️🌸', price: 20 },
  { id: 'cute_rug', name: '馬卡龍糖果毯', emoji: '⚿🍡', price: 35 },
  { id: 'crystal_light', name: '小洋樓水晶燈', emoji: '💡👑', price: 50 },
];

export default function MiniGameCafe() {
  const [heartCoins, setHeartCoins] = useState(30); // Start with some to test!
  const [activePrepItems, setActivePrepItems] = useState<string[]>([]);
  const [customerIdx, setCustomerIdx] = useState(0);
  const [unlockedDecors, setUnlockedDecors] = useState<string[]>([]);
  const [isServing, setIsServing] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ text: string; success: boolean } | null>(null);

  const currentCustomer = ANIMALS[customerIdx];

  // Resolve active items list to product
  const resolveCurrentMix = () => {
    const hasCoffee = activePrepItems.includes('coffee');
    const hasCake = activePrepItems.includes('cake');
    const hasStrawberry = activePrepItems.includes('strawberry');
    const hasChoco = activePrepItems.includes('choco');

    if (hasCoffee && hasStrawberry) return { key: 'strawberry_latte', name: '草莓香濃拿鐵', icon: '🍓☕' };
    if (hasCoffee && hasChoco) return { key: 'choco_latte', name: '巧克摩卡咖啡', icon: '🍫☕' };
    if (hasCake && hasStrawberry) return { key: 'strawberry_cake', name: '草莓甜心蛋糕', icon: '🍓🧁' };
    if (hasCake && hasChoco) return { key: 'choco_cake', name: '朱古力杯蛋糕', icon: '🍫🧁' };

    if (activePrepItems.length > 0) {
      return { key: 'mystery', name: '神祕奇異特調', icon: '🔮' };
    }
    return null;
  };

  const currentProduct = resolveCurrentMix();

  // Add Item to mixer
  const handleAddItem = (item: string) => {
    // Avoid duplicates of basic materials
    if (!activePrepItems.includes(item)) {
      setActivePrepItems(prev => [...prev, item]);
    }
  };

  // Clear prep tray
  const handleClear = () => {
    setActivePrepItems([]);
    setFeedback(null);
  };

  // Serve client
  const handleServe = () => {
    if (!currentProduct) return;
    setIsServing(true);

    setTimeout(() => {
      const match = currentProduct.key === currentCustomer.request;
      startTransition(() => {
        if (match) {
          setHeartCoins(prev => prev + 15);
          setFeedback({
            text: `✨ 非常完美！${currentCustomer.name} 非常喜歡你的『${currentProduct.name}』！獲得 💰 15 愛心幣！`,
            success: true
          });
          // Cycle to next customer
          setTimeout(() => {
            setCustomerIdx(prev => (prev + 1) % ANIMALS.length);
            setActivePrepItems([]);
            setFeedback(null);
          }, 2000);
        } else {
          setFeedback({
            text: `😅 喔呀！${currentCustomer.name} 想要的不是這個喔... 牠想要『${currentCustomer.requestText}』！`,
            success: false
          });
        }
        setIsServing(false);
      });
    }, 800);
  };

  // Purchase decor
  const buyDecor = (item: UpgradeItem) => {
    if (heartCoins >= item.price && !unlockedDecors.includes(item.id)) {
      setHeartCoins(prev => prev - item.price);
      setUnlockedDecors(prev => [...prev, item.id]);
    }
  };

  return (
    <div className="flex flex-col bg-white p-5 rounded-3xl border-4 border-emerald-100 shadow-xl max-w-xl mx-auto select-none">
      {/* Header bar showing resources */}
      <div className="flex justify-between items-center bg-teal-50/50 p-4 rounded-2xl border border-teal-100/60 mb-4 shadow-inner">
        <span className="font-bold text-sm text-primary flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[18px]">storefront</span>
          萌萌咖啡廳・主廚模式
        </span>
        <div className="bg-amber-100/80 px-4 py-1.5 rounded-full border border-amber-300 shadow-sm flex items-center gap-1.5">
          <span className="text-sm font-bold text-amber-800">💰 愛心幣 : {heartCoins}</span>
        </div>
      </div>

      {/* Visual Workspace (Cafe Window Pane) */}
      <div className="relative w-full aspect-[16/9] rounded-2xl bg-gradient-to-b from-[#a7f3d0]/40 to-[#f2e580]/30 border-2 border-emerald-100/80 overflow-hidden shadow-inner flex flex-col justify-between p-4">
        {/* Decorative elements purchased from store */}
        <div className="absolute inset-x-0 top-0 flex justify-between px-6 pointer-events-none z-10">
          <div>
            {unlockedDecors.includes('crystal_light') && (
              <motion.div animate={{ y: [0, 4, 0] }} transition={{ repeat: Infinity, duration: 4 }} className="text-4xl filter drop-shadow">
                💡👑
              </motion.div>
            )}
          </div>
          <div className="flex gap-4">
            {unlockedDecors.includes('cute_rug') && (
              <div className="text-3xl opacity-90 filter drop-shadow-sm self-end">🍡</div>
            )}
          </div>
        </div>

        {/* Customer queue on left */}
        <div className="flex items-center gap-4 mt-6">
          <AnimatePresence mode="popLayout">
            <motion.div
              key={currentCustomer.name}
              initial={{ x: -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 100, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 100 }}
              className="flex items-center gap-3 bg-white/95 backdrop-blur-sm p-3 rounded-2xl shadow-md border border-emerald-100"
            >
              <div className="text-4xl animate-bounce">{currentCustomer.avatar}</div>
              <div>
                <p className="text-[10px] font-bold text-gray-400">「顧客」</p>
                <h4 className="font-bold text-xs text-primary">{currentCustomer.name}</h4>
                {/* Speech Bubble request */}
                <div className="mt-1 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-100 text-[11px] text-teal-800 font-bold flex items-center gap-1">
                  <span>我想喝/吃: {currentCustomer.requestIcon} {currentCustomer.requestText}</span>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Upgrade Sofa displayed inside cafe */}
        <div className="absolute right-6 bottom-4 pointer-events-none">
          {unlockedDecors.includes('cozy_sofa') ? (
            <div className="flex flex-col items-center">
              <span className="text-sm text-pink-600 bg-pink-100 border border-pink-200 px-2 py-0.5 rounded-full font-bold shadow-sm scale-75">
                櫻花座
              </span>
              <span className="text-5xl filter drop-shadow">🛋️🌸</span>
            </div>
          ) : (
            <span className="text-xs text-emerald-600/60 font-medium">（沙發位待升級）</span>
          )}
        </div>

        {/* Serving Animation Overlay */}
        {isServing && (
          <div className="absolute inset-0 bg-white/80 flex flex-col items-center justify-center gap-2 z-20">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-sm font-bold text-primary">主廚正在精心調配中... 🛎️</span>
          </div>
        )}

        {/* Prompt info */}
        <div className="absolute bottom-2 left-4 text-[10px] text-gray-500 bg-white/70 px-2 py-0.5 rounded-md">
          小叮嚀：定期完成正確訂單來點亮您的萌萌咖啡廳！
        </div>
      </div>

      {/* Control Panel: Ingredients Bar */}
      <div className="grid grid-cols-4 gap-2.5 mt-4">
        <button
          onClick={() => handleAddItem('coffee')}
          className="marshmallow-button bg-stone-100 hover:bg-stone-200 border-stone-300 p-2.5 rounded-2xl flex flex-col items-center gap-1 text-center"
        >
          <span className="text-2xl">☕</span>
          <span className="text-[10px] font-bold text-stone-700">濃縮咖啡</span>
        </button>
        <button
          onClick={() => handleAddItem('cake')}
          className="marshmallow-button bg-amber-50 hover:bg-amber-100 border-amber-300 p-2.5 rounded-2xl flex flex-col items-center gap-1 text-center"
        >
          <span className="text-2xl">🧁</span>
          <span className="text-[10px] font-bold text-amber-800">蛋糕糊</span>
        </button>
        <button
          onClick={() => handleAddItem('strawberry')}
          className="marshmallow-button bg-pink-50 hover:bg-pink-100 border-pink-300 p-2.5 rounded-2xl flex flex-col items-center gap-1 text-center"
        >
          <span className="text-2xl">🍓</span>
          <span className="text-[10px] font-bold text-pink-700">草莓糖漿</span>
        </button>
        <button
          onClick={() => handleAddItem('choco')}
          className="marshmallow-button bg-amber-950/10 hover:bg-amber-950/20 border-amber-900/30 p-2.5 rounded-2xl flex flex-col items-center gap-1 text-center"
        >
          <span className="text-2xl">🍫</span>
          <span className="text-[10px] font-bold text-amber-900">朱古力豆</span>
        </button>
      </div>

      {/* Current Mixing Bowl Tray and Serve Button */}
      <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 mt-4 flex flex-col md:flex-row justify-between items-center gap-3 shadow-inner">
        <div className="flex-grow">
          <p className="text-[10px] font-bold text-gray-400 mb-1">【當前製作托盤】</p>
          <div className="flex flex-wrap gap-1.5 min-h-[30px] items-center">
            {activePrepItems.length === 0 ? (
              <span className="text-xs text-gray-400 italic">（托盤空空如也，點擊上方原料開始）</span>
            ) : (
              activePrepItems.map(item => (
                <span key={item} className="bg-white border border-gray-200 text-xs px-2.5 py-1 rounded-full font-bold flex items-center gap-1 shadow-sm">
                  {item === 'coffee' && '☕ 咖啡'}
                  {item === 'cake' && '🧁 烤箱糊'}
                  {item === 'strawberry' && '🍓 草莓'}
                  {item === 'choco' && '🍫 巧克力'}
                </span>
              ))
            )}
          </div>
          {currentProduct && (
            <div className="mt-2 text-xs font-bold text-[#1b6b4f] flex items-center gap-1 bg-emerald-50 w-fit px-2.5 py-1 rounded-lg">
              <span>調配產物: {currentProduct.icon} {currentProduct.name}</span>
            </div>
          )}
        </div>

        {/* Action Triggers */}
        <div className="flex gap-2 shrink-0">
          <button
            onClick={handleClear}
            disabled={activePrepItems.length === 0}
            className="px-3.5 py-2 hover:bg-gray-200 rounded-full border border-gray-300 text-xs font-bold text-gray-600 cursor-pointer disabled:opacity-50"
          >
            🗑️ 清空
          </button>
          <button
            onClick={handleServe}
            disabled={activePrepItems.length === 0}
            className="marshmallow-button bg-primary text-white hover:bg-emerald-700 font-bold px-6 py-2 rounded-full text-xs flex items-center gap-1.5 border-emerald-950 disabled:opacity-50"
          >
            🛎️ 上菜！
          </button>
        </div>
      </div>

      {/* Feedback Messages */}
      {feedback && (
        <div
          className={`mt-4 rounded-xl border p-3 text-center text-xs font-bold ${
            feedback.success ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          {feedback.text}
        </div>
      )}

      {/* Upgrade Shop inside sidebar */}
      <div className="border-t border-gray-100 mt-5 pt-4">
        <h4 className="text-xs font-bold text-primary mb-3 flex items-center gap-1">
          <span className="material-symbols-outlined text-[16px] text-amber-500">upgrade</span>
          咖啡廳裝潢商店（用愛心幣購買）
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          {SHOP_ITEMS.map(item => {
            const hasBought = unlockedDecors.includes(item.id);
            const canAfford = heartCoins >= item.price;
            return (
              <button
                key={item.id}
                onClick={() => buyDecor(item)}
                disabled={hasBought || !canAfford}
                className={`flex justify-between items-center p-2.5 rounded-xl border text-xs font-bold transition-all ${
                  hasBought
                    ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                    : canAfford
                    ? 'bg-teal-50/50 border-teal-200 hover:bg-teal-50 text-teal-900 cursor-pointer'
                    : 'bg-stone-50 border-stone-200 text-stone-400 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <span>{item.emoji}</span>
                  <div className="text-left">
                    <p className="font-bold whitespace-nowrap">{item.name}</p>
                    <p className="text-[9px] text-gray-400">{hasBought ? '已買' : `💰 ${item.price}`}</p>
                  </div>
                </div>
                {!hasBought && (
                  <span className="text-[10px] text-[#1b6b4f]">購買</span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
