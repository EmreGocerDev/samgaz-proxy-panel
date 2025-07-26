// src/utils/supabase/client.ts

// `createBrowserClient` fonksiyonunu `@supabase/ssr`'dan import ediyoruz
import { createBrowserClient } from '@supabase/ssr'

// Fonksiyonun adını `createClient` olarak bırakıyoruz
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}