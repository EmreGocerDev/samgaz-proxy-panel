// src/app/api/get-data/route.ts

import { NextResponse } from 'next/server';
import { loginSamgaz } from '../../lib/auth';
import { getSession } from '../../lib/session'; // Kendi session fonksiyonumuzu import ediyoruz

// DİKKAT: Fonksiyon POST'tan GET'e değişti
export async function GET() { 
  try {
    // 1. Adım: Session'ı cookie'den oku
    const session = await getSession();

    // 2. Adım: Kullanıcı giriş yapmış mı diye kontrol et
    if (!session.isLoggedIn || !session.username || !session.password || !session.connectionType) {
      return NextResponse.json({ error: 'Yetkisiz erişim. Lütfen giriş yapın.' }, { status: 401 });
    }

    console.log(`get-data API'ı tetiklendi. Session'dan gelen kullanıcı: '${session.username}'`);

    // 3. Adım: Session'daki bilgileri kullanarak Samgaz'a giriş yap
    const loginResult = await loginSamgaz(session.username, session.password, session.connectionType);

    if (!loginResult.success || !loginResult.data) {
      return NextResponse.json({ 
        error: loginResult.message || 'Giriş başarısız oldu veya oturum bilgisi alınamadı.' 
      }, { status: 401 });
    }

    const usersData = loginResult.data;

    if (usersData && Array.isArray(usersData.results)) {
      // 4. Adım: Başarılı yanıta, giriş yapan kullanıcının adını da ekle
      return NextResponse.json({ 
        success: true, 
        loggedInUsername: session.username, // Sidebar'da göstermek için kullanıcı adını da yolluyoruz
        results: usersData.results
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        message: 'Kullanıcı listesi beklenen formatta alınamadı veya boş.' 
      }, { status: 500 });
    }

  } catch (error) {
    let errorMessage = 'Bilinmeyen bir hata oluştu.';
    if (error instanceof Error) { errorMessage = error.message; }
    console.error('get-data API rotasında hata:', error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}