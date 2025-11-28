// Main components
export { Header } from './Header';
export { Hero } from './Hero';
export { Footer } from './Footer';

// Feature components
export { Newsletter } from './Newsletter';
export { FAQ } from './FAQ';
export { Testimonials } from './Testimonials';
export { ContactForm } from './ContactForm';

// UI components
export * from './ui';

// Utility components
export { BackToTop } from './BackToTop';
export { ProgressBar } from './ProgressBar';
export { ToastContainer } from './Toast';
export { CookieConsent } from './CookieConsent';
export {
  TextSkeleton,
  CardSkeleton,
  TableSkeleton,
  AvatarSkeleton,
  ButtonSkeleton,
  Spinner,
  PageLoader,
  ContentLoader,
  InlineLoader
} from './Loading';

// Feature gates and providers
export { FeatureGate } from './FeatureGate';
export { ThemeProvider } from './ThemeProvider';
export { ThemeToggle } from './ThemeToggle';

// Analytics
export { Analytics } from './Analytics';

// Error handling
export { ErrorBoundary } from './ErrorBoundary';

// Animations
export * from './animations';

// Advanced Features
export { GoogleAnalytics, analytics, trackEvent, trackPageView } from './GoogleAnalytics';
export { WebVitals, useWebVitalsMonitoring, WebVitalsDisplay } from './WebVitals';
export { Search } from './Search';
export { LiveChat, useLiveChat } from './LiveChat';
export { TestimonialSubmission } from './TestimonialSubmission';
export { CurrencySelector } from './CurrencySelector';

// Image Optimization
export {
  OptimizedImage,
  ResponsiveImage,
  AvatarImage,
  LogoImage
} from './OptimizedImage';

// Lazy Loading
export {
  LazyLoad,
  LazyImage,
  LazySection,
  LazyIframe,
  lazyLoadComponent,
  withLazyLoading,
  preloadComponent,
  useLazyLoad
} from './LazyLoad';
