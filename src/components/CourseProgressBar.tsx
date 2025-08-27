"use client";

import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

interface CourseProgressBarProps {
  courseId: number;
  articleSlug: string;
  totalTryItCount: number; // 該文章中的 TryIt 總數
  hasBossChallenge: boolean; // 是否有 Boss 挑戰
}

interface UserProgress {
  tryitUnlockedCount: number;
  bossCompleted: boolean;
}

export default function CourseProgressBar({
  courseId,
  articleSlug,
  totalTryItCount,
  hasBossChallenge
}: CourseProgressBarProps) {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchProgress = async () => {
      if (!user || !isLoaded) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `/api/progress?courseId=${courseId}&articleSlug=${articleSlug}`
        );
        
        if (response.ok) {
          const data = await response.json();
          if (data.progress && data.progress.length > 0) {
            setProgress(data.progress[0]);
          } else {
            // 沒有進度記錄，使用預設值
            setProgress({
              tryitUnlockedCount: 0,
              bossCompleted: false
            });
          }
        }
      } catch (error) {
        console.error('Error fetching progress:', error);
        setProgress({
          tryitUnlockedCount: 0,
          bossCompleted: false
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, [user, isLoaded, courseId, articleSlug]);

  // 點擊處理函數
  const handleTryItClick = (index: number) => {
    router.push(`/courses/${courseId}/${articleSlug}#tryit-${index + 1}`);
  };

  const handleBossClick = () => {
    router.push(`/courses/${courseId}/${articleSlug}#boss-challenge`);
  };

  // 如果未載入或沒有用戶，顯示預設狀態
  if (!isLoaded || loading) {
    return (
      <div className="mt-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-stone-300">練習進度</span>
          <span className="text-sm text-stone-300">載入中...</span>
        </div>
        <div className="h-2 bg-stone-600 rounded-full animate-pulse"></div>
      </div>
    );
  }

  // 如果沒有用戶登入，顯示訪客狀態
  if (!user) {
    return (
      <div className="mt-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-stone-300">練習進度</span>
          <span className="text-sm text-stone-300">請登入查看進度</span>
        </div>
        <div className="h-2 bg-stone-600 rounded-full"></div>
      </div>
    );
  }

  const tryitCompleted = Math.min(progress?.tryitUnlockedCount || 0, totalTryItCount);
  const bossCompleted = progress?.bossCompleted ? 1 : 0;
  const totalItems = totalTryItCount + (hasBossChallenge ? 1 : 0);
  const completedItems = tryitCompleted + bossCompleted;
  
  if (totalItems === 0) {
    return (
      <div className="mt-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-stone-300">練習進度</span>
          <span className="text-sm text-stone-300">敬請期待</span>
        </div>
        <div className="h-2 bg-stone-600 rounded-full"></div>
      </div>
    );
  }
  
  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-stone-300">練習進度</span>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-stone-300">{completedItems}/{totalItems}</span>
          {hasBossChallenge && (
            <span className="text-yellow-400 flex items-center gap-1">
              <i className="fa-solid fa-crown text-xs"></i>
              {bossCompleted}/1
            </span>
          )}
        </div>
      </div>
      
      <div className="flex gap-1">
        {/* TryIt 練習進度條 */}
        {Array.from({ length: totalTryItCount }, (_, index) => (
          <div
            key={`tryit-${index}`}
            onClick={() => handleTryItClick(index)}
            className={`h-2 rounded-full transition-all duration-300 cursor-pointer hover:scale-y-150 hover:h-3 ${
              index < tryitCompleted 
                ? 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-400 hover:to-red-400' 
                : 'bg-stone-600 hover:bg-stone-500'
            }`}
            style={{
              flex: 1,
              minWidth: '4px'
            }}
            title={`點擊跳轉到 TryIt 練習 ${index + 1}`}
          ></div>
        ))}
        
        {/* Boss 練習進度條 */}
        {hasBossChallenge && (
          <div
            onClick={handleBossClick}
            className={`h-2 rounded-full transition-all duration-300 relative cursor-pointer hover:scale-y-150 hover:h-3 ${
              bossCompleted > 0
                ? 'bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400' 
                : 'bg-stone-600 border border-yellow-400/30 hover:bg-stone-500 hover:border-yellow-400/50'
            }`}
            style={{
              flex: 1.5, // Boss 練習稍微寬一點
              minWidth: '6px'
            }}
            title="點擊跳轉到 Boss 挑戰"
          >
            {/* Boss 皇冠圖標 */}
            {bossCompleted > 0 && (
              <div className="absolute -top-1 left-1/2 transform -translate-x-1/2">
                <i className="fa-solid fa-crown text-yellow-300 text-xs"></i>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* 圖例 */}
      {hasBossChallenge && (
        <div className="flex items-center gap-4 mt-2 text-xs text-stone-400">
          <div className="flex items-center gap-1">
            <div className="w-3 h-1 bg-gradient-to-r from-orange-500 to-red-500 rounded-full"></div>
            <span>TryIt 練習</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-1 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full"></div>
            <i className="fa-solid fa-crown text-yellow-400 text-xs"></i>
            <span>Boss 挑戰</span>
          </div>
        </div>
      )}
    </div>
  );
}