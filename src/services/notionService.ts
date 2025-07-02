import { Project } from '../types';
import { publicDataService } from './publicDataService';

/**
 * Note: Direct Notion API calls don't work in browser environments due to CORS.
 * This implementation now uses Cloudflare Workers to proxy Notion API requests.
 * 
 * The Cloudflare Worker handles:
 * 1. CORS headers for browser compatibility
 * 2. Secure storage of Notion credentials
 * 3. API request processing and response formatting
 * 
 * Enhanced with public data folder integration for direct access to synchronized data.
 */

export interface NotionProject {
  id: string;
  properties: {
    Title: {
      title: Array<{
        plain_text: string;
      }>;
    };
    Description: {
      rich_text: Array<{
        plain_text: string;
      }>;
    };
    Category: {
      select: {
        name: string;
      };
    };
    Technologies: {
      multi_select: Array<{
        name: string;
      }>;
    };
    Date: {
      date: {
        start: string;
      };
    };
    'Image URL': {
      files: Array<{
        type: 'file' | 'external';
        file?: {
          url: string;
        };
        external?: {
          url: string;
        };
        name: string;
      }>;
    };
    Status: {
      select: {
        name: string;
      };
    };
  };
}

/**
 * Fetches projects from Notion database
 * Note: This function is currently disabled for browser environments.
 * For production use, implement a serverless function or build-time script.
 */
export const fetchProjectsFromNotion = async (): Promise<Project[]> => {
  try {
    // Use Cloudflare Worker to fetch from Notion (bypasses CORS)
    return await fetchProjectsFromAPI();
  } catch (error) {
    console.error('Error fetching projects from Notion via Worker:', error);
    throw error;
  }
};

/**
 * Alternative implementation using serverless API endpoint
 * This bypasses CORS issues by using your own API as a proxy
 */
export const fetchProjectsFromAPI = async (): Promise<Project[]> => {
  try {
    // Use Cloudflare Worker endpoint
    const workerUrl = import.meta.env.VITE_WORKER_URL;
    
    if (!workerUrl) {
      throw new Error('VITE_WORKER_URL is not configured');
    }
    
    const response = await fetch(`${workerUrl}/api/projects`);
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }
    
    const projects = await response.json();
    return projects || [];
  } catch (error) {
    console.error('Error fetching projects from Cloudflare Worker:', error);
    return []; // Return empty array as fallback
  }
};

/**
 * Enhanced function that tries public data first, then API, then falls back to static data
 */
export const fetchProjectsWithFallback = async (): Promise<Project[]> => {
  try {
    // Try public data first (fastest)
    try {
      const publicProjects = await publicDataService.getProjectsWithFallback();
      if (publicProjects.length > 0) {
        console.info('✅ Successfully loaded projects from public data folder');
        return publicProjects;
      }
    } catch (error) {
      console.debug('Public data not available, trying API:', error);
    }
    
    // Try API second
    const apiProjects = await fetchProjectsFromAPI();
    
    if (apiProjects.length > 0) {
      console.info('✅ Successfully loaded projects from Notion API');
      return apiProjects;
    }
    
    // Fallback to static data
    console.info('📋 Using fallback static projects data');
    return [];
  } catch (error) {
    console.error('❌ Failed to fetch from all sources, using fallback:', error);
    return [];
  }
};

/**
 * Fetches a single project by ID from Notion
 * Note: Currently disabled for browser environments.
 */
export const fetchProjectById = async (id: string): Promise<Project | null> => {
  // Avoid unused parameter warning by using the parameter
  console.debug('Attempting to fetch project with ID:', id);
  
  try {
    if (typeof window !== 'undefined') {
      console.warn('Notion API cannot be called directly from browser. Using fallback data.');
      return null;
    }

    // This would work in a server environment:
    // const response = await notion.pages.retrieve({
    //   page_id: id
    // }) as any;
    // const properties = response.properties;
    // return {
    //   id: response.id,
    //   title: properties.Title?.title?.[0]?.plain_text || 'Untitled Project',
    //   description: properties.Description?.rich_text?.[0]?.plain_text || '',
    //   fullDescription: '', // Will be populated from Notion page content
    //   challenges: '', // Will be populated from Notion page content
    //   results: '', // Will be populated from Notion page content
    //   image: getImageUrlFromFiles(properties['Image URL']),
    //   category: mapNotionCategory(properties.Category?.select?.name),
    //   technologies: properties.Technologies?.multi_select?.map((tech: any) => tech.name) || [],
    //   date: formatDate(properties.Date?.date?.start),
    // };

    return null;
  } catch (error) {
    console.error('Error fetching project by ID from Notion:', error);
    return null;
  }
};

