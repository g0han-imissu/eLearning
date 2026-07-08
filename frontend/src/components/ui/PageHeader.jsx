import { Sparkles } from 'lucide-react';

/**
 * PageHeader — tiêu đề trang hiện đại.
 * - variant="plain" (mặc định): tiêu đề + mô tả + slot hành động bên phải.
 * - variant="hero": banner gradient indigo→tím (dùng cho dashboard/trang chính).
 */
export default function PageHeader({ title, subtitle, actions, variant = 'plain', icon, eyebrow }) {
  if (variant === 'hero') {
    return (
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 px-6 py-7 sm:px-8 sm:py-8 text-white shadow-xl shadow-indigo-600/20">
        <div className="absolute -right-10 -top-10 w-44 h-44 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute right-20 bottom-0 w-32 h-32 rounded-full bg-fuchsia-400/20 blur-2xl" />
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            {eyebrow && (
              <div className="inline-flex items-center gap-1.5 text-xs font-medium bg-white/15 backdrop-blur px-3 py-1 rounded-full mb-3">
                <Sparkles size={12} />{eyebrow}
              </div>
            )}
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{title}</h1>
            {subtitle && <p className="text-sm text-indigo-100/90 mt-1.5 max-w-xl">{subtitle}</p>}
          </div>
          {actions && <div className="flex-shrink-0">{actions}</div>}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div className="flex items-center gap-3 min-w-0">
        {icon && (
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30 flex-shrink-0">
            {icon}
          </div>
        )}
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-white tracking-tight truncate">{title}</h1>
          {subtitle && <p className="text-sm text-slate-400 mt-1.5">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="flex-shrink-0">{actions}</div>}
    </div>
  );
}
