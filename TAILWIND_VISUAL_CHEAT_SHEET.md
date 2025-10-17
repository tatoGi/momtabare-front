# Tailwind Responsive Classes - Visual Cheat Sheet

## Mobile-First Pattern

```
┌─────────────────────────────────────────┐
│  class="[DEFAULT] sm:[TABLET] lg:[DESK] │
│         (mobile)   (640px+)  (1024px+)  │
└─────────────────────────────────────────┘
```

**Remember:** Add prefixes, don't replace!

---

## Spacing (Padding & Gaps)

### Padding
```
px-4     = 16px left & right
px-6     = 24px left & right
sm:px-6  = 24px on tablets+
lg:px-0  = 0px on desktops

Result: px-4 sm:px-6 lg:px-0
Mobile: 16px | Tablet: 24px | Desktop: 0px
```

### Gaps (between flex/grid items)
```
gap-3   = 12px    (tight mobile)
gap-5   = 20px    (medium tablet)
gap-7   = 28px    (generous desktop)

Result: gap-3 sm:gap-5 lg:gap-7
Mobile: 12px | Tablet: 20px | Desktop: 28px
```

---

## Layout (Stacking vs Side-by-Side)

### Vertical Stack → Horizontal

```
Mobile (flex-col):
┌─────────┐
│  Item 1 │
├─────────┤
│  Item 2 │
└─────────┘

Tablet+ (sm:flex-row):
┌──────────┬──────────┐
│  Item 1  │  Item 2  │
└──────────┴──────────┘

Code: class="flex flex-col sm:flex-row"
```

---

## Grid Columns

### 2 Columns → 3 → 4

```
Mobile (grid-cols-2):
┌──────┬──────┐
│ 1    │ 2    │
├──────┼──────┤
│ 3    │ 4    │
└──────┴──────┘

Tablet (sm:grid-cols-3):
┌──────┬──────┬──────┐
│ 1    │ 2    │ 3    │
├──────┼──────┼──────┤
│ 4    │ 5    │ 6    │
└──────┴──────┴──────┘

Desktop (lg:grid-cols-4):
┌──────┬──────┬──────┬──────┐
│ 1    │ 2    │ 3    │ 4    │
├──────┼──────┼──────┼──────┤
│ 5    │ 6    │ 7    │ 8    │
└──────┴──────┴──────┴──────┘

Code: class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"
```

---

## Font Sizes

### Text Scaling

```
text-xs  = 12px (mobile - tiny labels)
text-sm  = 14px (body text)
text-lg  = 18px (titles)
text-xl  = 20px (big titles)
text-2xl = 24px (huge titles)

Example: class="text-lg sm:text-xl lg:text-2xl"

Mobile:  ┃18px
         ┃
Tablet:  ┃20px
         ┃
Desktop: ┃24px
```

---

## Button Width

### Full Width → Auto Width

```
Mobile (w-full):
┌───────────────────────┐
│  [Button (full)]      │
└───────────────────────┘

Tablet+ (sm:w-auto):
┌──────────────────────────────────┐
│  Text content    [Button (auto)] │
└──────────────────────────────────┘

Code: class="w-full sm:w-auto"
```

---

## Responsive Header

### Stacked → Side-by-Side

```
Mobile (flex-col):
┌──────────────────┐
│ Title            │
│ Subtitle         │
│ [Button]         │
└──────────────────┘

Tablet+ (sm:flex-row):
┌────────────────────────────────┐
│ Title & Subtitle  [Button]     │
└────────────────────────────────┘

Code:
class="flex flex-col sm:flex-row sm:items-center sm:justify-between"
```

---

## Copy-Paste Recipes

### 1. Responsive Container
```jsx
<div class="px-4 sm:px-6 lg:px-0 max-w-7xl mx-auto">
  Content
</div>
```
**What it does:** Padding on mobile/tablet, no padding on desktop

---

### 2. Responsive Grid
```jsx
<div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5 lg:gap-7">
  <div v-for="item in items" />
</div>
```
**What it does:** 2→3→4 columns with increasing gaps

---

### 3. Responsive Header
```jsx
<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
  <div><h1 class="text-lg sm:text-xl lg:text-2xl">Title</h1></div>
  <button class="w-full sm:w-auto">Action</button>
</div>
```
**What it does:** Stacks on mobile, side-by-side on tablet+

---

### 4. Responsive Text
```jsx
<h1 class="text-lg sm:text-xl lg:text-2xl font-bold">Heading</h1>
<p class="text-xs sm:text-sm lg:text-base">Paragraph</p>
```
**What it does:** Scales font size up with screen size

---

### 5. Responsive Spacing
```jsx
<div class="flex flex-col gap-6 sm:gap-8 lg:gap-10">
  <!-- Items with increasing gap -->
</div>
```
**What it does:** Tighter on mobile, looser on desktop

---

## Breakpoint Comparison

