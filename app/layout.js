import Providers from '@/components/Providers';
import './globals.css';

export const metadata = {
  title: 'Mazel — Your Lucky Marketplace',
  description: 'Shop on Mazel. Quality products from trusted sellers.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full antialiased">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
