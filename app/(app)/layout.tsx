import React from 'react';
import { Sidebar } from '../../components/ui/Sidebar';
import { Header } from '../../components/dashboard/Header';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#0A0E1A] overflow-hidden relative flex text-white">
      {/* Background radial gradient */}
      <div 
        className="absolute top-0 right-0 w-[400px] md:w-[800px] h-[400px] md:h-[800px] pointer-events-none rounded-full z-0"
        style={{
          background: 'radial-gradient(circle at 70% 30%, rgba(0, 212, 200, 0.15) 0%, rgba(124, 58, 237, 0.12) 40%, transparent 70%)',
          filter: 'blur(80px)'
        }}
      />

      <Sidebar className="z-50" />
      
      {/* ml-0 on mobile (bottom nav), ml-12 on tablet (48px sidebar), ml-[64px] on desktop */}
      <div className="ml-0 md:ml-12 lg:ml-[64px] flex-1 h-screen overflow-y-auto relative z-10 flex flex-col pb-20 md:pb-0">
        <Header />
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
