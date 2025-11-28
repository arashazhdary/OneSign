# UI Components Library

Reusable components for OneSign Landing Page.

## Components

### Button

Flexible button component with multiple variants and sizes.

```tsx
import { Button } from '@/app/components/ui';

// Primary button
<Button variant="primary" size="md">
  Click me
</Button>

// Loading state
<Button loading>Processing...</Button>

// Disabled
<Button disabled>Disabled</Button>

// All variants
<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>

// All sizes
<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>
```

**Props:**
- `variant`: 'primary' | 'secondary' | 'outline' | 'ghost'
- `size`: 'sm' | 'md' | 'lg'
- `loading`: boolean
- All standard button HTML attributes

### Card

Container component with flexible layout.

```tsx
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/app/components/ui';

<Card padding="md" shadow="lg" hover>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
  </CardHeader>
  <CardContent>
    Card content goes here
  </CardContent>
  <CardFooter>
    Footer content
  </CardFooter>
</Card>
```

**Props:**
- `padding`: 'none' | 'sm' | 'md' | 'lg'
- `shadow`: 'none' | 'sm' | 'md' | 'lg'
- `hover`: boolean

### Badge

Status and label component.

```tsx
import { Badge } from '@/app/components/ui';

<Badge variant="success">Active</Badge>
<Badge variant="warning">Pending</Badge>
<Badge variant="error">Error</Badge>
<Badge variant="info">Info</Badge>
```

**Props:**
- `variant`: 'default' | 'success' | 'warning' | 'error' | 'info'
- `size`: 'sm' | 'md' | 'lg'

### Skeleton

Loading placeholders.

```tsx
import { Skeleton, SkeletonText, SkeletonCard } from '@/app/components/ui';

// Basic skeleton
<Skeleton width={200} height={20} />

// Text skeleton
<SkeletonText lines={3} />

// Card skeleton
<SkeletonCard />
```

## Hooks

### useScrollPosition

Track scroll position.

```tsx
import { useScrollPosition, useScrollDirection } from '@/app/hooks/useScrollPosition';

const { x, y } = useScrollPosition();
const direction = useScrollDirection(); // 'up' | 'down' | null
```

### useMediaQuery

Responsive design hooks.

```tsx
import { useMediaQuery, useIsMobile, useIsTablet, useIsDesktop } from '@/app/hooks/useMediaQuery';

const isMobile = useIsMobile();
const isTablet = useIsTablet();
const isDesktop = useIsDesktop();
const customQuery = useMediaQuery('(min-width: 1200px)');
```

## Utilities

### Class Names

```tsx
import { cn } from '@/app/lib/utils';

const className = cn(
  'base-class',
  condition && 'conditional-class',
  'another-class'
);
```

### Formatters

```tsx
import { formatDate, formatNumber, formatCurrency } from '@/app/lib/utils';

formatDate(new Date(), 'en'); // "January 1, 2024"
formatNumber(1000, 'en'); // "1,000"
formatCurrency(99.99, 'USD', 'en'); // "$99.99"
```

### Validators

```tsx
import { isValidEmail, isValidUrl } from '@/app/lib/utils';

isValidEmail('test@example.com'); // true
isValidUrl('https://example.com'); // true
```

### Async Utilities

```tsx
import { debounce, throttle, sleep } from '@/app/lib/utils';

const debouncedFn = debounce(fn, 300);
const throttledFn = throttle(fn, 1000);

await sleep(1000); // Wait 1 second
```

## Error Handling

### ErrorBoundary

```tsx
import { ErrorBoundary } from '@/app/components/ErrorBoundary';

<ErrorBoundary
  fallback={<div>Custom error UI</div>}
  onError={(error, errorInfo) => {
    // Handle error
  }}
>
  <YourComponent />
</ErrorBoundary>
```

## SEO Utilities

### Generate Metadata

```tsx
import { generateMetadata, defaultSEO } from '@/app/lib/seo';

export const metadata = generateMetadata({
  title: 'Page Title',
  description: 'Page description',
  keywords: ['keyword1', 'keyword2'],
  ogImage: '/og-image.jpg',
});
```

### Structured Data

```tsx
import {
  generateOrganizationSchema,
  generateWebsiteSchema,
  generateBreadcrumbSchema
} from '@/app/lib/seo';

const schema = generateOrganizationSchema();
```

## Best Practices

### Component Composition

```tsx
// Good: Compose components
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>
    <SkeletonText lines={3} />
  </CardContent>
</Card>

// Avoid: Deeply nested JSX
```

### Hook Usage

```tsx
// Good: Use hooks at top level
function Component() {
  const isMobile = useIsMobile();
  const { y } = useScrollPosition();

  return <div>...</div>;
}

// Avoid: Conditional hooks
```

### Error Handling

```tsx
// Good: Wrap components with ErrorBoundary
<ErrorBoundary>
  <App />
</ErrorBoundary>

// Handle errors appropriately
```

## Customization

All components use Tailwind CSS and can be customized via the `className` prop:

```tsx
<Button className="custom-class">
  Custom styled button
</Button>
```

## Type Safety

All components are fully typed with TypeScript:

```tsx
import type { ButtonProps } from '@/app/components/ui';

const props: ButtonProps = {
  variant: 'primary',
  size: 'lg',
  // TypeScript will enforce correct types
};
```
