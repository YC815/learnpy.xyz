import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import coursesData from '@/data/courses.json';

/**
 * API 路由：動態計算課程練習數量
 */
export async function GET() {
  try {
    const { courses } = coursesData;
    
    const coursesWithActualCounts = courses.map(course => {
      const courseDir = path.join(process.cwd(), 'src', 'content', `course-${course.id}`);
      
      let totalExercises = 0;
      let bossExercises = 0;
      
      try {
        // 檢查課程目錄是否存在
        if (!fs.existsSync(courseDir)) {
          return {
            ...course,
            actualExercises: 0,
            bossExercises: 0
          };
        }
        
        // 讀取所有 MDX 文件
        const files = fs.readdirSync(courseDir).filter(file => file.endsWith('.mdx'));
        
        files.forEach(file => {
          const filePath = path.join(courseDir, file);
          const content = fs.readFileSync(filePath, 'utf-8');
          
          // 計算 TryIt 組件數量（一般練習）
          // 更寬泛的匹配模式，處理多行屬性
          const tryItMatches = content.match(/<TryIt[\s\S]*?\/>/g);
          if (tryItMatches) {
            totalExercises += tryItMatches.length;
          }
          
          // 計算 Boss 組件數量（boss 練習）
          // 更寬泛的匹配模式，處理多行屬性
          const bossMatches = content.match(/<Boss[\s\S]*?\/>/g);
          if (bossMatches) {
            bossExercises += bossMatches.length;
            // Boss 不算在一般練習數中，單獨計算
          }
        });
        
      } catch (error) {
        console.warn(`無法讀取課程 ${course.id} 的內容:`, error);
      }
      
      return {
        ...course,
        actualExercises: totalExercises,
        bossExercises: bossExercises,
        hasArticles: course.articles.length > 0,
        firstArticle: course.articles.length > 0 ? course.articles[0] : null
      };
    });
    
    return NextResponse.json({ courses: coursesWithActualCounts });
    
  } catch (error) {
    console.error('計算練習數量時發生錯誤:', error);
    return NextResponse.json(
      { error: '無法計算練習數量' },
      { status: 500 }
    );
  }
}