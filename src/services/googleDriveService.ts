interface GoogleDriveConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scope: string[];
}

interface GoogleDriveTokens {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
  expires_at?: number;
}

interface GoogleDriveFile {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  modifiedTime: string;
  webViewLink?: string;
  webContentLink?: string;
  parents?: string[];
}

interface GoogleDriveFolder {
  id: string;
  name: string;
  files: GoogleDriveFile[];
}

class GoogleDriveService {
  private config: GoogleDriveConfig;
  private tokens: GoogleDriveTokens | null = null;
  private readonly STORAGE_KEY = 'google_drive_tokens';
  private readonly API_BASE = 'https://www.googleapis.com/drive/v3';
  private readonly UPLOAD_BASE = 'https://www.googleapis.com/upload/drive/v3';

  constructor() {
    this.config = {
      clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
      clientSecret: import.meta.env.VITE_GOOGLE_CLIENT_SECRET || '',
      redirectUri: import.meta.env.VITE_GOOGLE_REDIRECT_URI || `${window.location.origin}/admin/google-callback`,
      scope: [
        'https://www.googleapis.com/auth/drive.file',
        'https://www.googleapis.com/auth/drive.readonly'
      ]
    };

    this.loadTokensFromStorage();
  }

  // OAuth 2.0 Authentication Flow
  getAuthUrl(): string {
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      scope: this.config.scope.join(' '),
      response_type: 'code',
      access_type: 'offline',
      prompt: 'consent'
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  async handleAuthCallback(code: string): Promise<boolean> {
    try {
      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: this.config.clientId,
          client_secret: this.config.clientSecret,
          redirect_uri: this.config.redirectUri,
          grant_type: 'authorization_code',
          code: code
        }).toString()
      });

      if (!response.ok) {
        throw new Error(`Token exchange failed: ${response.status}`);
      }

      const tokens: GoogleDriveTokens = await response.json();
      tokens.expires_at = Date.now() + (tokens.expires_in * 1000);
      
      this.tokens = tokens;
      this.saveTokensToStorage();
      
      return true;
    } catch (error) {
      console.error('Auth callback error:', error);
      return false;
    }
  }

  async refreshTokens(): Promise<boolean> {
    if (!this.tokens?.refresh_token) {
      return false;
    }

    try {
      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: this.config.clientId,
          client_secret: this.config.clientSecret,
          grant_type: 'refresh_token',
          refresh_token: this.tokens.refresh_token
        }).toString()
      });

      if (!response.ok) {
        throw new Error(`Token refresh failed: ${response.status}`);
      }

      const newTokens = await response.json();
      this.tokens = {
        ...this.tokens,
        access_token: newTokens.access_token,
        expires_in: newTokens.expires_in,
        expires_at: Date.now() + (newTokens.expires_in * 1000)
      };

      this.saveTokensToStorage();
      return true;
    } catch (error) {
      console.error('Token refresh error:', error);
      return false;
    }
  }

  async ensureValidToken(): Promise<boolean> {
    if (!this.tokens) {
      return false;
    }

    // Check if token is expired or will expire in the next 5 minutes
    const expiryBuffer = 5 * 60 * 1000; // 5 minutes
    if (this.tokens.expires_at && (Date.now() + expiryBuffer) >= this.tokens.expires_at) {
      return await this.refreshTokens();
    }

    return true;
  }

  isAuthenticated(): boolean {
    return !!this.tokens?.access_token;
  }

  logout(): void {
    this.tokens = null;
    localStorage.removeItem(this.STORAGE_KEY);
  }

  // Core Google Drive Operations

  async createFolder(name: string, parentId?: string): Promise<GoogleDriveFile> {
    await this.ensureValidToken();

    const metadata = {
      name: name,
      mimeType: 'application/vnd.google-apps.folder',
      ...(parentId && { parents: [parentId] })
    };

    const response = await fetch(`${this.API_BASE}/files`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.tokens!.access_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(metadata)
    });

    if (!response.ok) {
      throw new Error(`Failed to create folder: ${response.status}`);
    }

    return await response.json();
  }

  async uploadFile(
    fileName: string, 
    content: string | Blob, 
    mimeType: string = 'application/json',
    parentId?: string
  ): Promise<GoogleDriveFile> {
    await this.ensureValidToken();

    // Create metadata
    const metadata = {
      name: fileName,
      ...(parentId && { parents: [parentId] })
    };

    // Prepare form data for multipart upload
    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    
    if (typeof content === 'string') {
      form.append('file', new Blob([content], { type: mimeType }));
    } else {
      form.append('file', content);
    }

    const response = await fetch(`${this.UPLOAD_BASE}/files?uploadType=multipart`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.tokens!.access_token}`
      },
      body: form
    });

    if (!response.ok) {
      throw new Error(`Failed to upload file: ${response.status}`);
    }

    return await response.json();
  }

  async downloadFile(fileId: string): Promise<string> {
    await this.ensureValidToken();

    const response = await fetch(`${this.API_BASE}/files/${fileId}?alt=media`, {
      headers: {
        'Authorization': `Bearer ${this.tokens!.access_token}`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to download file: ${response.status}`);
    }

    return await response.text();
  }

  async listFiles(folderId?: string, query?: string): Promise<GoogleDriveFile[]> {
    await this.ensureValidToken();

    let searchQuery = '';
    if (folderId) {
      searchQuery = `'${folderId}' in parents`;
    }
    if (query) {
      searchQuery += searchQuery ? ` and ${query}` : query;
    }

    const params = new URLSearchParams({
      q: searchQuery,
      fields: 'files(id,name,mimeType,size,modifiedTime,webViewLink,webContentLink,parents)',
      orderBy: 'modifiedTime desc'
    });

    const response = await fetch(`${this.API_BASE}/files?${params.toString()}`, {
      headers: {
        'Authorization': `Bearer ${this.tokens!.access_token}`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to list files: ${response.status}`);
    }

    const data = await response.json();
    return data.files || [];
  }

  async deleteFile(fileId: string): Promise<boolean> {
    await this.ensureValidToken();

    const response = await fetch(`${this.API_BASE}/files/${fileId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${this.tokens!.access_token}`
      }
    });

    return response.ok;
  }

  async updateFile(fileId: string, content: string | Blob, mimeType: string = 'application/json'): Promise<GoogleDriveFile> {
    await this.ensureValidToken();

    const body = typeof content === 'string' ? content : content;

    const response = await fetch(`${this.UPLOAD_BASE}/files/${fileId}?uploadType=media`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${this.tokens!.access_token}`,
        'Content-Type': mimeType
      },
      body: body
    });

    if (!response.ok) {
      throw new Error(`Failed to update file: ${response.status}`);
    }

    return await response.json();
  }

  // High-level convenience methods

  async findOrCreateFolder(name: string, parentId?: string): Promise<GoogleDriveFile> {
    // Search for existing folder
    const query = `name='${name}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;
    const searchQuery = parentId ? `'${parentId}' in parents and ${query}` : query;
    
    const existing = await this.listFiles(undefined, searchQuery);
    
    if (existing.length > 0) {
      return existing[0];
    }

    // Create new folder if not found
    return await this.createFolder(name, parentId);
  }

  async saveBackupToDrive(backupData: any, fileName?: string): Promise<GoogleDriveFile> {
    // Create or find backup folder
    const backupFolder = await this.findOrCreateFolder('Portfolio data');
    
    // Generate filename if not provided
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const finalFileName = fileName || `backup-${timestamp}.json`;
    
    // Upload backup
    return await this.uploadFile(
      finalFileName,
      JSON.stringify(backupData, null, 2),
      'application/json',
      backupFolder.id
    );
  }

  async getBackupsFromDrive(): Promise<GoogleDriveFile[]> {
    // Find backup folder
    const backupFolder = await this.findOrCreateFolder('Portfolio data');
    
    // List backup files
    return await this.listFiles(backupFolder.id, "name contains 'backup' and mimeType='application/json'");
  }

  async restoreBackupFromDrive(fileId: string): Promise<any> {
    const content = await this.downloadFile(fileId);
    return JSON.parse(content);
  }

  // Storage helpers
  private saveTokensToStorage(): void {
    if (this.tokens) {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.tokens));
    }
  }

  private loadTokensFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        this.tokens = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load tokens from storage:', error);
    }
  }

  // Utility methods
  formatFileSize(bytes: string | number): string {
    const size = typeof bytes === 'string' ? parseInt(bytes) : bytes;
    const units = ['B', 'KB', 'MB', 'GB'];
    let unitIndex = 0;
    let fileSize = size;

    while (fileSize >= 1024 && unitIndex < units.length - 1) {
      fileSize /= 1024;
      unitIndex++;
    }

    return `${fileSize.toFixed(1)} ${units[unitIndex]}`;
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleString();
  }

  // Utility method to get folder statistics
  async getFolderStats(folderId?: string): Promise<{
    totalFiles: number;
    totalSize: number;
    lastModified: string;
    oldestFile: string;
  }> {
    try {
      const files = await this.listFiles(folderId);
      
      let totalSize = 0;
      let lastModified = '';
      let oldestFile = '';
      
      if (files.length > 0) {
        files.forEach(file => {
          if (file.size) {
            totalSize += parseInt(file.size);
          }
        });
        
        // Sort by modified time to get newest and oldest
        const sortedFiles = files.sort((a, b) => 
          new Date(b.modifiedTime).getTime() - new Date(a.modifiedTime).getTime()
        );
        
        lastModified = sortedFiles[0]?.modifiedTime || '';
        oldestFile = sortedFiles[sortedFiles.length - 1]?.modifiedTime || '';
      }
      
      return {
        totalFiles: files.length,
        totalSize,
        lastModified,
        oldestFile
      };
    } catch (error) {
      console.error('Error getting folder stats:', error);
      return {
        totalFiles: 0,
        totalSize: 0,
        lastModified: '',
        oldestFile: ''
      };
    }
  }

  // Check if folder exists and get its details
  async checkBackupFolder(): Promise<{
    exists: boolean;
    folderId?: string;
    folderUrl?: string;
    stats?: any;
  }> {
    try {
      const folder = await this.findOrCreateFolder('Portfolio data');
      const stats = await this.getFolderStats(folder.id);
      
      return {
        exists: true,
        folderId: folder.id,
        folderUrl: `https://drive.google.com/drive/folders/${folder.id}`,
        stats
      };
    } catch (error) {
      console.error('Error checking backup folder:', error);
      return {
        exists: false
      };
    }
  }
}

export const googleDriveService = new GoogleDriveService();
