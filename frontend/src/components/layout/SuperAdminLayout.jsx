import { LayoutDashboard, Inbox, Building2, UserCircle } from 'lucide-react';
import DashboardShell from './DashboardShell';

const links = [
  { to: '/super', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/super/requests', icon: Inbox, label: 'Yêu cầu đăng ký' },
  { to: '/super/organizations', icon: Building2, label: 'Tổ chức' },
  { to: '/super/profile', icon: UserCircle, label: 'Tài khoản' },
];

export default function SuperAdminLayout() {
  return <DashboardShell title="LMS Platform" subtitle="Super Admin" links={links} />;
}
