# Design System

This document outlines the design system for the HackerHome application, detailing the visual language, components, and design principles that guide the user interface.

## Design Philosophy

HackerHome's design is guided by the following principles:

1. **Clarity**: Present information in a clear, scannable format
2. **Efficiency**: Optimize for quick consumption of content
3. **Consistency**: Maintain consistent patterns across the application
4. **Adaptability**: Support both simple and advanced interface modes
5. **Accessibility**: Ensure the interface is accessible to all users

## Color System

### Primary Colors

The primary colors define the brand identity of HackerHome:

```css
:root {
  /* Primary brand colors */
  --primary-50: #f0f9ff;
  --primary-100: #e0f2fe;
  --primary-200: #bae6fd;
  --primary-300: #7dd3fc;
  --primary-400: #38bdf8;
  --primary-500: #0ea5e9;
  --primary-600: #0284c7;
  --primary-700: #0369a1;
  --primary-800: #075985;
  --primary-900: #0c4a6e;
  --primary-950: #082f49;
}
```

### Neutral Colors

Neutral colors are used for text, backgrounds, and UI elements:

```css
:root {
  /* Neutral colors */
  --neutral-50: #f8fafc;
  --neutral-100: #f1f5f9;
  --neutral-200: #e2e8f0;
  --neutral-300: #cbd5e1;
  --neutral-400: #94a3b8;
  --neutral-500: #64748b;
  --neutral-600: #475569;
  --neutral-700: #334155;
  --neutral-800: #1e293b;
  --neutral-900: #0f172a;
  --neutral-950: #020617;
}
```

### Source-Specific Colors

Colors associated with different content sources:

```css
:root {
  /* Source colors */
  --hn: #ff6600;
  --devto: #3b49df;
  --github: #24292e;
  --producthunt: #da552f;
  --medium: #000000;
}
```

### Semantic Colors

Colors that convey meaning:

```css
:root {
  /* Semantic colors */
  --success-50: #f0fdf4;
  --success-500: #22c55e;
  --success-900: #14532d;
  
  --warning-50: #fffbeb;
  --warning-500: #f59e0b;
  --warning-900: #78350f;
  
  --error-50: #fef2f2;
  --error-500: #ef4444;
  --error-900: #7f1d1d;
  
  --info-50: #eff6ff;
  --info-500: #3b82f6;
  --info-900: #1e3a8a;
}
```

## Typography

### Font Family

HackerHome uses a system font stack for optimal performance and native feel:

```css
:root {
  --font-sans: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
  --font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
}
```

### Font Sizes

Font sizes follow a consistent scale:

```css
:root {
  --font-size-xs: 0.75rem;   /* 12px */
  --font-size-sm: 0.875rem;  /* 14px */
  --font-size-base: 1rem;    /* 16px */
  --font-size-lg: 1.125rem;  /* 18px */
  --font-size-xl: 1.25rem;   /* 20px */
  --font-size-2xl: 1.5rem;   /* 24px */
  --font-size-3xl: 1.875rem; /* 30px */
  --font-size-4xl: 2.25rem;  /* 36px */
}
```

### Font Weights

Font weights for different text styles:

```css
:root {
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;
}
```

### Line Heights

Line heights for readable text:

```css
:root {
  --line-height-none: 1;
  --line-height-tight: 1.25;
  --line-height-snug: 1.375;
  --line-height-normal: 1.5;
  --line-height-relaxed: 1.625;
  --line-height-loose: 2;
}
```

### Typography Usage

| Element | Font Size | Font Weight | Line Height | Use Case |
|---------|-----------|-------------|-------------|----------|
| h1 | --font-size-3xl | --font-weight-bold | --line-height-tight | Main page headings |
| h2 | --font-size-2xl | --font-weight-semibold | --line-height-tight | Section headings |
| h3 | --font-size-xl | --font-weight-semibold | --line-height-snug | Subsection headings |
| h4 | --font-size-lg | --font-weight-medium | --line-height-snug | Card titles |
| p | --font-size-base | --font-weight-normal | --line-height-normal | Body text |
| small | --font-size-sm | --font-weight-normal | --line-height-normal | Secondary text |
| code | --font-size-sm | --font-weight-normal | --line-height-normal | Code snippets |

## Spacing System

### Spacing Scale

Consistent spacing values:

