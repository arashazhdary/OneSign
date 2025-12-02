const fs = require('fs');
const backupEn = JSON.parse(fs.readFileSync('src/i18n/locales/en.json.backup', 'utf8'));
const backupFa = JSON.parse(fs.readFileSync('src/i18n/locales/fa.json.backup', 'utf8'));

// Create the three-tier structure: common, tenant, global
const translations = {
  en: {
    common: {},
    tenant: {},
    global: {}
  },
  fa: {
    common: {},
    tenant: {},
    global: {}
  }
};

// Categorization logic
function categorizeKey(key) {
  // Common keys - shared across all contexts
  if (key.startsWith('common.') || [
    'add', 'edit', 'delete', 'save', 'cancel', 'create', 'update', 'submit', 'close', 'back', 'next', 'previous', 'finish', 'done',
    'active', 'inactive', 'enabled', 'disabled', 'pending', 'approved', 'rejected', 'suspended', 'expired', 'verified', 'unverified',
    'loading', 'search', 'filter', 'sort', 'export', 'import', 'refresh', 'actions', 'status', 'name', 'description', 'type', 'category',
    'date', 'time', 'createdAt', 'updatedAt', 'lastLogin', 'email', 'phone', 'password', 'dashboard', 'settings', 'profile', 'logout',
    'success', 'error', 'warning', 'info', 'noData', 'noResults', 'confirm', 'yes', 'no', 'user', 'admin', 'role', 'group', 'organization',
    'application', 'permission', 'policy', 'security', 'audit', 'compliance', 'integration', 'webhook', 'api', 'token', 'key', 'certificate',
    'backup', 'restore', 'sync', 'connect', 'disconnect', 'configure', 'test', 'validate', 'verify', 'authenticate', 'authorize'
  ].includes(key)) {
    return 'common';
  }

  // Tenant-specific keys (organization level)
  if (key.includes('tenant') || key.includes('user') || key.includes('app') || key.includes('role') || key.includes('audit') ||
      key.includes('certificate') || key.includes('backup') || key.includes('alert') || key.includes('analytic') ||
      key.includes('webhook') || key.includes('apiKey') || key.includes('serviceAccount') || key.includes('accessRequest') ||
      key.includes('privilegedAccess') || key.includes('conditionalAccess') || key.includes('federation') || key.includes('domain') ||
      key.includes('mfa') || key.includes('security') || key.includes('session') || key.includes('password') || key.includes('account')) {
    return 'tenant';
  }

  // Global/admin keys (platform level)
  if (key.includes('global') || key.includes('admin') || key.includes('platform') || key.includes('billing') || key.includes('tenants') ||
      key.includes('system') || key.includes('infrastructure') || key.includes('maintenance') || key.includes('deployment') ||
      key.includes('monitoring') || key.includes('notification') || key.includes('report') || key.includes('export') ||
      key.includes('import') || key.includes('automation') || key.includes('workflow') || key.includes('governance')) {
    return 'global';
  }

  // Default to common for uncategorized keys
  return 'common';
}

// Process backup files and categorize
function processBackup(obj, category = null) {
  for (const key in obj) {
    let targetCategory = category;

    if (!targetCategory) {
      targetCategory = categorizeKey(key);
    }

    if (typeof obj[key] === 'string') {
      // Add to appropriate category
      let enTarget = translations.en[targetCategory];
      let faTarget = translations.fa[targetCategory];

      if (!enTarget[key]) enTarget[key] = obj[key];
      if (!faTarget[key]) faTarget[key] = backupFa[key] || obj[key];
    } else if (typeof obj[key] === 'object') {
      // Recursively process nested objects
      if (!translations.en[targetCategory][key]) {
        translations.en[targetCategory][key] = {};
        translations.fa[targetCategory][key] = {};
      }
      processBackup(obj[key], targetCategory);
    }
  }
}

// Process the backup
processBackup(backupEn);

// Save the categorized translation files
fs.writeFileSync('src/i18n/locales/en.json', JSON.stringify(translations.en, null, 2));
fs.writeFileSync('src/i18n/locales/fa.json', JSON.stringify(translations.fa, null, 2));

console.log('Translation files reorganized into common/tenant/global structure');
console.log('Common keys:', Object.keys(translations.en.common).length);
console.log('Tenant keys:', Object.keys(translations.en.tenant).length);
console.log('Global keys:', Object.keys(translations.en.global).length);
