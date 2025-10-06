"use client";

import { CRMDashboard } from "@/components/crm-dashboard";

export default function Dashboard() {
  const handleProjectClick = (tenderId: string) => {
    // Navigate to workspace route
    window.location.href = `/workspace/${tenderId}`;
  };

  return (
    <CRMDashboard onProjectClick={handleProjectClick} />
  );
}


