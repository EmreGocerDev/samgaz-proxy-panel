// src/types/database.ts

// Supabase public.elemanlar tablosu için temizlenmiş tip
export interface Eleman {
  eleman_id: string;
  eleman_name: string;
  created_at: string;
  updated_at: string;
  eleman_ilce: string | null;
  eleman_row: number | null;
  eleman_dosya1: number | null;
  eleman_dosya2: number | null;
  eleman_dosya3: number | null;
  eleman_dosya4: number | null;
  eleman_dosya5: number | null;
  eleman_dosya6: number | null;
  eleman_dosya7: number | null;
  eleman_dosya8: number | null;
  eleman_bool1: boolean;
  eleman_bool2: boolean;
  eleman_bool3: boolean;
  eleman_bool4: boolean;
  eleman_bool5: boolean;
  eleman_bool6: boolean;
  eleman_bool7: boolean;
  eleman_bool8: boolean;
  eleman_bool9: boolean;
  eleman_bool10: boolean;
  eleman_bool11: boolean;
  eleman_bool12: boolean;
  is_active: boolean;
}
// Samgaz API'sinden gelen kullanıcı listesindeki her bir kullanıcı için tip
export interface SamgazApiUser {
  value: number;
  label: string;
}
// Supabase public.ilcekodu tablosu için tip
export interface IlceKoduTable {
  id: number;
  name: string;
  created_at?: string;
  updated_at?: string;
}

// Supabase public.grupkodu tablosu için tip
export interface GrupKoduTable {
  id: number;
  name: string;
  ilcekoduid: number | null;
  created_at?: string;
  updated_at?: string;
}

// Supabase public.iskodu tablosu için tek ve doğru tip
// DİKKAT: grupkoduid'nin null olabileceğini belirtiyoruz
export interface Iskodu {
  id: number;
  name: string;
  grupkoduid: number | null;
}

// Bu sayfada artık kullanılmadığı için Stabilizasyon tipi kaldırıldı.
// Senkronizasyon tipleri ve diğerleri burada kalabilir.
export interface SyncResult {
  success: boolean;
  message: string;
  addedCount: number;
  deletedCount: number;
  updatedCount?: number;
  error?: string;
}