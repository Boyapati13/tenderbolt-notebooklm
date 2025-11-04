'use client';

import { useState } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserMenu } from "@/components/user-menu";
import { Bell, Search, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useParams } from "next/navigation";

export function AppHeader() {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const pathname = usePathname();
  const params = useParams();
  const locale = params.locale as string || 'en';

  const NAV_ITEMS = [
    { path: "dashboard", label: "Dashboard" },
    { path: "projects", label: "Projects" },
    { path: "analytics", label: "Analytics" },
    { path: "management", label: "Management" },
    { path: "integrations", label: "Integrations" },
  ];

  return (
    <>
      <header className="h-16 border-b border-slate-200/60 dark:border-slate-700/60 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl flex items-center justify-between px-4 md:px-6 relative pwa-header shadow-sm">
        <div className="flex items-center gap-6">
          {/* Mobile menu button */}
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="md:hidden p-2 text-muted-foreground hover:text-card-foreground hover:bg-accent rounded transition-colors"
          >
            {showMobileMenu ? <X size={20} /> : <Menu size={20} />}
          </button>
          
          {/* App Title */}
          <div className="text-xl font-semibold text-card-foreground">
            HandsOn AI
          </div>
        </div>
        
        <div className="flex items-center gap-3">
                 {/* Search */}
                 <div className="relative hidden lg:block">
                   <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                   <input
                     type="text"
                     placeholder="Search..."
                     className="w-48 xl:w-64 pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:shadow-md focus:shadow-lg"
                     suppressHydrationWarning
                   />
                 </div>

                 {/* Notifications */}
                 <button className="relative p-2 text-muted-foreground hover:text-card-foreground hover:bg-accent rounded transition-colors">
                   <Bell size={18} />
                   <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
                 </button>

                 <ThemeToggle />

                 {/* User Menu */}
                 <UserMenu />
        </div>
      </header>
      
      {/* Mobile Navigation Menu */}
      {showMobileMenu && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowMobileMenu(false)}
          />
          
          {/* Mobile Menu */}
          <div className="fixed top-0 left-0 h-full w-80 max-w-[85vw] bg-card shadow-2xl animate-slide-in">
            {/* Enhanced Mobile Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <span className="text-xl font-bold gradient-text">
                HandsOn AI
              </span>
              <button
                onClick={() => setShowMobileMenu(false)}
                className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-all duration-200 hover:shadow-md"
              >
                <X size={20} />
              </button>
            </div>
            
            {/* Enhanced Mobile Navigation */}
            <nav className="p-4 space-y-2">
              {NAV_ITEMS.map((item) => {
                const href = `/${locale}/${item.path}`;
                const isActive = pathname === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setShowMobileMenu(false)}
                    className={`block px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                      isActive
                        ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            
            {/* Enhanced Mobile User Section */}
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border">
              <UserMenu />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
