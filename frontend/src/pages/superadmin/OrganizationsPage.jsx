import { useEffect, useState } from 'react';
import { Building2, Lock, LockOpen, Users, School, GraduationCap } from 'lucide-react';
import { getOrganizations, suspendOrganization, activateOrganization } from '../../api/platform.api';
import Badge from '../../components/ui/Badge';
import Confirm from '../../components/ui/Confirm';
import PageHeader from '../../components/ui/PageHeader';
import StatCard from '../../components/ui/StatCard';

export default function OrganizationsPage() {
  const [orgs, setOrgs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmTarget, setConfirmTarget] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = () => {
    setLoading(true);
    getOrganizations().then((r) => setOrgs(r.data || [])).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleToggle = async () => {
    setBusy(true);
    try {
      if (confirmTarget.status === 'ACTIVE') await suspendOrganization(confirmTarget.id);
      else await activateOrganization(confirmTarget.id);
      setConfirmTarget(null);
      load();
    } finally {
      setBusy(false);
    }
  };

  const stats = {
    total: orgs.length,
    active: orgs.filter((o) => o.status === 'ACTIVE').length,
    users: orgs.reduce((s, o) => s + (o._count?.users || 0), 0),
    classes: orgs.reduce((s, o) => s + (o._count?.classes || 0), 0),
  };

  return (
    <div className="space-y-7">
      <PageHeader
        title="Tổ chức"
        subtitle="Quản lý các trường / doanh nghiệp trên nền tảng"
        icon={<Building2 size={20} />}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Tổng tổ chức" value={stats.total} icon={Building2} gradient="from-indigo-500 to-violet-600" light="bg-indigo-500/10 text-indigo-300" />
        <StatCard label="Đang hoạt động" value={stats.active} icon={LockOpen} gradient="from-emerald-500 to-teal-600" light="bg-emerald-500/10 text-emerald-300" />
        <StatCard label="Tổng người dùng" value={stats.users} icon={Users} gradient="from-blue-500 to-indigo-600" light="bg-blue-500/10 text-blue-300" />
        <StatCard label="Tổng lớp học" value={stats.classes} icon={School} gradient="from-slate-500 to-slate-700" light="bg-slate-500/15 text-slate-300" />
      </div>

      <div className="glass overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[720px]">
            <thead>
              <tr className="bg-gradient-to-r from-white/[0.07] to-white/[0.02] border-b border-white/10">
                {['Tổ chức', 'Gói', 'Người dùng', 'Lớp học', 'Môn học', 'Trạng thái', 'Thao tác'].map((h) => (
                  <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {loading ? (
                <tr><td colSpan={7} className="text-center py-12 text-slate-500">Đang tải...</td></tr>
              ) : orgs.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-slate-500">Chưa có tổ chức nào</td></tr>
              ) : orgs.map((o) => (
                <tr key={o.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-indigo-500/15 flex items-center justify-center flex-shrink-0">
                        <GraduationCap size={16} className="text-indigo-300" />
                      </div>
                      <div>
                        <p className="font-semibold text-white">{o.name}</p>
                        <p className="text-xs text-slate-500">{o.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-white/10 text-slate-300">{o.plan}</span>
                  </td>
                  <td className="px-5 py-3.5 text-slate-300">
                    {o._count?.users ?? 0}{o.maxUsers ? ` / ${o.maxUsers}` : ''}
                  </td>
                  <td className="px-5 py-3.5 text-slate-300">{o._count?.classes ?? 0}</td>
                  <td className="px-5 py-3.5 text-slate-300">{o._count?.courses ?? 0}</td>
                  <td className="px-5 py-3.5">
                    <Badge variant={o.status === 'ACTIVE' ? 'green' : 'red'}>
                      {o.status === 'ACTIVE' ? 'Hoạt động' : 'Bị khóa'}
                    </Badge>
                  </td>
                  <td className="px-5 py-3.5">
                    <button
                      onClick={() => setConfirmTarget(o)}
                      title={o.status === 'ACTIVE' ? 'Khóa tổ chức' : 'Mở khóa'}
                      className={`p-1.5 rounded-lg transition-colors ${
                        o.status === 'ACTIVE'
                          ? 'text-red-400 hover:bg-red-500/10 hover:text-red-300'
                          : 'text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300'
                      }`}
                    >
                      {o.status === 'ACTIVE' ? <Lock size={16} /> : <LockOpen size={16} />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {confirmTarget && (
        <Confirm
          message={
            confirmTarget.status === 'ACTIVE'
              ? `Khóa tổ chức "${confirmTarget.name}"? Toàn bộ người dùng của tổ chức sẽ bị chặn truy cập ngay lập tức.`
              : `Mở khóa tổ chức "${confirmTarget.name}"?`
          }
          onConfirm={busy ? undefined : handleToggle}
          onCancel={() => setConfirmTarget(null)}
        />
      )}
    </div>
  );
}
