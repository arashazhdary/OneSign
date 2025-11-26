/**
 * Test IDs from DatabaseSeeder.cs
 * These IDs are seeded in the database and should be used instead of hardcoded invalid IDs
 * 
 * Source: src/Onesign.Api/Data/DatabaseSeeder.cs
 */
export const TEST_IDS = {
  // Tenant
  TENANT_ID: '11111111-1111-1111-1111-111111111111',
  
  // Users
  GLOBAL_USER_ID: '22222222-2222-2222-2222-222222222222',
  TENANT_USER_ID: '33333333-3333-3333-3333-333333333333',
  ADMIN_USER_ID: '44444444-4444-4444-4444-444444444444',
  
  // Organization
  ORG_UNIT_ID: '66666666-6666-6666-6666-666666666666',
  
  // Applications
  APPLICATION_ID: '77777777-7777-7777-7777-777777777777',
  
  // Service Accounts
  SERVICE_ACCOUNT_ID: '88888888-8888-8888-8888-888888888888',
  
  // API Keys
  API_KEY_ID: '99999999-9999-9999-9999-999999999999',
  
  // Plans
  PLAN_ID: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  
  // Access Packages
  ACCESS_PACKAGE_ID: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  
  // Region
  REGION_ID: 'default-region',
} as const;

/**
 * Default tenant ID to use when no tenant is selected
 * This is the TestTenantId from DatabaseSeeder
 */
export const DEFAULT_TENANT_ID = TEST_IDS.TENANT_ID;

/**
 * Default user ID to use for testing
 */
export const DEFAULT_USER_ID = TEST_IDS.TENANT_USER_ID;

/**
 * Default admin user ID
 */
export const DEFAULT_ADMIN_USER_ID = TEST_IDS.ADMIN_USER_ID;

