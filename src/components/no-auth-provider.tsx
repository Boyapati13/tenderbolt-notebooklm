"use client";

import { createContext, useContext, useEffect, useState } from "react";

interface User {
  id: string;
  email: string;
  name?: string;
  role: string;
  avatar?: string;
}

interface Organization {
  id: string;
  name: string;
  plan: string;
  maxTenders: number;
  maxUsers: number;
}

interface AuthContextType {
  user: User | null;
  organization: Organization | null;
  isLoading: boolean;
  logout: () => void;
  hasRole: (role: "admin" | "user" | "viewer") => boolean;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function NoAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Simulate a brief loading state
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const logout = async () => {
    try {
      setUser(null);
      setOrganization(null);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const hasRole = (role: "admin" | "user" | "viewer"): boolean => {
    if (!user) return false;
    const roleHierarchy = { viewer: 0, user: 1, admin: 2 };
    const userRole = user.role as "admin" | "user" | "viewer";
    return roleHierarchy[userRole] >= roleHierarchy[role];
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    
    // Define permission mappings
    const permissions = {
      "tenders.create": ["admin", "user"],
      "tenders.edit": ["admin", "user"],
      "tenders.delete": ["admin"],
      "users.manage": ["admin"],
      "analytics.view": ["admin", "user"],
      "reports.generate": ["admin", "user"],
    };
    
    const allowedRoles = permissions[permission as keyof typeof permissions];
    return allowedRoles ? allowedRoles.includes(user.role as "admin" | "user" | "viewer") : false;
  };

  return (
    <AuthContext.Provider value={{
      user,
      organization,
      isLoading,
      logout,
      hasRole,
      hasPermission,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
