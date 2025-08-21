"use client";

import React, { useState } from 'react';

interface TestCase {
  inputs: string[];
  outputs: string[];
}

interface FormData {
  title: string;
  slug: string;
  level: string;
  objectives: string[];
  tags: string[];
  why: string;
  content: string;
  hasBoss: boolean;
  boss: {
    title: string;
    description: string;
    testCases: TestCase[];
  };
  further: string[];
}

type FieldValue = string | boolean | string[] | TestCase[];

const MDXLessonGenerator = () => {
  const [formData, setFormData] = useState<FormData>({
    title: '',
    slug: '',
    level: '初級',
    objectives: ['', '', ''],
    tags: ['基礎'],
    why: '',
    content: '', // Markdown content
    hasBoss: false,
    boss: {
      title: '',
      description: '',
      testCases: [
        {
          inputs: [''],
          outputs: ['']
        }
      ]
    },
    further: []
  });

  const [showContentEditor, setShowContentEditor] = useState(false);
  const [generatedMDX, setGeneratedMDX] = useState('');

  const updateField = (path: string, value: FieldValue) => {
    const pathArray = path.split('.');
    setFormData(prev => {
      const newData = { ...prev };
      let current: Record<string, unknown> = newData as Record<string, unknown>;
      
      for (let i = 0; i < pathArray.length - 1; i++) {
        const key = pathArray[i];
        if (key.includes('[') && key.includes(']')) {
          const arrayKey = key.substring(0, key.indexOf('['));
          const index = parseInt(key.substring(key.indexOf('[') + 1, key.indexOf(']')));
          current = (current[arrayKey] as Record<string, unknown>[])[index];
        } else {
          current = current[key] as Record<string, unknown>;
        }
      }
      
      const lastKey = pathArray[pathArray.length - 1];
      if (lastKey.includes('[') && lastKey.includes(']')) {
        const arrayKey = lastKey.substring(0, lastKey.indexOf('['));
        const index = parseInt(lastKey.substring(lastKey.indexOf('[') + 1, lastKey.indexOf(']')));
        (current[arrayKey] as unknown[])[index] = value;
      } else {
        current[lastKey] = value;
      }
      
      return newData;
    });
  };

  const addArrayItem = (path: string, defaultValue: string | TestCase) => {
    const pathArray = path.split('.');
    setFormData(prev => {
      const newData = { ...prev };
      let current: Record<string, unknown> = newData as Record<string, unknown>;
      
      for (let i = 0; i < pathArray.length - 1; i++) {
        current = current[pathArray[i]] as Record<string, unknown>;
      }
      
      const arrayKey = pathArray[pathArray.length - 1];
      const currentArray = current[arrayKey] as unknown[];
      current[arrayKey] = [...currentArray, defaultValue];
      
      return newData;
    });
  };

  const removeArrayItem = (path: string, index: number) => {
    const pathArray = path.split('.');
    setFormData(prev => {
      const newData = { ...prev };
      let current: Record<string, unknown> = newData as Record<string, unknown>;
      
      for (let i = 0; i < pathArray.length - 1; i++) {
        current = current[pathArray[i]] as Record<string, unknown>;
      }
      
      const arrayKey = pathArray[pathArray.length - 1];
      const currentArray = current[arrayKey] as unknown[];
      current[arrayKey] = currentArray.filter((_, i: number) => i !== index);
      
      return newData;
    });
  };

  const calculateDuration = () => {
    let totalChars = 0;
    
    totalChars += formData.why.length;
    totalChars += formData.objectives.join('').length;
    totalChars += formData.content.length;
    if (formData.hasBoss) {
      totalChars += formData.boss.title.length + formData.boss.description.length;
    }
    totalChars += formData.further.join('').length;
    
    const estimatedDuration = Math.max(15, Math.ceil(totalChars / 100));
    return estimatedDuration;
  };

  const insertTemplate = (template: string) => {
    const textarea = document.getElementById('content-editor') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = textarea.value;
      const before = text.substring(0, start);
      const after = text.substring(end, text.length);
      const newText = before + template + after;
      updateField('content', newText);
      
      // Reset cursor position
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + template.length, start + template.length);
      }, 0);
    }
  };

  const insertTryItTemplate = () => {
    const template = `
<TryIt
  id="try-it-example"
  starter={\`# 在這裡寫程式碼
# 使用左邊編輯器寫程式碼
# 右上方輸入區可以輸入測試資料
# 右下方會顯示程式執行結果
# 如果有錯誤，會自動顯示 AI 分析和修正建議

name = input("請輸入你的名字：")
age = input("請輸入你的年齡：")
print(f"你好 {name}，你今年 {age} 歲！")\`}
  enableAiReview
/>

`;
    insertTemplate(template);
  };

  const insertPitfallsTemplate = () => {
    const template = `
<Pitfalls items={[
  {
    "symptom": "輸入 5 和 7，結果輸出 57 而不是 12",
    "why": "因為 input() 回傳的是字串，字串加法是串接，而不是數值相加",
    "fix": "用 int() 或 float() 先轉換成數字"
  },
  {
    "symptom": "ValueError: invalid literal for int()",
    "why": "轉成整數時，輸入的內容不是有效的數字",
    "fix": "檢查輸入內容，或改用 float() 處理小數"
  }
]} />

`;
    insertTemplate(template);
  };

  const generateMDX = () => {
    const calculatedDuration = calculateDuration();
    
    const frontmatter = `---
title: "${formData.title}"
slug: "${formData.slug}"
level: "${formData.level}"
duration: ${calculatedDuration}
objectives:
${formData.objectives.filter(obj => obj.trim()).map(obj => `  - ${obj}`).join('\n')}
tags: [${formData.tags.map(tag => `"${tag}"`).join(', ')}]
updatedAt: "${new Date().toISOString().split('T')[0]}"
---`;

    const whySection = `
<Why>
${formData.why}
</Why>`;

    const goalsSection = `
<Goals items={[
${formData.objectives.filter(obj => obj.trim()).map(obj => `"${obj}"`).join(',\n')}
]} />`;

    const contentSection = `
${formData.content}`;

    const bossSection = formData.hasBoss ? `
## Boss 挑戰

<Boss
  title="${formData.boss.title}"
  description="${formData.boss.description}"
  testCases={[
${formData.boss.testCases.map(testCase => `    {
      inputs: [${testCase.inputs.filter(input => input.trim()).map(input => `"${input}"`).join(', ')}],
      outputs: [${testCase.outputs.filter(output => output.trim()).map(output => `"${output}"`).join(', ')}]
    }`).join(',\n')}
  ]}
/>` : '';

    const furtherSection = formData.further.length > 0 ? `
<Further urls={[
${formData.further.filter((item: string) => item.trim()).map((item: string) => `"${item}"`).join(',\n')}
]} />` : '';

    const mdx = frontmatter + whySection + goalsSection + contentSection + bossSection + furtherSection;

    setGeneratedMDX(mdx);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedMDX);
  };

  const downloadMDX = () => {
    const element = document.createElement('a');
    const file = new Blob([generatedMDX], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `${formData.slug || 'lesson'}.mdx`;
    element.click();
  };

  return (
    <div className="w-full h-screen bg-gradient-to-br from-stone-50 to-orange-50 overflow-hidden">
      {/* Content Editor Modal */}
      {showContentEditor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white w-full h-full flex flex-col">
            {/* Toolbar */}
            <div className="bg-gray-100 p-4 border-b flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold">撰寫內文</h3>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={insertTryItTemplate}
                    className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                  >
                    + 試做區
                  </button>
                  <button
                    onClick={insertPitfallsTemplate}
                    className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                  >
                    + 常見錯誤
                  </button>
                </div>
              </div>
              <button
                onClick={() => setShowContentEditor(false)}
                className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
              >
                完成編輯
              </button>
            </div>
            
            {/* Content Editor */}
            <div className="flex-1 p-4 overflow-hidden">
              <textarea
                id="content-editor"
                value={formData.content}
                onChange={(e) => updateField('content', e.target.value)}
                className="w-full h-full p-4 border border-gray-300 rounded-lg font-mono text-base text-gray-800 resize-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="在這裡使用 Markdown 格式撰寫內文..."
              />
            </div>
          </div>
        </div>
      )}

      <div className="h-full flex">
        {/* Left Panel - Form */}
        <div className="w-1/2 bg-white shadow-lg flex flex-col">
          {/* Header - Fixed */}
          <div className="p-6 border-b flex-shrink-0">
            <div className="flex items-center gap-3">
              <i className="fa-solid fa-book text-orange-600 text-2xl"></i>
              <h1 className="text-2xl font-bold text-gray-800">課程 MDX 生成器</h1>
            </div>
          </div>
          
          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6">
              <div className="space-y-6">
            {/* Basic Info */}
            <section className="border-b pb-4">
              <h2 className="text-lg font-semibold mb-3 text-orange-700">基本資訊</h2>
              <div className="grid gap-4">
                <input
                  type="text"
                  placeholder="課程標題"
                  value={formData.title}
                  onChange={(e) => updateField('title', e.target.value)}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 text-gray-800"
                />
                <input
                  type="text"
                  placeholder="URL slug (如: variables-and-types)"
                  value={formData.slug}
                  onChange={(e) => updateField('slug', e.target.value)}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 text-gray-800"
                />
                <select
                  value={formData.level}
                  onChange={(e) => updateField('level', e.target.value)}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 text-gray-800"
                >
                  <option value="初級">初級</option>
                  <option value="初中級">初中級</option>
                  <option value="中級">中級</option>
                  <option value="中高級">中高級</option>
                  <option value="高級">高級</option>
                </select>
              </div>
            </section>

            {/* Why Section */}
            <section className="border-b pb-4">
              <h2 className="text-lg font-semibold mb-3 text-orange-700">故事引子 (Why)</h2>
              <textarea
                placeholder="30-80字，說明這一課能解決什麼常見痛點"
                value={formData.why}
                onChange={(e) => updateField('why', e.target.value)}
                rows={3}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 text-gray-800"
              />
            </section>

            {/* Learning Objectives */}
            <section className="border-b pb-4">
              <h2 className="text-lg font-semibold mb-3 text-orange-700">學習目標</h2>
              {formData.objectives.map((objective, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder={`目標 ${index + 1} (動詞導向)`}
                    value={objective}
                    onChange={(e) => updateField(`objectives[${index}]`, e.target.value)}
                    className="flex-1 p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 text-gray-800"
                  />
                  {formData.objectives.length > 1 && (
                    <button
                      onClick={() => removeArrayItem('objectives', index)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded"
                    >
                      <i className="fa-solid fa-trash text-sm"></i>
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={() => addArrayItem('objectives', '')}
                className="flex items-center gap-2 text-orange-600 hover:text-orange-800"
              >
                <i className="fa-solid fa-plus text-sm"></i> 添加目標
              </button>
            </section>

            {/* Content Section */}
            <section className="border-b pb-4">
              <h2 className="text-lg font-semibold mb-3 text-orange-700">內文</h2>
              <button
                onClick={() => setShowContentEditor(true)}
                className="w-full p-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-semibold hover:from-orange-600 hover:to-red-600 transition-all duration-300 shadow-lg flex items-center justify-center gap-2"
              >
                <i className="fa-solid fa-edit"></i>
                撰寫內文
              </button>
              {formData.content && (
                <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">內文長度: {formData.content.length} 字元</p>
                </div>
              )}
            </section>

            {/* Boss Section */}
            <section className="border-b pb-4">
              <h2 className="text-lg font-semibold mb-3 text-orange-700">Boss 挑戰</h2>
              <div className="flex items-center gap-3 mb-3">
                <input
                  type="checkbox"
                  id="hasBoss"
                  checked={formData.hasBoss}
                  onChange={(e) => updateField('hasBoss', e.target.checked)}
                  className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                />
                <label htmlFor="hasBoss" className="text-sm font-medium text-gray-700">
                  這篇文章包含 Boss 挑戰
                </label>
              </div>
              
              {formData.hasBoss && (
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Boss 題目標題"
                    value={formData.boss.title}
                    onChange={(e) => updateField('boss.title', e.target.value)}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 text-gray-800"
                  />
                  <textarea
                    placeholder="Boss 題目敘述"
                    value={formData.boss.description}
                    onChange={(e) => updateField('boss.description', e.target.value)}
                    rows={3}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 text-gray-800"
                  />
                  
                  <h4 className="font-medium text-gray-700">測試案例</h4>
                  {formData.boss.testCases.map((testCase, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-3">
                      <h5 className="font-medium text-gray-600">測試案例 {index + 1}</h5>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-2">輸入 (inputs)</label>
                        {testCase.inputs.map((input, inputIndex) => (
                          <div key={inputIndex} className="flex gap-2 mb-2">
                            <input
                              type="text"
                              placeholder={`輸入 ${inputIndex + 1}`}
                              value={input}
                              onChange={(e) => updateField(`boss.testCases[${index}].inputs[${inputIndex}]`, e.target.value)}
                              className="flex-1 p-2 border rounded focus:ring-2 focus:ring-orange-500 text-gray-800"
                            />
                            {testCase.inputs.length > 1 && (
                              <button
                                onClick={() => {
                                  const newInputs = testCase.inputs.filter((_, i) => i !== inputIndex);
                                  updateField(`boss.testCases[${index}].inputs`, newInputs);
                                }}
                                className="p-2 text-red-500 hover:bg-red-50 rounded"
                              >
                                <i className="fa-solid fa-trash text-sm"></i>
                              </button>
                            )}
                          </div>
                        ))}
                        <button
                          onClick={() => {
                            const newInputs = [...testCase.inputs, ''];
                            updateField(`boss.testCases[${index}].inputs`, newInputs);
                          }}
                          className="text-orange-600 hover:text-orange-800 text-sm"
                        >
                          + 添加輸入
                        </button>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-2">輸出 (outputs)</label>
                        {testCase.outputs.map((output, outputIndex) => (
                          <div key={outputIndex} className="flex gap-2 mb-2">
                            <input
                              type="text"
                              placeholder={`輸出 ${outputIndex + 1}`}
                              value={output}
                              onChange={(e) => updateField(`boss.testCases[${index}].outputs[${outputIndex}]`, e.target.value)}
                              className="flex-1 p-2 border rounded focus:ring-2 focus:ring-orange-500 text-gray-800"
                            />
                            {testCase.outputs.length > 1 && (
                              <button
                                onClick={() => {
                                  const newOutputs = testCase.outputs.filter((_, i) => i !== outputIndex);
                                  updateField(`boss.testCases[${index}].outputs`, newOutputs);
                                }}
                                className="p-2 text-red-500 hover:bg-red-50 rounded"
                              >
                                <i className="fa-solid fa-trash text-sm"></i>
                              </button>
                            )}
                          </div>
                        ))}
                        <button
                          onClick={() => {
                            const newOutputs = [...testCase.outputs, ''];
                            updateField(`boss.testCases[${index}].outputs`, newOutputs);
                          }}
                          className="text-orange-600 hover:text-orange-800 text-sm"
                        >
                          + 添加輸出
                        </button>
                      </div>

                      {formData.boss.testCases.length > 1 && (
                        <button
                          onClick={() => removeArrayItem('boss.testCases', index)}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          移除此測試案例
                        </button>
                      )}
                    </div>
                  ))}
                  
                  <button
                    onClick={() => addArrayItem('boss.testCases', { inputs: [''], outputs: [''] })}
                    className="flex items-center gap-2 text-orange-600 hover:text-orange-800"
                  >
                    <i className="fa-solid fa-plus text-sm"></i> 添加測試案例
                  </button>
                </div>
              )}
            </section>

            {/* Further Reading */}
            <section>
              <h2 className="text-lg font-semibold mb-3 text-orange-700">延伸閱讀 (URLs)</h2>
              {formData.further.length === 0 ? (
                <p className="text-gray-500 text-sm mb-3">暫無延伸閱讀，點擊下方按鈕添加</p>
              ) : (
                formData.further.map((item, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="url"
                      placeholder="https://example.com"
                      value={item}
                      onChange={(e) => updateField(`further[${index}]`, e.target.value)}
                      className="flex-1 p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 text-gray-800"
                    />
                    <button
                      onClick={() => removeArrayItem('further', index)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded"
                    >
                      <i className="fa-solid fa-trash text-sm"></i>
                    </button>
                  </div>
                ))
              )}
              <button
                onClick={() => addArrayItem('further', '')}
                className="flex items-center gap-2 text-orange-600 hover:text-orange-800"
              >
                <i className="fa-solid fa-plus text-sm"></i> 新增延伸閱讀
              </button>
            </section>
              </div>
            </div>
          </div>
          
          {/* Fixed Footer with Generate Button */}
          <div className="p-6 border-t flex-shrink-0 bg-white">
            <button
              onClick={generateMDX}
              className="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white py-3 rounded-lg font-semibold hover:from-orange-700 hover:to-red-700 transition-all duration-300 shadow-lg flex items-center justify-center gap-2"
            >
              <i className="fa-solid fa-code"></i>
              生成 MDX 文章
            </button>
          </div>
        </div>

        {/* Right Panel - Preview */}
        <div className="w-1/2 bg-white shadow-lg flex flex-col">
          {/* Header - Fixed */}
          <div className="p-6 border-b flex-shrink-0">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-800">MDX 預覽</h2>
              <div className="flex gap-2">
                <button
                  onClick={copyToClipboard}
                  disabled={!generatedMDX}
                  className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  <i className="fa-solid fa-copy text-sm"></i>
                  複製
                </button>
                <button
                  onClick={downloadMDX}
                  disabled={!generatedMDX}
                  className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  <i className="fa-solid fa-download text-sm"></i>
                  下載
                </button>
              </div>
            </div>
          </div>
          
          {/* Scrollable Preview Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {generatedMDX ? (
              <pre className="whitespace-pre-wrap text-sm bg-gray-50 p-4 rounded-lg border font-mono leading-relaxed text-gray-800">
                {generatedMDX}
              </pre>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <i className="fa-solid fa-triangle-exclamation text-5xl mb-4 text-gray-300"></i>
                  <p>填寫左側表單後點擊「生成 MDX 文章」查看預覽</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MDXLessonGenerator;