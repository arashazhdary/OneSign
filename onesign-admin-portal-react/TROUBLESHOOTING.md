# راهنمای عیب‌یابی صفحه سفید

## تغییرات انجام شده

1. ✅ افزودن Error Boundary برای نمایش خطاها
2. ✅ بهبود مدیریت خطا در useDirection hook
3. ✅ بهبود مقداردهی اولیه i18n
4. ✅ افزودن try-catch در App component

## مراحل عیب‌یابی

### 1. بررسی Console مرورگر
- باز کردن Developer Tools (F12)
- بررسی تب Console برای خطاهای JavaScript
- بررسی تب Network برای خطاهای بارگذاری فایل‌ها

### 2. بررسی خطاهای رایج

#### خطای i18n
اگر خطای مربوط به i18n مشاهده می‌شود:
- بررسی فایل‌های `src/i18n/locales/en.json` و `src/i18n/locales/fa.json`
- اطمینان از صحت JSON

#### خطای Routing
اگر خطای مربوط به routing مشاهده می‌شود:
- بررسی فایل `src/routes/routes.tsx`
- اطمینان از صحت import ها

#### خطای CSS
اگر صفحه سفید است اما Console خطایی ندارد:
- بررسی تب Network برای خطاهای بارگذاری CSS
- بررسی فایل `src/index.css`
- بررسی فایل `src/styles/fonts.css`

### 3. بررسی Authentication
- اگر کاربر لاگین نیست، باید به صفحه `/login` هدایت شود
- بررسی `src/stores/authStore.ts`

### 4. تست ساده
برای تست، می‌توانید در `src/App.tsx` به صورت موقت یک div ساده نمایش دهید:

```tsx
function App() {
  return <div>Test</div>;
}
```

اگر این کار کرد، مشکل در routing یا components است.

## دستورات مفید

```bash
# پاک کردن cache و نصب مجدد dependencies
rm -rf node_modules package-lock.json
npm install

# اجرای type check
npm run type-check

# اجرای lint
npm run lint

# Build و بررسی خطاها
npm run build
```

## نکات مهم

1. اطمینان از نصب همه dependencies: `npm install`
2. بررسی وجود فایل `.env` در صورت نیاز
3. بررسی پورت 3000 برای اجرای dev server
4. بررسی proxy settings در `vite.config.ts`

