import { Outlet } from 'react-router-dom';
import { BookOpen, Library, UserCircle } from 'lucide-react';
import Sidebar from './Sidebar';
import useAuthStore from '../../stores/authStore';

const links = [
  { to: '/teacher', icon: BookOpen, label: 'Lớp học của tôi' },
  { to: '/teacher/lectures', icon: Library, label: 'Bài giảng' },
  { to: '/teacher/profile', icon: UserCircle, label: 'Tài khoản' },
];

export default function TeacherLayout() {
  const user = useAuthStore((s) => s.user);
  return (
    <div className="flex min-h-screen">
      <Sidebar title="LMS Giảng viên" links={links} />
      <div className="flex-1 flex flex-col">
        <header className="bg-white border-b px-6 py-3.5 flex items-center justify-between">
          <h2 className="text-sm font-medium text-gray-600">Giảng viên</h2>
          <span className="text-sm text-gray-700 font-medium">{user?.fullName}</span>
        </header>
        <main className="flex-1 p-6 bg-gray-50"><Outlet /></main>
      </div>
    </div>
  );
}
