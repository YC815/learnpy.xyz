import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

interface AnalyzeRequest {
  code: string;
  error: string;
}

interface AnalyzeResponse {
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

function generateFallbackResponse(code: string, error: string): AnalyzeResponse {
  let suggestion = '';
  let modifiedCode = code;
  const changes: Array<{
    type: 'add' | 'remove' | 'unchanged';
    content: string;
    lineNumber: number;
  }> = [];

  // 處理 while 迴圈禁用錯誤
  if (error.includes('WhileLoopNotSupported')) {
    suggestion = '此環境不支援 while 迴圈以避免無限迴圈造成瀏覽器崩潰。建議使用 for 迴圈配合 range() 函數！例如：「while i < 10」可以改寫為「for i in range(10)」。';
    
    // 嘗試將 while 轉換為 for 迴圈
    const lines = code.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const whileMatch = line.match(/^(\s*)while\s+(.+):\s*$/);
      
      if (whileMatch) {
        const indent = whileMatch[1];
        const condition = whileMatch[2].trim();
        
        // 常見模式轉換
        if (condition.match(/^\w+\s*<\s*(\d+)$/)) {
          const match = condition.match(/(\w+)\s*<\s*(\d+)/);
          if (match) {
            const varName = match[1];
            const maxNum = match[2];
            const newLine = `${indent}for ${varName} in range(${maxNum}):`;
            lines[i] = newLine;
            modifiedCode = lines.join('\n');
            changes.push({
              type: 'add',
              content: `將 while 迴圈改為 for 迴圈`,
              lineNumber: i + 1
            });
            break;
          }
        } else if (condition.match(/^\w+\s*<=\s*(\d+)$/)) {
          const match = condition.match(/(\w+)\s*<=\s*(\d+)/);
          if (match) {
            const varName = match[1];
            const maxNum = parseInt(match[2]) + 1;
            const newLine = `${indent}for ${varName} in range(${maxNum}):`;
            lines[i] = newLine;
            modifiedCode = lines.join('\n');
            changes.push({
              type: 'add',
              content: `將 while 迴圈改為 for 迴圈`,
              lineNumber: i + 1
            });
            break;
          }
        } else {
          // 一般性建議
          const newLine = `${indent}for i in range(10):  # 請調整範圍數字`;
          lines[i] = newLine;
          modifiedCode = lines.join('\n');
          changes.push({
            type: 'add',
            content: `將 while 迴圈改為 for 迴圈`,
            lineNumber: i + 1
          });
        }
      }
    }
  } else if (error.includes('SyntaxError')) {
    if (error.includes('EOL while scanning string literal') || error.includes('unterminated string literal')) {
      suggestion = '你的字串引號沒有正確關閉哦！Python 需要每個字串都有配對的引號。請檢查程式碼中是否有遺漏的引號。';
      // 嘗試修正引號問題
      const lines = code.split('\n');
      lines.forEach((line, index) => {
        const singleQuotes = (line.match(/'/g) || []).length;
        const doubleQuotes = (line.match(/"/g) || []).length;
        if (singleQuotes % 2 !== 0) {
          lines[index] = line + "'";
          changes.push({
            type: 'add',
            content: "添加遺漏的單引號",
            lineNumber: index + 1
          });
        }
        if (doubleQuotes % 2 !== 0) {
          lines[index] = line + '"';
          changes.push({
            type: 'add',
            content: "添加遺漏的雙引號",
            lineNumber: index + 1
          });
        }
      });
      modifiedCode = lines.join('\n');
    } else if (error.includes('invalid syntax') || error.includes('expected \':\' after')) {
      // 檢查是否是if條件中的賦值錯誤
      if (code.includes('if ') && code.match(/if\s+[^=]*\s*=\s*[^=]/)) {
        suggestion = '在if條件中，你用了賦值運算符 = ，但應該要用比較運算符 == 來比較兩個值是否相等。記住：= 是賦值，== 是比較！';
        modifiedCode = code.replace(/^(\s*if\s+[^=]*?)\s*=\s*([^=])/gm, '$1 == $2');
        if (modifiedCode !== code) {
          changes.push({
            type: 'add',
            content: "將 = 改為 == 進行比較",
            lineNumber: 1
          });
        }
      } else {
        suggestion = '程式碼的語法有小問題，可能是忘記加冒號、括號沒有配對。仔細檢查一下每行程式碼的符號是否正確。';
        // 嘗試添加冒號
        modifiedCode = code.replace(/^(\s*(if|elif|else|for|while|def|class|try|except|finally|with)\s+[^:]*?)\s*$/gm, '$1:');
        if (modifiedCode !== code) {
          changes.push({
            type: 'add',
            content: "添加遺漏的冒號",
            lineNumber: 1
          });
        }
      }
    } else {
      suggestion = '程式碼的語法不太對，Python 對格式很嚴格。請檢查是否有拼錯的關鍵字或缺少的符號。';
    }
  } else if (error.includes('NameError')) {
    suggestion = '你使用了一個還沒定義的變數名稱，或是可能拼錯了變數名。記住 Python 區分大小寫，name 和 Name 是不同的變數哦！';
  } else if (error.includes('IndentationError') || error.includes('expected an indented block')) {
    suggestion = '縮排有問題！Python 用縮排來判斷程式碼的層次結構，就像寫大綱一樣。請確保每個層級的縮排都一致。';
  } else if (error.includes('TypeError')) {
    suggestion = '資料型別不匹配！可能是想要對不同型別的資料進行運算，比如數字和字串相加。請檢查變數的型別是否正確。';
  } else if (error.includes('ValueError')) {
    suggestion = '數值錯誤！通常是想要將無法轉換的內容轉成數字，比如用 int() 轉換非數字字串。請檢查輸入的內容。';
  } else {
    suggestion = '程式執行時遇到了問題，通常是邏輯錯誤或語法問題。仔細看看錯誤提示，它會告訴你哪裡出了狀況。';
  }

  return {
    suggestion,
    diff: {
      original: code,
      modified: modifiedCode,
      changes
    }
  };
}

export async function POST(request: NextRequest) {
  try {
    const { code, error }: AnalyzeRequest = await request.json();
    
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 1024,
      }
    });
    
    // Add line numbers to the code for context
    const codeWithLineNumbers = code
      .split('\n')
      .map((line, index) => `${index + 1}: ${line}`)
      .join('\n');
    
    const prompt = `分析這個Python程式碼錯誤，用繁體中文回答：

程式碼：
${code}

錯誤訊息：
${error}

重要限制：
1. 此環境不支援 while 迴圈，請勿建議使用 while
2. 如果錯誤與 while 相關，請建議使用 for 迴圈配合 range() 函數替代
3. 例如：while i < 10 → for i in range(10)

請以JSON格式回答，用2-3句友善的話解釋錯誤和解決方法：

{
  "suggestion": "用繁體中文簡短說明錯誤原因和如何修正（避免建議while迴圈）",
  "diff": {
    "original": "${code.replace(/"/g, '\\"').replace(/\n/g, '\\n')}",
    "modified": "修正後的程式碼（使用for迴圈替代while）",
    "changes": [{"type": "add", "content": "修正說明", "lineNumber": 1}]
  }
}`;

    let responseText = '';
    
    try {
      const result = await model.generateContent(prompt);
      responseText = result.response.text();
      
      console.log('Raw AI response:', responseText);
      
      // 清理和驗證 JSON 回應
      // 移除可能的 markdown 格式標記
      responseText = responseText.replace(/```json\s*|\s*```/g, '').trim();
      
      // 移除其他可能的文字
      const jsonStart = responseText.indexOf('{');
      const jsonEnd = responseText.lastIndexOf('}');
      
      if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
        responseText = responseText.substring(jsonStart, jsonEnd + 1);
      }
      
      console.log('Cleaned response:', responseText);
      
      // 嘗試解析 JSON
      const response = JSON.parse(responseText) as AnalyzeResponse;
      
      // 驗證必要的字段
      if (!response.suggestion || !response.diff) {
        throw new Error('Invalid response structure');
      }
      
      return NextResponse.json(response);
      
    } catch (error) {
      console.error('AI API error:', error);
      console.error('Raw response:', responseText);
      
      // 生成智能的 fallback 回應
      const fallbackResponse = generateFallbackResponse(code, error as string);
      return NextResponse.json(fallbackResponse);
    }
  } catch (error) {
    console.error('Error analyzing code:', error);
    return NextResponse.json(
      { error: 'Failed to analyze code' },
      { status: 500 }
    );
  }
}