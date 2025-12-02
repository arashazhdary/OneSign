const fs = require('fs');

// Load translation files
const enData = JSON.parse(fs.readFileSync('src/i18n/locales/en.json', 'utf8'));
const faData = JSON.parse(fs.readFileSync('src/i18n/locales/fa.json', 'utf8'));

// Function to extract all keys with their values
function extractAllKeys(obj, path = '') {
  const keys = [];

  for (const key in obj) {
    const fullPath = path ? `${path}.${key}` : key;

    if (typeof obj[key] === 'string') {
      keys.push({
        path: fullPath,
        key: key,
        english: obj[key],
        persian: faData[fullPath.split('.')[0]]?.[key] || obj[key]
      });
    } else if (typeof obj[key] === 'object') {
      keys.push(...extractAllKeys(obj[key], fullPath));
    }
  }

  return keys;
}

// Extract all keys
const allKeys = extractAllKeys(enData);

// Categorize keys for better organization
const categories = {
  ui: [],
  actions: [],
  status: [],
  errors: [],
  business: [],
  technical: [],
  navigation: [],
  other: []
};

allKeys.forEach(item => {
  const key = item.key.toLowerCase();
  const english = item.english.toLowerCase();

  if (['add', 'edit', 'delete', 'save', 'cancel', 'create', 'update', 'submit', 'close', 'back', 'next', 'previous', 'finish', 'done'].includes(key)) {
    categories.actions.push(item);
  } else if (['loading', 'error', 'success', 'warning', 'info', 'status', 'active', 'inactive', 'enabled', 'disabled'].includes(key)) {
    categories.ui.push(item);
  } else if (['pending', 'approved', 'rejected', 'failed', 'completed', 'suspended', 'expired', 'verified'].includes(key)) {
    categories.status.push(item);
  } else if (english.includes('failed') || english.includes('error') || english.includes('unable')) {
    categories.errors.push(item);
  } else if (['user', 'users', 'admin', 'role', 'roles', 'organization', 'tenant', 'application', 'policy', 'permission'].includes(key)) {
    categories.business.push(item);
  } else if (['api', 'token', 'key', 'certificate', 'secret', 'endpoint', 'connection', 'sync'].includes(key)) {
    categories.technical.push(item);
  } else if (['dashboard', 'settings', 'profile', 'menu', 'sidebar', 'navigation'].includes(key)) {
    categories.navigation.push(item);
  } else {
    categories.other.push(item);
  }
});

console.log('📊 تحلیل کلیدهای ترجمه:');
console.log('========================');
console.log(`کل کلیدها: ${allKeys.length}`);
console.log(`UI: ${categories.ui.length}`);
console.log(`Actions: ${categories.actions.length}`);
console.log(`Status: ${categories.status.length}`);
console.log(`Errors: ${categories.errors.length}`);
console.log(`Business: ${categories.business.length}`);
console.log(`Technical: ${categories.technical.length}`);
console.log(`Navigation: ${categories.navigation.length}`);
console.log(`Other: ${categories.other.length}`);

