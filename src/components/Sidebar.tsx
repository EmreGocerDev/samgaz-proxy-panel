// src/components/Sidebar.tsx
"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Users, Settings, LogOut, Menu, X, GitPullRequest, TrendingUp } from 'lucide-react'; // Yeni ikonlar: GitPullRequest, TrendingUp

interface SidebarProps {
  currentUserUsername: string | null; // Mevcut kullanıcının kullanıcı adını prop olarak alacağız
}

const Sidebar: React.FC<SidebarProps> = ({ currentUserUsername }) => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false); // Mobil görünüm için sidebar'ın açık/kapalı durumu

  const navItems = [
    { name: 'Samrest Atar', href: '/dashboard', icon: Home }, // Ana Panel yerine Samrest Atar
    { name: 'Kullanıcı Eşitle', href: '/dashboard/sync-users', icon: GitPullRequest }, // Yeni link ve ikon
    { name: 'Stabilizasyon', href: '/dashboard/stabilization', icon: TrendingUp },   // Yeni link ve ikon
  ];

  // Sidebar'ın otomatik kapanması için useEffect (mobil cihazlarda)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) { // md breakpoint (768px)
        setIsOpen(false); // Masaüstü boyutuna gelince mobil menüyü kapat
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <>
      {/* Mobil için menü butonu */}
      <button 
        className="fixed top-4 left-4 z-50 p-2 bg-zinc-900/60 border border-zinc-800 rounded-lg md:hidden text-white backdrop-blur-md"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar - Tüm dikey ekranı kaplasın */}
      <aside 
        className={`
          fixed inset-y-0 left-0 z-40
          w-64 transform 
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0 md:relative md:w-64
          min-h-screen   // <--- Bu satır sidebar'ın minimum ekran yüksekliğini kaplamasını sağlar
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

        {/* Kullanıcı Adı ve Çıkış butonu */}
        <div className="mt-auto pt-6 border-t border-zinc-700 flex flex-col gap-4">
          {currentUserUsername && (
            <div className="flex items-center text-zinc-300 text-sm font-medium">
              <Users size={18} className="mr-2 text-cyan-400" />
              <span>Giriş Yapan: <span className="font-bold text-white">{currentUserUsername}</span></span>
            </div>
          )}
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