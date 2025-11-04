import { StatsCard } from '@/components/dashboard/StatsCard';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { ProjectsGrid } from '@/components/dashboard/ProjectsGrid';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="stats-grid">
        <StatsCard
          label="Total Projects"
          value="48"
          trend="up"
          percentage="12"
        />
        <StatsCard
          label="Active Users"
          value="2.4k"
          trend="up"
          percentage="8"
        />
        <StatsCard
          label="Processing Time"
          value="1.2s"
          trend="down"
          percentage="5"
        />
        <StatsCard
          label="Success Rate"
          value="99.9%"
          trend="up"
          percentage="2"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ProjectsGrid />
        </div>
        <div>
          <RecentActivity />
        </div>
      </div>
    </div>
  );
}