// Create comprehensive translation improvements
const improvedTranslations = {
  // Enhanced English translations for better clarity
  en: {
    'failedToLoadData': 'Unable to load data. Please check your internet connection and try again.',
    'failedToSaveData': 'Unable to save data. Please verify your input and try again.',
    'failedToDeleteData': 'Unable to delete data. The item may be in use or protected.',
    'noData': 'No data available',
    'loading': 'Loading...',
    'search': 'Search',
    'filter': 'Filter',
    'export': 'Export',
    'import': 'Import',
    'refresh': 'Refresh',
    'actions': 'Actions',
    'status': 'Status',
    'createdAt': 'Created At',
    'updatedAt': 'Updated At',
    'user': 'User',
    'admin': 'Administrator',
    'tenant': 'Organization',
    'application': 'Application',
    'role': 'Role',
    'permission': 'Permission',
    'policy': 'Policy',
    'dashboard': 'Dashboard',
    'settings': 'Settings',
    'profile': 'Profile',
    'logout': 'Logout',
    'login': 'Login',
    'email': 'Email',
    'password': 'Password',
    'name': 'Name',
    'description': 'Description',
    'type': 'Type',
    'category': 'Category',
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
    'unlocked': 'Unlocked'
  },

  // Enhanced Persian translations
  fa: {
    'add': 'افزودن',
    'edit': 'ویرایش',
    'delete': 'حذف',
    'save': 'ذخیره',
    'cancel': 'انصراف',
    'search': 'جستجو',
    'filter': 'فیلتر',
    'export': 'صدور',
    'import': 'وارد کردن',
    'refresh': 'بازآوری',
    'loading': 'در حال بارگذاری...',
    'noData': 'هیچ داده‌ای موجود نیست',
    'confirm': 'تأیید',
    'yes': 'بله',
    'no': 'خیر',
    'actions': 'عملیات',
    'status': 'وضعیت',
    'createdAt': 'تاریخ ایجاد',
    'updatedAt': 'تاریخ به‌روزرسانی',
    'error': 'خطا رخ داد. لطفاً دوباره تلاش کنید.',
    'user': 'کاربر',
    'admin': 'مدیر',
    'welcomeBack': 'خوش آمدید',
    'happeningToday': 'نمای کلی مدیریت هویت امروز شما',
    'to': 'تا',
    'orgUnit': 'واحد سازمانی',
    'users': 'کاربران',
    'apps': 'برنامه‌ها',
    'adminPortal': 'پورتال مدیریت',
    'failedToLoadData': 'بارگذاری داده‌ها ناموفق بود. لطفاً اتصال اینترنت خود را بررسی کنید.',
    'failedToSaveData': 'ذخیره داده‌ها ناموفق بود. لطفاً ورودی خود را بررسی کنید.',
    'failedToDeleteData': 'حذف داده‌ها ناموفق بود. ممکن است مورد استفاده یا محافظت شده باشد.',
    'failedToFetchApplication': 'دریافت برنامه ناموفق بود',
    'failedToUpdateApplication': 'به‌روزرسانی برنامه ناموفق بود',
    'failedToAddRedirectUri': 'افزودن آدرس بازگشت ناموفق بود',
    'failedToDeleteRedirectUri': 'حذف آدرس بازگشت ناموفق بود',
    'failedToGenerateSecret': 'تولید رمز ناموفق بود',
    'failedToDeleteSecret': 'حذف رمز ناموفق بود',
    'failedToSignIn': 'ورود ناموفق بود. لطفاً اعتبارنامه خود را بررسی کنید.',
    'failedToInitializeGoogleLogin': 'راه‌اندازی ورود گوگل ناموفق بود',
    'failedToLoadSessions': 'بارگذاری نشست‌ها ناموفق بود',
    'failedToRevokeSession': 'لغو نشست ناموفق بود. نشست ممکن است منقضی شده باشد.',
    'failedToRevokeSessions': 'لغو نشست‌ها ناموفق بود',
    'failedToRevokeSuspiciousSessions': 'لغو نشست‌های مشکوک ناموفق بود. تیم امنیتی مطلع شد.',
    'failedToSaveRole': 'ذخیره نقش ناموفق بود',
    'failedToDeleteRole': 'حذف نقش ناموفق بود',
    'failedToLoadTemplate': 'بارگذاری قالب ناموفق بود',
    'failedToSaveTemplate': 'ذخیره قالب ناموفق بود',
    'failedToSuspendDelegatedAdmin': 'معلق کردن مدیر نماینده ناموفق بود',
    'failedToActivateDelegatedAdmin': 'فعال کردن مدیر نماینده ناموفق بود',
    'failedToUpdateScopes': 'به‌روزرسانی حوزه‌ها ناموفق بود',
    'failedToDeleteDelegatedAdmin': 'حذف مدیر نماینده ناموفق بود',
    'failedToFetchBranding': 'دریافت برندینگ ناموفق بود',
    'failedToSaveBranding': 'ذخیره برندینگ ناموفق بود',
    'failedToLoadCertificates': 'بارگذاری گواهی‌نامه‌ها ناموفق بود',
    'failedToUploadCertificate': 'بارگذاری گواهی‌نامه ناموفق بود',
    'failedToDeleteCertificate': 'حذف گواهی‌نامه ناموفق بود',
    'failedToFetchBackups': 'دریافت پشتیبان‌گیری‌ها ناموفق بود',
    'failedToFetchApiKeys': 'دریافت کلیدهای API ناموفق بود',
    'failedToCreateApiKey': 'ایجاد کلید API ناموفق بود',
    'failedToRevokeApiKey': 'لغو کلید API ناموفق بود',
    'failedToFetchAlertRules': 'دریافت قوانین هشدار ناموفق بود',
    'failedToFetchAlertHistory': 'دریافت تاریخچه هشدار ناموفق بود',
    'failedToSaveAlertRule': 'ذخیره قانون هشدار ناموفق بود',
    'failedToDeleteAlertRule': 'حذف قانون هشدار ناموفق بود',
    'failedToToggleAlertRule': 'تغییر وضعیت قانون هشدار ناموفق بود',
    'failedToMuteAlertRule': 'بی‌صدا کردن قانون هشدار ناموفق بود',
    'failedToLoadTenants': 'بارگذاری سازمان‌ها ناموفق بود',
    'failedToCreateTenant': 'ایجاد سازمان ناموفق بود',
    'failedToSuspendTenant': 'معلق کردن سازمان ناموفق بود',
    'failedToActivateTenant': 'فعال کردن سازمان ناموفق بود',
    'failedToDeleteTenant': 'حذف سازمان ناموفق بود',
    'failedToSendTestEmail': 'ارسال ایمیل آزمایشی ناموفق بود',
    'failedToSendTestSMS': 'ارسال پیامک آزمایشی ناموفق بود',
    'failedToFetchHistory': 'دریافت تاریخچه ناموفق بود',
    'failedToCreateWebhook': 'ایجاد وب‌هوک ناموفق بود',
    'failedToUpdateWebhook': 'به‌روزرسانی وب‌هوک ناموفق بود',
    'failedToDeleteWebhook': 'حذف وب‌هوک ناموفق بود',
    'failedToTestWebhook': 'تست وب‌هوک ناموفق بود',
    'failedToToggleWebhookStatus': 'تغییر وضعیت وب‌هوک ناموفق بود',
    'failedToRetryDelivery': 'تلاش مجدد ارسال ناموفق بود',
    'failedToRetryNotification': 'تلاش مجدد اعلان ناموفق بود',
    'failedToSaveScope': 'ذخیره حوزه ناموفق بود',
    'failedToDeleteScope': 'حذف حوزه ناموفق بود',
    'failedToUpdateScopeStatus': 'به‌روزرسانی وضعیت حوزه ناموفق بود',
    'failedToCreateTemplate': 'ایجاد قالب ناموفق بود',
    'failedToCloneTemplate': 'کلون کردن قالب ناموفق بود',
    'failedToUpdateRole': 'به‌روزرسانی نقش ناموفق بود',
    'failedToUpdatePermissions': 'به‌روزرسانی مجوزها ناموفق بود',
    'failedToSaveChannel': 'ذخیره کانال ناموفق بود',
    'failedToDeleteChannel': 'حذف کانال ناموفق بود',
    'failedToRetryNotification': 'تلاش مجدد اعلان ناموفق بود',
    'failedToSaveRule': 'ذخیره قانون ناموفق بود',
    'failedToDeleteRule': 'حذف قانون ناموفق بود',
    'failedToToggleRuleStatus': 'تغییر وضعیت قانون ناموفق بود',
    'failedToFetchOrgUnit': 'دریافت واحد سازمانی ناموفق بود',
    'failedToConfigureIntegration': 'پیکربندی یکپارچه‌سازی ناموفق بود',
    'failedToStartSync': 'شروع همگام‌سازی ناموفق بود',
    'failedToUpdateIntegrationStatus': 'به‌روزرسانی وضعیت یکپارچه‌سازی ناموفق بود',
    'failedToDeleteIntegration': 'حذف یکپارچه‌سازی ناموفق بود',
    'failedToSavePlatformSettings': 'ذخیره تنظیمات پلتفرم ناموفق بود',
    'failedToSaveEmailSettings': 'ذخیره تنظیمات ایمیل ناموفق بود',
    'failedToSaveSMSSettings': 'ذخیره تنظیمات پیامک ناموفق بود',
    'failedToSaveMaintenanceSettings': 'ذخیره تنظیمات تعمیر و نگهداری ناموفق بود',
    'failedToSaveWorkflow': 'ذخیره گردش کار ناموفق بود',
    'failedToDeployWorkflow': 'استقرار گردش کار ناموفق بود',
    'failedToPublishTemplate': 'انتشار قالب ناموفق بود',
    'failedToLoadSchedules': 'بارگذاری زمان‌بندی‌ها ناموفق بود',
    'failedToLoadQuotas': 'بارگذاری سهمیه‌ها ناموفق بود',
    'failedToUploadFile': 'بارگذاری فایل ناموفق بود',
    'failedToRollbackImport': 'بازگشت واردات ناموفق بود',
    'failedToDownloadTemplate': 'دانلود قالب ناموفق بود',
    'failedToLoadExports': 'بارگذاری خروجی‌ها ناموفق بود',
    'failedToCreateExport': 'ایجاد خروجی ناموفق بود',
    'failedToDownloadExport': 'دانلود خروجی ناموفق بود',
    'failedToDeleteExport': 'حذف خروجی ناموفق بود',
    'failedToUpdateSchedule': 'به‌روزرسانی زمان‌بندی ناموفق بود',
    'failedToLoadApiUsageData': 'بارگذاری داده‌های استفاده API ناموفق بود',
    'failedToExportReport': 'خروجی گزارش ناموفق بود',
    'failedToLoadUsers': 'بارگذاری کاربران ناموفق بود',
    'failedToDeleteUser': 'حذف کاربر ناموفق بود',
    'failedToSaveUser': 'ذخیره کاربر ناموفق بود',
    'failedToDeleteSomeUsers': 'حذف برخی کاربران ناموفق بود',
    'failedToLoadMetrics': 'بارگذاری معیارها ناموفق بود',
    'failedToSetPassword': 'تنظیم رمز عبور ناموفق بود',
    'failedToCompleteGoogleSignIn': 'تکمیل ورود گوگل ناموفق بود',
    'holdCtrl': 'برای انتخاب چندگانه، Ctrl/Cmd را نگه دارید',
    'noDescription': 'بدون توضیحات',
    'redirectUri': 'آدرس بازگشت',
    'noOptionsFound': 'گزینه‌ای یافت نشد',
    'placeholderAction': 'بر اساس اقدام فیلتر کنید...',
    'placeholderUserIdOrEmail': 'شناسه کاربر یا ایمیل...',
    'placeholderResourceId': 'شناسه منبع...',
    'placeholderIpAddress': 'آدرس IP...',
    'closeModal': 'بستن پنجره',
    'selectOption': 'یک گزینه انتخاب کنید',
    'apiKey': 'کلید API',
    'serviceAccount': 'حساب سرویس',
    'accessRequest': 'درخواست دسترسی',
    'alertRule': 'قانون هشدار',
    'detectionRule': 'قانون تشخیص',
    'note': 'یادداشت',
    'previous': 'قبلی',
    'next': 'بعدی',
    'page': 'صفحه',
    'samlProvider': 'ارائه‌دهنده SAML',
    'oidcProvider': 'ارائه‌دهنده OIDC',
    'scimToken': 'توکن SCIM',
    'accessManagement': 'مدیریت دسترسی',
    'accessRequests': 'درخواست‌های دسترسی',
    'certifications': 'گواهی‌نامه‌ها',
    'accessReviews': 'بررسی‌های دسترسی',
    'imports': 'واردات',
    'exports': 'صادرات',
    'customization': 'سفارشی‌سازی',
    'notifications': 'اعلان‌ها',
    'searchMenu': 'منوی جستجو...',
    'english': 'انگلیسی',
    'persian': 'فارسی',
    'exportTable': 'خروجی جدول',
    'databaseConnection': 'اتصال پایگاه داده',
    'databaseQueryPerformance': 'عملکرد پرس‌وجوی پایگاه داده',
    'orgUnitsAssigned': 'واحدهای سازمانی تخصیص یافتند',
    'forbidden': 'شما اجازه انجام این عملیات را ندارید.',
    'pasteAccessToken': 'توکن دسترسی خود را اینجا قرار دهید',
    'authorizationHeader': 'Authorization: Bearer YOUR_ACCESS_TOKEN',
    'policyManagement': 'مدیریت سیاست',
    'hrSyncTriggered': 'همگام‌سازی منابع انسانی آغاز شد',
    'deleted': 'حذف شده',
    'hrSyncTriggered': 'همگام‌سازی منابع انسانی آغاز شد',
    'policyCreated': 'سیاست ایجاد شد',
    'policyDeleted': 'سیاست حذف شد',
    'policyUpdated': 'سیاست به‌روزرسانی شد',
    'orgUnitsAssigned': 'واحدهای سازمانی تخصیص یافتند',
    'tenantCreated': 'سازمان ایجاد شد',
    'statusUpdated': 'وضعیت به‌روزرسانی شد',
    'userCreated': 'کاربر ایجاد شد',
    'userDeleted': 'کاربر حذف شد',
    'userSuspended': 'کاربر معلق شد',
    'userUpdated': 'کاربر به‌روزرسانی شد',
    'tenant': 'سازمان',
    'tenantName': 'نام سازمان',
    'tenantSlug': 'نامک سازمان',
    'tenants': 'سازمان‌ها',
    'plan': 'پلن',
    'role': 'نقش',
    'roles': 'نقش‌ها',
    'group': 'گروه',
    'groups': 'گروه‌ها',
    'organization': 'سازمان',
    'organizations': 'سازمان‌ها',
    'application': 'برنامه',
    'applications': 'برنامه‌ها',
    'service': 'خدمت',
    'services': 'خدمات',
    'permission': 'مجوز',
    'permissions': 'مجوزها',
    'policy': 'سیاست',
    'policies': 'سیاست‌ها',
    'rule': 'قانون',
    'rules': 'قوانین',
    'resource': 'منبع',
    'resources': 'منابع',
    'asset': 'دارایی',
    'assets': 'دارایی‌ها',
    'identity': 'هویت',
    'identities': 'هویت‌ها',
    'credential': 'اعتبارنامه',
    'credentials': 'اعتبارنامه‌ها',
    'token': 'توکن',
    'tokens': 'توکن‌ها',
    'key': 'کلید',
    'keys': 'کلیدها',
    'certificate': 'گواهی‌نامه',
    'certificates': 'گواهی‌نامه‌ها',
    'secret': 'رمز',
    'secrets': 'رمزها',
    'password': 'رمز عبور',
    'passwords': 'رمزهای عبور',
    'access': 'دسترسی',
    'authentication': 'احراز هویت',
    'authorization': 'مجازسازی',
    'security': 'امنیت',
    'audit': 'حسابرسی',
    'compliance': 'انطباق',
    'risk': 'ریسک',
    'threat': 'تهدید',
    'vulnerability': 'آسیب‌پذیری',
    'incident': 'حادثه',
    'breach': 'نقض',
    'violation': 'نقض',
    'event': 'رویداد',
    'log': 'گزارش',
    'logs': 'گزارش‌ها',
    'report': 'گزارش',
    'reports': 'گزارش‌ها',
    'metric': 'متریک',
    'metrics': 'متریک‌ها',
    'statistic': 'آمار',
    'statistics': 'آمار',
    'analytic': 'تحلیلی',
    'analytics': 'تحلیل‌ها',
    'insight': 'بینش',
    'insights': 'بینش‌ها',
    'monitor': 'پایش',
    'monitoring': 'پایش',
    'alert': 'هشدار',
    'alerts': 'هشدارها',
    'notification': 'اعلان',
    'notifications': 'اعلان‌ها',
    'integration': 'یکپارچه‌سازی',
    'integrations': 'یکپارچه‌سازی‌ها',
    'webhook': 'وب‌هوک',
    'webhooks': 'وب‌هوک‌ها',
    'api': 'API',
    'apis': 'APIها',
    'endpoint': 'نقطه پایانی',
    'endpoints': 'نقاط پایانی',
    'connection': 'اتصال',
    'connections': 'اتصالات',
    'sync': 'همگام‌سازی',
    'synchronization': 'همگام‌سازی',
    'backup': 'پشتیبان‌گیری',
    'backups': 'پشتیبان‌گیری‌ها',
    'restore': 'بازیابی',
    'recovery': 'بازیابی',
    'archive': 'بایگانی',
    'archival': 'بایگانی',
    'retention': 'نگهداری',
    'expiration': 'انقضا',
    'validity': 'اعتبار',
    'lifecycle': 'چرخه حیات',
    'platform': 'پلتفرم',
    'platforms': 'پلتفرم‌ها',
    'infrastructure': 'زیرساخت',
    'infrastructures': 'زیرساخت‌ها',
    'maintenance': 'نگهداری',
    'deployment': 'استقرار',
    'deployments': 'استقرارها',
    'automation': 'اتوماسیون',
    'automations': 'اتوماسیون‌ها',
    'workflow': 'گردش کار',
    'workflows': 'گردش کارها',
    'governance': 'اداره',
    'billing': 'صورت‌حساب',
    'revenue': 'درآمد',
    'subscription': 'اشتراک',
    'subscriptions': 'اشتراک‌ها',
    'payment': 'پرداخت',
    'payments': 'پرداخت‌ها',
    'invoice': 'فاکتور',
    'invoices': 'فاکتورها',
    'transaction': 'تراکنش',
    'transactions': 'تراکنش‌ها',
    'system': 'سیستم',
    'systems': 'سیستم‌ها',
    'server': 'سرور',
    'servers': 'سرورها',
    'database': 'پایگاه داده',
    'databases': 'پایگاه داده‌ها',
    'network': 'شبکه',
    'networks': 'شبکه‌ها',
    'cloud': 'ابر',
    'onPremise': 'در محل',
    'hybrid': 'ترکیبی',
    'multiTenant': 'چند مستأجری',
    'singleTenant': 'تک مستأجری',
    'scalable': 'قابل مقیاس',
    'reliable': 'قابل اعتماد',
    'secure': 'امن',
    'available': 'موجود',
    'highAvailability': 'دسترسی بالا',
    'loadBalancing': 'متوازن کردن بار',
    'scalability': 'قابل مقیاس بودن',
    'reliability': 'قابل اعتماد بودن',
    'security': 'امنیت',
    'availability': 'دسترسی',
    'performance': 'عملکرد',
    'efficiency': 'کارایی',
    'optimization': 'بهینه‌سازی'
  }
};

