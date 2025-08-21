import { notFound } from 'next/navigation';
import Link from 'next/link';
import fs from 'fs';
import path from 'path';
import coursesData from '@/data/courses.json';
import { MDXRenderer } from '@/components/MDXRenderer';

interface ArticlePageProps {
  params: Promise<{
    courseId: string;
    articleSlug: string;
  }>;
}

// 動態路由的靜態路徑生成
export async function generateStaticParams() {
  const { courses } = coursesData;
  const paths: { courseId: string; articleSlug: string }[] = [];
  
  courses.forEach(course => {
    course.articles.forEach(article => {
      paths.push({
        courseId: course.id.toString(),
        articleSlug: article.slug
      });
    });
  });
  
  return paths;
}

async function getArticleContent(courseId: string, articleSlug: string) {
  const { courses } = coursesData;
  const course = courses.find(c => c.id.toString() === courseId);
  
  if (!course) return null;
  
  const article = course.articles.find(a => a.slug === articleSlug);
  if (!article) return null;
  
  try {
    const filePath = path.join(process.cwd(), 'src', 'content', article.path);
    const content = fs.readFileSync(filePath, 'utf-8');
    
    return {
      course,
      article,
      content
    };
  } catch (error) {
    console.error('無法讀取文章:', error);
    return null;
  }
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { courseId, articleSlug } = await params;
  const articleData = await getArticleContent(courseId, articleSlug);
  
  if (!articleData) {
    notFound();
  }
  
  const { course, article, content } = articleData;
  
  return (
    <div className="min-h-screen bg-stone-900">
      {/* Navigation */}
      <div className="fixed top-6 left-6 z-50 flex items-center gap-4">
        <Link href="/courses">
          <button className="group bg-stone-700 hover:bg-stone-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110">
            <i className="fa-solid fa-arrow-left text-xl group-hover:-translate-x-1 transition-transform"></i>
          </button>
        </Link>
        <div className="text-stone-100">
          <div className="text-sm text-stone-400">課程 {course.id}</div>
          <div className="text-lg font-medium">{course.title}</div>
        </div>
      </div>
      
      {/* Article Header */}
      <section className="py-16 pt-32 bg-stone-800">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-3xl p-8 border border-orange-500/20">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-orange-500 text-white rounded-full w-12 h-12 flex items-center justify-center text-lg font-bold">
                {course.id}
              </div>
              <div>
                <div className="text-sm text-orange-400 font-medium">
                  課程 {course.id} • {course.level}
                </div>
                <h1 className="text-3xl font-bold text-stone-100 mt-1">
                  {article.title}
                </h1>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Article Content */}
      <section className="py-16 bg-stone-900">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-stone-800/50 rounded-3xl p-8 border border-stone-600/30">
            <MDXRenderer source={content} />
          </div>
          
          {/* Navigation Buttons */}
          <div className="flex justify-between items-center mt-8">
            <Link href="/courses">
              <button className="bg-stone-700 hover:bg-stone-600 text-white px-6 py-3 rounded-xl font-medium transition-colors">
                <i className="fa-solid fa-arrow-left mr-2"></i>
                返回課程列表
              </button>
            </Link>
            
            <div className="text-stone-400 text-sm">
              文章 1 / {course.articles.length}
            </div>
            
            {/* 如果有下一篇文章，可以在這裡添加下一篇按鈕 */}
            <div className="w-32"></div> {/* 佔位符保持佈局平衡 */}
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