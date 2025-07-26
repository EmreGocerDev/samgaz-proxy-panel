// src/app/page.tsx
"use client";

import { useState } from 'react';
import Image from 'next/image';
import InteractiveBackground from '../components/InteractiveBackground';
import LoginForm from './login-form';

interface TracerColor { rgb: string; shadow: string; }
interface ColorOption { name: string; className: string; color: TracerColor; }

const colorOptions: ColorOption[] = [
  { name: 'Mor', className: 'bg-fuchsia-500', color: { rgb: '255, 0, 255', shadow: 'magenta' } },
  { name: 'Mavi', className: 'bg-cyan-400', color: { rgb: '34, 211, 238', shadow: 'cyan' } },
  { name: 'Sarı', className: 'bg-yellow-400', color: { rgb: '250, 204, 21', shadow: '#facc15' } },
  { name: 'Kırmızı', className: 'bg-red-500', color: { rgb: '239, 68, 68', shadow: '#ef4444' } },
];

export default function LoginPage() {
  const [tracerColor, setTracerColor] = useState<TracerColor>({ rgb: '255, 0, 255', shadow: 'magenta' });

  return (
    <main className="relative flex items-center justify-center min-h-screen overflow-hidden bg-gray-950">
      
      <div className="absolute top-6 right-6 z-30 flex space-x-1.5 p-1 bg-zinc-900/50 border border-zinc-700 rounded-full backdrop-blur-sm">
        {colorOptions.map((option) => (
          <button
            key={option.name}
            title={option.name}
            onClick={() => setTracerColor(option.color)}
            className={`w-5 h-5 rounded-full transition-transform hover:scale-125 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-900 focus:ring-white ${option.className}`}
          />
        ))}
      </div>

      <div className="absolute top-8 left-1/2 -translate-x-1/2 z-30">
        <Image src="/logo.png" alt="Şirket Logosu" width={180} height={50} priority className="opacity-90"/>
      </div>

      <InteractiveBackground tracerColor={tracerColor} />

      <div className="absolute z-10 w-[56rem] h-[56rem] bg-cyan-900/50 rounded-full -top-1/4 -left-1/4 filter blur-3xl opacity-30"></div>
      <div className="absolute z-10 w-[48rem] h-[48rem] bg-fuchsia-900/50 rounded-full -bottom-1/4 -right-1/4 filter blur-3xl opacity-30"></div>
      
      <LoginForm />

    </main>
  );
}