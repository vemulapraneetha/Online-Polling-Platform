/**
 * AuthLayout — centered card layout for login/register pages.
 */

import { Link, Outlet } from 'react-router-dom';

export function AuthLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex flex-col">
      {/* Header */}
      <div className="p-6">
        <Link to="/" className="flex items-center gap-2.5 w-fit">
          <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-md shadow-blue-200">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <span className="text-xl font-bold text-slate-900">
            Poll<span className="text-blue-600">Hub</span>
          </span>
        </Link>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-4 pb-16">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8 animate-fade-in">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
