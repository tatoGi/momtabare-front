# Tailwind CSS Responsive Classes - Quick Reference

## Essential Tailwind Breakpoints

### Breakpoint Prefixes

```
(default)    Mobile-first: < 640px
sm:          Small devices: ≥ 640px
md:          Medium devices: ≥ 768px
lg:          Large devices: ≥ 1024px ← Most used
xl:          Extra large: ≥ 1280px
2xl:         2X large: ≥ 1536px
```

### Think Mobile-First!

```
✅ CORRECT:  class="w-full sm:w-auto"
   - Mobile: full width (100%)
   - Tablet+: auto width (fit content)

❌ WRONG:    class="w-auto sm:w-full"
   - Starts as auto (too narrow)
   - Changes to full (unnecessary)
```

---

## Most Useful Responsive Classes

### 1. Display & Layout

```jsx
// Stack vs Side-by-side
class="flex flex-col sm:flex-row"
<!-- Mobile: vertical stack, Tablet+: horizontal -->

// Show/Hide
class="hidden lg:block"
<!-- Mobile/Tablet: hidden, Desktop: visible -->

// Alignment
class="justify-center sm:justify-between"
<!-- Mobile: centered, Tablet+: spread out -->
```

### 2. Spacing (Padding & Margin)

```jsx
// Padding
class="px-4 sm:px-6 lg:px-8"
<!-- 16px, then 24px, then 32px -->

class="py-2 sm:py-4 lg:py-6"
<!-- Vertical: 8px, 16px, 24px -->

// Margin (gap in flex/grid)
class="gap-3 sm:gap-5 lg:gap-7"
<!-- 12px, 20px, 28px gaps -->
```

### 3. Font Sizes

```jsx
// Responsive text
class="text-xs sm:text-sm lg:text-base"
<!-- 12px, 14px, 16px -->

class="text-sm sm:text-lg lg:text-2xl"
<!-- 14px, 18px, 24px -->

// Line height
class="leading-tight sm:leading-normal lg:leading-loose"
```

### 4. Grid & Columns

```jsx
// Responsive grid
class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
<!-- 1 column, then 2, then 3 -->

class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"
<!-- 2, 3, 4 columns -->
```

### 5. Width & Height

```jsx
// Full width to auto
class="w-full sm:w-auto"
<!-- Mobile: stretch, Tablet+: fit content -->

// Fixed to auto
class="w-48 sm:w-auto"
<!-- Mobile: 192px, Tablet+: fit content -->

// Height
class="h-10 sm:h-12 lg:h-14"
<!-- Heights: 40px, 48px, 56px -->
```

### 6. Buttons & Interactive

```jsx
// Full-width mobile button
class="w-full sm:w-auto py-2 sm:py-3"
<!-- Wider on mobile, narrower on tablet -->

// Padding
class="px-3 py-2 sm:px-4 sm:py-3 lg:px-6 lg:py-4"
<!-- Tighter on mobile, roomier on desktop -->
```

---

## Common Patterns

### Pattern 1: Responsive Container
```jsx
<div class="px-4 sm:px-6 lg:px-0 max-w-7xl mx-auto">
  Content with responsive padding
</div>
```

### Pattern 2: Responsive Header
```jsx
<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
  <div class="flex-1">
    <h1 class="text-lg sm:text-xl lg:text-2xl">Title</h1>
    <p class="text-xs sm:text-sm">Subtitle</p>
  </div>
  <button class="w-full sm:w-auto">Action</button>
</div>
```

### Pattern 3: Responsive Grid
```jsx
<div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5 lg:gap-7">
  <div v-for="item in items" :key="item.id">
    <!-- Card content -->
  </div>
</div>
```

### Pattern 4: Responsive Stack
```jsx
<div class="flex flex-col sm:flex-row gap-4">
  <div class="flex-1">Left section</div>
  <div class="flex-1">Right section</div>
</div>
```

### Pattern 5: Responsive Typography
```jsx
<h1 class="text-xl sm:text-2xl lg:text-3xl font-bold">
  Large Title
</h1>
<p class="text-xs sm:text-sm lg:text-base leading-relaxed">
  Readable paragraph
</p>
```

---

## Applied to UserView

### 1. Main Container - Padding
```jsx
<!-- Before: -->
<main class="pb-20 flex flex-col gap-3">

<!-- After: -->
<main class="pb-20 flex flex-col gap-3 px-4 sm:px-6 lg:px-0">
```
**What it does:** 
- Mobile: 16px side padding
- Tablet: 24px side padding  
- Desktop: No padding (parent handles)

---

### 2. Section Gaps - Spacing
```jsx
<!-- Before: -->
<div class="flex flex-col gap-10">

<!-- After: -->
<div class="flex flex-col gap-6 sm:gap-8 lg:gap-10">
```
**What it does:**
- Mobile: 24px gap
- Tablet: 32px gap
- Desktop: 40px gap

---

### 3. Header Layout - Stacking
```jsx
<!-- Before: -->
<div class="flex items-center justify-between">

<!-- After: -->
<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
```
**What it does:**
- Mobile: Vertical stack (flex-col)
- Tablet+: Horizontal layout (flex-row)
- 16px gap between items

---

### 4. Button Width - Full to Auto
```jsx
<!-- Before: -->
class="bg-customBlue text-white text-xs font-bold font-uppercase"

<!-- After: -->
class="bg-customBlue text-white text-xs font-bold font-uppercase w-full sm:w-auto"
```
**What it does:**
- Mobile: 100% width (full)
- Tablet+: Fit content (auto)

