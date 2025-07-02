# Enhanced Data Synchronization System

## Overview

This enhanced system provides automated synchronization between Notion and a GitHub data branch, creating a robust backup and data management solution for your portfolio website.

## New Features

### 1. Public Data Folder Integration
- **Location**: `public/data/` - All project data stored in public folder
- **Structure**: Organized folders for projects and backups
- **Direct Access**: Data accessible via website URLs
- **Automation**: Automatic updates when sync endpoints are triggered

### 2. New API Endpoints

#### `/api/data/sync` (POST)
Enhanced synchronization that:
- Fetches all project data from Notion
- Processes and structures data with enhanced metadata
- Updates individual project files in public/data folder
- Maintains synchronization history

**Request Body:**
```json
{
  "force": false,
  "includeImages": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Data synchronization completed",
  "data": {
    "projectCount": 5,
    "syncTimestamp": "2025-07-02T12:00:00Z",
    "githubUpdated": true,
    "projects": [...]
  }
}
```

#### `/api/data/backup` (POST)
Comprehensive backup creation:
- Creates full Notion database backup
- Stores backup in public/data/backups folder
- Maintains backup history in KV storage

**Request Body:**
```json
{
  "includeProjects": true,
  "includeImages": false
}
```

#### `/api/data/status` (GET)
Get synchronization status:
- Last sync information
- Public folder status
- System health check
- Feature availability

#### `/api/data/migrate` (POST)
Image migration from Notion to public folder:
- Downloads images from Notion
- Uploads to public/images/projects folder
- Updates project references

**Request Body:**
```json
{
  "projectIds": ["optional-specific-ids"],
  "downloadImages": true
}
```

### 3. Enhanced Data Structure

Each project is now stored with comprehensive metadata:

```json
{
  "id": "project-001",
  "title": "Project Title",
  "description": "Short description",
  "fullDescription": "Detailed content from Notion blocks",
  "category": "web",
  "technologies": ["React", "TypeScript"],
  "date": "2025-01-01",
  "status": "Published",
  "images": {
    "primary": "https://notion-url.com/image.jpg",
    "gallery": ["additional-images"],      "local": {
        "primary": "/images/projects/project-001/primary.jpg",
        "gallery": ["/images/projects/project-001/gallery1.jpg"]
      }
  },
  "links": {
    "github": "https://github.com/user/repo",
    "demo": "https://demo.com",
    "documentation": "https://docs.com"
  },
  "metadata": {
    "notionId": "original-notion-id",
    "lastUpdated": "2025-07-02T12:00:00Z",
    "syncedAt": "2025-07-02T12:05:00Z",
    "version": 1
  }
}
```

## Setup Instructions

### 1. Environment Variables

Add these secrets to your Cloudflare Worker:

```bash
# GitHub integration (NEW)
wrangler secret put GITHUB_TOKEN
# Create a GitHub Personal Access Token with repo permissions

# Existing variables
wrangler secret put NOTION_TOKEN
wrangler secret put NOTION_DATABASE_ID
wrangler secret put SENDGRID_API_KEY
wrangler secret put ADMIN_TOKEN
```

### 2. GitHub Token Setup

1. Go to GitHub Settings > Developer settings > Personal access tokens
2. Click "Generate new token (classic)"
3. Select these scopes:
   - `repo` (Full control of private repositories)
   - `workflow` (Update GitHub Action workflows)
4. Copy the token and add it as a Cloudflare Worker secret

### 3. KV Storage (Optional)

For backup history and sync metadata:

```bash
wrangler kv:namespace create BACKUP_KV
wrangler kv:namespace create BACKUP_KV --preview
```

Add the namespace binding to `wrangler.toml`:

```toml
[[kv_namespaces]]
binding = "BACKUP_KV"
id = "your-namespace-id"
preview_id = "your-preview-namespace-id"
```

## Usage Workflow

### Automated Synchronization

1. **Trigger Sync**: Call `/api/data/sync` endpoint
2. **Data Processing**: Worker fetches from Notion and processes data
3. **GitHub Update**: Individual project files are created/updated in data branch
4. **Metadata Update**: Sync information stored for history

### Manual Backup

1. **Create Backup**: Call `/api/data/backup` endpoint
2. **Full Export**: Complete Notion database exported
3. **GitHub Storage**: Backup file created in data branch
4. **History Tracking**: Backup metadata stored in KV

### Image Migration

1. **Assess Images**: Call `/api/data/migrate` to analyze images
2. **Download Process**: Images downloaded from Notion URLs
3. **GitHub Upload**: Images uploaded to data branch structure
4. **Reference Update**: Project files updated with local image paths

## File Structure in Public Folder

```
public/
├── data/
│   ├── README.md                     # Documentation
│   ├── metadata.json                 # Sync metadata
│   ├── projects/
│   │   ├── schema.json              # Data structure schema
│   │   ├── project-001.json         # Individual project files
│   │   ├── project-002.json
│   │   └── ...
│   └── backups/
│       ├── full-backup-2025-07-02.json
│       └── comprehensive-backup-2025-07-01.json
├── images/
│   ├── projects/
│   │   ├── project-001/
│   │   │   ├── primary.jpg
│   │   │   └── gallery1.jpg
│   │   └── project-002/
│   │       └── primary.jpg
│   └── ...
└── ...
```

## Benefits

1. **Direct Access**: Data accessible via website URLs (https://yourdomain.com/data/)
2. **Performance**: Local data access for faster loading
3. **Simplicity**: No separate branch management required
4. **Redundancy**: Multiple backup locations reduce data loss risk
5. **SEO Friendly**: Data can be indexed by search engines
6. **CDN Compatible**: Works with GitHub Pages and CDNs

## Monitoring

Use `/api/data/status` to monitor:
- Last synchronization time
- GitHub branch health
- Feature availability
- Error tracking

## Troubleshooting

### Common Issues

1. **GitHub Token Issues**
   - Verify token has `repo` permissions
   - Check token expiration
   - Ensure correct repository access

2. **Sync Failures**
   - Check Notion API limits
   - Verify database permissions
   - Monitor Worker execution time limits

3. **Image Migration**
   - Large images may hit Worker memory limits
   - Consider batch processing for many images
   - Verify Notion image URLs are accessible

### Debug Endpoints

- `/api/debug` - Basic configuration check
- `/api/debug/properties` - Notion property analysis
- `/api/data/status` - Comprehensive system status

## Next Steps

1. Set up GitHub token and test basic sync
2. Implement automated sync triggers (webhooks or scheduled)
3. Add image optimization for better performance
4. Create monitoring dashboard for sync status
5. Implement incremental sync for efficiency
