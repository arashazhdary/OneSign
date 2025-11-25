/**
 * Test Data Constants
 * ثابت‌های داده‌های تست که با بک‌اند هماهنگ هستند
 * 
 * این مقادیر باید با DatabaseSeeder در بک‌اند هماهنگ باشند
 * @see src/Onesign.Api/Data/DatabaseSeeder.cs
 */

/**
 * Test Tenant ID - شناسه تنانت تست
 * استفاده شده در: تمام API های tenant-scoped
 */
export const TEST_TENANT_ID = '11111111-1111-1111-1111-111111111111';

/**
 * Test Global User ID - شناسه کاربر جهانی تست
 */
export const TEST_GLOBAL_USER_ID = '22222222-2222-2222-2222-222222222222';

/**
 * Test Tenant User ID - شناسه کاربر تنانت تست
 */
export const TEST_TENANT_USER_ID = '33333333-3333-3333-3333-333333333333';

/**
 * Test Admin User ID - شناسه کاربر ادمین تست
 * استفاده شده در: احراز هویت و تست‌های admin
 */
export const TEST_ADMIN_USER_ID = '44444444-4444-4444-4444-444444444444';

/**
 * Test Region ID - شناسه منطقه تست
 */
export const TEST_REGION_ID = 'default-region';

/**
 * Test OrgUnit ID (Headquarters) - شناسه واحد سازمانی ستاد
 */
export const TEST_ORG_UNIT_ID = '66666666-6666-6666-6666-666666666666';

/**
 * Test Application ID - شناسه اپلیکیشن تست
 */
export const TEST_APPLICATION_ID = '77777777-7777-7777-7777-777777777777';

/**
 * Test Service Account ID - شناسه حساب سرویس تست
 */
export const TEST_SERVICE_ACCOUNT_ID = '88888888-8888-8888-8888-888888888888';

/**
 * Test API Key ID - شناسه کلید API تست
 */
export const TEST_API_KEY_ID = '99999999-9999-9999-9999-999999999999';

/**
 * Test Plan ID - شناسه پلن تست
 */
export const TEST_PLAN_ID = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

/**
 * Test Access Package ID - شناسه بسته دسترسی تست
 */
export const TEST_ACCESS_PACKAGE_ID = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';

/**
 * Default Tenant ID for fallback - شناسه پیش‌فرض تنانت
 * زمانی که context موجود نیست، از این استفاده می‌شود
 */
export const DEFAULT_TENANT_ID = TEST_TENANT_ID;

/**
 * Default User ID for fallback - شناسه پیش‌فرض کاربر
 * زمانی که کاربر لاگین نشده، از این استفاده می‌شود (فقط در development)
 */
export const DEFAULT_USER_ID = TEST_ADMIN_USER_ID;

/**
 * Test User Credentials - اطلاعات ورود کاربران تست
 */
export const TEST_USERS = {
  admin: {
    id: TEST_ADMIN_USER_ID,
    email: 'admin@test.local',
    name: 'System Administrator',
    role: 'Admin'
  },
  user: {
    id: TEST_TENANT_USER_ID,
    email: 'user@test.local',
    name: 'Test User',
    role: 'User'
  }
} as const;

/**
 * Check if we're in development mode
 */
export const isDevelopment = process.env.NODE_ENV === 'development';

/**
 * Get fallback tenant ID based on environment
 * در production از این استفاده نمی‌شود
 */
export function getFallbackTenantId(): string {
  if (isDevelopment) {
    return DEFAULT_TENANT_ID;
  }
  // In production, throw error if no tenant context
  throw new Error('No tenant context available');
}

/**
 * Get fallback user ID based on environment
 * در production از این استفاده نمی‌شود
 */
export function getFallbackUserId(): string {
  if (isDevelopment) {
    return DEFAULT_USER_ID;
  }
  // In production, throw error if no user context
  throw new Error('No user context available');
}