```css
:root {
  --space-0: 0px;
  --space-1: 0.25rem;  /* 4px */
  --space-2: 0.5rem;   /* 8px */
  --space-3: 0.75rem;  /* 12px */
  --space-4: 1rem;     /* 16px */
  --space-5: 1.25rem;  /* 20px */
  --space-6: 1.5rem;   /* 24px */
  --space-8: 2rem;     /* 32px */
  --space-10: 2.5rem;  /* 40px */
  --space-12: 3rem;    /* 48px */
  --space-16: 4rem;    /* 64px */
  --space-20: 5rem;    /* 80px */
  --space-24: 6rem;    /* 96px */
}
```

### Spacing Usage

| Context | Value | Use Case |
|---------|-------|----------|
| Inline spacing | --space-1 to --space-3 | Space between inline elements |
| Component padding | --space-3 to --space-6 | Internal padding for components |
| Component margins | --space-4 to --space-8 | Space between components |
| Section spacing | --space-8 to --space-16 | Space between major sections |
| Page padding | --space-4 to --space-8 | Page edge padding |

## Border Radius

Consistent border radius values:

```css
:root {
  --radius-none: 0px;
  --radius-sm: 0.125rem;  /* 2px */
  --radius-md: 0.25rem;   /* 4px */
  --radius-lg: 0.5rem;    /* 8px */
  --radius-xl: 0.75rem;   /* 12px */
  --radius-2xl: 1rem;     /* 16px */
  --radius-full: 9999px;  /* Fully rounded */
}
```

## Shadows

Shadow values for depth:

```css
:root {
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
}
```

## Transitions

Transition values for animations:

```css
:root {
  --transition-all: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
  --transition-colors: color 0.15s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.15s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.15s cubic-bezier(0.4, 0, 0.2, 1);
  --transition-opacity: opacity 0.15s cubic-bezier(0.4, 0, 0.2, 1);
  --transition-shadow: box-shadow 0.15s cubic-bezier(0.4, 0, 0.2, 1);
  --transition-transform: transform 0.15s cubic-bezier(0.4, 0, 0.2, 1);
}
```

## Z-Index Scale

Z-index values for stacking elements:

```css
:root {
  --z-0: 0;
  --z-10: 10;
  --z-20: 20;
  --z-30: 30;
  --z-40: 40;
  --z-50: 50;
  --z-auto: auto;
}
```

## Component Design

### Cards

Cards are the primary container for content items:

#### Simple Mode Card

```html
<div class="rounded-lg border bg-card p-3 shadow-sm">
  <div class="space-y-1.5 pb-2">
    <h3 class="text-sm font-medium">
      <a href="#" class="hover:underline">Card Title</a>
    </h3>
  </div>
  <div class="text-xs text-muted-foreground">
    <div class="flex items-center gap-2">
      <span>Source</span>
      <span>•</span>
      <span>2 hours ago</span>
    </div>
  </div>
</div>
```

#### Advanced Mode Card

```html
<div class="rounded-lg border bg-card p-5 shadow-sm">
  <div class="space-y-1.5 pb-3">
    <h3 class="text-base font-medium">
      <a href="#" class="hover:underline">Card Title</a>
    </h3>
    <p class="text-sm text-muted-foreground">Card description with more details about the content.</p>
  </div>
  <div class="py-3">
    <p class="text-sm">Additional content that's only visible in advanced mode.</p>
  </div>
  <div class="pt-3 text-sm text-muted-foreground">
    <div class="flex items-center gap-3">
      <div class="flex items-center gap-1">
        <svg class="h-4 w-4" viewBox="0 0 24 24"><!-- Icon SVG --></svg>
        <span>100</span>
      </div>
      <div class="flex items-center gap-1">
        <svg class="h-4 w-4" viewBox="0 0 24 24"><!-- Icon SVG --></svg>
        <span>42</span>
      </div>
      <span>2 hours ago</span>
    </div>
  </div>
</div>
```

### Buttons

Button variants for different actions:

#### Primary Button

```html
<button class="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50">
  Primary Button
</button>
```

#### Secondary Button

```html
<button class="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50">
  Secondary Button
</button>
```

#### Ghost Button

```html
<button class="inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50">
  Ghost Button
</button>
```

#### Icon Button

```html
<button class="inline-flex items-center justify-center rounded-md p-2 text-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50">
  <svg class="h-5 w-5" viewBox="0 0 24 24"><!-- Icon SVG --></svg>
  <span class="sr-only">Icon Button</span>
</button>
```

### Form Elements

#### Input

```html
<div class="relative">
  <input
    type="text"
    class="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
    placeholder="Input"
  />
</div>
```

#### Search Input

