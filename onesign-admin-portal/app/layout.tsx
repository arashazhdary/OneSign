import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Onesign Admin Portal",
  description: "Admin portal for Onesign SSO",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
