// src/app/layout.tsx

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Samrest Atar",
  description: "Ayka Enerji Samrest Atar Uygulaması",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className={inter.className}>
        <Toaster
          position="top-center"
          toastOptions={{
            // Tüm bildirimler için ortak stil
            style: {
              background: 'rgb(24 24 27)',      // Koyu arkaplan (zinc-900)
              color: '#d946ef',                // Mor-Kırmızı arası bir renk (fuchsia-500)
              border: '1px solid rgb(63 63 70)', // Kenarlık (zinc-700)
            },
            // Başarı bildirimlerinin ikon rengini tema ile uyumlu hale getirelim
            success: {
              iconTheme: {
                primary: '#22c55e',          // Yeşil
                secondary: 'rgb(24 24 27)', // İkonun arkaplanı, ana arkaplanla aynı
              },
            },
            // Hata bildirimlerinin ikon rengini tema ile uyumlu hale getirelim
            error: {
              iconTheme: {
                primary: '#ef4444',          // Kırmızı
                secondary: 'rgb(24 24 27)', // İkonun arkaplanı, ana arkaplanla aynı
              },
            },
          }}
        />
        {children}
      </body>
    </html>
  );
}