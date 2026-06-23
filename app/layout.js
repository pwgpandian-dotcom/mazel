import Providers from '@/components/Providers';
import './globals.css';

export const metadata = {
  title: 'Mazel — Your Lucky Marketplace',
  description: 'Shop on Mazel. Quality products from trusted sellers.',
  manifest: '/manifest.json',
  appleWebApp: { capable: true, statusBarStyle: 'default', title: 'Mazel' },
  icons: {
    apple: '/mazel-apple-touch-icon.png',
  },
};

export const viewport = {
  themeColor: '#E0A500',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" sizes="180x180" href="/mazel-apple-touch-icon.png" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <script
          dangerouslySetInnerHTML={{
            __html: `if ('serviceWorker' in navigator) { window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js')); }`,
          }}
        />
      </head>
      <body className="h-full antialiased" style={{ backgroundColor: '#f9fafb' }}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
