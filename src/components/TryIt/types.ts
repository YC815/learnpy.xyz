export interface TryItProps {
  id: string;
  starter: string;
  enableAiReview?: boolean;
  // 資料庫整合相關
  courseId?: number;
  articleSlug?: string;
  index?: number; // 在文章中的順序索引
}

export interface PythonError {
  line: number;
  column: number;
  message: string;
  type: 'syntax' | 'runtime';
}

export interface ExecutionResult {
  success: boolean;
  output?: string;
  error?: string;
  executionTime?: number;
}

export interface AiSuggestion {
  suggestion: string;
  diff: {
    original: string;
    modified: string;
    changes: Array<{
      type: 'add' | 'remove' | 'unchanged';
      content: string;
      lineNumber: number;
    }>;
  };
}

export interface DiffChange {
  type: 'add' | 'remove' | 'unchanged';
  content: string;
  lineNumber: number;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  content: string;
  timestamp: Date;
  codeBlock?: string;
}

export interface ChatContext {
  articleTitle: string;
  currentTryItId: string;
  currentCode: string;
}