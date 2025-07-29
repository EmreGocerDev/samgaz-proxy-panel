"use client";

import React, { useEffect, useState, useCallback } from "react";
import GlassCard from "@/components/GlassCard";
import DashboardBackground from "@/components/DashboardBackground";
import Sidebar from "@/components/Sidebar";
import { createClient } from '@/utils/supabase/client';
import type { Eleman, IlceKoduTable, GrupKoduTable } from '@/types/database';
import { RefreshCw, GripVertical, Save, Menu, X, Check, ListOrdered, Edit, Power, PowerOff } from 'lucide-react';
import toast from 'react-hot-toast';

import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';


// Şık ve Modern Checkbox Bileşeni (Optimize edildi)
interface StyledCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  title?: string;
  disabled?: boolean;
}

const StyledCheckbox: React.FC<StyledCheckboxProps> = React.memo(({ checked, onChange, title, disabled }) => (
  <button
    type="button"
    role="checkbox"
    aria-checked={checked}
    onClick={() => !disabled && onChange(!checked)}
    title={title}
    disabled={disabled}
    className={`w-5 h-5 flex-shrink-0 rounded-md flex items-center justify-center border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-900 focus:ring-cyan-500
      ${checked ? 'bg-cyan-600 border-cyan-500' : 'bg-zinc-700 border-zinc-600'}
      ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-zinc-600'}
    `}
  >
    <Check
      size={16}
      className={`text-white transition-opacity duration-200 ${checked ? 'opacity-100' : 'opacity-0'}`}
      strokeWidth={3}
    />
  </button>
));
StyledCheckbox.displayName = 'StyledCheckbox';


// --- Detaylı Düzenleme Satırı Bileşeni (Düzeltildi) ---
interface SortableElemanRowProps {
  eleman: Eleman;
  ilceKoduOptions: IlceKoduTable[];
  allGrupKoduOptions: GrupKoduTable[];
  onElemanChange: (id: string, field: keyof Eleman, value: string | boolean | number | null) => void;
  boolMapping: { [key: string]: string };
}

