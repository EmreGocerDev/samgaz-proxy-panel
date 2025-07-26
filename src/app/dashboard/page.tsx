"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import GlassCard from "@/components/GlassCard";
import InteractiveBackground from "@/components/InteractiveBackground";
import Sidebar from "@/components/Sidebar";
import { createClient } from '@/utils/supabase/client';
import { Eleman, SyncResult, IlceKoduTable, GrupKoduTable } from '@/types/database';
import { RefreshCw, GripVertical, Save } from 'lucide-react';

// DND-Kit (Sürükle-Bırak) için gerekli importlar
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// --- Sürükle-Bırak Özellikli Satır Bileşeni ---
interface ElemanRowProps {
    eleman: Eleman;
    ilceKoduOptions: IlceKoduTable[];
    allGrupKoduOptions: GrupKoduTable[];
    onElemanChange: (id: string, field: keyof Eleman, value: any) => void;
}

const SortableElemanRow: React.FC<ElemanRowProps> = ({ eleman, ilceKoduOptions, allGrupKoduOptions, onElemanChange }) => {
    // dnd-kit için gerekli hook'lar
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: eleman.eleman_id });

    // Sürükleme sırasında uygulanacak stiller
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 10 : 'auto',
    };

    // ÇÖZÜM: Seçili değerin kaybolmasını engelleyen "akıllı" filtreleme
    const getFilteredGrupOptions = useCallback((dosyaKey: keyof Eleman) => {
        // 1. Mevcut ilçeye göre seçenekleri filtrele
        const selectedIlceId = ilceKoduOptions.find(ilce => ilce.name === eleman.eleman_ilce)?.id;
        let filteredOptions = allGrupKoduOptions.filter(grup => grup.ilcekoduid === selectedIlceId);
        
        // 2. Mevcut seçili değer bu listede yoksa, onu bul ve listeye ekle
        const currentValue = eleman[dosyaKey] as number | null;
        if (currentValue !== null && !filteredOptions.some(opt => opt.id === currentValue)) {
            const missingOption = allGrupKoduOptions.find(opt => opt.id === currentValue);
            if (missingOption) {
                // Klonlayarak ekle ki orijinal listeyi bozmayalım
                filteredOptions = [missingOption, ...filteredOptions];
            }
        }
        return filteredOptions;
    }, [eleman, ilceKoduOptions, allGrupKoduOptions]);
    
    const selectClassName = "w-full pl-2 pr-6 py-1 bg-zinc-800/60 text-white text-xs border border-zinc-700 rounded-md focus:outline-none focus:ring-1 focus:ring-cyan-500";

    return (
        <div ref={setNodeRef} style={style}>
            <GlassCard className="w-full p-2 flex items-center gap-2 relative transition-shadow">
                {/* Sürükleme İkonu */}
                <div {...attributes} {...listeners} className="p-2 cursor-grab touch-none text-zinc-400 hover:text-white">
                    <GripVertical size={20} />
                </div>
                
                <div className="flex-shrink-0 w-40 sm:w-48" title={eleman.eleman_name}>
                    <p className="font-semibold text-white text-sm truncate">{eleman.eleman_name}</p>
                    <p className="text-xs text-zinc-400">ID: {eleman.eleman_id}</p>
                </div>

                <div className="flex-grow grid grid-cols-5 lg:grid-cols-9 gap-2">
                    <div title="İlçe Kodu">
                        <select 
                            value={eleman.eleman_ilce ?? ''} 
                            onChange={(e) => onElemanChange(eleman.eleman_id, 'eleman_ilce', e.target.value === '' ? null : e.target.value)} 
                            className={selectClassName}
                        >
                            <option value="">İlçe...</option>
                            {ilceKoduOptions.map(ilce => <option key={ilce.id} value={ilce.name}>{ilce.name}</option>)}
                        </select>
                    </div>

                    {Array.from({ length: 8 }).map((_, i) => {
                        const dosyaKey = `eleman_dosya${i + 1}` as keyof Eleman;
                        return (
                            <div key={dosyaKey} title={`Dosya ${i + 1}`}>
                                <select 
                                    value={(eleman[dosyaKey] as number | null) ?? ''} 
                                    onChange={(e) => onElemanChange(eleman.eleman_id, dosyaKey, e.target.value === '' ? null : Number(e.target.value))} 
                                    className={selectClassName}
                                >
                                    <option value="">Dosya {i+1}...</option>
                                    {getFilteredGrupOptions(dosyaKey).map(grup => <option key={grup.id} value={grup.id}>{grup.name}</option>)}
                                </select>
                            </div>
                        );
                    })}
                </div>
            </GlassCard>
        </div>
    );
};


