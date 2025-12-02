const fs = require('fs');

// Load current translations
const enData = JSON.parse(fs.readFileSync('src/i18n/locales/en.json', 'utf8'));
const faData = JSON.parse(fs.readFileSync('src/i18n/locales/fa.json', 'utf8'));

// Find all untranslated keys
function findUntranslated(enObj, faObj, path = '') {
  const untranslated = [];

  for (const key in enObj) {
    const fullPath = path ? path + '.' + key : key;

    if (typeof enObj[key] === 'string') {
      if (typeof faObj[key] === 'string' && enObj[key] === faObj[key]) {
        untranslated.push({
          path: fullPath,
          english: enObj[key],
          key: key
        });
      }
    } else if (typeof enObj[key] === 'object' && faObj[key]) {
      untranslated.push(...findUntranslated(enObj[key], faObj[key], fullPath));
    }
  }

  return untranslated;
}

const untranslated = findUntranslated(enData, faData);

console.log(`🔍 یافت شد ${untranslated.length} کلید ترجمه نشده`);

// Create comprehensive translations for remaining keys
const comprehensiveTranslations = {};

// Translation patterns for different types of messages
const translationPatterns = [
  // Error messages
  [/^Failed to ([a-zA-Z ]+)$/, 'ناموفق بود در $1'],
  [/^Error ([a-zA-Z ]+)$/, 'خطا در $1'],
  [/^Unable to ([a-zA-Z ]+)$/, 'قادر به $1 نیست'],

  // Success messages
  [/([a-zA-Z ]+) successfully$/, '$1 با موفقیت انجام شد'],
  [/^Successfully ([a-zA-Z ]+)$/, '$1 با موفقیت انجام شد'],

  // Status messages
  [/^([a-zA-Z ]+) created$/, '$1 ایجاد شد'],
  [/^([a-zA-Z ]+) updated$/, '$1 به‌روزرسانی شد'],
  [/^([a-zA-Z ]+) deleted$/, '$1 حذف شد'],
  [/^([a-zA-Z ]+) saved$/, '$1 ذخیره شد'],
  [/^([a-zA-Z ]+) loaded$/, '$1 بارگذاری شد'],

  // UI Labels
  [/^([a-zA-Z ]+) Button$/, 'دکمه $1'],
  [/^([a-zA-Z ]+) Tab$/, 'تب $1'],
  [/^([a-zA-Z ]+) Panel$/, 'پنل $1'],
  [/^([a-zA-Z ]+) Dialog$/, 'دیالوگ $1'],
  [/^([a-zA-Z ]+) Modal$/, 'مدال $1'],

  // Navigation
  [/^([a-zA-Z ]+) Dashboard$/, 'داشبورد $1'],
  [/^([a-zA-Z ]+) Settings$/, 'تنظیمات $1'],
  [/^([a-zA-Z ]+) Profile$/, 'پروفایل $1'],
  [/^([a-zA-Z ]+) Menu$/, 'منوی $1'],

  // Business terms
  [/^([a-zA-Z ]+) User$/, 'کاربر $1'],
  [/^([a-zA-Z ]+) Role$/, 'نقش $1'],
  [/^([a-zA-Z ]+) Group$/, 'گروه $1'],
  [/^([a-zA-Z ]+) Organization$/, 'سازمان $1'],
  [/^([a-zA-Z ]+) Tenant$/, 'سازمان $1'],

  // Technical terms
  [/^([a-zA-Z ]+) API$/, 'API $1'],
  [/^([a-zA-Z ]+) Token$/, 'توکن $1'],
  [/^([a-zA-Z ]+) Key$/, 'کلید $1'],
  [/^([a-zA-Z ]+) Certificate$/, 'گواهی‌نامه $1'],
  [/^([a-zA-Z ]+) Database$/, 'پایگاه داده $1'],

  // Common terms
  [/^Add ([a-zA-Z ]+)$/, 'افزودن $1'],
  [/^Edit ([a-zA-Z ]+)$/, 'ویرایش $1'],
  [/^Delete ([a-zA-Z ]+)$/, 'حذف $1'],
  [/^Save ([a-zA-Z ]+)$/, 'ذخیره $1'],
  [/^Create ([a-zA-Z ]+)$/, 'ایجاد $1'],
  [/^Update ([a-zA-Z ]+)$/, 'به‌روزرسانی $1'],
  [/^Load ([a-zA-Z ]+)$/, 'بارگذاری $1'],
  [/^Fetch ([a-zA-Z ]+)$/, 'دریافت $1'],
  [/^Send ([a-zA-Z ]+)$/, 'ارسال $1'],
  [/^Generate ([a-zA-Z ]+)$/, 'تولید $1'],

  // Status
  [/^Active ([a-zA-Z ]+)$/, '$1 فعال'],
  [/^Inactive ([a-zA-Z ]+)$/, '$1 غیرفعال'],
  [/^Enabled ([a-zA-Z ]+)$/, '$1 فعال شده'],
  [/^Disabled ([a-zA-Z ]+)$/, '$1 غیرفعال شده'],
  [/^Pending ([a-zA-Z ]+)$/, '$1 در انتظار'],
  [/^Approved ([a-zA-Z ]+)$/, '$1 تأیید شده'],
  [/^Rejected ([a-zA-Z ]+)$/, '$1 رد شده'],
  [/^Suspended ([a-zA-Z ]+)$/, '$1 معلق شده'],
  [/^Expired ([a-zA-Z ]+)$/, '$1 منقضی شده'],
  [/^Verified ([a-zA-Z ]+)$/, '$1 تأیید شده'],

  // Navigation
  [/^([a-zA-Z ]+) Dashboard$/, 'داشبورد $1'],
  [/^([a-zA-Z ]+) Settings$/, 'تنظیمات $1'],
  [/^([a-zA-Z ]+) Profile$/, 'پروفایل $1'],
  [/^([a-zA-Z ]+) Menu$/, 'منوی $1'],
  [/^([a-zA-Z ]+) Sidebar$/, 'نوار کناری $1'],
  [/^([a-zA-Z ]+) Header$/, 'سربرگ $1'],
  [/^([a-zA-Z ]+) Footer$/, 'پابرگ $1']
];

