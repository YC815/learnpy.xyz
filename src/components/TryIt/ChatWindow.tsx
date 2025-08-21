"use client";

import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, ChatContext } from './types';

interface ChatWindowProps {
  isOpen: boolean;
  onClose: () => void;
  context: ChatContext;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  isOpen,
  onClose,
  context
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize with welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: 'welcome',
        sender: 'ai',
        content: `你好！我看到你正在學習「${context.articleTitle}」\n\n目前編輯的程式碼區塊：${context.currentTryItId}\n\n有什麼問題可以隨時問我！`,
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, context]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      content: inputValue,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // Simulate AI response (replace with actual API call)
    setTimeout(() => {
      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        content: generateAIResponse(inputValue, context),
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsLoading(false);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white w-full max-w-md h-full max-h-[90vh] flex flex-col rounded-lg shadow-xl mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-orange-500 text-white rounded-t-lg">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="text-white hover:text-orange-200"
            >
              <i className="fa-solid fa-arrow-left"></i>
            </button>
            <div>
              <h3 className="font-semibold">AI 學習助手</h3>
              <p className="text-xs text-orange-100">Python 程式問答</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-orange-200 text-xl"
          >
            ✕
          </button>
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-lg p-3 ${
                  message.sender === 'user'
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {message.sender === 'ai' && (
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-orange-500">🤖</span>
                    <span className="text-xs text-gray-500">AI 助手</span>
                  </div>
                )}
                
                <div className="whitespace-pre-wrap text-sm">
                  {message.content}
                </div>
                
                {message.codeBlock && (
                  <div className="mt-2 bg-gray-800 text-green-400 p-2 rounded text-xs font-mono">
                    <pre>{message.codeBlock}</pre>
                  </div>
                )}
                
                <div className="text-xs opacity-70 mt-1">
                  {message.timestamp.toLocaleTimeString('zh-TW', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-lg p-3 max-w-[85%]">
                <div className="flex items-center gap-2">
                  <span className="text-orange-500">🤖</span>
                  <span className="text-xs text-gray-500">AI 助手正在思考...</span>
                </div>
                <div className="flex gap-1 mt-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t bg-gray-50">
          <div className="flex gap-2">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="輸入你的問題..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
              rows={1}
              disabled={isLoading}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              <i className="fa-solid fa-paper-plane"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Simulate AI responses (replace with actual AI integration)
function generateAIResponse(userInput: string, context: ChatContext): string {
  const input = userInput.toLowerCase();
  
  if (input.includes('錯誤') || input.includes('error')) {
    return `我來幫你檢查程式碼！\n\n你的程式碼：\n\`\`\`python\n${context.currentCode}\n\`\`\`\n\n看起來可能是語法問題。常見的 Python 錯誤包括：\n1. 括號不配對\n2. 引號沒有關閉\n3. 縮排不一致\n\n你可以檢查一下這些地方。`;
  }
  
  if (input.includes('print') || input.includes('輸出')) {
    return `print() 是 Python 中最基本的輸出函數！\n\n基本用法：\n• print("文字") - 輸出文字\n• print(變數) - 輸出變數值\n• print("文字", 變數) - 混合輸出\n\n例如：\n\`\`\`python\nname = "小明"\nprint("你好", name)\n\`\`\`\n\n這樣會輸出：你好 小明`;
  }
  
  if (input.includes('input') || input.includes('輸入')) {
    return `input() 用來讓使用者輸入資料！\n\n重要提醒：input() 總是回傳字串型別\n\n如果要數字運算，要記得轉換：\n\`\`\`python\n# 字串相加會變成串接\na = input("數字：")  # 輸入 5\nb = input("數字：")  # 輸入 7\nprint(a + b)  # 結果：57\n\n# 正確的數字相加\na = int(input("數字："))\nb = int(input("數字："))\nprint(a + b)  # 結果：12\n\`\`\``;
  }
  
  if (input.includes('type') || input.includes('型別')) {
    return `Python 有幾種基本資料型別：\n\n• int - 整數 (如 18, -5)\n• float - 浮點數 (如 3.14, -2.5)\n• str - 字串 (如 "Hello", '世界')\n• bool - 布林值 (True, False)\n\n使用 type() 來檢查：\n\`\`\`python\nprint(type(18))      # <class 'int'>\nprint(type(3.14))    # <class 'float'>\nprint(type("Hello")) # <class 'str'>\n\`\`\``;
  }
  
  // Default response
  return `這是個好問題！\n\n關於「${context.currentTryItId}」這個程式碼區塊，我建議你：\n\n1. 先執行看看會發生什麼\n2. 如果有錯誤，仔細看錯誤訊息\n3. 可以嘗試修改程式碼\n\n有任何具體問題都可以問我，比如：\n• "為什麼會出現錯誤？"\n• "print() 怎麼使用？"\n• "如何輸入數字？"`;
}