import React from 'react';

interface CourseProgressBarProps {
  totalExercises: number;
  bossExercises: number;
  completedExercises: number;
  completedBossExercises: number;
}

export default function CourseProgressBar({
  totalExercises,
  bossExercises,
  completedExercises,
  completedBossExercises
}: CourseProgressBarProps) {
  const regularExercises = totalExercises - bossExercises;
  const completedRegularExercises = completedExercises - completedBossExercises;
  
  if (totalExercises === 0) {
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
          <span className="text-stone-300">{completedExercises}/{totalExercises}</span>
          {bossExercises > 0 && (
            <span className="text-yellow-400 flex items-center gap-1">
              <i className="fa-solid fa-crown text-xs"></i>
              {completedBossExercises}/{bossExercises}
            </span>
          )}
        </div>
      </div>
      
      <div className="flex gap-1">
        {/* 一般練習進度條 */}
        {Array.from({ length: regularExercises }, (_, index) => (
          <div
            key={`regular-${index}`}
            className={`h-2 rounded-full transition-all duration-300 ${
              index < completedRegularExercises 
                ? 'bg-gradient-to-r from-orange-500 to-red-500' 
                : 'bg-stone-600'
            }`}
            style={{
              flex: 1,
              minWidth: '4px'
            }}
          ></div>
        ))}
        
        {/* Boss 練習進度條 */}
        {Array.from({ length: bossExercises }, (_, index) => (
          <div
            key={`boss-${index}`}
            className={`h-2 rounded-full transition-all duration-300 relative ${
              index < completedBossExercises 
                ? 'bg-gradient-to-r from-yellow-400 to-amber-500' 
                : 'bg-stone-600 border border-yellow-400/30'
            }`}
            style={{
              flex: 1.5, // Boss 練習稍微寬一點
              minWidth: '6px'
            }}
            title="Boss 挑戰"
          >
            {/* Boss 皇冠圖標 */}
            {index < completedBossExercises && (
              <div className="absolute -top-1 left-1/2 transform -translate-x-1/2">
                <i className="fa-solid fa-crown text-yellow-300 text-xs"></i>
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* 圖例 */}
      {bossExercises > 0 && (
        <div className="flex items-center gap-4 mt-2 text-xs text-stone-400">
          <div className="flex items-center gap-1">
            <div className="w-3 h-1 bg-gradient-to-r from-orange-500 to-red-500 rounded-full"></div>
            <span>一般練習</span>
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