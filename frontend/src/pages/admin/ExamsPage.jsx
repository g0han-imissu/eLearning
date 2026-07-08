import { FileText, Sparkles, ShieldCheck, Clock } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';

export default function ExamsPage() {
  return (
    <div className="space-y-7">
      <PageHeader title="Kì thi online" subtitle="Quản lý kì thi và cấu hình AI phát hiện gian lận" icon={<FileText size={20} />} />

      <div className="glass p-10 text-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center mx-auto mb-4 shadow-md">
          <Sparkles size={28} className="text-white" />
        </div>
        <h2 className="text-lg font-bold text-white">Sắp ra mắt</h2>
        <p className="text-sm text-slate-400 mt-1 max-w-md mx-auto">
          Tính năng kì thi trực tuyến với giám sát AI đang được phát triển.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-8 max-w-2xl mx-auto">
          {[
            { icon: Clock, label: 'Đề thi có thời gian' },
            { icon: ShieldCheck, label: 'Phát hiện gian lận' },
            { icon: FileText, label: 'Chấm điểm tự động' },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2.5 bg-white/5 rounded-xl px-4 py-3 text-sm text-slate-300">
              <Icon size={16} className="text-indigo-400 flex-shrink-0" />{label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
