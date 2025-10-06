"use client";

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function LocalePage() {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;

  useEffect(() => {
    // Redirect to dashboard after component mounts
    router.push(`/${locale}/dashboard`);
  }, [router, locale]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-slate-600 dark:text-slate-400">Redirecting to dashboard...</p>
      </div>
    </div>
  );
}