/**
 * Health check for Notion API connection
 */
export const checkNotionConnection = async (): Promise<boolean> => {
  try {
    const workerUrl = import.meta.env.VITE_WORKER_URL;
    
    if (!workerUrl) {
      console.warn('VITE_WORKER_URL is not configured');
      return false;
    }

    // Test the health endpoint
    const response = await fetch(`${workerUrl}/api/health`);
    
    if (response.ok) {
      const data = await response.json();
      console.info('✅ Cloudflare Worker connected:', data);
      return true;
    }
    
    console.warn('❌ Worker health check failed:', response.status);
    return false;
  } catch (error) {
    console.warn('❌ Worker connection failed:', error);
    return false;
  }
};

/**
 * Fetches the full content of a Notion page including rich text blocks
 */
export const fetchNotionPageContent = async (pageId: string): Promise<NotionBlock[]> => {
  // Avoid unused parameter warning by using the parameter
  console.debug('Attempting to fetch content for page ID:', pageId);
  
  try {
    if (typeof window !== 'undefined') {
      console.warn('Notion API cannot be called directly from browser.');
      return [];
    }

    // This would work in a server environment:
    // const response = await notion.blocks.children.list({
    //   block_id: pageId,
    // });
    // return response.results;

    return [];
  } catch (error) {
    console.error('Error fetching Notion page content:', error);
    return [];
  }
};

/**
 * Converts Notion blocks to readable text content
 */
export const convertNotionBlocksToText = (blocks: NotionBlock[]): string => {
  return blocks
    .map((block) => {
      if (block.type === 'paragraph' && block.paragraph?.rich_text) {
        return block.paragraph.rich_text
          .map((text: NotionRichText) => text.plain_text)
          .join('');
      }
      if (block.type === 'heading_1' && block.heading_1?.rich_text) {
        return '# ' + block.heading_1.rich_text
          .map((text: NotionRichText) => text.plain_text)
          .join('');
      }
      if (block.type === 'heading_2' && block.heading_2?.rich_text) {
        return '## ' + block.heading_2.rich_text
          .map((text: NotionRichText) => text.plain_text)
          .join('');
      }
      if (block.type === 'heading_3' && block.heading_3?.rich_text) {
        return '### ' + block.heading_3.rich_text
          .map((text: NotionRichText) => text.plain_text)
          .join('');
      }
      if (block.type === 'bulleted_list_item' && block.bulleted_list_item?.rich_text) {
        return '• ' + block.bulleted_list_item.rich_text
          .map((text: NotionRichText) => text.plain_text)
          .join('');
      }
      if (block.type === 'numbered_list_item' && block.numbered_list_item?.rich_text) {
        return '1. ' + block.numbered_list_item.rich_text
          .map((text: NotionRichText) => text.plain_text)
          .join('');
      }
      return '';
    })
    .filter(text => text.trim() !== '')
    .join('\n\n');
};

/**
 * TypeScript interfaces for Notion API responses
 */
interface NotionRichText {
  plain_text: string;
  href?: string;
}

interface NotionBlock {
  type: string;
  paragraph?: {
    rich_text: NotionRichText[];
  };
  heading_1?: {
    rich_text: NotionRichText[];
  };
  heading_2?: {
    rich_text: NotionRichText[];
  };
  heading_3?: {
    rich_text: NotionRichText[];
  };
  bulleted_list_item?: {
    rich_text: NotionRichText[];
  };
  numbered_list_item?: {
    rich_text: NotionRichText[];
  };
}


