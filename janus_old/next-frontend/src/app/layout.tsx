
'use client';
import "./globals.css";
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from "@/lib/auth/AuthContext";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider attribute="class" defaultTheme="light">
          <AuthProvider>
            <main>{children}</main>
            <Toaster position="top-right" />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}