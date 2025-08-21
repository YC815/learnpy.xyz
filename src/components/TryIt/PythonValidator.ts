import { PythonError } from './types';

export class PythonValidator {
  static validateSyntax(code: string): PythonError[] {
    const errors: PythonError[] = [];
    const lines = code.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineNumber = i + 1;

      // Check for unmatched parentheses
      const parenErrors = this.checkUnmatchedBrackets(line, lineNumber, '(', ')');
      const bracketErrors = this.checkUnmatchedBrackets(line, lineNumber, '[', ']');
      const braceErrors = this.checkUnmatchedBrackets(line, lineNumber, '{', '}');
      
      errors.push(...parenErrors, ...bracketErrors, ...braceErrors);

      // Check for unmatched quotes
      const quoteErrors = this.checkUnmatchedQuotes(line, lineNumber);
      errors.push(...quoteErrors);

      // Check for if/for/while without colon
      if (this.isControlStatement(line) && !line.trim().endsWith(':')) {
        errors.push({
          line: lineNumber,
          column: line.length,
          message: "SyntaxError: invalid syntax (missing ':')",
          type: 'syntax'
        });
      }

      // Check for basic Python keywords
      const keywordErrors = this.checkKeywordErrors(line, lineNumber);
      errors.push(...keywordErrors);
    }

    return errors;
  }

  private static checkUnmatchedBrackets(
    line: string, 
    lineNumber: number, 
    open: string, 
    close: string
  ): PythonError[] {
    const errors: PythonError[] = [];
    let count = 0;
    let inString = false;
    let stringChar = '';

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      // Handle string literals
      if ((char === '"' || char === "'") && (i === 0 || line[i-1] !== '\\')) {
        if (!inString) {
          inString = true;
          stringChar = char;
        } else if (char === stringChar) {
          inString = false;
          stringChar = '';
        }
      }
      
      if (!inString) {
        if (char === open) {
          count++;
        } else if (char === close) {
          count--;
          if (count < 0) {
            errors.push({
              line: lineNumber,
              column: i + 1,
              message: `SyntaxError: unmatched '${close}'`,
              type: 'syntax'
            });
            return errors;
          }
        }
      }
    }

    if (count > 0) {
      errors.push({
        line: lineNumber,
        column: line.lastIndexOf(open) + 1,
        message: `SyntaxError: unmatched '${open}'`,
        type: 'syntax'
      });
    }

    return errors;
  }

  private static checkUnmatchedQuotes(line: string, lineNumber: number): PythonError[] {
    const errors: PythonError[] = [];
    let inDoubleQuote = false;
    let inSingleQuote = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const prevChar = i > 0 ? line[i - 1] : '';

      if (char === '"' && prevChar !== '\\') {
        if (inSingleQuote) continue;
        inDoubleQuote = !inDoubleQuote;
      } else if (char === "'" && prevChar !== '\\') {
        if (inDoubleQuote) continue;
        inSingleQuote = !inSingleQuote;
      }
    }

    if (inDoubleQuote) {
      errors.push({
        line: lineNumber,
        column: line.lastIndexOf('"') + 1,
        message: 'SyntaxError: EOL while scanning string literal',
        type: 'syntax'
      });
    }

    if (inSingleQuote) {
      errors.push({
        line: lineNumber,
        column: line.lastIndexOf("'") + 1,
        message: 'SyntaxError: EOL while scanning string literal',
        type: 'syntax'
      });
    }

    return errors;
  }

  private static isControlStatement(line: string): boolean {
    const trimmed = line.trim();
    const controlKeywords = ['if ', 'elif ', 'else', 'for ', 'while ', 'def ', 'class ', 'try', 'except', 'finally'];
    return controlKeywords.some(keyword => trimmed.startsWith(keyword));
  }

  private static checkKeywordErrors(line: string, lineNumber: number): PythonError[] {
    const errors: PythonError[] = [];
    const trimmed = line.trim();

    // Check for common typos
    const typos = [
      { wrong: 'Print', correct: 'print' },
      { wrong: 'If', correct: 'if' },
      { wrong: 'Else', correct: 'else' },
      { wrong: 'For', correct: 'for' },
      { wrong: 'While', correct: 'while' }
    ];

    typos.forEach(typo => {
      if (trimmed.includes(typo.wrong)) {
        errors.push({
          line: lineNumber,
          column: line.indexOf(typo.wrong) + 1,
          message: `NameError: name '${typo.wrong}' is not defined. Did you mean '${typo.correct}'?`,
          type: 'syntax'
        });
      }
    });

    return errors;
  }
}