# AddRetailerProductView - Quick Reference

## Mobile Responsive Classes Used

### Main Container
```
flex flex-col lg:flex-row lg:justify-between lg:gap-28
pb-12 sm:pb-16 lg:pb-24 pt-2 sm:pt-3 px-4 sm:px-6 lg:px-0
```

### Form Sections Pattern
```
flex flex-col sm:flex-row sm:items-center sm:justify-between
border-b border-customBlack/10 py-6 sm:py-8 gap-4 sm:gap-6
```

### Form Labels
```
text-base sm:text-lg (titles)
text-xs sm:text-sm (descriptions)
```

### Form Inputs
```
w-full sm:w-[452px]
h-[44px]
p-3 sm:p-4
text-xs sm:text-sm
```

### Images
```
grid-cols-2 sm:grid-cols-3 lg:grid-cols-2
h-[100px] sm:h-[120px]
gap-2 sm:gap-3
```

### Sidebar
```
hidden lg:flex
w-[420px]
max-h-[236px]
flex-shrink-0
```

---

## Responsive Breakpoints

| Size | Width | Usage |
|------|-------|-------|
| Mobile | < 640px | Default (no prefix) |
| Tablet | 640-1024px | sm: prefix |
| Desktop | ≥ 1024px | lg: prefix |

---

## Layout Switching

```
Mobile:   flex-col   (single column)
Tablet:   flex-col   (single column, better spacing)
Desktop:  lg:flex-row (two columns: form + sidebar)
```

---

## Key Changes Summary

✅ Full-width inputs on mobile  
✅ Fixed-width on desktop  
✅ Responsive text sizes  
✅ Responsive padding and gaps  
✅ Mobile sidebar hidden  
✅ Desktop sidebar visible  
✅ 44px+ touch targets  
✅ Dark mode support  

---

## Testing Points

- 375px (Mobile)
- 640px (Tablet)
- 1024px+ (Desktop)

Check:
- Form inputs full-width on mobile
- Sidebar hidden on mobile/tablet
- All buttons tappable (44px+)
- Text readable
- No horizontal overflow

---

**Status:** ✅ Complete and ready for use!
