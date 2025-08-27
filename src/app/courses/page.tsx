"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import CourseProgressBar from '@/components/CourseProgressBar';
import { AuthButtons, UserMenuButton } from '@/components';

const getLevelColor = (level: string) => {
  switch (level) {
    case '初級':
      return 'text-green-400';
    case '初中級':
      return 'text-yellow-400';
    case '中級':
      return 'text-orange-400';
    case '中高級':
      return 'text-red-400';
    case '高級':
      return 'text-purple-400';
    default:
      return 'text-gray-400';
  }
};

interface Course {
  id: number;
  title: string;
  description: string;
  level: string;
  exercises: number;
  actualExercises: number;
  bossExercises: number;
  hasArticles: boolean;
  firstArticle: {
    title: string;
    slug: string;
    path: string;
    hasBoss: boolean;
    practiceCount: number;
  } | null;
}

export default function Courses() {
  const { user, isLoaded } = useUser();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [userProgress, setUserProgress] = useState<{ [courseId: number]: { regular: number; boss: number } }>({});
  
  // 從 API 獲取課程資料和練習數量
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch('/api/courses/exercise-counts');
        const data = await response.json();
        setCourses(data.courses);
      } catch (error) {
        console.error('無法載入課程資料:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCourses();
  }, []);

  // 獲取真實用戶進度
  useEffect(() => {
    const fetchAllProgress = async () => {
      if (!user || !isLoaded || courses.length === 0) {
        return;
      }

      const progressData: { [courseId: number]: { regular: number; boss: number } } = {};
      
      try {
        for (const course of courses) {
          if (course.hasArticles && course.firstArticle) {
            const response = await fetch(
              `/api/progress?courseId=${course.id}&articleSlug=${course.firstArticle.slug}`
            );
            
            if (response.ok) {
              const data = await response.json();
              if (data.progress && data.progress.length > 0) {
                const progress = data.progress[0];
                progressData[course.id] = {
                  regular: Math.min(progress.tryitUnlockedCount || 0, course.actualExercises),
                  boss: progress.bossCompleted ? course.bossExercises : 0
                };
              } else {
                progressData[course.id] = { regular: 0, boss: 0 };
              }
            } else {
              progressData[course.id] = { regular: 0, boss: 0 };
            }
          }
        }
        setUserProgress(progressData);
      } catch (error) {
        console.error('Error fetching progress:', error);
      }
    };

    fetchAllProgress();
  }, [user, isLoaded, courses]);
  
  // 獲取課程進度（使用真實數據）
  const getExerciseProgress = (courseId: number): { regular: number; boss: number } => {
    return userProgress[courseId] || { regular: 0, boss: 0 };
  };

  // 判斷課程是否已完成
  const isCourseCompleted = (course: Course): boolean => {
    const progress = getExerciseProgress(course.id);
    const completedTotal = progress.regular + progress.boss;
    const requiredTotal = course.actualExercises + course.bossExercises;
    return requiredTotal > 0 && completedTotal >= requiredTotal;
  };
  
  // Calculate overall progress using actual exercise counts
  const totalExercises = courses.reduce((sum, course) => sum + course.actualExercises, 0);
  const completedExercises = courses.reduce((sum, course) => {
    const progress = getExerciseProgress(course.id);
    return sum + progress.regular + progress.boss;
  }, 0);
  const progressPercentage = totalExercises > 0 ? Math.round((completedExercises / totalExercises) * 100) : 0;
  
  if (loading) {
    return (
      <div className="min-h-screen bg-stone-900 flex items-center justify-center">
        <div className="text-stone-100 text-xl">載入課程資料中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-900">
      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-stone-900/80 backdrop-blur-sm border-b border-stone-700/50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          {/* Left Navigation */}
          <div className="flex items-center gap-4">
            <Link href="/">
              <button className="bg-stone-700 hover:bg-stone-600 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110">
                <i className="fa-solid fa-home text-lg"></i>
              </button>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-orange-400">課程總覽</h1>
              <p className="text-sm text-stone-400">選擇你的學習路徑</p>
            </div>
          </div>

          {/* Auth Section */}
          <div className="flex items-center gap-4">
            {isLoaded && (
              <>
                {user ? (
                  <UserMenuButton />
                ) : (
                  <AuthButtons />
                )}
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Course Progress Overview */}
      <section className="py-16 pt-32 bg-stone-800">
        <div className="max-w-6xl mx-auto px-4">
          <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-3xl p-8 border border-orange-500/20">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-stone-100">學習進度</h2>
              <div className="text-orange-400 text-xl font-semibold">{progressPercentage}% 完成</div>
            </div>
            <div className="w-full bg-stone-700 rounded-full h-4 mb-4">
              <div className="bg-gradient-to-r from-orange-500 to-red-500 h-4 rounded-full transition-all duration-500" style={{width: `${progressPercentage}%`}}></div>
            </div>
            <p className="text-stone-300">
              {progressPercentage === 0 ? '開始你的 Python 學習之旅！' : `已完成 ${completedExercises} / ${totalExercises} 個練習`}
            </p>
          </div>
        </div>
      </section>

      {/* Course List */}
      <section className="py-16 bg-stone-900">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16 text-stone-100">課程大綱</h2>
          
          <div className="space-y-6">
            {courses.map((course) => {
              const progress = getExerciseProgress(course.id);
              const totalCompleted = progress.regular + progress.boss;
              const isCompleted = isCourseCompleted(course);
              
              return (
                <div
                  key={course.id}
                  className={`${
                    isCompleted
                      ? 'bg-gradient-to-r from-stone-700/50 to-stone-800/50 border-orange-400/50 hover:border-orange-500/70'
                      : 'bg-gradient-to-r from-stone-800/30 to-stone-900/30 border-stone-700/30 hover:border-stone-600/50'
                  } backdrop-blur-sm border rounded-3xl p-8 transition-all duration-300 group`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-6">
                      <div className={`${
                        isCompleted ? 'bg-orange-500' : 'bg-stone-600'
                      } text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold transition-colors duration-300 relative`}>
                        {isCompleted && (
                          <div className="absolute -top-1 -right-1 bg-green-500 rounded-full w-6 h-6 flex items-center justify-center border-2 border-white">
                            <i className="fa-solid fa-check text-white text-xs"></i>
                          </div>
                        )}
                        {course.id}
                      </div>
                      <div>
                        <h3 className={`text-2xl font-bold mb-2 ${
                          isCompleted ? 'text-stone-100' : 'text-stone-300'
                        } transition-colors duration-300`}>
                          {course.title}
                        </h3>
                        <p className={`mb-3 ${
                          isCompleted ? 'text-stone-300' : 'text-stone-400'
                        } transition-colors duration-300`}>
                          {course.description}
                        </p>
                        <div className="flex items-center gap-4 text-sm">
                          <span className={`font-medium ${getLevelColor(course.level)}`}>
                            <i className="fa-solid fa-signal mr-1"></i>
                            {course.level}
                          </span>
                          <span className={`${
                            isCompleted ? 'text-stone-400' : 'text-stone-500'
                          } transition-colors duration-300`}>
                            <i className="fa-solid fa-list mr-1"></i>
                            {course.actualExercises > 0 ? `${course.actualExercises} 個練習` : '敬請期待'}
                          </span>
                          {course.bossExercises > 0 && (
                            <span className={`${
                              isCompleted ? 'text-yellow-400' : 'text-yellow-600'
                            } transition-colors duration-300`}>
                              <i className="fa-solid fa-crown mr-1"></i>
                              {course.bossExercises} 個 Boss 挑戰
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    {course.hasArticles && course.firstArticle ? (
                      <Link href={`/courses/${course.id}/${course.firstArticle.slug}`}>
                        <button className={`${
                          isCompleted
                            ? 'bg-green-500 hover:bg-green-600'
                            : 'bg-blue-600 hover:bg-blue-700'
                        } text-white px-8 py-4 rounded-xl text-lg font-medium group-hover:scale-105 transform transition-colors duration-300 shadow-lg hover:shadow-xl cursor-pointer`}>
                          {isCompleted ? (
                            <>
                              <i className="fa-solid fa-check mr-2"></i>
                              已完成
                            </>
                          ) : (
                            <>
                              開始學習
                              <i className="fa-solid fa-arrow-right ml-2"></i>
                            </>
                          )}
                        </button>
                      </Link>
                    ) : (
                      <button 
                        disabled 
                        className="bg-stone-600 text-stone-400 px-8 py-4 rounded-xl text-lg font-medium cursor-not-allowed"
                      >
                        敬請期待
                        <i className="fa-solid fa-clock ml-2"></i>
                      </button>
                    )}
                  </div>
                  
                  {/* Exercise Progress Bar */}
                  {course.hasArticles && course.firstArticle && (
                    <CourseProgressBar
                      courseId={course.id}
                      articleSlug={course.firstArticle.slug}
                      totalTryItCount={course.actualExercises}
                      hasBossChallenge={course.bossExercises > 0}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-stone-950 text-stone-400 py-8">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-lg">&copy; 2025 LearnPy.xyz</p>
        </div>
      </footer>
    </div>
  );
}