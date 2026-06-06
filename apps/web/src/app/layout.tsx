import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GiLabs Mitra Portal",
  description: "Partner portal untuk referral, lead qualification, dan knowledge center GiLabs.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="h-full antialiased">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
