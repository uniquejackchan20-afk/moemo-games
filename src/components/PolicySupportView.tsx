/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FileText, Shield, HelpCircle, Headphones, Send, Sparkles, CheckCircle2, ChevronDown, Gamepad2, ArrowRight } from 'lucide-react';

interface PolicySupportViewProps {
  initialTab?: 'terms' | 'privacy' | 'faq' | 'contact';
  onNavigateHome: () => void;
}

const FAQ_ITEMS = [
  {
    id: 'f1',
    q: '🐾 遊玩這些可愛小遊戲需要付費嗎？是不是完全免費的？',
    a: '是的！「萌萌小遊戲」港灣是一個完全免費、綠色無廣告的療癒系小遊戲平台。我們旨在為玩家提供淨化心靈的片刻安寧，絕不存在任何買斷制、隱藏付費或強制廣告。您玩到的所有項目（包括小動物烘焙、五行玉珠、如意疊疊消等）皆可免費用戶爽快暢玩！',
    category: 'general'
  },
  {
    id: 'f2',
    q: '🎒 我的遊戲進度和分數會被儲存嗎？換手機或瀏覽器會不會消失？',
    a: '您的最高紀錄和歷史遊玩足跡，會即時保存在您目前瀏覽器的本地存儲（Local Storage）中。只要不主動清除瀏覽器緩存或隱私數據，進度就不會丟失。目前我們尚未開啟雲端同步帳號（以最大程度保護您的個人數據隱私），建議不要在無痕模式下進行深度挑戰喔。',
    category: 'account'
  },
  {
    id: 'f3',
    q: '🐿️ 為什麼有些小遊戲卡槽沒滿就顯示遊戲結束了（例如如意疊疊消）？',
    a: '在「萌獸柿柿如意消」中，底部的如意金缽（收集槽）上限是 7 個位置。如果您將 7 個位置放滿了且沒有湊出 3 個相同吉祥物進行消除，便會宣佈卡槽溢出局終。建议多利用我們貼心準備的「撤銷法寶」或松鼠阿吉的「移出揹簍」來調撥位置，合理排列先後疊放層次。',
    category: 'gameplay'
  },
  {
    id: 'f4',
    q: '🍵 在「玲瓏五彩珠分類」遊戲中中途卡關了，有沒有救命妙招？',
    a: '別慌口哨！如果真的遇到了無路可走的情況，請點擊底部的「召引神罐」加筒按鈕，阿吉會為您特意呼喚出一個純淨中轉的「百寶琉璃真空罐」，這能為您立刻增加一個緩衝位，大大降低難度！同时，也支持無限制免費重新排列或者撤銷最近的 3 步操作喔。',
    category: 'gameplay'
  },
  {
    id: 'f5',
    q: '💌 遇到遊戲載入緩慢、黑屏或報錯，該怎麼聯絡你們？',
    a: '若遇到任何不流暢的情況，建議先重整瀏覽器。如問題依然存在，可以立即切換到本頁面的「聯繫客服」標籤頁，填寫您的電子信箱、遇阻的遊戲與報錯截圖描述，遞交反饋。我們的小松鼠和紅熊貓團隊會在 1-2 個工作日內精準審閱，並幫忙修護淨化港灣！',
    category: 'support'
  }
];

