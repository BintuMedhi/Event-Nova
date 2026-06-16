import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/lib/AuthContext';
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';
import CopilotWidget from '@/components/ai/CopilotWidget';
import CustomCursor from '@/components/shared/CustomCursor';

// Satoshi & Cabinet Grotesk are loaded via CSS @import from Fontshare CDN in globals.css
// We still load Inter as a fallback variable for any legacy references
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'EventNova — Premium Event Discovery & Ticket Platform',
  description: 'Discover and book extraordinary events. AI-powered recommendations, secure tickets, and premium experiences — all in one place.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <body className={`${inter.variable} min-h-full flex flex-col antialiased`} style={{ fontFamily: "'Satoshi', system-ui, sans-serif" }} suppressHydrationWarning>
        <AuthProvider>
          <Navbar />
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
          <CopilotWidget />
          <CustomCursor />
        </AuthProvider>
      </body>
    </html>
  );
}
