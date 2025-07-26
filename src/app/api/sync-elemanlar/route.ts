// src/app/api/sync-elemanlar/route.ts

import { NextResponse } from 'next/server';
import { loginSamgaz } from '../../lib/auth';
import { createClient } from '@/utils/supabase/server';
import { getSession } from '../../lib/session'; // Session fonksiyonumuzu import ediyoruz

// Bu API rotası, butona basıldığında bir işlem başlattığı için POST metodu kullanır.
export async function POST(request: Request) {
  const supabase = createClient(); 
  
  try {
    // 1. Adım: Session'ı cookie'den oku
    const session = await getSession();

    // 2. Adım: Kullanıcı giriş yapmış mı diye kontrol et
    if (!session.isLoggedIn || !session.username || !session.password || !session.connectionType) {
      return NextResponse.json({ success: false, message: 'Yetkisiz erişim. Lütfen tekrar giriş yapın.' }, { status: 401 });
    }

    // 3. Adım: Session'daki bilgileri kullanarak Samgaz'a giriş yap
    const samgazLoginResult = await loginSamgaz(session.username, session.password, session.connectionType);

    if (!samgazLoginResult.success || !samgazLoginResult.data?.results) {
      return NextResponse.json({ success: false, message: samgazLoginResult.message || 'Samgaz API\'den kullanıcı listesi alınamadı.' }, { status: 401 });
    }

    // --- Karşılaştırma ve Güncelleme Mantığı ---

    const samgazUsers = samgazLoginResult.data.results;
    const samgazUserIds = new Set(samgazUsers.map(u => String(u.value)));

    // Veritabanı yükünü azaltmak için sadece id'leri çekiyoruz
    const { data: supabaseElemanlar, error: supabaseError } = await supabase
      .from('elemanlar')
      .select('eleman_id');

    if (supabaseError) {
      console.error("Supabase'den eleman ID'leri çekilirken hata:", supabaseError);
      throw new Error('Veritabanından mevcut elemanlar okunurken bir hata oluştu.');
    }

    const existingElemanIds = new Set((supabaseElemanlar || []).map(e => String(e.eleman_id)));

    let addedCount = 0;
    let deletedCount = 0;

    // Eklenecek kullanıcıları bul
    const elemanlarToAdd = samgazUsers.filter(samgazUser => !existingElemanIds.has(String(samgazUser.value)));
    
    // Silinecek kullanıcıları bul
    const elemanlarToDelete = (supabaseElemanlar || []).filter(supabaseEleman => !samgazUserIds.has(String(supabaseEleman.eleman_id)));

    // Ekleme işlemini yap
    if (elemanlarToAdd.length > 0) {
      // Eklenecek veriyi hazırla (sadece gerekli alanlar)
      const newElemanlarData = elemanlarToAdd.map(u => ({ 
        eleman_id: String(u.value), 
        eleman_name: u.label 
      }));
      
      const { error } = await supabase.from('elemanlar').insert(newElemanlarData);
      if (error) {
        console.error("Supabase'e eleman eklenirken hata:", error);
        throw new Error('Yeni elemanlar veritabanına eklenirken bir hata oluştu.');
      }
      addedCount = elemanlarToAdd.length;
    }

    // Silme işlemini yap
    if (elemanlarToDelete.length > 0) {
      const elemanIdsToDelete = elemanlarToDelete.map(e => e.eleman_id);
      const { error } = await supabase.from('elemanlar').delete().in('eleman_id', elemanIdsToDelete);
      if (error) {
        console.error("Supabase'den eleman silinirken hata:", error);
        throw new Error('Eski elemanlar veritabanından silinirken bir hata oluştu.');
      }
      deletedCount = elemanlarToDelete.length;
    }

    // Başarılı sonuç mesajını oluştur
    const message = `Senkronizasyon tamamlandı: ${addedCount} kullanıcı eklendi, ${deletedCount} kullanıcı silindi.`;
    return NextResponse.json({ success: true, message: message });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen bir sunucu hatası oluştu.';
    console.error('Senkronizasyon API rotasında beklenmedik hata:', error);
    // Hata mesajını istemciye (client) gönder
    return NextResponse.json({ success: false, message: errorMessage }, { status: 500 });
  }
}