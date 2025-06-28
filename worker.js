// Cloudflare Worker for Notion API Proxy
export default {
    async fetch(request, env, ctx) {
        // Handle CORS preflight requests
        if (request.method === 'OPTIONS') {
            return new Response(null, {
                status: 200,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                },
            });
        }

        const url = new URL(request.url);
        const path = url.pathname;

        // CORS headers for all responses
        const corsHeaders = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            'Content-Type': 'application/json',
        };

        try {
            // Route: GET /api/debug - Debug endpoint to check configuration
            if (path === '/api/debug' && request.method === 'GET') {
                return new Response(JSON.stringify({
                    hasToken: !!env.NOTION_TOKEN,
                    hasDatabase: !!env.NOTION_DATABASE_ID,
                    tokenLength: env.NOTION_TOKEN ? env.NOTION_TOKEN.length : 0,
                    databaseId: env.NOTION_DATABASE_ID || 'MISSING',
                    tokenPrefix: env.NOTION_TOKEN ? env.NOTION_TOKEN.substring(0, 4) + '...' : 'MISSING'
                }), {
                    headers: corsHeaders,
                });
            }

            // Route: GET /api/debug/properties - Debug properties of first project
            if (path === '/api/debug/properties' && request.method === 'GET') {
                const response = await fetch('https://api.notion.com/v1/databases/' + env.NOTION_DATABASE_ID + '/query', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${env.NOTION_TOKEN}`,
                        'Notion-Version': '2022-06-28',
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        page_size: 1
                    }),
                });

                const data = await response.json();
                const firstProject = data.results[0];

                return new Response(JSON.stringify({
                    title: firstProject?.properties?.Title?.title[0]?.plain_text,
                    properties: Object.keys(firstProject?.properties || {}),
                    imageProperty: firstProject?.properties?.['Image URL'],
                    allImageProperties: Object.keys(firstProject?.properties || {}).filter(key =>
                        key.toLowerCase().includes('image') ||
                        key.toLowerCase().includes('cover') ||
                        key.toLowerCase().includes('thumbnail')
                    )
                }, null, 2), {
                    headers: corsHeaders,
                });
            }

            // Route: GET /api/projects - Fetch all projects
            if (path === '/api/projects' && request.method === 'GET') {
                // Log environment variables for debugging
                console.log('Debug Info:', {
                    hasToken: !!env.NOTION_TOKEN,
                    hasDatabase: !!env.NOTION_DATABASE_ID,
                    tokenLength: env.NOTION_TOKEN ? env.NOTION_TOKEN.length : 0,
                    databaseId: env.NOTION_DATABASE_ID
                });

                const response = await fetch('https://api.notion.com/v1/databases/' + env.NOTION_DATABASE_ID + '/query', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${env.NOTION_TOKEN}`,
                        'Notion-Version': '2022-06-28',
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        filter: {
                            property: 'Status',
                            select: {
                                equals: 'Published'
                            }
                        },
                        sorts: [
                            {
                                property: 'Date',
                                direction: 'descending'
                            }
                        ]
                    }),
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('Notion API Error Details:', {
                        status: response.status,
                        statusText: response.statusText,
                        body: errorText,
                        token: env.NOTION_TOKEN ? 'SET' : 'MISSING',
                        database: env.NOTION_DATABASE_ID ? 'SET' : 'MISSING'
                    });
                    throw new Error(`Notion API error: ${response.status} - ${errorText}`);
                }

                const data = await response.json();
                const projects = data.results.map(page => {
                    return {
                        id: page.id,
                        title: page.properties.Title?.title[0]?.plain_text || 'Untitled',
                        description: page.properties.Description?.rich_text[0]?.plain_text || '',
                        category: page.properties.Category?.select?.name || 'other',
                        technologies: page.properties.Technologies?.multi_select?.map(tech => tech.name) || [],
                        date: page.properties.Date?.date?.start || new Date().toISOString().split('T')[0],
                        image: getImageUrl(page.properties['Image URL']?.files, page.properties),
                    };
                });

                return new Response(JSON.stringify(projects), {
                    headers: corsHeaders,
                });
            }

            // Route: GET /api/projects/:id - Fetch single project with content
            if (path.startsWith('/api/projects/') && request.method === 'GET') {
                const projectId = path.split('/').pop();

                // Fetch project details
                const pageResponse = await fetch(`https://api.notion.com/v1/pages/${projectId}`, {
                    headers: {
                        'Authorization': `Bearer ${env.NOTION_TOKEN}`,
                        'Notion-Version': '2022-06-28',
                    },
                });

                if (!pageResponse.ok) {
                    throw new Error(`Notion page error: ${pageResponse.status}`);
                }

                const pageData = await pageResponse.json();

                // Fetch page content blocks
                const blocksResponse = await fetch(`https://api.notion.com/v1/blocks/${projectId}/children`, {
                    headers: {
                        'Authorization': `Bearer ${env.NOTION_TOKEN}`,
                        'Notion-Version': '2022-06-28',
                    },
                });

                const blocksData = blocksResponse.ok ? await blocksResponse.json() : { results: [] };

                const project = {
                    id: pageData.id,
                    title: pageData.properties.Title?.title[0]?.plain_text || 'Untitled',
                    description: pageData.properties.Description?.rich_text[0]?.plain_text || '',
                    category: pageData.properties.Category?.select?.name || 'other',
                    technologies: pageData.properties.Technologies?.multi_select?.map(tech => tech.name) || [],
                    date: pageData.properties.Date?.date?.start || new Date().toISOString().split('T')[0],
                    image: getImageUrl(pageData.properties['Image URL']?.files, pageData.properties),
                    fullDescription: convertBlocksToText(blocksData.results),
                };

                return new Response(JSON.stringify(project), {
                    headers: corsHeaders,
                });
            }

            // Route: GET /api/health - Health check
            if (path === '/api/health' && request.method === 'GET') {
                return new Response(JSON.stringify({
                    status: 'ok',
                    timestamp: new Date().toISOString(),
                    worker: 'notion-proxy'
                }), {
                    headers: corsHeaders,
                });
            }

            // 404 for unmatched routes
            return new Response(JSON.stringify({ error: 'Not found' }), {
                status: 404,
                headers: corsHeaders,
            });

        } catch (error) {
            console.error('Worker error:', error);
            return new Response(JSON.stringify({
                error: 'Internal server error',
                message: error.message
            }), {
                status: 500,
                headers: corsHeaders,
            });
        }
    },
};

