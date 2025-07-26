// src/app/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import { Eleman } from "@/types/database";
import toast from "react-hot-toast";

// dnd-kit importları
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

// Component importları
import InteractiveBackground from "@/components/InteractiveBackground"; 
import Sidebar from "@/components/Sidebar";
import { SortableUserCard } from "@/components/SortableUserCard";

interface ApiResponse {
  success?: boolean; 
  message?: string; 
  loggedInUsername?: string;
  results?: Eleman[];
}

export default function DashboardPage() {
  const [userList, setUserList] = useState<Eleman[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<string | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, {
    // Kartın içindeki bir butona basıldığında sürüklemenin başlamasını engelle
    activationConstraint: {
      distance: 8,
    },
  }));

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/get-data');
        const result: ApiResponse = await response.json(); 
        if (!response.ok || !result.success) throw new Error(result.message || `API isteği başarısız.`);
        if (!result.results) throw new Error("API yanıtı 'results' dizisini içermiyor.");
        setUserList(result.results);
        setCurrentUser(result.loggedInUsername || null); 
      } catch (err) {
        setError(err instanceof Error ? err.message : "Bilinmeyen bir hata oluştu.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // --- BU FONKSİYON GÜNCELLENDİ ---
  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    // Eğer eleman farklı bir pozisyona sürüklendiyse ve userList doluysa devam et
    if (over && active.id !== over.id && userList) {
      // 1. Sürüklenen elemanın eski ve yeni pozisyonunu bul
      const oldIndex = userList.findIndex((item) => item.eleman_id === active.id);
      const newIndex = userList.findIndex((item) => item.eleman_id === over.id);
      
      // 2. Diziyi yeni sırasına göre yeniden oluştur
      const reorderedItems = arrayMove(userList, oldIndex, newIndex);
      
      // 3. EKRANI ANINDA GÜNCELLE (Optimistic UI)
      setUserList(reorderedItems);
      
      // 4. EKRAN GÜNCELLENDİKTEN SONRA API'Yİ ÇAĞIRIP VERİTABANINI GÜNCELLE
      toast.promise(
        fetch('/api/update-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(reorderedItems), // Yeni sıralanmış listeyi gönder
        }).then(async (res) => {
          if (!res.ok) {
            const errorResult = await res.json();
            // Eğer sunucudan hata dönerse, ekranı eski haline geri al
            setUserList(userList); 
            throw new Error(errorResult.message || "Sunucu hatası.");
          }
          return res.json();
        }),
        {
          loading: 'Sıralama kaydediliyor...',
          success: <b>Sıralama başarıyla kaydedildi!</b>,
          error: (err) => <b>Kaydedilemedi: {err.toString()}</b>,
        }
      );
    }
  }

  const renderContent = () => {
    // Bu fonksiyonda değişiklik yok
    if (isLoading) { return <div className="flex items-center justify-center min-h-[calc(100vh-100px)] w-full"><div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div></div>; }
    if (error) { return <p className="text-red-400 text-center py-8 w-full">Hata: {error}</p>; }
    if (userList && userList.length > 0) {
      return (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={userList.map(u => u.eleman_id)} strategy={verticalListSortingStrategy}>
            <div className="w-full flex-grow space-y-3 overflow-y-auto custom-scrollbar pr-4">
              {userList.map((user) => (
                <SortableUserCard key={user.eleman_id} user={user} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      );
    }
    return <p className="text-zinc-500 text-center py-8 w-full">Veritabanında eleman bulunamadı.</p>;
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