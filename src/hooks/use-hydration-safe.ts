"use client";

import { useEffect, useState } from 'react';

/**
 * Hook to handle client-side hydration and suppress hydration warnings
 * for elements that might be modified by browser extensions
 */
export function useHydrationSafe() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return isClient;
}

/**
 * Component wrapper for inputs that might be affected by browser extensions
 * This helps prevent hydration mismatches caused by Grammarly, Microsoft Editor, etc.
 */
export function HydrationSafeInput({ 
  children, 
  suppressHydrationWarning = true,
  ...props 
}: {
  children: React.ReactNode;
  suppressHydrationWarning?: boolean;
  [key: string]: any;
}) {
  const isClient = useHydrationSafe();

  if (!isClient) {
    return (
      <div suppressHydrationWarning={suppressHydrationWarning}>
        {children}
      </div>
    );
  }

  return <>{children}</>;
}
