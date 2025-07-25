// src/components/Sidebar.tsx
"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, List, Settings, LogOut, Menu, X, User } from 'lucide-react'; // İkonlar için

interface SidebarProps {
  // İsterseniz buraya kullanıcı bilgisi gibi propslar ekleyebilirsiniz
}

const Sidebar: React.FC<SidebarProps> = () => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false); // Mobil görünüm için sidebar'ın açık/kapalı durumu

  const navItems = [
    { name: 'Ana Panel', href: '/dashboard', icon: Home },
    { name: 'Tüm İşlemler', href: '/dashboard/transactions', icon: List },
    { name: 'Kullanıcılarım', href: '/dashboard/users', icon: User }, // Yeni bir link ekledik
    { name: 'Ayarlar', href: '/dashboard/settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobil için menü butonu */}
      <button 
        className="fixed top-4 left-4 z-50 p-2 bg-zinc-900/60 border border-zinc-800 rounded-lg md:hidden text-white backdrop-blur-md"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar - Hem masaüstü hem mobil için */}
      <aside 
        className={`
          fixed inset-y-0 left-0 z-40
          w-64 transform 
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0 md:relative md:w-64
          h-full
          bg-zinc-900/60 backdrop-blur-xl border-r border-zinc-800
          transition-transform duration-300 ease-in-out
          flex flex-col p-4
        `}
      >
        {/* Logo/Başlık alanı */}
        <div className="flex items-center justify-center h-20 border-b border-zinc-700 mb-6">
          <h1 className="text-2xl font-bold text-white tracking-wider">SAMREST</h1>
        </div>

        {/* Navigasyon Linkleri */}
        <nav className="flex-grow space-y-2">
          {navItems.map((item) => (
            <Link 
              key={item.name} 
              href={item.href}
              className={`
                flex items-center p-3 rounded-lg text-white font-medium
                transition-colors duration-200
                ${pathname === item.href ? 'bg-cyan-700/50 text-cyan-200 border border-cyan-600/50' : 'hover:bg-zinc-800/50 hover:text-white'}
              `}
              onClick={() => setIsOpen(false)} // Mobil menüyü kapat
            >
              <item.icon size={20} className="mr-3" />
              {item.name}
            </Link>
          ))}
        </nav>

        {/* Çıkış butonu veya alt kısım */}
        <div className="mt-auto pt-6 border-t border-zinc-700">
          <button 
            onClick={() => console.log("Çıkış Yapıldı")} // Çıkış yapma işlevini buraya ekleyin
            className="flex items-center w-full p-3 rounded-lg text-red-400 font-medium hover:bg-red-900/50 transition-colors duration-200"
          >
            <LogOut size={20} className="mr-3" />
            Çıkış Yap
          </button>
        </div>
      </aside>

      {/* Mobil görünümde sidebar açıkken arka planı karart */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden" 
          onClick={() => setIsOpen(false)}
        ></div>
      )}
    </>
  );
};

export default Sidebar;