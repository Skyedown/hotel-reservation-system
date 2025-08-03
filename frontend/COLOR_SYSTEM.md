# Color System Documentation

## Overview
This project uses a simplified color system where you only need to change 6 base colors and all color variations are automatically generated using CSS `color-mix()` functions.

## Base Colors (Change these to customize your theme)

Located in `src/app/globals.css`:

```css
:root {
  /* Change these colors to customize your entire theme */
  --primary-base: #f59e0b;     /* Main brand color (currently amber/gold) */
  --secondary-base: #64748b;   /* Neutral gray for text and secondary elements */
  --success-base: #22c55e;     /* Green for success states */
  --error-base: #dc2626;       /* Red for error states */
  --warning-base: #eab308;     /* Yellow for warning states */
  --info-base: #2563eb;        /* Blue for info states */
}
```

## How It Works

Each base color automatically generates a complete color scale (50-900) using CSS `color-mix()`:
- `50-400`: Lighter variations (mixed with white)
- `500`: The base color itself
- `600-900`: Darker variations (mixed with black)

## Usage in Components

Use the generated color classes throughout your components:

```tsx
// Tailwind classes - these work automatically
<div className="bg-primary-600 text-white">
<button className="text-error-600 hover:bg-error-50">
<p className="text-secondary-700">
```

## Examples

### Change to Blue Theme
```css
--primary-base: #3b82f6;  /* Blue instead of amber */
```

### Change to Purple Theme  
```css
--primary-base: #8b5cf6;  /* Purple instead of amber */
```

### Change to Red Theme
```css
--primary-base: #ef4444;  /* Red instead of amber */
```

## Available Color Scales

Each base color generates these variations:
- `primary-50` to `primary-900`
- `secondary-50` to `secondary-900`
- `success-50` to `success-900`
- `error-50` to `error-900`
- `warning-50` to `warning-900`
- `info-50` to `info-900`

## Color Usage Guidelines

- **primary**: Main brand elements (buttons, headers, navigation)
- **secondary**: Text, borders, subtle backgrounds
- **success**: Success messages, confirmations, positive actions
- **error**: Error messages, validation errors, dangerous actions
- **warning**: Warnings, cautions, important notices
- **info**: Informational messages, help text, neutral actions

## Browser Support

The `color-mix()` function is supported in:
- Chrome 111+
- Firefox 113+
- Safari 16.2+

For older browsers, consider adding fallback colors or use a PostCSS plugin.