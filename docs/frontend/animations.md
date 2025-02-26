# Animation Guide

This document outlines the animation strategy for the HackerHome application using Framer Motion. It covers animation principles, reusable components, and implementation patterns.

## Animation Philosophy

HackerHome uses animations to:

1. **Enhance User Experience**: Provide visual feedback and guide user attention
2. **Improve Perceived Performance**: Make loading and transitions feel smoother
3. **Create Visual Hierarchy**: Emphasize important elements and relationships
4. **Express Brand Identity**: Reinforce the application's modern, tech-focused identity

All animations should be:
- **Purposeful**: Serve a clear function, not just decorative
- **Subtle**: Enhance rather than distract from content
- **Performant**: Maintain 60fps and not cause layout shifts
- **Accessible**: Respect user preferences for reduced motion

## Framer Motion Setup

### Installation

```bash
npm install framer-motion
# or
yarn add framer-motion
# or
pnpm add framer-motion
```

### Client Component Wrapper

Since Next.js uses React Server Components by default, create a client component wrapper:

```tsx
// src/components/animations/motion.tsx
'use client'

import { motion, AnimatePresence } from 'framer-motion'
export { motion, AnimatePresence }
```

## Animation Components

### FadeIn

A component for fade-in animations:

```tsx
// src/components/animations/fade-in.tsx
'use client'

import React from 'react'
import { motion } from '@/components/animations/motion'
import { useReducedMotion } from 'framer-motion'

interface FadeInProps {
  children: React.ReactNode
  delay?: number
  duration?: number
  className?: string
}

export function FadeIn({
  children,
  delay = 0,
  duration = 0.5,
  className,
}: FadeInProps) {
  const shouldReduceMotion = useReducedMotion()
  
  const variants = {
    hidden: { 
      opacity: 0 
    },
    visible: { 
      opacity: 1,
      transition: {
        duration: shouldReduceMotion ? 0 : duration,
        delay: shouldReduceMotion ? 0 : delay,
        ease: 'easeOut'
      }
    }
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={variants}
      className={className}
    >
      {children}
    </motion.div>
  )
}
```

### SlideIn

A component for slide-in animations:

```tsx
// src/components/animations/slide-in.tsx
'use client'

import React from 'react'
import { motion } from '@/components/animations/motion'
import { useReducedMotion } from 'framer-motion'

interface SlideInProps {
  children: React.ReactNode
  direction?: 'left' | 'right' | 'up' | 'down'
  delay?: number
  duration?: number
  distance?: number
  className?: string
}

export function SlideIn({
  children,
  direction = 'up',
  delay = 0,
  duration = 0.5,
  distance = 20,
  className,
}: SlideInProps) {
  const shouldReduceMotion = useReducedMotion()
  
  const getInitialPosition = () => {
    if (shouldReduceMotion) return {}
    
    switch (direction) {
      case 'left': return { x: -distance }
      case 'right': return { x: distance }
      case 'up': return { y: -distance }
      case 'down': return { y: distance }
      default: return { y: -distance }
    }
  }
  
  const variants = {
    hidden: { 
      opacity: 0,
      ...getInitialPosition()
    },
    visible: { 
      opacity: 1,
      x: 0,
      y: 0,
      transition: {
        duration: shouldReduceMotion ? 0 : duration,
        delay: shouldReduceMotion ? 0 : delay,
        ease: 'easeOut'
      }
    }
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={variants}
      className={className}
    >
      {children}
    </motion.div>
  )
}
```

### AnimatedList

A component for staggered list animations:

```tsx
// src/components/animations/animated-list.tsx
'use client'

import React from 'react'
import { motion } from '@/components/animations/motion'
import { useReducedMotion } from 'framer-motion'

interface AnimatedListProps {
  children: React.ReactNode[]
  staggerDelay?: number
  duration?: number
  className?: string
}

export function AnimatedList({
  children,
  staggerDelay = 0.1,
  duration = 0.5,
  className,
}: AnimatedListProps) {
  const shouldReduceMotion = useReducedMotion()
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : staggerDelay
      }
    }
  }
  
  const itemVariants = {
    hidden: { 
      opacity: 0,
      y: shouldReduceMotion ? 0 : 10
    },
    visible: { 
      opacity: 1,
      y: 0,
      transition: {
        duration: shouldReduceMotion ? 0 : duration,
        ease: 'easeOut'
      }
    }
  }

  return (
    <motion.ul
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className={className}
    >
      {React.Children.map(children, (child, index) => (
        <motion.li key={index} variants={itemVariants}>
          {child}
        </motion.li>
      ))}
    </motion.ul>
  )
}
```

### ScaleOnHover

A component for scale-on-hover animations:

```tsx
// src/components/animations/scale-on-hover.tsx
'use client'

import React from 'react'
import { motion } from '@/components/animations/motion'
import { useReducedMotion } from 'framer-motion'

interface ScaleOnHoverProps {
  children: React.ReactNode
  scale?: number
  duration?: number
  className?: string
}

export function ScaleOnHover({
  children,
  scale = 1.05,
  duration = 0.2,
  className,
}: ScaleOnHoverProps) {
  const shouldReduceMotion = useReducedMotion()
  
  return (
    <motion.div
      whileHover={shouldReduceMotion ? {} : { scale }}
      transition={{ duration }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
```