export default function PolicySupportView({ initialTab = 'terms', onNavigateHome }: PolicySupportViewProps) {
  const [activeTab, setActiveTab] = useState<'terms' | 'privacy' | 'faq' | 'contact'>(initialTab);
  const [openFaq, setOpenFaq] = useState<string | null>('f1');
  
  // Contact Form States
  const [contactForm, setContactForm] = useState({
    username: '',
    email: '',
    gameId: 'all',
    category: 'bug',
    content: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  
  // History of queries in local storage for continuous reliability
  const [submittedTickets, setSubmittedTickets] = useState<any[]>(() => {
    const saved = localStorage.getItem('minigame_support_tickets');
    return saved ? JSON.parse(saved) : [];
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setContactForm(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.email || !contactForm.content) return;

    setIsSubmitting(true);
    
    // Simulate high-fidelity network transport delay
    setTimeout(() => {
      const newTicket = {
        id: 'ticket_' + Date.now(),
        date: new Date().toLocaleString(),
        ...contactForm
      };
      
      const updated = [newTicket, ...submittedTickets];
      setSubmittedTickets(updated);
      localStorage.setItem('minigame_support_tickets', JSON.stringify(updated));

      setIsSubmitting(false);
      setSubmitSuccess(true);
      setContactForm({
        username: '',
        email: '',
        gameId: 'all',
        category: 'bug',
        content: ''
      });
    }, 1200);
  };

  return (
    <div id="policy-support-view" className="max-w-[1240px] mx-auto px-6 py-8 text-left animate-in fade-in duration-300">
      
      {/* Decorative Warm Top Splash Banner */}
      <div className="bg-gradient-to-r from-emerald-100/40 via-yellow-100/30 to-pink-100/30 border-2 border-emerald-50 rounded-3xl p-6 md:p-8 mb-8 relative overflow-hidden shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1.5 z-10">
          <div className="flex items-center gap-2">
            <span className="bg-emerald-200 text-teal-800 text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-0.5 rounded-full">
              INFORMATION PORT
            </span>
            <span className="text-xs text-gray-400 font-bold">• 萌萌小遊戲服務大廳</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-800 tracking-tight">政策規範與客服協助</h1>
          <p className="text-xs md:text-sm text-gray-500 font-medium max-w-xl">
            不論您是想查詢最周全的玩家權益保障條款，了解純淨綠色的數據隱私聲明，還是需要小助手幫您調解疑障，此處皆是您的安心溫泉港。
          </p>
        </div>
        <button
          onClick={onNavigateHome}
          className="shrink-0 font-bold text-xs bg-white text-[#1b6b4f] hover:bg-emerald-50 py-3 px-5 border-2 border-emerald-100 rounded-2xl flex items-center gap-1 shadow-sm transition-all"
        >
          <span>回到遊戲大廳</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Navigation side rail */}
        <div className="lg:col-span-3 space-y-3 bg-white border border-emerald-50 rounded-2xl p-4 shadow-sm">
          <span className="block text-[10px] text-gray-400 uppercase tracking-widest font-extrabold px-3.5 mb-2">
            大廳目錄
          </span>
          
          <button
            id="tab-terms-btn"
            onClick={() => { setActiveTab('terms'); setSubmitSuccess(false); }}
            className={`w-full text-left py-3 px-4 rounded-xl font-bold text-xs flex items-center gap-2.5 transition-all ${
              activeTab === 'terms'
                ? 'bg-[#1b6b4f] text-white shadow-md shadow-emerald-700/10'
                : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>服務條款 (Terms)</span>
          </button>

          <button
            id="tab-privacy-btn"
            onClick={() => { setActiveTab('privacy'); setSubmitSuccess(false); }}
            className={`w-full text-left py-3 px-4 rounded-xl font-bold text-xs flex items-center gap-2.5 transition-all ${
              activeTab === 'privacy'
                ? 'bg-[#1b6b4f] text-white shadow-md shadow-emerald-700/10'
                : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>隱私權政策 (Privacy)</span>
          </button>

          <button
            id="tab-faq-btn"
            onClick={() => { setActiveTab('faq'); setSubmitSuccess(false); }}
            className={`w-full text-left py-3 px-4 rounded-xl font-bold text-xs flex items-center gap-2.5 transition-all ${
              activeTab === 'faq'
                ? 'bg-[#1b6b4f] text-white shadow-md shadow-emerald-700/10'
                : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>常問問題 (FAQ)</span>
          </button>

          <button
            id="tab-contact-btn"
            onClick={() => { setActiveTab('contact'); setSubmitSuccess(false); }}
            className={`w-full text-left py-3 px-4 rounded-xl font-bold text-xs flex items-center gap-2.5 transition-all ${
              activeTab === 'contact'
                ? 'bg-[#1b6b4f] text-white shadow-md shadow-emerald-700/10'
                : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            <Headphones className="w-4 h-4" />
            <span>聯繫客服 (Support)</span>
          </button>
        </div>

        {/* Content detail side panel */}
        <div className="lg:col-span-9 bg-white border border-gray-100 rounded-3xl p-6 md:p-8 min-h-[500px] shadow-sm relative">
          
          {/* A: TERMS OF SERVICE */}
          {activeTab === 'terms' && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 pb-4 border-b">
                <div className="bg-emerald-50 p-2 rounded-xl text-[#1b6b4f]">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-gray-800">萌萌大廳「服務條款」</h2>
                  <p className="text-[10px] text-gray-400 font-semibold font-mono">Last Updated: June 2, 2026</p>
                </div>
              </div>

              <div className="text-gray-600 text-xs leading-relaxed space-y-4 font-medium">
                <p className="bg-emerald-50/50 p-3.5 rounded-xl border border-emerald-100 text-[#1b6b4f] font-bold">
                  🌿 歡迎進入「萌萌小遊戲」港灣！我們致力於構造一個療癒、放鬆、綠色、安全的純粹休閒地帶。請在暢玩我們的益智小組件、烘焙店或分類遊戲前，仔細閱讀並遵守本協議。一經開始遊玩，即視為您已完全理解並同意本條款的所有規定。
                </p>

                <div className="space-y-2">
                  <h3 className="font-bold text-gray-800 text-sm">第一條：服務提供與適用範疇</h3>
                  <p>
                    1. 本服務是由「萌萌小遊戲團隊」提供、架設的純粹休閒與非盈利性之益智與消除小組件平台。
                  </p>
                  <p>
                    2. 所有遊戲要素、編鐘古風旋律、可愛小角色表情包，旨在為用戶釋壓或解謎健身，我們不收取買斷費用、不強制植入惱人商業硬派廣告。
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="font-bold text-gray-800 text-sm">第二條：合理的行為準則與文明遊戲</h3>
                  <p>
                    1. 本平台提供用戶自訂遊戲暱稱、發表遊玩熱評反饋等互動服務。您不得上傳、使用或發表任何帶有政治、低俗、色情、人身攻擊、虛假欺詐等侵害和不和諧文字。
                  </p>
                  <p>
                    2. 您同意誠實合理地破解柿柿如意、玲瓏閣等消消樂、排序遊戲。禁止恶意拆包、逆向篡改本中心前端代碼，或利用自動腳本等外掛程序干擾大運排行分數。一經小助手檢索發現，我們有權直接刪除相應違規遊玩足跡。
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="font-bold text-gray-800 text-sm">第三條：不作擔保之免責聲明</h3>
                  <p>
                    1. 本服務為免費用戶自願遊玩的休閒小工具，並不作任何「百分之百不中斷」、「百分之百無漏洞或故障」之絕對承诺。
                  </p>
                  <p>
                    2. 若因第三方網絡節點堵塞、瀏覽器更新不兼容或您本地卸載/重灌/手工清理宿主設備緩存而導致高分數據、裝扮等級丟失，我們提供力所能及的客服診斷，但不對相應損失承擔法理賠償責任。
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="font-bold text-gray-800 text-sm">第四條：條款修訂與法規依歸</h3>
                  <p>
                    1. 我們保留隨法律法規演變、或小遊戲特性豐富而調整更新本條款之權限。變更將第一時間發佈於官網本頁面。
                  </p>
                  <p>
                    2. 如果您對任何條款有所疑慮，可以隨時通過遞交「聯繫客服」意見單與我們和平協商解答。
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* B: PRIVACY POLICY */}
          {activeTab === 'privacy' && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 pb-4 border-b">
                <div className="bg-emerald-50 p-2 rounded-xl text-[#1b6b4f]">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-gray-800">萌萌大廳「隱私權政策」</h2>
                  <p className="text-[10px] text-gray-400 font-semibold font-mono">Last Updated: June 2, 2026</p>
                </div>
              </div>

              <div className="text-gray-600 text-xs leading-relaxed space-y-4 font-medium">
                <div className="bg-pink-50/50 p-3.5 rounded-xl border border-pink-100/50 text-pink-900 flex items-start gap-2.5">
                  <span className="text-lg shrink-0">🌸</span>
                  <div>
                    <strong className="block text-[#765469]">純粹、極簡、不追蹤：我們最重視您的隱私權。</strong>
                    萌萌小遊戲平台秉承「非必要、不收集」之神聖原則。我們深知大眾對垃圾短信、大數據隱私監控的厭惡，因此我們不會在後台默默監視您的個人通話、定位或通訊錄信息！
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-bold text-gray-800 text-sm">一、我們收集（且僅限於）哪些輕量數據？</h3>
                  <p>
                    1. <strong>暱稱與頭像（自願提供）：</strong>當您登入大廳時，您可以給自己取一個可愛的名號並點選一隻森林小動物化身。這僅會存在於瀏覽器記憶（Local Storage）中，用以增強遊戲記錄的趣味。
                  </p>
                  <p>
                    2. <strong>本地遊玩檔案與最高分：</strong>為了維護您在小動物咖啡廳、消消樂等遊戲的累計等級和金幣，我們利用瀏覽器本身的鍵值緩存（Local Storage）存儲這類進度。
                  </p>
                  <p>
                    3. <strong>客服表單信息：</strong>若您撰寫表單聯絡我們，我們會登記您手填的<strong>自願電子信箱、姓名和描述</strong>，僅在處理該反饋範疇時使用，完成工單後即會清理銷毀。
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="font-bold text-gray-800 text-sm">二、我們收集這些少量數據的目的是什麼？</h3>
                  <p>
                    1. 為您呈現「最近玩過」的專屬歷史印記。
                  </p>
                  <p>
                    2. 維護平台上的「每日幸運高分」榮譽榜。
                  </p>
                  <p>
                    3. 在您遇到程式 Bug 等不幸局面時，我們的客服能精準定位並給您的電子信箱遞回貼心答覆。
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="font-bold text-gray-800 text-sm">三、絕對杜絕將數據向第三方披露</h3>
                  <p>
                    我們聲明，絕不將您的電子信箱、遊玩經歷等數據出售或向任何無涉利害之商務機構分享、發佈。一切皆圍繞着萌萌小遊戲生態閉環流動，讓您擁有完全純淨、放心的衝榜體驗。
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="font-bold text-gray-800 text-sm">四、您如何控制自己的數據？</h3>
                  <p>
                    您可以在任意時間，前往「最近玩過」分頁，點擊「清除足跡」或在瀏覽器偏好設定中選擇「清除 Cookie / Local Storage」，即可實現徹底的一鍵數據自我抹除！這非常靈活，由您百分百主導。
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* C: FAQ (FREQUENTLY ASKED QUESTIONS) */}
          {activeTab === 'faq' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b">
                <div className="flex items-center gap-2">
                  <div className="bg-emerald-50 p-2 rounded-xl text-[#1b6b4f]">
                    <HelpCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-gray-800">常問問題 (FAQ)</h2>
                    <p className="text-[10px] text-gray-400 font-bold">小助手在此為您即刻解惑</p>
                  </div>
                </div>
                <div className="hidden sm:flex items-center gap-1.5 text-xs text-amber-600 font-bold bg-amber-50 px-3 py-1 rounded-xl">
                  <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                  <span>5 條常見解答已收錄</span>
                </div>
              </div>

              {/* Collapsible item grid */}
              <div className="grid grid-cols-1 gap-4">
                {FAQ_ITEMS.map(item => {
                  const isOpen = openFaq === item.id;
                  return (
                    <div
                      key={item.id}
                      className={`border rounded-2xl overflow-hidden transition-all duration-300 ${
                        isOpen ? 'border-[#a7f3d0] bg-emerald-50/10 shadow-sm' : 'border-gray-100 hover:border-gray-200'
                      }`}
                    >
                      <button
                        onClick={() => setOpenFaq(isOpen ? null : item.id)}
                        className="w-full text-left p-4 flex justify-between items-center gap-3 font-bold text-xs md:text-sm text-gray-800"
                      >
                        <span className="leading-relaxed">{item.q}</span>
                        <ChevronDown className={`w-4 h-4 text-emerald-600 shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                      </button>

                      <AnimatePresence>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <div className="px-4 pb-4 pt-1 border-t border-emerald-50/50 text-[11px] md:text-xs text-gray-600 leading-relaxed font-semibold">
                              {item.a}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* D: CONTACT SUPPORT (联系客服) */}
          {activeTab === 'contact' && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 pb-4 border-b">
                <div className="bg-emerald-50 p-2 rounded-xl text-[#1b6b4f]">
                  <Headphones className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-gray-800">聯繫客服與反饋</h2>
                  <p className="text-[10px] text-gray-400 font-bold">由小廚娘和小松鼠隨時候命處理</p>
                </div>
              </div>

              {submitSuccess ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-emerald-50/60 p-8 rounded-3xl border-2 border-emerald-200 text-center max-w-md mx-auto my-6 shadow-sm"
                >
                  <div className="w-16 h-16 bg-[#a7f3d0] text-emerald-800 rounded-full flex items-center justify-center text-3xl mx-auto mb-4 shadow-md animate-bounce">
                    🐾
                  </div>
                  <h3 className="text-lg font-bold text-teal-950 mb-1.5 flex items-center justify-center gap-1.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    遞交成功！福運連連
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed max-w-xs mx-auto mb-5 font-semibold">
                    非常感謝您的反饋！我們的小幫手「阿吉」已將您的報告送入玲瓏閣審研部門。我們會在 <strong>1-2 個工作天</strong>內回覆至您的電子信箱！
                  </p>
                  <div className="flex justify-center gap-3">
                    <button
                      onClick={() => setSubmitSuccess(false)}
                      className="px-5 py-2.5 bg-[#1b6b4f] hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md border-b-4 border-emerald-900 duration-150"
                    >
                      再寫一封
                    </button>
                    <button
                      onClick={onNavigateHome}
                      className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl border border-gray-200 duration-150"
                    >
                      大廳逛逛
                    </button>
                  </div>
                </motion.div>
              ) : (
                <form onSubmit={handleFormSubmit} className="space-y-4">
                  
                  {/* Row 1: nickname & email */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">
                        1. 您的尊稱 / 暱稱
                      </label>
                      <input
                        type="text"
                        name="username"
                        required
                        placeholder="如: 暖洋洋草包 🐼"
                        value={contactForm.username}
                        onChange={handleInputChange}
                        className="w-full bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold p-3 outline-none focus:ring-2 focus:ring-[#a7f3d0] focus:border-[#1b6b4f]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">
                        2. 答覆電子信箱 (極其重要)
                      </label>
                      <input
                        type="email"
                        name="email"
                        required
                        placeholder="yourname@gmail.com"
                        value={contactForm.email}
                        onChange={handleInputChange}
                        className="w-full bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold p-3 outline-none focus:ring-2 focus:ring-[#a7f3d0] focus:border-[#1b6b4f]"
                      />
                    </div>
                  </div>

                  {/* Row 2: Select game or topic */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">
                        3. 反應涉及的可愛小遊戲
                      </label>
                      <select
                        name="gameId"
                        value={contactForm.gameId}
                        onChange={handleInputChange}
                        className="w-full bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold p-3 outline-none focus:ring-2 focus:ring-[#a7f3d0] focus:border-[#1b6b4f] cursor-pointer"
                      >
                        <option value="all">整個遊戲中心平台 (通用)</option>
                        <option value="sortworks">萌寵五福玲瓏閣 (珠子)</option>
                        <option value="tilematching">萌獸柿柿如意消 (疊疊消)</option>
                        <option value="bubble">朵朵兔吹泡泡 (泡泡射擊)</option>
                        <option value="cafe">萌物松鼠烘焙屋 (咖啡廳)</option>
                        <option value="tetris">繽紛積木挑戰 (俄羅斯方塊)</option>
                        <option value="breakout">粉紅萌寵彈球 (打磚塊)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">
                        4. 客服反饋主題
                      </label>
                      <select
                        name="category"
                        value={contactForm.category}
                        onChange={handleInputChange}
                        className="w-full bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold p-3 outline-none focus:ring-2 focus:ring-[#a7f3d0] focus:border-[#1b6b4f] cursor-pointer"
                      >
                        <option value="bug">遇到的系統 Bug 障礙回報</option>
                        <option value="suggestion">優化與新遊戲創意提案 💡</option>
                        <option value="cooperation">商務合作與聯名對接</option>
                        <option value="other">其他想跟阿吉聊聊的話</option>
                      </select>
                    </div>
                  </div>

                  {/* Comment input area */}
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">
                      5. 報告詳情描述 (請細緻描述您遇阻前後的情形)
                    </label>
                    <textarea
                      name="content"
                      required
                      rows={5}
                      placeholder="請寫下您的具體情況，例如:「載入玲瓏閣遊戲時，進度條到100%突然卡住，聲音還在響，刷新幾次都一樣；我的瀏覽器是 Chrome...」我們的小助手看後會立刻為您排憂解難喔！🐿️"
                      value={contactForm.content}
                      onChange={handleInputChange}
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl text-xs font-bold p-3 outline-none focus:ring-2 focus:ring-[#a7f3d0] focus:border-[#1b6b4f] leading-relaxed resize-none"
                    ></textarea>
                  </div>

                  {/* Action submit button */}
                  <div className="pt-2 text-right">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="marshmallow-button bg-[#1b6b4f] hover:bg-emerald-700 text-white font-bold py-3.5 px-8 rounded-full text-xs border-emerald-950 flex items-center justify-center gap-1.5 ml-auto shadow-md duration-200 disabled:opacity-55 cursor-pointer"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>飛鴿傳書轉接中...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>確認遞交反饋 ➔</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}

              {/* Submitted log (if matches existing local records in high-fidelity) */}
              {submittedTickets.length > 0 && (
                <div className="mt-8 border-t border-slate-100 pt-6">
                  <h4 className="text-xs font-bold text-gray-500 mb-3 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[15px]">assignment</span>
                    您先前遞交的反饋紀錄 (本機緩存共 {submittedTickets.length} 條)
                  </h4>
                  <div className="space-y-3">
                    {submittedTickets.map(ticket => (
                      <div key={ticket.id} className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 text-xs text-left">
                        <div className="flex justify-between items-center mb-1 bg-white px-2 py-1 rounded border">
                          <span className="font-bold text-[#1b6b4f]">
                            {ticket.category === 'bug' ? '🐛 障礙回報' : ticket.category === 'suggestion' ? '💡 創意提案' : '💬 其他諮詢'}
                          </span>
                          <span className="text-[10px] text-gray-400 font-mono font-bold">{ticket.date}</span>
                        </div>
                        <p className="text-gray-600 line-clamp-2 mt-1 leading-relaxed font-semibold">
                          {ticket.content}
                        </p>
                        <div className="text-[10px] text-gray-400 mt-2 font-bold">
                          答覆信箱: <span className="text-slate-700">{ticket.email}</span> • 狀態: <span className="text-amber-600">小松鼠排隊審研中...</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
