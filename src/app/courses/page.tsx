"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import CourseProgressBar from '@/components/CourseProgressBar';

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
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  
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
  
  // TODO: Replace with actual user progress from database
  // Simulate user progress for different courses
  const getExerciseProgress = (courseId: number): { regular: number; boss: number } => {
    // Simulate different progress for each course
    const mockProgress = {
      1: { regular: 2, boss: 1 }, // 2 regular + 1 boss completed
      2: { regular: 1, boss: 0 }, // 1 regular completed
      3: { regular: 0, boss: 0 }, // No exercises completed
      7: { regular: 4, boss: 1 }, // 4 regular + 1 boss completed
      // Other courses have no progress
    };
    return mockProgress[courseId as keyof typeof mockProgress] || { regular: 0, boss: 0 };
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
      {/* Navigation */}
      <div className="fixed top-6 left-6 z-50 flex items-center gap-4">
        <Link href="/">
          <button className="group bg-stone-700 hover:bg-stone-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110">
            <i className="fa-solid fa-home text-xl group-hover:-translate-y-1 transition-transform"></i>
          </button>
        </Link>
        <span className="text-stone-100 text-xl font-medium">課程總覽</span>
      </div>

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
              
              return (
                <div
                  key={course.id}
                  className="bg-gradient-to-r from-stone-700/50 to-stone-800/50 backdrop-blur-sm border border-stone-600/30 hover:border-orange-400/50 rounded-3xl p-8 transition-all duration-300 group"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-6">
                      <div className="bg-orange-500 text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold">
                        {course.id}
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold mb-2 text-stone-100">
                          {course.title}
                        </h3>
                        <p className="mb-3 text-stone-300">
                          {course.description}
                        </p>
                        <div className="flex items-center gap-4 text-sm">
                          <span className={`font-medium ${getLevelColor(course.level)}`}>
                            <i className="fa-solid fa-signal mr-1"></i>
                            {course.level}
                          </span>
                          <span className="text-stone-400">
                            <i className="fa-solid fa-list mr-1"></i>
                            {course.actualExercises > 0 ? `${course.actualExercises} 個練習` : '敬請期待'}
                          </span>
                          {course.bossExercises > 0 && (
                            <span className="text-yellow-400">
                              <i className="fa-solid fa-crown mr-1"></i>
                              {course.bossExercises} 個 Boss 挑戰
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    {course.hasArticles && course.firstArticle ? (
                      <Link href={`/courses/${course.id}/${course.firstArticle.slug}`}>
                        <button className="bg-orange-500 text-white px-8 py-4 rounded-xl text-lg font-medium hover:bg-orange-600 group-hover:scale-105 transform transition-colors">
                          開始學習
                          <i className="fa-solid fa-arrow-right ml-2"></i>
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
                  <CourseProgressBar
                    totalExercises={course.actualExercises}
                    bossExercises={course.bossExercises}
                    completedExercises={totalCompleted}
                    completedBossExercises={progress.boss}
                  />
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