## Page Transitions

### Page Transition Wrapper

A component for page transitions:

```tsx
// src/components/animations/page-transition.tsx
'use client'

import React from 'react'
import { motion, AnimatePresence } from '@/components/animations/motion'
import { useReducedMotion } from 'framer-motion'
import { usePathname } from 'next/navigation'

interface PageTransitionProps {
  children: React.ReactNode
}

export function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname()
  const shouldReduceMotion = useReducedMotion()
  
  const variants = {
    hidden: { 
      opacity: 0,
      y: shouldReduceMotion ? 0 : 20
    },
    visible: { 
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: 'easeOut'
      }
    },
    exit: { 
      opacity: 0,
      transition: {
        duration: 0.2,
        ease: 'easeIn'
      }
    }
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={variants}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
```

## Animation Patterns

### Loading Skeletons

Animated loading skeletons for content:

```tsx
// src/components/ui/skeleton.tsx
'use client'

import { cn } from '@/lib/utils'
import { motion } from '@/components/animations/motion'

interface SkeletonProps {
  className?: string
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <motion.div
      className={cn('rounded-md bg-muted', className)}
      animate={{
        opacity: [0.5, 0.8, 0.5],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  )
}
```

### Infinite Scroll Animation

Animation for loading more content:

```tsx
// src/components/features/infinite-scroll-loader.tsx
'use client'

import { motion } from '@/components/animations/motion'

export function InfiniteScrollLoader() {
  return (
    <div className="flex justify-center py-4">
      <motion.div
        className="flex space-x-1"
        animate={{
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 1,
          repeat: Infinity,
        }}
      >
        <div className="h-2 w-2 rounded-full bg-primary" />
        <div className="h-2 w-2 rounded-full bg-primary" />
        <div className="h-2 w-2 rounded-full bg-primary" />
      </motion.div>
    </div>
  )
}
```

### Card Hover Animation

Animation for card hover effects:

```tsx
// src/components/cards/animated-card.tsx
'use client'

import { motion } from '@/components/animations/motion'
import { useReducedMotion } from 'framer-motion'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'

interface AnimatedCardProps {
  children: React.ReactNode
  className?: string
}

export function AnimatedCard({ children, className }: AnimatedCardProps) {
  const shouldReduceMotion = useReducedMotion()
  
  return (
    <motion.div
      whileHover={
        shouldReduceMotion 
          ? {} 
          : { 
              y: -5,
              transition: { duration: 0.2 }
            }
      }
      className={className}
    >
      <Card className="h-full transition-colors hover:bg-accent/5">
        {children}
      </Card>
    </motion.div>
  )
}

// Usage remains the same as regular Card
export { CardContent, CardFooter, CardHeader }
```

## Animation Hooks

### useAnimationControls

A hook for controlling animations:

```tsx
// src/lib/hooks/use-animation-controls.tsx
'use client'

import { useEffect } from 'react'
import { useAnimate } from 'framer-motion'
import { useReducedMotion } from 'framer-motion'

export function useAnimationControls(shouldAnimate: boolean) {
  const [scope, animate] = useAnimate()
  const shouldReduceMotion = useReducedMotion()
  
  useEffect(() => {
    if (shouldReduceMotion) return
    
    if (shouldAnimate) {
      animate(
        scope.current,
        { opacity: [0, 1], y: [20, 0] },
        { duration: 0.5, ease: 'easeOut' }
      )
    }
  }, [shouldAnimate, animate, scope, shouldReduceMotion])
  
  return scope
}
```

### useScrollAnimation

A hook for scroll-triggered animations:

```tsx
// src/lib/hooks/use-scroll-animation.tsx
'use client'

import { useEffect, useRef } from 'react'
import { useInView, useAnimation, useReducedMotion } from 'framer-motion'

export function useScrollAnimation(threshold = 0.1) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, threshold })
  const controls = useAnimation()
  const shouldReduceMotion = useReducedMotion()
  
  useEffect(() => {
    if (isInView && !shouldReduceMotion) {
      controls.start('visible')
    }
  }, [isInView, controls, shouldReduceMotion])
  
  return { ref, controls, variants: {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: 'easeOut'
      }
    }
  }}
}
```

## Implementation Examples

### Animated News Card

