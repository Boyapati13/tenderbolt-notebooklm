'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react';
import Link from 'next/link';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-lg shadow-xl p-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-500" />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          Something went wrong!
        </h1>
        
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          {error.message || 'An unexpected error occurred. Please try again.'}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          >
            <RefreshCcw className="w-4 h-4" />
            Try again
          </button>

          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <Home className="w-4 h-4" />
            Go home
          </Link>
        </div>

        {error.digest && (
          <p className="mt-4 text-xs text-slate-500 dark:text-slate-500">
            Error ID: {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}