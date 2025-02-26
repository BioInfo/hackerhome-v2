# Frontend Setup Guide

This guide provides step-by-step instructions for setting up the HackerHome frontend development environment. The frontend is built with Next.js, TypeScript, Tailwind CSS, ShadCN UI, and Framer Motion.

## Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v18.0.0 or later)
- [npm](https://www.npmjs.com/) (v8.0.0 or later) or [yarn](https://yarnpkg.com/) (v1.22.0 or later) or [pnpm](https://pnpm.io/) (v7.0.0 or later)
- [Git](https://git-scm.com/) (v2.30.0 or later)
- A code editor (we recommend [Visual Studio Code](https://code.visualstudio.com/))

## Initial Setup

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/hackerhome.git
cd hackerhome
```

### 2. Install Dependencies

Using npm:

```bash
npm install
```

Using yarn:

```bash
yarn
```

Using pnpm:

```bash
pnpm install
```

## Project Structure

The frontend project structure follows Next.js 14 conventions with App Router:

```
src/
├── app/                  # App Router pages and layouts
│   ├── (simple)/        # Simple mode routes
│   ├── (advanced)/      # Advanced mode routes
│   ├── api/             # API routes
│   ├── layout.tsx       # Root layout
│   └── page.tsx         # Home page
├── components/          # Reusable components
│   ├── ui/              # ShadCN UI components
│   ├── layout/          # Layout components
│   ├── cards/           # Card components for different sources
│   └── animations/      # Framer Motion animations
├── lib/                 # Utility functions and helpers
│   ├── api/             # API integration clients
│   ├── hooks/           # Custom React hooks
│   └── utils/           # Utility functions
├── styles/              # Global styles
└── types/               # TypeScript type definitions
```

## Setting Up ShadCN UI

ShadCN UI is a collection of reusable components built with Radix UI and Tailwind CSS.

### 1. Initialize Tailwind CSS

```bash
npx shadcn-ui@latest init
```

When prompted, select the following options:
- TypeScript: Yes
- Style: Default (or your preferred style)
- React Server Components: Yes
- CSS variables for colors: Yes
- CSS variables for dark mode: Yes
- Global CSS file: src/styles/globals.css
- CSS reset: Yes
- Import alias: @/components

### 2. Install ShadCN UI Components

Install individual components as needed:

```bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add toggle
npx shadcn-ui@latest add switch
npx shadcn-ui@latest add input
npx shadcn-ui@latest add toast
npx shadcn-ui@latest add skeleton
```

## Setting Up Framer Motion

### 1. Install Framer Motion

```bash
npm install framer-motion
```

or

```bash
yarn add framer-motion
```

or

```bash
pnpm add framer-motion
```

### 2. Configure for Next.js

Create a client component wrapper for Framer Motion animations:

```tsx
// src/components/animations/motion.tsx
'use client'

import { motion } from 'framer-motion'
export { motion }
```

## Development Workflow

### Running the Development Server

```bash
npm run dev
```

or

```bash
yarn dev
```

or

```bash
pnpm dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

### Building for Production

```bash
npm run build
```

or

```bash
yarn build
```

or

```bash
pnpm build
```

### Starting the Production Server

```bash
npm start
```

or

```bash
yarn start
```

or

```bash
pnpm start
```

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```
# API Keys (if needed)
GITHUB_API_KEY=your_github_api_key
PRODUCT_HUNT_API_KEY=your_product_hunt_api_key

# Feature Flags
NEXT_PUBLIC_ENABLE_ADVANCED_MODE=true
NEXT_PUBLIC_ENABLE_ANALYTICS=false

# Other Configuration
NEXT_PUBLIC_API_CACHE_DURATION=300
```

## IDE Setup

### Recommended VS Code Extensions

- ESLint
- Prettier
- Tailwind CSS IntelliSense
- TypeScript Vue Plugin (Volar)
- Error Lens

### VS Code Settings

Create a `.vscode/settings.json` file with the following settings:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "tailwindCSS.includeLanguages": {
    "typescript": "javascript",
    "typescriptreact": "javascript"
  },
  "tailwindCSS.experimental.classRegex": [
    ["cva\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"],
    ["cn\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"]
  ]
}
```

## Troubleshooting

### Common Issues

#### Next.js Build Errors

If you encounter build errors, try cleaning the Next.js cache:

```bash
rm -rf .next
```

#### ShadCN UI Component Styling Issues

If ShadCN UI components aren't styled correctly, ensure that:
1. The `globals.css` file is imported in your root layout
2. Tailwind CSS is properly configured
3. The component is properly imported from `@/components/ui`

#### Framer Motion "React Server Component" Error

If you see an error about using client components in server components:
1. Ensure you're using the `'use client'` directive at the top of files using Framer Motion
2. Use the client component wrapper mentioned above

## Next Steps

After setting up the development environment:

1. Review the [Component Library](./components.md) documentation
2. Explore the [Styling Guide](./styling.md) for Tailwind CSS and ShadCN UI implementation
3. Check out the [Animation Guide](./animations.md) for Framer Motion examples
4. Understand the [State Management](./state-management.md) approach