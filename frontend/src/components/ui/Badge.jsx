const variants = {
  green: 'bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/20',
  red: 'bg-red-500/15 text-red-300 ring-1 ring-red-500/20',
  yellow: 'bg-amber-500/15 text-amber-300 ring-1 ring-amber-500/20',
  blue: 'bg-blue-500/15 text-blue-300 ring-1 ring-blue-500/20',
  gray: 'bg-white/10 text-slate-300 ring-1 ring-white/10',
  purple: 'bg-violet-500/15 text-violet-300 ring-1 ring-violet-500/20',
};

export default function Badge({ children, variant = 'gray' }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${variants[variant]}`}>
      {children}
    </span>
  );
}
