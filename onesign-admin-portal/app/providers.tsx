'use client';

import { ReactNode } from 'react';
import {
  AuthProvider,
  ThemeProvider,
  TenantProvider,
  NotificationProvider,
  UIProvider,
} from '@/app/contexts';

interface ProvidersProps {
  children: ReactNode;
}

/**
 * Combined Providers Wrapper
 *
 * تمام Context Providers را در این کامپوننت ترکیب می‌کنیم
 * تا در layout اصلی به راحتی استفاده شود
 *
 * @example
 * // در layout.tsx
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <body>
 *         <Providers>
 *           {children}
 *         </Providers>
 *       </body>
 *     </html>
 *   );
 * }
 */
export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider defaultTheme="system">
      <AuthProvider>
        <TenantProvider>
          <NotificationProvider>
            <UIProvider>
              {children}
            </UIProvider>
          </NotificationProvider>
        </TenantProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
