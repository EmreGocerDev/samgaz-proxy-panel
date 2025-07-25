// src/lib/auth.ts

import axios, { AxiosInstance } from 'axios';
import { CookieJar } from 'tough-cookie';
import { wrapper } from 'axios-cookiejar-support';

const jar = new CookieJar();
const client = wrapper(axios.create({ jar }));

// loginSamgaz fonksiyonunun dönüş tipi
interface LoginResult {
    success: boolean;
    message?: string;
    client?: AxiosInstance | null; // Axios istemcisini geri döndürebiliriz (veya null olabilir)
    data?: { // ajaxLookup/groupUsers'tan dönen JSON yapısı
        results: Array<{
            value: number;
            label: string;
        }>;
    } | null; // data null da olabilir
}

export async function loginSamgaz(username: string, password: string, connectionType: string): Promise<LoginResult> {
  
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'; // SADECE GELİŞTİRME ORTAMINDA KULLANIN!

  try {
    const baseUrlPrefix = connectionType === 'yerel' ? 'ws' : 'cm';
    const fullBaseUrl = `${baseUrlPrefix}.samgaz.com.tr:10000`;

    const loginActionUrl = `https://${fullBaseUrl}/j_spring_security_check`;
    const verificationUrl = `https://${fullBaseUrl}/ajaxLookup/groupUsers`; // Group users için URL
    
    // --- ADIM 1: GİRİŞ YAP ---
    const loginData = new URLSearchParams();
    loginData.append('j_username', username);
    loginData.append('j_password', password);

    const loginResponse = await client.post(loginActionUrl, loginData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      // Axios'un 403 gibi durumları hata olarak fırlatmasını engellemek için
      validateStatus: (status) => (status >= 200 && status < 300) || status === 403 
    });

    // Eğer giriş başarısız olduysa (örn: HTTP 403 Forbidden)
    if (loginResponse.status !== 200) {
        return { success: false, message: 'Kullanıcı adı veya parola hatalı.', client: null, data: null };
    }

    // --- ADIM 2: AJAX İSTEĞİ İLE KULLANICI LİSTESİNİ ÇEK ---
    const verificationPostData = new URLSearchParams();
    // ajaxLookup/groupUsers endpoint'i genellikle "query" parametresini POST body'de bekler.
    verificationPostData.append('query', '709'); 
    // Not: Eğer 'id' gibi ek bir parametre gerekiyorsa buraya ekleyin:
    // verificationPostData.append('id', '2858'); 

    const verificationResponse = await client.post(verificationUrl, verificationPostData, {
      headers: { 
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-Requested-With': 'XMLHttpRequest', // Bu başlık AJAX isteği olduğunu belirtir
      },
      validateStatus: (status) => status >= 200 && status < 300 // groupUsers'tan da sadece başarılı yanıtları bekliyoruz
    });

    const jsonResponse = verificationResponse.data; // groupUsers'tan dönen JSON objesi
    
    // jsonResponse'un beklenen 'results' dizisini içerip içermediğini kontrol et
    if (jsonResponse && Array.isArray(jsonResponse.results) && jsonResponse.results.length > 0) {
      console.log(`Giriş Başarılı (${baseUrlPrefix})! AJAX doğrulaması olumlu ve kullanıcı listesi alındı.`);
      // Başarılı durumda, Axios client'ı ve tüm jsonResponse'u (data olarak) döndür
      return { success: true, client: client, data: jsonResponse }; 
    } else {
      console.log(`Giriş Başarısız (${baseUrlPrefix}). AJAX doğrulaması geçersiz yanıt döndürdü veya kullanıcı listesi boş.`);
      return { success: false, message: 'Kullanıcı adı veya parola hatalı ya da kullanıcı listesi alınamadı.', client: null, data: null };
    }

  } catch (error) {
    let errorMessage = 'Sunucuya veya harici API\'ye bağlanırken bir hata oluştu.';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    console.error('Login fonksiyonunda hata:', errorMessage);
    return { success: false, message: errorMessage, client: null, data: null };
  } finally {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '1'; // İşlem bitince SSL doğrulamayı tekrar aç
  }
}