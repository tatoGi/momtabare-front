# 🔧 Authentication Fix for Card Management

## Problem Identified ❌
Your card service was receiving an HTML login page instead of JSON response because:
1. The requests weren't properly authenticated with Sanctum
2. Missing `X-Requested-With: XMLHttpRequest` header
3. Using plain `axios` instead of the configured `AxiosJSON` instance

## What Was Fixed ✅

### 1. **Updated `src/services/cards.ts`**

#### Changed from:
```typescript
import axios from 'axios'
// ...
const response = await axios.post(url, data, {
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
  withCredentials: true,
})
```

#### Changed to:
```typescript
import AxiosJSON from '@/utils/helpers/axios'
// ...
const response = await AxiosJSON.post(url, data, {
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest', // ✅ CRITICAL!
  },
  withCredentials: true,
})
```

### 2. **Added HTML Response Detection**
```typescript
// Check if response is HTML (login page redirect)
if (typeof response.data === 'string' && response.data.includes('<!DOCTYPE html>')) {
  console.error('❌ Received HTML instead of JSON - User not authenticated')
  return {
    success: false,
    message: 'Authentication failed. Please log in again.',
    error: { type: 'auth_redirect' }
  }
}
```

### 3. **Enhanced Error Handling in UserCreditCardsView**
- Detects authentication errors
- Shows appropriate message to user
- Redirects to home page if session expired

## Why This Fixes It 🎯

### The `X-Requested-With` Header
This header tells Laravel/Sanctum that the request is an AJAX request. Without it:
- Laravel returns HTML redirects instead of JSON
- Unauthenticated requests redirect to login page (HTML)
- Your frontend receives HTML instead of JSON

### The `AxiosJSON` Instance
Your project has a configured Axios instance (`AxiosJSON`) that:
- Automatically handles authentication tokens
- Sets proper headers for API requests
- Handles CSRF tokens correctly
- Works with Sanctum middleware

## Testing Steps 🧪

1. **Clear browser cache and localStorage**
2. **Make sure you're logged in** (check localStorage for auth token)
3. **Open DevTools Console** (F12)
4. **Try adding a card**

### Expected Console Output:
```
🔵 Submitting card data...
🔵 Adding card - Request data: {card_number: "4111...1111", ...}
✅ Card added successfully - Response: {success: true, card: {...}}
✅ Card added successfully
📋 Cards loaded: {success: true, cards: [{...}]}
```

### If Still Getting HTML:
Check these in order:

1. **User Authentication**
   ```javascript
   // In browser console:
   localStorage.getItem('auth_token') // Should not be null
   ```

2. **Backend Route Configuration**
   ```php
   // Make sure route is defined correctly:
   Route::prefix('bog/cards')->middleware('auth:sanctum')->group(function () {
       Route::post('/add', [BogCardController::class, 'addCard']);
   });
   ```

3. **CORS Configuration** (`config/cors.php`)
   ```php
   'paths' => ['api/*', 'sanctum/csrf-cookie', 'bog/*'],
   'supports_credentials' => true,
   ```

4. **Session Configuration** (`config/session.php`)
   ```php
   'domain' => env('SESSION_DOMAIN'),
   'same_site' => 'lax',
   ```

5. **Sanctum Configuration** (`config/sanctum.php`)
   ```php
   'stateful' => explode(',', env('SANCTUM_STATEFUL_DOMAINS', 'localhost,127.0.0.1')),
   ```

## Backend Checklist ✅

Make sure your Laravel backend has:

- [ ] `bog_cards` table exists with all columns:
  - `id`
  - `user_id`
  - `card_token`
  - `card_mask`
  - `card_type`
  - `card_holder_name` (nullable)
  - `card_brand` (nullable)
  - `expiry_month`
  - `expiry_year`
  - `is_default`
  - `metadata` (json, nullable)
  - `timestamps`

- [ ] `BogCardController::detectCardBrand()` method exists

- [ ] Routes are protected with `auth:sanctum` middleware

- [ ] CORS is configured for your frontend domain

- [ ] Session cookies work cross-domain (if applicable)

## Environment Variables 🔧

Make sure these are set correctly:

**.env (Backend)**
```env
SESSION_DOMAIN=.yourdomain.com
SANCTUM_STATEFUL_DOMAINS=yourdomain.com,www.yourdomain.com
```

**Frontend API URL**
```typescript
// Should point to your Laravel API
const API_URL = 'https://admin.momtabare.com'
```

## Next Steps 📝

1. Try adding a card now
2. Check the console output
3. If you see "✅ Card added successfully", check the database
4. If you still see errors, share the console output

The authentication issue should now be resolved! 🎉
