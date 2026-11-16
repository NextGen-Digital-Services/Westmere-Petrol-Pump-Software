import type { Metadata } from "next";
import { plusJakartaSans, inter } from "./fonts";
import "./globals.css";
import { AppShell } from "@/components/layout/AppShell";

export const metadata: Metadata = {
  title: "PETROFLOW — IndianOil Station Management",
  description: "Enterprise Indian Oil retail outlet operational management and automated reconciliation system.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${plusJakartaSans.variable} ${inter.variable}`}>
      <body className="font-sans antialiased bg-bg text-text selection:bg-selection">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
