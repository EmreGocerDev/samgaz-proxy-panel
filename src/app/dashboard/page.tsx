// src/app/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import GlassCard from "@/components/GlassCard"; 
import InteractiveBackground from "@/components/InteractiveBackground"; 
import Sidebar from "@/components/Sidebar"; // Yeni eklenen Sidebar bileşeni

// Tip tanımı: API'den beklenen JSON yapısına göre
interface LoginSamgazApiResponse {
  success?: boolean; 
  message?: string; 
  results?: Array<{
    value: number;
    label: string;
  }>;
}

export default function DashboardPage() {
  const [userList, setUserList] = useState<Array<{ value: number; label: string }> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const credentials = {
          username: "ybayraktar",
          password: "23121633",
          connectionType: "forticlient",
        };

        const response = await fetch('/api/get-data', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(credentials),
        });

        const result: LoginSamgazApiResponse = await response.json(); 
        
        console.log("API'den gelen ham yanıt (result):", result);
        console.log("HTTP Durum Kodu:", response.status);

        if (!response.ok || (result.success !== undefined && !result.success)) {
            throw new Error(result.message || `API isteği başarısız oldu (HTTP: ${response.status}).`);
        }
        
        const fetchedUserList = result.results; 

        if (!fetchedUserList || !Array.isArray(fetchedUserList) || fetchedUserList.length === 0) {
            throw new Error("API yanıtı beklenen 'results' dizisini içermiyor, formatı hatalı veya kullanıcı listesi boş.");
        }

        setUserList(fetchedUserList); 

      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Bilinmeyen bir hata oluştu.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-[calc(100vh-100px)] w-full">
          <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      );
    }
    if (error) {
      return <p className="text-red-400 text-center py-8 w-full">Hata: {error}</p>;
    }
    
    if (userList && userList.length > 0) {
      return (
        <div className="flex flex-col items-start w-full" style={{ height: 'calc(100vh - 64px - 64px)' }}> {/* Sidebar'a uygun yükseklik ve üst/alt boşluk bırakma */}
          {/* Özel kaydırma çubuğu stili için global stil eklendi */}
          <style jsx global>{`
            /* WebKit (Chrome, Safari) için kaydırma çubuğu */
            ::-webkit-scrollbar {
              width: 8px; /* Kaydırma çubuğunun genişliği */
              border-radius: 4px; /* Kaydırma çubuğu yuvarlak köşeler */
            }

            ::-webkit-scrollbar-track {
              background: rgba(45, 55, 72, 0.4); /* Kaydırma çubuğu arka planı (zinc-800/40 gibi) */
              border-radius: 4px;
            }

            ::-webkit-scrollbar-thumb {
              background-color: rgba(59, 130, 246, 0.7); /* Kaydırma çubuğu rengi (mavi-500/70 gibi) */
              border-radius: 4px;
              border: 1px solid rgba(45, 55, 72, 0.6); /* Kenarlık */
            }

            ::-webkit-scrollbar-thumb:hover {
              background-color: rgba(59, 130, 246, 1); /* Hover rengi */
            }
          `}</style>

          <div className="w-full flex-grow space-y-3 overflow-y-auto custom-scrollbar pr-4"> {/* Sağa kaydırma çubuğu için boşluk */}
            {userList.map((user) => (
              <GlassCard 
                key={user.value} 
                className="w-full p-3 flex justify-between items-center" 
              >
                <div className="flex-grow"> 
                  <div className="font-semibold text-white text-base">{user.label}</div>
                  <div className="text-xs text-zinc-400">ID: {user.value}</div>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      );
    }
    return <p className="text-zinc-500 text-center py-8 w-full">Veri bulunamadı veya kullanıcı listesi boş.</p>;
  };

  return (
    <main className="relative flex min-h-screen overflow-hidden bg-gray-950">
      {/* Arka plan */}
      <InteractiveBackground /> 

      {/* Sidebar bileşeni */}
      <Sidebar />

      {/* Ana içerik alanı */}
      <div className="relative z-20 flex-grow p-4 sm:p-6 lg:p-8"> {/* Sidebar'dan kalan alanı kapla */}
        {renderContent()}
      </div>
    </main>
  );
}