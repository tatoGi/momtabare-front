# Calendar Rental Period Highlights

## Visual Indicators in Calendar

### 1. 🔴 Red Highlight (Light) - Product Rental Period
Shows the **owner's rental period** - when the product is available for rent.

**Source**: `product.rental_start_date` and `product.rental_end_date`

**Styling**:
```typescript
{
  highlight: {
    color: 'red',
    fillMode: 'light'  // Soft red background
  },
  popover: {
    label: 'გაქირავების პერიოდი'  // Tooltip on hover
  }
}
```

**Purpose**: Shows users the timeframe when the owner is offering the product for rent.

### 2. 🟢 Green Highlight (Solid) - User Selection
Shows the **user's selected dates** for their rental.

**Source**: User interaction with calendar (selecting start and end dates)

**Styling**:
```typescript
{
  highlight: {
    color: 'green',
    fillMode: 'solid'  // Solid green background
  }
}
```

**Purpose**: Visual confirmation of the dates the user wants to rent.

### 3. ⚫ Disabled Dates - Already Booked
Shows dates when the product is **already booked** by other users.

**Source**: `product.booked_dates` (filtered by status !== 'cancelled')

**Styling**: Grey background with strikethrough (VDatePicker default)

**Purpose**: Prevents users from selecting dates that are already taken.

## Visual Hierarchy

```
Priority (top to bottom):
1. Disabled Dates (grey) - Cannot be selected
2. User Selection (green) - Current selection
3. Rental Period (light red) - Available period
```

## User Experience

### Before Selecting Dates:
- Calendar shows **light red background** for owner's rental period
- Booked dates appear **grey** with strikethrough
- Hovering over red dates shows "გაქირავების პერიოდი" tooltip

### After Selecting Dates:
- User's selection shows **solid green background**
- Red rental period still visible in background
- Clear distinction between available period and user's choice

## Example Scenario

**Product Rental Period**: September 30 - October 10 (red)
**Already Booked**: October 3-5 (grey, disabled)
**User Selects**: September 30 - October 2 (green)

**Calendar View**:
```
Sept 30  [GREEN - Selected]
Oct 1    [GREEN - Selected]
Oct 2    [GREEN - Selected]
Oct 3    [GREY - Booked, disabled]
Oct 4    [GREY - Booked, disabled]
Oct 5    [GREY - Booked, disabled]
Oct 6    [RED - Available]
Oct 7    [RED - Available]
Oct 8    [RED - Available]
Oct 9    [RED - Available]
Oct 10   [RED - Available]
```

## Code Implementation

### Attributes Computed Property
```typescript
const attributes = computed(() => {
  const attrs = []
  
  // User's selected dates (green)
  if (startDate.value && endDate.value) {
    attrs.push({
      highlight: {
        color: 'green',
        fillMode: 'solid'
      },
      dates: [{ start: startDate.value, end: endDate.value }]
    })
  }
  
  // Product's rental period (red)
  if (props.product?.rental_start_date && props.product?.rental_end_date) {
    attrs.push({
      highlight: {
        color: 'red',
        fillMode: 'light'
      },
      dates: [{
        start: new Date(props.product.rental_start_date),
        end: new Date(props.product.rental_end_date)
      }],
      popover: {
        label: 'გაქირავების პერიოდი'
      }
    })
  }
  
  return attrs
})
```

### VDatePicker Implementation
```vue
<VDatePicker
  v-model="selectedDate"
  :attributes="attributes"
  :disabled-dates="computedDisabledDates"
  :min-date="new Date().setDate(new Date().getDate() + 1)"
  color="red"
  style="width: 100%"
/>
```

## Benefits

1. **Clear Visual Feedback** - Users immediately see rental period
2. **Avoid Confusion** - Red period shows availability window
3. **Prevent Errors** - Grey disabled dates prevent invalid selections
4. **Better UX** - Tooltip provides context on hover
5. **Intuitive Colors** - Red (availability), Green (selection), Grey (unavailable)

## Mobile Responsive

The calendar adjusts automatically:
- Touch-friendly date selection
- Tooltips show on tap (mobile)
- Highlights remain visible on small screens

## Accessibility

- **Color + Pattern**: Uses both color and opacity for color-blind users
- **Tooltips**: Provide text labels for screen readers
- **Disabled State**: Prevents interaction with unavailable dates

## Testing Checklist

- [ ] Red highlight shows for rental period
- [ ] Green highlight shows for user selection
- [ ] Grey disabled dates cannot be selected
- [ ] Tooltip appears on hover over red dates
- [ ] Multiple highlights don't conflict
- [ ] Works on mobile (touch devices)
- [ ] Rental period updates when product changes
- [ ] Clear visual distinction between all three states

## Status: COMPLETE ✅

Calendar now shows rental period in red, user selection in green, and booked dates in grey!
