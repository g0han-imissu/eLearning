import { useEffect, useState } from 'react';
import { Users, BookOpen, GraduationCap, School, Clock, UserCheck, TrendingUp, ArrowUpRight, Sparkles } from 'lucide-react';
import { getUsers } from '../../api/users.api';
import { getPrograms, getCourses, getClasses } from '../../api/learning.api';
import { getLectures } from '../../api/content.api';
import useAuthStore from '../../stores/authStore';

export default function AdminDashboard() {
  const user = useAuthStore((s) => s.user);
  const [stats, setStats] = useState(null);
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([
      getUsers(),
      getPrograms({ limit: 100 }),
      getCourses({ limit: 100 }),
      getClasses({ limit: 100 }),
      getLectures({ limit: 100 }),
    ]).then(([usersRes, programsRes, coursesRes, classesRes, lecturesRes]) => {
      const users = usersRes.status === 'fulfilled' ? (usersRes.value.data || []) : [];
      const programs = programsRes.status === 'fulfilled' ? (programsRes.value.data?.data || []) : [];
      const courses = coursesRes.status === 'fulfilled' ? (coursesRes.value.data?.data || []) : [];
      const classes = classesRes.status === 'fulfilled' ? (classesRes.value.data?.data || []) : [];
      const lectures = lecturesRes.status === 'fulfilled' ? (lecturesRes.value.data?.data || []) : [];

      setStats({
        totalUsers: users.length,
        activeUsers: users.filter(u => u.status === 'ACTIVE').length,
        pendingUsers: users.filter(u => u.status === 'PENDING').length,
        teachers: users.filter(u => u.roles?.some(r => r.role?.name === 'TEACHER')).length,
        students: users.filter(u => u.roles?.some(r => r.role?.name === 'STUDENT')).length,
        programs: programs.length,
        courses: courses.length,
        classes: classes.length,
        openClasses: classes.filter(c => c.status === 'OPEN').length,
        lectures: lectures.length,
      });
      setRecentUsers(users.slice(0, 8));
    }).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-7 animate-pulse">
        <div className="h-8 bg-white/10 rounded-lg w-48" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="h-28 bg-white/10 rounded-2xl" />)}
        </div>
      </div>
    );
  }
  if (!stats) return <div className="text-red-400 text-sm">Không thể tải dữ liệu. Vui lòng thử lại.</div>;

  const cards = [
    { label: 'Tổng người dùng', value: stats.totalUsers, sub: `${stats.activeUsers} đang hoạt động`, icon: Users, gradient: 'from-blue-500 to-blue-600', light: 'bg-blue-500/10 text-blue-300' },
    { label: 'Chờ kích hoạt', value: stats.pendingUsers, sub: 'Cần xét duyệt', icon: Clock, gradient: 'from-amber-500 to-orange-500', light: 'bg-amber-500/10 text-amber-300' },
    { label: 'Giảng viên', value: stats.teachers, sub: `${stats.students} học viên`, icon: UserCheck, gradient: 'from-emerald-500 to-teal-500', light: 'bg-emerald-500/10 text-emerald-300' },
    { label: 'Lớp học', value: stats.classes, sub: `${stats.openClasses} đang mở`, icon: School, gradient: 'from-purple-500 to-violet-500', light: 'bg-purple-500/10 text-purple-300' },
    { label: 'Chương trình', value: stats.programs, sub: `${stats.courses} môn học`, icon: BookOpen, gradient: 'from-indigo-500 to-blue-600', light: 'bg-indigo-500/10 text-indigo-300' },
    { label: 'Bài giảng', value: stats.lectures, sub: 'Tổng bài giảng', icon: GraduationCap, gradient: 'from-rose-500 to-pink-500', light: 'bg-rose-500/10 text-rose-300' },
  ];

  const statusColor = { ACTIVE: 'bg-emerald-500/15 text-emerald-300', PENDING: 'bg-amber-500/15 text-amber-300', INACTIVE: 'bg-white/10 text-slate-400' };
  const statusLabel = { ACTIVE: 'Hoạt động', PENDING: 'Chờ duyệt', INACTIVE: 'Vô hiệu' };
  const roleColor = { ADMIN: 'bg-purple-500/15 text-purple-300', TEACHER: 'bg-blue-500/15 text-blue-300', STUDENT: 'bg-white/10 text-slate-300' };
  const roleLabel = { ADMIN: 'Quản trị', TEACHER: 'Giảng viên', STUDENT: 'Học viên' };

  return (
    <div className="space-y-8">
      {/* Hero banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 px-6 py-7 sm:px-8 sm:py-8 text-white shadow-xl shadow-indigo-600/20">
        <div className="absolute -right-10 -top-10 w-44 h-44 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute right-20 bottom-0 w-32 h-32 rounded-full bg-fuchsia-400/20 blur-2xl" />
        <div className="relative">
          <div className="inline-flex items-center gap-1.5 text-xs font-medium bg-white/15 backdrop-blur px-3 py-1 rounded-full mb-3">
            <Sparkles size={12} />Tổng quan hệ thống
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Xin chào{user?.fullName ? `, ${user.fullName}` : ''} 👋
          </h1>
          <p className="text-sm text-indigo-100/90 mt-1.5 max-w-xl">
            Đây là bức tranh toàn cảnh về người dùng, chương trình và lớp học trong hệ thống quản lý đào tạo.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map(({ label, value, sub, icon: Icon, gradient, light }) => (
          <div key={label} className="group relative bg-white/5 rounded-2xl p-5 shadow-sm border border-white/10 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 overflow-hidden">
            <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${gradient}`} />
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-md`}>
                <Icon size={22} className="text-white" />
              </div>
              <span className={`text-[11px] font-semibold px-2 py-1 rounded-lg ${light}`}>{sub}</span>
            </div>
            <p className="text-3xl font-bold text-white mb-0.5 tracking-tight">{value}</p>
            <p className="text-sm text-slate-400 flex items-center gap-1">
              {label}
              <ArrowUpRight size={13} className="text-slate-600 group-hover:text-indigo-400 transition-colors" />
            </p>
          </div>
        ))}
      </div>

      {/* Recent users table */}
      <div className="glass overflow-hidden">
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <h2 className="font-semibold text-white flex items-center gap-2">
            <TrendingUp size={16} className="text-indigo-400" />Người dùng mới nhất
          </h2>
          <span className="text-xs text-slate-500">{recentUsers.length} người dùng</span>
        </div>
        <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[640px]">
          <thead>
            <tr className="bg-gradient-to-r from-white/[0.07] to-white/[0.02] border-b border-white/10">
              {['Người dùng', 'Email', 'Vai trò', 'Trạng thái'].map(h => (
                <th key={h} className="text-left px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {recentUsers.map(u => (
              <tr key={u.id} className="hover:bg-white/5 transition-colors">
                <td className="px-6 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-500/15 flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {u.avatarUrl
                        ? <img src={u.avatarUrl} alt="" className="w-full h-full object-cover" />
                        : <span className="text-xs font-bold text-indigo-300">{u.fullName?.[0]}</span>}
                    </div>
                    <span className="font-medium text-white">{u.fullName}</span>
                  </div>
                </td>
                <td className="px-6 py-3.5 text-slate-400">{u.email}</td>
                <td className="px-6 py-3.5">
                  <div className="flex gap-1 flex-wrap">
                    {u.roles?.map(r => (
                      <span key={r.role?.name} className={`text-xs px-2 py-0.5 rounded-full font-medium ${roleColor[r.role?.name] || 'bg-white/10 text-slate-300'}`}>
                        {roleLabel[r.role?.name] || r.role?.name}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-3.5">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColor[u.status]}`}>
                    {statusLabel[u.status]}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}
