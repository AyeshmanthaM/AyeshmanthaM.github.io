import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const WORKER_URL = 'https://notion-cors-proxy.maduranga-ayeshmantha.workers.dev';
const PUBLIC_DATA_DIR = join(__dirname, 'public', 'data');
const PROJECTS_DIR = join(PUBLIC_DATA_DIR, 'projects');

// Ensure directories exist
function ensureDirectoryExists(dir) {
    try {
        mkdirSync(dir, { recursive: true });
        console.log(`✅ Directory created: ${dir}`);
    } catch (error) {
        if (error.code !== 'EEXIST') {
            throw error;
        }
    }
}

// Fetch data from Notion API
async function fetchNotionData() {
    try {
        console.log('🔄 Fetching projects from Notion...');
        const response = await fetch(`${WORKER_URL}/api/projects`);
        
        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }
        
        const projects = await response.json();
        console.log(`✅ Found ${projects.length} projects`);
        return projects;
        
    } catch (error) {
        console.error('❌ Error fetching Notion data:', error);
        throw error;
    }
}

// Save projects to public folder
async function saveProjectsToPublicFolder(projects) {
    try {
        ensureDirectoryExists(PUBLIC_DATA_DIR);
        ensureDirectoryExists(PROJECTS_DIR);
        
        const timestamp = new Date().toISOString();
        
        // Save individual project files
        for (const project of projects) {
            const projectData = {
                id: project.id,
                title: project.title,
                description: project.description,
                category: project.category,
                technologies: project.technologies || [],
                date: project.date,
                image: project.image,
                metadata: {
                    lastUpdated: timestamp,
                    source: 'notion-api',
                    version: '1.0.0'
                }
            };
            
            const filename = `${project.id.replace(/[^a-zA-Z0-9]/g, '')}.json`;
            const filepath = join(PROJECTS_DIR, filename);
            
            writeFileSync(filepath, JSON.stringify(projectData, null, 2));
            console.log(`✅ Saved: ${filename}`);
        }
        
        // Create metadata file
        const metadata = {
            version: '1.0.0',
            location: 'public/data',
            purpose: 'Portfolio project data stored in public folder',
            lastSync: timestamp,
            projectCount: projects.length,
            syncHistory: [
                {
                    timestamp,
                    projectCount: projects.length,
                    method: 'local-script'
                }
            ],
            structure: {
                projects: 'Individual project data files'
            },
            endpoints: {
                api: WORKER_URL
            },
            access: {
                baseUrl: 'https://ayeshmantham.github.io/data/',
                projects: 'projects/{project-id}.json',
                metadata: 'metadata.json'
            },
            projects: projects.map(p => ({
                id: p.id.replace(/[^a-zA-Z0-9]/g, ''),
                title: p.title,
                category: p.category,
                filename: `${p.id.replace(/[^a-zA-Z0-9]/g, '')}.json`
            }))
        };
        
        const metadataPath = join(PUBLIC_DATA_DIR, 'metadata.json');
        writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
        console.log('✅ Saved: metadata.json');
        
        return {
            success: true,
            projectCount: projects.length,
            timestamp,
            files: projects.map(p => `${p.id.replace(/[^a-zA-Z0-9]/g, '')}.json`)
        };
        
    } catch (error) {
        console.error('❌ Error saving to public folder:', error);
        throw error;
    }
}

// Main function
async function main() {
    try {
        console.log('🚀 Starting Notion to Public Folder Sync...\n');
        
        const projects = await fetchNotionData();
        const result = await saveProjectsToPublicFolder(projects);
        
        console.log('\n✅ Sync completed successfully!');
        console.log(`📊 Projects saved: ${result.projectCount}`);
        console.log(`🕐 Timestamp: ${result.timestamp}`);
        console.log('\n📁 Files created:');
        console.log('   - public/data/metadata.json');
        result.files.forEach(file => {
            console.log(`   - public/data/projects/${file}`);
        });
        
        console.log('\n🌐 Access URLs:');
        console.log('   - https://ayeshmantham.github.io/data/metadata.json');
        result.files.forEach(file => {
            console.log(`   - https://ayeshmantham.github.io/data/projects/${file}`);
        });
        
    } catch (error) {
        console.error('\n❌ Sync failed:', error);
        process.exit(1);
    }
}

// Run the script
main();
