"use client";

import { useParams } from 'next/navigation';
import { CRMDashboard } from "@/components/crm-dashboard";

export default function Dashboard() {
  const params = useParams();
  const locale = params.locale as string || 'en';

  const handleProjectClick = (tenderId: string) => {
    // Navigate to workspace route with proper locale
    window.location.href = `/${locale}/workspace/${tenderId}`;
  };

  return (
    <CRMDashboard onProjectClick={handleProjectClick} />
  );
}