// --- Ana DashboardPage Bileşeni ---
export default function DashboardPage() {
    const supabase = createClient();
    const [elemanList, setElemanList] = useState<Eleman[]>([]);
    const [originalElemanList, setOriginalElemanList] = useState<Eleman[]>([]); // Değişiklikleri takip etmek için
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentUsername, setCurrentUsername] = useState<string | null>(null);
    const [ilceKoduOptions, setIlceKoduOptions] = useState<IlceKoduTable[]>([]);
    const [allGrupKoduOptions, setAllGrupKoduOptions] = useState<GrupKoduTable[]>([]);

    // dnd-kit için sensör tanımı
    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

    // Verileri ilk yükleyen fonksiyon
    const fetchInitialData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [ilceRes, grupRes, elemanRes] = await Promise.all([
                supabase.from('ilcekodu').select('*'),
                supabase.from('grupkodu').select('*'),
                supabase.from('elemanlar').select('*').order('eleman_row', { ascending: true })
            ]);

            if (ilceRes.error) throw ilceRes.error;
            if (grupRes.error) throw grupRes.error;
            if (elemanRes.error) throw elemanRes.error;

            setIlceKoduOptions(ilceRes.data || []);
            setAllGrupKoduOptions(grupRes.data || []);
            setElemanList(elemanRes.data || []);
            setOriginalElemanList(JSON.parse(JSON.stringify(elemanRes.data || []))); // Değişiklik takibi için derin kopya
        } catch (err: any) {
            setError("Veri yüklenirken bir hata oluştu: " + err.message);
        } finally {
            setIsLoading(false);
        }
    }, [supabase]);

    useEffect(() => {
        fetchInitialData();
        //... kullanıcı profili çekme ...
    }, [fetchInitialData]);

    // Bir satırdaki dropdown değiştiğinde ana state'i güncelleyen fonksiyon
    const handleElemanChange = (id: string, field: keyof Eleman, value: any) => {
        setElemanList(prevList =>
            prevList.map(item =>
                item.eleman_id === id ? { ...item, [field]: value } : item
            )
        );
    };

    // Sürükleme bittiğinde listeyi yeniden sıralayan fonksiyon
    const handleDragEnd = (event: any) => {
        const { active, over } = event;
        if (active.id !== over.id) {
            setElemanList((items) => {
                const oldIndex = items.findIndex(item => item.eleman_id === active.id);
                const newIndex = items.findIndex(item => item.eleman_id === over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    // KIRMIZI KAYDET BUTONU FONKSİYONU
    const handleSaveChanges = async () => {
        setIsSaving(true);
        setError(null);

        // Sıralamayı (eleman_row) güncelle
        const updatedList = elemanList.map((item, index) => ({
            ...item,
            eleman_row: index + 1,
        }));
        
        // Sadece değişenleri bulmak yerine tüm listeyi upsert etmek daha basit ve güvenilir
        const { error: saveError } = await supabase
            .from('elemanlar')
            .upsert(updatedList);

        if (saveError) {
            setError("Değişiklikler kaydedilirken hata oluştu: " + saveError.message);
        } else {
            // Başarılı kayıttan sonra yeni veriyi ana ve orijinal listeye ata
            setElemanList(updatedList);
            setOriginalElemanList(JSON.parse(JSON.stringify(updatedList)));
            alert("Tüm değişiklikler başarıyla kaydedildi!");
        }
        setIsSaving(false);
    };

    const renderContent = () => {
        // ... (isLoading, error, no data checks) ...
        if (isLoading) return <div className="flex items-center justify-center w-full"><div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div></div>;
        if (error) return <p className="text-red-400 text-center w-full">{error}</p>;
        if (elemanList.length === 0) return <p className="text-zinc-500 text-center w-full">Eleman bulunamadı.</p>;

        return (
            <div className="flex flex-col items-center w-full">
                 <style jsx global>{`...`}</style>
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={elemanList.map(item => item.eleman_id)} strategy={verticalListSortingStrategy}>
                        <div className="w-full flex-grow space-y-2 overflow-y-auto custom-scrollbar pr-4" style={{ maxHeight: 'calc(100vh - 150px)' }}>
                            {elemanList.map(eleman => (
                                <SortableElemanRow
                                    key={eleman.eleman_id}
                                    eleman={eleman}
                                    ilceKoduOptions={ilceKoduOptions}
                                    allGrupKoduOptions={allGrupKoduOptions}
                                    onElemanChange={handleElemanChange}
                                />
                            ))}
                        </div>
                    </SortableContext>
                </DndContext>

                <div className="flex items-center gap-4 mt-4">
                    <button
                        onClick={fetchInitialData}
                        className="py-2 px-4 flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-lg hover:scale-105 transition-transform duration-200"
                        disabled={isSaving || isLoading}
                    >
                        <RefreshCw size={18} /> Değişiklikleri İptal Et / Yenile
                    </button>
                    <button
                        onClick={handleSaveChanges}
                        className="py-2 px-4 flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-rose-700 text-white font-bold rounded-lg hover:scale-105 transition-transform duration-200 disabled:opacity-50"
                        disabled={isSaving || isLoading}
                    >
                        {isSaving ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Save size={18} />}
                        Tüm Değişiklikleri Kaydet
                    </button>
                </div>
            </div>
        );
    };

    return (
        <main className="relative flex min-h-screen overflow-hidden bg-gray-950">
            <InteractiveBackground />
            <Sidebar currentUserUsername={currentUsername} />
            <div className="relative z-20 flex-grow p-4 sm:p-6 lg:p-8 flex flex-col items-start">
                {renderContent()}
            </div>
        </main>
    );
}