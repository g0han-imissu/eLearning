import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu } from 'lucide-react';
import Sidebar from './Sidebar';

export default function DashboardShell({ title, subtitle, links }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-screen text-slate-200">
      <Sidebar title={title} subtitle={subtitle} links={links} open={open} onClose={() => setOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top bar */}
        <header className="lg:hidden sticky top-0 z-20 flex items-center gap-3 bg-slate-950/60 backdrop-blur-xl border-b border-white/10 px-4 py-3">
          <button
            onClick={() => setOpen(true)}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg"
            aria-label="Mở menu"
          >
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-xs font-bold text-white">
              L
            </div>
            <span className="font-bold text-sm text-white">{title}</span>
          </div>
        </header>

        <main className="flex-1 overflow-auto px-5 py-6 sm:px-8 sm:py-8 lg:px-10 lg:py-9">
          <div className="mx-auto w-full max-w-[1400px]"><Outlet /></div>
        </main>
      </div>
    </div>
  );
}
