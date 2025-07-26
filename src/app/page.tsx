// src/app/page.tsx

import Image from 'next/image';
import InteractiveBackground from '../components/InteractiveBackground';
import LoginForm from './login-form'; // Az önce oluşturduğumuz formu import ediyoruz

export default function LoginPage() {
  return (
    <main className="relative flex items-center justify-center min-h-screen overflow-hidden bg-gray-950">
      
      <div className="absolute top-8 left-1/2 -translate-x-1/2 z-30">
        <Image
          src="/logo.png"
          alt="Şirket Logosu"
          width={180}
          height={50}
          priority
          className="opacity-90"
        />
      </div>

      <InteractiveBackground />
      <div className="absolute z-10 w-[56rem] h-[56rem] bg-cyan-900/50 rounded-full -top-1/4 -left-1/4 filter blur-3xl opacity-30"></div>
      <div className="absolute z-10 w-[48rem] h-[48rem] bg-fuchsia-900/50 rounded-full -bottom-1/4 -right-1/4 filter blur-3xl opacity-30"></div>
      
      {/* Tüm form mantığını içeren komponenti burada çağırıyoruz */}
      <LoginForm />

    </main>
  );
}