# Debug Hosting Issues Guide

## Current Problem
API requests are going to `https://momtabare.com/api/...` instead of being proxied to `https://admin.momtabare.com/api/...`

## Debug Steps

### 1. Upload the New Build
1. Upload the contents of `dist/` folder to `public_html/`
2. Upload `.htaccess` file to `public_html/`
3. Clear browser cache

### 2. Check Browser Console
Open browser developer tools (F12) and look for these debug messages:

**Environment Debug Info:**
```
🔍 Environment Debug Info: {
  isProduction: true,
  isDevelopment: false,
  isVercel: false,
  isProductionDomain: true,
  isStaticHosting: true,
  hostname: "momtabare.com",
  backendUrl: ""
}
```

**Axios Request Debug:**
```
🔍 Axios Request Debug: {
  url: "/api/products",
  baseURL: "",
  fullURL: "/api/products",
  method: "GET"
}
```

### 3. Check Network Tab
In browser developer tools → Network tab:
- Look for requests to `/api/products`, `/api/pages`, etc.
- Check if they show as `https://momtabare.com/api/products` (wrong)
- Or if they show as `https://admin.momtabare.com/api/products` (correct)

### 4. Test .htaccess Proxy
Test if `.htaccess` proxy is working by visiting directly:
- `https://momtabare.com/api/products` (should proxy to admin.momtabare.com)
- `https://momtabare.com/api/pages` (should proxy to admin.momtabare.com)

### 5. Check Server Logs
Check your hosting server error logs for:
- Apache rewrite errors
- Proxy errors
- CORS errors

## Common Issues & Solutions

### Issue 1: .htaccess Not Working
**Symptoms:** Requests go to `momtabare.com/api/...` and return 404
**Solution:** 
1. Ensure `.htaccess` is in `public_html/` root
2. Check if Apache `mod_rewrite` is enabled
3. Check if Apache `mod_proxy` is enabled

### Issue 2: Environment Detection Wrong
**Symptoms:** `isStaticHosting: false` in debug info
**Solution:** 
The environment detection might not be working. Check if `window.location.hostname` is exactly `"momtabare.com"`

### Issue 3: Axios baseURL Wrong
**Symptoms:** `baseURL: "https://momtabare.com"` in debug info
**Solution:** 
The `ENV.BACKEND_URL` is not empty. Check environment configuration.

### Issue 4: CORS Errors
**Symptoms:** CORS errors in console
**Solution:** 
1. Check backend CORS configuration
2. Ensure `.htaccess` CORS headers are set
3. Check if backend allows `https://momtabare.com` origin

## Manual Testing

### Test 1: Direct API Call
Open browser console and run:
```javascript
fetch('/api/products')
  .then(response => response.json())
  .then(data => console.log('API Response:', data))
  .catch(error => console.error('API Error:', error))
```

### Test 2: Check Environment
Open browser console and run:
```javascript
console.log('Hostname:', window.location.hostname);
console.log('Origin:', window.location.origin);
console.log('Protocol:', window.location.protocol);
```

### Test 3: Test Proxy Directly
Visit these URLs directly in browser:
- `https://momtabare.com/api/products`
- `https://momtabare.com/api/pages`
- `https://momtabare.com/api/categories`

## Expected Behavior

### Correct Behavior:
1. **Environment Debug:** `isStaticHosting: true`, `backendUrl: ""`
2. **Axios Debug:** `baseURL: ""`, `fullURL: "/api/products"`
3. **Network Tab:** Shows requests to `/api/products` (relative URLs)
4. **Server Response:** Data from `admin.momtabare.com`

### Wrong Behavior:
1. **Environment Debug:** `isStaticHosting: false` or `backendUrl: "https://momtabare.com"`
2. **Axios Debug:** `baseURL: "https://momtabare.com"`, `fullURL: "https://momtabare.com/api/products"`
3. **Network Tab:** Shows requests to `https://momtabare.com/api/products` (absolute URLs)
4. **Server Response:** 404 or timeout errors

## Next Steps

1. **Upload the new build** with debug logging
2. **Check browser console** for debug messages
3. **Test the proxy** directly
4. **Check server logs** for errors
5. **Report back** with the debug information

## Temporary Workaround

If the proxy doesn't work, you can temporarily modify the environment to use direct backend URLs:

```typescript
// In src/utils/config/env.ts
const getBackendUrl = (): string => {
  // Temporary fix for static hosting
  if (isStaticHosting) {
    return 'https://admin.momtabare.com';
  }
  // ... rest of the code
};
```

This will make all API calls go directly to `admin.momtabare.com` but requires proper CORS configuration on the backend.
