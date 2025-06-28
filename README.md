# Embedded Systems Portfolio

A modern, responsive CV/Portfolio website built with React, TypeScript, and Vite. Features smooth animations, dark/light theme toggle, and showcases projects and skills in embedded systems.

## 🚀 Live Demo

Visit the live website: [https://www.ayeshmantha.net](https://www.ayeshmantha.net)

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Notion Integration](#notion-integration)
- [Development](#development)
- [Building for Production](#building-for-production)
- [GitHub Pages Deployment](#github-pages-deployment)
- [Project Structure](#project-structure)
- [Customization](#customization)
- [Contributing](#contributing)

## ✨ Features

- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Dark/Light Theme**: Toggle between dark and light themes
- **Smooth Animations**: Powered by Framer Motion for engaging user experience
- **Type Animations**: Dynamic typing effects using React Type Animation
- **3D Elements**: Three.js integration for interactive visual elements
- **Notion Integration**: Connect to Notion database for dynamic project management
- **Fast Loading**: Optimized with Vite for lightning-fast development and build times
- **SEO Optimized**: Proper meta tags and semantic HTML structure
- **Modern UI**: Clean and professional design with Tailwind CSS

## 🛠️ Tech Stack

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Routing**: React Router DOM
- **3D Graphics**: Three.js
- **Icons**: Lucide React
- **Deployment**: GitHub Pages

## 📦 Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Node.js** (version 18.0 or higher)
- **npm** (usually comes with Node.js)
- **Git** (for version control and deployment)

You can check your versions by running:
```bash
node --version
npm --version
git --version
```

## 🔧 Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/ayeshmantham/ayeshmantham.github.io.git
cd ayeshmantham.github.io
```

### 2. Install Dependencies

```bash
npm install
```

This will install all the required dependencies listed in `package.json`.

### 3. Environment Setup

Create a `.env` file in the root directory for configuration:

```bash
# Notion API Configuration (Optional)
VITE_NOTION_TOKEN=your_notion_integration_token_here
VITE_NOTION_DATABASE_ID=your_notion_database_id_here
```

**For Notion Integration Setup**: See the detailed [Notion Setup Guide](./NOTION_SETUP.md) for step-by-step instructions on connecting your portfolio to a Notion database.

### 4. Start Development Server

```bash
# Example environment variables
VITE_APP_TITLE=Your Portfolio
VITE_API_URL=https://api.example.com
```

## 🚀 Development

### Start Development Server

```bash
npm run dev
```

This will start the Vite development server. Open [http://localhost:5173](http://localhost:5173) in your browser to view the application.

The development server features:
- **Hot Module Replacement (HMR)**: Changes are reflected instantly
- **Fast Refresh**: React components update without losing state
- **TypeScript Support**: Real-time type checking
- **ESLint Integration**: Code quality checks

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint for code quality checks
- `npm run deploy` - Deploy to GitHub Pages

## 🏗️ Building for Production

### Create Production Build

```bash
npm run build
```

This creates an optimized production build in the `dist` folder with:
- Minified JavaScript and CSS
- Optimized images and assets
- Tree-shaking for smaller bundle sizes
- Source maps for debugging

### Preview Production Build

```bash
npm run preview
```

This serves the production build locally at [http://localhost:4173](http://localhost:4173) for testing.

## 🌐 GitHub Pages Deployment

This project is configured for easy deployment to GitHub Pages using the `gh-pages` package.

### Initial Setup

1. **Configure Vite for GitHub Pages**

   Update `vite.config.ts` to include the base path:

   ```typescript
   import { defineConfig } from 'vite';
   import react from '@vitejs/plugin-react';

   export default defineConfig({
     plugins: [react()],
     base: '/ayeshmantham.github.io/', // Replace with your repo name
     optimizeDeps: {
       exclude: ['lucide-react'],
     },
   });
   ```

2. **Update package.json**

   Ensure your `package.json` has the correct homepage URL:

   ```json
   {
     "homepage": "https://ayeshmantham.github.io"
   }
   ```

### Deployment Steps

1. **Build and Deploy**

   ```bash
   npm run build
   npm run deploy
   ```

   This will:
   - Create a production build
   - Push the build to the `gh-pages` branch
   - GitHub Pages will automatically serve from this branch

2. **Enable GitHub Pages**

   - Go to your repository on GitHub
   - Navigate to **Settings** > **Pages**
   - Under **Source**, select **Deploy from a branch**
   - Choose **gh-pages** branch and **/ (root)** folder
   - Click **Save**

3. **Access Your Site**

   Your site will be available at: `https://yourusername.github.io/repository-name`

### Automatic Deployment (Optional)

You can set up GitHub Actions for automatic deployment on push to main:

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
      
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

## 📁 Project Structure

```
ayeshmantham.github.io/
├── public/                 # Static assets
├── src/
│   ├── components/        # Reusable React components
│   │   ├── Footer.tsx
│   │   ├── Navbar.tsx
│   │   ├── ProjectCard.tsx
│   │   └── ThemeToggle.tsx
│   ├── data/             # Data files
│   │   ├── projects.ts
│   │   └── skills.tsx
│   ├── pages/            # Page components
│   │   ├── About.tsx
│   │   ├── Contact.tsx
│   │   ├── Home.tsx
│   │   ├── Projects.tsx
│   │   └── Skills.tsx
│   ├── theme/            # Theme configuration
│   │   └── colors.ts
│   ├── App.tsx           # Main App component
│   ├── main.tsx          # Entry point
│   ├── index.css         # Global styles
│   └── types.ts          # TypeScript type definitions
├── package.json          # Dependencies and scripts
├── vite.config.ts        # Vite configuration
├── tailwind.config.js    # Tailwind CSS configuration
├── tsconfig.json         # TypeScript configuration
└── README.md            # This file
```

## 🎨 Customization

### Updating Content

1. **Personal Information**: Edit the content in `src/pages/` components
2. **Projects**: Modify `src/data/projects.ts` to add/edit your projects
3. **Skills**: Update `src/data/skills.tsx` with your technical skills
4. **Styling**: Customize colors in `src/theme/colors.ts` and Tailwind config

### Adding New Pages

1. Create a new component in `src/pages/`
2. Add the route in `src/App.tsx`
3. Update navigation in `src/components/Navbar.tsx`

### Theming

- **Colors**: Modify `tailwind.config.js` and `src/theme/colors.ts`
- **Fonts**: Update font imports in `src/index.css`
- **Animations**: Customize Framer Motion animations in components

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🐛 Troubleshooting

### Common Issues

1. **Build Errors**
   - Ensure Node.js version is 18 or higher
   - Clear node_modules and reinstall: `rm -rf node_modules package-lock.json && npm install`

2. **Deployment Issues**
   - Check the base path in `vite.config.ts`
   - Verify GitHub Pages settings in repository

3. **Styling Issues**
   - Ensure Tailwind CSS is properly configured
   - Check for conflicts in global styles

### Getting Help

- Create an issue on GitHub
- Check the documentation for dependencies
- Refer to Vite and React documentation

---

**Made with ❤️ by [Your Name]**

> This portfolio showcases my journey in embedded systems development and web technologies.

## 🔗 Notion Integration

This portfolio supports dynamic project management through Notion integration. You can connect your portfolio to a Notion database to manage projects without code changes.

### Quick Setup

1. **Create a Notion Integration** at [notion.so/my-integrations](https://www.notion.so/my-integrations)
2. **Set up a projects database** with required properties
3. **Share the database** with your integration
4. **Configure environment variables** in your `.env` file:
   ```bash
   VITE_NOTION_TOKEN=your_integration_token
   VITE_NOTION_DATABASE_ID=your_database_id
   ```

### Features

- ✅ **Real-time sync** with your Notion database
- ✅ **Automatic fallback** to static data if Notion is unavailable
- ✅ **Status indicator** showing connection state
- ✅ **Manual refresh** button for immediate updates
- ✅ **Rich content** support from Notion's editor

### Detailed Setup

For complete setup instructions, see the [Notion Setup Guide](./NOTION_SETUP.md).
