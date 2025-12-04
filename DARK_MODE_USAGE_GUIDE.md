# Dark Mode Usage Guide

## Quick Start

The dark mode is now live on the login page! Here's what you need to know:

## For Users

### Toggle Dark Mode
- Look for the sun/moon icon button in the login page footer
- Click to toggle between light and dark modes
- Your preference is automatically saved

### Automatic Detection
- The system automatically detects your OS dark mode preference
- If you prefer system settings, it will follow them automatically
- Manual toggle overrides system preference

## For Developers

### Add Dark Mode to New Pages

```tsx
'use client';

import { useDarkMode } from '@/hooks/useDarkMode';
import DarkModeToggle from '@/app/components/DarkModeToggle';

export default function MyPage() {
  // Initialize dark mode support
  useDarkMode();

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      {/* Add toggle button anywhere */}
      <DarkModeToggle size="md" />
      
      {/* Use dark: prefix for all styling */}
      <div className="bg-gray-100 dark:bg-slate-800 p-6 rounded-lg">
        <h1 className="text-gray-900 dark:text-white">
          Hello World
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          This text adapts to dark mode
        </p>
      </div>
    </div>
  );
}
```

### Using CSS Variables

```tsx
// In your component
<button 
  style={{ 
    backgroundColor: 'var(--bg-primary)',
    color: 'var(--text-primary)',
    borderColor: 'var(--border-medium)'
  }}
>
  I use CSS variables!
</button>
```

### Available CSS Variables

```css
/* Text Colors */
var(--text-primary)    /* Main text */
var(--text-secondary)  /* Secondary text */
var(--text-tertiary)   /* Tertiary text */
var(--text-muted)      /* Muted text */

/* Backgrounds */
var(--bg-primary)      /* Main background */
var(--bg-secondary)    /* Secondary background */
var(--bg-tertiary)     /* Cards, elevated surfaces */

/* Borders */
var(--border-light)
var(--border-medium)
var(--border-heavy)

/* Theme Colors */
var(--primary)
var(--secondary)
var(--success)
var(--error)
var(--warning)
var(--info)
```

### DarkModeToggle Component Props

```tsx
<DarkModeToggle 
  size="sm"           // 'sm' | 'md' | 'lg'
  showLabel={false}   // Show "Dark Mode" / "Light Mode" label
  className=""        // Additional classes
/>
```

### Direct Hook Usage

```tsx
import { useDarkMode } from '@/hooks/useDarkMode';

function MyComponent() {
  const { 
    isDarkMode,      // boolean: current dark mode state
    preference,      // 'light' | 'dark' | 'system'
    setPreference,   // Set preference manually
    toggleDarkMode   // Quick toggle function
  } = useDarkMode();

  return (
    <div>
      <p>Current mode: {isDarkMode ? 'Dark' : 'Light'}</p>
      <button onClick={toggleDarkMode}>Toggle</button>
      <button onClick={() => setPreference('system')}>
        Use System Preference
      </button>
    </div>
  );
}
```

## Common Patterns

### Form Inputs
```tsx
<input
  className="
    bg-slate-50 dark:bg-slate-800
    border-slate-200 dark:border-slate-700
    text-slate-900 dark:text-white
    placeholder-slate-400 dark:placeholder-slate-500
    focus:border-indigo-500 dark:focus:border-indigo-400
    focus:ring-indigo-500 dark:focus:ring-indigo-400
  "
/>
```

### Buttons
```tsx
<button
  className="
    bg-indigo-600 dark:bg-indigo-500
    text-white dark:text-slate-900
    hover:bg-indigo-700 dark:hover:bg-indigo-400
    border border-indigo-600 dark:border-indigo-500
  "
>
  Click Me
</button>
```

### Cards
```tsx
<div
  className="
    bg-white dark:bg-slate-800
    border border-slate-200 dark:border-slate-700
    shadow-sm dark:shadow-lg
    rounded-lg
  "
>
  <h3 className="text-slate-900 dark:text-white">Card Title</h3>
  <p className="text-slate-600 dark:text-slate-300">Card content</p>
</div>
```

### Images with Overlays
```tsx
<div className="relative">
  <img src="/image.jpg" alt="Photo" />
  <div className="absolute inset-0 bg-black/30 dark:bg-black/50" />
</div>
```

## Accessibility Guidelines

1. **Always maintain contrast ratios >= 4.5:1**
   - Use provided CSS variables (they're already compliant)
   - Test with browser DevTools contrast checker

2. **Provide visual feedback**
   ```tsx
   <button className="
     focus:outline-none 
     focus:ring-2 
     focus:ring-indigo-500 
     dark:focus:ring-indigo-400
   ">
   ```

3. **Use semantic HTML**
   ```tsx
   <button aria-label="Toggle dark mode" />
   ```

4. **Test with keyboard navigation**
   - All interactive elements should be keyboard accessible
   - Focus indicators should be visible in both modes

## Best Practices

### ✅ DO
- Use Tailwind's `dark:` prefix for all styling
- Leverage CSS variables for complex components
- Test both light and dark modes during development
- Ensure images and icons work in both modes
- Maintain consistent spacing and layout

### ❌ DON'T
- Don't use absolute colors (use CSS variables instead)
- Don't forget to test hover and focus states
- Don't hardcode opacity values (test in both modes)
- Don't assume default Tailwind colors will work
- Don't forget to update custom components

## Troubleshooting

### Dark mode not working?
1. Ensure `useDarkMode()` is called in your component
2. Check that you're using `dark:` prefix correctly
3. Verify the `<html>` element has `class="dark"` in DevTools
4. Clear localStorage and test system preference

### Flashing on page load?
- This is normal - the hook initializes after hydration
- The implementation includes flash prevention
- SSR-safe initialization prevents hydration mismatches

### Colors not updating?
1. Check if you're using absolute colors instead of CSS variables
2. Verify Tailwind classes have `dark:` variants
3. Ensure parent elements don't have conflicting styles
4. Check browser DevTools for CSS specificity issues

### LocalStorage issues?
```tsx
// Clear stored preference
localStorage.removeItem('onesign-theme-preference');

// Check current value
console.log(localStorage.getItem('onesign-theme-preference'));
```

## Testing Commands

```bash
# Build project
npm run build

# Run development server
npm run dev

# Type check
npm run type-check

# Lint
npm run lint
```

## Support

For issues or questions:
1. Check the implementation summary document
2. Review the example code in this guide
3. Test in browser DevTools
4. Check console for errors

## Resources

- [Tailwind CSS Dark Mode](https://tailwindcss.com/docs/dark-mode)
- [MDN: prefers-color-scheme](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-color-scheme)
- [WCAG Contrast Guidelines](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html)
- [Framer Motion Animations](https://www.framer.com/motion/)

---

**Implementation Date**: December 4, 2025  
**Version**: 1.0.0  
**Status**: Production Ready ✅
