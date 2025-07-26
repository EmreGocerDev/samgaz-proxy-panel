// src/app/api/login-proxy/route.ts

import { NextResponse } from 'next/server';
import { loginSamgaz } from '../../lib/auth';
import { getSession } from '../../lib/session'; // Kendi session fonksiyonumuzu import ediyoruz

export async function POST(request: Request) {
  try {
    const { username, password, connectionType } = await request.json();

    if (!username || !password || !connectionType) {
      return NextResponse.json({ success: false, message: 'Kullanıcı adı, parola ve bağlantı türü zorunludur.' }, { status: 400 });
    }

    // Samgaz'a giriş yapmayı deniyoruz
    const result = await loginSamgaz(username, password, connectionType);

    if (result.success) {
      // --- YENİ EKLENEN KISIM ---
      // Giriş başarılıysa, session'ı alıp bilgileri kaydediyoruz.
      const session = await getSession();
      session.username = username;
      session.password = password; // Not: Şifre session'da şifrelenmiş olarak saklanır.
      session.connectionType = connectionType;
      session.isLoggedIn = true;
      await session.save(); // Session'ı cookie olarak kaydet

      console.log(`Session oluşturuldu: Kullanıcı '${username}' giriş yaptı.`);

      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ success: false, message: result.message }, { status: 401 });
    }
    
  } catch (error) {
    console.error('Login-Proxy API Rotasında Beklenmedik Hata:', error);
    return NextResponse.json({ success: false, message: 'Sunucuda beklenmedik bir hata oluştu.' }, { status: 500 });
  }
}