/**
 * ClassName merger utility (combines clsx and tailwind-merge functionality)
 *
 * This utility helps merge Tailwind CSS classes efficiently by:
 * 1. Combining multiple class strings/objects
 * 2. Resolving conflicts (e.g., "px-2 px-4" becomes "px-4")
 * 3. Removing duplicate classes
 */

type ClassValue =
  | string
  | number
  | boolean
  | undefined
  | null
  | ClassValue[]
  | Record<string, boolean | undefined | null>;

/**
 * Simple clsx-like implementation
 */
function clsx(...inputs: ClassValue[]): string {
  const classes: string[] = [];

  for (const input of inputs) {
    if (!input) continue;

    if (typeof input === 'string') {
      classes.push(input);
    } else if (typeof input === 'number') {
      classes.push(String(input));
    } else if (Array.isArray(input)) {
      const result = clsx(...input);
      if (result) classes.push(result);
    } else if (typeof input === 'object') {
      for (const [key, value] of Object.entries(input)) {
        if (value) classes.push(key);
      }
    }
  }

  return classes.join(' ');
}

/**
 * Simple tailwind-merge implementation
 * Resolves Tailwind CSS class conflicts
 */
function twMerge(classString: string): string {
  const classes = classString.split(' ').filter(Boolean);
  const classMap = new Map<string, string>();

  // Tailwind class prefixes that can conflict
  const prefixes = [
    // Spacing
    'p-', 'px-', 'py-', 'pt-', 'pr-', 'pb-', 'pl-',
    'm-', 'mx-', 'my-', 'mt-', 'mr-', 'mb-', 'ml-',
    'space-x-', 'space-y-',
    // Sizing
    'w-', 'h-', 'min-w-', 'min-h-', 'max-w-', 'max-h-',
    // Typography
    'text-', 'font-', 'leading-', 'tracking-', 'text-',
    // Colors
    'bg-', 'text-', 'border-', 'ring-',
    // Border
    'border-', 'rounded-',
    // Flexbox
    'flex-', 'justify-', 'items-', 'content-', 'self-',
    'gap-', 'order-',
    // Grid
    'grid-cols-', 'grid-rows-', 'col-span-', 'row-span-',
    // Position
    'top-', 'right-', 'bottom-', 'left-', 'inset-',
    'z-',
    // Display
    'opacity-', 'overflow-',
    // Effects
    'shadow-', 'blur-',
  ];

  for (const className of classes) {
    // Find matching prefix
    let prefix = '';
    for (const p of prefixes) {
      if (className.startsWith(p)) {
        prefix = p;
        break;
      }
    }

    if (prefix) {
      // Override previous class with same prefix
      classMap.set(prefix, className);
    } else {
      // No prefix match, keep the class
      classMap.set(className, className);
    }
  }

  return Array.from(classMap.values()).join(' ');
}

/**
 * Merge class names with Tailwind CSS conflict resolution
 *
 * @example
 * cn('px-2 py-1', 'px-4') // => 'py-1 px-4'
 * cn('text-red-500', { 'text-blue-500': true }) // => 'text-blue-500'
 * cn('p-4', null, undefined, 'mt-2') // => 'p-4 mt-2'
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(...inputs));
}

/**
 * Conditional class name helper
 *
 * @example
 * cva('base-class', {
 *   variants: {
 *     color: {
 *       primary: 'bg-blue-500',
 *       secondary: 'bg-gray-500',
 *     },
 *     size: {
 *       sm: 'text-sm',
 *       lg: 'text-lg',
 *     }
 *   }
 * })
 */
export function cva(base: ClassValue, config?: {
  variants?: Record<string, Record<string, ClassValue>>;
  defaultVariants?: Record<string, string>;
}) {
  return (props?: Record<string, string | boolean | undefined>) => {
    const classes: ClassValue[] = [base];

    if (config?.variants && props) {
      for (const [variantKey, variantValue] of Object.entries(props)) {
        if (typeof variantValue === 'string' && config.variants[variantKey]) {
          classes.push(config.variants[variantKey][variantValue]);
        }
      }
    }

    if (config?.defaultVariants && !props) {
      for (const [variantKey, variantValue] of Object.entries(config.defaultVariants)) {
        if (config.variants?.[variantKey]) {
          classes.push(config.variants[variantKey][variantValue]);
        }
      }
    }

    return cn(...classes);
  };
}

export default cn;
