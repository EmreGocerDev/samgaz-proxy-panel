import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createClient() {
  const cookieHandler = {
    async get(name: string) {
      return (await cookies()).get(name)?.value
    },
    async set(name: string, value: string, options: CookieOptions) {
      try {
        (await cookies()).set({ name, value, ...options })
      } catch {
        // Hata durumunda sessiz kal
      }
    },
    async remove(name: string, options: CookieOptions) {
      try {
        (await cookies()).set({ name, value: '', ...options })
      } catch {
        // Hata durumunda sessiz kal
      }
    },
  }

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: cookieHandler }
  )
}