```html
<div class="relative">
  <svg class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" viewBox="0 0 24 24"><!-- Search Icon SVG --></svg>
  <input
    type="search"
    class="flex h-9 w-full rounded-md border border-input bg-background pl-10 pr-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
    placeholder="Search..."
  />
</div>
```

#### Toggle

```html
<button
  type="button"
  role="switch"
  aria-checked="false"
  data-state="unchecked"
  class="inline-flex items-center justify-center rounded-md border border-input bg-background px-3 py-1 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
>
  Toggle
</button>
```

#### Switch

```html
<button
  type="button"
  role="switch"
  aria-checked="false"
  data-state="unchecked"
  class="inline-flex h-[24px] w-[44px] shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent bg-input transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
>
  <span
    data-state="unchecked"
    class="pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform"
  ></span>
</button>
```

### Navigation

#### Header

```html
<header class="sticky top-0 z-40 w-full border-b bg-background">
  <div class="container flex h-14 items-center">
    <div class="flex items-center space-x-4">
      <a href="/" class="flex items-center space-x-2">
        <svg class="h-6 w-6" viewBox="0 0 24 24"><!-- Logo SVG --></svg>
        <span class="font-bold">HackerHome</span>
      </a>
    </div>
    <div class="flex flex-1 items-center justify-end space-x-4">
      <nav class="flex items-center space-x-2">
        <button class="inline-flex items-center justify-center rounded-md p-2 text-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50">
          <svg class="h-5 w-5" viewBox="0 0 24 24"><!-- Theme Icon SVG --></svg>
          <span class="sr-only">Toggle theme</span>
        </button>
        <button class="inline-flex items-center justify-center rounded-md p-2 text-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50">
          <svg class="h-5 w-5" viewBox="0 0 24 24"><!-- Settings Icon SVG --></svg>
          <span class="sr-only">Settings</span>
        </button>
      </nav>
    </div>
  </div>
</header>
```

#### Tabs

```html
<div class="flex space-x-1 rounded-lg bg-muted p-1">
  <button class="rounded-md bg-background px-3 py-1.5 text-sm font-medium text-foreground shadow-sm">
    Tab 1
  </button>
  <button class="rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground hover:bg-background/50 hover:text-foreground">
    Tab 2
  </button>
  <button class="rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground hover:bg-background/50 hover:text-foreground">
    Tab 3
  </button>
</div>
```

## Interface Modes

HackerHome supports two interface modes: Simple and Advanced.

### Simple Mode

Simple mode focuses on essential information with a clean, minimalist interface:

- Reduced visual complexity
- Smaller card sizes with less padding
- Limited metadata display
- Streamlined interactions
- Faster loading and rendering

```css
.simple-mode {
  --card-padding: var(--space-3);
  --card-gap: var(--space-2);
  --content-font-size: var(--font-size-sm);
}
```

### Advanced Mode

Advanced mode provides a richer experience with more details and features:

- Enhanced visual presentation
- Larger card sizes with more padding
- Comprehensive metadata display
- Advanced filtering and sorting options
- Interactive features like previews and actions

```css
.advanced-mode {
  --card-padding: var(--space-5);
  --card-gap: var(--space-4);
  --content-font-size: var(--font-size-base);
}
```

## Responsive Design

### Breakpoints

```css
:root {
  --breakpoint-sm: 640px;
  --breakpoint-md: 768px;
  --breakpoint-lg: 1024px;
  --breakpoint-xl: 1280px;
  --breakpoint-2xl: 1536px;
}
```

### Responsive Layout

The layout adapts to different screen sizes:

- **Mobile (< 640px)**: Single column layout
- **Tablet (640px - 1023px)**: Two column layout
- **Desktop (1024px+)**: Three or more column layout

```html
<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
  <!-- Cards -->
</div>
```

### Responsive Typography

Font sizes adjust based on screen size:

```css
h1 {
  font-size: var(--font-size-2xl);
}

@media (min-width: 768px) {
  h1 {
    font-size: var(--font-size-3xl);
  }
}

@media (min-width: 1024px) {
  h1 {
    font-size: var(--font-size-4xl);
  }
}
```

## Accessibility

### Color Contrast

All color combinations meet WCAG 2.1 AA standards:

- Text on background: 4.5:1 minimum contrast ratio
- Large text on background: 3:1 minimum contrast ratio
- UI components and graphical objects: 3:1 minimum contrast ratio

### Keyboard Navigation

All interactive elements are keyboard accessible:

- Focusable elements have visible focus states
- Tab order follows a logical sequence
- Keyboard shortcuts for common actions

### Screen Reader Support

Content is accessible to screen readers:

