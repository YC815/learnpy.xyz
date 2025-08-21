"use client";

import React, { useState } from 'react';

interface SimpleErrorAnalysisProps {
  originalError: string;
  code: string;
  onCodeUpdate: (newCode: string) => void;
  onClose: () => void;
}

export const SimpleErrorAnalysis: React.FC<SimpleErrorAnalysisProps> = ({
  originalError,
  code,
  onCodeUpdate,
  onClose
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
  const [fixedCode, setFixedCode] = useState<string | null>(null);

  const analyzeWithAI = async () => {
    setIsAnalyzing(true);
    
    try {
      // 模擬 API 呼叫
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 簡單的錯誤修正建議
      const suggestion = generateSimpleSuggestion(originalError);
      const fixedCodeSuggestion = generateSimpleCodeFix(code, originalError);
      
      setAiSuggestion(suggestion);
      setFixedCode(fixedCodeSuggestion);
    } catch (error) {
      console.error('AI analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAcceptFix = () => {
    if (fixedCode) {
      onCodeUpdate(fixedCode);
      onClose();
    }
  };

  React.useEffect(() => {
    analyzeWithAI();
  }, [originalError, code]);

  return (
    <div className="mt-4 bg-red-50 border border-red-200 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-red-100 border-b border-red-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <i className="fa-solid fa-triangle-exclamation text-red-500"></i>
          <h4 className="font-medium text-red-800">執行錯誤分析</h4>
        </div>
        <button
          onClick={onClose}
          className="text-red-500 hover:text-red-700"
        >
          <i className="fa-solid fa-times"></i>
        </button>
      </div>

      <div className="flex">
        {/* Left: Original Error */}
        <div className="w-1/2 p-4 border-r border-red-200">
          <h5 className="font-medium text-gray-800 mb-2 flex items-center gap-2">
            <i className="fa-solid fa-bug text-red-500"></i>
            原始錯誤訊息
          </h5>
          <div className="bg-gray-900 text-red-400 p-3 rounded text-sm font-mono whitespace-pre-wrap">
            {originalError}
          </div>
        </div>

        {/* Right: AI Analysis */}
        <div className="w-1/2 p-4">
          <h5 className="font-medium text-gray-800 mb-2 flex items-center gap-2">
            <i className="fa-solid fa-robot text-blue-500"></i>
            AI 分析建議
          </h5>
          
          {isAnalyzing ? (
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center gap-2 text-gray-600">
                <i className="fa-solid fa-spinner fa-spin"></i>
                AI 正在分析中...
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* AI Suggestion */}
              {aiSuggestion && (
                <div className="bg-white border rounded p-3">
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {aiSuggestion}
                  </p>
                </div>
              )}

              {/* Code Comparison */}
              {fixedCode && (
                <div className="space-y-2">
                  <h6 className="text-sm font-medium text-gray-700">修正建議：</h6>
                  
                  {/* Original Code */}
                  <div>
                    <div className="text-xs text-gray-600 mb-1">原始程式碼：</div>
                    <div className="bg-red-100 border border-red-300 rounded p-2">
                      <pre className="text-xs text-red-800 whitespace-pre-wrap">
                        {code.slice(0, 200)}{code.length > 200 ? '...' : ''}
                      </pre>
                    </div>
                  </div>

                  {/* Fixed Code */}
                  <div>
                    <div className="text-xs text-gray-600 mb-1">修正後程式碼：</div>
                    <div className="bg-green-100 border border-green-300 rounded p-2">
                      <pre className="text-xs text-green-800 whitespace-pre-wrap">
                        {fixedCode.slice(0, 200)}{fixedCode.length > 200 ? '...' : ''}
                      </pre>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-end gap-2 mt-4">
                    <button
                      onClick={onClose}
                      className="w-8 h-8 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors flex items-center justify-center"
                      title="拒絕修正"
                    >
                      <i className="fa-solid fa-times text-sm"></i>
                    </button>
                    <button
                      onClick={handleAcceptFix}
                      className="w-8 h-8 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors flex items-center justify-center"
                      title="接受修正"
                    >
                      <i className="fa-solid fa-check text-sm"></i>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// 簡單的錯誤建議生成
function generateSimpleSuggestion(error: string): string {
  if (error.includes('SyntaxError')) {
    if (error.includes('EOL while scanning string literal')) {
      return '你的字串引號沒有正確關閉哦！Python 需要每個字串都有配對的引號，就像括號一樣要成對出現。請檢查程式碼中是否有遺漏的引號。';
    }
    if (error.includes('invalid syntax')) {
      return '程式碼的語法有小問題，可能是忘記加冒號、括號沒有配對，或是某些地方拼錯了。仔細檢查一下每行程式碼的符號是否正確。';
    }
    return '程式碼的語法不太對，Python 對格式很嚴格。請檢查是否有拼錯的關鍵字或缺少的符號。';
  }
  if (error.includes('NameError')) {
    return '你使用了一個還沒定義的變數名稱，或是可能拼錯了變數名。記住 Python 區分大小寫，name 和 Name 是不同的變數哦！';
  }
  if (error.includes('IndentationError')) {
    return '縮排有問題！Python 用縮排來判斷程式碼的層次結構，就像寫大綱一樣。請確保每個層級的縮排都一致。';
  }
  return '程式執行時遇到了問題，通常是邏輯錯誤或語法問題。仔細看看錯誤提示，它會告訴你哪裡出了狀況。';
}

// 簡單的程式碼修正
function generateSimpleCodeFix(code: string, error: string): string {
  let fixedCode = code;

  // 修正常見的語法錯誤
  if (error.includes('EOL while scanning string literal')) {
    // 嘗試修正未關閉的引號
    const lines = fixedCode.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const singleQuotes = (line.match(/'/g) || []).length;
      const doubleQuotes = (line.match(/"/g) || []).length;
      
      if (singleQuotes % 2 !== 0) {
        lines[i] = line + "'";
      }
      if (doubleQuotes % 2 !== 0) {
        lines[i] = line + '"';
      }
    }
    fixedCode = lines.join('\n');
  }

  // 修正缺少冒號的問題
  if (error.includes('invalid syntax')) {
    fixedCode = fixedCode.replace(/^(\s*(if|elif|else|for|while|def|class|try|except|finally|with)\s+[^:]*?)\s*$/gm, '$1:');
  }

  return fixedCode;
}