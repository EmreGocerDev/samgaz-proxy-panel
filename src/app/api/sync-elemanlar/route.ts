// src/app/api/sync-elemanlar/route.ts

import { NextResponse } from 'next/server';
import { loginSamgaz } from '../../lib/auth';
import { createClient } from '@/utils/supabase/server'; 
import { Eleman, SamgazApiUser, SyncResult } from '@/types/database';

export async function POST(request: Request) {
  const supabase = createClient(); 

  try {
    const { username, password, connectionType } = await request.json();

    if (!username || !password || !connectionType) {
      return NextResponse.json<SyncResult>({
        success: false,
        message: 'Kullanıcı adı, parola ve bağlantı türü zorunludur.',
        addedCount: 0,
        deletedCount: 0,
        error: 'Eksik kimlik bilgileri'
      }, { status: 400 });
    }

    // --- DEBUG 1: Samgaz'dan veri çekme ---
    console.log("\n--- DEBUG BİLGİLERİ ---");
    console.log("1. Adım: Samgaz API'sine giriş yapılıyor...");
    const samgazLoginResult = await loginSamgaz(username, password, connectionType);

    if (!samgazLoginResult.success || !samgazLoginResult.data?.results) {
        console.error("Samgaz'dan veri alınamadı. Dönen cevap:", samgazLoginResult);
      return NextResponse.json<SyncResult>({
        success: false,
        message: samgazLoginResult.message || 'Samgaz API\'den kullanıcı listesi alınamadı.',
        addedCount: 0,
        deletedCount: 0,
        error: 'Samgaz API hatası'
      }, { status: 401 });
    }

    const samgazUsers: SamgazApiUser[] = samgazLoginResult.data.results;
    const samgazUserIds = new Set(samgazUsers.map(u => String(u.value))); 
    console.log(`2. Adım: Samgaz'dan ${samgazUsers.length} kullanıcı başarıyla çekildi.`);
    // console.log("Samgaz Kullanıcıları (ilk 5):", samgazUsers.slice(0, 5)); // Gelen veriyi görmek için logu açabilirsin

    // --- DEBUG 2: Supabase'den veri çekme ---
    console.log("3. Adım: Supabase veritabanından mevcut elemanlar çekiliyor...");
    const { data: supabaseElemanlar, error: supabaseError } = await supabase
      .from('elemanlar')
      .select('*');

    if (supabaseError) {
      console.error('Supabase elemanlar çekilirken hata:', supabaseError);
      return NextResponse.json<SyncResult>({
        success: false,
        message: 'Supabase\'den mevcut elemanlar çekilirken hata oluştu.',
        addedCount: 0,
        deletedCount: 0,
        error: supabaseError.message
      }, { status: 500 });
    }

    const existingElemanlar: Eleman[] = supabaseElemanlar || [];
    const existingElemanIds = new Set(existingElemanlar.map(e => String(e.eleman_id)));
    console.log(`4. Adım: Supabase'den ${existingElemanlar.length} eleman başarıyla çekildi.`);
    // console.log("Supabase Elemanları (ilk 5):", existingElemanlar.slice(0, 5));

    // --- DEBUG 3: Karşılaştırma ---
    let addedCount = 0;
    let deletedCount = 0;

    const elemanlarToAdd = samgazUsers.filter(samgazUser => !existingElemanIds.has(String(samgazUser.value)));
    console.log(`5. Adım: Karşılaştırma sonucu ${elemanlarToAdd.length} YENİ eleman bulundu.`);

    if (elemanlarToAdd.length > 0) {
      // ... (insert kodu aynı, değişiklik yok)
    }

    const elemanlarToDelete = existingElemanlar.filter(supabaseEleman => !samgazUserIds.has(String(supabaseEleman.eleman_id)));
    console.log(`6. Adım: Karşılaştırma sonucu ${elemanlarToDelete.length} SİLİNECEK eleman bulundu.`);
    console.log("--- DEBUG BİLGİLERİ SONU ---\n");

    if (elemanlarToDelete.length > 0) {
        // ... (delete kodu aynı, değişiklik yok)
    }

    // ... (geri kalan kod aynı, değişiklik yok)
    // Bu kısım sadece loglama için, kodun geri kalanı aynı
    if (elemanlarToAdd.length > 0) {
        const newElemanlarData = elemanlarToAdd.map(u => ({
          eleman_id: String(u.value), 
          eleman_name: u.label,
          eleman_bool1: false, eleman_bool2: false, eleman_bool3: false, eleman_bool4: false,
          eleman_bool5: false, eleman_bool6: false, eleman_bool7: false, eleman_bool8: false,
          eleman_bool9: false, eleman_bool10: false, eleman_bool11: false, eleman_bool12: false,
          eleman_ilce: null, eleman_row: null, eleman_dosya1: null, eleman_dosya2: null, 
          eleman_dosya3: null, eleman_dosya4: null, eleman_dosya5: null, eleman_dosya6: null, 
          eleman_dosya7: null, eleman_dosya8: null,
        }));
        const { error: insertError } = await supabase.from('elemanlar').insert(newElemanlarData);
        if (insertError) { console.error('Eleman eklenirken hata:', insertError); } 
        else { addedCount = elemanlarToAdd.length; }
    }
    if (elemanlarToDelete.length > 0) {
        const elemanIdsToDelete = elemanlarToDelete.map(e => e.eleman_id);
        const { error: deleteError } = await supabase.from('elemanlar').delete().in('eleman_id', elemanIdsToDelete);
        if (deleteError) { console.error('Eleman silinirken hata:', deleteError); }
        else { deletedCount = elemanlarToDelete.length; }
    }
    const message = `Senkronizasyon tamamlandı: ${addedCount} eleman eklendi, ${deletedCount} eleman silindi.`;
    return NextResponse.json<SyncResult>({
        success: true, message: message, addedCount: addedCount, deletedCount: deletedCount,
    }, { status: 200 });

  } catch (error) {
    // ... (hata yakalama bloğu aynı, değişiklik yok)
    let errorMessage = 'Bilinmeyen bir sunucu hatası oluştu.';
    if (error instanceof Error) { errorMessage = error.message; }
    console.error('Senkronizasyon API rotasında beklenmedik hata:', error);
    return NextResponse.json<SyncResult>({
        success: false, message: 'Senkronizasyon sırasında beklenmedik bir hata oluştu.',
        addedCount: 0, deletedCount: 0, error: errorMessage
    }, { status: 500 });
  }
}