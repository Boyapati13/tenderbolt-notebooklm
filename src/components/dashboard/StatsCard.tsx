interface StatsCardProps {
  label: string;
  value: string;
  trend: 'up' | 'down';
  percentage: string;
}

export function StatsCard({ label, value, trend, percentage }: StatsCardProps) {
  return (
    <div className="stat-card animate-fade-in">
      <div className="stat-card__label">{label}</div>
      <div className="stat-card__value">{value}</div>
      <div className={`stat-card__trend ${trend === 'up' ? 'trend-up' : 'trend-down'}`}>
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {trend === 'up' ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6"
            />
          )}
        </svg>
        <span>{percentage}%</span>
      </div>
    </div>
  );
}