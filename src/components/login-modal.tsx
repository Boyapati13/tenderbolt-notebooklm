"use client";

import { useState } from "react";
import { X, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  if (!isOpen) return null;

  const handleSignIn = () => {
    onClose();
    router.push("/auth/signin");
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Sign In Required</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6">
          <div className="text-center mb-6">
            <img 
              src="/syntara-logo.svg" 
              alt="Syntara Logo" 
              className="h-12 w-auto mx-auto mb-4"
            />
            <p className="text-slate-600 dark:text-slate-300">
              Please sign in to access Syntara Tenders AI
            </p>
          </div>

          <div className="space-y-4">
            <button
              onClick={handleSignIn}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium"
            >
              Go to Sign In Page
            </button>
            
            <div className="text-center">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Sign in with your email or Google account
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}