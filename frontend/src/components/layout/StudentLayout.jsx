import { BookOpen, UserCircle } from 'lucide-react';
import DashboardShell from './DashboardShell';

const links = [
  { to: '/student', icon: BookOpen, label: 'Lớp học của tôi' },
  { to: '/student/profile', icon: UserCircle, label: 'Tài khoản' },
];

export default function StudentLayout() {
  return <DashboardShell title="LMS" subtitle="Học viên" links={links} />;
}
