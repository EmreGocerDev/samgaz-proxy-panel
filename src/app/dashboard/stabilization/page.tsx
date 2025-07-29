"use client";

import { useEffect, useState, useCallback } from "react";
import Sidebar from "@/components/Sidebar";
import DashboardBackground from "@/components/DashboardBackground";
import { createClient } from '@/utils/supabase/client';
import type { Eleman, Iskodu, GrupKoduTable } from '@/types/database';
import { Menu, X, FileJson, Users, Group, Binary } from 'lucide-react';

// Ana Stabilizasyon Sayfası (Veri Raporlama Paneli Eklendi)
export default function StabilizationPage() {
  const supabase = createClient();
  const [elemanList, setElemanList] = useState<Eleman[]>([]);
  const [iskoduList, setIskoduList] = useState<Iskodu[]>([]);
  const [grupKoduList, setGrupKoduList] = useState<GrupKoduTable[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentUsername, setCurrentUsername] = useState<string | null>(null);

  const boolMapping: { [key: string]: keyof Eleman | undefined } = {
    'SayacOkuma': 'eleman_bool1', 'OdemedenAcma': 'eleman_bool2', 'AbonelikAcma': 'eleman_bool3',
    'DigerAcma': 'eleman_bool4', 'KesmeIhbarname': 'eleman_bool5', 'BorctanKapama': 'eleman_bool6',
    'TahliyeKapama': 'eleman_bool7', 'DigerKapama': 'eleman_bool8', 'UsulsuzKapama': 'eleman_bool9',
    'SayacKalibrasyon': 'eleman_bool10', 'BorcBildirim': 'eleman_bool11', 'TTFIhbarname': 'eleman_bool12'
  };

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [elemanRes, iskoduRes, grupkoduRes] = await Promise.all([
        supabase.from('elemanlar').select('*').order('eleman_row', { ascending: true }),
        supabase.from('iskodu').select('id, name, grupkoduid').order('id', { ascending: true }),
        supabase.from('grupkodu').select('*')
      ]);
      if (elemanRes.error) throw elemanRes.error;
      if (iskoduRes.error) throw iskoduRes.error;
      if (grupkoduRes.error) throw grupkoduRes.error;

      setElemanList(elemanRes.data || []);
      setIskoduList(iskoduRes.data || []);
      setGrupKoduList(grupkoduRes.data || []);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError("Veri yüklenirken hata oluştu: " + err.message);
      } else {
        setError("Veri yüklenirken bilinmeyen bir hata oluştu.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchData();
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUsername(user?.email || "Giriş Yapılmadı");
    };
    fetchUser();
    const checkSize = () => { if (window.innerWidth >= 1024) setSidebarOpen(true); };
    checkSize();
    window.addEventListener('resize', checkSize);
    return () => window.removeEventListener('resize', checkSize);
  }, [fetchData, supabase]);

  const calculateCellState = (eleman: Eleman, iskodu: Iskodu): 1 | 0 => {
    const requiredGrupId = iskodu.grupkoduid;
    if (requiredGrupId === null) return 0;
    const elemanGrupIds = [
      eleman.eleman_dosya1, eleman.eleman_dosya2, eleman.eleman_dosya3,
      eleman.eleman_dosya4, eleman.eleman_dosya5, eleman.eleman_dosya6,
      eleman.eleman_dosya7, eleman.eleman_dosya8
    ];
    let hasGrupAssignment = false;
    for (const dosyaId of elemanGrupIds) {
      if (dosyaId != null && dosyaId == requiredGrupId) {
        hasGrupAssignment = true;
        break;
      }
    }
    const boolKey = boolMapping[iskodu.name.trim()];
    const hasBoolPermission = boolKey ? eleman[boolKey] === true : false;
    return (hasGrupAssignment && hasBoolPermission) ? 1 : 0;
  };

  const downloadAsTextFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  };

  const handleDumpAllData = () => {
    const content = `--- ELEMANLAR ---\n${JSON.stringify(elemanList, null, 2)}\n\n` +
      `--- İŞ KODLARI ---\n${JSON.stringify(iskoduList, null, 2)}\n\n` +
      `--- GRUP KODLARI ---\n${JSON.stringify(grupKoduList, null, 2)}`;
    downloadAsTextFile(content, 'tum_veriler.txt');
  };

  const handleDumpUsers = () => {
    let content = "KULLANICI LİSTESİ\n===================\n";
    elemanList.forEach(e => {
      content += `ID: ${e.eleman_id.padEnd(10)} | İsim: ${e.eleman_name}\n`;
    });
    downloadAsTextFile(content, 'kullanici_listesi.txt');
  };

  const handleDumpGroupCodes = () => {
    let content = "GRUP KODU LİSTESİ\n=====================\n";
    grupKoduList.forEach(g => {
      content += `ID: ${String(g.id).padEnd(5)} | İsim: ${g.name}\n`;
    });
    downloadAsTextFile(content, 'grup_kodu_listesi.txt');
  };

  const handleDumpMapResult = () => {
    let content = "HARİTA SONUÇ RAPORU (SADECE '1' OLAN EŞLEŞMELER)\n===================================================\n";
    iskoduList.forEach(iskodu => {
      elemanList.forEach(eleman => {
        if (calculateCellState(eleman, iskodu) === 1) {
          content += `[GÖREV: ${iskodu.name.padEnd(20)}] <-> [PERSONEL: ${eleman.eleman_name.split(' - ')[0]}]\n`;
        }
      });
    });
    downloadAsTextFile(content, 'harita_sonucu.txt');
  };

  return (
    <main className="relative min-h-screen bg-transparent overflow-hidden">
      <DashboardBackground />
      <button onClick={() => setSidebarOpen(!sidebarOpen)} className="fixed top-4 left-4 z-50 p-2 bg-zinc-900/60 border border-zinc-800 rounded-lg text-white backdrop-blur-md transition-colors hover:border-zinc-700">
        {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>
      <Sidebar
        currentUserUsername={currentUsername}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        isSyncing={false}
        handleSync={() => { }}
      />

      <div className={`relative pt-20 lg:pt-8 z-10 p-4 sm:p-6 lg:p-8 transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'ml-0'}`}>
        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
          <h1 className="text-3xl font-bold text-white">Stabilizasyon Matrisi</h1>
          <div className="flex flex-wrap gap-2">
            <button onClick={handleDumpAllData} className="py-2 px-3 flex items-center justify-center gap-2 bg-zinc-700 text-white font-bold text-xs rounded-lg hover:bg-zinc-600 transition-colors">
              <FileJson size={16} /> Tüm Veriyi İndir
            </button>
            <button onClick={handleDumpUsers} className="py-2 px-3 flex items-center justify-center gap-2 bg-blue-600 text-white font-bold text-xs rounded-lg hover:bg-blue-700 transition-colors">
              <Users size={16} /> Kullanıcıları İndir
            </button>
            <button onClick={handleDumpGroupCodes} className="py-2 px-3 flex items-center justify-center gap-2 bg-emerald-600 text-white font-bold text-xs rounded-lg hover:bg-emerald-700 transition-colors">
              <Group size={16} /> Grupları İndir
            </button>
            <button onClick={handleDumpMapResult} className="py-2 px-3 flex items-center justify-center gap-2 bg-cyan-600 text-white font-bold text-xs rounded-lg hover:bg-cyan-700 transition-colors">
              <Binary size={16} /> Harita Sonucunu İndir
            </button>
          </div>
        </div>

        {isLoading && <div className="text-center text-white p-10">Yükleniyor...</div>}
        {error && <div className="text-center text-red-400 p-10">{error}</div>}

        {!isLoading && !error && (
          <div className="overflow-auto custom-scrollbar bg-zinc-900/50 p-1 rounded-lg border border-zinc-800" style={{ maxHeight: 'calc(100vh - 160px)' }}>
            <table className="min-w-full text-sm text-left text-zinc-300 border-separate" style={{ borderSpacing: 0 }}>
              <thead className="text-xs text-zinc-400 uppercase">
                <tr>
                  <th scope="col" className="px-4 py-3 sticky left-0 z-20 bg-zinc-900 border-b border-r border-zinc-700">
                    İş Kodu / Grup
                  </th>
                  {elemanList.map(eleman => (
                    <th key={eleman.eleman_id} scope="col" className="px-4 py-3 text-center whitespace-nowrap border-b border-zinc-700 bg-zinc-800/50">
                      {eleman.eleman_name.split(' - ')[0]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {iskoduList.map(iskodu => {
                  const grup = grupKoduList.find(g => g.id === iskodu.grupkoduid);
                  return (
                    <tr key={iskodu.id} className="hover:bg-zinc-800/40">
                      <th scope="row" className="px-4 py-2 font-medium whitespace-nowrap sticky left-0 z-10 bg-zinc-900 group-hover:bg-zinc-800/50 border-r border-zinc-700">
                        <div>{`${iskodu.name} (${iskodu.id})`}</div>
                        <div className="text-xs text-zinc-500 font-normal">
                          {grup ? `${grup.name} (${grup.id})` : iskodu.grupkoduid ? `Grup ID: ${iskodu.grupkoduid}` : 'Grup Atanmamış'}
                        </div>
                      </th>
                      {elemanList.map(eleman => {
                        const cellState = calculateCellState(eleman, iskodu);
                        return (
                          <td key={`${eleman.eleman_id}-${iskodu.id}`}
                            className={`px-4 py-2 text-center font-mono font-bold ${cellState === 1 ? 'text-cyan-400' : 'text-zinc-600'}`}>
                            {cellState}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}