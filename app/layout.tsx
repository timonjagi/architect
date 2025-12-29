
import React from 'react';
import './globals.css';
import { Inter } from 'next/font/google';
import AuthProvider from './components/AuthProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Architect',
  description: 'The Future of System Design',
};

interface RootLayoutProps {
  children?: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-slate-950 text-slate-100 antialiased selection:bg-white/10`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