// Apply improved translations
function applyTranslations(obj, faObj, translations, section) {
  for (const key in obj) {
    if (typeof obj[key] === 'string') {
      if (translations[key]) {
        obj[key] = translations[key]; // Update English
        faObj[key] = translations[key]; // Update Persian
      }
    } else if (typeof obj[key] === 'object' && faObj[key]) {
      applyTranslations(obj[key], faObj[key], translations, section);
    }
  }
}

applyTranslations(enData.common, faData.common, improvedTranslations.en, 'common');
applyTranslations(enData.tenant, faData.tenant, improvedTranslations.en, 'tenant');
applyTranslations(enData.global, faData.global, improvedTranslations.en, 'global');

applyTranslations(enData.common, faData.common, improvedTranslations.fa, 'common');
applyTranslations(enData.tenant, faData.tenant, improvedTranslations.fa, 'tenant');
applyTranslations(enData.global, faData.global, improvedTranslations.fa, 'global');

// Save improved files
fs.writeFileSync('src/i18n/locales/en.json', JSON.stringify(enData, null, 2));
fs.writeFileSync('src/i18n/locales/fa.json', JSON.stringify(faData, null, 2));

console.log('✅ فایل‌های ترجمه بهبود یافتند و ذخیره شدند');
console.log('📊 کلیدهای بهبود یافته:', Object.keys(improvedTranslations.en).length + Object.keys(improvedTranslations.fa).length);
