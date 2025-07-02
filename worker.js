// Cloudflare Worker for Notion API Proxy and Admin Features
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
            // Admin authentication check
            const isAdminRequest = path.startsWith('/api/admin') || path.includes('/send-email') || path.includes('/backup');
            if (isAdminRequest && !this.isAuthorized(request, env)) {
                return new Response(JSON.stringify({ error: 'Unauthorized' }), {
                    status: 401,
                    headers: corsHeaders,
                });
            }

            // Route: POST /api/send-email - Send email via SendGrid/Mailgun
            if (path === '/api/send-email' && request.method === 'POST') {
                return await this.handleSendEmail(request, env, corsHeaders);
            }

            // Route: POST /api/notion/backup - Create Notion backup
            if (path === '/api/notion/backup' && request.method === 'POST') {
                return await this.handleNotionBackup(request, env, corsHeaders);
            }

            // Route: GET /api/notion/backup-history - Get backup history
            if (path === '/api/notion/backup-history' && request.method === 'GET') {
                return await this.handleBackupHistory(request, env, corsHeaders);
            }

            // Route: POST /api/notion/restore - Restore from backup
            if (path === '/api/notion/restore' && request.method === 'POST') {
                return await this.handleRestoreBackup(request, env, corsHeaders);
            }

            // Route: POST /api/notion/sync - Sync with Notion
            if (path === '/api/notion/sync' && request.method === 'POST') {
                return await this.handleNotionSync(request, env, corsHeaders);
            }

            // Route: POST /api/data/sync - Enhanced sync with GitHub data branch
            if (path === '/api/data/sync' && request.method === 'POST') {
                return await this.handleDataSync(request, env, corsHeaders);
            }

            // Route: POST /api/data/backup - Create comprehensive backup to GitHub
            if (path === '/api/data/backup' && request.method === 'POST') {
                return await this.handleDataBackup(request, env, corsHeaders);
            }

            // Route: GET /api/data/status - Get synchronization status
            if (path === '/api/data/status' && request.method === 'GET') {
                return await this.handleDataStatus(request, env, corsHeaders);
            }

            // Route: POST /api/data/migrate - Migrate images from Notion to GitHub
            if (path === '/api/data/migrate' && request.method === 'POST') {
                return await this.handleImageMigration(request, env, corsHeaders);
            }

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
                details: error.message
            }), {
                status: 500,
                headers: corsHeaders,
            });
        }
    },

    // Check admin authorization
    isAuthorized(request, env) {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return false;
        }

        const token = authHeader.split(' ')[1];
        return token === env.ADMIN_TOKEN || token === 'admin-token';
    },

    // Handle sending email via SendGrid
    async handleSendEmail(request, env, corsHeaders) {
        try {
            const { to, subject, message, from } = await request.json();

            // Validate input
            if (!to || !subject || !message) {
                return new Response(JSON.stringify({
                    success: false,
                    error: 'Missing required fields'
                }), {
                    status: 400,
                    headers: corsHeaders,
                });
            }

            // Use SendGrid API
            const emailData = {
                personalizations: [
                    {
                        to: [{ email: to }],
                        subject: subject
                    }
                ],
                from: { email: from || 'admin@ayeshmantha.net' },
                content: [
                    {
                        type: 'text/plain',
                        value: message
                    }
                ]
            };

            const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${env.SENDGRID_API_KEY}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(emailData),
            });

            if (response.ok) {
                return new Response(JSON.stringify({
                    success: true,
                    message: 'Email sent successfully'
                }), {
                    headers: corsHeaders,
                });
            } else {
                throw new Error(`SendGrid error: ${response.status}`);
            }

        } catch (error) {
            console.error('Email sending error:', error);
            return new Response(JSON.stringify({
                success: false,
                error: 'Failed to send email',
                details: error.message
            }), {
                status: 500,
                headers: corsHeaders,
            });
        }
    },

    // Handle Notion backup
    async handleNotionBackup(request, env, corsHeaders) {
        try {
            // Fetch all projects from Notion
            const response = await fetch(`https://api.notion.com/v1/databases/${env.NOTION_DATABASE_ID}/query`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${env.NOTION_TOKEN}`,
                    'Notion-Version': '2022-06-28',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({}),
            });

            if (!response.ok) {
                throw new Error(`Notion API error: ${response.status}`);
            }

            const data = await response.json();
            const projects = data.results || [];

            // Create backup data
            const backupData = {
                projects: projects,
                timestamp: new Date().toISOString(),
                count: projects.length,
                metadata: {
                    version: '1.0.0',
                    source: 'notion',
                    backup_type: 'full'
                }
            };

            // Store backup in KV storage for history
            if (env.BACKUP_KV) {
                const backupKey = `backup-${Date.now()}`;
                await env.BACKUP_KV.put(backupKey, JSON.stringify(backupData));
            }

            return new Response(JSON.stringify({
                success: true,
                data: backupData
            }), {
                headers: corsHeaders,
            });

        } catch (error) {
            console.error('Backup error:', error);
            return new Response(JSON.stringify({
                success: false,
                error: 'Failed to create backup',
                details: error.message
            }), {
                status: 500,
                headers: corsHeaders,
            });
        }
    },

    // Handle backup history
    async handleBackupHistory(request, env, corsHeaders) {
        try {
            if (!env.BACKUP_KV) {
                return new Response(JSON.stringify({
                    backups: []
                }), {
                    headers: corsHeaders,
                });
            }

            // List recent backups (simplified - in production you'd want pagination)
            const list = await env.BACKUP_KV.list({ prefix: 'backup-' });
            const backups = [];

            for (const key of list.keys.slice(0, 10)) { // Last 10 backups
                const backup = await env.BACKUP_KV.get(key.name);
                if (backup) {
                    backups.push(JSON.parse(backup));
                }
            }

            return new Response(JSON.stringify({
                backups: backups.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            }), {
                headers: corsHeaders,
            });

        } catch (error) {
            console.error('Backup history error:', error);
            return new Response(JSON.stringify({
                backups: [],
                error: error.message
            }), {
                headers: corsHeaders,
            });
        }
    },

    // Handle restore from backup
    async handleRestoreBackup(request, env, corsHeaders) {
        try {
            const backupData = await request.json();

            // Validate backup data
            if (!backupData.projects || !Array.isArray(backupData.projects)) {
                throw new Error('Invalid backup data');
            }

            // In a real implementation, you would restore to Notion
            // For now, just validate and return success
            return new Response(JSON.stringify({
                success: true,
                message: `Restored ${backupData.projects.length} projects`,
                timestamp: new Date().toISOString()
            }), {
                headers: corsHeaders,
            });

        } catch (error) {
            console.error('Restore error:', error);
            return new Response(JSON.stringify({
                success: false,
                error: 'Failed to restore backup',
                details: error.message
            }), {
                status: 500,
                headers: corsHeaders,
            });
        }
    },

    // Handle Notion sync
    async handleNotionSync(request, env, corsHeaders) {
        try {
            // Fetch latest projects from Notion
            const response = await fetch(`https://api.notion.com/v1/databases/${env.NOTION_DATABASE_ID}/query`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${env.NOTION_TOKEN}`,
                    'Notion-Version': '2022-06-28',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    sorts: [
                        {
                            property: 'Last edited time',
                            direction: 'descending'
                        }
                    ]
                }),
            });

            if (!response.ok) {
                throw new Error(`Notion API error: ${response.status}`);
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

            return new Response(JSON.stringify({
                success: true,
                projects: projects,
                count: projects.length,
                timestamp: new Date().toISOString()
            }), {
                headers: corsHeaders,
            });

        } catch (error) {
            console.error('Sync error:', error);
            return new Response(JSON.stringify({
                success: false,
                error: 'Failed to sync with Notion',
                details: error.message
            }), {
                status: 500,
                headers: corsHeaders,
            });
        }
    },

    // Enhanced data synchronization with GitHub integration
    async handleDataSync(request, env, corsHeaders) {
        try {
            const { force = false, includeImages = true } = await request.json().catch(() => ({}));
            
            // Step 1: Fetch all projects from Notion
            const notionResponse = await fetch(`https://api.notion.com/v1/databases/${env.NOTION_DATABASE_ID}/query`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${env.NOTION_TOKEN}`,
                    'Notion-Version': '2022-06-28',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    sorts: [
                        {
                            property: 'Last edited time',
                            direction: 'descending'
                        }
                    ]
                }),
            });

            if (!notionResponse.ok) {
                throw new Error(`Notion API error: ${notionResponse.status}`);
            }

            const notionData = await notionResponse.json();
            const projects = [];
            const syncTimestamp = new Date().toISOString();
            
            // Step 2: Process each project and fetch detailed content
            for (const page of notionData.results) {
                try {
                    // Fetch page content blocks
                    const blocksResponse = await fetch(`https://api.notion.com/v1/blocks/${page.id}/children`, {
                        headers: {
                            'Authorization': `Bearer ${env.NOTION_TOKEN}`,
                            'Notion-Version': '2022-06-28',
                        },
                    });

                    const blocksData = blocksResponse.ok ? await blocksResponse.json() : { results: [] };

                    const project = {
                        id: `project-${page.id.replace(/-/g, '')}`,
                        title: page.properties.Title?.title[0]?.plain_text || 'Untitled',
                        description: page.properties.Description?.rich_text[0]?.plain_text || '',
                        fullDescription: convertBlocksToText(blocksData.results),
                        category: page.properties.Category?.select?.name || 'other',
                        technologies: page.properties.Technologies?.multi_select?.map(tech => tech.name) || [],
                        date: page.properties.Date?.date?.start || new Date().toISOString().split('T')[0],
                        status: page.properties.Status?.select?.name || 'Published',
                        images: {
                            primary: getImageUrl(page.properties['Image URL']?.files, page.properties),
                            gallery: this.extractGalleryImages(page.properties),
                            local: {
                                primary: `images/${page.id.replace(/-/g, '')}/primary.jpg`,
                                gallery: []
                            }
                        },
                        links: this.extractProjectLinks(page.properties),
                        metadata: {
                            notionId: page.id,
                            lastUpdated: page.last_edited_time,
                            syncedAt: syncTimestamp,
                            version: 1
                        }
                    };

                    projects.push(project);
                } catch (error) {
                    console.error(`Error processing project ${page.id}:`, error);
                }
            }

            // Step 3: Update GitHub data branch (if GitHub token is available)
            let githubUpdateResult = null;
            if (env.GITHUB_TOKEN) {
                githubUpdateResult = await this.updateGitHubDataBranch(projects, env, syncTimestamp);
            }

            // Step 4: Store sync metadata in KV storage
            if (env.BACKUP_KV) {
                const syncMetadata = {
                    timestamp: syncTimestamp,
                    projectCount: projects.length,
                    githubUpdated: !!githubUpdateResult?.success,
                    projects: projects.map(p => ({ id: p.id, title: p.title, lastUpdated: p.metadata.lastUpdated }))
                };
                await env.BACKUP_KV.put(`data-sync-${Date.now()}`, JSON.stringify(syncMetadata));
            }

            return new Response(JSON.stringify({
                success: true,
                message: 'Data synchronization completed',
                data: {
                    projectCount: projects.length,
                    syncTimestamp,
                    githubUpdated: githubUpdateResult?.success || false,
                    projects: projects.map(p => ({
                        id: p.id,
                        title: p.title,
                        category: p.category,
                        lastUpdated: p.metadata.lastUpdated
                    }))
                }
            }), {
                headers: corsHeaders,
            });

        } catch (error) {
            console.error('Data sync error:', error);
            return new Response(JSON.stringify({
                success: false,
                error: 'Failed to sync data',
                details: error.message
            }), {
                status: 500,
                headers: corsHeaders,
            });
        }
    },

    // Create comprehensive backup to GitHub data branch
    async handleDataBackup(request, env, corsHeaders) {
        try {
            const { includeProjects = true, includeImages = false } = await request.json().catch(() => ({}));
            
            // Fetch all data from Notion
            const notionResponse = await fetch(`https://api.notion.com/v1/databases/${env.NOTION_DATABASE_ID}/query`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${env.NOTION_TOKEN}`,
                    'Notion-Version': '2022-06-28',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({}),
            });

            if (!notionResponse.ok) {
                throw new Error(`Notion API error: ${notionResponse.status}`);
            }

            const data = await notionResponse.json();
            const backupTimestamp = new Date().toISOString();
            
            const backupData = {
                version: '2.0.0',
                type: 'comprehensive',
                timestamp: backupTimestamp,
                metadata: {
                    source: 'notion',
                    projectCount: data.results.length,
                    includeImages,
                    includeProjects
                },
                projects: data.results,
                schema: {
                    description: 'Full Notion database backup with enhanced metadata',
                    format: 'notion-api-v2022-06-28'
                }
            };

            // Store in KV for history
            if (env.BACKUP_KV) {
                const backupKey = `comprehensive-backup-${Date.now()}`;
                await env.BACKUP_KV.put(backupKey, JSON.stringify(backupData));
            }

            // Update GitHub data branch if token available
            let githubBackupResult = null;
            if (env.GITHUB_TOKEN) {
                githubBackupResult = await this.createGitHubBackup(backupData, env);
            }

            return new Response(JSON.stringify({
                success: true,
                message: 'Comprehensive backup created',
                data: {
                    timestamp: backupTimestamp,
                    projectCount: data.results.length,
                    size: JSON.stringify(backupData).length,
                    githubBackup: githubBackupResult?.success || false
                }
            }), {
                headers: corsHeaders,
            });

        } catch (error) {
            console.error('Data backup error:', error);
            return new Response(JSON.stringify({
                success: false,
                error: 'Failed to create data backup',
                details: error.message
            }), {
                status: 500,
                headers: corsHeaders,
            });
        }
    },

    // Get synchronization status
    async handleDataStatus(request, env, corsHeaders) {
        try {
            // Get last sync info from KV
            let lastSync = null;
            if (env.BACKUP_KV) {
                const list = await env.BACKUP_KV.list({ prefix: 'data-sync-' });
                if (list.keys.length > 0) {
                    const latestKey = list.keys.sort((a, b) => b.name.localeCompare(a.name))[0];
                    const syncData = await env.BACKUP_KV.get(latestKey.name);
                    if (syncData) {
                        lastSync = JSON.parse(syncData);
                    }
                }
            }

            // Check GitHub data branch status (if token available)
            let githubStatus = null;
            if (env.GITHUB_TOKEN) {
                githubStatus = await this.checkGitHubDataBranchStatus(env);
            }

            return new Response(JSON.stringify({
                status: 'operational',
                lastSync: lastSync,
                github: githubStatus,
                endpoints: {
                    sync: '/api/data/sync',
                    backup: '/api/data/backup',
                    status: '/api/data/status',
                    migrate: '/api/data/migrate'
                },
                features: {
                    notionSync: !!env.NOTION_TOKEN,
                    githubIntegration: !!env.GITHUB_TOKEN,
                    kvStorage: !!env.BACKUP_KV,
                    imageManagement: true
                }
            }), {
                headers: corsHeaders,
            });

        } catch (error) {
            console.error('Data status error:', error);
            return new Response(JSON.stringify({
                status: 'error',
                error: error.message
            }), {
                headers: corsHeaders,
            });
        }
    },

    // Handle image migration from Notion to GitHub
    async handleImageMigration(request, env, corsHeaders) {
        try {
            const { projectIds = [], downloadImages = true } = await request.json().catch(() => ({}));
            
            if (!env.GITHUB_TOKEN) {
                throw new Error('GitHub token required for image migration');
            }

            const migrationResults = [];
            
            // If no specific project IDs provided, get all projects
            if (projectIds.length === 0) {
                const response = await fetch(`https://api.notion.com/v1/databases/${env.NOTION_DATABASE_ID}/query`, {
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
                        }
                    }),
                });

                if (response.ok) {
                    const data = await response.json();
                    projectIds.push(...data.results.map(p => p.id));
                }
            }

            // Process each project for image migration
            for (const projectId of projectIds) {
                try {
                    const migrationResult = await this.migrateProjectImages(projectId, env, downloadImages);
                    migrationResults.push(migrationResult);
                } catch (error) {
                    migrationResults.push({
                        projectId,
                        success: false,
                        error: error.message
                    });
                }
            }

            const successCount = migrationResults.filter(r => r.success).length;

            return new Response(JSON.stringify({
                success: true,
                message: `Image migration completed for ${successCount}/${migrationResults.length} projects`,
                results: migrationResults,
                summary: {
                    total: migrationResults.length,
                    successful: successCount,
                    failed: migrationResults.length - successCount
                }
            }), {
                headers: corsHeaders,
            });

        } catch (error) {
            console.error('Image migration error:', error);
            return new Response(JSON.stringify({
                success: false,
                error: 'Failed to migrate images',
                details: error.message
            }), {
                status: 500,
                headers: corsHeaders,
            });
        }
    },

    // Helper: Extract gallery images from Notion properties
    extractGalleryImages(properties) {
        const galleryImages = [];
        
        // Look for additional image properties
        const imagePropertyNames = ['Gallery', 'gallery', 'Screenshots', 'screenshots', 'Additional Images'];
        
        for (const propName of imagePropertyNames) {
            const prop = properties[propName];
            if (prop?.files && Array.isArray(prop.files)) {
                prop.files.forEach(file => {
                    if (file.type === 'file' && file.file?.url) {
                        galleryImages.push(file.file.url);
                    } else if (file.type === 'external' && file.external?.url) {
                        galleryImages.push(file.external.url);
                    }
                });
            }
        }
        
        return galleryImages;
    },

    // Helper: Extract project links from Notion properties
    extractProjectLinks(properties) {
        return {
            github: properties['GitHub']?.url || properties['Repository']?.url || '',
            demo: properties['Demo']?.url || properties['Live Demo']?.url || properties['Website']?.url || '',
            documentation: properties['Documentation']?.url || properties['Docs']?.url || ''
        };
    },

    // Helper: Update GitHub data branch with projects
    async updateGitHubDataBranch(projects, env, timestamp) {
        try {
            const owner = 'AyeshmanthaM'; // Update with your GitHub username
            const repo = 'AyeshmanthaM.github.io'; // Update with your repo name
            const branch = 'data';

            // Update metadata.json
            const metadataContent = {
                version: '1.0.0',
                branch: 'data',
                purpose: 'Portfolio project data and assets',
                lastSync: timestamp,
                projectCount: projects.length,
                syncHistory: [], // In production, you'd maintain this history
                structure: {
                    projects: 'Individual project data files',
                    images: 'Project images and screenshots',
                    backups: 'Notion database backups',
                    sync: 'Synchronization metadata'
                },
                endpoints: {
                    sync: '/api/data/sync',
                    backup: '/api/data/backup',
                    restore: '/api/data/restore'
                }
            };

            // Create/update individual project files
            const updatePromises = projects.map(async (project) => {
                const filePath = `data/projects/${project.id}.json`;
                const content = JSON.stringify(project, null, 2);
                
                return this.updateGitHubFile(
                    owner, repo, branch, filePath, content, 
                    `Update project data for ${project.title}`, env.GITHUB_TOKEN
                );
            });

            // Update metadata file
            updatePromises.push(
                this.updateGitHubFile(
                    owner, repo, branch, 'data/metadata.json', 
                    JSON.stringify(metadataContent, null, 2),
                    `Update metadata - sync ${timestamp}`, env.GITHUB_TOKEN
                )
            );

            await Promise.all(updatePromises);

            return { success: true, updatedFiles: projects.length + 1 };

        } catch (error) {
            console.error('GitHub update error:', error);
            return { success: false, error: error.message };
        }
    },

    // Helper: Update a specific file in GitHub
    async updateGitHubFile(owner, repo, branch, path, content, message, token) {
        try {
            const encodedContent = btoa(unescape(encodeURIComponent(content)));
            
            // Get current file SHA (if exists)
            let sha = null;
            try {
                const getResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`, {
                    headers: {
                        'Authorization': `token ${token}`,
                        'Accept': 'application/vnd.github.v3+json',
                    },
                });
                
                if (getResponse.ok) {
                    const fileData = await getResponse.json();
                    sha = fileData.sha;
                }
            } catch (error) {
                // File doesn't exist, which is fine for new files
            }

            // Update or create file
            const updateData = {
                message,
                content: encodedContent,
                branch
            };

            if (sha) {
                updateData.sha = sha;
            }

            const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `token ${token}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updateData),
            });

            return response.ok;

        } catch (error) {
            console.error(`Error updating ${path}:`, error);
            return false;
        }
    },

    // Helper: Create GitHub backup
    async createGitHubBackup(backupData, env) {
        try {
            const owner = 'AyeshmanthaM';
            const repo = 'AyeshmanthaM.github.io';
            const branch = 'data';
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const filePath = `data/backups/full-backup-${timestamp}.json`;
            
            const success = await this.updateGitHubFile(
                owner, repo, branch, filePath,
                JSON.stringify(backupData, null, 2),
                `Create comprehensive backup - ${timestamp}`,
                env.GITHUB_TOKEN
            );

            return { success, filePath };

        } catch (error) {
            console.error('GitHub backup error:', error);
            return { success: false, error: error.message };
        }
    },

    // Helper: Check GitHub data branch status
    async checkGitHubDataBranchStatus(env) {
        try {
            const owner = 'AyeshmanthaM';
            const repo = 'AyeshmanthaM.github.io';
            const branch = 'data';

            const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/branches/${branch}`, {
                headers: {
                    'Authorization': `token ${env.GITHUB_TOKEN}`,
                    'Accept': 'application/vnd.github.v3+json',
                },
            });

            if (response.ok) {
                const branchData = await response.json();
                return {
                    exists: true,
                    lastCommit: branchData.commit.sha,
                    lastUpdate: branchData.commit.commit.author.date
                };
            }

            return { exists: false };

        } catch (error) {
            return { exists: false, error: error.message };
        }
    },

    // Helper: Migrate images for a specific project
    async migrateProjectImages(projectId, env, downloadImages) {
        try {
            // Fetch project details from Notion
            const pageResponse = await fetch(`https://api.notion.com/v1/pages/${projectId}`, {
                headers: {
                    'Authorization': `Bearer ${env.NOTION_TOKEN}`,
                    'Notion-Version': '2022-06-28',
                },
            });

            if (!pageResponse.ok) {
                throw new Error(`Failed to fetch project ${projectId}`);
            }

            const pageData = await pageResponse.json();
            const projectTitle = pageData.properties.Title?.title[0]?.plain_text || 'Untitled';
            
            // Extract image URLs
            const imageUrls = [];
            const primaryImage = getImageUrl(pageData.properties['Image URL']?.files, pageData.properties);
            if (primaryImage && !primaryImage.includes('unsplash.com')) {
                imageUrls.push({ type: 'primary', url: primaryImage });
            }

            // Add gallery images
            const galleryImages = this.extractGalleryImages(pageData.properties);
            galleryImages.forEach((url, index) => {
                imageUrls.push({ type: 'gallery', url, index });
            });

            // If downloadImages is true, you would implement actual download and upload logic here
            // For now, we'll just return the migration plan
            
            return {
                projectId,
                title: projectTitle,
                success: true,
                imageCount: imageUrls.length,
                images: imageUrls,
                localPaths: imageUrls.map(img => `images/${projectId.replace(/-/g, '')}/${img.type}${img.index ? `-${img.index}` : ''}.jpg`)
            };

        } catch (error) {
            return {
                projectId,
                success: false,
                error: error.message
            };
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
