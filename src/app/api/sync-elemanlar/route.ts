// src/app/api/sync-elemanlar/route.ts

import { NextResponse } from 'next/server';
import { loginSamgaz } from '../../lib/auth'; // lib klasörünün yolu düzeltildi
import { createClient } from '@/utils/supabase/server';
import { getSession } from '@/app/lib/session'; // lib klasörünün yolu düzeltildi

export async function POST(request: Request) {
  const supabase = createClient(); 
  
  try {
    const session = await getSession();
    if (!session.isLoggedIn || !session.username || !session.password || !session.connectionType) {
      return NextResponse.json({ success: false, message: 'Yetkisiz erişim.' }, { status: 401 });
    }

    const samgazLoginResult = await loginSamgaz(session.username, session.password, session.connectionType);
    if (!samgazLoginResult.success || !samgazLoginResult.data?.results) {
      return NextResponse.json({ success: false, message: 'Samgaz API\'den kullanıcı listesi alınamadı.' }, { status: 401 });
    }

    const samgazUsers = samgazLoginResult.data.results;
    const samgazUserIds = new Set(samgazUsers.map(u => String(u.value)));

    const { data: supabaseElemanlar, error: supabaseError } = await supabase.from('elemanlar').select('eleman_id, eleman_row');
    if (supabaseError) throw new Error('Supabase\'den mevcut elemanlar çekilirken hata.');

    const existingElemanIds = new Set((supabaseElemanlar || []).map(e => String(e.eleman_id)));
    
    // Mevcut en yüksek 'eleman_row' değerini bul
    let maxRow = (supabaseElemanlar || []).reduce((max, p) => p.eleman_row > max ? p.eleman_row : max, 0);

    const elemanlarToAdd = samgazUsers.filter(samgazUser => !existingElemanIds.has(String(samgazUser.value)));
    const elemanlarToDelete = (supabaseElemanlar || []).filter(e => !samgazUserIds.has(String(e.eleman_id)));

    let addedCount = 0;
    let deletedCount = 0;

    if (elemanlarToAdd.length > 0) {
      const newElemanlarData = elemanlarToAdd.map((u, index) => ({ 
        eleman_id: String(u.value), 
        eleman_name: u.label,
        eleman_row: maxRow + index + 1 // Her yeni elemana artan bir sıra numarası ata
      }));
      const { error } = await supabase.from('elemanlar').insert(newElemanlarData);
      if (error) throw new Error('Yeni elemanlar eklenirken hata: ' + error.message);
      addedCount = elemanlarToAdd.length;
    }

    if (elemanlarToDelete.length > 0) {
      const elemanIdsToDelete = elemanlarToDelete.map(e => e.eleman_id);
      const { error } = await supabase.from('elemanlar').delete().in('eleman_id', elemanIdsToDelete);
      if (error) throw new Error('Eski elemanlar silinirken hata: ' + error.message);
      deletedCount = elemanlarToDelete.length;
    }

    const message = `Senkronizasyon tamamlandı: ${addedCount} kullanıcı eklendi, ${deletedCount} kullanıcı silindi.`;
    return NextResponse.json({ success: true, message: message });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen sunucu hatası.';
    console.error('Senkronizasyon API hatası:', errorMessage);
    return NextResponse.json({ success: false, message: errorMessage }, { status: 500 });
  }
}