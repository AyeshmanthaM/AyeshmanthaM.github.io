// Service for accessing data from the public folder
export class PublicDataService {
  private baseUrl: string;

  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl;
  }

  /**
   * Fetch all projects from the public data folder
   */
  async getProjects(): Promise<any[]> {
    try {
      // First get the metadata to see available projects
      const metadata = await this.getMetadata();
      
      if (metadata.projectCount > 0 && metadata.projects) {
        // Fetch individual project files based on metadata
        const projectPromises = metadata.projects.map(async (projectInfo: any) => {
          try {
            const response = await fetch(`${this.baseUrl}/data/projects/${projectInfo.filename}`);
            if (response.ok) {
              return await response.json();
            }
            return null;
          } catch (error) {
            console.error(`Error fetching project ${projectInfo.filename}:`, error);
            return null;
          }
        });

        const projects = await Promise.all(projectPromises);
        return projects.filter(project => project !== null);
      }

      // Fallback to API if public data is not available
      try {
        const response = await fetch(`${this.baseUrl}/api/projects`);
        if (response.ok) {
          return await response.json();
        }
      } catch (apiError) {
        console.warn('API fallback also failed:', apiError);
      }

      return [];
    } catch (error) {
      console.error('Error fetching projects from public data:', error);
      throw error;
    }
  }

  /**
   * Fetch a specific project from the public data folder
   */
  async getProject(projectId: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/data/projects/${projectId}.json`);
      if (!response.ok) {
        throw new Error(`Project ${projectId} not found`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error fetching project ${projectId}:`, error);
      throw error;
    }
  }

  /**
   * Fetch metadata from the public data folder
   */
  async getMetadata(): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/data/metadata.json`);
      if (!response.ok) {
        throw new Error('Metadata not found');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching metadata:', error);
      throw error;
    }
  }

  /**
   * List available projects by reading the metadata
   */
  async listProjects(): Promise<string[]> {
    try {
      // In a real implementation, metadata would contain project IDs
      // For now, we'll return an empty array since we don't have a way to discover project IDs
      return [];
    } catch (error) {
      console.error('Error listing projects:', error);
      return [];
    }
  }

  /**
   * Fetch project schema
   */
  async getSchema(): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/data/projects/schema.json`);
      if (!response.ok) {
        throw new Error('Schema not found');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching schema:', error);
      throw error;
    }
  }

  /**
   * Check if public data is available
   */
  async isDataAvailable(): Promise<boolean> {
    try {
      await this.getMetadata();
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get data source information
   */
  getDataSource(): string {
    return 'public-folder';
  }

  /**
   * Fallback to API if public data is not available
   */
  async getProjectsWithFallback(): Promise<any[]> {
    try {
      // First try to get from public data
      const isAvailable = await this.isDataAvailable();
      if (isAvailable) {
        return await this.getProjects();
      }
    } catch (error) {
      console.log('Public data not available, falling back to API');
    }

    // Fallback to API
    try {
      const response = await fetch(`${this.baseUrl}/api/projects`);
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.error('API fallback also failed:', error);
    }

    throw new Error('No data source available');
  }

  /**
   * Trigger a sync of data from Notion to public folder
   */
  async syncData(): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/api/data/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          force: true,
          includeImages: true
        })
      });

      if (!response.ok) {
        throw new Error(`Sync failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error syncing data:', error);
      throw error;
    }
  }

  /**
   * Get sync status
   */
  async getSyncStatus(): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/api/data/status`);
      if (!response.ok) {
        throw new Error(`Status check failed: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error getting sync status:', error);
      throw error;
    }
  }
}

// Export a default instance
export const publicDataService = new PublicDataService();

// For use in React components
export default PublicDataService;
