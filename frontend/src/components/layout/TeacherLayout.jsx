import { BookOpen, Library, UserCircle, GraduationCap } from 'lucide-react';
import DashboardShell from './DashboardShell';

const links = [
  { to: '/teacher', icon: BookOpen, label: 'Lớp học của tôi' },
  { to: '/teacher/lectures', icon: Library, label: 'Bài giảng' },
  { to: '/teacher/my-courses', icon: GraduationCap, label: 'Môn tôi dạy được' },
  { to: '/teacher/profile', icon: UserCircle, label: 'Tài khoản' },
];

export default function TeacherLayout() {
  return <DashboardShell title="LMS" subtitle="Giảng viên" links={links} />;
}
