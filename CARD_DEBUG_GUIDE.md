# Credit Card Debug Guide

## Frontend Changes Made ✅

1. **Enhanced Logging in `cards.ts` service**
   - Request data is now logged (with masked card number)
   - Response data is logged
   - Detailed error logging with status codes

2. **Enhanced Error Handling in `UserCreditCardsView.vue`**
   - Shows detailed validation errors
   - Logs all steps of the process
   - Better error messages to user

## How to Debug 🔍

### Step 1: Open Browser Console
1. Open your credit card page
2. Press F12 to open Developer Tools
3. Go to Console tab
4. Try to add a card

### Step 2: Check Console Output
You should see logs like:
```
🔵 Submitting card data...
🔵 Adding card - Request data: {card_number: "1234...5678", ...}
✅ Card added successfully - Response: {...}
```

OR error logs like:
```
❌ Error adding card: {status: 422, data: {...}}
```

## Common Issues & Solutions 🛠️

### Issue 1: Database Field Missing
**Error**: `SQLSTATE[42S22]: Column not found: 1054 Unknown column 'card_brand'`

**Solution**: Update your migration to include all fields:
```php
Schema::create('bog_cards', function (Blueprint $table) {
    $table->id();
    $table->foreignId('user_id')->constrained()->onDelete('cascade');
    $table->string('card_token')->unique();
    $table->string('card_mask');
    $table->string('card_type');
    $table->string('card_holder_name')->nullable(); // ADD THIS
    $table->string('card_brand')->nullable(); // ADD THIS
    $table->string('expiry_month', 2);
    $table->string('expiry_year', 4);
    $table->boolean('is_default')->default(false);
    $table->json('metadata')->nullable();
    $table->timestamps();
});
```

Then run:
```bash
php artisan migrate:fresh
# OR if you have data:
php artisan make:migration add_missing_fields_to_bog_cards_table
```

### Issue 2: Missing detectCardBrand() Method
**Error**: `Call to undefined method BogCardController::detectCardBrand()`

**Solution**: Add this method to your `BogCardController`:
```php
private function detectCardBrand($cardNumber)
{
    $cardNumber = preg_replace('/\s+/', '', $cardNumber);
    
    // Get first 6 digits (BIN)
    $bin = substr($cardNumber, 0, 6);
    
    // Visa
    if (preg_match('/^4/', $cardNumber)) {
        return 'visa';
    }
    
    // Mastercard
    if (preg_match('/^5[1-5]/', $cardNumber) || 
        preg_match('/^2(22[1-9]|2[3-9][0-9]|[3-6][0-9]{2}|7[0-1][0-9]|720)/', $cardNumber)) {
        return 'mastercard';
    }
    
    // American Express
    if (preg_match('/^3[47]/', $cardNumber)) {
        return 'amex';
    }
    
    // BOG (Bank of Georgia) - adjust pattern based on actual BOG cards
    if (preg_match('/^6/', $cardNumber)) {
        return 'bog';
    }
    
    return 'other';
}
```

### Issue 3: Route Not Found
**Error**: `404 Not Found` or route not defined

**Check**: Make sure your route is properly defined in `routes/api.php`:
```php
Route::prefix('bog/cards')->middleware('auth:sanctum')->group(function () {
    Route::post('/add', [BogCardController::class, 'addCard'])
        ->name('bog.cards.add');
});
```

### Issue 4: Authentication Issue
**Error**: `401 Unauthorized`

**Solution**: 
1. Check if user is logged in
2. Verify Sanctum is configured correctly
3. Check CORS settings in `config/cors.php`:
```php
'paths' => ['api/*', 'sanctum/csrf-cookie', 'bog/*'],
'supports_credentials' => true,
```

### Issue 5: CSRF Token Issue
**Error**: `419 Page Expired` or CSRF token mismatch

**Solution**:
1. Make sure `/sanctum/csrf-cookie` is called first
2. Check session configuration
3. Verify cookies are being sent with requests

## Backend Debug Steps 📋

### 1. Add Logging to Controller
```php
use Illuminate\Support\Facades\Log;

public function addCard(Request $request)
{
    Log::info('🔵 Card add request received', [
        'user_id' => $request->user('sanctum')->id,
        'card_type' => $request->card_type,
        'expiry' => $request->expiry_month . '/' . $request->expiry_year
    ]);
    
    // ... validation ...
    
    try {
        $card = BogCard::create([...]);
        
        Log::info('✅ Card created successfully', ['card_id' => $card->id]);
        
        return response()->json([...]);
    } catch (\Exception $e) {
        Log::error('❌ Error creating card', [
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ]);
        throw $e;
    }
}
```

### 2. Check Laravel Logs
```bash
tail -f storage/logs/laravel.log
```

### 3. Test with Postman/Insomnia
Create a POST request to test the endpoint directly:
```
POST http://your-api.test/api/en/bog/cards/add
Headers:
  Accept: application/json
  Content-Type: application/json
  Authorization: Bearer YOUR_TOKEN

Body:
{
  "card_number": "4111111111111111",
  "card_holder_name": "John Doe",
  "expiry_month": "12",
  "expiry_year": "2025",
  "cvv": "123",
  "card_type": "visa"
}
```

## What to Check in Browser Console 🔍

After you try to add a card, look for these logs:

**Success Flow:**
```
🔵 Submitting card data...
🔵 Adding card - Request data: {card_number: "4111...1111", ...}
✅ Card added successfully - Response: {success: true, ...}
✅ Card added successfully
```

**Error Flow:**
```
🔵 Submitting card data...
🔵 Adding card - Request data: {card_number: "4111...1111", ...}
❌ Error adding card: {status: 500, data: {message: "..."}}
❌ Failed to add card: {success: false, ...}
```

## Network Tab Check 🌐

1. Open Developer Tools → Network tab
2. Try to add a card
3. Look for the request to `/bog/cards/add`
4. Check:
   - **Status Code**: Should be 201 (Created) or 200
   - **Request Payload**: Verify data is being sent correctly
   - **Response**: Check what the server returned

## Quick Fix Checklist ✅

- [ ] Database migration has all required fields
- [ ] `detectCardBrand()` method exists in controller
- [ ] Route is properly defined with `auth:sanctum` middleware
- [ ] User is authenticated (check localStorage for token)
- [ ] CSRF cookie is being fetched before request
- [ ] Laravel logs show no errors
- [ ] Browser console shows request is being sent
- [ ] Network tab shows 200/201 response

## Final Steps 🎯

1. Try adding a card and check browser console
2. Copy ALL the logs from console
3. Check Laravel logs: `storage/logs/laravel.log`
4. Share the console output to see what's failing

The enhanced logging will tell us exactly where the issue is!
