const fs = require('fs');
const path = require('path');

// Function to recursively read all files in a directory
function readAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);

  files.forEach(file => {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (!file.startsWith('.') && file !== 'node_modules') {
        arrayOfFiles = readAllFiles(fullPath, arrayOfFiles);
      }
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      arrayOfFiles.push(fullPath);
    }
  });

  return arrayOfFiles;
}

// Extract translation keys from file content
function extractTranslationKeys(content) {
  const keys = new Set();

  // Match t('key') or t("key") patterns
  const regex = /t\(['"]([^'"]+)['"]/g;
  let match;

  while ((match = regex.exec(content)) !== null) {
    keys.add(match[1]);
  }

  return keys;
}

// Categorize keys based on their structure
function categorizeKey(key) {
  if (key.startsWith('common.')) return 'common';
  if (key.startsWith('tenant.')) return 'tenant';
  if (key.startsWith('global.')) return 'global';
  return 'common'; // default
}

function extractKeyName(fullKey) {
  const parts = fullKey.split('.');
  return parts[parts.length - 1];
}

// Main function to extract and create comprehensive translations
function createComprehensiveTranslations() {
  console.log('🔍 استخراج کلیدهای ترجمه از کد...');

  const srcPath = path.join(__dirname, 'src');
  const files = readAllFiles(srcPath);

  console.log(`📁 تعداد فایل‌های بررسی شده: ${files.length}`);

  const allKeys = new Set();

  files.forEach(file => {
    try {
      const content = fs.readFileSync(file, 'utf8');
      const fileKeys = extractTranslationKeys(content);
      fileKeys.forEach(key => allKeys.add(key));
    } catch (error) {
      console.log(`⚠️ خطا در خواندن فایل ${file}: ${error.message}`);
    }
  });

  console.log(`🔑 تعداد کلیدهای منحصر به فرد یافت شده: ${allKeys.size}`);

  // Organize keys by category
  const organizedKeys = {
    common: new Set(),
    tenant: new Set(),
    global: new Set()
  };

  allKeys.forEach(key => {
    const category = categorizeKey(key);
    organizedKeys[category].add(key);
  });

  console.log('📊 توزیع کلیدها:');
  console.log(`   • Common: ${organizedKeys.common.size}`);
  console.log(`   • Tenant: ${organizedKeys.tenant.size}`);
  console.log(`   • Global: ${organizedKeys.global.size}`);

  // Create comprehensive English translations
  const enTranslations = {
    common: {},
    tenant: {},
    global: {}
  };

  // Add basic UI translations
  enTranslations.common = {
    // Basic actions
    'add': 'Add',
    'edit': 'Edit',
    'delete': 'Delete',
    'save': 'Save',
    'cancel': 'Cancel',
    'create': 'Create',
    'update': 'Update',
    'submit': 'Submit',
    'close': 'Close',
    'back': 'Back',
    'next': 'Next',
    'previous': 'Previous',
    'finish': 'Finish',
    'done': 'Done',

    // UI states
    'loading': 'Loading...',
    'success': 'Success',
    'error': 'Error',
    'warning': 'Warning',
    'info': 'Information',
    'confirm': 'Confirm',
    'yes': 'Yes',
    'no': 'No',

    // Common terms
    'name': 'Name',
    'title': 'Title',
    'description': 'Description',
    'type': 'Type',
    'category': 'Category',
    'status': 'Status',
    'active': 'Active',
    'inactive': 'Inactive',
    'enabled': 'Enabled',
    'disabled': 'Disabled',
    'pending': 'Pending',
    'approved': 'Approved',
    'rejected': 'Rejected',
    'suspended': 'Suspended',
    'expired': 'Expired',
    'verified': 'Verified',
    'unverified': 'Unverified',
    'locked': 'Locked',
    'unlocked': 'Unlocked',

    // Navigation
    'dashboard': 'Dashboard',
    'home': 'Home',
    'settings': 'Settings',
    'profile': 'Profile',
    'account': 'Account',
    'logout': 'Logout',
    'login': 'Login',
    'menu': 'Menu',
    'sidebar': 'Sidebar',
    'header': 'Header',
    'footer': 'Footer',

    // Data display
    'search': 'Search',
    'filter': 'Filter',
    'sort': 'Sort',
    'export': 'Export',
    'import': 'Import',
    'refresh': 'Refresh',
    'actions': 'Actions',
    'details': 'Details',
    'summary': 'Summary',
    'overview': 'Overview',
    'total': 'Total',
    'count': 'Count',
    'value': 'Value',
    'amount': 'Amount',
    'price': 'Price',
    'cost': 'Cost',
    'date': 'Date',
    'time': 'Time',
    'createdAt': 'Created At',
    'updatedAt': 'Updated At',
    'lastLogin': 'Last Login',
    'lastActivity': 'Last Activity',

    // User management
    'user': 'User',
    'users': 'Users',
    'admin': 'Administrator',
    'administrator': 'Administrator',
    'administrators': 'Administrators',
    'role': 'Role',
    'roles': 'Roles',
    'group': 'Group',
    'groups': 'Groups',
    'organization': 'Organization',
    'organizations': 'Organizations',
    'tenant': 'Organization',
    'tenants': 'Organizations',

    // Application management
    'application': 'Application',
    'applications': 'Applications',
    'app': 'Application',
    'apps': 'Applications',
    'service': 'Service',
    'services': 'Services',
    'permission': 'Permission',
    'permissions': 'Permissions',
    'policy': 'Policy',
    'policies': 'Policies',

    // Security and compliance
    'security': 'Security',
    'audit': 'Audit',
    'compliance': 'Compliance',
    'risk': 'Risk',
    'threat': 'Threat',
    'vulnerability': 'Vulnerability',
    'incident': 'Incident',
    'breach': 'Breach',
    'violation': 'Violation',
    'event': 'Event',
    'log': 'Log',
    'logs': 'Logs',
    'report': 'Report',
    'reports': 'Reports',

    // Technical terms
    'api': 'API',
    'token': 'Token',
    'key': 'Key',
    'certificate': 'Certificate',
    'secret': 'Secret',
    'password': 'Password',
    'access': 'Access',
    'authentication': 'Authentication',
    'authorization': 'Authorization',

    // System messages
    'noData': 'No data available',
    'welcomeBack': 'Welcome Back',
    'happeningToday': 'Your identity management overview for today',
    'to': 'to',
    'orgUnit': 'Organization Unit',
    'adminPortal': 'Admin Portal'
  };

  // Add tenant-specific translations
  enTranslations.tenant = {
    'tenantName': 'Organization Name',
    'tenantSlug': 'Organization Slug',
    'plan': 'Plan',
    'tenantCreated': 'Organization created successfully',
    'statusUpdated': 'Status updated successfully',
    'userCreated': 'User created successfully',
    'userUpdated': 'User updated successfully',
    'userDeleted': 'User deleted successfully',
    'userSuspended': 'User suspended successfully',
    'inviteUser': 'Invite User',
    'createUser': 'Create User',
    'editUser': 'Edit User',
    'deleteUser': 'Delete User',
    'updateUser': 'Update User',
    'manageUsers': 'Manage Users',
    'assignOrgUnits': 'Assign Organization Units',
    'primaryOrgUnit': 'Primary Organization Unit',
    'secondaryOrgUnits': 'Secondary Organization Units',
    'orgUnitsAssigned': 'Organization units assigned successfully',
    'selectOrgUnit': 'Select Organization Unit',
    'userOrgUnits': 'User Organization Units',
    'orgUnits': 'Organization Units',
    'title': 'Users Management',
    'email': 'Email',
    'isAdmin': 'Is Administrator',
    'lastLogin': 'Last Login',
    'actions': 'Actions',
    'confirmDisable': 'Are you sure you want to disable this user?',
    'disable': 'Disable',
    'enable': 'Enable',
    'sendInvite': 'Send Invite',
    'invitationSent': 'Invitation sent successfully',
    'userDisabled': 'User disabled successfully',
    'userEnabled': 'User enabled successfully',
    'invited': 'Invited',
    'active': 'Active',
    'inactive': 'Inactive',
    'suspended': 'Suspended'
  };

  // Add global/platform translations
  enTranslations.global = {
    'platform': 'Platform',
    'system': 'System',
    'settings': 'Settings',
    'dashboard': 'Dashboard',
    'monitoring': 'Monitoring',
    'security': 'Security',
    'audit': 'Audit',
    'reports': 'Reports',
    'users': 'Users',
    'organizations': 'Organizations',
    'tenants': 'Organizations',
    'createTenant': 'Create Organization',
    'editTenant': 'Edit Organization',
    'deleteTenant': 'Delete Organization',
    'updateTenant': 'Update Organization',
    'suspendTenant': 'Suspend Organization',
    'activateTenant': 'Activate Organization',
    'manageTenants': 'Manage Organizations',
    'tenantManagement': 'Organization Management',
    'tenantPortal': 'Organization Portal',
    'globalAdmin': 'Global Administrator',
    'adminPortal': 'Admin Portal',
    'switchPortal': 'Switch Portal',
    'platformSettings': 'Platform Settings',
    'systemSettings': 'System Settings',
    'globalSettings': 'Global Settings',
    'platformOverview': 'Platform Overview',
    'systemHealth': 'System Health',
    'systemAlerts': 'System Alerts',
    'platformAnalytics': 'Platform Analytics',
    'globalAnalytics': 'Global Analytics'
  };

  // Create Persian translations
  const faTranslations = {
    common: {},
    tenant: {},
    global: {}
  };

  // Persian translations for common section
  Object.keys(enTranslations.common).forEach(key => {
    const enValue = enTranslations.common[key];
    faTranslations.common[key] = translateToPersian(enValue);
  });

  // Persian translations for tenant section
  Object.keys(enTranslations.tenant).forEach(key => {
    const enValue = enTranslations.tenant[key];
    faTranslations.tenant[key] = translateToPersian(enValue);
  });

  // Persian translations for global section
  Object.keys(enTranslations.global).forEach(key => {
    const enValue = enTranslations.global[key];
    faTranslations.global[key] = translateToPersian(enValue);
  });

  return { en: enTranslations, fa: faTranslations };
}

// Simple Persian translation function
function translateToPersian(english) {
  const translations = {
    // Basic actions
    'Add': 'افزودن',
    'Edit': 'ویرایش',
    'Delete': 'حذف',
    'Save': 'ذخیره',
    'Cancel': 'انصراف',
    'Create': 'ایجاد',
    'Update': 'به‌روزرسانی',
    'Submit': 'ارسال',
    'Close': 'بستن',
    'Back': 'بازگشت',
    'Next': 'بعدی',
    'Previous': 'قبلی',
    'Finish': 'پایان',
    'Done': 'انجام شد',

    // UI states
    'Loading...': 'در حال بارگذاری...',
    'Success': 'موفقیت',
    'Error': 'خطا',
    'Warning': 'هشدار',
    'Information': 'اطلاعات',
    'Confirm': 'تأیید',
    'Yes': 'بله',
    'No': 'خیر',

    // Common terms
    'Name': 'نام',
    'Title': 'عنوان',
    'Description': 'توضیحات',
    'Type': 'نوع',
    'Category': 'دسته‌بندی',
    'Status': 'وضعیت',
    'Active': 'فعال',
    'Inactive': 'غیرفعال',
    'Enabled': 'فعال شده',
    'Disabled': 'غیرفعال شده',
    'Pending': 'در انتظار',
    'Approved': 'تأیید شده',
    'Rejected': 'رد شده',
    'Suspended': 'معلق شده',
    'Expired': 'منقضی شده',
    'Verified': 'تأیید شده',
    'Unverified': 'تأیید نشده',
    'Locked': 'قفل شده',
    'Unlocked': 'باز شده',

    // Navigation
    'Dashboard': 'داشبورد',
    'Home': 'خانه',
    'Settings': 'تنظیمات',
    'Profile': 'پروفایل',
    'Account': 'حساب',
    'Logout': 'خروج',
    'Login': 'ورود',
    'Menu': 'منو',
    'Sidebar': 'نوار کناری',
    'Header': 'سربرگ',
    'Footer': 'پابرگ',

    // Data operations
    'Search': 'جستجو',
    'Filter': 'فیلتر',
    'Sort': 'مرتب‌سازی',
    'Export': 'صدور',
    'Import': 'وارد کردن',
    'Refresh': 'بازآوری',
    'Actions': 'عملیات',
    'Details': 'جزئیات',
    'Summary': 'خلاصه',
    'Overview': 'نمای کلی',
    'Total': 'مجموع',
    'Count': 'تعداد',
    'Value': 'مقدار',
    'Amount': 'مقدار',
    'Price': 'قیمت',
    'Cost': 'هزینه',
    'Date': 'تاریخ',
    'Time': 'زمان',
    'Created At': 'تاریخ ایجاد',
    'Updated At': 'تاریخ به‌روزرسانی',
    'Last Login': 'آخرین ورود',
    'Last Activity': 'آخرین فعالیت',

    // User management
    'User': 'کاربر',
    'Users': 'کاربران',
    'Administrator': 'مدیر',
    'Administrators': 'مدیران',
    'Role': 'نقش',
    'Roles': 'نقش‌ها',
    'Group': 'گروه',
    'Groups': 'گروه‌ها',
    'Organization': 'سازمان',
    'Organizations': 'سازمان‌ها',

    // Application management
    'Application': 'برنامه',
    'Applications': 'برنامه‌ها',
    'Service': 'خدمت',
    'Services': 'خدمات',
    'Permission': 'مجوز',
    'Permissions': 'مجوزها',
    'Policy': 'سیاست',
    'Policies': 'سیاست‌ها',

    // Security
    'Security': 'امنیت',
    'Audit': 'حسابرسی',
    'Compliance': 'انطباق',
    'Risk': 'ریسک',
    'Threat': 'تهدید',
    'Vulnerability': 'آسیب‌پذیری',
    'Incident': 'حادثه',
    'Breach': 'نقض',
    'Violation': 'نقض',
    'Event': 'رویداد',
    'Log': 'گزارش',
    'Logs': 'گزارش‌ها',
    'Report': 'گزارش',
    'Reports': 'گزارش‌ها',

    // Technical
    'API': 'API',
    'Token': 'توکن',
    'Key': 'کلید',
    'Certificate': 'گواهی‌نامه',
    'Secret': 'رمز',
    'Password': 'رمز عبور',
    'Access': 'دسترسی',
    'Authentication': 'احراز هویت',
    'Authorization': 'مجازسازی',

    // Special phrases
    'No data available': 'هیچ داده‌ای موجود نیست',
    'Welcome Back': 'خوش آمدید',
    'Your identity management overview for today': 'نمای کلی مدیریت هویت امروز شما',
    'to': 'تا',
    'Organization Unit': 'واحد سازمانی',
    'Admin Portal': 'پورتال مدیریت'
  };

  return translations[english] || english;
}

// Run the translation creation
const translations = createComprehensiveTranslations();

// Save the files
fs.writeFileSync('src/i18n/locales/en.json', JSON.stringify(translations.en, null, 2));
fs.writeFileSync('src/i18n/locales/fa.json', JSON.stringify(translations.fa, null, 2));

console.log('✅ فایل‌های ترجمه جامع ایجاد و ذخیره شدند');
console.log(`📊 آمار نهایی:`);
console.log(`   • کلیدهای Common: ${Object.keys(translations.en.common).length}`);
console.log(`   • کلیدهای Tenant: ${Object.keys(translations.en.tenant).length}`);
console.log(`   • کلیدهای Global: ${Object.keys(translations.en.global).length}`);
console.log(`   • مجموع کلیدها: ${Object.keys(translations.en.common).length + Object.keys(translations.en.tenant).length + Object.keys(translations.en.global).length}`);
