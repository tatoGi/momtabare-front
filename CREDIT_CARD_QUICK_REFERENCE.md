# CreditCard Quick Reference - Responsive Classes

## File Location
`src/components/user/CreditCard.vue`

## Main Card Container
```vue
<div class="relative h-32 sm:h-40 lg:h-44 rounded-lg sm:rounded-xl lg:rounded-2xl px-4 sm:px-5 lg:px-6 py-3 sm:py-4 lg:py-5">
```

**Responsive Progression**:
- Mobile: 128px height, 16px padding, rounded-lg
- Tablet: 160px height, 20px padding, rounded-xl
- Desktop: 176px height, 24px padding, rounded-2xl

---

## Key Responsive Elements

### Card Height
```
Mobile:  h-32   (128px)
Tablet:  sm:h-40  (160px)
Desktop: lg:h-44  (176px)
```

### Border Radius
```
Mobile:  rounded-lg
Tablet:  sm:rounded-xl
Desktop: lg:rounded-2xl
```

### Padding
```
Horizontal (px):  px-4 (mobile) → sm:px-5 (tablet) → lg:px-6 (desktop)
Vertical (py):    py-3 (mobile) → sm:py-4 (tablet) → lg:py-5 (desktop)
```

### Default Badge Position
```vue
class="absolute top-2 sm:top-3 left-2 sm:left-3 px-2 sm:px-3 py-0.5 sm:py-1"
```
- Mobile: Compact, tucked in corner
- Tablet+: More prominent position

### Payment Logo Size
```
Mobile:  h-6   (24px)
Tablet:  sm:h-8  (32px)
Desktop: lg:h-10 (40px)
```

### Menu Button
```vue
<BaseIcon 
  :size="20"
  class="p-1 sm:p-1.5 w-5 h-5 sm:w-6 sm:h-6"
/>
```
- Proportional sizing across breakpoints
- Touch-friendly padding

### Dropdown Menu
```vue
class="top-8 sm:top-10 rounded-lg sm:rounded-xl py-1.5 sm:py-2 min-w-[160px] sm:min-w-[180px]"
```
- Responsive positioning and sizing
- Mobile-optimized width (160px)
- Tablet+ width (180px)

### Menu Items
```vue
class="px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm gap-2 sm:gap-3"
```
- Responsive padding and text
- Better spacing on larger screens

### Card Info Section
```vue
<div class="flex flex-col gap-1 sm:gap-2 mt-1 sm:mt-2">
```
- Compact on mobile
- More spacious on tablet+

### Card Number
```
Mobile:  text-sm
Tablet+: sm:text-base / lg:text-base
```

### Cardholder Name
```vue
class="truncate text-xs sm:text-xs"
```
- Truncates long names
- Prevents overflow

### Expiry Date
```vue
class="px-1.5 sm:px-2 text-xs sm:text-xs flex-shrink-0"
```
- Responsive padding
- Won't shrink below minimum

---

## Decorative Elements - Responsive Sizing

### Badge Icon
```vue
<BaseIcon :size="12" class="w-3 h-3 sm:w-4 sm:h-4" />
```
- Mobile: 12px icon, 12px dimensions
- Tablet+: 12px icon, 16px dimensions

### Card Chip
```vue
<div class="top-10 sm:top-14 left-4 sm:left-6 w-7 sm:w-10 h-6 sm:h-8">
```
- Mobile: Smaller, tucked position
- Tablet+: Standard size and position

### Decorative Circles
```
Bottom: w-24 h-24 (mobile) → sm:w-32 sm:h-32 (tablet)
Top:    w-16 h-16 (mobile) → sm:w-24 sm:h-24 (tablet)
```

---

## Responsive Text Sizing

| Element | Mobile | Tablet | Desktop |
|---------|--------|--------|---------|
| Payment Service | text-xs | sm:text-sm | - |
| Card Number | text-sm | sm:text-base | lg:text-base |
| Menu Items | text-xs | sm:text-sm | - |
| Badge Text | text-xs | sm:text-xs | - |

---

## Common Responsive Patterns Used

### Responsive Sizing
```vue
class="h-6 sm:h-8 lg:h-10"
class="px-2 sm:px-3"
class="gap-1 sm:gap-2"
```

### Responsive Text
```vue
class="text-xs sm:text-sm"
```

### Responsive Position
```vue
class="top-8 sm:top-10"
class="left-4 sm:left-6"
```

### Overflow Prevention
```vue
class="truncate"
class="flex-shrink-0"
class="whitespace-nowrap"
```

---

## Testing Dimensions

| Device | Width | Card Height | Expected State |
|--------|-------|------------|-----------------|
| iPhone SE | 375px | 128px | Mobile compact |
| iPhone 12 | 390px | 128px | Mobile compact |
| Galaxy S20 | 360px | 128px | Mobile compact |
| iPad | 768px | 160px | Tablet enhanced |
| Desktop | 1024px+ | 176px | Desktop full |

---

## Breakpoint Triggers

- **sm: (640px)** - Tablet/Landscape
  - Increase padding and margins
  - Enlarge interactive elements
  - Better spacing
  
- **lg: (1024px)** - Desktop
  - Full sizing
  - Optimal spacing
  - Maximum visual impact

---

## Dark Mode Classes

All text and backgrounds have dark mode support:
```vue
dark:text-white
dark:bg-gray-800
dark:border-gray-700
dark:text-green-400
dark:text-red-400
dark:hover:from-green-900/20
dark:hover:to-emerald-900/20
```

---

## Notes

- All responsive classes use Tailwind CSS default breakpoints
- Mobile-first approach: base styles for mobile, enhance with breakpoints
- No JavaScript needed for responsive behavior
- Touch targets maintained at 44px+ on mobile
- Dark mode fully supported throughout
