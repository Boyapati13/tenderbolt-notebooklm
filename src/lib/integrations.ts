// Integration service for external services
export interface IntegrationConfig {
  id: string;
  name: string;
  type: 'google_drive' | 'gmail' | 'slack' | 'jira' | 'onedrive' | 'outlook' | 'confluence' | 'monday' | 'github' | 'taskmaster';
  enabled: boolean;
  credentials: Record<string, any>;
  settings: Record<string, any>;
  lastSync?: Date;
  status: 'connected' | 'disconnected' | 'error';
}

export interface GoogleDriveConfig extends IntegrationConfig {
  type: 'google_drive';
  credentials: {
    accessToken: string;
    refreshToken: string;
    expiresAt: number;
  };
  settings: {
    folderId?: string;
    autoSync: boolean;
    syncInterval: number; // minutes
  };
}

export interface GmailConfig extends IntegrationConfig {
  type: 'gmail';
  credentials: {
    accessToken: string;
    refreshToken: string;
    expiresAt: number;
  };
  settings: {
    labels: string[];
    autoSync: boolean;
    syncInterval: number; // minutes
  };
}

export interface SlackConfig extends IntegrationConfig {
  type: 'slack';
  credentials: {
    botToken: string;
    teamId: string;
  };
  settings: {
    channels: string[];
    notifications: {
      tenderUpdates: boolean;
      deadlineAlerts: boolean;
      teamAssignments: boolean;
    };
  };
}

export interface JiraConfig extends IntegrationConfig {
  type: 'jira';
  credentials: {
    apiToken: string;
    domain: string;
    email: string;
  };
  settings: {
    projectKey: string;
    issueType: string;
    autoCreateIssues: boolean;
    syncFields: string[];
  };
}

export interface OneDriveConfig extends IntegrationConfig {
  type: 'onedrive';
  credentials: {
    accessToken: string;
    refreshToken: string;
    expiresAt: number;
    tenantId: string;
  };
  settings: {
    folderId?: string;
    autoSync: boolean;
    syncInterval: number; // minutes
    sharePointSiteId?: string;
  };
}

export interface OutlookConfig extends IntegrationConfig {
  type: 'outlook';
  credentials: {
    accessToken: string;
    refreshToken: string;
    expiresAt: number;
    tenantId: string;
  };
  settings: {
    folders: string[];
    autoSync: boolean;
    syncInterval: number; // minutes
    calendarSync: boolean;
    contactsSync: boolean;
  };
}

export interface ConfluenceConfig extends IntegrationConfig {
    type: 'confluence';
    credentials: {
        apiToken: string;
        domain: string;
        email: string;
    };
    settings: {
        spaceKey: string;
        autoSync: boolean;
        syncInterval: number; // minutes
    };
}

export interface MondayConfig extends IntegrationConfig {
    type: 'monday';
    credentials: {
        apiToken: string;
    };
    settings: {
        boardId: string;
        autoSync: boolean;
        syncInterval: number; // minutes
    };
}

export interface GitHubConfig extends IntegrationConfig {
    type: 'github';
    credentials: {
        accessToken: string;
    };
    settings: {
        repository: string;
        autoSync: boolean;
        syncInterval: number; // minutes
    };
}

export interface TaskmasterConfig extends IntegrationConfig {
    type: 'taskmaster';
    credentials: {
        apiKey: string;
    };
    settings: {
        autoSync: boolean;
        syncInterval: number; // minutes
    };
}

export class IntegrationService {
  private static instance: IntegrationService;
  private integrations: Map<string, IntegrationConfig> = new Map();

  static getInstance(): IntegrationService {
    if (!IntegrationService.instance) {
      IntegrationService.instance = new IntegrationService();
      // Initialize default integrations
      IntegrationService.instance.initializeDefaultIntegrations();
    }
    return IntegrationService.instance;
  }

