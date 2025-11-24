/**
 * API Configuration
 * تنظیمات مرکزی برای تمام API endpoints
 * 
 * این فایل تمام آدرس‌های پایه API را مدیریت می‌کند
 * و از یک مکان واحد برای کل پروژه استفاده می‌شود
 */

/**
 * Get API base URL for services
 * در مرورگر از proxy استفاده می‌کند، در سرور از URL کامل
 */
const getServicesBaseUrl = (): string => {
  // Check if we're in the browser
  if (typeof window !== 'undefined') {
    // Use relative URL to proxy through Next.js
    return process.env.NEXT_PUBLIC_API_SERVICES_BASE_URL || '/api-proxy';
  }
  
  // Server-side: use full URL from environment
  return (
    process.env.API_SERVICES_BASE_URL || 
    process.env.NEXT_PUBLIC_API_SERVICES_BASE_URL || 
    process.env.API_BASE_URL || 
    'http://localhost:9091'
  );
};

/**
 * Get API base URL for authentication
 * در مرورگر از proxy استفاده می‌کند، در سرور از URL کامل
 */
const getAuthBaseUrl = (): string => {
  // Check if we're in the browser
  if (typeof window !== 'undefined') {
    // Use relative URL to proxy through Next.js
    return process.env.NEXT_PUBLIC_API_AUTH_BASE_URL || '/api-proxy';
  }
  
  // Server-side: use full URL from environment
  return (
    process.env.API_AUTH_BASE_URL || 
    process.env.NEXT_PUBLIC_API_AUTH_BASE_URL || 
    process.env.API_BASE_URL || 
    'http://localhost:9091'
  );
};

/**
 * API Configuration Object
 * این آبجکت شامل تمام تنظیمات API است
 */
export const apiConfig = {
  /**
   * Base URL for all services (users, applications, etc.)
   * آدرس پایه برای تمام سرویس‌ها
   */
  servicesBaseUrl: getServicesBaseUrl(),
  
  /**
   * Base URL for authentication endpoints
   * آدرس پایه برای endpoint های احراز هویت
   */
  authBaseUrl: getAuthBaseUrl(),
  
  /**
   * Request timeout in milliseconds
   * زمان انتظار برای درخواست‌ها (میلی‌ثانیه)
   */
  timeout: 30000,
  
  /**
   * Default headers for all requests
   * هدرهای پیش‌فرض برای تمام درخواست‌ها
   */
  defaultHeaders: {
    'Content-Type': 'application/json',
  },
} as const;

/**
 * Helper function to get full API URL for services
 * تابع کمکی برای دریافت URL کامل سرویس‌ها
 */
export const getServicesApiUrl = (path: string): string => {
  const baseUrl = apiConfig.servicesBaseUrl.endsWith('/')
    ? apiConfig.servicesBaseUrl.slice(0, -1)
    : apiConfig.servicesBaseUrl;
  
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
};

/**
 * Helper function to get full API URL for auth
 * تابع کمکی برای دریافت URL کامل احراز هویت
 */
export const getAuthApiUrl = (path: string): string => {
  const baseUrl = apiConfig.authBaseUrl.endsWith('/')
    ? apiConfig.authBaseUrl.slice(0, -1)
    : apiConfig.authBaseUrl;
  
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
};

/**
 * Export default API base URL (for backward compatibility)
 * صادر کردن آدرس پایه پیش‌فرض (برای سازگاری با کدهای قدیمی)
 */
export const API_BASE = apiConfig.servicesBaseUrl;

