# Vercel Environment Variables Setup

## Setting up Environment Variables in Vercel

1. Go to your Vercel dashboard: https://vercel.com/dashboard
2. Select your project: `momtabare-front`
3. Go to Settings → Environment Variables
4. Add the following environment variable:

### Production Environment Variables

**Variable Name:** `VITE_BACKEND_URL_PRODUCTION`  
**Value:** `https://admin.momtabare.com`  
**Environment:** Production (and Preview if needed)

**Variable Name:** `VITE_DEFAULT_LOCALE`  
**Value:** `ka`  
**Environment:** Production (and Preview if needed)

### Development Environment Variables (Optional)

**Variable Name:** `VITE_BACKEND_URL`  
**Value:** `http://127.0.0.1:8000`  
**Environment:** Development

**Variable Name:** `VITE_DEFAULT_LOCALE`  
**Value:** `ka`  
**Environment:** Development

## After Adding Environment Variables

1. Redeploy your application for changes to take effect
2. You can trigger a new deployment by:
   - Pushing a new commit to your repository
   - Or manually triggering a redeploy from Vercel dashboard

## Verification

After deployment, your frontend will use:
- **Production:** `https://system.momtabare.com` for API calls
- **Local Development:** `http://127.0.0.1:8000` for API calls

## API Endpoints

Your frontend will make requests to:
- **Base API**: `https://system.momtabare.com/api`
- **Localized Pages**: `https://system.momtabare.com/en/pages` (or `/ka/pages` for Georgian)
- **Localized API**: `https://system.momtabare.com/{locale}/{endpoint}`
- **Assets**: `https://system.momtabare.com/[asset-path]`

## Usage Examples

```typescript
import { getPagesUrl, getLocalizedApiUrl, getAssetUrl } from '@/utils/config/env'

// Get pages for English locale
const pagesUrl = getPagesUrl('en') // https://system.momtabare.com/en/pages

// Get localized API endpoint
const apiUrl = getLocalizedApiUrl('products', 'ka') // https://system.momtabare.com/ka/products

// Get asset URL
const imageUrl = getAssetUrl('images/product.jpg') // https://system.momtabare.com/images/product.jpg
```
