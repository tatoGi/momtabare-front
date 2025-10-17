# PopularProductsSlider Quick Reference - Responsive Classes

## File Location
`src/components/home/PopularProductsSlider.vue`

## Mobile Carousel View

### Container
```vue
<div class="md:hidden container px-4 sm:px-6">
```
- Mobile: `px-4` (16px padding)
- Tablet: `sm:px-6` (24px padding)
- Hides at md: breakpoint (768px+)

### Title - Mobile
```vue
<h2 class="text-lg sm:text-xl md:text-2xl font-extrabold mb-3 sm:mb-4">
```
- Text: `text-lg` → `sm:text-xl` → `md:text-2xl`
- Margin: `mb-3` → `sm:mb-4`

### Carousel Items - Responsive Width
```vue
<CarouselItem 
  class="pl-1 sm:pl-2"
  :style="{ 
    'flex': '0 0 calc(50vw - 12px)',  // Dynamic width
    'width': 'calc(50vw - 12px)',
    'minWidth': '160px',               // Minimum size
    'maxWidth': '280px'                // Maximum size
  }"
>
```

**Width Breakdown**:
- `calc(50vw - 12px)` = Half viewport width minus adjustments
- `minWidth: 160px` = Minimum for small phones (< 360px)
- `maxWidth: 280px` = Maximum caps size on tablets

**Width Progression**:
- 375px phone: ~176px items
- 640px tablet: ~308px (capped at 280px)

---

## Desktop Grid View

### Container
```vue
<div class="hidden md:block px-4 lg:px-0">
```
- Padding: `px-4` (mobile/tablet) → `lg:px-0` (desktop)
- Shows at md: breakpoint (768px+)

### Header Section
```vue
<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
```
- Layout: `flex-col` (mobile) → `sm:flex-row` (tablet+)
- Gap: `gap-3` → `sm:gap-4`
- Margin: `mb-4` → `sm:mb-6`

### Title - Desktop
```vue
<h2 class="text-xl sm:text-2xl lg:text-3xl font-extrabold">
```
- Text: `text-xl` → `sm:text-2xl` → `lg:text-3xl`
- Increases with screen size

### All Products Link
```vue
<RouterLink class="text-xs sm:text-sm ... whitespace-nowrap">
```
- Text: `text-xs` → `sm:text-sm`
- `whitespace-nowrap` prevents wrapping

### Product Grid
```vue
<div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
```

**Progressive Grid Columns**:
- Mobile (< 640px): `grid-cols-2` (2 items per row)
- Tablet (640-1024px): `sm:grid-cols-3` (3 items per row)
- Desktop (≥ 1024px): `lg:grid-cols-4` (4 items per row)

**Responsive Gaps**:
- Mobile: `gap-2` (8px)
- Tablet: `sm:gap-3` (12px)
- Desktop: `lg:gap-4` (16px)

---

## Layout Changes Summary

### Mobile Carousel (md:hidden)
```
Before: Fixed 255px items
After:  Dynamic calc(50vw - 12px) with min/max constraints

Visible Items: ~2 on mobile, capped width on tablet
```

### Desktop Grid (hidden md:block)
```
Before: 2 cols (static), 4 cols (static)
After:  2 → 3 → 4 columns with responsive gaps

Progression: 2 cols mobile → 3 cols tablet → 4 cols desktop
```

---

## Responsive Widths Calculation

### Carousel Item Width
```javascript
// Formula: calc(50vw - 12px)
// Examples:
375px phone  → 375 × 0.5 - 12 = 176.5px  ✓
640px tablet → 640 × 0.5 - 12 = 308px (capped at 280px)
```

### Grid Column Width
```javascript
// At lg: (1024px container)
// 4 columns: 1024 / 4 = 256px per column
// With gap-4 (16px): 256 - 12px = ~244px usable
```

---

## Testing Widths

| Device | Width | Carousel View | Grid View |
|--------|-------|---------------|-----------|
| iPhone SE | 375px | 2 items ~176px | - |
| iPhone 12 | 390px | 2 items ~183px | - |
| Galaxy S20 | 360px | 2 items ~168px | - |
| iPad | 768px | Grid view | 4 cols |
| Desktop | 1024px | - | 4 cols |
| Large Desktop | 1440px | - | 4 cols |

---

## Common Utility Classes Reference

### Display & Layout
- `md:hidden` - Hide carousel on desktop (768px+)
- `hidden md:block` - Show grid on desktop
- `flex flex-col sm:flex-row` - Responsive layout
- `grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4` - Responsive columns

### Spacing
- `px-4 sm:px-6 lg:px-0` - Responsive horizontal padding
- `mb-3 sm:mb-4` - Responsive margin bottom
- `gap-2 sm:gap-3 lg:gap-4` - Responsive gaps

### Text
- `text-lg sm:text-xl md:text-2xl` - Responsive text size
- `text-xs sm:text-sm` - Smaller responsive text
- `whitespace-nowrap` - Prevent text wrapping
- `font-extrabold` - Bold headings

### Responsive Units
- `pl-1 sm:pl-2` - Responsive left padding
- `p-1 sm:p-2` - Responsive padding

---

## Key Design Decisions

1. **Mobile Carousel**: Uses viewport width calculation for fluid sizing
2. **Desktop Grid**: Progressive column increase (2 → 3 → 4)
3. **Constraints**: Min/max width prevents edge cases
4. **Gaps**: Increase with screen size for visual balance
5. **Typography**: Scales with breakpoints for readability

---

## Dark Mode
All text elements include `dark:text-white` for dark mode support.

---

## Notes
- Component automatically uses either carousel or grid based on viewport
- No JavaScript needed for responsive behavior
- Smooth transition at 768px breakpoint (md:)
- Uses Tailwind CSS default breakpoints
