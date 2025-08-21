"use client";

import React from 'react';
import { DiffChange } from './types';

interface InlineCodeDiffProps {
  originalCode: string;
  suggestedCode: string;
  changes: DiffChange[];
  onAccept: () => void;
  onReject: () => void;
}

export const InlineCodeDiff: React.FC<InlineCodeDiffProps> = ({
  originalCode,
  suggestedCode,
  changes,
  onAccept,
  onReject
}) => {
  const originalLines = originalCode.split('\n');
  const suggestedLines = suggestedCode.split('\n');

  // 計算行對應關係
  const maxLines = Math.max(originalLines.length, suggestedLines.length);
  
  return (
    <div className="absolute inset-0 bg-white bg-opacity-95 backdrop-blur-sm flex">
      {/* 左側：原始程式碼 */}
      <div className="w-1/2 border-r border-gray-300 overflow-y-auto">
        <div className="bg-red-100 px-3 py-2 border-b border-red-200 text-sm font-medium text-red-800 flex items-center gap-2">
          <i className="fa-solid fa-minus-circle"></i>
          原始程式碼
        </div>
        <div style={{ fontFamily: "'Menlo', 'Monaco', 'Consolas', 'Liberation Mono', 'DejaVu Sans Mono', 'Bitstream Vera Sans Mono', 'Courier New', monospace", fontSize: '14px', lineHeight: '20px' }}>
          {originalLines.map((line, index) => {
            const lineNumber = index + 1;
            const hasChange = changes.some(c => c.lineNumber === lineNumber && c.type === 'remove');
            
            return (
              <div
                key={index}
                className={`px-3 py-1 ${hasChange ? 'bg-red-100 line-through text-red-700' : 'text-black'}`}
              >
                <span className="inline-block w-4 text-red-500 font-bold">
                  {hasChange ? '-' : ' '}
                </span>
                {line || ' '}
              </div>
            );
          })}
        </div>
      </div>

      {/* 右側：建議程式碼 */}
      <div className="w-1/2 overflow-y-auto">
        <div className="bg-green-100 px-3 py-2 border-b border-green-200 text-sm font-medium text-green-800 flex items-center gap-2">
          <i className="fa-solid fa-plus-circle"></i>
          建議修正
        </div>
        <div style={{ fontFamily: "'Menlo', 'Monaco', 'Consolas', 'Liberation Mono', 'DejaVu Sans Mono', 'Bitstream Vera Sans Mono', 'Courier New', monospace", fontSize: '14px', lineHeight: '20px' }}>
          {suggestedLines.map((line, index) => {
            const lineNumber = index + 1;
            const hasChange = changes.some(c => c.lineNumber === lineNumber && c.type === 'add');
            
            return (
              <div
                key={index}
                className={`px-3 py-1 ${hasChange ? 'bg-green-100 text-green-700' : 'text-black'}`}
              >
                <span className="inline-block w-4 text-green-500 font-bold">
                  {hasChange ? '+' : ' '}
                </span>
                {line || ' '}
              </div>
            );
          })}
        </div>
      </div>

      {/* 浮動操作按鈕 */}
      <div className="absolute bottom-4 right-4 flex items-center gap-2 bg-white shadow-lg rounded-lg p-2 border">
        <button
          onClick={onReject}
          className="w-10 h-10 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors flex items-center justify-center shadow"
          title="拒絕修正 (X)"
        >
          <i className="fa-solid fa-times"></i>
        </button>
        <button
          onClick={onAccept}
          className="w-10 h-10 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors flex items-center justify-center shadow"
          title="接受修正 (✓)"
        >
          <i className="fa-solid fa-check"></i>
        </button>
      </div>

      {/* 關閉按鈕 */}
      <button
        onClick={onReject}
        className="absolute top-2 right-2 w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center text-gray-600"
        title="關閉"
      >
        <i className="fa-solid fa-times text-sm"></i>
      </button>

      {/* 說明 */}
      <div className="absolute top-2 left-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">
        <i className="fa-solid fa-info-circle mr-1"></i>
        AI 建議的程式碼修正
      </div>
    </div>
  );
};