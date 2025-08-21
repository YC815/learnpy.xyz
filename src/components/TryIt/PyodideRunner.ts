"use client";

export interface PyodideExecutionResult {
  success: boolean;
  output?: string;
  error?: string;
  executionTime: number;
}

// 動態定義PyodideInterface類型
type PyodideInterface = {
  runPython: (code: string) => any;
  loadPackage: (packages: string[]) => Promise<void>;
  [key: string]: any;
};

class PyodideRunner {
  private static instance: PyodideRunner | null = null;
  private pyodide: PyodideInterface | null = null;
  private isLoading: boolean = false;
  private loadPromise: Promise<PyodideInterface> | null = null;
  private outputBuffer: string[] = [];
  private errorBuffer: string[] = [];
  private textDecoder = new TextDecoder();
  private inputQueue: string[] = [];
  private inputIndex: number = 0;

  private constructor() {
    // Private constructor for singleton pattern
  }

  public static getInstance(): PyodideRunner {
    if (PyodideRunner.instance === null) {
      PyodideRunner.instance = new PyodideRunner();
    }
    return PyodideRunner.instance;
  }

  public async initialize(): Promise<PyodideInterface> {
    if (this.pyodide) {
      return this.pyodide;
    }

    if (this.isLoading && this.loadPromise) {
      return this.loadPromise;
    }

    this.isLoading = true;
    this.loadPromise = this.loadPyodide();
    
    try {
      this.pyodide = await this.loadPromise;
      
      // 設定 Python 的 input() 函數
      this.pyodide.runPython(`
import builtins
import sys

class InputHandler:
    def __init__(self):
        self.queue = []
        self.index = 0
    
    def set_input_queue(self, inputs):
        self.queue = inputs
        self.index = 0
    
    def get_input(self, prompt_text=""):
        if self.index < len(self.queue):
            value = self.queue[self.index]
            self.index += 1
            if prompt_text:
                print(prompt_text + value)
            return value
        else:
            if prompt_text:
                print(prompt_text + "(無輸入)")
            return ""

input_handler = InputHandler()

# 覆蓋內建的 input 函數
def custom_input(prompt=""):
    return input_handler.get_input(prompt)

# 設定自定義 input 函數
builtins.input = custom_input
`);
      
      this.isLoading = false;
      return this.pyodide;
    } catch (error) {
      this.isLoading = false;
      throw error;
    }
  }

  private async loadPyodide(): Promise<PyodideInterface> {
    // 檢查全域Pyodide是否已載入
    if (typeof window !== 'undefined' && (window as any).loadPyodide) {
      const pyodide = await (window as any).loadPyodide({
        indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.28.1/full/',
      });
      
      // 使用 write handler 解決 batched handler 的已知問題
      pyodide.setStdout({
        write: (buf: Uint8Array) => {
          const text = this.textDecoder.decode(buf);
          // 調試: 記錄接收到的輸出
          console.log('Stdout received:', JSON.stringify(text));
          this.outputBuffer.push(text);
          return buf.length;
        }
      });
      
      pyodide.setStderr({
        write: (buf: Uint8Array) => {
          const text = this.textDecoder.decode(buf);
          this.errorBuffer.push(text);
          return buf.length;
        }
      });
      
      return pyodide;
    }

    // 如果沒有載入，動態載入Pyodide CDN腳本
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/pyodide/v0.28.1/full/pyodide.js';
    script.async = true;
    
    return new Promise((resolve, reject) => {
      script.onload = async () => {
        try {
          const pyodide = await (window as any).loadPyodide({
            indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.28.1/full/',
          });
          
          // 使用 write handler 解決 batched handler 的已知問題
          pyodide.setStdout({
            write: (buf: Uint8Array) => {
              const text = this.textDecoder.decode(buf);
              // 調試: 記錄接收到的輸出
              console.log('Stdout received:', JSON.stringify(text));
              this.outputBuffer.push(text);
              return buf.length;
            }
          });
          
          pyodide.setStderr({
            write: (buf: Uint8Array) => {
              const text = this.textDecoder.decode(buf);
              this.errorBuffer.push(text);
              return buf.length;
            }
          });
          
          resolve(pyodide);
        } catch (error) {
          reject(error);
        }
      };
      
      script.onerror = () => {
        reject(new Error('Failed to load Pyodide'));
      };
      
      document.head.appendChild(script);
    });
  }

  public async execute(code: string, userInputs: string[] = []): Promise<PyodideExecutionResult> {
    const startTime = Date.now();
    
    try {
      const pyodide = await this.initialize();
      
      // 清空緩衝區
      this.outputBuffer = [];
      this.errorBuffer = [];
      
      // 設定用戶輸入
      this.inputQueue = userInputs;
      this.inputIndex = 0;
      
      // 將輸入設定到 Python 環境中
      pyodide.runPython(`input_handler.set_input_queue(${JSON.stringify(userInputs)})`);
      
      // 執行 Python 代碼
      const result = pyodide.runPython(code);
      
      // 強制刷新 stdout 以確保所有輸出都被捕獲
      pyodide.runPython(`
import sys
sys.stdout.flush()
sys.stderr.flush()
`);
      
      const executionTime = Date.now() - startTime;
      
      // 處理輸出 - 保留換行符號
      console.log('Output buffer:', this.outputBuffer);
      let output = this.outputBuffer.join('');
      console.log('Joined output:', JSON.stringify(output));
      
      if (result !== undefined && result !== null && result !== '') {
        console.log('Execution result:', result);
        if (output) {
          output += String(result);
        } else {
          output = String(result);
        }
      }
      
      console.log('Final output:', JSON.stringify(output));
      
      // 檢查是否有錯誤
      if (this.errorBuffer.length > 0) {
        return {
          success: false,
          error: this.errorBuffer.join(''),
          executionTime
        };
      }
      
      return {
        success: true,
        output: output || '程式執行完成（無輸出）',
        executionTime
      };
      
    } catch (error) {
      const executionTime = Date.now() - startTime;
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        executionTime
      };
    }
  }

  public async installPackage(packageName: string): Promise<void> {
    const pyodide = await this.initialize();
    await pyodide.loadPackage(['micropip']);
    pyodide.runPython(`
import micropip
await micropip.install('${packageName}')
`);
  }

  public isReady(): boolean {
    return this.pyodide !== null && !this.isLoading;
  }

  public isInitializing(): boolean {
    return this.isLoading;
  }

  public async reset(): Promise<void> {
    if (this.pyodide) {
      // 重置 Python 環境的變數（保留系統設定）
      this.pyodide.runPython(`
# 清除用戶定義的變數，但保留系統變數
user_vars = [name for name in globals() if not name.startswith('_') and name not in ['input_handler', 'custom_input']]
for var in user_vars:
    try:
        del globals()[var]
    except:
        pass
        
# 重置輸入處理器
input_handler.set_input_queue([])
`);
    }
    this.outputBuffer = [];
    this.errorBuffer = [];
    this.inputQueue = [];
    this.inputIndex = 0;
  }
}

export default PyodideRunner;