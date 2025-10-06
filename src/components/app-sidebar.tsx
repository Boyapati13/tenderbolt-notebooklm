"use client";

import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import clsx from "clsx";
import { FileCheck, Building2, Home, BarChart3, Users, Settings, Sparkles, Plug, Search, Bot } from "lucide-react";
import { useState, useEffect } from "react";

const NAV_ITEMS = [
  { path: "dashboard", label: "Dashboard", icon: Home, color: "text-blue-600", gradient: "from-blue-500 to-blue-600" },
  { path: "projects", label: "Projects", icon: BarChart3, color: "text-indigo-600", gradient: "from-indigo-500 to-indigo-600" },
  { path: "ai-assistant", label: "AI Assistant", icon: Bot, color: "text-pink-600", gradient: "from-pink-500 to-pink-600" },
  { path: "analytics", label: "Analytics", icon: BarChart3, color: "text-purple-600", gradient: "from-purple-500 to-purple-600" },
  { path: "management", label: "Management", icon: Users, color: "text-orange-600", gradient: "from-orange-500 to-orange-600" },
  { path: "integrations", label: "Integrations", icon: Plug, color: "text-cyan-600", gradient: "from-cyan-500 to-cyan-600" },
  { path: "internet-search", label: "Internet Search", icon: Search, color: "text-emerald-600", gradient: "from-emerald-500 to-emerald-600" },
  { path: "supporting-documents", label: "Supporting Documents", icon: FileCheck, color: "text-green-600", gradient: "from-green-500 to-green-600" },
  { path: "company-documents", label: "Company Documents", icon: Building2, color: "text-purple-600", gradient: "from-purple-500 to-purple-600" },
];

export function AppSidebar() {
  const pathname = usePathname();
  const params = useParams();
  const locale = params.locale as string || 'en';
  const [documentCounts, setDocumentCounts] = useState({ supporting: 0, company: 0 });

  useEffect(() => {
    // Fetch document counts for badges
    const fetchCounts = async () => {
      try {
        const response = await fetch("/api/documents?tenderId=global_documents");
        const data = await response.json();
        const docs = data.documents || [];
        setDocumentCounts({
          supporting: docs.filter((d: any) => d.category === 'supporting').length,
          company: docs.filter((d: any) => d.category === 'company').length,
        });
      } catch (error) {
        console.error("Failed to fetch document counts:", error);
      }
    };
    fetchCounts();
  }, []);

  return (
    <aside className="h-full w-64 shrink-0 border-r border-slate-200/60 dark:border-slate-700/60 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl p-6 hidden md:flex md:flex-col relative shadow-lg">
      {/* Logo section */}
      <div className="flex items-center justify-center mb-8">
        <div className="flex-shrink-0">
          <img 
            src="/syntara-logo.svg" 
            alt="Syntara Logo" 
            className="h-12 w-auto object-contain"
          />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1">
        {NAV_ITEMS.map((item) => {
          const href = `/${locale}/${item.path}`;
          const isActive = pathname === href;
          const Icon = item.icon;
          
          return (
            <Link
              key={href}
              href={href}
              className={`nav-item flex items-center gap-3 ${
                isActive ? 'active' : ''
              }`}
            >
              <Icon size={18} />
              <span className="text-sm font-medium">
                {item.label}
              </span>
              {item.path === "supporting-documents" && documentCounts.supporting > 0 && (
                <span className="ml-auto bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                  {documentCounts.supporting}
                </span>
              )}
              {item.path === "company-documents" && documentCounts.company > 0 && (
                <span className="ml-auto bg-purple-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                  {documentCounts.company}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="mt-6 pt-4 border-t border-border">
        <div className="flex items-center gap-3 p-3 rounded bg-muted">
          <div className="w-8 h-8 rounded bg-primary flex items-center justify-center">
            <Sparkles size={16} className="text-primary-foreground" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-card-foreground">AI Powered</p>
            <p className="text-xs text-muted-foreground">Smart Tender Management</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
