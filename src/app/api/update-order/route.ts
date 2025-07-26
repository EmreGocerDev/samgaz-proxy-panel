// src/app/api/update-order/route.ts

import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { Eleman } from '@/types/database';

export async function POST(request: Request) {
  const supabase = createClient();
  
  try {
    const orderedUsers: Eleman[] = await request.json();

    if (!orderedUsers || orderedUsers.length === 0) {
      return NextResponse.json({ success: false, message: 'Geçersiz veri.' }, { status: 400 });
    }

    // --- DEĞİŞİKLİK BURADA ---
    // Güncellenecek verilerin arasına 'eleman_name'i de ekliyoruz.
    const updates = orderedUsers.map((user, index) => ({
      eleman_id: user.eleman_id,
      eleman_name: user.eleman_name, // Bu satır eklendi
      eleman_row: index + 1 
    }));

    // 'upsert' komutu, 'eleman_id'ye göre kaydı bulur
    // ve sadece belirtilen alanları ('eleman_name' ve 'eleman_row') günceller.
    const { error } = await supabase.from('elemanlar').upsert(updates);

    if (error) {
      console.error("Sıralama güncellenirken Supabase hatası:", error);
      throw new Error("Veritabanı sıralaması güncellenirken bir hata oluştu.");
    }

    return NextResponse.json({ success: true, message: 'Sıralama başarıyla güncellendi.' });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen bir sunucu hatası.';
    return NextResponse.json({ success: false, message: errorMessage }, { status: 500 });
  }
}