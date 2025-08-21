import React from 'react';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { TryIt, Pitfalls, Why, Goals, Boss } from '@/components';

interface MDXRendererProps {
  source: string;
}

const components = {
  // 自定義組件
  TryIt,
  Pitfalls,
  Why,
  Goals,
  Boss,
  
  // 自定義 HTML 元素樣式
  h1: ({ children }: { children: React.ReactNode }) => (
    <h1 className="text-3xl font-bold text-stone-100 mb-6 border-b border-stone-700 pb-3">
      {children}
    </h1>
  ),
  h2: ({ children }: { children: React.ReactNode }) => (
    <h2 className="text-2xl font-bold text-stone-100 mb-4 mt-8">
      {children}
    </h2>
  ),
  h3: ({ children }: { children: React.ReactNode }) => (
    <h3 className="text-xl font-semibold text-stone-200 mb-3 mt-6">
      {children}
    </h3>
  ),
  p: ({ children }: { children: React.ReactNode }) => (
    <p className="text-stone-300 leading-relaxed mb-4">
      {children}
    </p>
  ),
  ul: ({ children }: { children: React.ReactNode }) => (
    <ul className="list-disc list-inside text-stone-300 mb-4 space-y-2">
      {children}
    </ul>
  ),
  ol: ({ children }: { children: React.ReactNode }) => (
    <ol className="list-decimal list-inside text-stone-300 mb-4 space-y-2">
      {children}
    </ol>
  ),
  li: ({ children }: { children: React.ReactNode }) => (
    <li className="text-stone-300">
      {children}
    </li>
  ),
  code: ({ children }: { children: React.ReactNode }) => (
    <code className="bg-stone-700 text-orange-400 px-2 py-1 rounded text-sm font-mono">
      {children}
    </code>
  ),
  pre: ({ children }: { children: React.ReactNode }) => (
    <pre className="bg-stone-800 text-stone-300 p-4 rounded-lg overflow-x-auto mb-4 border border-stone-700">
      {children}
    </pre>
  ),
  blockquote: ({ children }: { children: React.ReactNode }) => (
    <blockquote className="border-l-4 border-orange-500 pl-4 italic text-stone-400 mb-4">
      {children}
    </blockquote>
  ),
  strong: ({ children }: { children: React.ReactNode }) => (
    <strong className="font-bold text-stone-200">
      {children}
    </strong>
  ),
  em: ({ children }: { children: React.ReactNode }) => (
    <em className="italic text-stone-300">
      {children}
    </em>
  ),
  hr: () => (
    <hr className="border-stone-700 my-8" />
  ),
};

export const MDXRenderer: React.FC<MDXRendererProps> = ({ source }) => {
  // 解析 frontmatter 和內容
  const lines = source.split('\n');
  const frontmatterEnd = lines.findIndex((line, index) => index > 0 && line === '---');
  const content = lines.slice(frontmatterEnd + 1).join('\n');

  return (
    <div className="prose prose-invert max-w-none">
      <MDXRemote 
        source={content} 
        components={components}
      />
    </div>
  );
};