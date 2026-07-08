import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, Inbox, Users, School, Lock, LayoutDashboard, ArrowRight } from 'lucide-react';
import { getPlatformStats, getOrgRequests } from '../../api/platform.api';
import StatCard from '../../components/ui/StatCard';
import PageHeader from '../../components/ui/PageHeader';
import Badge from '../../components/ui/Badge';

export default function SuperAdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [pending, setPending] = useState([]);

  useEffect(() => {
    getPlatformStats().then((r) => setStats(r.data));
    getOrgRequests({ status: 'PENDING' }).then((r) => setPending(r.data || []));
  }, []);

  return (
    <div className="space-y-7">
      <PageHeader
        title="Tổng quan nền tảng"
        subtitle="Theo dõi tổ chức, người dùng và yêu cầu đăng ký trên toàn hệ thống"
        icon={<LayoutDashboard size={20} />}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Tổ chức" value={stats?.organizations ?? '—'} icon={Building2} gradient="from-indigo-500 to-violet-600" light="bg-indigo-500/10 text-indigo-300" />
        <StatCard label="Yêu cầu chờ duyệt" value={stats?.pendingRequests ?? '—'} icon={Inbox} gradient="from-amber-500 to-orange-600" light="bg-amber-500/10 text-amber-300" />
        <StatCard label="Người dùng" value={stats?.users ?? '—'} icon={Users} gradient="from-emerald-500 to-teal-600" light="bg-emerald-500/10 text-emerald-300" />
        <StatCard label="Lớp học" value={stats?.classes ?? '—'} icon={School} gradient="from-blue-500 to-indigo-600" light="bg-blue-500/10 text-blue-300" />
      </div>

      {stats?.suspended > 0 && (
        <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 text-red-300 rounded-xl px-4 py-3 text-sm">
          <Lock size={16} />
          Có {stats.suspended} tổ chức đang bị khóa.
        </div>
      )}

      <div className="glass overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <h3 className="font-semibold text-white text-sm">Yêu cầu đăng ký mới nhất</h3>
          <Link to="/super/requests" className="flex items-center gap-1 text-xs text-indigo-300 hover:text-indigo-200 font-semibold">
            Xem tất cả <ArrowRight size={13} />
          </Link>
        </div>
        {pending.length === 0 ? (
          <p className="text-center py-10 text-slate-500 text-sm">Không có yêu cầu nào đang chờ duyệt</p>
        ) : (
          <div className="divide-y divide-white/10">
            {pending.slice(0, 5).map((r) => (
              <div key={r.id} className="flex items-center justify-between px-5 py-3.5">
                <div>
                  <p className="font-semibold text-white text-sm">{r.orgName}</p>
                  <p className="text-xs text-slate-400">{r.contactName} · {r.email}</p>
                </div>
                <Badge variant="yellow">Chờ duyệt</Badge>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
