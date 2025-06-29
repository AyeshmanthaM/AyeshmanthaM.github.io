# Notion API Integration Setup Guide

This guide will help you connect your portfolio to a Notion database to dynamically manage your projects.

## Prerequisites

- A Notion account
- A Notion database with your projects

## Step 1: Create a Notion Integration

1. Go to [Notion Integrations](https://www.notion.so/my-integrations)
2. Click "New integration"
3. Fill in the basic information:
   - Name: Your Portfolio Integration
   - Logo: (optional)
   - Associated workspace: Select your workspace
4. Click "Submit"
5. Copy the "Internal Integration Token" - you'll need this for your `.env` file

## Step 2: Set Up Your Notion Database

Create a new database in Notion with the following properties:

### Required Properties:
- **Title** (Title) - The project title
- **Description** (Text) - Short project description
- **Category** (Select) - Project category with options:
  - embedded
  - mechatronics
  - interactive
  - automation
  - iot
  - other
- **Technologies** (Multi-select) - Tech stack used
- **Date** (Date) - Project completion date
- **Status** (Select) - Publication status with options:
  - Published
  - Draft
  - Archived

### Optional Properties:
- **Image URL** (Files & media) - Project thumbnail image

**Note:** Detailed project content (full description, challenges, results) should be added as page content in Notion, not as properties. The integration will automatically fetch and display the full page content.

## Step 3: Share Database with Integration

1. Open your projects database in Notion
2. Click the three dots (•••) in the top right
3. Click "Add connections"
4. Search for and select your integration
5. Click "Confirm"

## Step 4: Configure Environment Variables

1. Copy the database URL from your browser
2. Extract the database ID (the string between the last `/` and the `?` in the URL)
3. Update your `.env` file:

```env
VITE_NOTION_TOKEN=your_integration_token_here
VITE_NOTION_DATABASE_ID=your_database_id_here
```

## Step 5: Test the Integration

1. Start your development server: `npm run dev`
2. Navigate to the Projects page
3. Look for the connection status indicator:
   - 🟢 "Connected to Notion" - Integration working
   - 🟡 "Using fallback data" - Integration not configured or failed
4. Use the refresh button to manually sync data

## Database Schema Example

Here's how to structure your Notion database:

| Title | Description | Category | Technologies | Date | Status | Image URL |
|-------|-------------|----------|--------------|------|--------|-----------|
| Smart Home System | IoT automation project | iot | ESP32, MQTT, Node.js | 2023-06-15 | Published | [uploaded image] |

### Page Content Structure

Instead of using properties for detailed content, structure your Notion page content like this:

```
# Project Overview
Detailed description of what the project does and its purpose...

## Technical Implementation
How the project was built, architecture decisions...

## Challenges & Solutions
Problems encountered and how they were solved...

## Results & Impact
Outcomes, metrics, achievements...

## Future Improvements
Plans for enhancement or lessons learned...
```

The integration will automatically convert this content into formatted text for display.

## Working with Files & Media Properties

### Image URL Property
The **Image URL** property should be set as "Files & media" type in Notion, which allows you to:

- **Upload images directly** to Notion
- **Paste image URLs** from external sources
- **Drag and drop** image files into the property

### Supported Image Sources
- ✅ **Direct uploads** to Notion
- ✅ **External URLs** (from image hosting services)
- ✅ **Notion-hosted images** (automatically handled)
- ✅ **Multiple image formats** (PNG, JPG, GIF, WebP)

### Best Practices
- Use **high-quality images** (minimum 800px width recommended)
- **Optimize file sizes** for faster loading
- Use **descriptive filenames** for better organization
- Consider using **external CDN** services for better performance

## Troubleshooting

### Common Issues:

1. **"Using fallback data" status**
   - Check that your integration token is correct
   - Verify the database ID is accurate
   - Ensure the database is shared with your integration

2. **Empty projects list**
   - Make sure you have projects with "Status" set to "Published"
   - Check that all required properties exist in your database

3. **Type errors**
   - Ensure your Category values match the allowed types
   - Check that Date fields are properly formatted

### Error Messages:

- `Notion database ID is not configured` - Add `VITE_NOTION_DATABASE_ID` to your `.env` file
- `Object does not exist or access denied` - Share your database with the integration
- `Invalid request URL` - Check your database ID format

## Fallback Behavior

If Notion integration fails or is not configured:
- The app will use the static projects from `src/data/projects.ts`
- All functionality remains available
- Users see a status indicator showing fallback mode

## Security Notes

- Keep your integration token secret
- Use environment variables, never commit tokens to git
- The integration only has access to shared databases
- Tokens can be revoked from the Notion integrations page

## Benefits of Notion Integration

- ✅ **Update projects without code changes**
- ✅ **Rich text editing** in Notion's powerful editor
- ✅ **Team collaboration** on project data and content
- ✅ **Version history and backups** automatically maintained
- ✅ **Mobile editing** capability through Notion app
- ✅ **Structured content** with headings, lists, and formatting
- ✅ **Automatic fallback** to static data if Notion is unavailable
- ✅ **Page-based content** allows unlimited detail and formatting
