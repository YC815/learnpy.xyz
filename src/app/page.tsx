"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { AuthButtons, UserMenuButton } from '@/components';

const TryIt: React.FC = () => {
  const [code, setCode] = useState('name = input("你的名字？ ")\nprint(f"Hello, {name}!")');
  const [showAIReview, setShowAIReview] = useState(false);

  const handleRunCode = () => {
    if (code.includes('input(') && !code.includes('# 注意：在網頁環境中input()需要特殊處理')) {
      setShowAIReview(true);
    } else {
      alert('程式碼執行成功！👍');
    }
  };

  return (
    <div className="bg-stone-800 rounded-lg p-6 max-w-2xl mx-auto">
      <h3 className="text-xl font-semibold mb-4 text-stone-100">🚀 立即體驗互動式學習</h3>
      <div className="bg-black rounded-lg p-4 mb-4">
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="w-full bg-black text-green-400 font-mono text-sm resize-none border-none outline-none"
          rows={3}
          placeholder="在這裡寫 Python 程式碼..."
        />
      </div>
      <button
        onClick={handleRunCode}
        className="bg-orange-500 text-stone-100 px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors text-lg"
      >
        執行程式碼
      </button>

      {showAIReview && (
        <div className="mt-4 p-4 bg-amber-900 border-l-4 border-amber-500">
          <h4 className="font-semibold text-amber-200 mb-2 text-lg">🤖 AI 檢測到問題</h4>
          <p className="text-amber-300 mb-3 text-lg">
            <strong>錯誤原因：</strong> 在網頁環境中，<code className="bg-amber-800 px-1 rounded">input()</code> 函數無法正常工作。
          </p>
          <div className="bg-stone-700 p-3 rounded border">
            <p className="text-base font-medium mb-2 text-stone-200">建議修正：</p>
            <pre className="text-base bg-stone-900 text-stone-200 p-2 rounded overflow-x-auto">
{`# 網頁版本
name = "小明"  # 模擬用戶輸入
print(f"Hello, {name}!")`}
            </pre>
          </div>
          <button
            onClick={() => setShowAIReview(false)}
            className="mt-3 text-base text-amber-300 hover:text-amber-100"
          >
            了解了 ✓
          </button>
        </div>
      )}
    </div>
  );
};

