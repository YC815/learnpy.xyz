"use client";

import React, { useRef, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { PythonValidator } from './PythonValidator';
import { PythonError } from './types';

// Dynamically import Monaco Editor with no SSR
const Editor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  onErrorsChange: (errors: PythonError[]) => void;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  value,
  onChange,
  onErrorsChange
}) => {
  const editorRef = useRef<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const handleEditorDidMount = (editor: any, monacoInstance: any) => {
    editorRef.current = editor;
    setIsLoaded(true);
    
    // Configure Python language features
    try {
      monacoInstance.languages.setMonarchTokensProvider('python', {
        tokenizer: {
          root: [
            [/[a-z_$][\w$]*/, { cases: { 
              '@keywords': 'keyword',
              '@default': 'identifier'
            }}],
            [/[A-Z][\w\$]*/, 'type.identifier'],
            [/"([^"\\]|\\.)*$/, 'string.invalid'],
            [/'([^'\\]|\\.)*$/, 'string.invalid'],
            [/"/, 'string', '@string_double'],
            [/'/, 'string', '@string_single'],
            [/\d*\.\d+([eE][\-+]?\d+)?/, 'number.float'],
            [/0[xX][0-9a-fA-F]+/, 'number.hex'],
            [/\d+/, 'number'],
            [/[;,.]/, 'delimiter'],
            [/[{}()\[\]]/, '@brackets'],
            [/@symbols/, 'operators'],
            [/[ \t\r\n]+/, 'white'],
            [/#.*$/, 'comment'],
          ],
          string_double: [
            [/[^\\"]+/, 'string'],
            [/\\./, 'string.escape'],
            [/"/, 'string', '@pop']
          ],
          string_single: [
            [/[^\\']+/, 'string'],
            [/\\./, 'string.escape'],
            [/'/, 'string', '@pop']
          ],
        },
        keywords: ['and', 'as', 'assert', 'break', 'class', 'continue', 'def', 'del', 'elif', 'else', 'except', 'exec', 'finally', 'for', 'from', 'global', 'if', 'import', 'in', 'is', 'lambda', 'not', 'or', 'pass', 'print', 'raise', 'return', 'try', 'while', 'with', 'yield'],
        symbols: /[=><!~?:&|+\-*\/\^%]+/,
      });
    } catch (error) {
      console.warn('Monaco language configuration failed:', error);
    }

    // Validate on content change
    validateAndMarkErrors();
  };

  const validateAndMarkErrors = async () => {
    if (!editorRef.current || !isLoaded) return;

    try {
      const model = editorRef.current.getModel();
      if (!model) return;

      const errors = PythonValidator.validateSyntax(value);
      onErrorsChange(errors);

      // Dynamically import monaco to avoid SSR issues
      const monaco = await import('monaco-editor');

      // Convert errors to Monaco markers
      const markers = errors.map(error => ({
        startLineNumber: error.line,
        startColumn: error.column,
        endLineNumber: error.line,
        endColumn: error.column + 5, // Highlight a few characters
        message: error.message,
        severity: monaco.MarkerSeverity.Error
      }));

      // Set markers in Monaco
      monaco.editor.setModelMarkers(model, 'python', markers);
    } catch (error) {
      console.warn('Error validation failed:', error);
    }
  };

  // Validate when value changes
  useEffect(() => {
    validateAndMarkErrors();
  }, [value]);

  return (
    <div className="border border-slate-600/40 rounded-lg overflow-hidden h-full">
      <Editor
        height="100%"
        defaultLanguage="python"
        value={value}
        onChange={(newValue) => onChange(newValue || '')}
        onMount={handleEditorDidMount}
        theme="vs-dark"
        loading={
          <div className="flex items-center justify-center h-full bg-slate-800">
            <div className="text-stone-300">載入編輯器中...</div>
          </div>
        }
        options={{
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          fontSize: 14,
          lineNumbers: 'on',
          roundedSelection: false,
          scrollbar: {
            vertical: 'auto',
            horizontal: 'auto'
          },
          automaticLayout: true,
          wordWrap: 'on'
        }}
      />
    </div>
  );
};