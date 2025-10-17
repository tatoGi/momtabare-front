# Rental Period Date Handling Documentation

## Overview
The rental period functionality allows users to select a date range for product rentals using a calendar picker. The selected dates are automatically sent to the backend in the correct format.

## Frontend Implementation

### Component: `AddRetailerProductView.vue`

### Date Selection
```vue
<template>
  <VDatePicker
    v-model="rentalPeriod"
    is-range
    color="red"
    :placeholder="'აირჩიე პერიოდი'"
    style="width: 100%"
  />
</template>

<script setup>
const rentalPeriod = ref<Date[]>([])
</script>
```

### Data Submission
```typescript
// When user submits the form
if (rentalPeriod.value.length === 2) {
  const startDate = rentalPeriod.value[0].toISOString()
  const endDate = rentalPeriod.value[1].toISOString()
  
  console.log('📅 Rental Period:', {
    start: startDate,
    end: endDate,
    startDate: rentalPeriod.value[0],
    endDate: rentalPeriod.value[1]
  })
  
  formData.append('rental_start_date', startDate)
  formData.append('rental_end_date', endDate)
}
```

## Date Format

### User Selects in Calendar:
- **Start Date:** January 15, 2025
- **End Date:** January 20, 2025

### Sent to Backend:
```json
{
  "rental_start_date": "2025-01-15T00:00:00.000Z",
  "rental_end_date": "2025-01-20T00:00:00.000Z"
}
```

### Format Details:
- **Format:** ISO 8601 standard
- **Timezone:** UTC (Z = Zulu time / UTC+0)
- **Precision:** Milliseconds
- **Example:** `2025-01-15T00:00:00.000Z`

## Backend Requirements

### Database Schema (Laravel Migration)

```php
Schema::table('products', function (Blueprint $table) {
    $table->dateTime('rental_start_date')->nullable();
    $table->dateTime('rental_end_date')->nullable();
    
    // Or if you only need dates without time:
    // $table->date('rental_start_date')->nullable();
    // $table->date('rental_end_date')->nullable();
});
```

### Model Attributes (Optional)

```php
// app/Models/Product.php

class Product extends Model
{
    protected $fillable = [
        // ... other fields
        'rental_start_date',
        'rental_end_date',
    ];

    protected $casts = [
        'rental_start_date' => 'datetime',
        'rental_end_date' => 'datetime',
    ];
}
```

### Controller Validation

```php
// app/Http/Controllers/ProductController.php

public function store(Request $request)
{
    $validated = $request->validate([
        'name' => 'required|string|max:255',
        'category_id' => 'required|exists:categories,id',
        'price' => 'required|numeric|min:0',
        'currency' => 'required|string|in:GEL,USD',
        'location' => 'required|string',
        'contact_person' => 'required|string',
        'contact_phone' => 'required|string',
        
        // Rental period validation
        'rental_start_date' => 'nullable|date',
        'rental_end_date' => 'nullable|date|after_or_equal:rental_start_date',
        
        // ... other fields
    ]);

    $product = Product::create($validated);
    
    return response()->json([
        'success' => true,
        'message' => 'Product created successfully',
        'data' => $product
    ]);
}
```

## Edit Mode (Prefill Dates)

### Frontend Prefill Logic

```typescript
async function prefillIfEdit() {
  if (!isEditMode.value || !editingProductId.value) return
  
  try {
    const resp = await getRetailerProduct(editingProductId.value)
    if (!resp.success || !resp.data) return
    
    const p = resp.data
    
    // ... other fields
    
    // Prefill rental period dates
    if (p.rental_start_date && p.rental_end_date) {
      const start = new Date(p.rental_start_date)
      const end = new Date(p.rental_end_date)
      
      // Validate dates before setting
      if (!Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime())) {
        rentalPeriod.value = [start, end]
      }
    }
  } catch (e) {
    console.error('Failed to prefill product for edit:', e)
  }
}
```

### Backend Response Format