- Semantic HTML elements
- ARIA attributes where necessary
- Alternative text for images
- Descriptive link text

### Reduced Motion

Support for users who prefer reduced motion:

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

## Dark Mode

HackerHome supports both light and dark themes:

### Light Theme Variables

```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --card: 0 0% 100%;
  --card-foreground: 222.2 84% 4.9%;
  --popover: 0 0% 100%;
  --popover-foreground: 222.2 84% 4.9%;
  --primary: 221.2 83.2% 53.3%;
  --primary-foreground: 210 40% 98%;
  --secondary: 210 40% 96.1%;
  --secondary-foreground: 222.2 47.4% 11.2%;
  --muted: 210 40% 96.1%;
  --muted-foreground: 215.4 16.3% 46.9%;
  --accent: 210 40% 96.1%;
  --accent-foreground: 222.2 47.4% 11.2%;
  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 210 40% 98%;
  --border: 214.3 31.8% 91.4%;
  --input: 214.3 31.8% 91.4%;
  --ring: 221.2 83.2% 53.3%;
  --radius: 0.5rem;
}
```

### Dark Theme Variables

```css
.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  --card: 222.2 84% 4.9%;
  --card-foreground: 210 40% 98%;
  --popover: 222.2 84% 4.9%;
  --popover-foreground: 210 40% 98%;
  --primary: 217.2 91.2% 59.8%;
  --primary-foreground: 222.2 47.4% 11.2%;
  --secondary: 217.2 32.6% 17.5%;
  --secondary-foreground: 210 40% 98%;
  --muted: 217.2 32.6% 17.5%;
  --muted-foreground: 215 20.2% 65.1%;
  --accent: 217.2 32.6% 17.5%;
  --accent-foreground: 210 40% 98%;
  --destructive: 0 62.8% 30.6%;
  --destructive-foreground: 210 40% 98%;
  --border: 217.2 32.6% 17.5%;
  --input: 217.2 32.6% 17.5%;
  --ring: 224.3 76.3% 48%;
}
```

## Icons

HackerHome uses [Lucide React](https://lucide.dev/) for icons:

```tsx
import {
  Sun,
  Moon,
  Settings,
  Search,
  ThumbsUp,
  MessageSquare,
  Clock,
  // ...other icons
} from 'lucide-react';

// Usage
<Sun className="h-5 w-5" />
```

## Design Tokens Implementation

The design tokens are implemented using CSS variables and Tailwind CSS:

### CSS Variables

```css
/* src/styles/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;
 
@layer base {
  :root {
    /* Base variables */
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    /* ...other variables */
  }
  
  .dark {
    /* Dark mode variables */
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    /* ...other variables */
  }
}
```

### Tailwind Configuration

```js
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        /* ...other colors */
        
        // Source-specific colors
        "hn": "#ff6600",
        "devto": "#3b49df",
        "github": "#24292e",
        "producthunt": "#da552f",
        "medium": "#000000",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      /* ...other theme extensions */
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    require('@tailwindcss/typography'),
  ],
}
```

## Design-to-Code Workflow

### Component Development Process

1. **Design in Figma**: Create component designs in Figma
2. **Extract Design Tokens**: Extract colors, typography, spacing, etc.
3. **Implement in Code**: Translate designs to React components
4. **Review & Iterate**: Compare implementation with design and refine

### Design Token Management

Design tokens are managed in a central location and used throughout the application:

```typescript
// src/lib/design-tokens.ts
export const designTokens = {
  colors: {
    primary: {
      50: 'var(--primary-50)',
      // ...other shades
    },
    // ...other color categories
  },
  typography: {
    fontSizes: {
      xs: 'var(--font-size-xs)',
      // ...other sizes
    },
    // ...other typography properties
  },
  // ...other token categories
};
```

## Design Guidelines

### Layout Guidelines

- Use consistent spacing between elements
- Maintain a clear visual hierarchy
- Ensure content is scannable
- Use white space effectively
- Keep layouts responsive and adaptive

### Typography Guidelines

- Use the type scale consistently
- Maintain proper contrast for readability
- Limit the number of font styles per page
- Ensure proper line length (50-75 characters)
- Use appropriate line height for readability

### Color Guidelines

- Use the primary color for key actions and emphasis
- Use neutral colors for most UI elements
- Use semantic colors to convey meaning
- Ensure sufficient contrast between text and background
- Use color consistently across the application

### Component Guidelines

- Use consistent component patterns
- Follow established interaction patterns
- Ensure components are accessible
- Design for both interface modes
- Maintain responsive behavior