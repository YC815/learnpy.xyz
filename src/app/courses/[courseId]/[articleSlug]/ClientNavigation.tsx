"use client";

import React from 'react';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { UserMenuButton, AuthButtons } from '@/components';

interface ClientNavigationProps {
  courseId: string;
  courseTitle: string;
}

export const ClientNavigation: React.FC<ClientNavigationProps> = ({ courseId, courseTitle }) => {
  const { user, isLoaded } = useUser();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-stone-900/80 backdrop-blur-sm border-b border-stone-700/50">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        {/* Left Navigation */}
        <div className="flex items-center gap-4">
          <Link href="/courses">
            <button className="bg-stone-700 hover:bg-stone-600 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110">
              <i className="fa-solid fa-arrow-left text-lg"></i>
            </button>
          </Link>
          <div>
            <div className="text-sm text-stone-400">課程 {courseId}</div>
            <div className="text-lg font-medium text-orange-400">{courseTitle}</div>
          </div>
        </div>

        {/* Auth Section */}
        <div className="flex items-center gap-4">
          {isLoaded && (
            <>
              {user ? (
                <UserMenuButton />
              ) : (
                <AuthButtons />
              )}
            </>
          )}
        </div>
      </div>
    </nav>
  );
};