'use client';

import { Toaster } from 'sonner';

export { toast } from 'sonner';

export function ToastProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Toaster
        position="bottom-right"
        richColors
        closeButton
        duration={4000}
        toastOptions={{
          style: {
            background: 'rgb(15 23 42 / 0.95)',
            border: '1px solid rgba(255,255,255,0.08)',
            backdropFilter: 'blur(12px)',
          },
        }}
      />
    </>
  );
}
