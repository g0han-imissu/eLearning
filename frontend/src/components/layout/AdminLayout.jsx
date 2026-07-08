import { LayoutDashboard, Users, BookOpen, GraduationCap, School, FileText, UserCircle } from 'lucide-react';
import DashboardShell from './DashboardShell';

const links = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/users', icon: Users, label: 'Người dùng' },
  { to: '/admin/programs', icon: BookOpen, label: 'Chương trình' },
  { to: '/admin/courses', icon: GraduationCap, label: 'Môn học' },
  { to: '/admin/classes', icon: School, label: 'Lớp học' },
  { to: '/admin/exams', icon: FileText, label: 'Kì thi' },
  { to: '/admin/profile', icon: UserCircle, label: 'Tài khoản' },
];

export default function AdminLayout() {
  return <DashboardShell title="LMS Admin" subtitle="Quản trị viên" links={links} />;
}
