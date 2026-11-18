import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ToastProvider } from '@/components/ui/Toast';

export const metadata: Metadata = {
  title: {
    default: 'UMKM Hub — Marketplace Digital Produk UMKM Terbaik Indonesia',
    template: '%s | UMKM Hub Indonesia',
  },
  description:
    'Platform marketplace resmi untuk memberdayakan UMKM Indonesia. Temukan kopi spesialti, batik tulis, kriya rotan, dan produk lokal berkualitas langsung dari pengrajin.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="flex min-h-screen flex-col bg-surface text-ink antialiased">
        <ToastProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </ToastProvider>
      </body>
    </html>
  );
}