---

### 5. Title Size - Progressive
```jsx
<!-- Before: -->
class="text-customRed dark:text-white text-xl font-extrabold font-uppercase"

<!-- After: -->
class="text-customRed dark:text-white text-lg sm:text-xl lg:text-2xl font-extrabold font-uppercase"
```
**What it does:**
- Mobile: 18px (text-lg)
- Tablet: 20px (text-xl)
- Desktop: 24px (text-2xl)

---

### 6. Subtitle Size - Responsive
```jsx
<!-- Before: -->
class="text-sm text-customBlack/70 dark:text-white/70 font-medium"

<!-- After: -->
class="text-xs sm:text-sm text-customBlack/70 dark:text-white/70 font-medium"
```
**What it does:**
- Mobile: 12px extra-small
- Tablet+: 14px small

---

### 7. Card Grid - Columns
```jsx
<!-- Before: -->
<div class="grid grid-cols-4 items-center gap-7">

<!-- After: -->
<div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5 lg:gap-7">
```
**What it does:**

| Size | Columns | Gap |
|------|---------|-----|
| Mobile | 2 | 12px |
| Tablet | 3 | 20px |
| Desktop | 4 | 28px |

---

## Size Reference Chart

### Tailwind Spacing Scale
```
1   = 4px
2   = 8px
3   = 12px
4   = 16px
5   = 20px
6   = 24px
7   = 28px
8   = 32px
10  = 40px
12  = 48px
14  = 56px
16  = 64px
20  = 80px
```

### Font Sizes
```
xs  = 12px (small labels)
sm  = 14px (paragraphs)
base = 16px (body text)
lg  = 18px (large text)
xl  = 20px (headings)
2xl = 24px (big headings)
3xl = 30px (huge headings)
```

### Grid Columns
```
grid-cols-1 = 1 column (full width)
grid-cols-2 = 2 columns
grid-cols-3 = 3 columns
grid-cols-4 = 4 columns (desktop)
grid-cols-6 = 6 columns (small items)
```

---

## Debugging Tips

### 1. Check Responsive Class Names
```jsx
❌ Wrong: class="lg:text-xl"  <!-- Doesn't override mobile -->
✅ Right: class="text-sm lg:text-xl"  <!-- Mobile first -->
```

### 2. Use Browser DevTools
- Press F12 → Toggle Device Toolbar (Ctrl+Shift+M)
- Test at: 375px, 640px, 1024px, 1280px, 1920px

### 3. Common Breakpoint Widths
```
sm: 640px   (large phone in landscape / small tablet)
lg: 1024px  (tablet in landscape / small laptop)
xl: 1280px  (laptop)
```

### 4. Mobile-First Checklist
- [ ] Default styles work on mobile
- [ ] sm: overrides for tablet
- [ ] lg: overrides for desktop
- [ ] Test on real devices

---

## Quick Copy-Paste Examples

### Responsive Padding
```jsx
class="px-4 sm:px-6 lg:px-8"
```

### Responsive Grid (2-3-4 columns)
```jsx
class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5 lg:gap-7"
```

### Responsive Font
```jsx
class="text-sm sm:text-base lg:text-lg"
```

### Responsive Button
```jsx
class="w-full sm:w-auto px-4 py-2 sm:px-6 sm:py-3"
```

### Responsive Stack
```jsx
class="flex flex-col sm:flex-row gap-4 sm:gap-6"
```

### Responsive Layout
```jsx
class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
```

---

## Utilities NOT Used But Useful

### Media Query Alternatives
```jsx
// Hamburger menu
class="block lg:hidden"  <!-- Show on mobile, hide on desktop -->

// Desktop-only content
class="hidden lg:block"  <!-- Hide on mobile, show on desktop -->

// Responsive text align
class="text-center sm:text-left lg:text-center"

// Responsive borders
class="border-b sm:border-r lg:border-none"
```

### Dark Mode (Already in project)
```jsx
class="dark:text-white dark:bg-gray-800"
<!-- Applies on dark mode -->

class="dark:sm:text-xl"
<!-- Dark mode + tablet -->
```

---

## Performance Tips

✅ **Good:**
- Use predefined breakpoints (sm, lg)
- Combine similar breakpoints
- Use utility classes efficiently

❌ **Avoid:**
- Creating too many breakpoints
- Using arbitrary breakpoints
- Applying unnecessary overrides

---

## Resources

### Official Tailwind Docs
https://tailwindcss.com/docs/responsive-design

### Breakpoints Reference
https://tailwindcss.com/docs/breakpoints

### Mobile-First Approach
https://tailwindcss.com/docs/installation#using-tailwind-cli

---

## Summary Table

| Breakpoint | Width Range | When to Use |
|-----------|-------------|------------|
| (default) | < 640px | Mobile phones |
| sm: | ≥ 640px | Tablets landscape, large phones |
| md: | ≥ 768px | Tablet portrait |
| lg: | ≥ 1024px | Laptops, landscape tablets |
| xl: | ≥ 1280px | Large laptops |
| 2xl: | ≥ 1536px | Ultra-wide monitors |

### For UserView, we used:
- **(default)** = Mobile styles
- **sm:** = Tablet adjustments
- **lg:** = Desktop refinements

---

## You're Ready! 🚀

You now understand:
- ✅ Mobile-first approach
- ✅ Responsive breakpoints
- ✅ Common patterns
- ✅ How to use responsive classes
- ✅ How to debug
- ✅ Best practices

Go build responsive websites! 💪
