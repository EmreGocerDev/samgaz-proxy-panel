// src/app/login-form.tsx
"use client";

import { useState } from 'react';
import { handleLogin } from './actions';
// DEĞİŞİKLİK 1: Hatanın belirttiği gibi doğru fonksiyonları import ediyoruz.
// Not: Next.js'in son sürümlerinde useActionState 'react' paketinden gelebilir.
// Eğer 'react-dom' hata verirse, importu 'react' olarak değiştiririz.
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';

// Butonun "yükleniyor" durumunu ve eski animasyonlu halini yöneten component
function LoginButton() {
  const { pending } = useFormStatus();
  const buttonText = 'Giriş Yap';

  return (
    <button
      type="submit"
      disabled={pending}
      className="relative w-full flex justify-center py-3 px-4 border border-cyan-500/50 rounded-md text-base font-medium text-cyan-300 bg-cyan-900/20 hover:text-white hover:bg-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 ease-in-out group"
    >
      {pending ? (
        <div className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
      ) : (
        <>
          <span className="absolute top-0 left-0 h-[2px] w-0 bg-cyan-400 transition-all duration-200 ease-out group-hover:w-full"></span>
          <span className="absolute top-0 right-0 w-[2px] h-0 bg-cyan-400 transition-all duration-200 ease-out delay-200 group-hover:h-full"></span>
          <span className="absolute bottom-0 right-0 h-[2px] w-0 bg-cyan-400 transition-all duration-200 ease-out delay-[400ms] group-hover:w-full"></span>
          <span className="absolute bottom-0 left-0 w-[2px] h-0 bg-cyan-400 transition-all duration-200 ease-out delay-[600ms] group-hover:h-full"></span>
          <span className="relative flex justify-center items-center h-5 overflow-hidden">
            {buttonText.split("").map((letter, i) => (
              <span key={i} className="inline-block transition-transform duration-300 ease-in-out group-hover:-translate-y-full" style={{ transitionDelay: `${i * 30}ms` }}>
                {letter === " " ? "\u00A0" : letter}
              </span>
            ))}
            <span className="absolute flex justify-center items-center">
              {buttonText.split("").map((letter, i) => (
                <span key={i} className="inline-block transition-transform duration-300 ease-in-out translate-y-full group-hover:translate-y-0" style={{ transitionDelay: `${i * 30}ms` }}>
                  {letter === " " ? "\u00A0" : letter}
                </span>
              ))}
            </span>
          </span>
        </>
      )}
    </button>
  );
}

export default function LoginForm() {
  // DEĞİŞİKLİK 2: useFormState yerine useActionState kullanıyoruz
  const [errorMessage, dispatch] = useActionState(handleLogin, undefined);
  const [connectionType, setConnectionType] = useState('forticlient');

  return (
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
      <form action={dispatch} className="space-y-4">
        <input type="hidden" name="connectionType" value={connectionType} />
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-300">Kullanıcı Adı</label>
          <input id="username" name="username" type="text" required className="w-full px-4 py-2 mt-1 text-white placeholder-gray-400 bg-black/20 border border-white/20 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300" />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-300">Parola</label>
          <input id="password" name="password" type="password" required className="w-full px-4 py-2 mt-1 text-white placeholder-gray-400 bg-black/20 border border-white/20 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300" />
        </div>
        <div className="pt-4"><LoginButton /></div>
        {errorMessage && (<p className="mt-2 text-center text-sm text-red-400">{errorMessage}</p>)}
      </form>
    </div>
  );
}