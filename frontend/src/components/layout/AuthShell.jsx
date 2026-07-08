import { GraduationCap, BookOpen, Users, Video } from 'lucide-react';

const FEATURES = [
  { icon: BookOpen, label: 'Bài giảng đa phương tiện' },
  { icon: Video, label: 'Lớp học trực tuyến' },
  { icon: Users, label: 'Quản lý học viên' },
  { icon: GraduationCap, label: 'Theo dõi tiến độ' },
];

/**
 * AuthShell — khung chung cho các trang đăng nhập/đăng ký:
 * một thẻ kính lớn căn giữa màn hình, chia 2 nửa brand + form.
 */
export default function AuthShell({ headline, tagline, children }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-4xl lg:min-h-[580px] glass !rounded-3xl overflow-hidden grid lg:grid-cols-2 shadow-2xl shadow-black/50">
        {/* Brand panel */}
        <div className="relative hidden lg:flex flex-col overflow-hidden bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 text-white p-10">
          <div className="absolute -right-16 -top-16 w-72 h-72 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute left-10 bottom-10 w-56 h-56 rounded-full bg-fuchsia-400/20 blur-3xl" />
          <div className="absolute inset-0 opacity-[0.07]" style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
            backgroundSize: '22px 22px',
          }} />

          <div className="relative flex items-center gap-3">
            <div className="w-10 h-10 bg-white/15 backdrop-blur rounded-xl flex items-center justify-center text-lg font-extrabold ring-1 ring-white/20">L</div>
            <span className="text-base font-bold tracking-tight">LMS Platform</span>
          </div>

          <div className="relative my-auto py-12">
            <h2 className="text-[26px] font-bold leading-snug whitespace-pre-line">{headline}</h2>
            <p className="text-indigo-100/80 mt-4 max-w-xs text-sm leading-relaxed">{tagline}</p>
            <div className="grid grid-cols-2 gap-2.5 mt-10 max-w-sm">
              {FEATURES.map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2 bg-white/10 backdrop-blur rounded-xl px-3 py-2.5 text-xs ring-1 ring-white/10">
                  <Icon size={14} className="flex-shrink-0 opacity-80" />{label}
                </div>
              ))}
            </div>
          </div>

          <p className="relative text-[11px] text-indigo-200/60">© {new Date().getFullYear()} LMS Platform</p>
        </div>

        {/* Form panel */}
        <div className="flex items-center justify-center px-6 py-10 sm:px-12 sm:py-14 bg-white/[0.02]">
          <div className="w-full max-w-sm">
            {/* Logo cho mobile (brand panel bị ẩn) */}
            <div className="lg:hidden flex items-center gap-3 mb-10 justify-center">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-lg font-extrabold shadow-lg shadow-indigo-600/40">L</div>
              <span className="text-lg font-bold text-white">LMS Platform</span>
            </div>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
