
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { AudioPlayer } from '@/components/audio/audio-player';
import { CookieBanner } from '@/components/layout/cookie-banner';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Calmify - Podcasts, Meditación y reconexión',
  description: 'Descubre una nueva forma de bienestar mental con Calmify. Podcasts inspiradores, meditaciones guiadas y sesiones de reconexión para transformar tu día a día.',
  keywords: 'podcast, meditación, reconexión, bienestar, mindfulness, relajación, crecimiento personal',
  authors: [{ name: 'Calmify Team' }],
  creator: 'Calmify',
  publisher: 'Calmify',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Calmify',
  },
  openGraph: {
    type: 'website',
    siteName: 'Calmify',
    title: 'Calmify - Tu compañero de bienestar mental',
    description: 'Podcasts, meditaciones y reconexión para una vida más plena y consciente.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Calmify - Bienestar Mental',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Calmify - Tu compañero de bienestar mental',
    description: 'Podcasts, meditaciones y reconexión para una vida más plena y consciente.',
    images: ['/og-image.png'],
  },
  other: {
    'mobile-web-app-capable': 'yes',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <div className="min-h-screen bg-background flex flex-col">
            <Header />
            <main className="flex-1 pb-20">
              {children}
            </main>
            <Footer />
            <AudioPlayer />
            <CookieBanner />
          </div>
        </Providers>
      </body>
    </html>
  );
}
