"use client";

import React from 'react';
import { DiffChange } from './types';

interface DiffViewerProps {
  changes: DiffChange[];
  onAccept: () => void;
  onReject: () => void;
}

export const DiffViewer: React.FC<DiffViewerProps> = ({
  changes,
  onAccept,
  onReject
}) => {
  return (
    <div className="border rounded-lg bg-white shadow-sm">
      {/* Header */}
      <div className="px-4 py-3 bg-gray-50 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <i className="fa-solid fa-code-compare text-blue-500"></i>
          <h4 className="font-medium text-gray-800">程式碼修正建議</h4>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onReject}
            className="w-8 h-8 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors flex items-center justify-center"
            title="拒絕修正"
          >
            <i className="fa-solid fa-times text-sm"></i>
          </button>
          <button
            onClick={onAccept}
            className="w-8 h-8 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors flex items-center justify-center"
            title="接受修正"
          >
            <i className="fa-solid fa-check text-sm"></i>
          </button>
        </div>
      </div>
      
      {/* Diff Content */}
      <div className="p-0 font-mono text-sm">
        {changes.map((change, index) => (
          <div
            key={index}
            className={`flex ${
              change.type === 'add'
                ? 'bg-green-50 border-l-4 border-l-green-400'
                : change.type === 'remove'
                ? 'bg-red-50 border-l-4 border-l-red-400'
                : 'bg-white border-l-4 border-l-gray-200'
            }`}
          >
            <div className="w-12 px-2 py-1 text-gray-500 text-xs text-right border-r">
              {change.lineNumber}
            </div>
            <div
              className={`flex-1 px-3 py-1 whitespace-pre-wrap ${
                change.type === 'remove' ? 'line-through text-red-600' : ''
              } ${change.type === 'add' ? 'text-green-700' : ''}`}
            >
              {change.type === 'add' && (
                <span className="inline-block w-4 text-green-500 font-bold">+</span>
              )}
              {change.type === 'remove' && (
                <span className="inline-block w-4 text-red-500 font-bold">-</span>
              )}
              {change.type === 'unchanged' && (
                <span className="inline-block w-4 text-gray-400"> </span>
              )}
              {change.content}
            </div>
          </div>
        ))}
      </div>
      
      {/* Footer */}
      <div className="px-4 py-2 bg-gray-50 border-t text-xs text-gray-600">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-200 border border-green-400"></div>
            <span>新增</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-red-200 border border-red-400"></div>
            <span>刪除</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-white border border-gray-300"></div>
            <span>無變更</span>
          </div>
        </div>
      </div>
    </div>
  );
};