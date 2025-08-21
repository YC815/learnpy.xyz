import type { MDXComponents } from 'mdx/types';
import { TryIt, Pitfalls, Why, Goals, Boss } from '@/components';

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    // 自定義組件
    TryIt,
    Pitfalls,
    Why,
    Goals,
    Boss,
    
    // 自定義 HTML 元素樣式
    h1: ({ children }) => (
      <h1 className="text-3xl font-bold text-stone-100 mb-6 border-b border-stone-700 pb-3">
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2 className="text-2xl font-bold text-stone-100 mb-4 mt-8">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-xl font-semibold text-stone-200 mb-3 mt-6">
        {children}
      </h3>
    ),
    p: ({ children }) => (
      <p className="text-stone-300 leading-relaxed mb-4">
        {children}
      </p>
    ),
    ul: ({ children }) => (
      <ul className="list-disc list-inside text-stone-300 mb-4 space-y-2">
        {children}
      </ul>
    ),
    ol: ({ children }) => (
      <ol className="list-decimal list-inside text-stone-300 mb-4 space-y-2">
        {children}
      </ol>
    ),
    li: ({ children }) => (
      <li className="text-stone-300">
        {children}
      </li>
    ),
    code: ({ children }) => (
      <code className="bg-stone-700 text-orange-400 px-2 py-1 rounded text-sm font-mono">
        {children}
      </code>
    ),
    pre: ({ children }) => (
      <pre className="bg-stone-800 text-stone-300 p-4 rounded-lg overflow-x-auto mb-4 border border-stone-700">
        {children}
      </pre>
    ),
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-orange-500 pl-4 italic text-stone-400 mb-4">
        {children}
      </blockquote>
    ),
    strong: ({ children }) => (
      <strong className="font-bold text-stone-200">
        {children}
      </strong>
    ),
    em: ({ children }) => (
      <em className="italic text-stone-300">
        {children}
      </em>
    ),
    hr: () => (
      <hr className="border-stone-700 my-8" />
    ),
    
    // 保留其他組件
    ...components,
  };
}