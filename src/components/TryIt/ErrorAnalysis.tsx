"use client";

import React, { useState } from 'react';
import { AiSuggestion } from './types';
import { DiffViewer } from './DiffViewer';

interface ErrorAnalysisProps {
  originalError: string;
  code: string;
  onCodeUpdate: (newCode: string) => void;
  onClose: () => void;
}

export const ErrorAnalysis: React.FC<ErrorAnalysisProps> = ({
  originalError,
  code,
  onCodeUpdate,
  onClose
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<AiSuggestion | null>(null);
  const [error, setError] = useState<string | null>(null);

  const analyzeError = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/analyze-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code,
          error: originalError
        }),
      });

      if (!response.ok) {
        throw new Error('分析失敗');
      }

      const suggestion: AiSuggestion = await response.json();
      setAiSuggestion(suggestion);
    } catch (err) {
      setError(err instanceof Error ? err.message : '分析時發生錯誤');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptSuggestion = () => {
    if (aiSuggestion) {
      onCodeUpdate(aiSuggestion.diff.modified);
      onClose();
    }
  };

  const handleRejectSuggestion = () => {
    setAiSuggestion(null);
  };

  React.useEffect(() => {
    analyzeError();
  }, [code, originalError]);

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
          
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center gap-2 text-gray-600">
                <i className="fa-solid fa-spinner fa-spin"></i>
                AI 正在分析中...
              </div>
            </div>
          )}

          {error && (
            <div className="bg-yellow-50 border border-yellow-200 rounded p-3 text-yellow-800">
              <i className="fa-solid fa-exclamation-triangle mr-2"></i>
              {error}
              <button
                onClick={analyzeError}
                className="ml-2 text-blue-600 hover:text-blue-800 underline"
              >
                重試
              </button>
            </div>
          )}

          {aiSuggestion && (
            <div className="space-y-4">
              {/* AI Suggestion */}
              <div className="bg-white border rounded p-3">
                <p className="text-gray-700 text-sm leading-relaxed">
                  {aiSuggestion.suggestion}
                </p>
              </div>

              {/* Diff Viewer */}
              {aiSuggestion.diff.changes.length > 0 && (
                <DiffViewer
                  changes={aiSuggestion.diff.changes}
                  onAccept={handleAcceptSuggestion}
                  onReject={handleRejectSuggestion}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};