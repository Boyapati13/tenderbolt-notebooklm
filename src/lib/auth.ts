import { NextRequest } from "next/server";

export interface User {
  id: string;
  email: string;
  name: string;
  organizationId: string;
  role: "admin" | "user" | "viewer";
}

export interface Organization {
  id: string;
  name: string;
  plan: "free" | "pro" | "enterprise";
  maxTenders: number;
  maxUsers: number;
}

// Mock authentication for development
export function getCurrentUser(req?: NextRequest): User | null {
  // In a real implementation, this would:
  // 1. Extract JWT token from cookies/headers
  // 2. Verify the token
  // 3. Return user data from database
  
  // For development, return a mock user
  return {
    id: "user_dev",
    email: "demo@tenderbolt.ai",
    name: "Demo User",
    organizationId: "org_dev",
    role: "admin",
  };
}

export function getCurrentOrganization(req?: NextRequest): Organization | null {
  // In a real implementation, this would fetch from database
  return {
    id: "org_dev",
    name: "TenderBolt AI Demo",
    plan: "enterprise",
    maxTenders: 1000,
    maxUsers: 50,
  };
}

export function requireAuth(req?: NextRequest): User {
  const user = getCurrentUser(req);
  if (!user) {
    throw new Error("Authentication required");
  }
  return user;
}

export function requireRole(requiredRole: "admin" | "user" | "viewer", req?: NextRequest): User {
  const user = requireAuth(req);
  const roleHierarchy = { viewer: 0, user: 1, admin: 2 };
  
  if (roleHierarchy[user.role] < roleHierarchy[requiredRole]) {
    throw new Error(`Insufficient permissions. Required: ${requiredRole}`);
  }
  
  return user;
}

export function checkOrganizationAccess(organizationId: string, req?: NextRequest): boolean {
  const user = getCurrentUser(req);
  if (!user) return false;
  
  // In a real implementation, check if user belongs to organization
  return user.organizationId === organizationId;
}

export function checkTenderAccess(tenderId: string, req?: NextRequest): boolean {
  const user = getCurrentUser(req);
  if (!user) return false;
  
  // In a real implementation, check if user has access to this tender
  // This would involve checking organization membership and tender ownership
  return true; // Simplified for demo
}

// Rate limiting for API endpoints
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(
  identifier: string, 
  limit: number = 100, 
  windowMs: number = 15 * 60 * 1000 // 15 minutes
): boolean {
  const now = Date.now();
  const key = identifier;
  const current = rateLimitMap.get(key);
  
  if (!current || now > current.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  if (current.count >= limit) {
    return false;
  }
  
  current.count++;
  return true;
}
