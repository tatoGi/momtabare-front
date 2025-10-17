# UserInfoView Quick Reference - Responsive Classes

## File Location
`src/views/user/UserInfoView.vue`

## Key Responsive Patterns

### Main Container
```vue
<main class="pb-12 sm:pb-16 lg:pb-20 pt-4 sm:pt-6 lg:pt-8 px-4 sm:px-6 lg:px-0">
```
- **Mobile**: Small padding all around
- **Tablet**: Increased padding
- **Desktop**: No horizontal padding (container constraint handled elsewhere)

### Two-Column Layout
```vue
<div class="flex flex-col lg:flex-row gap-4 sm:gap-5 lg:gap-6">
  <div class="w-full lg:w-1/2">...Personal Info</div>
  <div class="w-full lg:w-1/2">...Contact Info</div>
</div>
```
- Mobile: Stacked vertically
- Desktop: Side-by-side columns

### Avatar Sizes
```
Mobile: w-20 h-20 (80px)
Tablet: sm:w-24 sm:h-24 (96px)
Desktop: lg:w-28 lg:h-28 (112px)
```

### Card Structure
```vue
<div class="rounded-lg sm:rounded-xl lg:rounded-2xl border px-3 sm:px-4 lg:px-6 pt-3 sm:pt-4 lg:pt-4">
  <p class="text-xs sm:text-sm lg:text-base">Title</p>
```

### Form Field Row
```vue
<div class="flex flex-col sm:flex-row gap-2 sm:gap-3 lg:gap-4 py-4 sm:py-5 lg:py-5">
  <!-- Label & value on own lines (mobile) → beside each other (desktop) -->
</div>
```

### Input Fields
```vue
<!-- Single line: label above on mobile, beside on desktop -->
<input class="text-xs sm:text-sm py-1.5 px-2 sm:px-3" />

<!-- Multi-line (flex col then row): -->
<div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
  <input class="flex-1" />
  <button class="whitespace-nowrap">Save</button>
</div>
```

### Edit/Add Button
```vue
<p class="text-xs sm:text-sm ... mt-1 sm:mt-0 sm:ml-2 lg:ml-4 whitespace-nowrap">
```
- Mobile: Below the field (mt-1)
- Desktop: Beside the field (sm:ml-2 lg:ml-4)

## Responsive Text Sizes

| Element | Mobile | Tablet | Desktop |
|---------|--------|--------|---------|
| Page title | text-lg | sm:text-xl | lg:text-2xl |
| Section title | text-xs | sm:text-sm | lg:text-base |
| Labels | text-xs | sm:text-sm | lg:text-sm |
| Input text | text-xs | sm:text-sm | lg:text-sm |
| Buttons | text-xs | sm:text-sm | - |

## Responsive Spacing

| Element | Mobile | Tablet | Desktop |
|---------|--------|--------|---------|
| Main px | px-4 | sm:px-6 | lg:px-0 |
| Main py | py-4/8 | sm:py-6/16 | lg:py-8/20 |
| Section gap | gap-4 | sm:gap-5 | lg:gap-6 |
| Field gap | gap-2 | sm:gap-3 | lg:gap-4 |
| Button px | px-2 | sm:px-3 | - |

## Common Utility Classes

### Visibility & Display
- `flex flex-col` - Stack vertically (mobile)
- `sm:flex-row` - Row layout (tablet+)
- `lg:flex-row` - Row layout (desktop+)
- `flex-wrap` - Wrap buttons on mobile
- `whitespace-nowrap` - Prevent button text wrapping
- `flex-shrink-0` - Prevent shrinking

### Sizing
- `w-full` - Full width on mobile
- `lg:w-1/2` - Half width on desktop
- `h-fit` - Fit to content height

### Alignment & Spacing
- `items-start` - Top alignment
- `items-center` - Center alignment
- `items-stretch` - Stretch to container
- `justify-center` - Center horizontally
- `flex-1` - Fill available space

### Text
- `text-xs sm:text-sm` - Responsive text size
- `font-medium` - Medium weight buttons
- `break-words` - Wrap long text
- `font-bold`, `font-extrabold` - Headings

### Dark Mode
- `dark:text-white` - White text in dark mode
- `dark:text-white/70` - Semi-transparent white
- `dark:border-white/10` - Subtle borders
- `dark:bg-gray-600` - Dark backgrounds

## Mobile Testing Widths
- **Mobile**: 375px (iPhone SE)
- **Tablet**: 768px (iPad)
- **Desktop**: 1024px+ (full size)

## Notes
- All responsive classes use Tailwind defaults (sm: = 640px, lg: = 1024px)
- Dark mode fully supported with `dark:` prefix
- Touch targets minimum 44px (buttons, avatars)
- No JavaScript needed for responsiveness
- All editable fields adapt to screen size
