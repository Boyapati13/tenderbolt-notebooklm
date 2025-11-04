import { Home, FileText, BarChart3, Users, Settings, Bot, Search, FolderOpen, FileCheck, Plug } from "lucide-react";

export type NavItem = {
  path: string;
  label: string;
  icon?: any;
  color?: string;
  gradient?: string;
  badge?: string;
};

export type NavGroup = {
  title: string;
  items: NavItem[];
};

export const NAV_ITEMS: NavGroup[] = [
  {
    title: "Main",
    items: [
      { path: "dashboard", label: "Dashboard", icon: Home, color: "text-blue-600", gradient: "from-blue-500 to-blue-600" },
      { path: "projects", label: "Projects", icon: FileCheck, color: "text-indigo-600", gradient: "from-indigo-500 to-indigo-600" },
      { path: "company-documents", label: "Company Docs", icon: FolderOpen, color: "text-emerald-600", gradient: "from-emerald-400 to-emerald-600" },
      { path: "ai-assistant", label: "AI Assistant", icon: Bot, color: "text-pink-600", gradient: "from-pink-500 to-pink-600", badge: "New" },
      { path: "internet-search", label: "Internet Search", icon: Search, color: "text-emerald-600", gradient: "from-emerald-500 to-emerald-600", badge: "Beta" },
      { path: "supporting-documents", label: "Supporting Docs", icon: FileText, color: "text-yellow-600", gradient: "from-yellow-400 to-yellow-600" },
      { path: "analytics", label: "Analytics", icon: BarChart3, color: "text-purple-600", gradient: "from-purple-500 to-purple-600" },
      { path: "management", label: "Team", icon: Users, color: "text-orange-600", gradient: "from-orange-500 to-orange-600" },
      { path: "integrations", label: "Integrations", icon: Plug, color: "text-cyan-600", gradient: "from-cyan-500 to-cyan-600" },
      { path: "settings", label: "Settings", icon: Settings, color: "text-gray-600", gradient: "from-gray-500 to-gray-600" },
    ],
  },
  {
    title: "System",
    items: [
      { path: "system/settings", label: "System Settings", icon: Settings, color: "text-gray-600", gradient: "from-gray-600 to-gray-400" },
    ],
  },
];

// Header-friendly flat nav (first group)
export const HEADER_NAV: { path: string; label: string }[] = NAV_ITEMS[0].items.map(({ path, label }) => ({ path, label }));

export default NAV_ITEMS;
