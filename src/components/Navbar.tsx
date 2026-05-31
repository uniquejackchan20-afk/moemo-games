/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useTransition } from 'react';
import { Search, Gamepad2, LogIn, User, LogOut, Check } from 'lucide-react';

interface NavbarProps {
  currentPage: string;
  onNavigate: (page: string, extra?: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  loggedInUser: { username: string; avatarUrl: string } | null;
  onLogin: (username: string) => void;
  onLogout: () => void;
}

const AVATARS = [
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCIbpPAVJYf9pTccLQsaOk-IYcP5Cu0unzqkpFhbn1boKQwDg66qPyufc0kD-lJ8XqTjxYRgGi18YtwZ02vDhSD3HmVB6XGZO-Iw5GYVJNs4SGjN2-6GJxXBzwV_BY4ywU9VG2crSKCj_N-_2Z7ni5ji9RLQ6jVmGb0T6U8jD5rlMSBRajuYfNCIZZic4PsKxFClQttRrL0HEZIfmlut8oxJGjd5dtxeCIUKh-n7Swuw0hs-ppsmNH_Vvonc4_hwQ2zzeezli5thFRW",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCYM1WChbAHYMPMMBB6IqLKRh344RuCgtHJQUCoQLBCBKw3yCE-aOsfbtLSEcsVDIbXUerUe4tNiXIbBtFCIOjZZifpxWJLqvQNYEECJIKecLeAWrPdQobwDxhidzAyX0AAEfYEU1nKTWrhBk1BGk5PlNyA9jhCkcjEq_NSLc2eQWtI1W7Onh5Ctnh_hQUbkXEFTEPa_bJwhghbbmaNoOE_tuNtF5sDdWGJLY9Ij7nnuvSHN-OAtuHW0xidpwgSld2kqNciIKzzweNx"
];

export default function Navbar({
  currentPage,
  onNavigate,
  searchQuery,
  onSearchChange,
  loggedInUser,
  onLogin,
  onLogout,
}: NavbarProps) {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [usernameInput, setUsernameInput] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0]);
  const [isPending, startTransition] = useTransition();

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!usernameInput.trim()) return;
    onLogin(usernameInput);
    setShowLoginModal(false);
    setUsernameInput('');
  };

  return (
    <>
      <nav className="fixed top-0 w-full z-50 bg-white/80 dark:bg-[#191c1d]/80 backdrop-blur-md shadow-[0_10px_25px_-5px_rgba(167,243,208,0.25)] h-20 transition-all duration-300">
        <div className="max-w-[1240px] mx-auto px-6 h-full flex justify-between items-center">
          
          {/* Logo brand */}
          <div 
            onClick={() => onNavigate('home')} 
            className="flex items-center gap-2 cursor-pointer group hover:scale-102 transition-transform duration-200"
          >
            <div className="bg-[#1b6b4f]-container p-2 rounded-2xl flex items-center justify-center bg-[#a7f3d0] shadow-sm transform group-hover:rotate-6 transition-transform">
              <Gamepad2 className="text-[#1b6b4f] w-6 h-6" />
            </div>
            <span className="font-heading-lg font-bold text-xl tracking-tight text-[#1b6b4f] font-sans">
              萌萌小遊戲
            </span>
          </div>

          {/* Nav Links - Desktop */}
          <div className="hidden md:flex gap-8 items-center h-full text-sm font-bold">
            <button
              onClick={() => onNavigate('home')}
              className={`pb-1 hover:text-[#1b6b4f] transition-colors cursor-pointer ${
                currentPage === 'home' 
                  ? 'text-[#1b6b4f] border-b-4 border-[#1b6b4f]' 
                  : 'text-gray-500'
              }`}
            >
              首頁
            </button>
            <button
              onClick={() => onNavigate('category')}
              className={`pb-1 hover:text-[#1b6b4f] transition-colors cursor-pointer ${
                currentPage === 'category' 
                  ? 'text-[#1b6b4f] border-b-4 border-[#1b6b4f]' 
                  : 'text-gray-500'
              }`}
            >
              遊戲分類
            </button>
            <button
              onClick={() => onNavigate('ranking')}
              className={`pb-1 hover:text-[#1b6b4f] transition-colors cursor-pointer ${
                currentPage === 'ranking' 
                  ? 'text-[#1b6b4f] border-b-4 border-[#1b6b4f]' 
                  : 'text-gray-500'
              }`}
            >
              熱門排行
            </button>
            <button
              onClick={() => onNavigate('recently-played')}
              className={`pb-1 hover:text-[#1b6b4f] transition-colors cursor-pointer ${
                currentPage === 'recently-played' 
                  ? 'text-[#1b6b4f] border-b-4 border-[#1b6b4f]' 
                  : 'text-gray-500'
              }`}
            >
              最近玩過
            </button>
          </div>

          {/* Right Header items (Search + Login) */}
          <div className="flex items-center gap-4">
            {/* Search inputs */}
            <div className="relative hidden sm:block">
              <input
                type="text"
                placeholder="搜尋可愛遊戲..."
                value={searchQuery}
                aria-label="搜尋可愛遊戲"
                onChange={(e) => {
                  onSearchChange(e.target.value);
                  // Auto redirect to category if typing on another screen to filter instantly
                  if (currentPage !== 'category' && currentPage !== 'home') {
                    onNavigate('category');
                  }
                }}
                className="bg-gray-50 border border-gray-200 focus:border-[#1b6b4f] text-xs font-medium rounded-full py-2 pl-4 pr-10 w-44 lg:w-56 focus:ring-2 focus:ring-[#a7f3d0] outline-none transition-all duration-300 shadow-inner"
              />
              <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 cursor-pointer hover:text-[#1b6b4f]" />
            </div>

            {/* User Session buttons */}
            {loggedInUser ? (
              <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 rounded-full py-1 pl-1.5 pr-4 shadow-sm hover:scale-102 transition-transform">
                <img
                  src={loggedInUser.avatarUrl}
                  alt="Avatar"
                  className="w-8 h-8 rounded-full border border-[#1b6b4f] object-cover"
                />
                <div className="text-left">
                  <p className="text-[10px] font-bold text-gray-400">登入玩家</p>
                  <p className="text-xs font-bold text-teal-900 leading-tight max-w-[80px] truncate">
                    {loggedInUser.username}
                  </p>
                </div>
                <button
                  onClick={onLogout}
                  title="登出"
                  className="ml-2 hover:text-red-500 text-gray-400 transition-colors p-1 rounded-full hover:bg-red-50"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowLoginModal(true)}
                className="marshmallow-button bg-[#1b6b4f] text-white hover:bg-emerald-700 font-bold px-6 py-2 rounded-full text-xs border-emerald-950 flex items-center gap-1 shadow-sm"
              >
                <LogIn className="w-3.5 h-3.5" />
                登入
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Cute fluffy login modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm border-4 border-[#a7f3d0] shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <h3 className="font-heading-lg text-lg font-bold text-primary mb-1 flex items-center gap-2">
              <span className="material-symbols-outlined text-[22px] text-amber-500">face</span>
              登入萌萌小遊戲
            </h3>
            <p className="text-xs text-gray-500 mb-4 bg-emerald-50/50 p-2 rounded-lg leading-relaxed">
              填寫您的暱稱，開始追蹤您的足跡，解鎖小動物咖啡廳的升級進度！
            </p>

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label htmlFor="username-input" className="block text-xs font-bold text-[#1b6b4f] mb-1.5">
                  1. 您的夢幻暱稱
                </label>
                <input
                  id="username-input"
                  type="text"
                  required
                  placeholder="如: 軟萌櫻桃子 🍒"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  maxLength={12}
                  className="w-full bg-gray-50 border-gray-200 text-xs font-bold p-3 rounded-2xl focus:ring-2 focus:ring-[#a7f3d0] focus:border-[#1b6b4f] outline-none shadow-inner"
                />
              </div>

              <div>
                <span className="block text-xs font-bold text-[#1b6b4f] mb-1.5">
                  2. 選擇森林小化身
                </span>
                <div className="flex gap-4 justify-center py-2 bg-teal-50/30 rounded-2xl border border-teal-50">
                  {AVATARS.map((av, idx) => (
                    <div
                      key={idx}
                      onClick={() => setSelectedAvatar(av)}
                      className={`relative w-14 h-14 rounded-full border-2 cursor-pointer hover:scale-105 transition-transform overflow-hidden shadow-md ${
                        selectedAvatar === av ? 'border-[#1b6b4f] ring-4 ring-emerald-200' : 'border-gray-200'
                      }`}
                    >
                      <img src={av} alt="Avatar option" className="w-full h-full object-cover" />
                      {selectedAvatar === av && (
                        <div className="absolute right-1 bottom-1 bg-[#1b6b4f] text-white p-0.5 rounded-full">
                          <Check className="w-2.5 h-2.5" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLoginModal(false)}
                  className="flex-1 py-3 text-xs font-bold text-gray-500 hover:bg-gray-100 rounded-full transition-colors border border-gray-100"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-[#1b6b4f] text-white hover:bg-emerald-700 rounded-full text-xs font-bold shadow-md border-b-4 border-emerald-950 active:translate-y-0.5 transition-all"
                >
                  確認進入 ✨
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
