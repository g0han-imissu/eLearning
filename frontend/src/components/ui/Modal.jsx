import { X } from 'lucide-react';

export default function Modal({ title, subtitle, onClose, children, size = 'md' }) {
  const sizes = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-overlay" onClick={onClose}>
      <div
        className={`animate-modal relative w-full ${sizes[size]} max-h-[90vh] overflow-hidden rounded-2xl border border-white/10 ring-1 ring-white/10 bg-slate-900/85 backdrop-blur-2xl shadow-2xl shadow-black/50 text-slate-200 flex flex-col`}
        onClick={e => e.stopPropagation()}
      >
        {/* Accent glow */}
        <div className="pointer-events-none absolute -top-px inset-x-0 h-px bg-gradient-to-r from-transparent via-indigo-400/60 to-transparent" />
        <div className="pointer-events-none absolute -top-16 left-1/2 -translate-x-1/2 w-64 h-32 bg-indigo-500/20 blur-3xl" />

        <div className="relative flex items-start justify-between gap-4 px-6 py-4 border-b border-white/10">
          <div className="flex items-center gap-3 min-w-0">
            <span className="mt-1 w-1.5 h-6 rounded-full bg-gradient-to-b from-indigo-400 to-violet-500 flex-shrink-0" />
            <div className="min-w-0">
              <h2 className="font-bold text-white text-base leading-tight truncate">{title}</h2>
              {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 -mr-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors flex-shrink-0"><X size={18} /></button>
        </div>

        <div className="relative px-6 py-5 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
