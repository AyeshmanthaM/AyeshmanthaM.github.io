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

            // Route: POST /api/data/sync - Enhanced sync with public folder
            if (path === '/api/data/sync' && request.method === 'POST') {
                return await this.handleDataSync(request, env, corsHeaders);
            }

            // Route: GET /api/data/status - Get synchronization status
            if (path === '/api/data/status' && request.method === 'GET') {
                return await this.handleDataStatus(request, env, corsHeaders);
            }

            // Route: POST /api/data/migrate - Migrate images from Notion to public folder
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
                                primary: `/images/projects/${page.id.replace(/-/g, '')}/primary.jpg`,
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

            // Step 3: Download and upload images to GitHub (if GitHub token is available)
            let imageUploadResults = [];
            if (env.GITHUB_TOKEN) {
                console.log(`📸 Starting image download and upload process...`);
                for (const project of projects) {
                    try {
                        const imageResult = await this.downloadAndUploadProjectImages(project, env);
                        imageUploadResults.push(imageResult);
                    } catch (error) {
                        console.error(`Error processing images for project ${project.id}:`, error);
                        imageUploadResults.push({
                            projectId: project.id,
                            success: false,
                            error: error.message
                        });
                    }
                }
            }

            // Step 4: Update GitHub public folder (if GitHub token is available)
            let githubUpdateResult = null;
            if (env.GITHUB_TOKEN) {
                githubUpdateResult = await this.updateGitHubPublicFolder(projects, env, syncTimestamp);
            }

            return new Response(JSON.stringify({
                success: true,
                message: 'Data synchronization completed',
                data: {
                    projectCount: projects.length,
                    syncTimestamp,
                    githubUpdated: githubUpdateResult?.success || false,
                    imagesProcessed: imageUploadResults.length,
                    imageResults: imageUploadResults,
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

    // Get synchronization status
    async handleDataStatus(request, env, corsHeaders) {
        try {
            // Get last sync info from KV
            let lastSync = null;

            // Check GitHub public folder status (if token available)
            let githubStatus = null;
            if (env.GITHUB_TOKEN) {
                githubStatus = await this.checkGitHubPublicFolderStatus(env);
            }

            return new Response(JSON.stringify({
                status: 'operational',
                lastSync: lastSync,
                github: githubStatus,
                endpoints: {
                    sync: '/api/data/sync',
                    status: '/api/data/status',
                    migrate: '/api/data/migrate'
                },
                features: {
                    notionSync: !!env.NOTION_TOKEN,
                    githubIntegration: !!env.GITHUB_TOKEN,
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

            // Process each project for image migration to public/images/projects
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

    // Helper: Download and upload project images to GitHub
    async downloadAndUploadProjectImages(project, env) {
        try {
            const owner = 'AyeshmanthaM';
            const repo = 'AyeshmanthaM.github.io';
            const branch = 'gh-pages';

            console.log(`📸 Processing images for project: ${project.title}`);

            const uploadedImages = [];
            const projectIdClean = project.id.replace('project-', '');

            // Process primary image - Always try to download if there's a valid Notion URL
            if (project.images.primary && this.isValidImageUrl(project.images.primary)) {
                try {
                    console.log(`🔄 Checking primary image for ${project.title}: ${project.images.primary.substring(0, 50)}...`);

                    const imageData = await this.downloadImage(project.images.primary);
                    if (imageData) {
                        const imagePath = `public/images/projects/${projectIdClean}/primary.jpg`;
                        const commitMessage = `Update primary image for ${project.title}`;

                        const uploadSuccess = await this.uploadImageToGitHub(
                            owner, repo, branch, imagePath, imageData,
                            commitMessage, env.GITHUB_TOKEN
                        );

                        if (uploadSuccess) {
                            uploadedImages.push({
                                type: 'primary',
                                path: imagePath,
                                success: true,
                                sourceUrl: project.images.primary
                            });

                            // Update project's local image path
                            project.images.local.primary = `/images/projects/${projectIdClean}/primary.jpg`;
                            console.log(`✅ Primary image updated for ${project.title}`);
                        } else {
                            console.error(`❌ Failed to upload primary image for ${project.title}`);
                        }
                    } else {
                        console.error(`❌ Failed to download primary image for ${project.title}`);
                    }
                } catch (error) {
                    console.error(`Error processing primary image for ${project.title}:`, error);
                    uploadedImages.push({
                        type: 'primary',
                        success: false,
                        error: error.message,
                        sourceUrl: project.images.primary
                    });
                }
            } else {
                console.log(`⏭️ Skipping primary image for ${project.title} - no valid URL or placeholder image`);
            }

            // Process gallery images - Always try to download if there are valid Notion URLs
            if (project.images.gallery && project.images.gallery.length > 0) {
                console.log(`🖼️ Processing ${project.images.gallery.length} gallery images for ${project.title}`);

                for (let i = 0; i < project.images.gallery.length; i++) {
                    const galleryImageUrl = project.images.gallery[i];
                    if (this.isValidImageUrl(galleryImageUrl)) {
                        try {
                            console.log(`🔄 Downloading gallery image ${i + 1} for ${project.title}: ${galleryImageUrl.substring(0, 50)}...`);

                            const imageData = await this.downloadImage(galleryImageUrl);
                            if (imageData) {
                                const imagePath = `public/images/projects/${projectIdClean}/gallery-${i + 1}.jpg`;
                                const commitMessage = `Update gallery image ${i + 1} for ${project.title}`;

                                const uploadSuccess = await this.uploadImageToGitHub(
                                    owner, repo, branch, imagePath, imageData,
                                    commitMessage, env.GITHUB_TOKEN
                                );

                                if (uploadSuccess) {
                                    uploadedImages.push({
                                        type: 'gallery',
                                        index: i + 1,
                                        path: imagePath,
                                        success: true,
                                        sourceUrl: galleryImageUrl
                                    });

                                    // Update project's local gallery paths
                                    if (!project.images.local.gallery) {
                                        project.images.local.gallery = [];
                                    }
                                    project.images.local.gallery.push(`/images/projects/${projectIdClean}/gallery-${i + 1}.jpg`);
                                    console.log(`✅ Gallery image ${i + 1} updated for ${project.title}`);
                                } else {
                                    console.error(`❌ Failed to upload gallery image ${i + 1} for ${project.title}`);
                                }
                            } else {
                                console.error(`❌ Failed to download gallery image ${i + 1} for ${project.title}`);
                            }
                        } catch (error) {
                            console.error(`Error processing gallery image ${i + 1} for ${project.title}:`, error);
                            uploadedImages.push({
                                type: 'gallery',
                                index: i + 1,
                                success: false,
                                error: error.message,
                                sourceUrl: galleryImageUrl
                            });
                        }
                    } else {
                        console.log(`⏭️ Skipping gallery image ${i + 1} for ${project.title} - no valid URL or placeholder image`);
                    }
                }
            } else {
                console.log(`📷 No gallery images to process for ${project.title}`);
            }

            return {
                projectId: project.id,
                projectTitle: project.title,
                success: true,
                uploadedImages: uploadedImages,
                totalImages: uploadedImages.length,
                successfulUploads: uploadedImages.filter(img => img.success).length
            };

        } catch (error) {
            console.error(`Error in downloadAndUploadProjectImages for ${project.id}:`, error);
            return {
                projectId: project.id,
                success: false,
                error: error.message
            };
        }
    },

    // Helper: Download image from URL with retry logic
    async downloadImage(imageUrl, maxRetries = 3) {
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                console.log(`⬇️ Downloading image (attempt ${attempt}/${maxRetries}): ${imageUrl.substring(0, 80)}...`);

                // Add timeout to prevent hanging
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

                const response = await fetch(imageUrl, {
                    signal: controller.signal,
                    headers: {
                        'User-Agent': 'Cloudflare-Worker-Image-Downloader/1.0'
                    }
                });

                clearTimeout(timeoutId);

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                // Check content type
                const contentType = response.headers.get('content-type');
                if (!contentType || !contentType.startsWith('image/')) {
                    throw new Error(`Invalid content type: ${contentType}. Expected image/*`);
                }

                const imageBuffer = await response.arrayBuffer();

                if (imageBuffer.byteLength === 0) {
                    throw new Error('Downloaded image is empty');
                }

                if (imageBuffer.byteLength > 25 * 1024 * 1024) { // 25MB limit
                    throw new Error(`Image too large: ${Math.round(imageBuffer.byteLength / 1024 / 1024)}MB. Maximum 25MB allowed`);
                }

                // Convert to base64 in chunks to avoid stack overflow
                const base64Image = await this.arrayBufferToBase64(imageBuffer);

                console.log(`✅ Successfully downloaded image (${Math.round(imageBuffer.byteLength / 1024)}KB)`);
                return base64Image;

            } catch (error) {
                console.error(`❌ Download attempt ${attempt} failed: ${error.message}`);

                if (attempt === maxRetries) {
                    console.error(`❌ Failed to download image after ${maxRetries} attempts: ${imageUrl}`);
                    return null;
                }

                // Wait before retry (exponential backoff)
                const waitTime = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
                console.log(`⏳ Waiting ${waitTime}ms before retry...`);
                await new Promise(resolve => setTimeout(resolve, waitTime));
            }
        }

        return null;
    },

    // Helper: Upload image to GitHub with improved error handling
    async uploadImageToGitHub(owner, repo, branch, path, base64Data, message, token) {
        try {
            console.log(`📤 Uploading image to GitHub: ${path} (${Math.round(base64Data.length * 0.75 / 1024)}KB)`);

            // Validate inputs
            if (!token || !token.startsWith('ghp_') && !token.startsWith('github_pat_')) {
                throw new Error('Invalid GitHub token format');
            }

            if (!base64Data || base64Data.length === 0) {
                throw new Error('Empty image data provided');
            }

            // Check if image already exists and get SHA
            let sha = null;
            let isUpdate = false;

            try {
                const getResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/vnd.github.v3+json',
                        'User-Agent': 'Cloudflare-Worker-Notion-Sync'
                    },
                });

                if (getResponse.ok) {
                    const fileData = await getResponse.json();
                    sha = fileData.sha;
                    isUpdate = true;
                    console.log(`🔄 Image exists, will update (SHA: ${sha.substring(0, 8)}...)`);
                } else if (getResponse.status === 404) {
                    console.log(`🆕 New image will be created`);
                } else {
                    console.warn(`⚠️ Unexpected response when checking file existence: ${getResponse.status}`);
                }
            } catch (error) {
                console.log(`🆕 Assuming new image (check failed: ${error.message})`);
            }

            // Prepare upload data
            const updateData = {
                message: isUpdate ? `Update ${message}` : `Add ${message}`,
                content: base64Data,
                branch
            };

            if (sha) {
                updateData.sha = sha;
            }

            // Upload or update image
            const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json',
                    'User-Agent': 'Cloudflare-Worker-Notion-Sync'
                },
                body: JSON.stringify(updateData),
            });

            if (response.ok) {
                const result = await response.json();
                const commitSha = result.commit?.sha?.substring(0, 8) || 'unknown';
                console.log(`✅ Successfully ${isUpdate ? 'updated' : 'created'} image: ${path} (commit: ${commitSha})`);
                return true;
            } else {
                const errorText = await response.text();
                console.error(`❌ Failed to upload image ${path}: ${response.status} - ${response.statusText}`);
                console.error(`Error details: ${errorText.substring(0, 200)}...`);
                return false;
            }

        } catch (error) {
            console.error(`❌ Exception uploading image ${path}:`, error);
            return false;
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

    // Helper: Update GitHub public folder with projects
    async updateGitHubPublicFolder(projects, env, timestamp) {
        try {
            const owner = 'AyeshmanthaM';
            const repo = 'AyeshmanthaM.github.io';
            const branch = 'gh-pages';

            console.log(`🔄 Starting GitHub update for ${projects.length} projects to ${owner}/${repo}:${branch}`);

            // Step 1: Get existing project files in GitHub to identify orphaned files
            const existingFiles = await this.getExistingProjectFiles(owner, repo, branch, env.GITHUB_TOKEN);
            const currentProjectIds = projects.map(p => p.id);
            const filesToDelete = existingFiles.filter(filename => {
                const fileProjectId = filename.replace('.json', '');
                return !currentProjectIds.includes(fileProjectId);
            });

            console.log(`� File analysis: ${existingFiles.length} existing, ${currentProjectIds.length} current, ${filesToDelete.length} to delete`);

            // Step 2: Delete orphaned files
            const deletePromises = filesToDelete.map(async (filename) => {
                const filePath = `public/data/projects/${filename}`;
                const result = await this.deleteGitHubFile(
                    owner, repo, branch, filePath,
                    `Remove deleted project: ${filename}`, env.GITHUB_TOKEN
                );
                return { path: filePath, success: result, action: 'deleted', project: filename };
            });

            // Step 3: Update metadata.json
            const metadataContent = {
                version: '1.0.0',
                location: 'public/data',
                purpose: 'Portfolio project data stored in public folder',
                lastSync: timestamp,
                projectCount: projects.length,
                syncHistory: [
                    {
                        timestamp,
                        projectCount: projects.length,
                        deletedCount: filesToDelete.length,
                        method: 'cloudflare-worker'
                    }
                ],
                structure: {
                    projects: 'Individual project data files'
                },
                endpoints: {
                    sync: '/api/data/sync'
                },
                access: {
                    baseUrl: 'https://ayeshmantham.github.io/data/',
                    projects: 'projects/{project-id}.json',
                    metadata: 'metadata.json'
                },
                projects: projects.map(p => ({
                    id: p.id,
                    title: p.title,
                    category: p.category,
                    filename: `${p.id}.json`
                }))
            };

            // Step 4: Create/update individual project files SEQUENTIALLY
            console.log(`📝 Updating ${projects.length} project files sequentially to avoid conflicts...`);
            const updateResults = [];

            for (const project of projects) {
                const filePath = `public/data/projects/${project.id}.json`;
                const content = JSON.stringify(project, null, 2);

                const result = await this.updateGitHubFile(
                    owner, repo, branch, filePath, content,
                    `Update project data for ${project.title}`, env.GITHUB_TOKEN
                );
                updateResults.push({ path: filePath, success: result, action: 'updated', project: project.title });

                // Longer delay to prevent rate limiting and conflicts
                await new Promise(resolve => setTimeout(resolve, 500));
            }

            // Step 5: Update metadata file AFTER all project files with delay
            console.log(`📝 Updating metadata file...`);
            await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay before metadata
            const metadataResult = await this.updateGitHubFile(
                owner, repo, branch, 'public/data/metadata.json',
                JSON.stringify(metadataContent, null, 2),
                `Update metadata - sync ${timestamp}`, env.GITHUB_TOKEN
            );
            updateResults.push({
                path: 'public/data/metadata.json',
                success: metadataResult,
                action: 'updated',
                project: 'metadata'
            });

            // Execute delete operations (these can be parallel as they don't conflict)
            const deleteResults = await Promise.all(deletePromises);

            // Combine all results
            const results = [...deleteResults, ...updateResults];

            const successCount = results.filter(r => r.success).length;
            const failedFiles = results.filter(r => !r.success);
            const deletedCount = results.filter(r => r.action === 'deleted' && r.success).length;
            const updatedCount = results.filter(r => r.action === 'updated' && r.success).length;

            console.log(`📊 GitHub Update Summary: ${successCount}/${results.length} operations successful`);
            console.log(`   - Updated: ${updatedCount} files`);
            console.log(`   - Deleted: ${deletedCount} files`);

            if (failedFiles.length > 0) {
                console.error('❌ Failed operations:', failedFiles.map(f => `${f.action}: ${f.path}`));
            }

            if (deletedCount > 0) {
                console.log(`🗑️ Cleaned up ${deletedCount} orphaned files`);
            }

            return {
                success: successCount > 0,
                updatedFiles: updatedCount,
                deletedFiles: deletedCount,
                totalOperations: results.length,
                failedFiles: failedFiles.map(f => ({ action: f.action, path: f.path })),
                details: results
            };

        } catch (error) {
            console.error('GitHub update error:', error);
            return { success: false, error: error.message };
        }
    },

    // Helper: Update a specific file in GitHub
    async updateGitHubFile(owner, repo, branch, path, content, message, token) {
        try {
            console.log(`📝 Updating GitHub file: ${path}`);

            // Validate token format
            if (!token || (!token.startsWith('ghp_') && !token.startsWith('github_pat_'))) {
                console.error('❌ Invalid GitHub token format. Expected ghp_ or github_pat_ prefix');
                return false;
            }

            const encodedContent = btoa(unescape(encodeURIComponent(content)));

            // Always get fresh SHA right before update to avoid conflicts
            let sha = null;
            try {
                console.log(`🔍 Getting fresh SHA for: ${path}`);
                const getResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/vnd.github.v3+json',
                        'User-Agent': 'Cloudflare-Worker-Notion-Sync'
                    },
                });

                if (getResponse.ok) {
                    const fileData = await getResponse.json();
                    sha = fileData.sha;
                    console.log(`✅ File exists, using fresh SHA: ${sha.substring(0, 8)}...`);
                } else if (getResponse.status === 404) {
                    console.log(`ℹ️ File doesn't exist, will create new file`);
                } else {
                    console.error(`⚠️ Error getting fresh SHA: ${getResponse.status} - ${getResponse.statusText}`);
                    const errorText = await getResponse.text();
                    console.error('Error details:', errorText);
                }
            } catch (error) {
                console.log(`ℹ️ File doesn't exist or error getting SHA: ${error.message}`);
            }

            // Update or create file
            const updateData = {
                message,
                content: encodedContent,
                branch
            };

            if (sha) {
                updateData.sha = sha;
                console.log(`🔄 Updating existing file with fresh SHA`);
            } else {
                console.log(`🆕 Creating new file`);
            }

            console.log(`📤 Sending update request for ${path}`);
            const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json',
                    'User-Agent': 'Cloudflare-Worker-Notion-Sync'
                },
                body: JSON.stringify(updateData),
            });

            if (response.ok) {
                const result = await response.json();
                console.log(`✅ Successfully updated ${path}, commit SHA: ${result.commit?.sha?.substring(0, 8)}...`);
                return true;
            } else if (response.status === 409) {
                // Handle conflict with one retry using even fresher SHA
                const errorText = await response.text();
                console.warn(`⚠️ Conflict detected for ${path}, getting even fresher SHA for retry...`);

                try {
                    // Wait a moment and get the latest SHA again
                    await new Promise(resolve => setTimeout(resolve, 1000));

                    const refreshResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`, {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Accept': 'application/vnd.github.v3+json',
                            'User-Agent': 'Cloudflare-Worker-Notion-Sync'
                        },
                    });

                    if (refreshResponse.ok) {
                        const refreshData = await refreshResponse.json();
                        const newerSha = refreshData.sha;
                        console.log(`🔄 Retrying with even fresher SHA: ${newerSha.substring(0, 8)}...`);

                        // Retry with the newest SHA
                        const retryData = {
                            message: message + ' (retry)',
                            content: encodedContent,
                            branch,
                            sha: newerSha
                        };

                        const retryResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
                            method: 'PUT',
                            headers: {
                                'Authorization': `Bearer ${token}`,
                                'Accept': 'application/vnd.github.v3+json',
                                'Content-Type': 'application/json',
                                'User-Agent': 'Cloudflare-Worker-Notion-Sync'
                            },
                            body: JSON.stringify(retryData),
                        });

                        if (retryResponse.ok) {
                            const retryResult = await retryResponse.json();
                            console.log(`✅ Successfully updated ${path} after retry, commit SHA: ${retryResult.commit?.sha?.substring(0, 8)}...`);
                            return true;
                        } else {
                            const retryErrorText = await retryResponse.text();
                            console.error(`❌ Retry also failed for ${path}: ${retryResponse.status} - ${retryResponse.statusText}`);
                            console.error(`Retry error details: ${retryErrorText.substring(0, 200)}...`);
                            return false;
                        }
                    } else {
                        console.error(`❌ Could not get fresh SHA for retry ${path}: ${refreshResponse.status}`);
                        return false;
                    }
                } catch (retryError) {
                    console.error(`❌ Exception during retry for ${path}:`, retryError);
                    return false;
                }
            } else {
                const errorText = await response.text();
                console.error(`❌ Failed to update ${path}: ${response.status} - ${response.statusText}`);
                console.error('Error details:', errorText);

                // Try to parse error for more details
                try {
                    const errorData = JSON.parse(errorText);
                    console.error('Parsed error:', errorData);
                } catch (e) {
                    // Error text is not JSON
                }

                return false;
            }

        } catch (error) {
            console.error(`❌ Exception updating ${path}:`, error);
            return false;
        }
    },

    // Helper: Check GitHub public folder status
    async checkGitHubPublicFolderStatus(env) {
        try {
            const owner = 'AyeshmanthaM';
            const repo = 'AyeshmanthaM.github.io';
            const branch = 'gh-pages';

            // Check if public/data/metadata.json exists
            const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/public/data/metadata.json?ref=${branch}`, {
                headers: {
                    'Authorization': `token ${env.GITHUB_TOKEN}`,
                    'Accept': 'application/vnd.github.v3+json',
                },
            });

            if (response.ok) {
                const fileData = await response.json();
                return {
                    exists: true,
                    lastUpdate: fileData.commit ? fileData.commit.date : 'unknown',
                    size: fileData.size
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
                localPaths: imageUrls.map(img => `/images/projects/${projectId.replace(/-/g, '')}/${img.type}${img.index ? `-${img.index}` : ''}.jpg`)
            };

        } catch (error) {
            return {
                projectId,
                success: false,
                error: error.message
            };
        }
    },

    // Helper: Get existing project files from GitHub
    async getExistingProjectFiles(owner, repo, branch, token) {
        try {
            console.log(`🔍 Fetching existing project files from ${owner}/${repo}:${branch}`);

            const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/public/data/projects?ref=${branch}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'User-Agent': 'Cloudflare-Worker-Notion-Sync'
                },
            });

            if (response.ok) {
                const files = await response.json();
                const jsonFiles = files
                    .filter(file => file.type === 'file' && file.name.endsWith('.json'))
                    .map(file => file.name);

                console.log(`📁 Found ${jsonFiles.length} existing project files:`, jsonFiles);
                return jsonFiles;
            } else if (response.status === 404) {
                console.log(`📁 public/data/projects directory doesn't exist yet`);
                return [];
            } else {
                const errorText = await response.text();
                console.error(`❌ Error fetching existing files: ${response.status} - ${response.statusText}`);
                console.error('Error details:', errorText);
                return [];
            }
        } catch (error) {
            console.error('❌ Exception fetching existing files:', error);
            return [];
        }
    },

    // Helper: Delete a file from GitHub
    async deleteGitHubFile(owner, repo, branch, path, message, token) {
        try {
            console.log(`🗑️ Deleting GitHub file: ${path}`);

            // Validate token format
            if (!token || (!token.startsWith('ghp_') && !token.startsWith('github_pat_'))) {
                console.error('❌ Invalid GitHub token format for deletion');
                return false;
            }

            // First, get the file's SHA
            const getResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'User-Agent': 'Cloudflare-Worker-Notion-Sync'
                },
            });

            if (!getResponse.ok) {
                if (getResponse.status === 404) {
                    console.log(`ℹ️ File ${path} doesn't exist, nothing to delete`);
                    return true; // Consider this a success since the goal is achieved
                }
                const errorText = await getResponse.text();
                console.error(`❌ Error getting file SHA: ${getResponse.status} - ${getResponse.statusText}`);
                console.error('Error details:', errorText);
                return false;
            }

            const fileData = await getResponse.json();
            const sha = fileData.sha;
            console.log(`📋 File SHA for deletion: ${sha.substring(0, 8)}...`);

            // Delete the file
            const deleteResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json',
                    'User-Agent': 'Cloudflare-Worker-Notion-Sync'
                },
                body: JSON.stringify({
                    message,
                    sha,
                    branch
                }),
            });

            if (deleteResponse.ok) {
                const result = await deleteResponse.json();
                console.log(`✅ Successfully deleted ${path}, commit SHA: ${result.commit?.sha?.substring(0, 8)}...`);
                return true;
            } else {
                const errorText = await deleteResponse.text();
                console.error(`❌ Failed to delete ${path}: ${deleteResponse.status} - ${deleteResponse.statusText}`);
                console.error('Error details:', errorText);
                return false;
            }

        } catch (error) {
            console.error(`❌ Exception deleting ${path}:`, error);
            return false;
        }
    },

    // Helper: Check if image URL is valid and should be downloaded
    isValidImageUrl(url) {
        if (!url || typeof url !== 'string') {
            return false;
        }

        // Skip placeholder URLs
        if (url.includes('unsplash.com') || url.includes('placeholder')) {
            return false;
        }

        // Check if it's a valid HTTP/HTTPS URL
        try {
            const urlObj = new URL(url);
            return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
        } catch (error) {
            return false;
        }
    },

    // Helper: Convert ArrayBuffer to Base64 in chunks to avoid stack overflow
    async arrayBufferToBase64(buffer) {
        try {
            const uint8Array = new Uint8Array(buffer);
            const chunkSize = 1024; // Smaller 1KB chunks to avoid stack overflow
            let result = '';

            // Process in smaller chunks and avoid String.fromCharCode.apply with large arrays
            for (let i = 0; i < uint8Array.length; i += chunkSize) {
                const chunk = uint8Array.subarray(i, i + chunkSize);

                // Convert chunk to string character by character to avoid apply stack overflow
                let chunkString = '';
                for (let j = 0; j < chunk.length; j++) {
                    chunkString += String.fromCharCode(chunk[j]);
                }
                result += chunkString;

                // Yield control occasionally to prevent blocking
                if (i % (chunkSize * 10) === 0) {
                    await new Promise(resolve => setTimeout(resolve, 0));
                }
            }

            return btoa(result);
        } catch (error) {
            console.error('❌ Error converting to base64:', error);
            throw new Error('Failed to convert image to base64');
        }
    }
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