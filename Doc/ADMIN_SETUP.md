# Admin Dashboard

This document describes the admin functionality added to the portfolio website.

## Features

The admin dashboard provides four main features:

1. **Authentication** - Secure login system
2. **Email Service** - Send emails directly from the dashboard
3. **Notion Backup** - Create and manage backups of Notion database projects
4. **Google Drive Integration** - Automatic cloud backup storage with OAuth 2.0

## Access

- **URL**: `https://ayeshmantha.net/admin`
- **Login URL**: `https://ayeshmantha.net/admin/login`

### Default Credentials (Development)
- **Username**: `admin`
- **Password**: `admin123`

⚠️ **Important**: Change these credentials in production by setting environment variables.

## Setup Instructions

### 1. Environment Variables

Create a `.env` file based on `.env.example`:

```bash
# Admin Authentication
VITE_ADMIN_USERNAME=your_admin_username
VITE_ADMIN_PASSWORD=your_secure_password

# API Configuration
VITE_API_BASE_URL=https://your-worker.your-domain.workers.dev

# Google Drive OAuth 2.0 Configuration
VITE_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
VITE_GOOGLE_CLIENT_SECRET=your_google_client_secret
VITE_GOOGLE_REDIRECT_URI=https://ayeshmantha.net/admin/google-callback
```

### 2. Cloudflare Worker Setup

The admin features require a Cloudflare Worker with the following environment variables:

```bash
# Notion Integration
NOTION_TOKEN=your_notion_integration_token
NOTION_DATABASE_ID=your_notion_database_id

# Email Service (SendGrid)
SENDGRID_API_KEY=your_sendgrid_api_key

# Admin Authentication
ADMIN_TOKEN=your_secure_admin_token
ADMIN_USERNAME=your_admin_username
ADMIN_PASSWORD=your_secure_password

# Optional: KV Storage for backup history
BACKUP_KV=your_kv_namespace_binding
```

### 3. SendGrid Setup

1. Create a SendGrid account
2. Generate an API key
3. Verify your sender domain/email
4. Add the API key to your Cloudflare Worker environment

### 4. Notion Setup

1. Create a Notion integration at https://www.notion.so/my-integrations
2. Get your integration token
3. Share your projects database with the integration
4. Get your database ID from the database URL

### 5. Google Drive Setup

**Quick Setup:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a project and enable Google Drive API
3. Create OAuth 2.0 credentials
4. Add redirect URI: `https://ayeshmantha.net/admin/google-callback`
5. Copy Client ID and Client Secret to `.env`

📋 **Detailed Guide**: See `GOOGLE_DRIVE_SETUP.md` for complete instructions.

## API Endpoints

The admin dashboard uses the following API endpoints (handled by Cloudflare Worker):

### Authentication
- All admin endpoints require `Authorization: Bearer <token>` header

### Email Service
- `POST /api/send-email`
  ```json
  {
    "to": "recipient@example.com",
    "subject": "Subject",
    "message": "Email content",
    "from": "admin@ayeshmantha.net"
  }
  ```

### Notion Backup
- `POST /api/notion/backup` - Create new backup
- `GET /api/notion/backup-history` - Get backup history
- `POST /api/notion/restore` - Restore from backup
- `POST /api/notion/sync` - Sync with Notion

### Google Drive Integration
- `GET /api/google-drive/auth` - Initiate Google OAuth 2.0 flow
- `GET /api/google-drive/callback` - Handle Google callback and store token
- `POST /api/google-drive/upload` - Upload file to Google Drive
- `GET /api/google-drive/list` - List files in Google Drive

## Security Features

1. **Session Management**: 24-hour session timeout with automatic renewal
2. **Route Protection**: Admin routes are protected by authentication middleware
3. **CORS Headers**: Proper CORS configuration for API calls
4. **Token Validation**: Secure token-based authentication

## Usage

### Login
1. Navigate to `/admin/login`
2. Enter your credentials
3. You'll be redirected to the admin dashboard

### Send Email
1. Enter recipient email address
2. Type your message
3. Click "Send Email"
4. Status feedback is provided immediately

### Create Backup
1. Click "Create Backup" in the Notion section
2. Wait for the backup to complete
3. Download the backup file if needed
4. Backup history is automatically maintained

### Google Drive Integration
1. Click "Connect to Google Drive"
2. Authorize the application
3. Choose a backup location
4. Upload status and file link will be provided

### Logout
- Click the "Logout" button in the top right corner
- This will clear your session and redirect to login

## Development

### Running Locally
```bash
npm run dev
```

### Building for Production
```bash
npm run build
```

### Deploying Cloudflare Worker
```bash
npx wrangler deploy
```

## File Structure

```
src/
├── pages/
│   ├── Admin.tsx           # Main admin dashboard
│   └── AdminLogin.tsx      # Login page
├── services/
│   ├── authService.ts      # Authentication logic
│   ├── emailService.ts     # Email sending service
│   ├── notionBackupService.ts # Notion backup operations
│   └── googleDriveService.ts # Google Drive integration
├── components/
│   └── ProtectedRoute.tsx  # Route protection component
└── ...

worker.js                   # Enhanced Cloudflare Worker
```

## Error Handling

The admin system includes comprehensive error handling:

- **Network errors**: Graceful fallbacks and user feedback
- **Authentication errors**: Automatic redirect to login
- **API errors**: Detailed error messages and logging
- **Validation errors**: Input validation with helpful messages

## Production Considerations

1. **Change default credentials** - Set secure environment variables
2. **Use HTTPS** - Ensure all traffic is encrypted
3. **Monitor usage** - Set up logging and monitoring
4. **Backup storage** - Consider using Cloudflare KV for backup history
5. **Rate limiting** - Implement rate limiting for API endpoints
6. **Email limits** - Be aware of SendGrid rate limits

## Troubleshooting

### Common Issues

1. **"Cannot find module" errors**: Run `npm install`
2. **Authentication failing**: Check environment variables
3. **Email not sending**: Verify SendGrid configuration
4. **Notion backup failing**: Check Notion token and database access
5. **Google Drive integration issues**: Check Google API credentials and permissions

### Debug Mode

Set `VITE_DEBUG=true` in your `.env` file for additional logging.

## Support

For issues or questions about the admin functionality, please check:

1. Browser console for detailed error messages
2. Network tab for failed API requests
3. Cloudflare Worker logs for backend issues
