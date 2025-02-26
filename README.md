# HackerHome

HackerHome is a modern tech news aggregator built with Next.js, TypeScript, Tailwind CSS, and Framer Motion. It aggregates technology news and trending information from multiple sources such as Hacker News, DEV.to, GitHub, and more.

## Features

- **Multi-source Aggregation**: Combines news from Hacker News, DEV.to, and GitHub
- **Real-time Updates**: Fresh content from the tech world
- **Customizable Feed**: Toggle sources on/off to personalize your feed
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Dark Mode**: Toggle between light and dark themes
- **Search & Filter**: Find specific content across all sources
- **Performance Optimized**: Fast loading and rendering

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: Custom components with Tailwind
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **State Management**: React Hooks and Context
- **Data Fetching**: Native fetch with SWR patterns
- **Deployment**: Ready for Vercel or Netlify

## Getting Started

### Prerequisites

- Node.js 18.0.0 or later
- npm, yarn, or pnpm

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/hackerhome.git
   cd hackerhome
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn
   # or
   pnpm install
   ```

3. Create a `.env.local` file in the root directory with the following variables:
   ```
   # API Keys (optional)
   GITHUB_API_KEY=your_github_api_key

   # Feature Flags
   NEXT_PUBLIC_ENABLE_ADVANCED_MODE=true
   NEXT_PUBLIC_ENABLE_ANALYTICS=false

   # Other Configuration
   NEXT_PUBLIC_API_CACHE_DURATION=300
   ```

4. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Project Structure

```
src/
├── app/                  # App Router pages and layouts
├── components/           # Reusable components
│   ├── ui/               # UI components
│   ├── layout/           # Layout components
│   ├── cards/            # Card components for different sources
│   └── animations/       # Framer Motion animations
├── lib/                  # Utility functions and helpers
│   ├── api/              # API integration clients
│   ├── hooks/            # Custom React hooks
│   ├── services/         # Business logic services
│   └── utils/            # Utility functions
├── styles/               # Global styles
└── types/                # TypeScript type definitions
```

## API Integration

HackerHome integrates with the following APIs:

- [Hacker News API](https://github.com/HackerNews/API)
- [DEV.to API](https://developers.forem.com/api)
- [GitHub API](https://docs.github.com/en/rest)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Next.js Team](https://nextjs.org/)
- [Tailwind CSS Team](https://tailwindcss.com/)
- [Framer Motion Team](https://www.framer.com/motion/)
- All the amazing content creators in the tech community