# Static Hosting Deployment Guide for momtabare.com

This guide explains how to deploy the Vue.js frontend to static hosting (Apache) instead of Vercel.

## Problem

The project was originally configured for Vercel hosting with serverless functions and API proxying. When deploying to static hosting (like Apache), the Vercel-specific features don't work, causing API calls to fail.

## Solution

We've added Apache `.htaccess` configuration to proxy API requests to the backend server at `admin.momtabare.com`.

## Files Added/Modified

### 1. `.htaccess` (New)
- **Location**: Root directory (upload to `public_html/`)
- **Purpose**: Apache configuration for API proxying and SPA routing
- **Key Features**:
  - Proxies `/api/*` requests to `https://admin.momtabare.com/api/*`
  - Proxies `/sanctum/*` requests to `https://admin.momtabare.com/sanctum/*`
  - Handles CORS headers
  - SPA routing fallback to `index.html`
  - Static asset caching
  - Security headers

### 2. `src/utils/config/env.ts` (Modified)
- Added `isStaticHosting` detection
- Updated API URL generation for static hosting
- Ensures relative API paths are used for `.htaccess` proxy

## Deployment Steps

### 1. Build the Project
```bash
npm run build
```

### 2. Upload Files
Upload the contents of the `dist/` folder to your hosting's `public_html/` directory:

```
public_html/
├── .htaccess          # Apache configuration (from project root)
├── index.html         # Main app file
├── assets/            # CSS, JS, fonts
├── img/               # Images
└── ... (other dist files)
```

### 3. Verify Backend Access
Ensure your backend at `admin.momtabare.com` is accessible and has proper CORS configuration:

```php
// Backend CORS configuration should allow:
Access-Control-Allow-Origin: https://momtabare.com
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: X-Requested-With, Content-Type, Authorization, Accept-Language, X-Localization, X-XSRF-TOKEN
Access-Control-Allow-Credentials: true
```

## How It Works

### API Request Flow
1. Frontend makes request to `/api/products`
2. Apache `.htaccess` intercepts the request
3. Apache proxies the request to `https://admin.momtabare.com/api/products`
4. Backend processes the request and returns response
5. Apache forwards the response back to the frontend

### Environment Detection
The app automatically detects static hosting vs Vercel hosting:
- **Static Hosting**: Uses `.htaccess` proxy with relative URLs
- **Vercel Hosting**: Uses Vercel serverless functions
- **Development**: Uses direct backend URL

## Testing

### 1. Check API Proxying
Open browser dev tools and verify:
- API requests go to `/api/...` (relative URLs)
- Network tab shows successful responses
- No CORS errors in console

### 2. Test SPA Routing
- Navigate to `/product/123`
- Refresh the page
- Should load correctly (not 404)

### 3. Verify Static Assets
- Images load correctly
- CSS/JS files are cached properly
- Fonts load correctly

## Troubleshooting

### API Requests Failing
1. Check `.htaccess` is uploaded correctly
2. Verify Apache `mod_rewrite` and `mod_proxy` are enabled
3. Check backend CORS configuration
4. Verify `admin.momtabare.com` is accessible

### SPA Routing Not Working
1. Ensure `.htaccess` rewrite rules are active
2. Check that `index.html` is served for non-API routes
3. Verify `ErrorDocument 404 /index.html` is working

### CORS Errors
1. Check backend CORS headers
2. Verify `.htaccess` CORS headers
3. Ensure credentials are handled properly

## Alternative Solutions

If `.htaccess` doesn't work on your hosting:

### Option 1: Nginx Configuration
```nginx
location /api/ {
    proxy_pass https://admin.momtabare.com/api/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}

location /sanctum/ {
    proxy_pass https://admin.momtabare.com/sanctum/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

### Option 2: Direct Backend URLs
Modify `src/utils/config/env.ts` to use direct backend URLs:
```typescript
// For static hosting without proxy
if (isStaticHosting) {
  return `https://admin.momtabare.com/api/${endpoint.startsWith('/') ? endpoint.slice(1) : endpoint}`;
}
```

**Note**: This requires proper CORS configuration on the backend.

## Environment Variables

For static hosting, you may need to set these environment variables:

```bash
# .env.production
VITE_BACKEND_URL_PRODUCTION=https://admin.momtabare.com
```

## Security Considerations

1. **HTTPS Only**: Ensure both frontend and backend use HTTPS
2. **CORS Configuration**: Properly configure CORS on backend
3. **Security Headers**: `.htaccess` includes security headers
4. **API Rate Limiting**: Consider implementing rate limiting on backend

## Performance Optimization

1. **Static Asset Caching**: `.htaccess` includes 1-year cache for static assets
2. **Compression**: Gzip compression enabled for text files
3. **CDN**: Consider using a CDN for static assets

## Monitoring

Monitor the following:
- API response times
- Error rates
- CORS issues
- SPA routing issues
- Static asset loading

## Support

If you encounter issues:
1. Check browser console for errors
2. Check server error logs
3. Verify `.htaccess` syntax
4. Test backend connectivity
5. Check CORS configuration
