# Vercel Dynamic Routing Fix

## Problem
You were experiencing 404 NOT_FOUND errors when accessing dynamic slug pages directly on Vercel. This is a common issue with Single Page Applications (SPAs) where client-side routing doesn't work properly when users visit URLs directly or refresh the page.

## Root Cause
Vercel was not configured to handle dynamic routes properly. When someone visits `/product/some-product-slug` directly, Vercel was looking for a physical file at that path instead of serving the main `index.html` file and letting Vue Router handle the routing.

## Solution Applied

### 1. Updated `vercel.json` Configuration
Added comprehensive rewrite rules to handle all dynamic routes:

```json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://admin.momtabare.com/api/:path*"
    },
    {
      "source": "/sanctum/:path*",
      "destination": "https://admin.momtabare.com/sanctum/:path*"
    },
    {
      "source": "/product/:path*",
      "destination": "/index.html"
    },
    {
      "source": "/blog/:path*",
      "destination": "/index.html"
    },
    {
      "source": "/retailer/:path*",
      "destination": "/index.html"
    },
    {
      "source": "/chat/:path*",
      "destination": "/index.html"
    },
    {
      "source": "/user/:path*",
      "destination": "/index.html"
    },
    {
      "source": "/payment/:path*",
      "destination": "/index.html"
    },
    {
      "source": "/მთავარი/:path*",
      "destination": "/index.html"
    },
    {
      "source": "/ბლოგი/:path*",
      "destination": "/index.html"
    },
    {
      "source": "/მარშუტები/:path*",
      "destination": "/index.html"
    },
    {
      "source": "/ხშირად-დასმული-კითხვები/:path*",
      "destination": "/index.html"
    },
    {
      "source": "/((?!api|sanctum|assets|img|favicon.ico|robots.txt|sitemap.xml).*)",
      "destination": "/index.html"
    }
  ]
}
```

### 2. Routes Covered
The configuration now handles all dynamic routes in your application:

- **Product routes**: `/product/:productSku`
- **Blog routes**: `/blog/:slug`
- **Retailer routes**: `/retailer/:retailerId`
- **Chat routes**: `/chat/:userId`
- **User routes**: `/user/*` (all user sub-routes)
- **Payment routes**: `/payment/*` (success, fail, etc.)
- **Georgian routes**: Georgian aliases like `/მთავარი`, `/ბლოგი`, `/მარშუტები`

### 3. Catch-All Rule
The final rewrite rule `/((?!api|sanctum|assets|img|favicon.ico|robots.txt|sitemap.xml).*)` serves as a catch-all that redirects any unmatched route to `index.html`, excluding:
- API routes
- Static assets
- Images
- Common files like favicon.ico, robots.txt, sitemap.xml

## How It Works

1. **Direct URL Access**: When someone visits `/product/some-slug` directly
2. **Vercel Rewrite**: Vercel matches the rewrite rule and serves `/index.html`
3. **Vue Router Takes Over**: The Vue.js application loads and Vue Router handles the client-side routing
4. **Page Renders**: The appropriate component loads based on the URL

## Testing the Fix

After deploying, test these scenarios:

1. **Direct URL Access**: Visit `/product/some-product-slug` directly in a new tab
2. **Page Refresh**: Navigate to a dynamic route and refresh the page
3. **Bookmark Access**: Access a bookmarked dynamic URL
4. **Georgian URLs**: Test Georgian routes like `/მთავარი`
5. **API Routes**: Ensure API routes still work correctly

## Additional Troubleshooting

### If 404 errors persist:

1. **Clear Vercel Cache**: 
   - Go to Vercel Dashboard → Your Project → Settings → Functions
   - Clear the build cache and redeploy

2. **Check Build Output**:
   - Ensure `index.html` is generated in the `dist` folder
   - Verify all assets are properly built

3. **Verify Rewrite Rules**:
   - Check that the `vercel.json` file is in the project root
   - Ensure JSON syntax is valid

4. **Test Locally**:
   ```bash
   npm run build
   npm run preview
   ```

### Common Issues:

- **Case Sensitivity**: Ensure route paths match exactly (case-sensitive)
- **Special Characters**: Georgian characters should be properly encoded
- **Build Process**: Ensure the build process generates the correct output

## Files Modified

- `vercel.json` - Added comprehensive rewrite rules for all dynamic routes

## Related Files

- `public/_redirects` - Netlify redirects (already configured correctly)
- `src/router/index.ts` - Vue Router configuration
- `src/router/product.routes.ts` - Product-specific routes
- `src/router/retailer.routes.ts` - Retailer-specific routes
- `src/router/user.routes.ts` - User-specific routes

## Next Steps

1. Deploy the updated configuration to Vercel
2. Test all dynamic routes
3. Monitor for any remaining 404 errors
4. Update this documentation if new routes are added

The fix should resolve all 404 errors for dynamic slug pages on Vercel.
