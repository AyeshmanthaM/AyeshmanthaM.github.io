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
      // First try to get the metadata to see available projects
      const metadata = await this.getMetadata();
      const projects = [];

      // If we have project count in metadata, try to fetch individual project files
      if (metadata.projectCount > 0) {
        // We'll need to implement a way to discover project IDs
        // For now, try to fetch from the API endpoint
        const response = await fetch(`${this.baseUrl}/api/projects`);
        if (response.ok) {
          return await response.json();
        }
      }

      return projects;
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
      const metadata = await this.getMetadata();
      // In a real implementation, metadata would contain project IDs
      // For now, we'll return an empty array
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
}

// Export a default instance
export const publicDataService = new PublicDataService();

// For use in React components
export default PublicDataService;
