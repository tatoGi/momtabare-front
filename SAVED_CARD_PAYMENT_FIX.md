# Saved Card Payment Fix - Missing Required Fields

## Problem
When paying with a saved card, the request was failing with validation errors:
```json
{
  "message": "The callback url field is required. (and 1 more error)",
  "errors": {
    "callback_url": ["The callback url field is required."],
    "basket": ["The basket field is required."]
  }
}
```

## Root Cause
The `payWithSavedCard` payment flow was only sending minimal data:
```typescript
// ❌ OLD - Missing required fields
{
  amount: 100.00,
  currency: 'GEL'
}
```

But the backend API requires:
```typescript
// ✅ REQUIRED by backend
{
  amount: number,
  currency: string,
  callback_url: string,      // ← Missing!
  basket: Array<BasketItem>  // ← Missing!
}
```

## Solution

### 1. Updated `IBogPaymentDetails` Interface
**File:** `src/ts/services/bogPayment.types.ts`

```typescript
// BEFORE
export interface IBogPaymentDetails {
  amount: number;
  currency: string;
  callback_url?: string;        // Optional ❌
  external_order_id?: string;
  save_card?: boolean;
  pre_authorize?: boolean;
}

// AFTER
export interface IBogPaymentDetails {
  amount: number;
  currency: string;
  callback_url: string;         // Required ✅
  basket: Array<{               // Required ✅
    product_id: string;
    quantity: number;
    unit_price: number;
    name: string;
  }>;
  external_order_id?: string;
  save_card?: boolean;
  pre_authorize?: boolean;
}
```

### 2. Updated `processCheckout` Function
**File:** `src/services/bogPayment.ts`

Restructured the function to prepare basket and callback URL **before** checking for saved card:

```typescript
const processCheckout = async (
  cart: any,
  saveCard: boolean = false,
  selectedSavedCard?: ISavedCardSummary | null
): Promise<IBogOrderResponse> => {
  try {
    // 1. Prepare basket items (needed for BOTH new and saved card payments)
    const basket = cart.items.map((item: any) => ({
      product_id: String(item.product.id),
      quantity: item.quantity,
      unit_price: typeof item.product.price === 'number' 
        ? item.product.price 
        : parseFloat(item.product.price),
      name: item.product.name || `Product ${item.product.id}`
    }));

    // 2. Calculate total amount
    const amount = typeof cart.total_price === 'number' 
      ? cart.total_price 
      : parseFloat(cart.total_price);

    // 3. Prepare callback URL
    const callbackBase = (import.meta as any).env?.VITE_CALLBACK_BASE 
      || getBackendUrlWithFallback(true);
    const secureCallbackBase = callbackBase.replace(/^http:/, 'https:');
    const callbackUrl = `${secureCallbackBase.replace(/\/+$/, '')}/api/bog/callback`;

    // 4. If using a saved card - NOW we have all required data
    if (selectedSavedCard?.parentOrderId) {
      console.log('💳 Paying with saved card:', selectedSavedCard);
      console.log('📦 Payment data:', { amount, basket, callbackUrl });

      const paymentResponse = await bogPaymentInstance.payWithSavedCard(
        selectedSavedCard.parentOrderId,
        {
          amount,
          currency: 'GEL',
          callback_url: callbackUrl,
          basket,
          external_order_id: cart?.id ? String(cart.id) : `order_${Date.now()}`
        }
      );

      return {
        success: paymentResponse.success,
        message: paymentResponse.message,
        data: paymentResponse.data
      };
    }

    // Continue with new card payment...
  }
};
```

### 3. Enhanced Error Logging in `payWithSavedCard`
**File:** `src/services/bogPayment.ts`

Added detailed logging for debugging:

```typescript
async payWithSavedCard(parentOrderId: string, paymentData: IBogPaymentDetails): Promise<IBogCardOperation> {
  try {
    const url = getLocalizedApiUrl(`bog/ecommerce/orders/${encodeURIComponent(parentOrderId)}/pay`);
    
    console.log('💳 Paying with saved card - URL:', url);
    console.log('📦 Payment data:', JSON.stringify(paymentData, null, 2));
    
    const response = await AxiosJSON.post(url, paymentData);
    
    console.log('✅ Payment response:', response.data);
    
    return response.data;
  } catch (error: any) {
    console.error('❌ Payment with saved card failed:', {
      message: error.response?.data?.message,
      errors: error.response?.data?.errors,
      status: error.response?.status,
      url: error.config?.url
    });
    
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to process payment',
      error: error.response?.data?.errors || error.response?.data?.error
    };
  }
}
```

## Request Comparison

### Before Fix (Missing Fields)
```json
POST /api/bog/ecommerce/orders/1/pay
{
  "amount": 100.00,
  "currency": "GEL"
}

Response: 422 Unprocessable Entity
{
  "message": "The callback url field is required. (and 1 more error)",
  "errors": {
    "callback_url": ["The callback url field is required."],
    "basket": ["The basket field is required."]
  }
}
```

### After Fix (All Required Fields)
```json
POST /api/bog/ecommerce/orders/1/pay
{
  "amount": 100.00,
  "currency": "GEL",
  "callback_url": "https://admin.momtabare.com/api/bog/callback",
  "basket": [
    {
      "product_id": "123",
      "quantity": 2,
      "unit_price": 50.00,
      "name": "Product Name"
    }
  ],
  "external_order_id": "cart_456"
}

Response: 200 OK
{
  "success": true,
  "message": "Payment processed successfully",
  "order_id": "...",
  "redirect_url": "https://payment.bog.ge/..."
}
```

## Expected Console Output

When paying with a saved card:
```
💳 Paying with saved card: {id: "1", brand: "visa", last4: "1234", ...}
📦 Payment data: {amount: 100, basket: [...], callbackUrl: "..."}
💳 Paying with saved card - URL: https://admin.momtabare.com/api/bog/ecommerce/orders/1/pay
📦 Payment data: {
  "amount": 100.00,
  "currency": "GEL",
  "callback_url": "https://admin.momtabare.com/api/bog/callback",
  "basket": [...]
}
✅ Payment response: {success: true, ...}
```

## Files Modified
1. ✅ `src/ts/services/bogPayment.types.ts` - Updated `IBogPaymentDetails` interface
2. ✅ `src/services/bogPayment.ts` - Updated `processCheckout` and `payWithSavedCard`

## Testing Checklist
- [ ] Select a saved card in checkout
- [ ] Click checkout button
- [ ] Verify console shows all required fields
- [ ] Verify no validation errors
- [ ] Verify successful payment processing

## Backend Requirements
Make sure your Laravel backend expects these fields at:
```
POST /api/bog/ecommerce/orders/{parentOrderId}/pay
```

Required fields:
- ✅ `amount` (number)
- ✅ `currency` (string)
- ✅ `callback_url` (string)
- ✅ `basket` (array of objects)
- ✅ `external_order_id` (optional string)

## Related Issues Fixed
- ✅ Missing `callback_url` field
- ✅ Missing `basket` field
- ✅ Enhanced error logging
- ✅ Updated TypeScript types to match API requirements
