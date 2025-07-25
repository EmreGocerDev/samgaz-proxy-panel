// src/app/api/login-proxy/route.ts

import { NextResponse } from 'next/server';
// Proje kurulumunda alias'a hayır dediğiniz için relativ yol kullanıyoruz
// Ekran görüntüsüne göre lib klasörü api ile aynı seviyede olduğu için: ../../lib/auth
import { loginSamgaz } from '../../lib/auth';

export async function POST(request: Request) {
  try {
    // Artık body'den 3 bilgi bekliyoruz
    const { username, password, connectionType } = await request.json();

    if (!username || !password || !connectionType) {
      return NextResponse.json({ success: false, message: 'Kullanıcı adı, parola ve bağlantı türü zorunludur.' }, { status: 400 });
    }

    // Ayrı dosyaya taşıdığımız giriş fonksiyonuna connectionType'ı da gönderiyoruz
    // Bu 'result' objesi sadece login başarılı mı, değil mi bilgisini içerir.
    // Kullanıcı listesi burada geri dönmez.
    const result = await loginSamgaz(username, password, connectionType);

    if (result.success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ success: false, message: result.message }, { status: 401 });
    }
    
  } catch (error) {
    console.error('API Rotasında Beklenmedik Hata:', error);
    return NextResponse.json({ success: false, message: 'Sunucuda beklenmedik bir hata oluştu.' }, { status: 500 });
  }
}