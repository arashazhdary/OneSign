# رفع مشکل Cache Vite

اگر خطای `useLocale is not defined` می‌بینید، احتمالاً مشکل از cache Vite است.

## راه حل:

### 1. متوقف کردن dev server
اگر در حال اجرا است، آن را متوقف کنید (Ctrl+C)

### 2. پاک کردن cache
```powershell
cd onesign-admin-portal-react
Remove-Item -Recurse -Force node_modules\.vite -ErrorAction SilentlyContinue
```

یا به صورت دستی:
- پوشه `node_modules\.vite` را حذف کنید

### 3. Restart کردن dev server
```bash
npm run dev
```

### 4. Hard Refresh در مرورگر
- Chrome/Edge: Ctrl+Shift+R یا Ctrl+F5
- Firefox: Ctrl+Shift+R

## بررسی فایل

فایل `src/hooks/useLocale.ts` باید وجود داشته باشد و شامل:
```typescript
export const useLocale = (): string => {
  const { i18n } = useTranslation();
  return i18n?.language || 'en';
};
```

باشد.

## اگر مشکل ادامه داشت:

1. بررسی کنید که فایل `src/hooks/useLocale.ts` ذخیره شده است
2. بررسی کنید که import در فایل‌های استفاده‌کننده درست است:
   ```typescript
   import { useLocale } from '@/hooks/useLocale';
   ```
3. TypeScript Server را در IDE restart کنید (VS Code: Ctrl+Shift+P -> "TypeScript: Restart TS Server")