// Helper function to extract image URL from Files & media property  
function getImageUrl(files, allProperties = {}) {
    // Check common image property names
    const imagePropertyNames = ['Image URL', 'Image', 'image', 'Cover', 'cover', 'Thumbnail', 'thumbnail'];

    // If no files provided, try to find image properties
    if (!files || !Array.isArray(files) || files.length === 0) {
        for (const propName of imagePropertyNames) {
            const prop = allProperties[propName];
            if (prop?.files && Array.isArray(prop.files) && prop.files.length > 0) {
                return extractUrlFromFiles(prop.files);
            }
            // Check if it's a URL property type
            if (prop?.url) {
                return prop.url;
            }
            // Check if it's a rich text with URL
            if (prop?.rich_text && Array.isArray(prop.rich_text) && prop.rich_text.length > 0) {
                const text = prop.rich_text[0].plain_text;
                if (text && (text.startsWith('http') || text.startsWith('https'))) {
                    return text;
                }
            }
        }

        return 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80';
    }

    return extractUrlFromFiles(files);
}

function extractUrlFromFiles(files) {
    if (!files || !Array.isArray(files) || files.length === 0) {
        return 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80';
    }

    const file = files[0];
    if (file.type === 'file' && file.file?.url) {
        return file.file.url;
    } else if (file.type === 'external' && file.external?.url) {
        return file.external.url;
    }

    return 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80';
}

// Helper function to convert Notion blocks to text
function convertBlocksToText(blocks) {
    return blocks.map(block => {
        switch (block.type) {
            case 'paragraph':
                return block.paragraph?.rich_text?.map(text => text.plain_text).join('') || '';
            case 'heading_1':
                return '# ' + (block.heading_1?.rich_text?.map(text => text.plain_text).join('') || '');
            case 'heading_2':
                return '## ' + (block.heading_2?.rich_text?.map(text => text.plain_text).join('') || '');
            case 'heading_3':
                return '### ' + (block.heading_3?.rich_text?.map(text => text.plain_text).join('') || '');
            case 'bulleted_list_item':
                return '• ' + (block.bulleted_list_item?.rich_text?.map(text => text.plain_text).join('') || '');
            case 'numbered_list_item':
                return '1. ' + (block.numbered_list_item?.rich_text?.map(text => text.plain_text).join('') || '');
            default:
                return '';
        }
    }).filter(text => text.trim()).join('\n\n');
}
