import { Outlet } from 'react-router-dom';
import { LayoutDashboard, Users, FileText } from 'lucide-react';
import Sidebar from './Sidebar';
import useAuthStore from '../../stores/authStore';

const links = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/users', icon: Users, label: 'Người dùng' },
  { to: '/admin/exams', icon: FileText, label: 'Kì thi' },
];

export default function AdminLayout() {
  const user = useAuthStore((s) => s.user);
  return (
    <div className="flex min-h-screen">
      <Sidebar title="LMS Admin" links={links} />
      <div className="flex-1 flex flex-col">
        <header className="bg-white border-b px-6 py-3.5 flex items-center justify-between">
          <h2 className="text-sm font-medium text-gray-600">Admin Portal</h2>
          <span className="text-sm text-gray-700 font-medium">{user?.fullName}</span>
        </header>
        <main className="flex-1 p-6 bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
