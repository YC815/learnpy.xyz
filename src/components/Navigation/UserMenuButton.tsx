"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useUser, useClerk } from '@clerk/nextjs';
import Link from 'next/link';

export const UserMenuButton: React.FC = () => {
  const { user } = useUser();
  const { signOut } = useClerk();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (!user) {
    return null;
  }

  const handleSignOut = () => {
    signOut({ redirectUrl: '/' });
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* User Avatar Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 bg-stone-700 hover:bg-stone-600 text-white p-3 rounded-full transition-all duration-200 hover:scale-105"
      >
        <img
          src={user.imageUrl}
          alt={user.fullName || user.username || 'User'}
          className="w-8 h-8 rounded-full"
        />
        <span className="hidden md:block text-sm font-medium">
          {user.firstName || user.username}
        </span>
        <i className={`fa-solid fa-chevron-down text-xs transition-transform ${isOpen ? 'rotate-180' : ''}`}></i>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-stone-800 border border-stone-600 rounded-xl shadow-xl z-50 overflow-hidden">
          {/* User Info Header */}
          <div className="px-4 py-3 bg-stone-700/50 border-b border-stone-600">
            <div className="flex items-center gap-3">
              <img
                src={user.imageUrl}
                alt={user.fullName || user.username || 'User'}
                className="w-10 h-10 rounded-full"
              />
              <div>
                <div className="font-medium text-stone-100">
                  {user.fullName || user.username}
                </div>
                <div className="text-sm text-stone-400">
                  {user.primaryEmailAddress?.emailAddress}
                </div>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            <Link href="/courses">
              <button 
                className="w-full px-4 py-3 text-left text-stone-200 hover:bg-stone-700 transition-colors flex items-center gap-3"
                onClick={() => setIsOpen(false)}
              >
                <i className="fa-solid fa-graduation-cap text-orange-400"></i>
                我的課程
              </button>
            </Link>
            
            <button 
              className="w-full px-4 py-3 text-left text-stone-200 hover:bg-stone-700 transition-colors flex items-center gap-3"
              onClick={() => setIsOpen(false)}
            >
              <i className="fa-solid fa-chart-line text-green-400"></i>
              學習進度
            </button>
            
            <button 
              className="w-full px-4 py-3 text-left text-stone-200 hover:bg-stone-700 transition-colors flex items-center gap-3"
              onClick={() => setIsOpen(false)}
            >
              <i className="fa-solid fa-cog text-blue-400"></i>
              帳號設定
            </button>
            
            <div className="border-t border-stone-600 my-2"></div>
            
            <button 
              onClick={handleSignOut}
              className="w-full px-4 py-3 text-left text-red-400 hover:bg-stone-700 transition-colors flex items-center gap-3"
            >
              <i className="fa-solid fa-sign-out-alt"></i>
              登出
            </button>
          </div>
        </div>
      )}
    </div>
  );
};