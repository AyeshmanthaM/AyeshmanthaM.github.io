# Notion API Integration Solution

## The Problem

The Notion API cannot be called directly from browser environments due to:
- **CORS restrictions** - Notion API doesn't allow cross-origin requests from browsers
- **API key security** - Environment variables are exposed in browser builds
- **Network limitations** - Browser fetch API has different constraints

## Solutions for Static Sites

### Option 1: Serverless Functions (Recommended)

**For Vercel:**
```javascript
// api/notion-projects.js
import { Client } from '@notionhq/client';

export default async function handler(req, res) {
  const notion = new Client({ auth: process.env.NOTION_TOKEN });
  
  try {
    const response = await notion.databases.query({
      database_id: process.env.NOTION_DATABASE_ID,
      filter: {
        property: 'Status',
        select: { equals: 'Published' }
      }
    });
    
    res.json(response.results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
```

**For Netlify:**
```javascript
// netlify/functions/notion-projects.js
exports.handler = async (event, context) => {
  // Similar implementation
};
```

### Option 2: Build-Time Generation

Create a build script that fetches Notion data and generates static JSON:

```javascript
// scripts/fetch-notion-data.js
import { Client } from '@notionhq/client';
import fs from 'fs';

const notion = new Client({ auth: process.env.NOTION_TOKEN });

async function fetchAndSaveProjects() {
  const response = await notion.databases.query({
    database_id: process.env.NOTION_DATABASE_ID
  });
  
  const projects = response.results.map(/* transform data */);
  
  fs.writeFileSync(
    'src/data/notion-projects.json', 
    JSON.stringify(projects, null, 2)
  );
}

fetchAndSaveProjects();
```

Add to package.json:
```json
{
  "scripts": {
    "fetch-notion": "node scripts/fetch-notion-data.js",
    "build": "npm run fetch-notion && vite build"
  }
}
```

### Option 3: GitHub Actions Integration

```yaml
# .github/workflows/update-notion-data.yml
name: Update Notion Data
on:
  schedule:
    - cron: '0 */6 * * *'  # Every 6 hours
  workflow_dispatch:

jobs:
  update-data:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm run fetch-notion
        env:
          NOTION_TOKEN: ${{ secrets.NOTION_TOKEN }}
          NOTION_DATABASE_ID: ${{ secrets.NOTION_DATABASE_ID }}
      - name: Commit changes
        run: |
          git config --local user.email "action@github.com"
          git config --local user.name "GitHub Action"
          git add .
          git commit -m "Update Notion data" || exit 0
          git push
```

## Quick Implementation for Current Setup

### Step 1: Update Your Service

Replace the current `notionService.ts` with a hybrid approach:

```typescript
// Check if we have pre-built data
import notionData from '../data/notion-projects.json';

export const fetchProjectsFromNotion = async (): Promise<Project[]> => {
  // Use pre-built data if available
  if (notionData && notionData.length > 0) {
    return notionData;
  }
  
  // Fallback to static data
  return [];
};
```

### Step 2: Create Build Script

```javascript
// scripts/build-notion-data.js
// Run this manually or in CI/CD to update data
```

## Current Status

✅ **Fallback system works** - Portfolio displays static projects
✅ **Interface ready** - All types and components prepared
✅ **Documentation complete** - Setup guides available
⚠️ **API integration disabled** - Requires server-side implementation

## Recommended Next Steps

1. **Deploy to Vercel/Netlify** - Enable serverless functions
2. **Add API routes** - Create `/api/notion-projects` endpoint
3. **Update service calls** - Point to your API instead of direct Notion
4. **Test integration** - Verify data flows correctly
5. **Add caching** - Improve performance with data caching

The portfolio is fully functional with static data and ready for Notion integration once you implement one of the server-side solutions above!
