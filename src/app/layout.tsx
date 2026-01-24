import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Video Transcript Pro - TikTok, Facebook & YouTube",
  description: "Trích xuất transcript từ video TikTok, Facebook và YouTube một cách nhanh chóng và chính xác.",
  keywords: ["transcript", "tiktok", "facebook", "youtube", "video", "download", "transcription", "gemini"],
};

import { Footer, Header } from "@/components";
import { Providers } from "@/components/Providers";
import { Toaster } from 'sonner';

// This script runs BEFORE React hydrates, preventing the flash of wrong theme
const themeInitScript = `
  (function() {
    try {
      var theme = localStorage.getItem('theme');
      if (theme === 'light') {
        document.documentElement.classList.add('light');
        document.documentElement.classList.remove('dark');
      } else {
        // Default to dark
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
      }
    } catch (e) {
      document.documentElement.classList.add('dark');
    }
  })();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        {/* Inline script to set theme before React loads, preventing flash */}
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className={`${inter.variable} antialiased min-h-screen flex flex-col`} suppressHydrationWarning>
        <Providers>
          <Header />
          <div className="flex-1">
            {children}
          </div>
          <Footer />
          <Toaster position="top-center" richColors />
        </Providers>
      </body>
    </html>
  );
}
