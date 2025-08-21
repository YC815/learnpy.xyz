import React from 'react';

interface GoalsProps {
  items: string[];
}

export const Goals: React.FC<GoalsProps> = ({ items }) => {
  return (
    <div className="my-6 bg-gradient-to-r from-slate-800/60 to-slate-700/60 border border-slate-600/40 rounded-xl p-6 shadow-lg backdrop-blur-sm">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-500 rounded-full flex items-center justify-center shadow-lg">
            <i className="fa-solid fa-target text-white text-lg"></i>
          </div>
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-emerald-300 mb-4">學習目標</h3>
          <ul className="space-y-3">
            {items.map((item, index) => (
              <li key={index} className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-gradient-to-br from-emerald-500 to-green-500 rounded-full flex items-center justify-center mt-0.5 shadow">
                  <span className="text-white text-sm font-medium">{index + 1}</span>
                </div>
                <span className="text-stone-300 leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};