const SortableElemanRow: React.FC<SortableElemanRowProps> = React.memo(({ eleman, ilceKoduOptions, allGrupKoduOptions, onElemanChange, boolMapping }) => {
  // Hook'lar her zaman component'in en üst seviyesinde çağrılmalıdır.
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: eleman.eleman_id, disabled: !eleman.is_active });

  // Koşullu return'ler Hook çağrılarından sonra gelmelidir.
  if (!eleman) return null;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 'auto',
  };

  const getFilteredGrupOptions = (dosyaKey: keyof Eleman) => {
    const selectedIlceId = ilceKoduOptions.find(ilce => ilce.name === eleman.eleman_ilce)?.id;
    if (!selectedIlceId) return allGrupKoduOptions;
    const filteredOptions = allGrupKoduOptions.filter(grup => grup.ilcekoduid === selectedIlceId);
    const currentValue = eleman[dosyaKey] as number | null;
    if (currentValue !== null && !filteredOptions.some(opt => opt.id === currentValue)) {
        const missingOption = allGrupKoduOptions.find(opt => opt.id === currentValue);
        if (missingOption) {
            return [missingOption, ...filteredOptions];
        }
    }
    return filteredOptions;
  };

  const selectClassName = "w-[120px] pl-2 pr-6 py-1 bg-zinc-800/60 text-white text-xs border border-zinc-700 rounded-md focus:outline-none focus:ring-1 focus:ring-cyan-500 truncate disabled:opacity-50 disabled:cursor-not-allowed";
  const booleanFields = Array.from({ length: 12 }, (_, i) => `eleman_bool${i + 1}` as keyof Eleman);
  const displayName = (eleman.eleman_name || 'İsimsiz').split(' - ')[0];

  const handleStatusToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    onElemanChange(eleman.eleman_id, 'is_active', !eleman.is_active);
  };

  return (
    <div ref={setNodeRef} style={style}>
      <GlassCard
        title={!eleman.is_active ? "Bu kullanıcı pasif olduğu için işlem yapamazsınız." : ""}
        className={`w-full min-w-max p-2 grid items-center gap-3 relative transition-all duration-300 
          ${!eleman.is_active ? 'bg-red-900/30 border-red-500/20 cursor-not-allowed' : ''}
        `}
        style={{ gridTemplateColumns: 'auto max-content 160px 1fr auto' }}
      >
        <div {...attributes} {...listeners} className={`p-1 touch-none text-zinc-400 ${eleman.is_active ? 'cursor-grab hover:text-white' : 'cursor-not-allowed'}`}>
          <GripVertical size={20} />
        </div>
        <div className="flex items-center justify-center gap-2">
          {booleanFields.map((field) => (
            <StyledCheckbox
              key={field}
              checked={!!eleman[field]}
              onChange={(checked) => onElemanChange(eleman.eleman_id, field, checked)}
              title={boolMapping[field] || field}
              disabled={!eleman.is_active}
            />
          ))}
        </div>
        <div className="w-full" title={eleman.eleman_name}>
          <p className="font-semibold text-white text-sm truncate">{displayName}</p>
          <p className="text-xs text-zinc-400 truncate">ID: {eleman.eleman_id}</p>
        </div>
        <div className="grid grid-cols-9 gap-1" style={{ gridTemplateColumns: 'repeat(9, 1fr)' }}>
          <div title="İlçe Kodu" className="min-w-0">
            <select disabled={!eleman.is_active} value={eleman.eleman_ilce ?? ''} onChange={(e) => onElemanChange(eleman.eleman_id, 'eleman_ilce', e.target.value === '' ? null : e.target.value)} className={selectClassName}>
              <option value="">İlçe...</option>
              {ilceKoduOptions.map(ilce => <option key={ilce.id} value={ilce.name}>{ilce.name}</option>)}
            </select>
          </div>
          {Array.from({ length: 8 }).map((_, i) => {
            const dosyaKey = `eleman_dosya${i + 1}` as keyof Eleman;
            return (
              <div key={dosyaKey} title={`Dosya ${i + 1}`} className="min-w-0">
                <select disabled={!eleman.is_active} value={(eleman[dosyaKey] as number | null) ?? ''} onChange={(e) => onElemanChange(eleman.eleman_id, dosyaKey, e.target.value === '' ? null : Number(e.target.value))} className={selectClassName}>
                  <option value="">Dosya {i + 1}...</option>
                  {getFilteredGrupOptions(dosyaKey).map(grup => <option key={grup.id} value={grup.id}>{grup.name}</option>)}
                </select>
              </div>
            );
          })}
        </div>
        <div className="px-2">
          <button onClick={handleStatusToggle} title={eleman.is_active ? 'Kullanıcıyı Pasif Yap' : 'Kullanıcıyı Aktif Yap'} className="p-2 rounded-full hover:bg-zinc-700/50 transition-colors">
            {eleman.is_active ? <Power size={18} className="text-green-500" /> : <PowerOff size={18} className="text-red-500" />}
          </button>
        </div>
      </GlassCard>
    </div>
  );
});
SortableElemanRow.displayName = 'SortableElemanRow';


// Sadece Sıralama Modu için Basit Satır Bileşeni (Düzeltildi)
interface SimpleReorderRowProps {
  eleman: Eleman;
}
const SimpleReorderRow: React.FC<SimpleReorderRowProps> = React.memo(({ eleman }) => {
  // Hook'lar her zaman component'in en üst seviyesinde çağrılmalıdır.
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: eleman.eleman_id, disabled: !eleman.is_active });

  // Koşullu return'ler Hook çağrılarından sonra gelmelidir.
  if (!eleman) return null;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 'auto',
    opacity: isDragging ? 0.8 : 1,
  };
  const displayName = (eleman.eleman_name || 'İsimsiz').split(' - ')[0];

  return (
    <div ref={setNodeRef} style={style}>
      <GlassCard
        className={`w-full p-3 flex items-center gap-4 transition-colors 
              ${!eleman.is_active ? 'bg-red-900/30 border-red-500/20' : ''}
            `}
      >
        <div {...attributes} {...listeners} className={`p-1 touch-none text-zinc-400 ${eleman.is_active ? 'cursor-grab hover:text-white' : 'cursor-not-allowed'}`}>
          <GripVertical size={20} />
        </div>
        <div title={eleman.eleman_name}>
          <p className="font-semibold text-white text-sm">{displayName}</p>
          <p className="text-xs text-zinc-400">ID: {eleman.eleman_id}</p>
        </div>
        {!eleman.is_active && <PowerOff size={18} className="text-red-500 ml-auto" />}
      </GlassCard>
    </div>
  );
});
SimpleReorderRow.displayName = 'SimpleReorderRow';


