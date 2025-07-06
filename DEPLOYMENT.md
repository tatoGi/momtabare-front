# Deployment Guide

This guide provides step-by-step instructions for deploying your Vue.js application to various platforms.

## Prerequisites

1. Make sure your code is committed to a Git repository
2. Ensure you have Node.js 20.x and pnpm 9.x installed
3. Run `pnpm install` to install dependencies
4. Test your build locally with `pnpm build`

## Option 1: GitHub Pages (Recommended for static hosting)

### Automatic Deployment (Recommended)

1. **Push your code to GitHub**:
   ```bash
   git add .
   git commit -m "Add deployment configuration"
   git push origin main
   ```

2. **Enable GitHub Pages**:
   - Go to your repository on GitHub
   - Navigate to Settings → Pages
   - Under "Source", select "GitHub Actions"
   - The workflow will automatically deploy when you push to main

3. **Your site will be available at**:
   `https://yourusername.github.io/momtabare-front/`

### Manual Deployment

1. **Install gh-pages**:
   ```bash
   pnpm add -D gh-pages
   ```

2. **Deploy**:
   ```bash
   pnpm run deploy:github
   ```

## Option 2: Netlify

### Automatic Deployment

1. **Connect to Netlify**:
   - Go to [netlify.com](https://netlify.com)
   - Sign up/Login with your GitHub account
   - Click "New site from Git"
   - Select your repository
   - Build command: `pnpm build`
   - Publish directory: `dist`
   - Click "Deploy site"

2. **Your site will be available at**:
   `https://your-site-name.netlify.app`

### Manual Deployment

1. **Install Netlify CLI**:
   ```bash
   npm install -g netlify-cli
   ```

2. **Deploy**:
   ```bash
   pnpm build
   netlify deploy --prod --dir=dist
   ```

## Option 3: Vercel

### Automatic Deployment

1. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Sign up/Login with your GitHub account
   - Click "New Project"
   - Import your repository
   - Vercel will automatically detect it's a Vite project
   - Click "Deploy"

2. **Your site will be available at**:
   `https://your-project-name.vercel.app`

### Manual Deployment

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Deploy**:
   ```bash
   pnpm build
   vercel --prod
   ```

## Option 4: Firebase Hosting

### Setup

1. **Install Firebase CLI**:
   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase**:
   ```bash
   firebase login
   ```

3. **Initialize Firebase** (if not already done):
   ```bash
   firebase init hosting
   ```

4. **Update firebase.json**:
   - Replace `your-firebase-project-id` in `.firebaserc` with your actual Firebase project ID

### Deploy

```bash
pnpm run deploy:firebase
```

Your site will be available at: `https://your-project-id.web.app`

## Option 5: Surge.sh

### Setup

1. **Install Surge**:
   ```bash
   npm install -g surge
   ```

2. **Deploy**:
   ```bash
   pnpm build
   surge dist
   ```

## Environment Variables

If your app uses environment variables, create a `.env.production` file:

```env
VITE_API_URL=https://your-api-url.com
VITE_APP_TITLE=Momtabare
```

## Custom Domain

For any platform, you can configure a custom domain:

1. **GitHub Pages**: Settings → Pages → Custom domain
2. **Netlify**: Site settings → Domain management
3. **Vercel**: Project settings → Domains
4. **Firebase**: Hosting → Custom domains

## Troubleshooting

### Common Issues

1. **404 errors on refresh**: This is handled by the SPA redirects in the config files
2. **Build failures**: Check that all dependencies are installed
3. **Base path issues**: The Vite config is set up for GitHub Pages, adjust for other platforms

### Build Optimization

- The build process creates optimized files in the `dist` directory
- Images and assets are automatically optimized
- CSS and JS are minified for production

## Monitoring

After deployment, monitor your site:
- Check for console errors
- Test all major functionality
- Verify that API calls work (if applicable)
- Test on different devices and browsers

## Continuous Deployment

The GitHub Actions workflow will automatically deploy on every push to main. For other platforms, enable automatic deployments in their respective dashboards. 