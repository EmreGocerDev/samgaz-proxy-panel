// src/components/GlassCard.tsx
import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
}

const GlassCard: React.FC<GlassCardProps> = ({ children, className }) => {
  return (
    <div className={`
      relative
      p-6
      space-y-4
      border
      rounded-2xl
      shadow-2xl shadow-black/50
      bg-gray-900/40
      border-white/20
      backdrop-blur-xl
      ${className || ''}
    `}>
      {children}
    </div>
  );
};

export default GlassCard;