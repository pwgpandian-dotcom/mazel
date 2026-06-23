import Providers from '@/components/Providers';
import './globals.css';

export const metadata = {
  title: 'Mazel — Your Lucky Marketplace',
  description: 'Shop on Mazel. Quality products from trusted sellers.',
  manifest: '/manifest.json',
  appleWebApp: { capable: true, statusBarStyle: 'default', title: 'Mazel' },
};

export const viewport = {
  themeColor: '#1B2A4A',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
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