// Listenin üstündeki başlık bileşeni
interface ListHeaderProps {
  onBulkToggle: (field: keyof Eleman) => void;
  boolMapping: { [key: string]: string };
}
const ListHeader: React.FC<ListHeaderProps> = React.memo(({ onBulkToggle, boolMapping }) => {
  const booleanFields = Array.from({ length: 12 }, (_, i) => `eleman_bool${i + 1}` as keyof Eleman);
  const fileFields = Array.from({ length: 8 }, (_, i) => `Dosya ${i + 1}`);
  return (
    <div
      className="w-full min-w-max p-2 grid items-center gap-3 text-xs font-bold text-zinc-400 mb-2"
      style={{ gridTemplateColumns: 'auto max-content 160px 1fr auto' }}
    >
      <div className="w-[36px]"></div>
      <div className="flex items-center justify-center gap-2">
        {booleanFields.map((field, index) => (
          <button
            key={field}
            onClick={() => onBulkToggle(field)}
            className="w-7 h-5 flex items-center justify-center text-zinc-500 hover:text-white hover:bg-zinc-700 rounded-md transition-colors"
            title={boolMapping[field] || `Boolean ${index + 1}`}
          >
            {`B${index + 1}`}
          </button>
        ))}
      </div>
      <div>İSİM / ID</div>
      <div className="grid grid-cols-9 gap-1" style={{ gridTemplateColumns: 'repeat(9, 1fr)' }}>
        <div>İLÇE</div>
        {fileFields.map(label => <div key={label}>{label.toUpperCase()}</div>)}
      </div>
      <div className="px-2 text-center">DURUM</div>
    </div>
  );
});
ListHeader.displayName = 'ListHeader';


