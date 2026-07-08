export default function FormField({ label, error, children }) {
  return (
    <div>
      {label && <label className="block text-sm font-medium text-slate-300 mb-2">{label}</label>}
      {children}
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  );
}

const fieldBase =
  'w-full bg-white/[0.06] border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 ' +
  'transition-all duration-150 hover:border-white/20 focus:outline-none focus:bg-white/[0.08] ' +
  'focus:ring-2 focus:ring-indigo-400/40 focus:border-indigo-400/50';

export function Input({ className = '', ...props }) {
  return <input className={`${fieldBase} ${className}`} {...props} />;
}

export function Select({ children, className = '', ...props }) {
  return (
    <select className={`${fieldBase} appearance-none bg-no-repeat cursor-pointer [&>option]:bg-slate-900 [&>option]:text-slate-100 ${className}`}
      style={{
        backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E\")",
        backgroundPosition: 'right 0.85rem center',
        paddingRight: '2.5rem',
      }}
      {...props}
    >
      {children}
    </select>
  );
}

export function Textarea({ className = '', ...props }) {
  return <textarea rows={3} className={`${fieldBase} resize-none ${className}`} {...props} />;
}

export function Button({ children, variant = 'primary', size = 'md', className = '', ...props }) {
  const base =
    'relative inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-150 ' +
    'active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 ' +
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/50 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900';
  const sizes = {
    sm: 'text-xs px-4 py-2',
    md: 'text-sm px-5 py-2.5',
    lg: 'text-base px-7 py-3.5',
  };
  const variants = {
    primary:
      'text-white bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-600/30 ' +
      'ring-1 ring-inset ring-white/15 hover:shadow-xl hover:shadow-indigo-600/40 hover:brightness-110',
    danger:
      'text-white bg-gradient-to-br from-red-500 to-rose-600 shadow-lg shadow-red-600/30 ' +
      'ring-1 ring-inset ring-white/15 hover:brightness-110',
    outline: 'text-slate-200 border border-white/15 bg-white/[0.03] hover:bg-white/[0.08] hover:border-white/25',
    ghost: 'text-slate-300 hover:bg-white/10 hover:text-white',
  };
  return (
    <button className={`${base} ${sizes[size]} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}
