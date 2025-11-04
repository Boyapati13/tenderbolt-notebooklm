'use client';

import { useState, useEffect } from 'react';
import { 
  Settings, 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  ExternalLink,
  Mail,
  MessageSquare,
  FolderOpen,
  Calendar,
  AlertCircle,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Cloud,
  Briefcase,
  BookOpen,
  ClipboardList,
  Github,
  CheckSquare
} from 'lucide-react';
import { integrationService, IntegrationConfig } from '@/lib/integrations';

interface IntegrationCardProps {
  integration: IntegrationConfig;
  onConnect: (id: string) => void;
  onDisconnect: (id: string) => void;
  onSync: (id: string) => void;
  onConfigure: (id: string) => void;
}

function IntegrationCard({ integration, onConnect, onDisconnect, onSync, onConfigure }: IntegrationCardProps) {
  const getIcon = () => {
    switch (integration.type) {
      case 'google_drive': return <FolderOpen className="w-8 h-8 text-blue-500" />;
      case 'gmail': return <Mail className="w-8 h-8 text-red-500" />;
      case 'slack': return <MessageSquare className="w-8 h-8 text-purple-500" />;
      case 'jira': return <Calendar className="w-8 h-8 text-sky-500" />;
      case 'onedrive': return <Cloud className="w-8 h-8 text-blue-600" />;
      case 'outlook': return <Briefcase className="w-8 h-8 text-sky-600" />;
      case 'confluence': return <BookOpen className="w-8 h-8 text-blue-700" />;
      case 'monday': return <ClipboardList className="w-8 h-8 text-pink-500" />;
      case 'github': return <Github className="w-8 h-8 text-gray-800 dark:text-white" />;
      case 'taskmaster': return <CheckSquare className="w-8 h-8 text-green-500" />;
      default: return <Settings className="w-8 h-8 text-gray-500" />;
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 transition-all duration-300 hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-500">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-xl flex items-center justify-center">
            {getIcon()}
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {integration.name}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              {integration.description}
            </p>
          </div>
        </div>
        
        <div className="flex flex-col items-end gap-2">
          {integration.status === 'connected' ? (
            <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400 rounded-full text-sm font-medium">
              <CheckCircle size={16} />
              <span>Connected</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1 bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300 rounded-full text-sm font-medium">
              <XCircle size={16} />
              <span>Disconnected</span>
            </div>
          )}
          
          {integration.status === 'error' && (
            <div className="flex items-center gap-1 text-red-600 dark:text-red-400 text-xs mt-1">
              <AlertCircle size={14} />
              <span>Error</span>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <div className="text-xs text-slate-500 dark:text-slate-400">
          {integration.lastSync && (
            <span>Last sync: {new Date(integration.lastSync).toLocaleString()}</span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {integration.status === 'connected' ? (
            <>
              <button
                onClick={() => onSync(integration.id)}
                className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-700 rounded-lg transition-colors"
                title="Sync"
              >
                <RefreshCw size={18} />
              </button>
              <button
                onClick={() => onConfigure(integration.id)}
                className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-700 rounded-lg transition-colors"
                title="Configure"
              >
                <Settings size={18} />
              </button>
              <button
                onClick={() => onDisconnect(integration.id)}
                className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-slate-700 rounded-lg transition-colors"
                title="Disconnect"
              >
                <Trash2 size={18} />
              </button>
            </>
          ) : (
            <button
              onClick={() => onConnect(integration.id)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Connect
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function IntegrationsPanel() {
  const [integrations, setIntegrations] = useState<IntegrationConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showConnectModal, setShowConnectModal] = useState<string | null>(null);
  const [credentials, setCredentials] = useState<Record<string, any>>({});

  useEffect(() => {
    loadIntegrations();
  }, []);

  const loadIntegrations = () => {
    const allIntegrations = integrationService.getIntegrations();
    setIntegrations(allIntegrations);
    setIsLoading(false);
  };

  const handleConnect = async (integrationId: string) => {
    setShowConnectModal(integrationId);
  };

  const handleDisconnect = (integrationId: string) => {
    integrationService.disconnectIntegration(integrationId);
    loadIntegrations();
  };

  const handleSync = async (integrationId: string) => {
    try {
      switch (integrationId) {
        case 'google_drive':
          await integrationService.syncGoogleDrive();
          break;
        case 'gmail':
          await integrationService.syncGmail();
          break;
        case 'onedrive':
          await integrationService.syncOneDrive();
          break;
        case 'outlook':
          await integrationService.syncOutlook();
          break;
        case 'monday':
          await integrationService.syncMonday();
          break;
        case 'taskmaster':
          await integrationService.syncTaskmaster();
          break;
        default:
          break;
      }
      loadIntegrations();
    } catch (error) {
      console.error('Sync failed:', error);
    }
  };

  const handleConfigure = (integrationId: string) => {
    // Open configuration modal
    console.log('Configure integration:', integrationId);
  };

  const handleConnectSubmit = async () => {
    if (!showConnectModal) return;

    try {
      let success = false;
      
      switch (showConnectModal) {
        case 'google_drive':
          success = await integrationService.connectGoogleDrive(credentials.google_drive || {});
          break;
        case 'gmail':
          success = await integrationService.connectGmail(credentials.gmail || {});
          break;
        case 'slack':
          success = await integrationService.connectSlack(credentials.slack || {});
          break;
        case 'jira':
          success = await integrationService.connectJira(credentials.jira || {});
          break;
        case 'onedrive':
          success = await integrationService.connectOneDrive(credentials.onedrive || {});
          break;
        case 'outlook':
          success = await integrationService.connectOutlook(credentials.outlook || {});
          break;
        case 'confluence':
            success = await integrationService.connectConfluence(credentials.confluence || {});
            break;
        case 'monday':
            success = await integrationService.connectMonday(credentials.monday || {});
            break;
        case 'github':
            success = await integrationService.connectGitHub(credentials.github || {});
            break;
        case 'taskmaster':
            success = await integrationService.connectTaskmaster(credentials.taskmaster || {});
            break;
      }

      if (success) {
        setShowConnectModal(null);
        setCredentials({});
        loadIntegrations();
      }
    } catch (error) {
      console.error('Connection failed:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-40 bg-slate-200 dark:bg-slate-700 rounded-2xl"></div>
            <div className="h-40 bg-slate-200 dark:bg-slate-700 rounded-2xl"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 bg-slate-50 dark:bg-slate-900 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Integrations</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Connect your favorite tools to streamline your workflow.
          </p>
        </div>
        <button
          onClick={() => integrationService.syncAll()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          <RefreshCw size={16} />
          <span>Sync All</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {integrations.map((integration) => (
          <IntegrationCard
            key={integration.id}
            integration={integration}
            onConnect={handleConnect}
            onDisconnect={handleDisconnect}
            onSync={handleSync}
            onConfigure={handleConfigure}
          />
        ))}
      </div>

      {/* Connect Modal */}
      {showConnectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8 w-full max-w-lg mx-4">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              Connect {integrations.find(i => i.id === showConnectModal)?.name}
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Enter your credentials to connect your account.
            </p>
            
            <div className="space-y-4">
              {showConnectModal === 'google_drive' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Access Token
                    </label>
                    <input
                      type="password"
                      value={credentials.google_drive?.accessToken || ''}
                      onChange={(e) => setCredentials({
                        ...credentials,
                        google_drive: { ...credentials.google_drive, accessToken: e.target.value }
                      })}
                      className="input w-full"
                      placeholder="Enter Google Drive access token"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Refresh Token
                    </label>
                    <input
                      type="password"
                      value={credentials.google_drive?.refreshToken || ''}
                      onChange={(e) => setCredentials({
                        ...credentials,
                        google_drive: { ...credentials.google_drive, refreshToken: e.target.value }
                      })}
                      className="input w-full"
                      placeholder="Enter Google Drive refresh token"
                    />
                  </div>
                </>
              )}
              
              {showConnectModal === 'slack' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Bot Token
                    </label>
                    <input
                      type="password"
                      value={credentials.slack?.botToken || ''}
                      onChange={(e) => setCredentials({
                        ...credentials,
                        slack: { ...credentials.slack, botToken: e.target.value }
                      })}
                      className="input w-full"
                      placeholder="Enter Slack bot token"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Team ID
                    </label>
                    <input
                      type="text"
                      value={credentials.slack?.teamId || ''}
                      onChange={(e) => setCredentials({
                        ...credentials,
                        slack: { ...credentials.slack, teamId: e.target.value }
                      })}
                      className="input w-full"
                      placeholder="Enter Slack team ID"
                    />
                  </div>
                </>
              )}
              
              {showConnectModal === 'jira' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Domain
                    </label>
                    <input
                      type="text"
                      value={credentials.jira?.domain || ''}
                      onChange={(e) => setCredentials({
                        ...credentials,
                        jira: { ...credentials.jira, domain: e.target.value }
                      })}
                      className="input w-full"
                      placeholder="your-domain (without .atlassian.net)"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={credentials.jira?.email || ''}
                      onChange={(e) => setCredentials({
                        ...credentials,
                        jira: { ...credentials.jira, email: e.target.value }
                      })}
                      className="input w-full"
                      placeholder="Enter your Jira email"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      API Token
                    </label>
                    <input
                      type="password"
                      value={credentials.jira?.apiToken || ''}
                      onChange={(e) => setCredentials({
                        ...credentials,
                        jira: { ...credentials.jira, apiToken: e.target.value }
                      })}
                      className="input w-full"
                      placeholder="Enter Jira API token"
                    />
                  </div>
                </>
              )}
              
              {showConnectModal === 'onedrive' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Access Token
                    </label>
                    <input
                      type="password"
                      value={credentials.onedrive?.accessToken || ''}
                      onChange={(e) => setCredentials({
                        ...credentials,
                        onedrive: { ...credentials.onedrive, accessToken: e.target.value }
                      })}
                      className="input w-full"
                      placeholder="Enter OneDrive access token"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Refresh Token
                    </label>
                    <input
                      type="password"
                      value={credentials.onedrive?.refreshToken || ''}
                      onChange={(e) => setCredentials({
                        ...credentials,
                        onedrive: { ...credentials.onedrive, refreshToken: e.target.value }
                      })}
                      className="input w-full"
                      placeholder="Enter OneDrive refresh token"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Tenant ID
                    </label>
                    <input
                      type="text"
                      value={credentials.onedrive?.tenantId || ''}
                      onChange={(e) => setCredentials({
                        ...credentials,
                        onedrive: { ...credentials.onedrive, tenantId: e.target.value }
                      })}
                      className="input w-full"
                      placeholder="Enter Microsoft tenant ID"
                    />
                  </div>
                </>
              )}
              
              {showConnectModal === 'outlook' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Access Token
                    </label>
                    <input
                      type="password"
                      value={credentials.outlook?.accessToken || ''}
                      onChange={(e) => setCredentials({
                        ...credentials,
                        outlook: { ...credentials.outlook, accessToken: e.target.value }
                      })}
                      className="input w-full"
                      placeholder="Enter Outlook access token"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Refresh Token
                    </label>
                    <input
                      type="password"
                      value={credentials.outlook?.refreshToken || ''}
                      onChange={(e) => setCredentials({
                        ...credentials,
                        outlook: { ...credentials.outlook, refreshToken: e.target.value }
                      })}
                      className="input w-full"
                      placeholder="Enter Outlook refresh token"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Tenant ID
                    </label>
                    <input
                      type="text"
                      value={credentials.outlook?.tenantId || ''}
                      onChange={(e) => setCredentials({
                        ...credentials,
                        outlook: { ...credentials.outlook, tenantId: e.target.value }
                      })}
                      className="input w-full"
                      placeholder="Enter Microsoft tenant ID"
                    />
                  </div>
                </>
              )}

              {showConnectModal === 'confluence' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Domain
                    </label>
                    <input
                      type="text"
                      value={credentials.confluence?.domain || ''}
                      onChange={(e) => setCredentials({
                        ...credentials,
                        confluence: { ...credentials.confluence, domain: e.target.value }
                      })}
                      className="input w-full"
                      placeholder="your-domain.atlassian.net"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={credentials.confluence?.email || ''}
                      onChange={(e) => setCredentials({
                        ...credentials,
                        confluence: { ...credentials.confluence, email: e.target.value }
                      })}
                      className="input w-full"
                      placeholder="Enter your Confluence email"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      API Token
                    </label>
                    <input
                      type="password"
                      value={credentials.confluence?.apiToken || ''}
                      onChange={(e) => setCredentials({
                        ...credentials,
                        confluence: { ...credentials.confluence, apiToken: e.target.value }
                      })}
                      className="input w-full"
                      placeholder="Enter Confluence API token"
                    />
                  </div>
                </>
              )}

              {showConnectModal === 'monday' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      API Token
                    </label>
                    <input
                      type="password"
                      value={credentials.monday?.apiToken || ''}
                      onChange={(e) => setCredentials({
                        ...credentials,
                        monday: { ...credentials.monday, apiToken: e.target.value }
                      })}
                      className="input w-full"
                      placeholder="Enter Monday.com API v2 token"
                    />
                  </div>
                </>
              )}

              {showConnectModal === 'github' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Personal Access Token
                    </label>
                    <input
                      type="password"
                      value={credentials.github?.accessToken || ''}
                      onChange={(e) => setCredentials({
                        ...credentials,
                        github: { ...credentials.github, accessToken: e.target.value }
                      })}
                      className="input w-full"
                      placeholder="Enter GitHub personal access token"
                    />
                  </div>
                </>
              )}

              {showConnectModal === 'taskmaster' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      API Key
                    </label>
                    <input
                      type="password"
                      value={credentials.taskmaster?.apiKey || ''}
                      onChange={(e) => setCredentials({
                        ...credentials,
                        taskmaster: { ...credentials.taskmaster, apiKey: e.target.value }
                      })}
                      className="input w-full"
                      placeholder="Enter Taskmaster API key"
                    />
                  </div>
                </>
              )}
            </div>
            
            <div className="flex items-center gap-4 mt-8">
              <button
                onClick={handleConnectSubmit}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Connect
              </button>
              <button
                onClick={() => setShowConnectModal(null)}
                className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 rounded-lg font-semibold hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
