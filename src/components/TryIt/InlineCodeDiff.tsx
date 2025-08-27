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

interface DiffLine {
  type: 'unchanged' | 'removed' | 'added' | 'context';
  oldLineNumber: number | null;
  newLineNumber: number | null;
  content: string;
  hasWordLevelChanges?: boolean;
  wordDiff?: Array<{ type: 'unchanged' | 'removed' | 'added'; text: string }>;
}

// 簡單的字詞級別差異計算
function computeWordDiff(oldText: string, newText: string): Array<{ type: 'unchanged' | 'removed' | 'added'; text: string }> {
  const oldWords = oldText.split(/(\s+)/);
  const newWords = newText.split(/(\s+)/);
  const result: Array<{ type: 'unchanged' | 'removed' | 'added'; text: string }> = [];
  
  // 簡化版本：只處理完全不同的情況
  if (oldText === newText) {
    result.push({ type: 'unchanged', text: oldText });
  } else {
    if (oldText) result.push({ type: 'removed', text: oldText });
    if (newText) result.push({ type: 'added', text: newText });
  }
  
  return result;
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

  // 建立統一的差異視圖
  const diffLines: DiffLine[] = [];
  let oldLineIndex = 0;
  let newLineIndex = 0;
  const maxLines = Math.max(originalLines.length, suggestedLines.length);

  // 簡化的差異算法：基於 changes 數組
  const changedLineNumbers = new Set(changes.map(c => c.lineNumber));
  
  for (let i = 0; i < maxLines; i++) {
    const lineNumber = i + 1;
    const isChanged = changedLineNumbers.has(lineNumber);
    const oldLine = originalLines[i];
    const newLine = suggestedLines[i];
    
    if (!isChanged && oldLine === newLine) {
      // 未變更的行
      diffLines.push({
        type: 'unchanged',
        oldLineNumber: oldLine !== undefined ? lineNumber : null,
        newLineNumber: newLine !== undefined ? lineNumber : null,
        content: oldLine || newLine || ''
      });
    } else {
      // 有變更的行
      if (oldLine !== undefined) {
        const removeChange = changes.find(c => c.lineNumber === lineNumber && c.type === 'remove');
        if (removeChange || (newLine === undefined)) {
          diffLines.push({
            type: 'removed',
            oldLineNumber: lineNumber,
            newLineNumber: null,
            content: oldLine
          });
        }
      }
      
      if (newLine !== undefined) {
        const addChange = changes.find(c => c.lineNumber === lineNumber && c.type === 'add');
        if (addChange || (oldLine === undefined)) {
          diffLines.push({
            type: 'added',
            oldLineNumber: null,
            newLineNumber: lineNumber,
            content: newLine
          });
        }
      }
      
      // 如果是修改行（既有刪除又有添加）
      if (oldLine !== undefined && newLine !== undefined && oldLine !== newLine) {
        diffLines.push({
          type: 'removed',
          oldLineNumber: lineNumber,
          newLineNumber: null,
          content: oldLine
        });
        diffLines.push({
          type: 'added',
          oldLineNumber: null,
          newLineNumber: lineNumber,
          content: newLine,
          hasWordLevelChanges: true,
          wordDiff: computeWordDiff(oldLine, newLine)
        });
      }
    }
  }
  
  return (
    <div className="absolute inset-0 bg-slate-900 bg-opacity-95 backdrop-blur-sm flex flex-col">
      {/* Header - Fixed height */}
      <div className="flex-shrink-0 bg-slate-800 border-b border-slate-600 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <i className="fa-solid fa-code-compare text-cyan-400"></i>
          <span className="text-slate-200 font-medium text-sm">程式碼差異比較</span>
        </div>
        
        {/* 操作按鈕 */}
        <div className="flex items-center gap-2">
          <button
            onClick={onReject}
            className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-medium transition-colors"
            title="拒絕修正"
          >
            <i className="fa-solid fa-times mr-1"></i>
            拒絕
          </button>
          <button
            onClick={onAccept}
            className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs font-medium transition-colors"
            title="接受修正"
          >
            <i className="fa-solid fa-check mr-1"></i>
            接受
          </button>
        </div>
      </div>

      {/* Git diff 風格的統一視圖 - Scrollable content */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <div 
          className="font-mono text-xs"
          style={{ 
            fontFamily: "'Menlo', 'Monaco', 'Consolas', 'Liberation Mono', 'DejaVu Sans Mono', 'Bitstream Vera Sans Mono', 'Courier New', monospace",
            lineHeight: '1.3'
          }}
        >
          {diffLines.map((line, index) => {
            const getLineClasses = () => {
              switch (line.type) {
                case 'removed':
                  return 'bg-red-900/30 border-l-2 border-red-500';
                case 'added':
                  return 'bg-green-900/30 border-l-2 border-green-500';
                case 'unchanged':
                  return 'bg-slate-800/50';
                default:
                  return 'bg-slate-800/50';
              }
            };

            const getLinePrefix = () => {
              switch (line.type) {
                case 'removed':
                  return { symbol: '-', color: 'text-red-400' };
                case 'added':
                  return { symbol: '+', color: 'text-green-400' };
                default:
                  return { symbol: ' ', color: 'text-slate-500' };
              }
            };

            const prefix = getLinePrefix();
            const lineClasses = getLineClasses();

            // 格式化行號
            const formatLineNumber = (num: number | null, width: number = 3) => {
              return num ? num.toString().padStart(width, ' ') : ''.padStart(width, ' ');
            };

            return (
              <div
                key={index}
                className={`px-2 py-0.5 ${lineClasses} flex hover:bg-slate-700/30 transition-colors`}
              >
                {/* 雙行號系統 - Compact */}
                <div className="flex-shrink-0 mr-2 text-slate-400 select-none text-xs">
                  <span className="inline-block w-6 text-right mr-1">
                    {line.oldLineNumber ? formatLineNumber(line.oldLineNumber, 3) : ''}
                  </span>
                  <span className="text-slate-600">:</span>
                  <span className="inline-block w-6 text-right ml-1">
                    {line.newLineNumber ? formatLineNumber(line.newLineNumber, 3) : ''}
                  </span>
                </div>

                {/* 差異符號 */}
                <div className={`flex-shrink-0 w-4 ${prefix.color} font-bold`}>
                  {prefix.symbol}
                </div>

                {/* 程式碼內容 */}
                <div className="flex-1 text-slate-200 whitespace-pre-wrap break-words min-w-0">
                  {line.hasWordLevelChanges && line.wordDiff ? (
                    // 字詞級別差異高亮
                    line.wordDiff.map((word, wordIndex) => (
                      <span
                        key={wordIndex}
                        className={
                          word.type === 'removed' 
                            ? 'bg-red-600/50 text-red-200' 
                            : word.type === 'added'
                            ? 'bg-green-600/50 text-green-200'
                            : ''
                        }
                      >
                        {word.text}
                      </span>
                    ))
                  ) : (
                    // 普通程式碼內容，保持語法高亮的基礎顏色
                    <span className={
                      line.type === 'removed' 
                        ? 'text-red-200' 
                        : line.type === 'added'
                        ? 'text-green-200'
                        : 'text-slate-200'
                    }>
                      {line.content || ' '}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 底部說明 - Fixed height and compact */}
      <div className="flex-shrink-0 bg-slate-800 border-t border-slate-600 px-2 py-1 text-xs text-slate-400">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <span className="text-red-400 font-bold">-</span>
              <span>刪除</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-green-400 font-bold">+</span>
              <span>新增</span>
            </div>
          </div>
          <div>
            <span>舊:新</span>
          </div>
        </div>
      </div>
    </div>
  );
};