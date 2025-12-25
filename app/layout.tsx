import React from 'react';

interface RootLayoutProps {
  children?: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 antialiased selection:bg-white/10">
      {children}
    </div>
  );
}