```tsx
// src/components/cards/news-card.tsx
'use client'

import { motion } from '@/components/animations/motion'
import { useReducedMotion } from 'framer-motion'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

interface NewsCardProps {
  title: string
  source: string
  url: string
  points: number
  commentCount: number
  timestamp: string
  mode: 'simple' | 'advanced'
}

export function NewsCard({
  title,
  source,
  url,
  points,
  commentCount,
  timestamp,
  mode,
}: NewsCardProps) {
  const shouldReduceMotion = useReducedMotion()
  
  return (
    <motion.div
      whileHover={
        shouldReduceMotion 
          ? {} 
          : { 
              y: -5,
              transition: { duration: 0.2 }
            }
      }
    >
      <Card mode={mode} className="h-full transition-colors hover:bg-accent/5">
        <CardHeader mode={mode}>
          <CardTitle className={mode === 'simple' ? 'text-sm' : 'text-base'}>
            <a href={url} target="_blank" rel="noopener noreferrer">
              {title}
            </a>
          </CardTitle>
        </CardHeader>
        {mode === 'advanced' && (
          <CardContent>
            {/* Additional content for advanced mode */}
          </CardContent>
        )}
        <CardFooter mode={mode} className={mode === 'simple' ? 'text-xs' : 'text-sm'}>
          <div className="flex items-center gap-2">
            <span>{source}</span>
            <span>•</span>
            <span>{points} points</span>
            <span>•</span>
            <span>{commentCount} comments</span>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  )
}
```

### Animated Page Layout

```tsx
// src/app/layout.tsx
import { PageTransition } from '@/components/animations/page-transition'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <PageTransition>
          {children}
        </PageTransition>
      </body>
    </html>
  )
}
```

### Animated Feed

```tsx
// src/components/features/news-feed.tsx
'use client'

import { AnimatedList } from '@/components/animations/animated-list'
import { NewsCard } from '@/components/cards/news-card'
import { InfiniteScrollLoader } from '@/components/features/infinite-scroll-loader'
import { useInfiniteScroll } from '@/lib/hooks/use-infinite-scroll'

interface NewsFeedProps {
  initialItems: NewsItem[]
  mode: 'simple' | 'advanced'
}

export function NewsFeed({ initialItems, mode }: NewsFeedProps) {
  const { items, isLoading, loadMore, hasMore } = useInfiniteScroll(initialItems)
  
  return (
    <div className="space-y-6">
      <AnimatedList staggerDelay={0.05} className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <NewsCard
            key={item.id}
            title={item.title}
            source={item.source}
            url={item.url}
            points={item.points}
            commentCount={item.commentCount}
            timestamp={item.timestamp}
            mode={mode}
          />
        ))}
      </AnimatedList>
      
      {isLoading && <InfiniteScrollLoader />}
      
      {hasMore && !isLoading && (
        <button
          onClick={loadMore}
          className="mx-auto block rounded-md bg-primary px-4 py-2 text-primary-foreground"
        >
          Load More
        </button>
      )}
    </div>
  )
}
```

## Performance Optimization

### Animation Performance Tips

1. **Animate Cheap Properties**: Prefer animating `opacity` and `transform` properties
2. **Use `will-change`**: Add `will-change` for complex animations
3. **Avoid Layout Thrashing**: Don't animate properties that cause layout recalculation
4. **Use Hardware Acceleration**: Use `transform: translateZ(0)` for hardware acceleration
5. **Debounce Event Handlers**: Debounce scroll and resize handlers
6. **Lazy Load Animations**: Only animate components when they're in view

### Reduced Motion Support

Always respect user preferences for reduced motion:

```tsx
import { useReducedMotion } from 'framer-motion'

function MyAnimatedComponent() {
  const shouldReduceMotion = useReducedMotion()
  
  // Use shouldReduceMotion to conditionally apply animations
  return (
    <motion.div
      animate={
        shouldReduceMotion
          ? { opacity: 1 }
          : { opacity: 1, y: 0 }
      }
      initial={
        shouldReduceMotion
          ? { opacity: 0 }
          : { opacity: 0, y: 20 }
      }
    >
      Content
    </motion.div>
  )
}
```

## Animation Guidelines

### When to Use Animations

- **Page Transitions**: Smooth transitions between pages
- **Loading States**: Indicate loading and progress
- **User Interactions**: Provide feedback for user actions
- **Content Changes**: Animate content additions or removals
- **Attention Direction**: Guide user focus to important elements

### When to Avoid Animations

- **Critical UI Elements**: Don't animate elements that users need to access quickly
- **High-Frequency Updates**: Avoid animating elements that update frequently
- **Large Elements**: Be cautious when animating large portions of the screen
- **Text Content**: Avoid animating text that users are trying to read

### Animation Timing Guidelines

- **Very Fast (0.1s-0.2s)**: Micro-interactions, button clicks
- **Fast (0.2s-0.3s)**: Hover effects, small UI changes
- **Medium (0.3s-0.5s)**: Page transitions, content reveals
- **Slow (0.5s-1s)**: Complex animations, emphasis effects

## Accessibility Considerations

### Respecting User Preferences

Always check for reduced motion preferences:

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

### Animation Focus Management

Ensure focus is properly managed during animations:

```tsx
import { useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

function AnimatedModal({ isOpen, onClose, children }) {
  const modalRef = useRef(null)
  
  useEffect(() => {
    if (isOpen) {
      // Focus the modal when it opens
      modalRef.current?.focus()
    }
  }, [isOpen])
  
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={modalRef}
          tabIndex={-1}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
        >
          {children}
          <button onClick={onClose}>Close</button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}