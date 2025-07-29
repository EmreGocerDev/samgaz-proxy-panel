import axios, { type AxiosInstance } from 'axios';
import { CookieJar } from 'tough-cookie';
import { wrapper } from 'axios-cookiejar-support';

const jar = new CookieJar();
const client = wrapper(axios.create({ jar }));

interface LoginResult {
    success: boolean;
    message?: string;
    client?: AxiosInstance | null;
    data?: {
        results: Array<{
            value: number;
            label: string;
        }>;
    } | null;
}

export async function loginSamgaz(username: string, password: string, connectionType: string): Promise<LoginResult> {
  // Geliştirme ortamında SSL doğrulaması kapatılabilir, canlıda değil.
  if (process.env.NODE_ENV === 'development') {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  }

  try {
    // --- DEĞİŞİKLİK BURADA ---
    // Artık Samgaz'a doğrudan değil, Fly.io'daki proxy sunucumuz üzerinden gidiyoruz.
    const proxyBaseUrl = 'https://samgaz-proxy.fly.dev';

    const loginActionUrl = `${proxyBaseUrl}/j_spring_security_check`;
    const verificationUrl = `${proxyBaseUrl}/ajaxLookup/groupUsers`;
    // --- DEĞİŞİKLİK BİTTİ ---

    const loginData = new URLSearchParams();
    loginData.append('j_username', username);
    loginData.append('j_password', password);
    // Proxy'nin hangi adrese gideceğini bilmesi için connectionType'ı da gönderiyoruz.
    loginData.append('connectionType', connectionType);

    const loginResponse = await client.post(loginActionUrl, loginData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      validateStatus: (status) => (status >= 200 && status < 300) || status === 403
    });

    if (loginResponse.status !== 200) {
        return { success: false, message: 'Kullanıcı adı veya parola hatalı.', client: null, data: null };
    }

    const verificationPostData = new URLSearchParams();
    verificationPostData.append('query', '709');
    // Proxy'ye yine hangi tür bağlantı olduğunu bildirelim.
    verificationPostData.append('connectionType', connectionType);

    const verificationResponse = await client.post(verificationUrl, verificationPostData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-Requested-With': 'XMLHttpRequest',
      },
      validateStatus: (status) => status >= 200 && status < 300
    });

    const jsonResponse = verificationResponse.data;

    if (jsonResponse && Array.isArray(jsonResponse.results) && jsonResponse.results.length > 0) {
      console.log(`Giriş Başarılı (Proxy üzerinden)! AJAX doğrulaması olumlu ve kullanıcı listesi alındı.`);
      return { success: true, client: client, data: jsonResponse };
    } else {
      console.log(`Giriş Başarısız. AJAX doğrulaması geçersiz yanıt döndürdü veya kullanıcı listesi boş.`);
      return { success: false, message: 'Kullanıcı adı veya parola hatalı ya da kullanıcı listesi alınamadı.', client: null, data: null };
    }

  } catch (error) {
    let errorMessage = 'Proxy sunucusuna veya harici API\'ye bağlanırken bir hata oluştu.';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    console.error('Login fonksiyonunda hata:', errorMessage);
    return { success: false, message: errorMessage, client: null, data: null };
  } finally {
    if (process.env.NODE_ENV === 'development') {
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = '1';
    }
  }
}