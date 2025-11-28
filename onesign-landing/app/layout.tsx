import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "OneSign - Enterprise Identity & Access Management",
  description: "Comprehensive enterprise IAM platform that protects your organization with advanced authentication, access control, and security governance.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
