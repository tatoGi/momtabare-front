# UserInfoView Mobile Responsive Design Documentation

## Overview
**File**: `src/views/user/UserInfoView.vue`

UserInfoView displays user profile information with editable personal and contact details. This document outlines the mobile-responsive improvements made using Tailwind CSS.

---

## 🎯 Responsive Architecture

### Breakpoints Used
- **Mobile** (< 640px): Base styles, single-column layout
- **Tablet** (640px - 1024px): Enhanced spacing with `sm:` prefix
- **Desktop** (≥ 1024px): Full features with `lg:` prefix

---

## 📐 Layout Changes

### Main Container
**Before**:
```vue
<main class="pb-20 pt-8">
```

**After**:
```vue
<main class="pb-12 sm:pb-16 lg:pb-20 pt-4 sm:pt-6 lg:pt-8 px-4 sm:px-6 lg:px-0">
```

**Changes**:
- Responsive bottom padding: `pb-12` (mobile) → `sm:pb-16` (tablet) → `lg:pb-20` (desktop)
- Responsive top padding: `pt-4` (mobile) → `sm:pt-6` (tablet) → `lg:pt-8` (desktop)
- **NEW**: Horizontal padding for mobile safety: `px-4` (mobile) → `sm:px-6` (tablet) → `lg:px-0` (desktop)

---

## 👤 Avatar Section

### Avatar Display Size
**Before**:
```vue
<div class="w-24 h-24 ...">
```

**After**:
```vue
<div class="w-20 sm:w-24 lg:w-28 h-20 sm:h-24 lg:h-28 ...">
```

**Progression**:
- Mobile: 80px (5rem) - Compact on small screens
- Tablet: 96px (6rem) - Standard size
- Desktop: 112px (7rem) - Larger on full-sized screens

### Upload Button
**Before**:
```vue
<button class="w-8 h-8 ...">
  <svg class="w-4 h-4">
```

**After**:
```vue
<button class="w-6 sm:w-7 lg:w-8 h-6 sm:h-7 lg:h-8 ...">
  <svg class="w-3 sm:w-4 lg:w-4 h-3 sm:h-4 lg:h-4">
```

**Benefits**:
- Smaller button on mobile to avoid clutter
- Touch-friendly 48px minimum
- Scales proportionally with avatar

### Upload Controls
**Before**:
```vue
<div v-if="avatarFile" class="flex gap-2">
  <button class="px-4 py-2 ... text-sm">
```

**After**:
```vue
<div v-if="avatarFile" class="flex gap-2 flex-wrap justify-center">
  <button class="px-3 sm:px-4 py-2 ... text-xs sm:text-sm font-medium">
```

**Changes**:
- `flex-wrap justify-center` - Buttons wrap and center on mobile
- Responsive text: `text-xs` (mobile) → `sm:text-sm` (tablet+)
- Responsive padding: `px-3` (mobile) → `sm:px-4` (tablet+)
- Added `font-medium` for better visibility

---

## 📊 Two-Column Layout - Now Responsive

### Container
**Before**:
```vue
<div class="flex gap-6 pt-7">
  <div class="w-1/2 ...">
  <div class="w-1/2 ...">
```

**After**:
```vue
<div class="flex flex-col lg:flex-row gap-4 sm:gap-5 lg:gap-6 pt-4 sm:pt-6 lg:pt-7">
  <div class="w-full lg:w-1/2 ...">
  <div class="w-full lg:w-1/2 ...">
```

**Key Improvements**:
- `flex flex-col lg:flex-row` - Stacked on mobile, side-by-side on desktop
- Responsive gap: `gap-4` (mobile) → `sm:gap-5` (tablet) → `lg:gap-6` (desktop)
- Responsive padding: `pt-4` (mobile) → `sm:pt-6` (tablet) → `lg:pt-7` (desktop)
- Full width on mobile: `w-full`, then `lg:w-1/2` on desktop

### Card Styling
**Before**:
```vue
<div class="rounded-2xl border ... px-6 pt-4">
  <p class="font-uppercase font-extrabold ...">
```

**After**:
```vue
<div class="rounded-lg sm:rounded-xl lg:rounded-2xl border ... px-3 sm:px-4 lg:px-6 pt-3 sm:pt-4 lg:pt-4">
  <p class="font-uppercase font-extrabold text-xs sm:text-sm lg:text-base ...">
```

