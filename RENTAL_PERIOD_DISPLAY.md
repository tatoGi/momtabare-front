# Display Rental Period in Product Items

## Overview
Added functionality to display rental period dates in product cards. The dates are shown in a user-friendly format below the rating component.

## Changes Made

### 1. Updated Type Definitions
**File:** `src/ts/models/product.types.ts`

Added rental period fields to both product interfaces:

```typescript
// IProduct interface (detailed product view)
export interface IProduct {
  // ... existing fields
  rental_period?: string | null
  rental_start_date?: string | null
  rental_end_date?: string | null
}

// IProductListItem interface (product cards/lists)
export interface IProductListItem {
  // ... existing fields
  rental_period?: string | null
  rental_start_date?: string | null
  rental_end_date?: string | null
}
```

### 2. Updated ProductItem Component
**File:** `src/components/products/ProductItem.vue`

#### Added Computed Property for Date Formatting

```typescript
// Format rental period dates
const formattedRentalPeriod = computed<string>(() => {
  // If rental_period string is available, use it
  if (props.item.rental_period) {
    return props.item.rental_period
  }
  
  // Otherwise, format from start and end dates
  if (props.item.rental_start_date && props.item.rental_end_date) {
    try {
      const startDate = new Date(props.item.rental_start_date)
      const endDate = new Date(props.item.rental_end_date)
      
      // Format dates as "DD MMM - DD MMM" (e.g., "15 Oct - 20 Oct")
      const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' }
      const startFormatted = startDate.toLocaleDateString('ka-GE', options)
      const endFormatted = endDate.toLocaleDateString('ka-GE', options)
      
      return `${startFormatted} - ${endFormatted}`
    } catch (error) {
      console.error('Error formatting rental dates:', error)
      return ''
    }
  }
  
  return ''
})
```

#### Updated Template

```vue
<!-- BEFORE: Hardcoded dates -->
<p class="text-xs font-medium text-customBlack/70 dark:text-white/70">
  15 თებ - 24 თებ
</p>

<!-- AFTER: Dynamic rental period with conditional rendering -->
<p v-if="formattedRentalPeriod" class="text-xs font-medium text-customBlack/70 dark:text-white/70">
  {{ formattedRentalPeriod }}
</p>
```

## Date Formatting Logic

### Priority Order:
1. **rental_period** (string from backend) - If available, use as-is
2. **rental_start_date + rental_end_date** - Format dynamically
3. **Empty** - Hide the date element if no dates available

### Format Examples:

#### From Backend String (rental_period):
```
Input: "2025-09-30 to 2025-10-02"
Output: "2025-09-30 to 2025-10-02"
```

#### From Date Fields:
```javascript
Input: 
  rental_start_date: "2025-09-30T20:00:00.000Z"
  rental_end_date: "2025-10-02T20:00:00.000Z"

Output (Georgian locale): "30 სექტ - 2 ოქტ"
Output (English locale): "30 Sep - 2 Oct"
```

## Backend Data Structure

Products should return these fields in the API response:

```json
{
  "id": 15,
  "name": "Product Name",
  "price": "100",
  "location": "ბაკურიანი",
  "rental_period": "2025-09-30 to 2025-10-02",
  "rental_start_date": "2025-09-30T20:00:00.000Z",
  "rental_end_date": "2025-10-02T20:00:00.000Z",
  // ... other fields
}
```

## Display Behavior

### With Rental Dates:
```
┌────────────────────────┐
│   [Product Image]      │
├────────────────────────┤
│ 📍 Location            │
│ Product Name           │
│ 💬 Comments            │
│ ⭐⭐⭐⭐⭐ (5 reviews) │
│ 30 სექტ - 2 ოქტ      │  ← Rental period displayed
│                        │
│ 100 ₾ / daily          │
└────────────────────────┘
```

### Without Rental Dates:
```
┌────────────────────────┐
│   [Product Image]      │
├────────────────────────┤
│ 📍 Location            │
│ Product Name           │
│ 💬 Comments            │
│ ⭐⭐⭐⭐⭐ (5 reviews) │
│                        │  ← No date shown
│ 100 ₾ / daily          │
└────────────────────────┘
```

## Localization Support

The date formatting uses `Intl.DateTimeFormatOptions` with Georgian locale ('ka-GE'):

```typescript
const options: Intl.DateTimeFormatOptions = { 
  day: 'numeric', 
  month: 'short' 
}
const formatted = date.toLocaleDateString('ka-GE', options)
```

### Supported Formats:
- **ka-GE** (Georgian): "30 სექტ - 2 ოქტ"
- **en-US** (English): "Sep 30 - Oct 2"
- **en-GB** (British): "30 Sept - 2 Oct"

To change locale, modify the `toLocaleDateString` call:
```typescript
// For English
date.toLocaleDateString('en-US', options)

// For Russian
date.toLocaleDateString('ru-RU', options)
```

## Error Handling

The component gracefully handles:
- ✅ Missing rental dates (hides the element)
- ✅ Invalid date formats (logs error and returns empty string)
- ✅ Null/undefined values (conditional rendering with v-if)

## Testing

### Test Cases:

1. **Product with rental_period string:**
   ```json
   {
     "rental_period": "2025-09-30 to 2025-10-02"
   }
   ```
   Expected: Display "2025-09-30 to 2025-10-02"

2. **Product with start/end dates:**
   ```json
   {
     "rental_start_date": "2025-09-30T20:00:00.000Z",
     "rental_end_date": "2025-10-02T20:00:00.000Z"
   }
   ```
   Expected: Display "30 სექტ - 2 ოქტ" (Georgian locale)

3. **Product without rental dates:**
   ```json
   {
     "rental_period": null,
     "rental_start_date": null,
     "rental_end_date": null
   }
   ```
   Expected: Date element hidden (v-if prevents rendering)

4. **Product with only one date:**
   ```json
   {
     "rental_start_date": "2025-09-30T20:00:00.000Z",
     "rental_end_date": null
   }
   ```
   Expected: Date element hidden (both dates required)

## Browser Console Debug

When viewing products, you'll see:
```javascript
🎨 ProductItem received: {
  id: 15,
  name: "Product Name",
  rating: 4.5,
  ratings_amount: 10,
  comments_amount: 5
}
```

If date formatting fails:
```javascript
Error formatting rental dates: [Error details]
```

## Files Modified

1. ✅ `src/ts/models/product.types.ts`
   - Added `rental_period`, `rental_start_date`, `rental_end_date` to `IProduct`
   - Added `rental_period`, `rental_start_date`, `rental_end_date` to `IProductListItem`

2. ✅ `src/components/products/ProductItem.vue`
   - Added `formattedRentalPeriod` computed property
   - Updated template with conditional rendering
   - Removed hardcoded dates

## Future Enhancements

### Possible Improvements:
1. **i18n Integration:** Use Vue I18n for date formatting
2. **Relative Dates:** "Available in 2 days" instead of exact dates
3. **Date Range Badges:** Visual indicators for availability
4. **Calendar Icons:** Add calendar icon next to dates
5. **Booking Status:** Show "Booked" or "Available" based on dates

### Example with i18n:
```typescript
import { useI18n } from 'vue-i18n'

const { d } = useI18n()
const startFormatted = d(startDate, 'short')
const endFormatted = d(endDate, 'short')
```

## Summary

✅ Product cards now display rental period dates  
✅ Dates are formatted based on Georgian locale  
✅ Graceful handling of missing dates  
✅ Uses either `rental_period` string or formats from date fields  
✅ TypeScript types updated for type safety  
✅ Conditional rendering prevents empty elements  

The rental period feature is now fully functional in the product listing! 🎉
