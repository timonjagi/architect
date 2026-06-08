import { createBrowserClient } from '@supabase/ssr'

let browserClient: ReturnType<typeof createBrowserClient> | undefined

export function createClient() {
  if (browserClient) return browserClient

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

  if (!url || !key) {
    // During build/prerender env vars may not be available.
    // Return a proxy that no-ops so SSR doesn't crash.
    return new Proxy({} as ReturnType<typeof createBrowserClient>, {
      get(_, prop) {
        if (prop === 'auth') {
          return new Proxy({} as any, {
            get() {
              return () => Promise.resolve({ data: { user: null }, error: null })
            },
          })
        }
        return () => Promise.resolve({ data: null, error: null })
      },
    })
  }

  browserClient = createBrowserClient(url, key)

  return browserClient
}