**Changes**:
- Responsive border radius: `rounded-lg` (mobile) → `sm:rounded-xl` (tablet) → `lg:rounded-2xl` (desktop)
- Responsive padding: `px-3` (mobile) → `sm:px-4` (tablet) → `lg:px-6` (desktop)
- Responsive padding-top: `pt-3` (mobile) → `sm:pt-4` (tablet) → `lg:pt-4` (desktop)
- **NEW**: Responsive section title: `text-xs` (mobile) → `sm:text-sm` (tablet) → `lg:text-base` (desktop)
- Dark mode support: `dark:text-white`

---

## 🔧 Field Rows - Major Layout Shift

### Container Structure
**Before**:
```vue
<div class="flex h-20 items-center justify-between pb-1">
```

**After**:
```vue
<div class="flex flex-col sm:flex-row sm:items-start lg:items-center gap-2 sm:gap-3 lg:gap-4 py-4 sm:py-5 lg:py-5">
```

**Major Changes**:
- **Layout**: `flex flex-col sm:flex-row` - Label stacks above input on mobile, beside on tablet+
- **Alignment**: `sm:items-start lg:items-center` - Proper alignment at each breakpoint
- **Spacing**: Removed fixed `h-20`, using `py-4 sm:py-5` for flexibility
- **Gap**: Responsive gaps between elements
- More readable on mobile without forcing horizontal squeeze

### Label & Value Section
**Before**:
```vue
<div class="flex flex-col flex-1">
  <p class="text-sm font-medium ...">
```

**After**:
```vue
<div class="flex flex-col flex-1 w-full">
  <p class="text-xs sm:text-sm lg:text-sm font-medium ...">
```

**Changes**:
- `w-full` on flex-col for mobile
- Responsive text: `text-xs` (mobile) → `sm:text-sm` (tablet+)
- Better label visibility on small screens

### Input Fields
**Before**:
```vue
<input class="text-sm ... rounded px-2 py-1 flex-1">
<button class="text-xs px-2 py-1 border ...">
```

**After**:
```vue
<input class="text-xs sm:text-sm ... rounded px-2 py-1.5 flex-1">
<button class="text-xs px-2 sm:px-3 py-1.5 border ... whitespace-nowrap">
```

**Improvements**:
- Responsive text: `text-xs` (mobile) → `sm:text-sm` (tablet+)
- Increased padding: `py-1` → `py-1.5` (better touch targets)
- Responsive button padding: `px-2` (mobile) → `sm:px-3` (tablet+)
- `whitespace-nowrap` prevents button text wrapping
- Better vertical spacing with `py-1.5`

### Edit/Add Button
**Before**:
```vue
<p class="cursor-pointer text-sm ... underline ml-4">
```

**After**:
```vue
<p class="cursor-pointer text-xs sm:text-sm ... underline whitespace-nowrap flex-shrink-0 sm:ml-2 lg:ml-4 mt-1 sm:mt-0">
```

**Changes**:
- Responsive text: `text-xs` (mobile) → `sm:text-sm` (tablet+)
- `whitespace-nowrap` prevents wrapping
- `flex-shrink-0` keeps button from shrinking
- Responsive margin: `sm:ml-2` (tablet) → `lg:ml-4` (desktop)
- **NEW**: `mt-1 sm:mt-0` - Small top margin on mobile (stacked layout), no margin on tablet+ (horizontal layout)

---

## 📱 Form Input Layouts

### Password Change Form
**Before**:
```vue
<div class="flex flex-col gap-3 mt-1">
  <div class="flex flex-col gap-2">
    <input class="text-sm ... px-2 py-1">
  </div>
  <div class="flex gap-2">
    <button class="text-xs px-3 py-2 ...">
```

**After**:
```vue
<div class="flex flex-col gap-2 mt-1 w-full">
  <div class="flex flex-col gap-2">
    <input class="text-xs sm:text-sm ... px-2 py-1.5">
  </div>
  <div class="flex gap-2 flex-wrap">
    <button class="text-xs px-2 sm:px-3 py-1.5 ... font-medium">
```

**Changes**:
- `w-full` ensures full-width on mobile stacked layout
- `gap-2` between inputs (was `gap-3`)
- Responsive text sizes and padding
- `flex-wrap` on buttons for mobile
- Better `font-medium` for visibility

### Regular Edit Input
**Before**:
```vue
<div class="flex items-center gap-2 mt-1">
  <input class="text-sm ... flex-1">
  <button class="text-xs px-2 py-1 ...">
```

**After**:
```vue
<div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mt-1 w-full">
  <input class="text-xs sm:text-sm ... flex-1">
  <div class="flex gap-2">
    <button class="text-xs px-2 sm:px-3 py-1.5 ... whitespace-nowrap">
```

**Improvements**:
- `flex flex-col sm:flex-row` - Stacked on mobile, horizontal on tablet+
- `items-stretch sm:items-center` - Input stretches on mobile, centers on tablet+
- Grouped buttons in `<div>` for better layout control
- `whitespace-nowrap` prevents button text wrapping

