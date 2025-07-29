// src/components/GlassCard.tsx
"use client";

import React from 'react';

// Gerekli Prop tiplerini tanımlıyoruz
interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  title?: string;
  bgColor?: string; // YENİ: Arka plan rengini dışarıdan almak için
}

const GlassCard: React.FC<GlassCardProps> = ({ 
  children, 
  className = '', 
  style, 
  onClick, 
  title,
  bgColor = 'bg-zinc-900/50' // Varsayılan arka plan rengi
}) => {
  return (
    <div
      onClick={onClick}
      title={title}
      // DEĞİŞİKLİK: Sabit renk yerine dışarıdan gelen bgColor prop'u kullanılıyor
      className={`${bgColor} backdrop-blur-lg border border-zinc-800/50 rounded-lg ${className}`}
      style={style}
    >
      {children}
    </div>
  );
};

export default GlassCard;