"use client";

import React, { useState, useEffect } from 'react';
import { ExecutionResult } from './types';
import PyodideRunner from './PyodideRunner';

interface PythonExecutorProps {
  code: string;
  userInput: string;
  onExecute: (result: ExecutionResult) => void;
  isExecuting: boolean;
}

export const PythonExecutor: React.FC<PythonExecutorProps> = ({
  code,
  userInput,
  onExecute,
  isExecuting
}) => {
  const [pyodideRunner] = useState(() => PyodideRunner.getInstance());
  const [isInitializing, setIsInitializing] = useState(false);

  useEffect(() => {
    // 初始化 Pyodide
    const initializePyodide = async () => {
      if (!pyodideRunner.isReady() && !pyodideRunner.isInitializing()) {
        setIsInitializing(true);
        try {
          await pyodideRunner.initialize();
        } catch (error) {
          console.error('Pyodide initialization failed:', error);
        } finally {
          setIsInitializing(false);
        }
      }
    };

    initializePyodide();
  }, [pyodideRunner]);

  const executeCode = async () => {
    try {
      // 確保 Pyodide 已經初始化
      if (!pyodideRunner.isReady()) {
        if (!isInitializing) {
          setIsInitializing(true);
          await pyodideRunner.initialize();
          setIsInitializing(false);
        } else {
          // 如果正在初始化，稍等一下再試
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      // 處理用戶輸入
      const inputs = userInput.split('\n').filter(line => line.trim() !== '');
      
      // 使用 Pyodide 執行真實 Python 代碼
      const result = await pyodideRunner.execute(code, inputs);
      
      onExecute({
        success: result.success,
        output: result.output,
        error: result.error,
        executionTime: result.executionTime
      });
      
    } catch (error) {
      onExecute({
        success: false,
        error: error instanceof Error ? error.message : '執行時發生未知錯誤',
        executionTime: 0
      });
    }
  };

  return (
    <button
      onClick={executeCode}
      disabled={isExecuting || isInitializing}
      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
        isExecuting || isInitializing
          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
          : 'bg-green-500 text-white hover:bg-green-600'
      }`}
    >
      {isInitializing ? (
        <>
          <i className="fa-solid fa-spinner fa-spin mr-2"></i>
          初始化 Python...
        </>
      ) : isExecuting ? (
        <>
          <i className="fa-solid fa-spinner fa-spin mr-2"></i>
          執行中...
        </>
      ) : (
        <>
          <i className="fa-solid fa-play mr-2"></i>
          執行程式碼
        </>
      )}
    </button>
  );
};