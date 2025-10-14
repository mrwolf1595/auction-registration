'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="backdrop-blur-xl bg-white/90 dark:bg-gray-900/90 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 space-x-reverse">
            <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-xl font-bold text-gray-800 dark:text-white arabic-text">
              نظام المزادات
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center space-x-6 space-x-reverse">
            <Link
              href="/"
              className={`px-4 py-2 rounded-lg transition-all duration-300 arabic-text ${
                pathname === '/'
                  ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg'
                  : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              الرئيسية
            </Link>
            <Link
              href="/register"
              className={`px-4 py-2 rounded-lg transition-all duration-300 arabic-text ${
                pathname === '/register'
                  ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg'
                  : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              تسجيل المزاد
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
