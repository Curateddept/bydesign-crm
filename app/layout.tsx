import type { Metadata } from "next";
import "./globals.css";
import AdminLayout from "@/components/AdminLayout";

export const metadata: Metadata = {
  title: "ByDesign CRM",
  description: "Digital Marketing Command Center",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ display: 'flex', minHeight: '100vh', background: '#0b0f1a' }}>
        <AdminLayout>{children}</AdminLayout>
      </body>
    </html>
  );
}