  private initializeDefaultIntegrations(): void {
    const defaultIntegrations: IntegrationConfig[] = [
      {
        id: 'google_drive',
        name: 'Google Drive',
        type: 'google_drive',
        enabled: false,
        credentials: {},
        settings: {
          autoSync: true,
          syncInterval: 30,
        },
        status: 'disconnected',
      },
      {
        id: 'gmail',
        name: 'Gmail',
        type: 'gmail',
        enabled: false,
        credentials: {},
        settings: {
          labels: ['INBOX', 'IMPORTANT'],
          autoSync: true,
          syncInterval: 15,
        },
        status: 'disconnected',
      },
      {
        id: 'slack',
        name: 'Slack',
        type: 'slack',
        enabled: false,
        credentials: {},
        settings: {
          channels: [],
          notifications: {
            tenderUpdates: true,
            deadlineAlerts: true,
            teamAssignments: true,
          },
        },
        status: 'disconnected',
      },
      {
        id: 'jira',
        name: 'Jira',
        type: 'jira',
        enabled: false,
        credentials: {},
        settings: {
          projectKey: 'TENDER',
          issueType: 'Task',
          autoCreateIssues: true,
          syncFields: ['summary', 'description', 'assignee'],
        },
        status: 'disconnected',
      },
      {
        id: 'onedrive',
        name: 'OneDrive',
        type: 'onedrive',
        enabled: false,
        credentials: {},
        settings: {
          autoSync: true,
          syncInterval: 30,
        },
        status: 'disconnected',
      },
      {
        id: 'outlook',
        name: 'Outlook',
        type: 'outlook',
        enabled: false,
        credentials: {},
        settings: {
          folders: ['Inbox', 'Sent Items'],
          autoSync: true,
          syncInterval: 15,
          calendarSync: false,
          contactsSync: false,
        },
        status: 'disconnected',
      },
      {
        id: 'confluence',
        name: 'Confluence',
        type: 'confluence',
        enabled: false,
        credentials: {},
        settings: {
            autoSync: true,
            syncInterval: 30,
        },
        status: 'disconnected',
      },
      {
        id: 'monday',
        name: 'Monday.com',
        type: 'monday',
        enabled: false,
        credentials: {},
        settings: {
            autoSync: true,
            syncInterval: 15,
        },
        status: 'disconnected',
      },
      {
        id: 'github',
        name: 'GitHub',
        type: 'github',
        enabled: false,
        credentials: {},
        settings: {
            autoSync: true,
            syncInterval: 30,
        },
        status: 'disconnected',
      },
      {
        id: 'taskmaster',
        name: 'Taskmaster',
        type: 'taskmaster',
        enabled: false,
        credentials: {},
        settings: {
            autoSync: true,
            syncInterval: 15,
        },
        status: 'disconnected',
      },
    ];

    defaultIntegrations.forEach(integration => {
      this.integrations.set(integration.id, integration);
    });
  }

