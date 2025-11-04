'use client';

import { useState } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserMenu } from "@/components/user-menu";
import { Bell, Search, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { HEADER_NAV } from "@/lib/navigation";

export function AppHeader() {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const pathname = usePathname();
  const params = useParams();
  const locale = params.locale as string || 'en';

  const NAV_ITEMS = HEADER_NAV;

  return (
    <>
      <header className="nav" role="banner">
        <div className="nav__container container">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden p-2 rounded focus-visible:outline-none"
              aria-label={showMobileMenu ? 'Close menu' : 'Open menu'}
            >
              {showMobileMenu ? <X size={20} /> : <Menu size={20} />}
            </button>

            <div className="flex flex-col">
              <Link href={`/${locale}/`} className="nav__logo" aria-label="HandsOn AI Home">
                HandsOn AI
              </Link>
              <span className="text-sm text-gray-500">AI-Powered Management</span>
            </div>
          </div>

          <nav aria-label="Primary navigation" className="hidden md:flex items-center gap-4">
            {NAV_ITEMS.map((item) => {
              const href = `/${locale}/${item.path}`;
              const isActive = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`nav__link ${isActive ? 'font-semibold text-gray-900' : 'text-gray-600'} p-2 rounded-md focus-visible:outline-none`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <div className="relative hidden lg:block">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="search"
                placeholder="Search..."
                aria-label="Search"
                className="w-48 xl:w-64 pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-100 transition-all"
              />
            </div>

            <button className="relative p-2 rounded-md focus-visible:outline-none" aria-label="Notifications">
              <Bell size={18} />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" aria-hidden="true"></span>
            </button>

            <ThemeToggle />

            <UserMenu />
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      {showMobileMenu && (
        <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setShowMobileMenu(false)}
            aria-hidden="true"
          />

          <div className="fixed top-0 left-0 h-full w-80 max-w-[85vw] bg-white shadow-2xl animate-slide-in p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-lg font-bold">HandsOn AI</div>
                <div className="text-xs text-gray-500">AI-Powered Management</div>
              </div>
              <button onClick={() => setShowMobileMenu(false)} className="p-2 rounded-md" aria-label="Close menu"><X size={20} /></button>
            </div>

            <nav className="mt-6 space-y-2" aria-label="Mobile primary navigation">
              {NAV_ITEMS.map((item) => {
                const href = `/${locale}/${item.path}`;
                const isActive = pathname === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setShowMobileMenu(false)}
                    className={`block px-4 py-3 rounded-md font-medium ${isActive ? 'bg-primary-500 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="absolute bottom-4 left-4 right-4">
              <UserMenu />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
