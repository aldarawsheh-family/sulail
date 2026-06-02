import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import UserProvider from "@/components/UserProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "سليل | المنصة الرقمية للأنساب",
  description: "ديوان قبيلتك الخالد",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Reem+Kufi:wght@400;500;600;700&family=Tajawal:wght@300;400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body">
        <UserProvider>
          <Navbar />
          {children}
        </UserProvider>
      </body>
    </html>
  );
}