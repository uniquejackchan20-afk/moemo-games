/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Gamepad2, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-emerald-50 py-12 px-6 mt-16 shadow-[0_-10px_35px_-5px_rgba(242,229,128,0.1)]">
      <div className="max-w-[1240px] mx-auto flex flex-col items-center text-center gap-6">
        
        {/* Brand statement */}
        <div className="flex items-center gap-2">
          <div className="bg-[#a7f3d0] p-2 rounded-2xl">
            <Gamepad2 className="text-[#1b6b4f] w-5 h-5" />
          </div>
          <span className="font-sans font-bold text-gray-800 tracking-tight text-md">
            萌萌小遊戲
          </span>
        </div>

        <p className="max-w-md text-xs text-gray-400 font-medium leading-relaxed">
          療癒系線上小遊戲港灣。不論是軟萌的三消果凍、暖洋洋的小動物咖啡廳烘焙，還是精緻靜好、動人心弦的林中小營地，願這方天地能帶給您片刻的寧謐。
        </p>

        {/* Regulatory links */}
        <div className="flex flex-wrap gap-x-8 gap-y-2 justify-center text-xs text-gray-500 font-bold">
          <a href="#terms" className="hover:text-primary transition-colors">服務條款</a>
          <a href="#privacy" className="hover:text-primary transition-colors">隱私權政策</a>
          <a href="#faq" className="hover:text-primary transition-colors">常問問題</a>
          <a href="#contact" className="hover:text-primary transition-colors">聯繫客服</a>
        </div>

        {/* Heart logo signature */}
        <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-bold mt-4">
          <span>萌萌小遊戲團隊 製作</span>
          <Heart className="w-3 h-3 text-pink-500 fill-pink-500 animate-pulse" />
          <span>© 2026. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
}
