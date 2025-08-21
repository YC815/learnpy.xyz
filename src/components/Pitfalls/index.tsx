"use client";

import React, { useState } from 'react';
import { PitfallsProps, PitfallItem } from './types';

interface PitfallCardProps {
  pitfall: PitfallItem;
  index: number;
}

const PitfallCard: React.FC<PitfallCardProps> = ({ pitfall, index }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="border border-amber-500/30 rounded-lg overflow-hidden bg-slate-800/60 backdrop-blur-sm">
      {/* Header - Always Visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 text-left hover:bg-slate-700/40 transition-colors"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <div className="w-6 h-6 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center shadow">
                <i className="fa-solid fa-exclamation-triangle text-white text-xs"></i>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-amber-300">
                常見錯誤 {index + 1}
              </h4>
              <p className="text-sm text-amber-200 mt-1">
                {pitfall.symptom}
              </p>
            </div>
          </div>
          <div className="flex-shrink-0 text-amber-400">
            <i className={`fa-solid ${isExpanded ? 'fa-chevron-up' : 'fa-chevron-down'} transition-transform`}></i>
          </div>
        </div>
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-4 pb-4 border-t border-amber-500/30 bg-slate-700/40">
          <div className="space-y-4 pt-4">
            {/* Why Section */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <i className="fa-solid fa-lightbulb text-yellow-400"></i>
                <h5 className="font-medium text-stone-200">為什麼會這樣？</h5>
              </div>
              <p className="text-stone-300 text-sm leading-relaxed pl-6">
                {pitfall.why}
              </p>
            </div>

            {/* Fix Section */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <i className="fa-solid fa-wrench text-emerald-400"></i>
                <h5 className="font-medium text-stone-200">解決方法</h5>
              </div>
              <div className="pl-6">
                <p className="text-stone-300 text-sm leading-relaxed mb-3">
                  {pitfall.fix}
                </p>
                
                {/* Code Example (if fix contains code) */}
                {pitfall.fix.includes('```') && (
                  <div className="bg-slate-900 text-emerald-400 p-3 rounded text-xs font-mono border border-slate-600/40">
                    <pre>{extractCodeFromFix(pitfall.fix)}</pre>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const Pitfalls: React.FC<PitfallsProps> = ({ items }) => {
  const [expandedAll, setExpandedAll] = useState(false);

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div className="my-6">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <i className="fa-solid fa-triangle-exclamation text-amber-400 text-xl"></i>
          <h3 className="text-lg font-semibold text-stone-200">
            常見陷阱 & 錯誤
          </h3>
        </div>
        
        <button
          onClick={() => setExpandedAll(!expandedAll)}
          className="text-sm text-amber-300 hover:text-amber-200 font-medium transition-colors"
        >
          {expandedAll ? '全部收合' : '全部展開'}
        </button>
      </div>

      {/* Description */}
      <p className="text-sm text-stone-400 mb-4">
        學習程式設計時，這些是最容易遇到的問題。點擊查看詳細說明和解決方案。
      </p>

      {/* Pitfall Cards */}
      <div className="space-y-3">
        {items.map((pitfall, index) => (
          <PitfallCard
            key={index}
            pitfall={pitfall}
            index={index}
          />
        ))}
      </div>

      {/* Footer Tip */}
      <div className="mt-4 p-3 bg-slate-700/40 border border-slate-600/40 rounded-lg backdrop-blur-sm">
        <div className="flex items-start gap-2">
          <i className="fa-solid fa-info-circle text-cyan-400 mt-0.5"></i>
          <div>
            <p className="text-sm text-stone-300">
              <strong className="text-cyan-300">小提示：</strong>
              遇到錯誤時不要害怕！每個程式設計師都會遇到這些問題。
              重要的是學會如何讀懂錯誤訊息，並找到解決方法。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function to extract code from fix description
function extractCodeFromFix(fix: string): string {
  const codeMatch = fix.match(/```(?:python)?\n?([\s\S]*?)```/);
  if (codeMatch) {
    return codeMatch[1].trim();
  }
  return '';
}

// Override expanded state for all cards when expandedAll changes
export const PitfallsWithGlobalExpand: React.FC<PitfallsProps> = ({ items }) => {
  const [expandedAll, setExpandedAll] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());

  const handleExpandAll = () => {
    const newExpandedAll = !expandedAll;
    setExpandedAll(newExpandedAll);
    
    if (newExpandedAll) {
      setExpandedItems(new Set(items.map((_, index) => index)));
    } else {
      setExpandedItems(new Set());
    }
  };

  const handleItemToggle = (index: number) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedItems(newExpanded);
    
    // Update expandedAll state based on individual items
    setExpandedAll(newExpanded.size === items.length);
  };

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div className="my-6">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <i className="fa-solid fa-triangle-exclamation text-amber-500 text-xl"></i>
          <h3 className="text-lg font-semibold text-gray-800">
            常見陷阱 & 錯誤
          </h3>
        </div>
        
        <button
          onClick={handleExpandAll}
          className="text-sm text-amber-600 hover:text-amber-800 font-medium"
        >
          {expandedAll ? '全部收合' : '全部展開'}
        </button>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-600 mb-4">
        學習程式設計時，這些是最容易遇到的問題。點擊查看詳細說明和解決方案。
      </p>

      {/* Pitfall Cards */}
      <div className="space-y-3">
        {items.map((pitfall, index) => (
          <PitfallCardWithState
            key={index}
            pitfall={pitfall}
            index={index}
            isExpanded={expandedItems.has(index)}
            onToggle={() => handleItemToggle(index)}
          />
        ))}
      </div>

      {/* Footer Tip */}
      <div className="mt-4 p-3 bg-slate-700/40 border border-slate-600/40 rounded-lg backdrop-blur-sm">
        <div className="flex items-start gap-2">
          <i className="fa-solid fa-info-circle text-cyan-400 mt-0.5"></i>
          <div>
            <p className="text-sm text-stone-300">
              <strong className="text-cyan-300">小提示：</strong>
              遇到錯誤時不要害怕！每個程式設計師都會遇到這些問題。
              重要的是學會如何讀懂錯誤訊息，並找到解決方法。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

interface PitfallCardWithStateProps {
  pitfall: PitfallItem;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
}

const PitfallCardWithState: React.FC<PitfallCardWithStateProps> = ({
  pitfall,
  index,
  isExpanded,
  onToggle
}) => {
  return (
    <div className="border border-amber-200 rounded-lg overflow-hidden bg-amber-50">
      {/* Header - Always Visible */}
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 text-left hover:bg-amber-100 transition-colors"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <div className="w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center">
                <i className="fa-solid fa-exclamation-triangle text-white text-xs"></i>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-amber-800">
                常見錯誤 {index + 1}
              </h4>
              <p className="text-sm text-amber-700 mt-1">
                {pitfall.symptom}
              </p>
            </div>
          </div>
          <div className="flex-shrink-0 text-amber-600">
            <i className={`fa-solid ${isExpanded ? 'fa-chevron-up' : 'fa-chevron-down'} transition-transform`}></i>
          </div>
        </div>
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-4 pb-4 border-t border-amber-500/30 bg-slate-700/40">
          <div className="space-y-4 pt-4">
            {/* Why Section */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <i className="fa-solid fa-lightbulb text-yellow-400"></i>
                <h5 className="font-medium text-stone-200">為什麼會這樣？</h5>
              </div>
              <p className="text-stone-300 text-sm leading-relaxed pl-6">
                {pitfall.why}
              </p>
            </div>

            {/* Fix Section */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <i className="fa-solid fa-wrench text-emerald-400"></i>
                <h5 className="font-medium text-stone-200">解決方法</h5>
              </div>
              <div className="pl-6">
                <p className="text-stone-300 text-sm leading-relaxed mb-3">
                  {pitfall.fix}
                </p>
                
                {/* Code Example (if fix contains code) */}
                {pitfall.fix.includes('```') && (
                  <div className="bg-slate-900 text-emerald-400 p-3 rounded text-xs font-mono border border-slate-600/40">
                    <pre>{extractCodeFromFix(pitfall.fix)}</pre>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};