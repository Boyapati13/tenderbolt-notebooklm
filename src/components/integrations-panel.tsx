"use client";

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
  Briefcase
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
      case 'google_drive': return <FolderOpen className="w-6 h-6" />;
      case 'gmail': return <Mail className="w-6 h-6" />;
      case 'slack': return <MessageSquare className="w-6 h-6" />;
      case 'jira': return <Calendar className="w-6 h-6" />;
      case 'onedrive': return <Cloud className="w-6 h-6" />;
      case 'outlook': return <Briefcase className="w-6 h-6" />;
      default: return <Settings className="w-6 h-6" />;
    }
  };

  const getStatusColor = () => {
    switch (integration.status) {
      case 'connected': return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20';
      case 'disconnected': return 'text-muted-foreground bg-muted';
      case 'error': return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  const getStatusIcon = () => {
    switch (integration.status) {
      case 'connected': return <CheckCircle className="w-4 h-4" />;
      case 'disconnected': return <XCircle className="w-4 h-4" />;
      case 'error': return <AlertCircle className="w-4 h-4" />;
      default: return <XCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="card p-6 hover:shadow-lg transition-all duration-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center text-primary-foreground">
            {getIcon()}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-card-foreground">
              {integration.name}
            </h3>
            <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}>
              {getStatusIcon()}
              {integration.status.charAt(0).toUpperCase() + integration.status.slice(1)}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {integration.status === 'connected' && (
            <>
              <button
                onClick={() => onSync(integration.id)}
                className="p-2 text-muted-foreground hover:text-primary hover:bg-accent rounded-lg transition-colors"
                title="Sync"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button
                onClick={() => onConfigure(integration.id)}
                className="p-2 text-muted-foreground hover:text-primary hover:bg-accent rounded-lg transition-colors"
                title="Configure"
              >
                <Settings className="w-4 h-4" />
              </button>
            </>
          )}
          
          {integration.status === 'connected' ? (
            <button
              onClick={() => onDisconnect(integration.id)}
              className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
              title="Disconnect"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => onConnect(integration.id)}
              className="btn-primary px-4 py-2 text-sm"
            >
              Connect
            </button>
          )}
        </div>
      </div>

      <div className="space-y-2 text-sm text-muted-foreground">
        {integration.lastSync && (
          <div className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            <span>Last sync: {new Date(integration.lastSync).toLocaleString()}</span>
          </div>
        )}
        
        {integration.type === 'google_drive' && (
          <div className="flex items-center gap-2">
            <FolderOpen className="w-4 h-4" />
            <span>Document management and sync</span>
          </div>
        )}
        
        {integration.type === 'gmail' && (
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4" />
            <span>Email notifications and monitoring</span>
          </div>
        )}
        
        {integration.type === 'slack' && (
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            <span>Team notifications and updates</span>
          </div>
        )}
        
        {integration.type === 'jira' && (
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>Project tracking and issue management</span>
          </div>
        )}
        
        {integration.type === 'onedrive' && (
          <div className="flex items-center gap-2">
            <Cloud className="w-4 h-4" />
            <span>Microsoft cloud storage and document sync</span>
          </div>
        )}
        
        {integration.type === 'outlook' && (
          <div className="flex items-center gap-2">
            <Briefcase className="w-4 h-4" />
            <span>Email, calendar, and contact management</span>
          </div>
        )}
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
      <div className="flex items-center justify-center h-64">
        <div className="text-lg font-medium text-muted-foreground">
          Loading integrations...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-card-foreground">
            Integrations
          </h2>
          <p className="text-muted-foreground mt-1">
            Connect external services to enhance your tender management workflow
          </p>
        </div>
        
        <button
          onClick={() => integrationService.syncAll()}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 font-medium"
        >
          <RefreshCw className="w-4 h-4" />
          Sync All
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-card-foreground mb-4">
              Connect {integrations.find(i => i.id === showConnectModal)?.name}
            </h3>
            
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
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter Microsoft tenant ID"
                    />
                  </div>
                </>
              )}
            </div>
            
            <div className="flex items-center gap-3 mt-6">
              <button
                onClick={handleConnectSubmit}
                className="flex-1 btn-primary px-4 py-2 text-sm"
              >
                Connect
              </button>
              <button
                onClick={() => setShowConnectModal(null)}
                className="px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
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
