
import React from 'react';

// Added optionality to the children prop to fix the TypeScript error in index.tsx
// that occurs when the compiler doesn't correctly infer children from JSX nesting.
export default function RootLayout({
  children,
}: {
  children?: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 antialiased selection:bg-white/10">
      {children}
    </div>
  );
}
