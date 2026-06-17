import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { OneSecHeader } from '@/components/layout/OneSecHeader';
import { Footer } from '@/components/layout/Footer';
import { ClientProvider } from '@/components/layout/ClientProvider';

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'OneSec — Донаты, валюта, ключи, подписки',
  description: 'Самый выгодный донат-магазин 2026',
};

export const viewport: Viewport = {
  colorScheme: 'dark',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={`${inter.variable} scroll-smooth dark-mode`} suppressHydrationWarning>
      <body className="bg-primary text-primary antialiased">
        <ClientProvider>
          <OneSecHeader />
          <main className="min-h-screen bg-primary">{children}</main>
          <Footer />
        </ClientProvider>
      </body>
    </html>
  );
}
