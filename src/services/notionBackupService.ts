import { Project } from '../types';

interface BackupData {
  projects: any[];
  timestamp: string;
  count: number;
  metadata: {
    version: string;
    source: 'notion';
    backup_type: 'full' | 'incremental';
  };
}

interface NotionBackupResponse {
  success: boolean;
  data?: BackupData;
  error?: string;
}

class NotionBackupService {
  private readonly API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://your-cloudflare-worker.your-domain.workers.dev';

  async createBackup(): Promise<BackupData> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/api/notion/backup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: NotionBackupResponse = await response.json();
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Backup failed');
      }

      return result.data;
    } catch (error) {
      console.error('Notion backup error:', error);
      
      // Fallback to local projects data for development
      if (import.meta.env.DEV) {
        return this.createLocalBackup();
      }
      
      throw new Error('Failed to create Notion backup');
    }
  }

  private async createLocalBackup(): Promise<BackupData> {
    try {
      // Import local projects data as fallback
      const { projects } = await import('../data/projects');
      
      const backupData: BackupData = {
        projects: projects || [],
        timestamp: new Date().toISOString(),
        count: projects?.length || 0,
        metadata: {
          version: '1.0.0',
          source: 'notion',
          backup_type: 'full'
        }
      };

      return backupData;
    } catch (error) {
      console.error('Local backup fallback error:', error);
      throw new Error('Failed to create backup');
    }
  }

  async restoreFromBackup(backupData: BackupData): Promise<boolean> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/api/notion/restore`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify(backupData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.success;
    } catch (error) {
      console.error('Restore backup error:', error);
      throw new Error('Failed to restore backup');
    }
  }

  async validateBackup(backupData: BackupData): Promise<boolean> {
    try {
      // Basic validation
      if (!backupData.projects || !Array.isArray(backupData.projects)) {
        return false;
      }

      if (!backupData.timestamp || !backupData.metadata) {
        return false;
      }

      // Validate each project structure
      const isValidProject = (project: any): boolean => {
        return (
          typeof project.id === 'string' &&
          typeof project.title === 'string' &&
          Array.isArray(project.tags)
        );
      };

      return backupData.projects.every(isValidProject);
    } catch (error) {
      console.error('Backup validation error:', error);
      return false;
    }
  }

  async getBackupHistory(): Promise<BackupData[]> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/api/notion/backup-history`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.backups || [];
    } catch (error) {
      console.error('Backup history error:', error);
      return [];
    }
  }

  async syncWithNotion(): Promise<Project[]> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/api/notion/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.projects || [];
    } catch (error) {
      console.error('Notion sync error:', error);
      throw new Error('Failed to sync with Notion');
    }
  }

  private getAuthToken(): string {
    // Get auth token from auth service or localStorage
    const authData = localStorage.getItem('admin_auth');
    if (authData) {
      try {
        const auth = JSON.parse(authData);
        return auth.token || 'fallback-token';
      } catch (error) {
        console.error('Auth token parsing error:', error);
      }
    }
    return 'fallback-token';
  }

  // Utility method to download backup as JSON file
  downloadBackup(backupData: BackupData): void {
    const blob = new Blob([JSON.stringify(backupData, null, 2)], {
      type: 'application/json',
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `notion-backup-${backupData.timestamp.replace(/[:.]/g, '-')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // Utility method to read backup from uploaded file
  async readBackupFile(file: File): Promise<BackupData> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = async (event) => {
        try {
          const result = event.target?.result;
          if (typeof result === 'string') {
            const backupData = JSON.parse(result);
            
            const isValid = await this.validateBackup(backupData);
            if (isValid) {
              resolve(backupData);
            } else {
              reject(new Error('Invalid backup file format'));
            }
          } else {
            reject(new Error('Failed to read file'));
          }
        } catch (error) {
          reject(new Error('Invalid JSON format'));
        }
      };
      
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }
}

export const notionBackupService = new NotionBackupService();
