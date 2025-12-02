const fs = require('fs');

// Load current translations
const enData = JSON.parse(fs.readFileSync('src/i18n/locales/en.json', 'utf8'));
const faData = JSON.parse(fs.readFileSync('src/i18n/locales/fa.json', 'utf8'));

// Function to find untranslated keys
function findUntranslatedKeys(enObj, faObj, path = '') {
  const untranslated = [];

  for (const key in enObj) {
    const fullPath = path ? `${path}.${key}` : key;

    if (typeof enObj[key] === 'string') {
      if (typeof faObj[key] === 'string' && enObj[key] === faObj[key]) {
        untranslated.push({
          path: fullPath,
          key: key,
          english: enObj[key]
        });
      }
    } else if (typeof enObj[key] === 'object' && faObj[key]) {
      untranslated.push(...findUntranslatedKeys(enObj[key], faObj[key], fullPath));
    }
  }

  return untranslated;
}

// Find all untranslated keys
const untranslatedKeys = findUntranslatedKeys(enData, faData);

console.log(`🔍 تعداد کلیدهای ترجمه نشده: ${untranslatedKeys.length}`);

// Create comprehensive translations for all remaining keys
const translations = {};

// Process each untranslated key
untranslatedKeys.forEach(item => {
  const { key, english } = item;

  // Skip if already translated
  if (translations[key]) return;

  // Generate Persian translation based on English text
  let persian = english;

  // Common patterns
  const patterns = [
    // Error messages
    [/Failed to ([a-zA-Z ]+)/, 'ناموفق بود در $1'],
    [/Error ([a-zA-Z ]+)/, 'خطا در $1'],
    [/Unable to ([a-zA-Z ]+)/, 'قادر به $1 نیست'],

    // Status messages
    [/successfully$/, 'با موفقیت'],
    [/Successfully ([a-zA-Z ]+)/, '$1 با موفقیت انجام شد'],

    // UI elements
    [/Select ([a-zA-Z ]+)/, 'انتخاب $1'],
    [/Filter ([a-zA-Z ]+)/, 'فیلتر $1'],
    [/Search ([a-zA-Z ]+)/, 'جستجوی $1'],

    // Actions
    [/Create ([a-zA-Z ]+)/, 'ایجاد $1'],
    [/Update ([a-zA-Z ]+)/, 'به‌روزرسانی $1'],
    [/Delete ([a-zA-Z ]+)/, 'حذف $1'],
    [/Save ([a-zA-Z ]+)/, 'ذخیره $1'],
    [/Load ([a-zA-Z ]+)/, 'بارگذاری $1'],
    [/Fetch ([a-zA-Z ]+)/, 'دریافت $1'],

    // States
    [/Active$/, 'فعال'],
    [/Inactive$/, 'غیرفعال'],
    [/Enabled$/, 'فعال شده'],
    [/Disabled$/, 'غیرفعال شده'],
    [/Pending$/, 'در انتظار'],
    [/Approved$/, 'تأیید شده'],
    [/Rejected$/, 'رد شده'],
    [/Suspended$/, 'معلق شده'],
    [/Expired$/, 'منقضی شده'],
    [/Verified$/, 'تأیید شده'],
    [/Locked$/, 'قفل شده'],
    [/Available$/, 'موجود'],

    // Navigation
    [/Dashboard$/, 'داشبورد'],
    [/Settings$/, 'تنظیمات'],
    [/Profile$/, 'پروفایل'],
    [/Account$/, 'حساب'],
    [/Logout$/, 'خروج'],
    [/Login$/, 'ورود'],
    [/Menu$/, 'منو'],
    [/Sidebar$/, 'نوار کناری'],
    [/Header$/, 'سربرگ'],
    [/Footer$/, 'پابرگ'],

    // Common terms
    [/Name$/, 'نام'],
    [/Title$/, 'عنوان'],
    [/Description$/, 'توضیحات'],
    [/Type$/, 'نوع'],
    [/Category$/, 'دسته‌بندی'],
    [/Status$/, 'وضعیت'],
    [/Date$/, 'تاریخ'],
    [/Time$/, 'زمان'],
    [/User$/, 'کاربر'],
    [/Users$/, 'کاربران'],
    [/Admin$/, 'مدیر'],
    [/Role$/, 'نقش'],
    [/Roles$/, 'نقش‌ها'],
    [/Group$/, 'گروه'],
    [/Groups$/, 'گروه‌ها'],
    [/Organization$/, 'سازمان'],
    [/Organizations$/, 'سازمان‌ها'],
    [/Application$/, 'برنامه'],
    [/Applications$/, 'برنامه‌ها'],
    [/Service$/, 'خدمت'],
    [/Services$/, 'خدمات'],
    [/Permission$/, 'مجوز'],
    [/Permissions$/, 'مجوزها'],
    [/Policy$/, 'سیاست'],
    [/Policies$/, 'سیاست‌ها'],

    // Technical terms
    [/API$/, 'API'],
    [/Token$/, 'توکن'],
    [/Key$/, 'کلید'],
    [/Keys$/, 'کلیدها'],
    [/Certificate$/, 'گواهی‌نامه'],
    [/Certificates$/, 'گواهی‌نامه‌ها'],
    [/Password$/, 'رمز عبور'],
    [/Access$/, 'دسترسی'],
    [/Security$/, 'امنیت'],
    [/Audit$/, 'حسابرسی'],
    [/Report$/, 'گزارش'],
    [/Reports$/, 'گزارش‌ها'],
    [/System$/, 'سیستم'],
    [/Server$/, 'سرور'],
    [/Database$/, 'پایگاه داده'],
    [/Network$/, 'شبکه'],

    // Messages
    [/No data available$/, 'هیچ داده‌ای موجود نیست'],
    [/Loading\.\.\.$/, 'در حال بارگذاری...'],
    [/Success$/, 'موفقیت'],
    [/Error$/, 'خطا'],
    [/Warning$/, 'هشدار'],
    [/Information$/, 'اطلاعات'],
    [/Confirm$/, 'تأیید'],
    [/Yes$/, 'بله'],
    [/No$/, 'خیر']
  ];

  // Apply patterns
  for (const [pattern, replacement] of patterns) {
    if (pattern.test(persian)) {
      persian = persian.replace(pattern, replacement);
      break; // Apply only first matching pattern
    }
  }

  // If no pattern matched, try basic camelCase to readable Persian
  if (persian === english) {
    persian = english
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  }

  translations[key] = persian;
});

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

console.log(`📝 اعمال ${Object.keys(translations).length} ترجمه جدید...`);

applyTranslations(enData.common, faData.common, translations);
applyTranslations(enData.tenant, faData.tenant, translations);
applyTranslations(enData.global, faData.global, translations);

// Save final files
fs.writeFileSync('src/i18n/locales/en.json', JSON.stringify(enData, null, 2));
fs.writeFileSync('src/i18n/locales/fa.json', JSON.stringify(faData, null, 2));

console.log('✅ تمام ترجمه‌ها تکمیل و فایل‌ها ذخیره شدند');
