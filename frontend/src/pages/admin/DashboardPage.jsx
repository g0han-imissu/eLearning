import { useEffect, useState } from 'react';
import { Users, BookOpen, GraduationCap, School, Clock, UserCheck, TrendingUp, Activity } from 'lucide-react';
import { getUsers } from '../../api/users.api';
import { getPrograms, getCourses, getClasses } from '../../api/learning.api';
import { getLectures } from '../../api/content.api';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getUsers(),
      getPrograms({ limit: 100 }),
      getCourses({ limit: 100 }),
      getClasses({ limit: 100 }),
      getLectures({ limit: 100 }),
    ]).then(([usersRes, programsRes, coursesRes, classesRes, lecturesRes]) => {
      const users = usersRes.data.data || usersRes.data || [];
      const programs = programsRes.data.data || [];
      const courses = coursesRes.data.data || [];
      const classes = classesRes.data.data || [];
      const lectures = lecturesRes.data.data || [];

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

  if (loading) return <div className="text-gray-400 text-sm">Đang tải...</div>;

  const cards = [
    { label: 'Tổng người dùng', value: stats.totalUsers, sub: `${stats.activeUsers} đang hoạt động`, icon: Users, color: 'bg-blue-500', textColor: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Chờ kích hoạt', value: stats.pendingUsers, sub: 'Chưa xác nhận email', icon: Clock, color: 'bg-amber-500', textColor: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Giảng viên', value: stats.teachers, sub: `${stats.students} học viên`, icon: UserCheck, color: 'bg-green-500', textColor: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Lớp học', value: stats.classes, sub: `${stats.openClasses} đang mở`, icon: School, color: 'bg-purple-500', textColor: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Chương trình', value: stats.programs, sub: `${stats.courses} môn học`, icon: BookOpen, color: 'bg-indigo-500', textColor: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Bài giảng', value: stats.lectures, sub: 'Tổng bài giảng', icon: GraduationCap, color: 'bg-rose-500', textColor: 'text-rose-600', bg: 'bg-rose-50' },
  ];

  const statusColor = { ACTIVE: 'bg-green-100 text-green-700', PENDING: 'bg-amber-100 text-amber-700', INACTIVE: 'bg-gray-100 text-gray-500' };
  const statusLabel = { ACTIVE: 'Hoạt động', PENDING: 'Chờ duyệt', INACTIVE: 'Vô hiệu' };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
        <span className="flex items-center gap-1.5 text-xs text-gray-400"><Activity size={13} />Dữ liệu thực tế</span>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {cards.map(({ label, value, sub, icon: Icon, color, textColor, bg }) => (
          <div key={label} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-500">{label}</span>
              <div className={`${bg} w-9 h-9 rounded-lg flex items-center justify-center`}>
                <Icon size={18} className={textColor} />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-xs text-gray-400 mt-1">{sub}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b flex items-center justify-between">
          <h2 className="font-semibold text-gray-900 text-sm flex items-center gap-2"><TrendingUp size={15} />Người dùng mới nhất</h2>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              {['Họ tên', 'Email', 'Vai trò', 'Trạng thái'].map(h => (
                <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {recentUsers.map(u => (
              <tr key={u.id} className="hover:bg-gray-50">
                <td className="px-5 py-3 font-medium text-gray-900">{u.fullName}</td>
                <td className="px-5 py-3 text-gray-500">{u.email}</td>
                <td className="px-5 py-3">
                  <div className="flex gap-1 flex-wrap">
                    {u.roles?.map(r => (
                      <span key={r.role?.name} className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        r.role?.name === 'ADMIN' ? 'bg-purple-100 text-purple-700' :
                        r.role?.name === 'TEACHER' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                      }`}>{r.role?.name}</span>
                    ))}
                  </div>
                </td>
                <td className="px-5 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor[u.status]}`}>
                    {statusLabel[u.status]}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
