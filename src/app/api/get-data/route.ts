// src/app/api/get-data/route.ts

import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { getSession } from '@/app/lib/session';

export async function GET() { 
  const supabase = createClient();
  try {
    const session = await getSession();

    if (!session.isLoggedIn || !session.username) {
      return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 401 });
    }

    // Supabase'den veriyi 'eleman_row' sütununa göre sıralı çekiyoruz.
    // Null (boş) olanları en sona atmasını sağlıyoruz.
    const { data, error } = await supabase
      .from('elemanlar')
      .select('*')
      .order('eleman_row', { ascending: true, nullsFirst: false });

    if (error) {
      console.error("Supabase'den veri çekilirken hata:", error);
      throw new Error("Veritabanından elemanlar çekilirken bir hata oluştu.");
    }
    
    return NextResponse.json({ 
      success: true, 
      loggedInUsername: session.username,
      results: data // Artık 'results' Supabase'den geliyor
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen bir hata oluştu.';
    console.error('get-data API rotasında hata:', error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}