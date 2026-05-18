import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "ByDesign CRM",
  description: "Digital Marketing Command Center",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ display: 'flex', minHeight: '100vh', background: '#0b0f1a' }}>
        <Sidebar />
        <main style={{ marginLeft: 230, flex: 1, minHeight: '100vh', padding: '32px 36px', maxWidth: 'calc(100vw - 230px)' }}>
          {children}
        </main>
      </body>
    </html>
  );
}
