// src/app/dashboard/sync-users/page.tsx
"use client";

import { useState } from 'react';

export default function SyncUsersPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSync = async () => {
    setIsLoading(true);
    setMessage('');
    setError('');

    try {
      // NOT: Bu API, login olmak için kimlik bilgisi gerektiriyor.
      // Gelecekte bunu session'dan alacağız, şimdilik test için sabit giriyoruz.
      const credentials = {
        username: "ybayraktar",
        password: "23121633",
        connectionType: "forticlient",
      };

      const response = await fetch('/api/sync-elemanlar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Bilinmeyen bir hata oluştu.');
      }
      
      setMessage(result.message); // API'den gelen başarılı mesajını göster

    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Beklenmedik bir hata oluştu.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8 text-white">
      <h1 className="text-3xl font-bold mb-4">Kullanıcı Senkronizasyonu</h1>
      <p className="text-zinc-400 mb-8">
        Bu sayfa, Samgaz API'sindeki güncel kullanıcı listesi ile yerel veritabanımızı senkronize eder.
        Samgaz'da yeni eklenenler buraya eklenir, oradan silinenler buradan kaldırılır.
      </p>
      
      <div className="bg-zinc-900/50 p-6 rounded-lg border border-zinc-800">
        <button
          onClick={handleSync}
          disabled={isLoading}
          className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-6 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Senkronize Ediliyor...
            </>
          ) : (
            'Senkronizasyonu Başlat'
          )}
        </button>

        {message && (
          <div className="mt-6 p-4 bg-green-900/50 border border-green-700 rounded-lg text-green-200">
            <p className="font-bold">Başarılı!</p>
            <p>{message}</p>
          </div>
        )}

        {error && (
          <div className="mt-6 p-4 bg-red-900/50 border border-red-700 rounded-lg text-red-200">
            <p className="font-bold">Hata!</p>
            <p>{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}