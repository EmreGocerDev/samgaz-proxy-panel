"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import InteractiveBackground from '../components/InteractiveBackground';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [connectionType, setConnectionType] = useState('forticlient');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');
    try {
      const response = await fetch('/api/login-proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, connectionType }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        router.push('/dashboard?status=success');
      } else {
        setMessage(data.message || 'Giriş başarısız.');
      }
    } catch (error) {
      setMessage('Sunucuya bağlanırken bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  const buttonText = 'Giriş Yap';

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
      
      <div className="relative z-20 w-full max-w-sm p-6 space-y-4 border rounded-2xl shadow-2xl shadow-black/50 bg-gray-900/40 border-white/20 backdrop-blur-xl">
        
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white tracking-wider">SAMREST ATAR</h1>
          <h4 className="text-sm font-bold text-white tracking-wider">Ayka Enerji</h4>
          <p className="mt-2 text-sm text-gray-300">Sisteme erişmek için giriş yapın</p>
        </div>
        
        <div className="pt-2">
          <div className="relative flex w-full p-1 bg-black/30 rounded-lg">
            <div className={`absolute top-1 left-1 h-[calc(100%-0.5rem)] w-1/2 bg-indigo-600 rounded-md shadow-lg shadow-indigo-500/30 transition-transform duration-300 ease-in-out ${connectionType === 'yerel' ? 'translate-x-full' : 'translate-x-0'}`}></div>
            <button type="button" onClick={() => setConnectionType('forticlient')} className="relative z-10 w-1/2 py-2 text-sm font-medium text-white">FortiClient VPN</button>
            <button type="button" onClick={() => setConnectionType('yerel')} className="relative z-10 w-1/2 py-2 text-sm font-medium text-white">Yerel İnternet</button>
          </div>
        </div>

        <form className="space-y-4" onSubmit={handleLogin}>
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-300">Kullanıcı Adı</label>
            <input id="username" name="username" type="text" required value={username} onChange={(e) => setUsername(e.target.value)} className="w-full px-4 py-2 mt-1 text-white placeholder-gray-400 bg-black/20 border border-white/20 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300" />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300">Parola</label>
            <input id="password" name="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-2 mt-1 text-white placeholder-gray-400 bg-black/20 border border-white/20 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300" />
          </div>
          
          <div className="pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="relative w-full flex justify-center py-3 px-4 border border-cyan-500/50 rounded-md text-base font-medium text-cyan-300 bg-cyan-900/20 hover:text-white hover:bg-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 ease-in-out group"
            >
              <span className="absolute top-0 left-0 h-[2px] w-0 bg-cyan-400 transition-all duration-200 ease-out group-hover:w-full"></span>
              <span className="absolute top-0 right-0 w-[2px] h-0 bg-cyan-400 transition-all duration-200 ease-out delay-200 group-hover:h-full"></span>
              <span className="absolute bottom-0 right-0 h-[2px] w-0 bg-cyan-400 transition-all duration-200 ease-out delay-[400ms] group-hover:w-full"></span>
              <span className="absolute bottom-0 left-0 w-[2px] h-0 bg-cyan-400 transition-all duration-200 ease-out delay-[600ms] group-hover:h-full"></span>
              
              <span className="relative flex justify-center items-center h-5 overflow-hidden">
                {buttonText.split("").map((letter, i) => (
                  <span
                    key={i}
                    className="inline-block transition-transform duration-300 ease-in-out group-hover:-translate-y-full"
                    style={{ transitionDelay: `${i * 30}ms` }}
                  >
                    {letter === " " ? "\u00A0" : letter}
                  </span>
                ))}
                <span className="absolute flex justify-center items-center">
                  {buttonText.split("").map((letter, i) => (
                    <span
                      key={i}
                      className="inline-block transition-transform duration-300 ease-in-out translate-y-full group-hover:translate-y-0"
                      style={{ transitionDelay: `${i * 30}ms` }}
                    >
                      {letter === " " ? "\u00A0" : letter}
                    </span>
                  ))}
                </span>
              </span>
            </button>
          </div>
        </form>
        
        {message && (<p className="mt-2 text-center text-sm text-red-400">{message}</p>)}
      </div>
    </main>
  );
}