export default function Home() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [showTooltip, setShowTooltip] = useState(false);

  const navigateToCourses = () => {
    router.push('/courses');
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    setTooltipPosition({ x: e.clientX, y: e.clientY });
  };

  const handleMouseEnter = () => {
    setShowTooltip(true);
  };

  const handleMouseLeave = () => {
    setShowTooltip(false);
  };

  return (
    <div className="min-h-screen bg-stone-900">
      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-stone-900/80 backdrop-blur-sm border-b border-stone-700/50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-orange-400">LearnPy</h1>
            <span className="text-stone-400">|</span>
            <span className="text-stone-300 font-medium">Python 學習平台</span>
          </div>

          {/* Auth Section */}
          <div className="flex items-center gap-4">
            {isLoaded && (
              <>
                {user ? (
                  <UserMenuButton />
                ) : (
                  <AuthButtons />
                )}
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-stone-800 to-stone-900 min-h-screen flex items-center justify-center pt-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-stone-100 mb-8 leading-tight">
            用對話和即時回饋<br/>學會真正能用的 Python
          </h1>
          <p className="text-lg md:text-xl lg:text-2xl text-stone-300 mb-12 max-w-4xl mx-auto leading-relaxed">
            AI 會在你犯錯時立刻指正，並解釋為什麼錯、怎麼改。
          </p>
          <div className="flex justify-center">
            {isLoaded && (
              <>
                {user ? (
                  <button 
                    onClick={navigateToCourses}
                    className="bg-orange-500 text-stone-100 px-8 py-5 rounded-xl text-2xl font-medium hover:bg-orange-600 transition-colors shadow-lg flex items-center gap-3"
                  >
                    <i className="fa-solid fa-graduation-cap"></i>
                    繼續學習
                  </button>
                ) : (
                  <button 
                    onClick={() => {
                      window.scrollTo({
                        top: window.innerHeight,
                        behavior: 'smooth'
                      });
                    }}
                    className="bg-orange-500 text-stone-100 px-8 py-5 rounded-xl text-2xl font-medium hover:bg-orange-600 transition-colors shadow-lg"
                  >
                    了解更多
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </section>

      {/* Core Features */}
      <section className="py-24 bg-stone-800">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-5xl md:text-6xl font-bold text-center mb-20 text-stone-100">為什麼選擇我們的學習方式？</h2>
          <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-8">
            <div className="bg-gradient-to-br from-stone-700/50 to-stone-800/50 backdrop-blur-sm border border-stone-600/20 rounded-3xl p-10 hover:border-orange-500/40 transition-all duration-300 group min-h-[400px]">
              <div className="flex flex-col items-start h-full">
                <h3 className="text-3xl font-bold mb-6 text-stone-100 whitespace-nowrap">對話式學習</h3>
                <p className="text-xl text-stone-300 mb-10 leading-relaxed flex-grow">
                  隨時點擊對話按鈕，直接問「為什麼？」獲得分層提示。
                </p>
                <div className="w-32 h-32 mx-auto mt-auto opacity-60 group-hover:opacity-80 transition-opacity flex items-center justify-center">
                  <i className="fa-solid fa-comment text-orange-400 text-7xl"></i>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-stone-700/50 to-stone-800/50 backdrop-blur-sm border border-stone-600/20 rounded-3xl p-10 hover:border-orange-500/40 transition-all duration-300 group min-h-[400px]">
              <div className="flex flex-col items-start h-full">
                <h3 className="text-3xl font-bold mb-6 text-stone-100 whitespace-nowrap">即時錯誤檢測</h3>
                <p className="text-xl text-stone-300 mb-10 leading-relaxed flex-grow">
                  你的程式跑錯了？AI 會立即跳出錯誤原因與修正版本（Diff）。
                </p>
                <div className="w-32 h-32 mx-auto mt-auto opacity-60 group-hover:opacity-80 transition-opacity flex items-center justify-center">
                  <i className="fa-solid fa-bug-slash text-orange-400 text-7xl"></i>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-stone-700/50 to-stone-800/50 backdrop-blur-sm border border-stone-600/20 rounded-3xl p-10 hover:border-orange-500/40 transition-all duration-300 group min-h-[400px]">
              <div className="flex flex-col items-start h-full">
                <h3 className="text-3xl font-bold mb-6 text-stone-100 whitespace-nowrap">專案導向課程</h3>
                <p className="text-xl text-stone-300 mb-10 leading-relaxed flex-grow">
                  每課都是一個任務，讓你邊學邊做出能用的程式。
                </p>
                <div className="w-32 h-32 mx-auto mt-auto opacity-60 group-hover:opacity-80 transition-opacity flex items-center justify-center">
                  <i className="fa-solid fa-clipboard-list text-orange-400 text-7xl"></i>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-stone-700/50 to-stone-800/50 backdrop-blur-sm border border-stone-600/20 rounded-3xl p-10 hover:border-orange-500/40 transition-all duration-300 group min-h-[400px]">
              <div className="flex flex-col items-start h-full">
                <h3 className="text-3xl font-bold mb-6 text-stone-100 whitespace-nowrap">進度與錯誤追蹤</h3>
                <p className="text-xl text-stone-300 mb-10 leading-relaxed flex-grow">
                  自動記錄你的學習歷程與常犯錯，幫你持續優化。
                </p>
                <div className="w-32 h-32 mx-auto mt-auto opacity-60 group-hover:opacity-80 transition-opacity flex items-center justify-center">
                  <i className="fa-solid fa-calendar-days text-orange-400 text-7xl"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Demo */}
      <section className="py-16 bg-stone-900">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-8 text-stone-100">體驗 AI 輔助學習</h2>
          <p className="text-center text-stone-300 mb-8 text-xl">
            試著執行下面的程式碼，看看我們的 AI 助教如何幫你找出問題
          </p>
          <TryIt />
        </div>
      </section>

      {/* Learning Process */}
      <section className="py-16 bg-stone-800">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12 text-stone-100">學習流程超簡單</h2>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-orange-500 rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold text-stone-100 mx-auto mb-4">
                1
              </div>
              <h3 className="font-semibold mb-2 text-stone-100 text-xl">選一課</h3>
              <p className="text-stone-300 text-lg">進入互動教學頁</p>
            </div>
            <div className="text-center">
              <div className="bg-orange-500 rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold text-stone-100 mx-auto mb-4">
                2
              </div>
              <h3 className="font-semibold mb-2 text-stone-100 text-xl">寫程式</h3>
              <p className="text-stone-300 text-lg">在文中直接寫程式碼，即時檢查</p>
            </div>
            <div className="text-center">
              <div className="bg-orange-500 rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold text-stone-100 mx-auto mb-4">
                3
              </div>
              <h3 className="font-semibold mb-2 text-stone-100 text-xl">AI 指導</h3>
              <p className="text-stone-300 text-lg">出錯時 AI 提供修正與原因</p>
            </div>
            <div className="text-center">
              <div className="bg-orange-500 rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold text-stone-100 mx-auto mb-4">
                4
              </div>
              <h3 className="font-semibold mb-2 text-stone-100 text-xl">解鎖下一課</h3>
              <p className="text-stone-300 text-lg">完成任務，繼續學習之旅</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-orange-600">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-4xl font-bold text-stone-100 mb-6">
            準備好開始你的 Python 對話式冒險了嗎？
          </h2>
          <p className="text-2xl text-orange-100 mb-8">
            馬上從第一課開始，邊聊邊學，邊錯邊進步。
          </p>
          {isLoaded && (
            <>
              {user ? (
                <button 
                  onClick={navigateToCourses}
                  className="group relative bg-gradient-to-r from-orange-500 to-red-500 text-white px-12 py-6 rounded-2xl text-2xl font-bold hover:from-orange-600 hover:to-red-600 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl shadow-xl border-2 border-orange-400 hover:border-orange-300"
                >
                  <span className="flex items-center gap-3">
                    <i className="fa-solid fa-graduation-cap group-hover:[animation:gentle-bounce_1s_ease-in-out_infinite]"></i>
                    繼續我的 Python 之旅
                    <i className="fa-solid fa-arrow-right group-hover:translate-x-1 transition-transform"></i>
                  </span>
                </button>
              ) : (
                <button 
                  onClick={() => router.push('/sign-up')}
                  className="group relative bg-gradient-to-r from-orange-500 to-red-500 text-white px-12 py-6 rounded-2xl text-2xl font-bold hover:from-orange-600 hover:to-red-600 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl shadow-xl border-2 border-orange-400 hover:border-orange-300"
                >
                  <span className="flex items-center gap-3">
                    <i className="fa-solid fa-rocket group-hover:[animation:gentle-bounce_1s_ease-in-out_infinite]"></i>
                    免費開始我的 Python 之旅
                    <i className="fa-solid fa-arrow-right group-hover:translate-x-1 transition-transform"></i>
                  </span>
                </button>
              )}
            </>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-stone-950 text-stone-400 py-8">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-lg">&copy; 2025 LearnPy.xyz</p>
        </div>
      </footer>
    </div>
  );
}