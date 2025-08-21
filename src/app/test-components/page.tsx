"use client";

import React from 'react';
import { TryIt, Pitfalls } from '@/components';

export default function TestComponentsPage() {
  const samplePitfalls = [
    {
      symptom: "輸入 5 和 7，結果輸出 57 而不是 12",
      why: "因為 input() 回傳的是字串，字串加法是串接，而不是數值相加",
      fix: "用 int() 或 float() 先轉換成數字\n\n```python\na = int(input('輸入第一個數字：'))\nb = int(input('輸入第二個數字：'))\nprint(a + b)  # 現在會正確輸出 12\n```"
    },
    {
      symptom: "ValueError: invalid literal for int()",
      why: "轉成整數時，輸入的內容不是有效的數字",
      fix: "檢查輸入內容，或改用 float() 處理小數\n\n```python\ntry:\n    num = int(input('輸入數字：'))\nexcept ValueError:\n    print('請輸入有效的數字')\n```"
    },
    {
      symptom: "SyntaxError: EOL while scanning string literal",
      why: "字串的引號沒有正確配對，通常是忘記關閉引號",
      fix: "檢查所有字串都有配對的引號\n\n```python\n# 錯誤\nprint('Hello World)\n\n# 正確\nprint('Hello World')\n```"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">
          組件測試頁面
        </h1>

        <div className="space-y-12">
          {/* TryIt Component Test */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              TryIt 組件測試
            </h2>
            
            <div className="space-y-6">
              {/* Basic TryIt */}
              <div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">
                  基本 Python 程式碼 - 無提示文字的 input()
                </h3>
                <TryIt
                  id="basic-python"
                  starter={`# 基本的 Python 程式碼
name = input()
print(name)`}
                  enableAiReview={true}
                />
                <div className="mt-2 text-sm text-gray-600 bg-blue-50 p-3 rounded">
                  <strong>測試說明：</strong>在右上角 Input 區輸入任何文字（例如 "小王"），然後點擊執行程式碼<br/>
                  <strong>預期輸出：</strong>小王（無提示文字的 input() 不顯示輸入過程，只顯示 print 結果）
                </div>
              </div>

              {/* Input with prompt */}
              <div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">
                  有提示文字的 input() 函數
                </h3>
                <TryIt
                  id="input-with-prompt"
                  starter={`# 有提示文字的輸入
name = input("請輸入你的名字：")
age = input("請輸入你的年齡：")
print(f"你好 {name}，你今年 {age} 歲！")`}
                  enableAiReview={true}
                />
                <div className="mt-2 text-sm text-gray-600 bg-blue-50 p-3 rounded">
                  <strong>測試說明：</strong>在右上角 Input 區輸入兩行文字：<br/>
                  第一行：小王<br/>
                  第二行：25<br/>
                  <strong>預期輸出：</strong><br/>
                  請輸入你的名字：小王<br/>
                  請輸入你的年齡：25<br/>
                  你好 小王，你今年 25 歲！
                </div>
              </div>

              {/* TryIt with errors */}
              <div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">
                  測試 AI 錯誤分析 - 語法錯誤
                </h3>
                <TryIt
                  id="error-example"
                  starter={`# 這段程式碼有語法錯誤，測試AI分析
if name == "小明"
    print("你好，小明!")
else:
    print("你好，陌生人")`}
                  enableAiReview={true}
                />
                <div className="mt-2 text-sm text-gray-600 bg-yellow-50 p-3 rounded">
                  <strong>測試說明：</strong>這段程式碼缺少冒號，執行時會顯示 AI 錯誤分析和程式碼修正建議
                </div>
              </div>

              {/* TryIt with string error */}
              <div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">
                  測試 AI 錯誤分析 - 字串錯誤
                </h3>
                <TryIt
                  id="string-error-example"
                  starter={`# 字串引號沒有關閉的錯誤
name = "小王
print("你好，" + name)`}
                  enableAiReview={true}
                />
                <div className="mt-2 text-sm text-gray-600 bg-yellow-50 p-3 rounded">
                  <strong>測試說明：</strong>字串引號沒有正確關閉，測試 AI 如何用繁體中文和新手友善語氣解釋問題
                </div>
              </div>

              {/* Data types example */}
              <div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">
                  資料型別範例
                </h3>
                <TryIt
                  id="data-types"
                  starter={`age = 18       # int
pi = 3.14      # float
name = "Amy"   # str

print(age)
print(pi)
print(name)`}
                  enableAiReview={true}
                />
              </div>
            </div>
          </section>

          {/* Pitfalls Component Test */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Pitfalls 組件測試
            </h2>
            
            <Pitfalls items={samplePitfalls} />
          </section>

          {/* Combined Example */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              組合範例 - 模擬實際課程內容
            </h2>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold mb-4">
                Python 輸入與輸出
              </h3>
              
              <p className="text-gray-700 mb-6">
                學習如何使用 <code className="bg-gray-200 px-1 rounded">input()</code> 和{' '}
                <code className="bg-gray-200 px-1 rounded">print()</code> 函數。
              </p>

              <TryIt
                id="input-output-example"
                starter={`# 讓使用者輸入兩個數字並相加
# 這裡有個常見錯誤：input() 回傳字串，不是數字
a = input("輸入第一個數字：")
b = input("輸入第二個數字：")
result = a + b  # 這會是字串串接，不是數學加法
print("結果是：", result)`}
                enableAiReview={true}
              />

              <div className="mt-8">
                <Pitfalls items={samplePitfalls.slice(0, 2)} />
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}