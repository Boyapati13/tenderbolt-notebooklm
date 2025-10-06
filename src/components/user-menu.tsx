"use client";

import { useSession, signOut } from "next-auth/react";
import { User, LogOut, Settings, HelpCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function UserMenu() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);

  if (status === "loading") {
    return (
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse" />
        <div className="w-20 h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <button
        onClick={() => router.push("/auth/signin")}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
      >
        Sign In
      </button>
    );
  }

  const user = session?.user;
  const initials = user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase() || "U";

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
      >
        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-medium">
          {initials}
        </div>
        <div className="text-left hidden sm:block">
          <div className="text-sm font-medium text-slate-900 dark:text-slate-100">{user?.name}</div>
          <div className="text-xs text-slate-500 dark:text-slate-400">{user?.email}</div>
        </div>
      </button>
      
      {showMenu && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 py-2 z-50">
          <div className="p-4 border-b border-slate-200 dark:border-slate-700">
            <div className="text-sm font-medium text-slate-900 dark:text-slate-100">{user?.name}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">{user?.email}</div>
          </div>
          <div className="p-2">
            <button 
              onClick={() => router.push("/profile")}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
            >
              <User className="h-4 w-4" />
              Profile
            </button>
            <button 
              onClick={() => router.push("/settings")}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
            >
              <Settings className="h-4 w-4" />
              Settings
            </button>
            <button 
              onClick={() => router.push("/help")}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
            >
              <HelpCircle className="h-4 w-4" />
              Help
            </button>
            <div className="border-t border-slate-200 dark:border-slate-700 my-2"></div>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
