// src/app/api/sync-elemanlar/route.ts

import { NextResponse } from 'next/server';
import { loginSamgaz } from '../../lib/auth';
// Update the import path to the correct location of your Supabase client
import { createClient } from '@/utils/supabase/server';
import { Eleman, SamgazApiUser, SyncResult } from '@/types/database';

export async function POST(request: Request) {
  const supabase = createClient(); 

  try {
    const { username, password, connectionType } = await request.json();

    if (!username || !password || !connectionType) {
      return NextResponse.json<SyncResult>({
        success: false,
        message: 'Kullanıcı adı, parola ve bağlantı türü zorunludur.',
        addedCount: 0,
        deletedCount: 0,
        error: 'Eksik kimlik bilgileri'
      }, { status: 400 });
    }

    const samgazLoginResult = await loginSamgaz(username, password, connectionType);

    if (!samgazLoginResult.success || !samgazLoginResult.data?.results) {
      return NextResponse.json<SyncResult>({
        success: false,
        message: samgazLoginResult.message || 'Samgaz API\'den kullanıcı listesi alınamadı.',
        addedCount: 0,
        deletedCount: 0,
        error: 'Samgaz API hatası'
      }, { status: 401 });
    }

    const samgazUsers: SamgazApiUser[] = samgazLoginResult.data.results;
    const samgazUserIds = new Set(samgazUsers.map(u => String(u.value))); 

    const { data: supabaseElemanlar, error: supabaseError } = await supabase
      .from('elemanlar')
      .select('*'); // Tüm kolonları çekiyoruz

    if (supabaseError) {
      console.error('Supabase elemanlar çekilirken hata:', supabaseError);
      return NextResponse.json<SyncResult>({
        success: false,
        message: 'Supabase\'den mevcut elemanlar çekilirken hata oluştu.',
        addedCount: 0,
        deletedCount: 0,
        error: supabaseError.message
      }, { status: 500 });
    }

    const existingElemanlar: Eleman[] = supabaseElemanlar || [];
    const existingElemanIds = new Set(existingElemanlar.map(e => String(e.eleman_id))); 

    let addedCount = 0;
    let deletedCount = 0;

    const elemanlarToAdd = samgazUsers.filter(samgazUser => !existingElemanIds.has(String(samgazUser.value)));

    if (elemanlarToAdd.length > 0) {
      const newElemanlarData = elemanlarToAdd.map(u => ({
        eleman_id: String(u.value), 
        eleman_name: u.label,
        eleman_bool1: false, eleman_bool2: false, eleman_bool3: false, eleman_bool4: false,
        eleman_bool5: false, eleman_bool6: false, eleman_bool7: false, eleman_bool8: false,
        eleman_bool9: false, eleman_bool10: false, eleman_bool11: false, eleman_bool12: false,
        eleman_ilce: null, 
        eleman_row: null, 
        eleman_dosya1: null, eleman_dosya2: null, eleman_dosya3: null, eleman_dosya4: null,
        eleman_dosya5: null, eleman_dosya6: null, eleman_dosya7: null, eleman_dosya8: null,
      }));

      const { error: insertError } = await supabase
        .from('elemanlar')
        .insert(newElemanlarData);

      if (insertError) {
        console.error('Eleman eklenirken hata:', insertError);
      } else {
        addedCount = elemanlarToAdd.length;
      }
    }

    const elemanlarToDelete = existingElemanlar.filter(supabaseEleman => !samgazUserIds.has(String(supabaseEleman.eleman_id)));

    if (elemanlarToDelete.length > 0) {
      const elemanIdsToDelete = elemanlarToDelete.map(e => e.eleman_id);
      const { error: deleteError } = await supabase
        .from('elemanlar')
        .delete()
        .in('eleman_id', elemanIdsToDelete);

      if (deleteError) {
        console.error('Eleman silinirken hata:', deleteError);
      } else {
        deletedCount = elemanlarToDelete.length;
      }
    }

    const message = `Senkronizasyon tamamlandı: ${addedCount} eleman eklendi, ${deletedCount} eleman silindi.`;
    console.log(message);

    return NextResponse.json<SyncResult>({
      success: true,
      message: message,
      addedCount: addedCount,
      deletedCount: deletedCount,
    }, { status: 200 });

  } catch (error) {
    let errorMessage = 'Bilinmeyen bir sunucu hatası oluştu.';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    console.error('Senkronizasyon API rotasında beklenmedik hata:', error);
    return NextResponse.json<SyncResult>({
      success: false,
      message: 'Senkronizasyon sırasında beklenmedik bir hata oluştu.',
      addedCount: 0,
      deletedCount: 0,
      error: errorMessage
    }, { status: 500 });
  }
}