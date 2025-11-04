export function RecentActivity() {
  const activities = [
    {
      id: 1,
      user: 'Sarah Chen',
      action: 'created a new project',
      project: 'AI Image Generator',
      time: '2 minutes ago',
    },
    {
      id: 2,
      user: 'Mark Wilson',
      action: 'updated',
      project: 'Smart Analytics Dashboard',
      time: '45 minutes ago',
    },
    {
      id: 3,
      user: 'Emily Davis',
      action: 'completed training on',
      project: 'Customer Sentiment Model',
      time: '2 hours ago',
    },
    {
      id: 4,
      user: 'Alex Turner',
      action: 'commented on',
      project: 'Neural Network Architecture',
      time: '5 hours ago',
    },
  ];

  return (
    <div className="enterprise-card p-6">
      <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start gap-3 animate-fade-in">
            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-semibold">
              {activity.user.charAt(0)}
            </div>
            <div>
              <p className="text-sm text-gray-600">
                <span className="font-medium text-gray-900">{activity.user}</span>{' '}
                {activity.action}{' '}
                <span className="font-medium text-gray-900">{activity.project}</span>
              </p>
              <p className="text-xs text-gray-500 mt-0.5">{activity.time}</p>
            </div>
          </div>
        ))}
      </div>
      <button className="button-premium button-premium--secondary w-full mt-4">
        View All Activity
      </button>
    </div>
  );
}