// src/components/Sidebar.tsx
"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation'; // useRouter eklendi
import { Home, Users, LogOut, GitPullRequest, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';
import { createClient } from '@/utils/supabase/client'; // Supabase client eklendi

interface SidebarProps {
  currentUserUsername: string | null;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  isSyncing: boolean;
  handleSync: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentUserUsername, isOpen, setIsOpen, isSyncing, handleSync }) => {
  const pathname = usePathname();
  const router = useRouter(); // router tanımlandı
  const supabase = createClient();

  const navItems = [
    { name: 'Samrest Atar', href: '/dashboard', icon: Home },
    { name: 'Stabilizasyon', href: '/dashboard/stabilization', icon: TrendingUp },
  ];

  // YENİ: Çıkış yapma fonksiyonu
  const handleLogout = async () => {
    const toastId = toast.loading('Çıkış yapılıyor...');
    await supabase.auth.signOut();
    toast.dismiss(toastId);
    toast.success('Başarıyla çıkış yapıldı!');
    
    // Yönlendirme ve sayfayı yenileme, middleware'in devreye girmesini sağlar
    router.push('/');
    router.refresh();
  };

  return (
    <>
      <aside 
        className={`fixed inset-y-0 left-0 z-40 w-64 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} bg-zinc-900/80 backdrop-blur-xl border-r border-zinc-800 transition-transform duration-300 ease-in-out flex flex-col p-4`}
      >
        <div className="flex items-center justify-center h-20 border-b border-zinc-700 mb-6">
          <h1 className="text-2xl font-bold text-white tracking-wider">SAMREST</h1>
        </div>

        <nav className="flex-grow space-y-2">
          {navItems.map((item) => (
            <Link key={item.name} href={item.href} className={`flex items-center p-3 rounded-lg text-white font-medium transition-colors duration-200 ${pathname === item.href ? 'bg-cyan-700/50' : 'hover:bg-zinc-800/50'}`} onClick={() => setIsOpen(false)}>
              <item.icon size={20} className="mr-3" />
              {item.name}
            </Link>
          ))}
          <button
            onClick={handleSync}
            disabled={isSyncing}
            className="w-full flex items-center p-3 rounded-lg text-white font-medium transition-colors duration-200 hover:bg-zinc-800/50 disabled:opacity-50 disabled:cursor-wait"
          >
            {isSyncing ? (
              <svg className="animate-spin mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <GitPullRequest size={20} className="mr-3" />
            )}
            Kullanıcıları Eşitle
          </button>
        </nav>

        <div className="mt-auto pt-6 border-t border-zinc-700 flex flex-col gap-4">
          {currentUserUsername && (
            <div className="flex items-center text-zinc-300 text-sm font-medium">
              <Users size={18} className="mr-2 text-cyan-400" />
              <span>Giriş Yapan: <span className="font-bold text-white">{currentUserUsername}</span></span>
            </div>
          )}
          {/* DÜZELTME: onClick artık handleLogout fonksiyonunu çağırıyor */}
          <button onClick={handleLogout} className="flex items-center w-full p-3 rounded-lg text-red-400 font-medium hover:bg-red-900/50">
            <LogOut size={20} className="mr-3" />
            Çıkış Yap
          </button>
        </div>
      </aside>

      {isOpen && <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setIsOpen(false)}></div>}
    </>
  );
};

export default Sidebar;