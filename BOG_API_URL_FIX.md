# BOG Payment API URL Duplicate Fix

## Problem
API URLs were generating duplicate `/api/api` in the path, causing 404 errors:
```
❌ https://admin.momtabare.com/api/api/bog/ecommerce/orders/1/pay
```

## Root Cause
The `getLocalizedApiUrl()` helper function already adds `/api/` prefix to all endpoints:
```typescript
// From env.ts
export const getLocalizedApiUrl = (endpoint: string): string => {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${backendUrl}/api/${cleanEndpoint}`;  // ← Already adds /api/
}
```

But in `bogPayment.ts`, we were passing endpoints that already included `/api/`:
```typescript
❌ getLocalizedApiUrl('/api/bog/token')
   // Results in: /api/api/bog/token

✅ getLocalizedApiUrl('bog/token')
   // Results in: /api/bog/token
```

## Solution
Removed the redundant `/api/` prefix from all `getLocalizedApiUrl()` calls in `bogPayment.ts`.

## Fixed Methods

### 1. `getToken()`
```typescript
// BEFORE
const response = await AxiosJSON.get('/api/bog/token');

// AFTER
const response = await AxiosJSON.get(getLocalizedApiUrl('bog/token'));
```

### 2. `getOrderDetails()`
```typescript
// BEFORE
const url = getLocalizedApiUrl(`/api/bog/orders/${encodeURIComponent(orderId)}`);

// AFTER
const url = getLocalizedApiUrl(`bog/orders/${encodeURIComponent(orderId)}`);
```

### 3. `saveCard()`
```typescript
// BEFORE
const response = await AxiosJSON.post(`/api/bog/orders/${orderId}/save-card`, {}, {
  headers: { 'Idempotency-Key': idempotencyKey }
});

// AFTER
const response = await AxiosJSON.post(
  getLocalizedApiUrl(`bog/orders/${orderId}/save-card`), 
  {}, 
  {
    headers: { 'Idempotency-Key': idempotencyKey }
  }
);
```

### 4. `payWithSavedCard()`
```typescript
// BEFORE
const url = getLocalizedApiUrl(`/api/bog/ecommerce/orders/${encodeURIComponent(parentOrderId)}/pay`);

// AFTER
const url = getLocalizedApiUrl(`bog/ecommerce/orders/${encodeURIComponent(parentOrderId)}/pay`);
```

## Additional Improvements

### Added `getLocalizedApiUrl` to `saveCard()`
Previously, `saveCard()` was using a raw path without `getLocalizedApiUrl()`, which meant:
- ❌ No environment-based URL handling
- ❌ No locale support
- ❌ No LiteSpeed/static hosting support

Now it properly uses `getLocalizedApiUrl()` for consistency.

## URL Pattern Reference

### Correct Pattern
```typescript
// ✅ Endpoints should NOT include /api/ prefix
getLocalizedApiUrl('bog/token')                           // → /api/bog/token
getLocalizedApiUrl('bog/orders/123')                      // → /api/bog/orders/123
getLocalizedApiUrl('bog/ecommerce/orders/1/pay')          // → /api/bog/ecommerce/orders/1/pay
getLocalizedApiUrl('bog/orders/123/save-card')            // → /api/bog/orders/123/save-card
```

### Wrong Pattern (Fixed)
```typescript
// ❌ Don't include /api/ in the endpoint
getLocalizedApiUrl('/api/bog/token')                      // → /api/api/bog/token
getLocalizedApiUrl('/api/bog/orders/123')                 // → /api/api/bog/orders/123
```

## Testing

### Before Fix
```bash
# Payment with saved card failed
URL: https://admin.momtabare.com/api/api/bog/ecommerce/orders/1/pay
Response: 404 Not Found
```

### After Fix
```bash
# Payment should work
URL: https://admin.momtabare.com/api/bog/ecommerce/orders/1/pay
Response: 200 OK
```

## Files Modified
- ✅ `src/services/bogPayment.ts`
  - Fixed `getToken()` method
  - Fixed `getOrderDetails()` method
  - Fixed `saveCard()` method
  - Fixed `payWithSavedCard()` method

## Verification Checklist
- [ ] Test payment with saved card
- [ ] Test order details retrieval
- [ ] Test card saving after payment
- [ ] Test BOG token retrieval
- [ ] Check console for correct URLs (no `/api/api`)

## Expected Console Output
```
🔍 Calling: https://admin.momtabare.com/api/bog/token
✅ Token retrieved successfully

🔍 Calling: https://admin.momtabare.com/api/bog/orders/123
✅ Order details retrieved

🔍 Calling: https://admin.momtabare.com/api/bog/ecommerce/orders/1/pay
✅ Payment processed with saved card

🔍 Calling: https://admin.momtabare.com/api/bog/orders/123/save-card
✅ Card saved successfully
```

## Related Files
- `src/utils/config/env.ts` - Contains `getLocalizedApiUrl()` helper
- `src/services/bogPayment.ts` - Fixed file
- `src/services/cards.ts` - Already uses correct pattern

## Note
This is a common pattern throughout the codebase. All services should use:
```typescript
getLocalizedApiUrl('endpoint/path')  // ✅ Correct
```

NOT:
```typescript
getLocalizedApiUrl('/api/endpoint/path')  // ❌ Wrong
'/api/endpoint/path'                       // ❌ Wrong (unless intentional)
```
