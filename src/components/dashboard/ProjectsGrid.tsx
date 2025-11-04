export function ProjectsGrid() {
  const projects = [
    {
      id: 1,
      name: 'AI Image Generator',
      description: 'Generate high-quality images using advanced AI models',
      status: 'Active',
      progress: 75,
      team: ['SC', 'MW', 'ED'],
    },
    {
      id: 2,
      name: 'Smart Analytics',
      description: 'Real-time data analytics and visualization platform',
      status: 'In Progress',
      progress: 45,
      team: ['AT', 'SC', 'JD'],
    },
    {
      id: 3,
      name: 'Neural Network',
      description: 'Custom neural network architecture for prediction',
      status: 'Planning',
      progress: 15,
      team: ['MW', 'ED', 'AT'],
    },
  ];

  return (
    <div className="enterprise-card p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold">Active Projects</h2>
        <button className="button-premium button-premium--secondary">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
          <span>New Project</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {projects.map((project) => (
          <div
            key={project.id}
            className="p-4 border border-gray-100 rounded-lg hover:shadow-lg transition-shadow animate-fade-in"
          >
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-medium">{project.name}</h3>
              <span className="badge badge--primary">{project.status}</span>
            </div>
            <p className="text-sm text-gray-600 mb-4">{project.description}</p>
            
            <div className="flex items-center justify-between">
              <div className="flex -space-x-2">
                {project.team.map((member, i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-medium border-2 border-white"
                  >
                    {member}
                  </div>
                ))}
              </div>
              
              <div className="flex items-center gap-2">
                <div className="text-sm font-medium">{project.progress}%</div>
                <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary-500 rounded-full"
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}