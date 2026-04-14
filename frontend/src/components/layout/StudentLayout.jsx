import { Outlet } from 'react-router-dom';
import { BookOpen, GraduationCap } from 'lucide-react';
import Sidebar from './Sidebar';
import useAuthStore from '../../stores/authStore';

const links = [
  { to: '/student', icon: BookOpen, label: 'Lớp học của tôi' },
];

export default function StudentLayout() {
  const user = useAuthStore((s) => s.user);
  return (
    <div className="flex min-h-screen">
      <Sidebar title="LMS Học viên" links={links} />
      <div className="flex-1 flex flex-col">
        <header className="bg-white border-b px-6 py-3.5 flex items-center justify-between">
          <h2 className="text-sm font-medium text-gray-600">Học viên</h2>
          <span className="text-sm text-gray-700 font-medium">{user?.fullName}</span>
        </header>
        <main className="flex-1 p-6 bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
