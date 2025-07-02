# Data Branch

This branch contains all project-related data, images, and assets for the portfolio website.

## Structure

- `projects/` - Individual project data files (JSON format)
- `images/` - Project images and screenshots
- `backups/` - Notion database backups
- `sync/` - Synchronization metadata and logs

## Purpose

This branch serves as a centralized repository for:
1. Project photos and media files currently stored in Notion
2. Backup copies of project data
3. Synchronization metadata
4. Asset management for the portfolio website

## Automated Sync

The Cloudflare Worker backend automatically synchronizes data from Notion to this branch when the `/api/data/sync` endpoint is called.

## File Naming Convention

### Projects
- Project data: `projects/{project-id}.json`
- Project images: `images/{project-id}/`

### Backups
- Full backups: `backups/full-backup-{timestamp}.json`
- Incremental backups: `backups/incremental-{timestamp}.json`

## Last Updated
Generated automatically during sync operations.
