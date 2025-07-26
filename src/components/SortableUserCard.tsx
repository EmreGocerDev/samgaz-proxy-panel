// src/components/SortableUserCard.tsx
"use client";

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Eleman } from '@/types/database';
import GlassCard from './GlassCard';
import { GripVertical } from 'lucide-react'; // Sürükleme ikonu

interface SortableUserCardProps {
  user: Eleman;
}

export function SortableUserCard({ user }: SortableUserCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: user.eleman_id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <GlassCard className="w-full p-3 flex justify-between items-center touch-none">
        <div className="flex-grow flex items-center"> 
          {/* Sürükleme ikonu. Kullanıcı bu ikondan sürükleyecek. */}
          <div {...attributes} {...listeners} className="cursor-grab p-2 mr-2 text-zinc-500 hover:text-white">
             <GripVertical size={20}/>
          </div>
          <div>
            <div className="font-semibold text-white text-base">{user.eleman_name}</div>
            <div className="text-xs text-zinc-400">ID: {user.eleman_id}</div>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}