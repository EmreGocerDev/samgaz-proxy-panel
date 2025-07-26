// src/app/actions.ts
'use server'; // Bu dosyanın sunucuda çalıştığını belirtir

import { redirect } from 'next/navigation';
// Sadece hata devam ederse bu şekilde değiştir:
import { getSession } from './lib/session'; // Kendi session fonksiyonumuzu import ediyoruz
import { loginSamgaz } from './lib/auth';
import { z } from 'zod'; // Veri doğrulama için kütüphanemiz

// Formdan gelen veriyi doğrulamak için bir şema
const LoginFormSchema = z.object({
  username: z.string().min(1, { message: "Kullanıcı adı boş olamaz." }),
  password: z.string().min(1, { message: "Parola boş olamaz." }),
  connectionType: z.enum(['forticlient', 'yerel']),
});

// Server Action fonksiyonumuz
export async function handleLogin(prevState: string | undefined, formData: FormData) {
  try {
    // 1. Form verilerini doğrula
    const validatedFields = LoginFormSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
      // Eğer doğrulama başarısızsa, hata mesajı döndür
      return 'Lütfen tüm alanları doldurun.';
    }
    
    const { username, password, connectionType } = validatedFields.data;

    // 2. Samgaz'a giriş yapmayı dene
    const result = await loginSamgaz(username, password, connectionType);

    if (!result.success) {
      return result.message || 'Kullanıcı adı veya parola hatalı.';
    }

    // 3. Giriş başarılıysa, session'ı oluştur ve kaydet
    const session = await getSession();
    session.username = username;
    session.password = password;
    session.connectionType = connectionType;
    session.isLoggedIn = true;
    await session.save();

  } catch (error) {
    if (error instanceof Error) {
      return 'Beklenmedik bir hata oluştu: ' + error.message;
    }
    return 'Giriş sırasında bilinmeyen bir sunucu hatası oluştu.';
  }

  // 4. Her şey yolundaysa, sunucu tarafından dashboard'a yönlendir
  redirect('/dashboard');
}