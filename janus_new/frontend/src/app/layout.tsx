import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Janus Frontend",
  description: "Frontend for the Janus application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