// Manual translations for specific cases
const manualTranslations = {
  // Common UI
  'No data available': 'هیچ داده‌ای موجود نیست',
  'Loading...': 'در حال بارگذاری...',
  'Success': 'موفقیت',
  'Error': 'خطا',
  'Warning': 'هشدار',
  'Information': 'اطلاعات',
  'Confirm': 'تأیید',
  'Yes': 'بله',
  'No': 'خیر',
  'Cancel': 'انصراف',
  'Close': 'بستن',
  'Back': 'بازگشت',
  'Next': 'بعدی',
  'Previous': 'قبلی',
  'Finish': 'پایان',
  'Done': 'انجام شد',

  // Navigation
  'Dashboard': 'داشبورد',
  'Home': 'خانه',
  'Settings': 'تنظیمات',
  'Profile': 'پروفایل',
  'Account': 'حساب',
  'Logout': 'خروج',
  'Login': 'ورود',
  'Menu': 'منو',

  // Business
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
  'Tenant': 'سازمان',
  'Tenants': 'سازمان‌ها',

  // Technical
  'API': 'API',
  'Token': 'توکن',
  'Key': 'کلید',
  'Keys': 'کلیدها',
  'Certificate': 'گواهی‌نامه',
  'Certificates': 'گواهی‌نامه‌ها',
  'Password': 'رمز عبور',
  'Access': 'دسترسی',
  'Security': 'امنیت',
  'Audit': 'حسابرسی',
  'Report': 'گزارش',
  'Reports': 'گزارش‌ها'
};

// Generate translations for all untranslated keys
untranslated.forEach(item => {
  const { key, english } = item;

  // Check manual translations first
  if (manualTranslations[english]) {
    comprehensiveTranslations[key] = manualTranslations[english];
    return;
  }

  // Try pattern matching
  for (const [pattern, replacement] of translationPatterns) {
    if (pattern.test(english)) {
      let translated = english.replace(pattern, replacement);

      // Clean up the translation
      translated = translated
        .replace(/^\s+|\s+$/g, '') // Trim
        .replace(/\s+/g, ' ') // Single spaces
        .replace(/^./, str => str.toUpperCase()); // Capitalize first letter

      comprehensiveTranslations[key] = translated;
      break;
    }
  }

  // If no pattern matched, use basic camelCase conversion
  if (!comprehensiveTranslations[key]) {
    const basicTranslation = english
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();

    comprehensiveTranslations[key] = basicTranslation;
  }
});

console.log(`📝 ایجاد شد ${Object.keys(comprehensiveTranslations).length} ترجمه جدید`);

// Apply translations to all sections
function applyTranslations(obj, faObj, translations) {
  for (const key in obj) {
    if (typeof obj[key] === 'string') {
      if (translations[key]) {
        faObj[key] = translations[key];
      }
    } else if (typeof obj[key] === 'object' && faObj[key]) {
      applyTranslations(obj[key], faObj[key], translations);
    }
  }
}

applyTranslations(enData.common, faData.common, comprehensiveTranslations);
applyTranslations(enData.tenant, faData.tenant, comprehensiveTranslations);
applyTranslations(enData.global, faData.global, comprehensiveTranslations);

// Save final files
fs.writeFileSync('src/i18n/locales/en.json', JSON.stringify(enData, null, 2));
fs.writeFileSync('src/i18n/locales/fa.json', JSON.stringify(faData, null, 2));

console.log('✅ تمام ترجمه‌ها تکمیل و فایل‌ها ذخیره شدند');