```
┌─────────────┬─────────────┬──────────────┐
│   MOBILE    │   TABLET    │   DESKTOP    │
├─────────────┼─────────────┼──────────────┤
│ < 640px     │ 640-1023px  │ ≥ 1024px     │
├─────────────┼─────────────┼──────────────┤
│ Default     │ sm:prefix   │ lg:prefix    │
├─────────────┼─────────────┼──────────────┤
│ 2 cols      │ 3 cols      │ 4 cols       │
│ px-4        │ px-6        │ px-0         │
│ gap-3       │ gap-5       │ gap-7        │
│ text-lg     │ text-xl     │ text-2xl     │
│ w-full      │ w-auto      │ w-auto       │
│ flex-col    │ flex-row    │ flex-row     │
└─────────────┴─────────────┴──────────────┘
```

---

## Colors of Classes

### Padding Classes (BLUE)
```
px-4  px-6  px-8
py-2  py-3  py-4
```

### Spacing Classes (GREEN)
```
gap-3  gap-5  gap-7
```

### Grid Classes (ORANGE)
```
grid-cols-2  grid-cols-3  grid-cols-4
```

### Font Classes (RED)
```
text-xs  text-sm  text-lg  text-xl  text-2xl
```

### Width Classes (PURPLE)
```
w-full  w-auto  w-1/2  w-1/3
```

### Flex Classes (YELLOW)
```
flex-col  flex-row  items-center  justify-between
```

---

## Decision Tree

### "Should I use responsive classes?"

```
Start: I'm adding a new component

  ┌─ Does it look good on MOBILE? ─── No ─┐
  │                                       │
  Yes                                     Try:
  │                                       - px-4 (add padding)
  ├─ Does it look good on TABLET? ── No ─┤
  │                                       │
  Yes                                     Try:
  │                                       - sm:px-6 (more padding)
  ├─ Does it look good on DESKTOP? ─ No ─┤
  │                                       │
  Yes                                     Try:
  │                                       - lg:px-0 (remove padding)
  │
  End: ✅ Component is responsive!
```

---

## Testing Sizes

### Responsive Test Checklist

```
Size            Device              Test
────────────────────────────────────────────
375px           iPhone SE           ← START HERE
390px           iPhone 12           (most common)
480px           Large phone
────────────────────────────────────────────
640px           iPad portrait       ← sm: breakpoint
768px           iPad standard       (test here)
1024px          iPad landscape      ← lg: breakpoint
────────────────────────────────────────────
1280px          Laptop              ← test here
1920px          Desktop monitor
2560px          Large monitor
```

---

## Show/Hide Elements

### Hide on mobile, show on desktop

```jsx
<!-- Hidden by default, visible on desktop -->
<div class="hidden lg:block">
  Only on desktop
</div>

<!-- Visible by default, hidden on tablet+ -->
<div class="lg:hidden">
  Only on mobile/tablet
</div>

<!-- Mobile only content -->
<div class="block sm:hidden">
  Mobile content
</div>
```

---

## Dark Mode (Bonus)

### Responsive dark mode

```jsx
class="bg-white dark:bg-gray-800"
<!-- Apply to all screens -->

class="text-xs dark:text-white sm:text-sm lg:text-base dark:lg:text-gray-200"
<!-- Can combine with responsive! -->
```

---

## Common Mistakes ❌ → Fixes ✅

### Mistake 1: Not mobile-first
```jsx
❌ class="w-auto sm:w-full"
   Starts auto (wrong), becomes full (wrong)

✅ class="w-full sm:w-auto"
   Starts full (right), becomes auto (right)
```

### Mistake 2: Forgetting default styles
```jsx
❌ class="sm:text-lg lg:text-xl"
   No mobile size! (missing default)

✅ class="text-sm sm:text-lg lg:text-xl"
   Mobile first, then overrides
```

### Mistake 3: Wrong gap values
```jsx
❌ class="gap-10 sm:gap-3"
   Starts loose, becomes tight (backward!)

✅ class="gap-3 sm:gap-5 lg:gap-7"
   Starts tight, becomes loose (forward)
```

### Mistake 4: Too many breakpoints
```jsx
❌ class="text-sm md:text-base lg:text-lg xl:text-xl 2xl:text-2xl"
   Too many! Maintenance nightmare

✅ class="text-sm lg:text-lg"
   Just the essentials (mobile + desktop)
```

---

## Real Example: UserView Card

```jsx
<!-- BEFORE: Not responsive ❌ -->
<div class="grid grid-cols-4 gap-7">
  <BaseCard ... />
</div>

<!-- AFTER: Fully responsive ✅ -->
<div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5 lg:gap-7">
  <BaseCard ... />
</div>

Results:
- Mobile (375px):  2 columns, 12px gap
- Tablet (768px):  3 columns, 20px gap  
- Desktop (1280px): 4 columns, 28px gap
```

---

## Quick Tips

✅ **DO:**
- Start with mobile (default)
- Add breakpoints for bigger screens
- Use predefined breakpoints (sm, lg)
- Test on real devices
- Keep it simple

❌ **DON'T:**
- Use too many breakpoints
- Make arbitrary sizes
- Forget mobile defaults
- Assume it works on all sizes
- Change too much per breakpoint

---

## Tailwind Docs Link

Full reference: https://tailwindcss.com/docs/responsive-design

---

## You Now Know! 🎉

✅ Mobile-first approach
✅ Responsive patterns
✅ Common recipes
✅ When to use breakpoints
✅ How to debug
✅ Best practices

**Go build responsive UIs!** 💪
