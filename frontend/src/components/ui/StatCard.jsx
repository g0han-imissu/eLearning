/**
 * StatCard — thẻ số liệu kính mờ (dark glass): icon nền gradient phát sáng,
 * viền accent phía trên, badge phụ, hiệu ứng nhấc khi hover.
 *
 * Props: label, value, sub, icon (Component), gradient ('from-x to-y'), light ('bg-x/15 text-x-300')
 */
export default function StatCard({ label, value, sub, icon: Icon, gradient = 'from-indigo-500 to-violet-600', light = 'bg-indigo-500/15 text-indigo-300' }) {
  return (
    <div className="group relative glass p-5 hover:bg-white/[0.09] hover:-translate-y-0.5 transition-all duration-200 overflow-hidden">
      <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${gradient}`} />
      <div className="flex items-center justify-between mb-3">
        {Icon && (
          <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg shadow-black/30`}>
            <Icon size={20} className="text-white" />
          </div>
        )}
        {sub && <span className={`text-[11px] font-semibold px-2 py-1 rounded-lg ${light}`}>{sub}</span>}
      </div>
      <p className="text-3xl font-bold text-white tracking-tight">{value}</p>
      <p className="text-sm text-slate-400 mt-0.5">{label}</p>
    </div>
  );
}
