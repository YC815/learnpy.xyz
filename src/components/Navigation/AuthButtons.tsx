"use client";

import React from 'react';
import Link from 'next/link';

export const AuthButtons: React.FC = () => {
  return (
    <div className="flex items-center gap-3">
      <Link href="/sign-in">
        <button className="px-4 py-2 text-stone-200 hover:text-orange-400 transition-colors font-medium">
          登入
        </button>
      </Link>
      <Link href="/sign-up">
        <button className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg font-medium transition-colors shadow-lg">
          註冊
        </button>
      </Link>
    </div>
  );
};