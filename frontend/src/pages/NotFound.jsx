import React from 'react';
import { Link } from 'react-router-dom';
import { Home, AlertTriangle } from 'lucide-react';
import DevFlowLogo from '../components/DevFlowLogo';

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F6F8] dark:bg-[#111318] px-4">
      <div className="max-w-md w-full text-center space-y-6 bg-white dark:bg-[#181B22] p-8 rounded-2xl shadow-soft-lg animate-fade-in">
        <div className="flex justify-center">
          <DevFlowLogo size="lg" />
        </div>
        <div className="w-14 h-14 bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 rounded-2xl mx-auto flex items-center justify-center">
          <AlertTriangle className="w-7 h-7" />
        </div>
        <div className="space-y-1">
          <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white font-mono">404</h1>
          <h2 className="text-base font-bold text-slate-800 dark:text-slate-200">Page Not Found</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            The workspace view you are looking for doesn't exist or has been moved.
          </p>
        </div>
        <Link
          to="/"
          className="inline-flex items-center px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-2xl shadow-soft active-press transition-all"
        >
          <Home className="w-4 h-4 mr-2" />
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
