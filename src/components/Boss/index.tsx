"use client";

import React, { useState, useRef } from 'react';
import { useUser } from '@clerk/nextjs';
import { CodeEditor } from '../TryIt/CodeEditor';
import { PythonExecutor } from '../TryIt/PythonExecutor';
import { PythonError, ExecutionResult } from '../TryIt/types';

interface TestCase {
  inputs: string[];
  outputs: string[];
}

interface BossProps {
  title: string;
  description: string;
  testCases: TestCase[];
  // 資料庫整合相關
  courseId?: number;
  articleSlug?: string;
}

interface TestResult {
  passed: boolean;
  input: string[];
  expectedOutput: string[];
  actualOutput: string;
  error?: string;
}

export const Boss: React.FC<BossProps> = ({ title, description, testCases, courseId, articleSlug }) => {
  const { user, isLoaded } = useUser();
  const [code, setCode] = useState('# 在這裡實作你的解決方案\n');
  const [errors, setErrors] = useState<PythonError[]>([]);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [userInput, setUserInput] = useState<string>('');
  const [executionResult, setExecutionResult] = useState<ExecutionResult | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const testCaseRefs = useRef<(HTMLDivElement | null)[]>([]);
  
  // 拖拽調整佈局的狀態
  const [leftWidth, setLeftWidth] = useState(70); // 預設 70% (7:3 比例)
  const [isDragging, setIsDragging] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // 檢查是否在客戶端
  React.useEffect(() => {
    setIsClient(true);
  }, []);

  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
  };

  const handleErrorsChange = (newErrors: PythonError[]) => {
    setErrors(newErrors);
  };

  // 處理拖拽開始  
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  // 處理拖拽移動
  const handleMouseMove = React.useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    
    const container = document.querySelector('.boss-container');
    if (!container) return;
    
    const containerRect = container.getBoundingClientRect();
    const relativeX = e.clientX - containerRect.left;
    const containerWidth = containerRect.width;
    const newLeftWidth = (relativeX / containerWidth) * 100;
    
    // 限制範圍在 30% - 80% 之間
    const clampedWidth = Math.max(30, Math.min(80, newLeftWidth));
    setLeftWidth(clampedWidth);
  }, [isDragging]);

  // 處理拖拽結束
  const handleMouseUp = React.useCallback(() => {
    setIsDragging(false);
  }, []);

  // 添加全局事件監聽器
  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const handleExecute = async (result: ExecutionResult) => {
    setExecutionResult(result);
    setIsExecuting(false);
  };

  // 保存 Boss 程式碼提交和測試結果到資料庫
  const saveBossSubmission = async (code: string, testResults: TestResult[]) => {
    if (!user || !isLoaded || !courseId || !articleSlug) {
      return; // 如果沒有用戶認證或缺少必要資訊，不保存
    }

    const allPassed = testResults.every(result => result.passed);
    
    try {
      const bossTestResults = testResults.map((result, index) => ({
        testCaseIndex: index,
        passed: result.passed,
        expectedOutput: result.expectedOutput.join('\n'),
        actualOutput: result.actualOutput,
        errorMessage: result.error || null,
      }));

      const response = await fetch('/api/submissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          courseId: courseId,
          articleSlug: articleSlug,
          componentType: 'boss',
          componentId: 'boss-challenge',
          code: code,
          isSuccessful: allPassed,
          bossTestResults: bossTestResults,
        }),
      });

      if (!response.ok) {
        console.error('Failed to save boss submission:', await response.text());
      } else {
        const result = await response.json();
        console.log('Boss submission saved:', result);
        
        if (allPassed) {
          console.log('🎉 All tests passed! Boss challenge completed!');
        }
      }
    } catch (error) {
      console.error('Error saving boss submission:', error);
    }
  };

  const runAllTests = async () => {
    if (!code.trim()) {
      alert('請先撰寫程式碼！');
      return;
    }

    setIsRunningTests(true);
    setTestResults([]);

    const results: TestResult[] = [];

    for (let i = 0; i < testCases.length; i++) {
      const testCase = testCases[i];
      try {
        // 動態導入 Pyodide 執行器
        const PyodideRunnerModule = await import('../TryIt/PyodideRunner');
        const pyodideRunner = PyodideRunnerModule.default.getInstance();
        
        const result = await pyodideRunner.execute(code, testCase.inputs);
        
        if (result.success) {
          const actualOutput = (result.output || '').trim();
          const expectedOutput = testCase.outputs.join('\n').trim();
          const passed = actualOutput === expectedOutput;
          
          results.push({
            passed,
            input: testCase.inputs,
            expectedOutput: testCase.outputs,
            actualOutput,
          });
        } else {
          results.push({
            passed: false,
            input: testCase.inputs,
            expectedOutput: testCase.outputs,
            actualOutput: '',
            error: result.error
          });
        }
      } catch (error) {
        results.push({
          passed: false,
          input: testCase.inputs,
          expectedOutput: testCase.outputs,
          actualOutput: '',
          error: error instanceof Error ? error.message : '執行錯誤'
        });
      }
    }

    setTestResults(results);
    setIsRunningTests(false);
    
    // 保存 Boss 提交結果到資料庫
    await saveBossSubmission(code, results);
  };

  const scrollToTestCase = (index: number) => {
    const element = testCaseRefs.current[index];
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
      // 添加高亮效果
      element.classList.add('ring-2', 'ring-amber-400', 'ring-opacity-75');
      setTimeout(() => {
        element.classList.remove('ring-2', 'ring-amber-400', 'ring-opacity-75');
      }, 2000);
    }
  };

  return (
    <div 
      id="boss-challenge"
      className="my-8 bg-gradient-to-r from-slate-800/80 to-slate-700/80 border-2 border-amber-500/30 rounded-xl overflow-hidden shadow-xl backdrop-blur-sm boss-container"
      style={{ scrollMarginTop: '100px' }}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-600/20 to-yellow-600/20 border-b border-amber-500/20 p-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-full flex items-center justify-center shadow-lg">
            <i className="fa-solid fa-crown text-amber-100 text-2xl"></i>
          </div>
          <div className="flex-1 text-amber-100">
            <div className="flex items-center gap-2 mb-2">
              <i className="fa-solid fa-star text-amber-400"></i>
              <span className="text-sm font-semibold uppercase tracking-wide">Boss 挑戰</span>
            </div>
            <h3 className="text-2xl font-bold">{title}</h3>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* 1. Description */}
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-stone-200 mb-3 flex items-center gap-2">
            <i className="fa-solid fa-scroll text-amber-400"></i>
            題目描述
          </h4>
          <div className="bg-slate-800/60 rounded-lg p-4 border border-slate-600/40">
            <p className="text-stone-300 leading-relaxed whitespace-pre-line">
              {description}
            </p>
          </div>
        </div>

        {/* 2. Code Editor Section */}
        <div className="mb-8">
          <h4 className="text-lg font-semibold text-stone-200 mb-3 flex items-center gap-2">
            <i className="fa-solid fa-code text-amber-400"></i>
            程式碼編輯器
          </h4>
          
          {/* Editor Container - TryIt Layout */}
          <div className="border border-slate-600/40 rounded-lg overflow-hidden bg-slate-800/60 shadow-xl backdrop-blur-sm">
            {/* Header */}
            <div className="bg-slate-700/60 px-4 py-3 border-b border-slate-600/40 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <i className="fa-solid fa-crown text-amber-400"></i>
                <span className="text-sm font-medium text-stone-200">Boss 挑戰編輯器</span>
                {errors.length > 0 && (
                  <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded border border-red-500/30">
                    {errors.length} 個語法錯誤
                  </span>
                )}
              </div>
              
              <div className="flex gap-2">
                <PythonExecutor
                  code={code}
                  userInput={userInput}
                  onExecute={handleExecute}
                  isExecuting={isExecuting}
                />
                <button
                  onClick={runAllTests}
                  disabled={isRunningTests}
                  className="bg-gradient-to-r from-amber-500 to-yellow-500 text-stone-900 px-4 py-2 rounded-lg font-medium hover:from-amber-600 hover:to-yellow-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isRunningTests ? (
                    <>
                      <i className="fa-solid fa-spinner fa-spin"></i>
                      測試中...
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-flask"></i>
                      執行所有測試
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Main Content - Responsive Height Layout */}
            <div className="flex flex-col md:flex-row h-[500px] md:h-[550px] lg:h-[600px]">
              {/* Code Editor - Resizable width on desktop */}
              <div 
                className="flex-1 md:border-r border-slate-600/40 relative" 
                style={{ 
                  width: isClient && window.innerWidth >= 768 ? `${leftWidth}%` : '100%' 
                }}
              >
                <div className="h-full">
                  <CodeEditor
                    value={code}
                    onChange={handleCodeChange}
                    onErrorsChange={handleErrorsChange}
                  />
                </div>
              </div>

              {/* Resizable Divider - Only visible on desktop */}
              <div 
                className="hidden md:block w-1 bg-slate-600/40 cursor-col-resize hover:bg-slate-500 transition-colors relative group"
                onMouseDown={handleMouseDown}
              >
                <div className="absolute inset-y-0 -left-1 -right-1 flex items-center justify-center group-hover:bg-slate-500/20">
                  <div className="w-0.5 h-8 bg-slate-400 opacity-60"></div>
                </div>
              </div>

              {/* Input/Output Panels - Resizable width on desktop */}
              <div 
                className="w-full flex flex-col" 
                style={{ 
                  width: isClient && window.innerWidth >= 768 ? `${100 - leftWidth}%` : '100%' 
                }}
              >
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
                      className="w-full h-24 md:h-32 lg:h-36 p-2 text-sm text-stone-200 bg-slate-900/60 border border-slate-600/40 rounded resize-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 placeholder-stone-500"
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
          </div>
        </div>

        {/* 3. Test Cases (Always Visible) */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-stone-200 flex items-center gap-2">
              <i className="fa-solid fa-vial text-amber-400"></i>
              測試案例 ({testCases.length} 個)
            </h4>
            
            {/* Test Results Summary (only show if results exist) */}
            {testResults.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {testResults.map((result, index) => (
                  <button
                    key={index}
                    onClick={() => scrollToTestCase(index)}
                    className={`w-10 h-10 rounded-lg font-bold text-white flex items-center justify-center transition-all duration-200 hover:scale-110 ${
                      result.passed 
                        ? 'bg-emerald-500 hover:bg-emerald-600' 
                        : 'bg-red-500 hover:bg-red-600'
                    }`}
                    title={`測試案例 ${index + 1}: ${result.passed ? '通過' : '失敗'}`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Test Cases Grid */}
          <div className="space-y-4">
            {testCases.map((testCase, index) => (
              <div 
                key={index} 
                ref={(el) => { testCaseRefs.current[index] = el; }}
                className="bg-slate-800/60 rounded-lg border border-slate-600/40 overflow-hidden transition-all duration-300"
              >
                <div className="bg-slate-700/60 px-4 py-3 border-b border-slate-600/40">
                  <div className="flex items-center gap-2">
                    <span className="bg-gradient-to-r from-amber-500 to-yellow-500 text-stone-900 text-sm font-medium px-2 py-1 rounded">
                      案例 {index + 1}
                    </span>
                    {testResults[index] && (
                      <span className={`text-xs px-2 py-1 rounded ${
                        testResults[index].passed 
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                          : 'bg-red-500/20 text-red-400 border border-red-500/30'
                      }`}>
                        {testResults[index].passed ? '✓ 通過' : '✗ 失敗'}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="p-4">
                  <div className={`grid gap-4 ${testResults[index] ? 'md:grid-cols-3' : 'md:grid-cols-2'}`}>
                    {/* Inputs */}
                    <div>
                      <h6 className="text-sm font-medium text-stone-300 mb-2 flex items-center gap-1">
                        <i className="fa-solid fa-arrow-right text-cyan-400 text-xs"></i>
                        輸入
                      </h6>
                      <div className="bg-slate-900/60 rounded p-3 font-mono text-sm border border-slate-600/30">
                        {testCase.inputs.map((input, inputIndex) => (
                          <div key={inputIndex} className="text-cyan-300">
                            {input}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Expected Outputs */}
                    <div>
                      <h6 className="text-sm font-medium text-stone-300 mb-2 flex items-center gap-1">
                        <i className="fa-solid fa-arrow-left text-emerald-400 text-xs"></i>
                        期望輸出
                      </h6>
                      <div className="bg-slate-900/60 rounded p-3 font-mono text-sm border border-slate-600/30">
                        {testCase.outputs.map((output, outputIndex) => (
                          <div key={outputIndex} className="text-emerald-300">
                            {output}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Actual Output (only shown if test results exist) */}
                    {testResults[index] && (
                      <div>
                        <h6 className="text-sm font-medium text-stone-300 mb-2 flex items-center gap-1">
                          <i className={`fa-solid fa-play text-xs ${
                            testResults[index].passed ? 'text-emerald-400' : 'text-red-400'
                          }`}></i>
                          實際輸出
                        </h6>
                        <div className={`bg-slate-900/60 rounded p-3 font-mono text-sm border ${
                          testResults[index].passed 
                            ? 'border-emerald-500/30' 
                            : 'border-red-500/30'
                        }`}>
                          {testResults[index].error ? (
                            <div className="text-red-400">{testResults[index].error}</div>
                          ) : (
                            <div className={testResults[index].passed ? 'text-emerald-300' : 'text-red-300'}>
                              {testResults[index].actualOutput || '(無輸出)'}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Overall Test Summary (only show if results exist) */}
          {testResults.length > 0 && (
            <div className="mt-6 bg-slate-800/60 rounded-lg p-4 border border-slate-600/40">
              <div className="flex items-center gap-4">
                <div className="text-emerald-400">
                  <i className="fa-solid fa-check-circle mr-2"></i>
                  通過: {testResults.filter(r => r.passed).length}
                </div>
                <div className="text-red-400">
                  <i className="fa-solid fa-times-circle mr-2"></i>
                  失敗: {testResults.filter(r => !r.passed).length}
                </div>
                <div className="text-stone-300">
                  總計: {testResults.length}
                </div>
                <div className="ml-auto">
                  {testResults.filter(r => r.passed).length === testResults.length ? (
                    <span className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-sm border border-emerald-500/30">
                      🎉 全部通過！
                    </span>
                  ) : (
                    <span className="bg-amber-500/20 text-amber-400 px-3 py-1 rounded-full text-sm border border-amber-500/30">
                      繼續加油！
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};