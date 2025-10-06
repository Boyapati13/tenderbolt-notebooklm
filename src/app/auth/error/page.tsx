"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { Suspense } from "react";

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case "Configuration":
        return "There is a problem with the server configuration.";
      case "AccessDenied":
        return "Access denied. You do not have permission to sign in.";
      case "Verification":
        return "The verification token has expired or has already been used.";
      case "Default":
        return "An error occurred during authentication.";
      default:
        return "An unexpected error occurred. Please try again.";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-blue-900 dark:to-indigo-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <img 
            src="/syntara-logo.svg" 
            alt="Syntara Logo" 
            className="h-16 w-auto mx-auto mb-4"
          />
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Authentication Error
          </h1>
        </div>

        {/* Error Card */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl p-8">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-6">
              <AlertCircle className="text-red-600 dark:text-red-400" size={32} />
            </div>
            
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
              Sign In Failed
            </h2>
            
            <p className="text-slate-600 dark:text-slate-300 mb-6">
              {getErrorMessage(error)}
            </p>

            <div className="space-y-4">
              <Link
                href="/auth/signin"
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium inline-flex items-center justify-center gap-2"
              >
                <ArrowLeft size={16} />
                Try Again
              </Link>
              
              <Link
                href="/"
                className="w-full bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 py-3 px-4 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium inline-flex items-center justify-center"
              >
                Go Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AuthError() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-blue-900 dark:to-indigo-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <img 
              src="/syntara-logo.svg" 
              alt="Syntara Logo" 
              className="h-16 w-auto mx-auto mb-4"
            />
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              Loading...
            </h1>
          </div>
        </div>
      </div>
    }>
      <AuthErrorContent />
    </Suspense>
  );
}
