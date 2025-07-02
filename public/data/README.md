# Project Data

This folder contains all project-related data for the portfolio website.

## Structure

- `projects/` - Individual project data files (JSON format)
- `backups/` - Notion database backups
- `metadata.json` - Synchronization metadata and status

## Purpose

This directory serves as the centralized storage for:
1. Project data synchronized from Notion
2. Backup copies of project data
3. Synchronization metadata
4. Static data accessible via the website

## Automated Sync

The Cloudflare Worker backend automatically synchronizes data from Notion to this public folder when the `/api/data/sync` endpoint is called.

## File Naming Convention

### Projects
- Project data: `projects/{project-id}.json`

### Backups
- Full backups: `backups/full-backup-{timestamp}.json`
- Incremental backups: `backups/incremental-{timestamp}.json`

## Access

All files in this directory are publicly accessible via:
- `https://yourdomain.com/data/projects/{project-id}.json`
- `https://yourdomain.com/data/metadata.json`
- `https://yourdomain.com/data/backups/{backup-file}.json`

## Last Updated
Generated automatically during sync operations.
