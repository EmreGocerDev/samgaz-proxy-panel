// src/app/api/get-data/route.ts

import { NextResponse } from 'next/server';
// loginSamgaz fonksiyonunu src/lib/auth.ts'den import ediyoruz
import { loginSamgaz } from '../../lib/auth'; // Ekran görüntüsüne ve metninizdeki "getdataroute" kısmına göre yol: ../../lib/auth

export async function POST(request: Request) {
  try {
    const { username, password, connectionType } = await request.json();

    if (!username || !password || !connectionType) {
      return NextResponse.json({ error: 'Kullanıcı adı, parola ve bağlantı türü zorunludur.' }, { status: 400 });
    }

    // Hata ayıklama için gelen bilgileri loglayalım
    console.log('API rotasına gelen istek:', { username, connectionType });

    // loginSamgaz fonksiyonunu çağırıyoruz
    const loginResult = await loginSamgaz(username, password, connectionType);

    // Hata ayıklama için login fonksiyonundan dönen tüm sonucu loglayalım
    // Bu, hem loginSamgaz'ın başarı durumunu hem de AJAX isteğinden dönen data'yı gösterecektir.
    console.log('loginSamgaz fonksiyonundan dönen ham veri:', JSON.stringify(loginResult, null, 2));

    // Giriş işlemi başarısız olduysa veya gerekli client bilgisi dönmediyse
    if (!loginResult.success || !loginResult.client) {
      return NextResponse.json({ 
          error: loginResult.message || 'Giriş başarısız oldu veya oturum bilgisi alınamadı.' 
      }, { status: 401 });
    }

    // loginSamgaz fonksiyonu zaten groupUsers isteğini içerdiğinden,
    // onun döndürdüğü loginResult.data objesi zaten beklenen 'results' dizisini içermelidir.
    // Burada tekrar bir istek atmaya veya postData göndermeye GEREK YOK.
    const usersData = loginResult.data; 

    // usersData'nın beklenen 'results' dizisini içerip içermediğini kontrol et
    if (usersData && Array.isArray(usersData.results)) {
        // Başarılı bir şekilde kullanıcı listesini döndür
        return NextResponse.json({ 
            success: true, 
            results: usersData.results // Direkt 'results' dizisini döndürüyoruz
        });
    } else {
        // Eğer beklenen formatta gelmiyorsa (örn: results dizisi yoksa veya bir dizi değilse)
        // Bu durum, loginSamgaz'ın groupUsers isteğinden beklenen veriyi alamadığını gösterir.
        return NextResponse.json({ 
            success: false, 
            message: 'Kullanıcı listesi loginSamgaz’dan beklenen formatta alınamadı veya boş.' 
        }, { status: 200 }); // Ya da duruma göre 400 Bad Request
    }

  } catch (error) {
    let errorMessage = 'Bilinmeyen bir hata oluştu.';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    console.error('get-data API rotasında hata:', error); // Sunucu tarafında hatayı logla
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}