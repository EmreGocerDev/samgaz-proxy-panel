// src/app/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import GlassCard from "@/components/GlassCard"; 
import InteractiveBackground from "@/components/InteractiveBackground"; 
import Sidebar from "@/components/Sidebar";

interface ApiResponse {
  success?: boolean; 
  message?: string; 
  loggedInUsername?: string; // API'den bu yeni alanı bekliyoruz
  results?: Array<{
    value: number;
    label: string;
  }>;
}

export default function DashboardPage() {
  const [userList, setUserList] = useState<Array<{ value: number; label: string }> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<string | null>(null); // Başlangıçta null

  useEffect(() => {
    const fetchData = async () => {
      try {
        // ARTIK GÖVDESİ (BODY) OLMAYAN BİR GET İSTEĞİ YAPIYORUZ
        const response = await fetch('/api/get-data', {
          method: 'GET', // Metot GET olarak değişti
        });

        const result: ApiResponse = await response.json(); 
        
        if (!response.ok || !result.success) {
            throw new Error(result.message || `API isteği başarısız oldu (HTTP: ${response.status}).`);
        }
        
        if (!result.results || !Array.isArray(result.results)) {
            throw new Error("API yanıtı beklenen 'results' dizisini içermiyor.");
        }

        setUserList(result.results);
        setCurrentUser(result.loggedInUsername || null); // Gelen kullanıcı adını state'e ata

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
    // ... BU FONKSİYONDA HİÇBİR DEĞİŞİKLİK YOK, AYNI KALIYOR ...
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
        <div className="flex flex-col items-start w-full" style={{ height: 'calc(100vh - 64px - 64px)' }}>
          <style jsx global>{`
            ::-webkit-scrollbar { width: 8px; border-radius: 4px; }
            ::-webkit-scrollbar-track { background: rgba(45, 55, 72, 0.4); border-radius: 4px; }
            ::-webkit-scrollbar-thumb { background-color: rgba(59, 130, 246, 0.7); border-radius: 4px; border: 1px solid rgba(45, 55, 72, 0.6); }
            ::-webkit-scrollbar-thumb:hover { background-color: rgba(59, 130, 246, 1); }
          `}</style>
          <div className="w-full flex-grow space-y-3 overflow-y-auto custom-scrollbar pr-4">
            {userList.map((user) => (
              <GlassCard key={user.value} className="w-full p-3 flex justify-between items-center">
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
      <InteractiveBackground /> 
      <Sidebar currentUserUsername={currentUser} />
      <div className="relative z-20 flex-grow p-4 pl-20 md:pl-8 sm:p-6 lg:p-8">
        {renderContent()}
      </div>
    </main>
  );
}