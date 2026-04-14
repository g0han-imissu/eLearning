import { Users, BookOpen, GraduationCap, FileText } from 'lucide-react';

const stats = [
  { label: 'Người dùng', value: '—', icon: Users, color: 'bg-blue-500' },
  { label: 'Chương trình', value: '—', icon: BookOpen, color: 'bg-green-500' },
  { label: 'Lớp học', value: '—', icon: GraduationCap, color: 'bg-purple-500' },
  { label: 'Kì thi', value: '—', icon: FileText, color: 'bg-orange-500' },
];

export default function AdminDashboard() {
  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-6">Dashboard</h1>
      <div className="grid grid-cols-4 gap-4 mb-8">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-500">{label}</span>
              <div className={`${color} w-9 h-9 rounded-lg flex items-center justify-center`}>
                <Icon size={18} className="text-white" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
