"use client";

import React, { useState } from 'react';
import { CodeEditor } from './CodeEditor';
import { PythonExecutor } from './PythonExecutor';
import { TryItProps, PythonError, ExecutionResult, AiSuggestion } from './types';
import { InlineCodeDiff } from './InlineCodeDiff';

export const TryIt: React.FC<TryItProps> = ({
  id,
  starter,
  enableAiReview = true
}) => {
  const [code, setCode] = useState(starter);
  const [errors, setErrors] = useState<PythonError[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<ExecutionResult | null>(null);
  const [userInput, setUserInput] = useState<string>('');
  const [showInlineDiff, setShowInlineDiff] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<AiSuggestion | null>(null);
  const [isLoadingAI, setIsLoadingAI] = useState(false);

  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
  };

  const handleErrorsChange = (newErrors: PythonError[]) => {
    setErrors(newErrors);
  };

  const handleExecute = async (result: ExecutionResult) => {
    setExecutionResult(result);
    setIsExecuting(false);
    
    // Show inline diff if execution failed and AI review is enabled
    if (!result.success && enableAiReview && result.error) {
      setIsLoadingAI(true);
      try {
        const response = await fetch('/api/analyze-code', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            code,
            error: result.error
          }),
        });

        if (response.ok) {
          const suggestion: AiSuggestion = await response.json();
          setAiSuggestion(suggestion);
          setShowInlineDiff(true);
        } else {
          // API 失敗，使用本地 fallback
          const localSuggestion = generateLocalSuggestion(result.error, code);
          setAiSuggestion(localSuggestion);
          setShowInlineDiff(true);
        }
      } catch (error) {
        console.error('AI analysis failed:', error);
        // 網路錯誤，使用本地 fallback
        const localSuggestion = generateLocalSuggestion(result.error, code);
        setAiSuggestion(localSuggestion);
        setShowInlineDiff(true);
      } finally {
        setIsLoadingAI(false);
      }
    }
  };

  const handleAcceptSuggestion = () => {
    if (aiSuggestion) {
      setCode(aiSuggestion.diff.modified);
      setShowInlineDiff(false);
      setAiSuggestion(null);
      setExecutionResult(null);
    }
  };

  const handleRejectSuggestion = () => {
    setShowInlineDiff(false);
    setAiSuggestion(null);
  };

  return (
    <div className="my-6 border border-slate-600/40 rounded-lg overflow-hidden bg-slate-800/60 shadow-xl backdrop-blur-sm">
      {/* Header */}
      <div className="bg-slate-700/60 px-4 py-3 border-b border-slate-600/40 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <i className="fa-solid fa-code text-orange-400"></i>
          <span className="text-sm font-medium text-stone-200">
            互動程式碼區塊: {id}
          </span>
          {errors.length > 0 && (
            <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded border border-red-500/30">
              {errors.length} 個語法錯誤
            </span>
          )}
        </div>
        
        <PythonExecutor
          code={code}
          userInput={userInput}
          onExecute={handleExecute}
          isExecuting={isExecuting}
        />
      </div>

      {/* Main Content - Three Column Layout */}
      <div className="flex h-96">
        {/* Left: Code Editor */}
        <div className="flex-1 border-r border-slate-600/40 relative">
          <div className="h-full">
            <CodeEditor
              value={code}
              onChange={handleCodeChange}
              onErrorsChange={handleErrorsChange}
            />
            
            {/* Inline Diff Overlay */}
            {showInlineDiff && aiSuggestion && (
              <InlineCodeDiff
                originalCode={code}
                suggestedCode={aiSuggestion.diff.modified}
                changes={aiSuggestion.diff.changes}
                onAccept={handleAcceptSuggestion}
                onReject={handleRejectSuggestion}
              />
            )}
            
            {/* AI Loading Overlay */}
            {isLoadingAI && (
              <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center z-10 backdrop-blur-sm">
                <div className="bg-slate-800 border border-slate-600/40 rounded-lg p-6 flex items-center gap-3 shadow-xl">
                  <i className="fa-solid fa-spinner fa-spin text-cyan-400"></i>
                  <span className="text-stone-200">AI 正在分析程式碼錯誤...</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Input/Output Panels */}
        <div className="w-80 flex flex-col">
          {/* Top: Input Panel */}
          <div className="flex-1 border-b border-slate-600/40">
            <div className="p-3 bg-slate-700/40 border-b border-slate-600/40">
              <div className="flex items-center gap-2">
                <i className="fa-solid fa-keyboard text-cyan-400 text-sm"></i>
                <span className="text-sm font-medium text-cyan-300">輸入區</span>
              </div>
            </div>
            <div className="p-3 h-full">
              <textarea
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="在這裡輸入程式需要的資料&#10;每行代表一個輸入值"
                className="w-full h-32 p-2 text-sm text-stone-200 bg-slate-900/60 border border-slate-600/40 rounded resize-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 placeholder-stone-500"
              />
            </div>
          </div>

          {/* Bottom: Output Panel */}
          <div className="flex-1">
            <div className="p-3 bg-slate-700/40 border-b border-slate-600/40">
              <div className="flex items-center gap-2">
                <i className="fa-solid fa-terminal text-emerald-400 text-sm"></i>
                <span className="text-sm font-medium text-emerald-300">輸出區</span>
                {executionResult?.executionTime && (
                  <span className="text-xs text-stone-400">
                    ({executionResult.executionTime}ms)
                  </span>
                )}
              </div>
            </div>
            <div className="p-3 h-full bg-slate-900 text-emerald-400 font-mono text-sm overflow-y-auto">
              {isExecuting ? (
                <div className="flex items-center gap-2 text-amber-400">
                  <i className="fa-solid fa-spinner fa-spin"></i>
                  執行中...
                </div>
              ) : executionResult ? (
                executionResult.success ? (
                  <pre className="whitespace-pre-wrap">{executionResult.output}</pre>
                ) : (
                  <div className="text-red-400">
                    <pre className="whitespace-pre-wrap">{executionResult.error}</pre>
                  </div>
                )
              ) : (
                <div className="text-stone-500 italic">
                  點擊執行程式碼查看結果
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* AI Analysis Section (appears below when there are errors) */}
      {showInlineDiff && aiSuggestion && (
        <div className="mt-4 bg-slate-700/40 border border-slate-600/40 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <i className="fa-solid fa-robot text-cyan-400"></i>
            <h4 className="font-medium text-cyan-300">AI 分析建議</h4>
          </div>
          <p className="text-stone-300 text-sm leading-relaxed">
            {aiSuggestion.suggestion}
          </p>
        </div>
      )}

    </div>
  );
};

// 本地錯誤分析 fallback
function generateLocalSuggestion(error: string, code: string): AiSuggestion {
  let suggestion = '';
  let modifiedCode = code;
  const changes: Array<{
    type: 'add' | 'remove' | 'unchanged';
    content: string;
    lineNumber: number;
  }> = [];

  if (error.includes('EOL while scanning string literal')) {
    suggestion = '你的字串引號沒有正確關閉哦！Python 需要每個字串都有配對的引號，就像括號一樣要成對出現。請檢查程式碼中是否有遺漏的引號。';
    // 嘗試修正引號問題
    const lines = code.split('\n');
    lines.forEach((line, index) => {
      const singleQuotes = (line.match(/'/g) || []).length;
      const doubleQuotes = (line.match(/"/g) || []).length;
      if (singleQuotes % 2 !== 0) {
        lines[index] = line + "'";
        changes.push({
          type: 'add',
          content: line + "'",
          lineNumber: index + 1
        });
      }
      if (doubleQuotes % 2 !== 0) {
        lines[index] = line + '"';
        changes.push({
          type: 'add',
          content: line + '"',
          lineNumber: index + 1
        });
      }
    });
    modifiedCode = lines.join('\n');
  } else if (error.includes('invalid syntax')) {
    if (error.includes('Maybe you meant == or != instead of =')) {
      suggestion = '在if條件中，你用了賦值運算符 = ，但應該要用比較運算符 == 來比較兩個值是否相等。記住：= 是賦值，== 是比較！';
      // 修正 if 條件中的 = 為 ==
      modifiedCode = code.replace(/^(\s*if\s+[^=]*?)\s*=\s*([^=])/gm, '$1 == $2');
      if (modifiedCode !== code) {
        const modifiedLines = modifiedCode.split('\n');
        const originalLines = code.split('\n');
        
        modifiedLines.forEach((line, index) => {
          if (line !== originalLines[index]) {
            changes.push({
              type: 'add',
              content: line,
              lineNumber: index + 1
            });
          }
        });
      }
    } else {
      suggestion = '程式碼的語法有小問題，可能是忘記加冒號、括號沒有配對。仔細檢查一下每行程式碼的符號是否正確。';
      // 嘗試添加冒號
      const originalCode = code;
      modifiedCode = code.replace(/^(\s*(if|elif|else|for|while|def|class|try|except|finally|with)\s+[^:]*?)\s*$/gm, '$1:');
      if (modifiedCode !== originalCode) {
        const modifiedLines = modifiedCode.split('\n');
        const originalLines = originalCode.split('\n');
        
        modifiedLines.forEach((line, index) => {
          if (line !== originalLines[index]) {
            changes.push({
              type: 'add',
              content: line,
              lineNumber: index + 1
            });
          }
        });
      }
    }
  } else {
    suggestion = '程式執行時遇到了問題，通常是邏輯錯誤或語法問題。仔細看看錯誤提示，它會告訴你哪裡出了狀況。';
  }

  return {
    suggestion,
    diff: {
      original: code,
      modified: modifiedCode,
      changes
    }
  };
}