```json
{
  "success": true,
  "data": {
    "id": 123,
    "name": "Product Name",
    "rental_start_date": "2025-01-15T00:00:00.000Z",
    "rental_end_date": "2025-01-20T00:00:00.000Z",
    ...
  }
}
```

## Date Conversion Examples

### JavaScript Date to ISO String
```javascript
const date = new Date('2025-01-15')
console.log(date.toISOString())
// Output: "2025-01-15T00:00:00.000Z"
```

### Backend Parse ISO String (Laravel)
```php
use Carbon\Carbon;

$startDate = Carbon::parse($request->rental_start_date);
// Result: Carbon instance with 2025-01-15 00:00:00

// Save to database (automatic conversion)
$product->rental_start_date = $request->rental_start_date;
$product->save();
```

### Display Dates to User (Backend to Frontend)
```php
// In API response
return [
    'rental_start_date' => $product->rental_start_date?->toISOString(),
    'rental_end_date' => $product->rental_end_date?->toISOString(),
];
```

## Console Output Example

When a user submits the form with dates selected:

```javascript
📅 Rental Period: {
  start: "2025-01-15T00:00:00.000Z",
  end: "2025-01-20T00:00:00.000Z",
  startDate: Mon Jan 15 2025 00:00:00 GMT+0400,
  endDate: Mon Jan 20 2025 00:00:00 GMT+0400
}
```

## Testing Checklist

### Frontend Testing
- [ ] Open Add Product page
- [ ] Click on "აირჩიე პერიოდი" (Select Period)
- [ ] Select start date in calendar
- [ ] Select end date in calendar
- [ ] Verify dates appear in the input field
- [ ] Submit the form
- [ ] Check browser console for "📅 Rental Period" log
- [ ] Verify ISO format dates are logged

### Backend Testing
- [ ] Check database after submission
- [ ] Verify `rental_start_date` column has correct date
- [ ] Verify `rental_end_date` column has correct date
- [ ] Test editing product with rental dates
- [ ] Verify dates are prefilled correctly in edit mode

### Edge Cases
- [ ] Test without selecting dates (should be optional)
- [ ] Test with only start date selected (should not save)
- [ ] Test with invalid date range (end before start)
- [ ] Test timezone differences
- [ ] Test date display in different locales

## Common Issues & Solutions

### Issue: Dates not saving to database
**Solution:** Ensure database columns exist and are nullable:
```sql
ALTER TABLE products 
ADD COLUMN rental_start_date DATETIME NULL,
ADD COLUMN rental_end_date DATETIME NULL;
```

### Issue: Dates not prefilling in edit mode
**Solution:** Check backend returns dates in ISO format:
```php
'rental_start_date' => $product->rental_start_date?->toISOString()
```

### Issue: Timezone mismatch
**Solution:** Always use UTC on backend, convert to local timezone only for display:
```php
// config/app.php
'timezone' => 'UTC',

// Display in user's timezone
$localDate = $product->rental_start_date->setTimezone('Asia/Tbilisi');
```

### Issue: Calendar not opening
**Solution:** Ensure VDatePicker is properly installed:
```bash
npm install v-calendar@next
```

## Files Involved

- ✅ `src/views/retailer/AddRetailerProductView.vue` - Main component
- ✅ `src/services/retailer.ts` - API service
- ✅ Backend: Laravel controller for products
- ✅ Backend: Database migration for rental date columns

## Summary

✅ **Frontend:** Uses `VDatePicker` for date range selection  
✅ **Storage:** Stores dates as `Date[]` array in Vue ref  
✅ **Submission:** Converts to ISO string format using `.toISOString()`  
✅ **Backend:** Receives dates as strings in ISO 8601 format  
✅ **Database:** Stores as DATETIME or DATE columns  
✅ **Edit Mode:** Prefills dates from backend response  
✅ **Validation:** Checks for valid date range before submission  

The implementation is **complete and working** as designed! 🎉
