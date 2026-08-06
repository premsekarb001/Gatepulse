import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/Header';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: 'GatePulse - IT Park Job Walk-in Drive Intelligence & Gate Navigator',
  description: 'Real-time verified job walk-in drives with IT park landmark gate directions, Gemini AI trust scoring, and fraud warnings.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-slate-100 antialiased min-h-screen">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
