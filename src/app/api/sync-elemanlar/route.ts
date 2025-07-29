// src/app/api/sync-elemanlar/route.ts

import { NextResponse } from 'next/server';
import { loginSamgaz } from '../../lib/auth';
import { createClient } from '@/utils/supabase/server';
import { Eleman, SamgazApiUser, SyncResult } from '@/types/database';

export async function POST(request: Request) {
  const supabase = createClient();

  try {
    const body = await request.json();
    const { username, password, connectionType } = body;

    if (!username || !password || !connectionType) {
      // HATA DURUMU GÜNCELLENDİ
      return NextResponse.json<SyncResult>({
        success: false,
        message: 'Kullanıcı adı, parola ve bağlantı türü zorunludur.',
        addedCount: 0,
        deletedCount: 0,
        updatedCount: 0,
      }, { status: 400 });
    }

    const samgazLoginResult = await loginSamgaz(username, password, connectionType);
    if (!samgazLoginResult.success || !samgazLoginResult.data?.results) {
      // HATA DURUMU GÜNCELLENDİ
      return NextResponse.json<SyncResult>({
        success: false,
        message: samgazLoginResult.message || "Samgaz API'den kullanıcı listesi alınamadı.",
        error: 'Samgaz API hatası',
        addedCount: 0,
        deletedCount: 0,
        updatedCount: 0,
      }, { status: 401 });
    }
    const samgazUsers: SamgazApiUser[] = samgazLoginResult.data.results;
    const samgazUserMap = new Map(samgazUsers.map(u => [String(u.value), u]));

    const { data: supabaseElemanlar, error: supabaseError } = await supabase
      .from('elemanlar')
      .select('eleman_id, eleman_name');

    if (supabaseError) {
      throw new Error(`Supabase'den elemanlar çekilirken hata: ${supabaseError.message}`);
    }
    const existingElemanMap = new Map(supabaseElemanlar.map(e => [e.eleman_id, e]));

    const dataToUpsert: Partial<Eleman>[] = [];
    let addedCount = 0;
    let updatedCount = 0;

    for (const samgazUser of samgazUsers) {
      const samgazId = String(samgazUser.value);
      const existingEleman = existingElemanMap.get(samgazId);

      if (!existingEleman) {
        dataToUpsert.push({ eleman_id: samgazId, eleman_name: samgazUser.label });
        addedCount++;
      } else if (existingEleman.eleman_name !== samgazUser.label) {
        dataToUpsert.push({ eleman_id: samgazId, eleman_name: samgazUser.label });
        updatedCount++;
      }
    }

    if (dataToUpsert.length > 0) {
      const { error: upsertError } = await supabase.from('elemanlar').upsert(dataToUpsert);
      if (upsertError) {
        throw new Error(`Elemanlar güncellenirken/eklenirken hata: ${upsertError.message}`);
      }
    }

    const elemanIdsToDelete = supabaseElemanlar
      .filter(e => !samgazUserMap.has(e.eleman_id))
      .map(e => e.eleman_id);

    let deletedCount = 0;
    if (elemanIdsToDelete.length > 0) {
      const { error: deleteError } = await supabase.from('elemanlar').delete().in('eleman_id', elemanIdsToDelete);
      if (deleteError) {
        throw new Error(`Eski elemanlar silinirken hata: ${deleteError.message}`);
      }
      deletedCount = elemanIdsToDelete.length;
    }

    const message = `Senkronizasyon tamamlandı: ${addedCount} eklendi, ${updatedCount} güncellendi, ${deletedCount} silindi.`;
    console.log(message);

    return NextResponse.json<SyncResult>({
      success: true,
      message,
      addedCount,
      updatedCount,
      deletedCount,
    }, { status: 200 });

  } catch (error) {
    console.error('Senkronizasyon API rotasında beklenmedik hata:', error);
    // HATA DURUMU GÜNCELLENDİ
    return NextResponse.json<SyncResult>({
      success: false,
      message: 'Senkronizasyon sırasında beklenmedik bir hata oluştu.',
      error: error instanceof Error ? error.message : 'Bilinmeyen Hata',
      addedCount: 0,
      deletedCount: 0,
      updatedCount: 0,
    }, { status: 500 });
  }
}