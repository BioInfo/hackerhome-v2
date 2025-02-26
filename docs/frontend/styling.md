# Styling Guide

This document outlines the styling approach for the HackerHome application, focusing on Tailwind CSS implementation and ShadCN UI customization.

## Styling Architecture

HackerHome uses a combination of:

1. **Tailwind CSS**: For utility-based styling
2. **ShadCN UI**: For consistent, accessible components
3. **CSS Variables**: For theming and customization
4. **Global CSS**: For base styles and overrides

## Tailwind CSS Configuration

### Base Configuration

The Tailwind configuration is extended to support the application's design system:

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
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
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
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: '65ch',
            color: 'hsl(var(--foreground))',
            a: {
              color: 'hsl(var(--primary))',
              '&:hover': {
                color: 'hsl(var(--primary))',
              },
            },
            strong: {
              color: 'hsl(var(--foreground))',
            },
            code: {
              color: 'hsl(var(--foreground))',
            },
          },
        },
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    require('@tailwindcss/typography'),
  ],
}
```

### Custom Utilities

Create custom utilities for common patterns:

```css
/* src/styles/utilities.css */
@layer utilities {
  .text-balance {
    text-wrap: balance;
  }
  
  .content-auto {
    content-visibility: auto;
  }
  
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
}
```

## CSS Variables

### Base Variables

The application uses CSS variables for theming:

```css
/* src/styles/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;
 
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
 
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
 
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
 
    --primary: 222.2 47.4% 11.2%;
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
    --ring: 222.2 84% 4.9%;
 
    --radius: 0.5rem;
  }
 
  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
 
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
 
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
 
    --primary: 210 40% 98%;
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
    --ring: 212.7 26.8% 83.9%;
  }
}
 
@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

### Mode-Specific Variables

Additional variables for simple and advanced modes:

```css
/* src/styles/modes.css */
@layer base {
  :root {
    /* Simple mode variables */
    --simple-card-padding: 0.75rem;
    --simple-card-gap: 0.5rem;
    --simple-font-size: 0.875rem;
    
    /* Advanced mode variables */
    --advanced-card-padding: 1.25rem;
    --advanced-card-gap: 1rem;
    --advanced-font-size: 1rem;
  }
}

.simple-mode {
  --card-padding: var(--simple-card-padding);
  --card-gap: var(--simple-card-gap);
  --content-font-size: var(--simple-font-size);
}

.advanced-mode {
  --card-padding: var(--advanced-card-padding);
  --card-gap: var(--advanced-card-gap);
  --content-font-size: var(--advanced-font-size);
}
```

## ShadCN UI Customization

### Component Customization

Customize ShadCN UI components to match the application's design:

```tsx
// src/components/ui/card.tsx
import * as React from "react"
import { cn } from "@/lib/utils"

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    mode?: "simple" | "advanced"
  }
>(({ className, mode = "simple", ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-lg border bg-card text-card-foreground shadow-sm",
      mode === "simple" ? "p-3" : "p-5",
      className
    )}
    {...props}
  />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    mode?: "simple" | "advanced"
  }
