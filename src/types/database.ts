// src/types/database.ts

// Samgaz API'den gelen kullanıcı tipi
export interface SamgazApiUser {
  value: number; // Samgaz'daki kullanıcının ID'si
  label: string; // Samgaz'daki kullanıcının görünen adı
}

// Samgaz API'den gelen genel yanıt tipi
export interface ApiUserResponse {
  success: boolean;
  message?: string;
  client?: import('axios').AxiosInstance | null; // loginSamgaz için AxiosInstance, get-data için gelmez
  data?: {
    results: SamgazApiUser[];
  } | null;
  results?: SamgazApiUser[]; // get-data API'si doğrudan 'results' döndürüyorsa
}

// Supabase public.elemanlar tablosu için tip
export type Eleman = {
  eleman_id: string; // UUID
  eleman_name: string;
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
  eleman_ilce: string | null; // Metin olarak tutulacak
  eleman_row: number | null; // Sıra numarası
  eleman_dosya1: string | null;
  eleman_dosya2: string | null;
  eleman_dosya3: string | null;
  eleman_dosya4: string | null;
  eleman_dosya5: string | null;
  eleman_dosya6: string | null;
  eleman_dosya7: string | null;
  eleman_dosya8: string | null;
  created_at: string;
  updated_at: string;
};

// Supabase public.ilceler tablosu için tip
export type Ilce = {
  ilce_id: string; // UUID
  ilce_name: string;
  created_at: string;
};

// Supabase public.iskodu tablosu için tip
export type IsKodu = {
  iskodu_id: string; // UUID
  iskodu_name: string;
  created_at: string;
};

// Supabase public.grupkodu tablosu için tip
export type GrupKodu = {
  grupkodu_id: string; // UUID
  grupkodu_name: string;
  created_at: string;
};

// Senkronizasyon API'sinden dönecek sonuç tipi
export interface SyncResult {
  success: boolean;
  message: string;
  addedCount: number;
  deletedCount: number;
  error?: string;
}