import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Onesign Login Portal",
  description: "Sign in to your account",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Get locale from headers (set by next-intl middleware)
  // Default to 'en' if not found to avoid calling getLocale() which may trigger notFound()
  const headersList = await headers();
  const locale = headersList.get('x-next-intl-locale') || 'en';
  const dir = locale === 'fa' ? 'rtl' : 'ltr';
  
  // Root layout must have html and body tags
  return (
    <html lang={locale} dir={dir}>
      <body>
        {children}
      </body>
    </html>
  );
}
