# Theme System Guide

This document explains how to use the central theme system implemented in this project.

## Overview

The theme system provides a centralized way to manage colors, spacing, typography, and other design tokens across the application. It uses CSS custom properties (variables) and integrates with Tailwind CSS for consistent styling.

## Theme Colors

### Primary Colors
- **Primary**: `#1ccd63` - Main button and accent color
- **Primary Hover**: `#16b855` - Hover state for primary elements
- **Primary Light**: `#4ddb7a` - Light variant for backgrounds
- **Primary Dark**: `#0fa54a` - Dark variant for active states

### Text and Background
- **Text**: `#000000` (black) - Main text color
- **Background**: `#ffffff` (white) - Main background color

### Semantic Colors
- **Success**: `#10b981` - Success states and positive actions
- **Warning**: `#f59e0b` - Warning states
- **Error**: `#ef4444` - Error states and negative actions
- **Info**: `#3b82f6` - Informational states

### Gray Scale
- **Gray 50-900**: Complete gray scale from lightest to darkest
- **Border**: `#e5e7eb` - Default border color
- **Divider**: `#d1d5db` - Divider color

## Usage

### CSS Custom Properties

You can use theme colors directly in CSS:

```css
.my-button {
  background-color: var(--color-primary);
  color: white;
}

.my-button:hover {
  background-color: var(--color-primary-hover);
}
```

### Tailwind CSS Classes

The theme is integrated with Tailwind CSS, so you can use semantic class names:

```jsx
// Primary button
<button className="bg-primary text-white hover:bg-primary-hover">
  Click me
</button>

// Success button
<button className="bg-success text-white hover:bg-success/90">
  Success
</button>

// Error message
<div className="bg-error/10 border border-error/20 text-error">
  Error message
</div>

// Text colors
<h1 className="text-text">Main heading</h1>
<p className="text-gray-600">Secondary text</p>
```

### React Hook

Use the `useTheme` hook for programmatic access:

```jsx
import { useTheme } from '../lib/useTheme';

function MyComponent() {
  const theme = useTheme();
  
  return (
    <div style={{ backgroundColor: theme.colors.primary }}>
      Content
    </div>
  );
}
```

### Utility Functions

Access theme values dynamically:

```jsx
import { themeUtils } from '../lib/useTheme';

function MyComponent() {
  const primaryColor = themeUtils.getPrimaryColor();
  
  return (
    <div style={{ color: primaryColor }}>
      Dynamic color
    </div>
  );
}
```

## Available Tailwind Classes

### Colors
- `bg-primary`, `text-primary`, `border-primary`
- `bg-primary-hover`, `bg-primary-light`, `bg-primary-dark`
- `bg-success`, `text-success`, `border-success`
- `bg-warning`, `text-warning`, `border-warning`
- `bg-error`, `text-error`, `border-error`
- `bg-info`, `text-info`, `border-info`
- `bg-text`, `text-text`
- `bg-background`, `text-background`
- `border-border`, `border-divider`

### Spacing
- `p-xs`, `p-sm`, `p-md`, `p-lg`, `p-xl`, `p-2xl`, `p-3xl`
- `m-xs`, `m-sm`, `m-md`, `m-lg`, `m-xl`, `m-2xl`, `m-3xl`

### Border Radius
- `rounded-sm`, `rounded-md`, `rounded-lg`, `rounded-xl`, `rounded-2xl`

## Custom CSS Classes

The theme system includes some utility classes:

```css
.btn-primary {
  background-color: var(--color-primary);
  color: white;
  /* ... other styles */
}

.btn-primary:hover {
  background-color: var(--color-primary-hover);
}

.text-primary {
  color: var(--color-primary);
}

.bg-primary {
  background-color: var(--color-primary);
}

.border-primary {
  border-color: var(--color-primary);
}
```

## Dark Mode Support

Dark mode is configured but currently disabled. To enable it, remove the `@media (prefers-color-scheme: dark)` wrapper in `globals.css`.

## File Structure

- `lib/theme.ts` - Theme configuration and TypeScript types
- `lib/useTheme.ts` - React hook and utility functions
- `app/globals.css` - CSS custom properties and utility classes
- `tailwind.config.ts` - Tailwind CSS integration

## Best Practices

1. **Use semantic class names** instead of hardcoded colors
2. **Use the theme hook** for dynamic styling
3. **Follow the color hierarchy**: Primary → Success → Warning → Error
4. **Use opacity modifiers** for subtle variations (e.g., `bg-primary/10`)
5. **Test both light and dark modes** when implementing new components

## Examples

### Button Components

```jsx
// Primary button
<button className="btn-primary">Primary Action</button>

// Success button
<button className="bg-success text-white px-4 py-2 rounded-lg hover:bg-success/90">
  Success Action
</button>

// Error button
<button className="bg-error text-white px-4 py-2 rounded-lg hover:bg-error/90">
  Delete
</button>
```

### Form Elements

```jsx
// Input with primary focus
<input className="border border-gray-300 focus:ring-primary focus:border-primary" />

// Checkbox with primary color
<input type="checkbox" className="text-primary focus:ring-primary" />
```

### Status Indicators

```jsx
// Success message
<div className="bg-success/10 border border-success/20 text-success p-4 rounded-lg">
  Operation successful!
</div>

// Error message
<div className="bg-error/10 border border-error/20 text-error p-4 rounded-lg">
  Something went wrong!
</div>
```

## Updating Theme Colors

To update theme colors:

1. Edit the color values in `lib/theme.ts`
2. Update the corresponding CSS custom properties in `app/globals.css`
3. Update the Tailwind configuration in `tailwind.config.ts`
4. Test all components to ensure consistency

The theme system is designed to be easily maintainable and scalable for future design updates.