// --- Ana Sayfa Bileşeni ---
export default function DashboardPage() {
  const supabase = createClient();
  const [elemanList, setElemanList] = useState<Eleman[]>([]);
  const [originalElemanList, setOriginalElemanList] = useState<Eleman[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUsername, setCurrentUsername] = useState<string | null>(null);
  const [ilceKoduOptions, setIlceKoduOptions] = useState<IlceKoduTable[]>([]);
  const [allGrupKoduOptions, setAllGrupKoduOptions] = useState<GrupKoduTable[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isReorderMode, setIsReorderMode] = useState(false);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const boolMapping: { [key: string]: string } = {
    'eleman_bool1': 'SayacOkuma', 'eleman_bool2': 'OdemedenAcma', 'eleman_bool3': 'AbonelikAcma',
    'eleman_bool4': 'DigerAcma', 'eleman_bool5': 'KesmeIhbarname', 'eleman_bool6': 'BorctanKapama',
    'eleman_bool7': 'TahliyeKapama', 'eleman_bool8': 'DigerKapama', 'eleman_bool9': 'UsulsuzKapama',
    'eleman_bool10': 'SayacKalibrasyon', 'eleman_bool11': 'BorcBildirim', 'eleman_bool12': 'TTFIhbarname'
  };

  const fetchInitialData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
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
      const elemanlar = elemanRes.data || [];
      setElemanList(elemanlar);
      setOriginalElemanList(JSON.parse(JSON.stringify(elemanlar)));
    } catch (err: unknown) { // any yerine unknown
      if (err instanceof Error) {
        setError("Veri yüklenirken bir hata oluştu: " + err.message);
      } else {
        setError("Veri yüklenirken bilinmeyen bir hata oluştu.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchInitialData();
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', user.id).single();
        setCurrentUsername(profile?.full_name || user.email || "Kullanıcı");
      }
    };
    fetchUser();
  }, [fetchInitialData, supabase]);

  useEffect(() => {
    const checkSize = () => { if (window.innerWidth >= 1024) setSidebarOpen(true); };
    checkSize();
    window.addEventListener('resize', checkSize);
    return () => window.removeEventListener('resize', checkSize);
  }, []);

  const handleElemanChange = useCallback((id: string, field: keyof Eleman, value: string | boolean | number | null) => {
    setElemanList(prev => prev.map(item => item && item.eleman_id === id ? { ...item, [field]: value } : item));
  }, []);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setElemanList(items => {
        const oldIndex = items.findIndex(item => item.eleman_id === active.id);
        const newIndex = items.findIndex(item => item.eleman_id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleBulkToggle = useCallback((field: keyof Eleman) => {
    setElemanList(currentList => {
      const areAllChecked = currentList.every(eleman => eleman && eleman.is_active && eleman[field]);
      const newCheckedState = !areAllChecked;
      return currentList.map(eleman => eleman && eleman.is_active ? ({ ...eleman, [field]: newCheckedState }) : eleman);
    });
  }, []);

  const handleSaveChanges = async () => {
    setIsSaving(true);
    setError(null);
    const updatedList = elemanList.map((item, index) => ({ ...item, eleman_row: index + 1 }));
    const { error: saveError } = await supabase.from('elemanlar').upsert(updatedList);
    if (saveError) {
      setError("Değişiklikler kaydedilirken hata oluştu: " + saveError.message);
      toast.error(`Kaydedilemedi: ${saveError.message}`);
    } else {
      const freshList = JSON.parse(JSON.stringify(updatedList));
      setElemanList(freshList);
      setOriginalElemanList(freshList);
      toast.success("Tüm değişiklikler başarıyla kaydedildi!");
    }
    setIsSaving(false);
  };

  const handleCancelChanges = () => {
    setElemanList(JSON.parse(JSON.stringify(originalElemanList)));
    toast('Değişiklikler iptal edildi.', { icon: '↩️' });
  };

  const handleSync = async () => {
    setIsSyncing(true);
    const credentials = { username: "ybayraktar", password: "23121633", connectionType: "forticlient" };
    const syncPromise = fetch('/api/sync-elemanlar', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(credentials) });
    toast.promise(syncPromise.then(async (res) => {
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Bilinmeyen bir sunucu hatası.');
      await fetchInitialData();
      return result.message;
    }), {
      loading: 'Kullanıcılar senkronize ediliyor...',
      success: (message) => <b>{String(message)}</b>,
      error: (err) => <b>Hata: {err.toString()}</b>,
    });
    syncPromise.finally(() => setIsSyncing(false));
  };

  const renderContent = () => {
    if (isLoading) return <div className="w-full flex justify-center items-center h-screen"><div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div></div>;
    if (error) return <p className="text-red-400 text-center w-full">{error}</p>;
    if (elemanList.length === 0) return <p className="text-zinc-500 text-center w-full">Eleman bulunamadı.</p>;

    return (
      <div className="flex flex-col items-center w-full">
        {!isReorderMode && <ListHeader onBulkToggle={handleBulkToggle} boolMapping={boolMapping} />}

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={elemanList.filter(e => e).map(e => e.eleman_id)} strategy={verticalListSortingStrategy}>
            <div className="w-full flex-grow space-y-2 overflow-auto custom-scrollbar pr-2" style={{ maxHeight: 'calc(100vh - 190px)' }}>
              {elemanList.map(eleman => (
                isReorderMode ? (
                  <SimpleReorderRow
                    key={eleman?.eleman_id || Math.random()}
                    eleman={eleman}
                  />
                ) : (
                  <SortableElemanRow
                    key={eleman?.eleman_id || Math.random()}
                    eleman={eleman}
                    ilceKoduOptions={ilceKoduOptions}
                    allGrupKoduOptions={allGrupKoduOptions}
                    onElemanChange={handleElemanChange}
                    boolMapping={boolMapping}
                  />
                )
              ))}
            </div>
          </SortableContext>
        </DndContext>
        <div className="fixed bottom-4 right-4 z-20 flex items-center gap-4">
          {!isReorderMode && (
            <>
              <button onClick={handleCancelChanges} className="py-2 px-4 flex items-center justify-center gap-2 bg-zinc-700/80 backdrop-blur-md text-white font-bold rounded-lg hover:bg-zinc-600 transition-colors shadow-lg">
                <RefreshCw size={18} /> İptal
              </button>
              <button onClick={handleSaveChanges} className="py-2 px-4 flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-rose-700 text-white font-bold rounded-lg hover:scale-105 transition-transform disabled:opacity-50 shadow-lg" disabled={isSaving}>
                {isSaving ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Save size={18} />}
                Tüm Değişiklikleri Kaydet
              </button>
            </>
          )}
          <button
            onClick={() => {
              setIsReorderMode(!isReorderMode);
            }}
            className={`py-2 px-4 flex items-center justify-center gap-2 font-bold rounded-lg transition-all duration-200 shadow-lg ${isReorderMode
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
          >
            {isReorderMode ? <Edit size={18} /> : <ListOrdered size={18} />}
            {isReorderMode ? 'Düzenlemeye Dön' : 'Sırala'}
          </button>
        </div>
      </div>
    );
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
        isSyncing={isSyncing}
        handleSync={handleSync}
      />
      <div className={`relative pt-20 lg:pt-8 z-10 p-4 sm:p-6 lg:p-8`}>
        {renderContent()}
      </div>
    </main>
  );
}