import React from 'react';

interface WhyProps {
  children: React.ReactNode;
}

export const Why: React.FC<WhyProps> = ({ children }) => {
  return (
    <div className="my-6 bg-gradient-to-r from-slate-800/60 to-slate-700/60 border border-slate-600/40 rounded-xl p-6 shadow-lg backdrop-blur-sm">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center shadow-lg">
            <i className="fa-solid fa-lightbulb text-white text-lg"></i>
          </div>
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-cyan-300 mb-2">為什麼要學這個？</h3>
          <div className="text-stone-300 leading-relaxed">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};