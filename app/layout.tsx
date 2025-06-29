import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { DataProvider } from '@/contexts/data-context';
import { Sidebar } from '@/components/layout/sidebar';
import { Toaster } from '@/components/ui/sonner';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Data Alchemist - AI Resource Allocation Configurator',
  description: 'Transform messy spreadsheets into optimized resource allocation with AI-powered data processing',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={inter.className}>
        <DataProvider>
          <div className="flex h-screen bg-[#fafbfc]">
            <Sidebar />
            <main className="flex-1 overflow-auto page-container">
              {children}
            </main>
          </div>
          <Toaster />
        </DataProvider>
      </body>
    </html>
  );
}