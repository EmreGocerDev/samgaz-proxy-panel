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
  eleman_id: string; // UUID olarak tanımlandı, ancak Samgaz API'den bigint değer geliyorsa uyum için string'e çevrilmeli (value: number)
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
  eleman_ilce: string | null; // Metin olarak tutulacak (ilcekodu.name ile eşleşecek)
  eleman_row: number | null; // Sıra numarası
  eleman_dosya1: string | null;
  eleman_dosya2: string | null;
  eleman_dosya3: string | null;
  eleman_dosya4: string | null;
  eleman_dosya5: string | null;
  eleman_dosya6: string | null;
  eleman_dosya7: string | null;
  eleman_dosya8: string | null;

  // YENİ EKLENEN KOLONLAR:
  eleman_grupkodu_id: number | null; // Supabase'deki BIGINT'e karşılık number
  eleman_iskodu_id: number | null;   // Supabase'deki BIGINT'e karşılık number
  eleman_filterA: string | null;
  eleman_filterB: string | null;
  eleman_filterC: string | null;
  eleman_filterD: string | null;
  eleman_filterE: string | null;
  eleman_filterF: string | null;

  created_at: string;
  updated_at: string;
};


// Supabase public.ilcekodu tablosu için tip (eski 'ilcekodu' görselinden - bigint ID'li)
export type IlceKoduTable = {
  id: number; // bigint (int8)
  name: string; // varchar
  created_at?: string;
  updated_at?: string;
};

// Supabase public.grupkodu tablosu için tip (eski 'grupkodu' görselinden - bigint ID'li)
export type GrupKoduTable = {
  id: number; // bigint (int8)
  name: string; // varchar
  ilcekoduid: number | null; // bigint (int8) REFERENCES ilcekodu(id) - null olabilir
  created_at?: string;
  updated_at?: string;
};

// Supabase public.iskodu tablosu için tip (eski 'iskodu' görselinden - bigint ID'li)
export type IsKoduTable = {
  id: number; // bigint (int8)
  name: string; // varchar
  grupkoduid: number | null; // bigint (int8) REFERENCES grupkodu(id) - null olabilir
  created_at?: string;
  updated_at?: string;
};

// Senkronizasyon API'sinden dönecek sonuç tipi
export interface SyncResult {
  success: boolean;
  message: string;
  addedCount: number;
  deletedCount: number;
  error?: string;
}