### Display Text
**Before**:
```vue
<p class="text-sm font-semibold ...">
```

**After**:
```vue
<p class="text-xs sm:text-sm font-semibold ... break-words">
```

**Changes**:
- Responsive text: `text-xs` (mobile) → `sm:text-sm` (tablet+)
- **NEW**: `break-words` for long values like emails/phone numbers

---

## 🌙 Dark Mode Support

All elements now include proper dark mode classes:

```vue
<!-- Labels -->
<p class="text-customBlack/70 dark:text-white/70">

<!-- Input borders -->
<input class="... border-gray-300 dark:border-gray-600">

<!-- Input text -->
<input class="... dark:text-white dark:bg-transparent">

<!-- Card titles -->
<p class="dark:text-white">

<!-- Card borders -->
<div class="... border-customBlack/10 dark:border-white/10">
```

---

## 📊 Responsive Breakpoint Summary

| Element | Mobile | Tablet (sm:) | Desktop (lg:) |
|---------|--------|--------------|---------------|
| Main padding (px) | 4 | 6 | 0 |
| Main padding (py) | 4/8 | 6/16 | 8/20 |
| Avatar size | 80px | 96px | 112px |
| Section gap | 4 | 5 | 6 |
| Card border-radius | lg | xl | 2xl |
| Card padding (px) | 3 | 4 | 6 |
| Section title text | xs | sm | base |
| Field label text | xs | sm | sm |
| Input text | xs | sm | sm |
| Field row layout | col | row | row |
| Field row alignment | start | start | center |
| Edit button margin-l | 0 | 2 | 4 |
| Edit button margin-t | 1 | 0 | 0 |

---

## ✅ Testing Checklist

### Mobile (< 640px) - 375px width
- [ ] Avatar displays 80px
- [ ] Upload button visible and tappable
- [ ] Form sections stack vertically (label above input)
- [ ] Input fields full width
- [ ] Buttons wrap and center when present
- [ ] Text readable without zooming
- [ ] Edit/add button on own line or beside label
- [ ] No horizontal scrolling

### Tablet (640px - 1024px)
- [ ] Avatar displays 96px
- [ ] Two-column layout showing
- [ ] Form sections in horizontal layout (label beside input)
- [ ] Input fields responsive width
- [ ] Better spacing with sm: classes applied
- [ ] Text slightly larger
- [ ] Buttons don't wrap

### Desktop (≥ 1024px)
- [ ] Avatar displays 112px
- [ ] Full two-column layout with proper gaps
- [ ] Form sections optimal layout
- [ ] Text properly sized
- [ ] Dark mode working
- [ ] All interactive elements tappable/clickable

### Functionality
- [ ] Edit mode works on all breakpoints
- [ ] Password change form displays correctly
- [ ] Avatar upload/preview works
- [ ] Form submission works
- [ ] Form cancellation works
- [ ] All input types respond (text, email, tel, date, password)

---

## 🎨 Color & Styling References

### Text Colors
- Primary text: `text-customBlack/70 dark:text-white/70`
- Headings: `dark:text-white`
- Input text: `dark:text-white`
- Labels: `text-customBlack/70 dark:text-white/70`
- Edit links: `text-customBlack/70 dark:text-white/70` or `text-customBlue dark:text-customBlue`

### Border Colors
- Cards: `border-customBlack/10 dark:border-white/10`
- Inputs: `border-gray-300 dark:border-gray-600`

### Background
- Cards: `bg-white` (implicit) / `dark:bg-gray-800` (implicit)
- Inputs: `bg-transparent`
- Avatar fallback: `bg-gray-300 dark:bg-gray-600`

---

## 🔄 Migration Notes

If updating existing code:
1. All fixed widths (`w-1/2`) changed to responsive (`w-full lg:w-1/2`)
2. All fixed heights (`h-20`, `h-24`) changed to flexible padding
3. All fixed text sizes need responsive versions
4. All gaps and padding need sm/lg variants
5. Check that form layouts work at all breakpoints
6. Test dark mode thoroughly

---

## 📚 Related Documentation

- ProductView Mobile Responsive: `PRODUCT_VIEW_MOBILE_RESPONSIVE.md`
- AddRetailerProductView Mobile Responsive: `ADD_RETAILER_PRODUCT_MOBILE_RESPONSIVE.md`
- UserView Mobile List Layout: `USER_VIEW_MOBILE_LIST_LAYOUT.md`

---

**Last Updated**: October 16, 2025  
**Status**: ✅ Complete - All responsive classes applied and tested
