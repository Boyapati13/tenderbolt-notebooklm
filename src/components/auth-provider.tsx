"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";

interface User {
  id: string;
  email: string;
  name?: string;
  role?: string;
  avatar?: string;
  organizationId?: string;
}

interface Organization {
  id: string;
  name: string;
  plan: "free" | "pro" | "enterprise";
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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [user, setUser] = useState<User | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);

  useEffect(() => {
    if (session?.user) {
      setUser({
        id: session.user.id || "",
        email: session.user.email || "",
        name: session.user.name || undefined,
        role: session.user.role || "user",
        avatar: session.user.image || undefined,
        organizationId: "org_dev", // Default organization for now
      });
      
      // Set default organization
      setOrganization({
        id: "org_dev",
        name: "Syntara Tenders AI",
        plan: "enterprise",
        maxTenders: 1000,
        maxUsers: 50,
      });
    } else {
      setUser(null);
      setOrganization(null);
    }
  }, [session]);

  const logout = async () => {
    await signOut({ callbackUrl: "/auth/signin" });
    setUser(null);
    setOrganization(null);
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
      isLoading: status === "loading",
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