>(({ className, mode = "simple", ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex flex-col space-y-1.5",
      mode === "simple" ? "pb-2" : "pb-3",
      className
    )}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

// ... other card components
```

### Theme Extension

Create a theme extension for ShadCN UI:

```tsx
// src/components/ui/theme-provider.tsx
"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { type ThemeProviderProps } from "next-themes/dist/types"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
```

## Styling Patterns

### Responsive Design

Use Tailwind's responsive prefixes for responsive design:

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Content */}
</div>
```

### Mode-Based Styling

Apply different styles based on the current mode:

```tsx
<div className={cn(
  "rounded-lg border",
  mode === "simple" 
    ? "p-3 text-sm" 
    : "p-5 text-base"
)}>
  {/* Content */}
</div>
```

### Source-Based Styling

Apply different styles based on the content source:

```tsx
<div className={cn(
  "rounded-lg border-l-4",
  {
    "border-l-hn": source === "hackernews",
    "border-l-devto": source === "devto",
    "border-l-github": source === "github",
    "border-l-producthunt": source === "producthunt",
    "border-l-medium": source === "medium",
  }
)}>
  {/* Content */}
</div>
```

### Animation Styling

Use Framer Motion with Tailwind:

```tsx
import { motion } from "framer-motion"

<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.3 }}
  className="bg-card rounded-lg p-4"
>
  {/* Content */}
</motion.div>
```

## Utility Functions

### Class Name Merging

Use the `cn` utility for merging class names:

```tsx
// src/lib/utils.ts
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

### Theme Hooks

Use custom hooks for theme management:

```tsx
// src/lib/hooks/use-theme.ts
import { useTheme } from "next-themes"

export function useAppTheme() {
  const { theme, setTheme } = useTheme()
  
  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }
  
  return { theme, setTheme, toggleTheme }
}
```

## Best Practices

### Component Styling

1. **Use Tailwind Classes First**: Leverage Tailwind's utility classes for most styling needs
2. **Create Custom Components**: For complex or repeated patterns, create custom components
3. **Avoid Inline Styles**: Use Tailwind classes instead of inline styles
4. **Use CSS Variables for Theming**: Leverage CSS variables for theme-related values
5. **Keep Components Responsive**: Ensure all components work well on all screen sizes

### Performance Considerations

1. **Purge Unused Styles**: Tailwind automatically removes unused styles in production
2. **Minimize Class Changes**: Avoid frequently changing classes that cause re-renders
3. **Use Content-Visibility**: Apply `content-visibility: auto` for off-screen content
4. **Optimize Animations**: Use `will-change` and hardware-accelerated properties

### Accessibility

1. **Maintain Sufficient Contrast**: Ensure text has sufficient contrast against backgrounds
2. **Use Semantic HTML**: Use appropriate HTML elements for their intended purpose
3. **Support Reduced Motion**: Respect user preferences for reduced motion
4. **Test with Screen Readers**: Ensure the application works well with screen readers

## Style Guide Enforcement

### ESLint Rules

```json
// .eslintrc.json
{
  "extends": [
    "next/core-web-vitals",
    "plugin:tailwindcss/recommended"
  ],
  "plugins": ["tailwindcss"],
  "rules": {
    "tailwindcss/no-custom-classname": "warn",
    "tailwindcss/classnames-order": "warn"
  }
}
```

### Prettier Configuration

```json
// .prettierrc
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

## Examples

### Simple Mode Card

```tsx
<Card mode="simple" className="hover:bg-accent/5 transition-colors">
  <CardHeader mode="simple">
    <CardTitle className="text-sm font-medium">
      <a href={url} target="_blank" rel="noopener noreferrer">
        {title}
      </a>
    </CardTitle>
  </CardHeader>
  <CardFooter mode="simple" className="text-xs text-muted-foreground">
    <div className="flex items-center gap-2">
      <span>{source}</span>
      <span>•</span>
      <span>{formatTimeAgo(timestamp)}</span>
    </div>
  </CardFooter>
</Card>
```

### Advanced Mode Card

```tsx
<Card mode="advanced" className="hover:bg-accent/5 transition-colors">
  <CardHeader mode="advanced">
    <CardTitle className="text-base font-medium">
      <a href={url} target="_blank" rel="noopener noreferrer">
        {title}
      </a>
    </CardTitle>
    <CardDescription>{description}</CardDescription>
  </CardHeader>
  <CardContent mode="advanced">
    {/* Additional content */}
  </CardContent>
  <CardFooter mode="advanced" className="text-sm text-muted-foreground">
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-1">
        <ThumbsUp className="h-4 w-4" />
        <span>{points}</span>
      </div>
      <div className="flex items-center gap-1">
        <MessageSquare className="h-4 w-4" />
        <span>{commentCount}</span>
      </div>
      <span>{formatTimeAgo(timestamp)}</span>
    </div>
  </CardFooter>
</Card>
```

### Responsive Layout

```tsx
<div className="container mx-auto px-4 py-8">
  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
    {items.map((item) => (
      <NewsCard
        key={item.id}
        {...item}
        mode={mode}
      />
    ))}
  </div>
</div>
```

### Theme Toggle

```tsx
"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}