import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { NextAuthProvider } from '@/components/auth/NextAuthProvider';
import Navbar from '@/components/layout/Navbar';
import Script from 'next/script';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'MangoSpace - The Premium Guest Posting Marketplace',
  description: 'Buy and sell high-quality backlinks and guest posts. Secure, fast, and feature-rich.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50 min-h-screen font-sans text-gray-900 selection:bg-green-100 selection:text-green-900`}>
        <Script 
          src="https://checkout.razorpay.com/v1/checkout.js" 
          strategy="beforeInteractive"
        />
        <NextAuthProvider>
          <AuthProvider>
            <div className="flex flex-col min-h-screen">
              <Navbar />
              <main className="flex-grow">
                {children}
              </main>
              <footer className="py-8 border-t border-gray-200 text-center text-gray-400 text-sm bg-white">
                <p>&copy; {new Date().getFullYear()} MangoSpace. Built with Next.js &amp; PostgreSQL.</p>
              </footer>
              <Toaster position="bottom-right" reverseOrder={false} />
            </div>
          </AuthProvider>
        </NextAuthProvider>
        <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      </body>
    </html>
  );
}

