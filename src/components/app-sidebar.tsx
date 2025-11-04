"use client";

import Link from "next/link";
import Badge from "@/components/Badge";
import { usePathname, useParams } from "next/navigation";
import { motion } from "framer-motion";
import { Sparkles, LogOut } from "lucide-react";
import { NAV_ITEMS } from "@/lib/navigation";

export function AppSidebar() {
  const pathname = usePathname();
  const params = useParams();
  const locale = params.locale as string || 'en';

  return (
    <motion.aside
      initial={{ x: -300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="hidden md:block h-screen w-72 fixed left-0 top-0 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 z-30 shadow-xl overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700 sidebar"
      role="navigation"
      aria-label="Primary sidebar"
    >
      {/* Logo */}
      <div className="p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">HandsOn AI</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">AI-Powered Management</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="px-3 pb-6">
        {NAV_ITEMS.map((group, idx) => (
          <div key={idx} className="mb-6">
            <div className="px-3 mb-2">
              <h2 className="nav-section-title">{group.title}</h2>
            </div>
            <div className="space-y-1">
              {group.items.map((item) => {
                const href = `/${locale}/${item.path}`;
                const isActive = pathname === href;
                const Icon = item.icon;

                return (
                  <Link
                    key={href}
                    href={href}
                    className={`nav-item flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive ? 'bg-gray-100 dark:bg-gray-800' : 'hover:bg-gray-50 dark:hover:bg-gray-900'}`}
                    aria-current={isActive ? 'page' : undefined}
                    tabIndex={0}
                  >
                    <div className={`w-10 h-10 rounded-md flex items-center justify-center bg-gradient-to-br ${item.gradient} shadow-sm`} aria-hidden>
                      <Icon className={`w-5 h-5 text-white`} />
                    </div>
                    <span className="text-sm font-medium flex-1 text-gray-700 dark:text-gray-200">{item.label}</span>
                    {item.badge && (
                      <>
                        {/* use Badge component for consistent treatment */}
                        <Badge variant={item.badge === 'New' ? 'new' : 'beta'}>
                          {item.badge}
                        </Badge>
                      </>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom Section */}
      <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-600 dark:text-gray-400 
                         hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition-colors">
          <LogOut className="w-5 h-5" />
          <span className="text-sm font-medium">Sign Out</span>
        </button>
      </div>
    </motion.aside>
  );
}