  // Google Drive Integration
  async connectGoogleDrive(credentials: GoogleDriveConfig['credentials']): Promise<boolean> {
    try {
      // Demo mode - simulate successful connection
      if (credentials && credentials.accessToken && credentials.refreshToken) {
        const config: GoogleDriveConfig = {
          id: 'google_drive',
          name: 'Google Drive',
          type: 'google_drive',
          enabled: true,
          credentials,
          settings: {
            autoSync: true,
            syncInterval: 30,
          },
          status: 'connected',
          lastSync: new Date(),
        };
        this.integrations.set('google_drive', config);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Google Drive connection failed:', error);
      return false;
    }
  }

  async syncGoogleDrive(): Promise<any[]> {
    try {
      const response = await fetch('/api/integrations/google-drive/sync');
      const data = await response.json();
      
      if (response.ok) {
        const config = this.integrations.get('google_drive') as GoogleDriveConfig;
        if (config) {
          config.lastSync = new Date();
          this.integrations.set('google_drive', config);
        }
        return data.files || [];
      }
      return [];
    } catch (error) {
      console.error('Google Drive sync failed:', error);
      return [];
    }
  }

  // Gmail Integration
  async connectGmail(credentials: GmailConfig['credentials']): Promise<boolean> {
    try {
      // Demo mode - simulate successful connection
      if (credentials && credentials.accessToken && credentials.refreshToken) {
        const config: GmailConfig = {
          id: 'gmail',
          name: 'Gmail',
          type: 'gmail',
          enabled: true,
          credentials,
          settings: {
            labels: ['INBOX', 'IMPORTANT'],
            autoSync: true,
            syncInterval: 15,
          },
          status: 'connected',
          lastSync: new Date(),
        };
        this.integrations.set('gmail', config);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Gmail connection failed:', error);
      return false;
    }
  }

  async syncGmail(): Promise<any[]> {
    try {
      const response = await fetch('/api/integrations/gmail/sync');
      const data = await response.json();
      
      if (response.ok) {
        const config = this.integrations.get('gmail') as GmailConfig;
        if (config) {
          config.lastSync = new Date();
          this.integrations.set('gmail', config);
        }
        return data.emails || [];
      }
      return [];
    } catch (error) {
      console.error('Gmail sync failed:', error);
      return [];
    }
  }

  // Slack Integration
  async connectSlack(credentials: SlackConfig['credentials']): Promise<boolean> {
    try {
      // Demo mode - simulate successful connection
      if (credentials && credentials.botToken && credentials.teamId) {
        const config: SlackConfig = {
          id: 'slack',
          name: 'Slack',
          type: 'slack',
          enabled: true,
          credentials,
          settings: {
            channels: [],
            notifications: {
              tenderUpdates: true,
              deadlineAlerts: true,
              teamAssignments: true,
            },
          },
          status: 'connected',
          lastSync: new Date(),
        };
        this.integrations.set('slack', config);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Slack connection failed:', error);
      return false;
    }
  }

  async sendSlackNotification(channel: string, message: string): Promise<boolean> {
    try {
      const response = await fetch('/api/integrations/slack/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channel, message }),
      });
      return response.ok;
    } catch (error) {
      console.error('Slack notification failed:', error);
      return false;
    }
  }

  // Jira Integration
  async connectJira(credentials: JiraConfig['credentials']): Promise<boolean> {
    try {
      // Demo mode - simulate successful connection
      if (credentials && credentials.domain && credentials.email && credentials.apiToken) {
        const config: JiraConfig = {
          id: 'jira',
          name: 'Jira',
          type: 'jira',
          enabled: true,
          credentials,
          settings: {
            projectKey: 'TENDER',
            issueType: 'Task',
            autoCreateIssues: true,
            syncFields: ['summary', 'description', 'assignee'],
          },
          status: 'connected',
          lastSync: new Date(),
        };
        this.integrations.set('jira', config);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Jira connection failed:', error);
      return false;
    }
  }

  async createJiraIssue(tenderId: string, issueData: any): Promise<string | null> {
    try {
      const response = await fetch('/api/integrations/jira/create-issue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenderId, issueData }),
      });

      if (response.ok) {
        const data = await response.json();
        return data.issueKey;
      }
      return null;
    } catch (error) {
      console.error('Jira issue creation failed:', error);
      return null;
    }
  }

  // OneDrive Integration
  async connectOneDrive(credentials: OneDriveConfig['credentials']): Promise<boolean> {
    try {
      // Demo mode - simulate successful connection
      if (credentials && credentials.accessToken && credentials.refreshToken && credentials.tenantId) {
        const config: OneDriveConfig = {
          id: 'onedrive',
          name: 'OneDrive',
          type: 'onedrive',
          enabled: true,
          credentials,
          settings: {
            autoSync: true,
            syncInterval: 30,
          },
          status: 'connected',
          lastSync: new Date(),
        };
        this.integrations.set('onedrive', config);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('OneDrive connection failed:', error);
      return false;
    }
  }

  async syncOneDrive(): Promise<any[]> {
    try {
      const response = await fetch('/api/integrations/onedrive/sync');
      const data = await response.json();
      
      if (response.ok) {
        const config = this.integrations.get('onedrive') as OneDriveConfig;
        if (config) {
          config.lastSync = new Date();
          this.integrations.set('onedrive', config);
        }
        return data.files || [];
      }
      return [];
    } catch (error) {
      console.error('OneDrive sync failed:', error);
      return [];
    }
  }

  // Outlook Integration
  async connectOutlook(credentials: OutlookConfig['credentials']): Promise<boolean> {
    try {
      // Demo mode - simulate successful connection
      if (credentials && credentials.accessToken && credentials.refreshToken && credentials.tenantId) {
        const config: OutlookConfig = {
          id: 'outlook',
          name: 'Outlook',
          type: 'outlook',
          enabled: true,
          credentials,
          settings: {
            folders: ['Inbox', 'Sent Items'],
            autoSync: true,
            syncInterval: 15,
            calendarSync: false,
            contactsSync: false,
          },
          status: 'connected',
          lastSync: new Date(),
        };
        this.integrations.set('outlook', config);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Outlook connection failed:', error);
      return false;
    }
  }

  async syncOutlook(): Promise<any[]> {
    try {
      const response = await fetch('/api/integrations/outlook/sync');
      const data = await response.json();
      
      if (response.ok) {
        const config = this.integrations.get('outlook') as OutlookConfig;
        if (config) {
          config.lastSync = new Date();
          this.integrations.set('outlook', config);
        }
        return data.emails || [];
      }
      return [];
    } catch (error) {
      console.error('Outlook sync failed:', error);
      return [];
    }
  }

  async sendOutlookEmail(to: string, subject: string, body: string): Promise<boolean> {
    try {
      const response = await fetch('/api/integrations/outlook/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to, subject, body }),
      });
      return response.ok;
    } catch (error) {
      console.error('Outlook email send failed:', error);
      return false;
    }
  }

  async connectConfluence(credentials: ConfluenceConfig['credentials']): Promise<boolean> {
    try {
      // Demo mode - simulate successful connection
      if (credentials && credentials.apiToken && credentials.domain && credentials.email) {
        const config: ConfluenceConfig = {
          id: 'confluence',
          name: 'Confluence',
          type: 'confluence',
          enabled: true,
          credentials,
          settings: {
            spaceKey: 'TENDER',
            autoSync: true,
            syncInterval: 30,
          },
          status: 'connected',
          lastSync: new Date(),
        };
        this.integrations.set('confluence', config);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Confluence connection failed:', error);
      return false;
    }
  }

  async connectMonday(credentials: MondayConfig['credentials']): Promise<boolean> {
    try {
      // Demo mode - simulate successful connection
      if (credentials && credentials.apiToken) {
        const config: MondayConfig = {
          id: 'monday',
          name: 'Monday.com',
          type: 'monday',
          enabled: true,
          credentials,
          settings: {
            boardId: '',
            autoSync: true,
            syncInterval: 15,
          },
          status: 'connected',
          lastSync: new Date(),
        };
        this.integrations.set('monday', config);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Monday.com connection failed:', error);
      return false;
    }
  }

  async syncMonday(): Promise<any[]> {
    try {
      const response = await fetch('/api/integrations/monday/sync');
      const data = await response.json();
      
      if (response.ok) {
        const config = this.integrations.get('monday') as MondayConfig;
        if (config) {
          config.lastSync = new Date();
          this.integrations.set('monday', config);
        }
        return data.items || [];
      }
      return [];
    } catch (error) {
      console.error('Monday.com sync failed:', error);
      return [];
    }
  }

  async connectGitHub(credentials: GitHubConfig['credentials']): Promise<boolean> {
    try {
      // Demo mode - simulate successful connection
      if (credentials && credentials.accessToken) {
        const config: GitHubConfig = {
          id: 'github',
          name: 'GitHub',
          type: 'github',
          enabled: true,
          credentials,
          settings: {
            repository: '',
            autoSync: true,
            syncInterval: 30,
          },
          status: 'connected',
          lastSync: new Date(),
        };
        this.integrations.set('github', config);
        return true;
      }
      return false;
    } catch (error) {
      console.error('GitHub connection failed:', error);
      return false;
    }
  }

  async connectTaskmaster(credentials: TaskmasterConfig['credentials']): Promise<boolean> {
    try {
      // Demo mode - simulate successful connection
      if (credentials && credentials.apiKey) {
        const config: TaskmasterConfig = {
          id: 'taskmaster',
          name: 'Taskmaster',
          type: 'taskmaster',
          enabled: true,
          credentials,
          settings: {
            autoSync: true,
            syncInterval: 15,
          },
          status: 'connected',
          lastSync: new Date(),
        };
        this.integrations.set('taskmaster', config);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Taskmaster connection failed:', error);
      return false;
    }
  }

  async syncTaskmaster(): Promise<any[]> {
    try {
      const response = await fetch('/api/integrations/taskmaster/sync');
      const data = await response.json();
      
      if (response.ok) {
        const config = this.integrations.get('taskmaster') as TaskmasterConfig;
        if (config) {
          config.lastSync = new Date();
          this.integrations.set('taskmaster', config);
        }
        return data.tasks || [];
      }
      return [];
    } catch (error) {
      console.error('Taskmaster sync failed:', error);
      return [];
    }
  }

  // General methods
  getIntegrations(): IntegrationConfig[] {
    return Array.from(this.integrations.values());
  }

  getIntegration(id: string): IntegrationConfig | undefined {
    return this.integrations.get(id);
  }

  updateIntegration(id: string, updates: Partial<IntegrationConfig>): boolean {
    const integration = this.integrations.get(id);
    if (integration) {
      const updated = { ...integration, ...updates };
      this.integrations.set(id, updated);
      return true;
    }
    return false;
  }

  disconnectIntegration(id: string): boolean {
    const integration = this.integrations.get(id);
    if (integration) {
      integration.status = 'disconnected';
      integration.enabled = false;
      this.integrations.set(id, integration);
      return true;
    }
    return false;
  }

  // Sync all enabled integrations
  async syncAll(): Promise<void> {
    const enabledIntegrations = this.getIntegrations().filter(i => i.enabled);
    
    for (const integration of enabledIntegrations) {
      try {
        switch (integration.type) {
          case 'google_drive':
            await this.syncGoogleDrive();
            break;
          case 'gmail':
            await this.syncGmail();
            break;
          case 'onedrive':
            await this.syncOneDrive();
            break;
          case 'outlook':
            await this.syncOutlook();
            break;
          case 'monday':
            await this.syncMonday();
            break;
          case 'taskmaster':
            await this.syncTaskmaster();
            break;
          // Slack and Jira don't have sync methods
          default:
            break;
        }
      } catch (error) {
        console.error(`Sync failed for ${integration.name}:`, error);
        integration.status = 'error';
        this.integrations.set(integration.id, integration);
      }
    }
  }
}

export const integrationService = IntegrationService.getInstance();
