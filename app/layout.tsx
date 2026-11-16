import type { Metadata } from "next";
import { cormorant, manrope } from "./fonts";
import "./globals.css";
import { AppShell } from "@/components/layout/AppShell";

export const metadata: Metadata = {
  title: "PETROFLOW — Station Management",
  description: "Enterprise petrol pump and fuel retail outlet management system.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${cormorant.variable} ${manrope.variable} dark`}>
      <body className="font-sans antialiased bg-bg text-text selection:bg-selection">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
