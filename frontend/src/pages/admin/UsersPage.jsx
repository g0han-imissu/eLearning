import { useEffect, useState } from 'react';
import { Search, UserCheck, UserX, Shield, Eye, Users, GraduationCap, UserCog, UserPlus, Upload, History } from 'lucide-react';
import { getUsers, updateUserStatus, assignRoles } from '../../api/users.api';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import StatCard from '../../components/ui/StatCard';
import PageHeader from '../../components/ui/PageHeader';
import { Button, Select } from '../../components/ui/FormField';
import AddUserModal from '../../components/users/AddUserModal';
import ImportUsersModal from '../../components/users/ImportUsersModal';
import ImportJobsModal from '../../components/users/ImportJobsModal';

const statusVariant = { ACTIVE: 'green', PENDING: 'yellow', INACTIVE: 'red' };
const statusLabel = { ACTIVE: 'Hoạt động', PENDING: 'Chưa kích hoạt', INACTIVE: 'Vô hiệu' };
const roleColor = { ORG_ADMIN: 'bg-purple-500/15 text-purple-300', ADMIN: 'bg-purple-500/15 text-purple-300', TEACHER: 'bg-blue-500/15 text-blue-300', STUDENT: 'bg-white/10 text-slate-300' };
const roleLabel = { ORG_ADMIN: 'Quản trị', ADMIN: 'Quản trị (cũ)', TEACHER: 'Giảng viên', STUDENT: 'Học viên' };

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('ALL');
  const [roleModal, setRoleModal] = useState(null);
  const [detailModal, setDetailModal] = useState(null);
  const [selectedRole, setSelectedRole] = useState('STUDENT');
  const [addModal, setAddModal] = useState(false);
  const [importModal, setImportModal] = useState(false);
  const [jobsModal, setJobsModal] = useState(false);

  const load = () => {
    setLoading(true);
    getUsers({ search }).then(r => setUsers(r.data || [])).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [search]);

  const handleStatus = async (user) => {
    const next = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    await updateUserStatus(user.id, next);
    load();
  };

  const handleAssignRole = async () => {
    await assignRoles(roleModal.id, [selectedRole]);
    setRoleModal(null);
    load();
  };

  const filtered = filterRole === 'ALL'
    ? users
    : users.filter(u => u.roles?.some(r => r.role?.name === filterRole));

  const isTeacher = (u) => u.roles?.some(r => r.role?.name === 'TEACHER');

  const stats = {
    total: users.length,
    active: users.filter(u => u.status === 'ACTIVE').length,
    teachers: users.filter(isTeacher).length,
    students: users.filter(u => u.roles?.some(r => r.role?.name === 'STUDENT')).length,
  };

  return (
    <div className="space-y-7">
      <PageHeader
        title="Quản lý người dùng"
        subtitle="Quản lý tài khoản, vai trò và trạng thái người dùng"
        icon={<Users size={20} />}
        actions={
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => setJobsModal(true)}>
              <History size={14} /> Lịch sử import
            </Button>
            <Button size="sm" variant="outline" onClick={() => setImportModal(true)}>
              <Upload size={14} /> Import file
            </Button>
            <Button size="sm" onClick={() => setAddModal(true)}>
              <UserPlus size={14} /> Thêm người dùng
            </Button>
          </div>
        }
      />

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Tổng người dùng" value={stats.total} icon={Users} gradient="from-slate-500 to-slate-700" light="bg-slate-500/15 text-slate-300" />
        <StatCard label="Đang hoạt động" value={stats.active} icon={UserCheck} gradient="from-emerald-500 to-teal-600" light="bg-emerald-500/10 text-emerald-300" />
        <StatCard label="Giảng viên" value={stats.teachers} icon={GraduationCap} gradient="from-blue-500 to-indigo-600" light="bg-blue-500/10 text-blue-300" />
        <StatCard label="Học viên" value={stats.students} icon={UserCog} gradient="from-indigo-500 to-violet-600" light="bg-indigo-500/10 text-indigo-300" />
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Tìm theo email, tên..."
            className="border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white/5"
          />
        </div>
        <div className="flex gap-1.5">
          {['ALL', 'ORG_ADMIN', 'TEACHER', 'STUDENT'].map(role => (
            <button
              key={role}
              onClick={() => setFilterRole(role)}
              className={`px-3.5 py-2 rounded-lg text-xs font-medium transition-colors ${
                filterRole === role
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white/5 border border-white/10 text-slate-300 hover:border-indigo-300'
              }`}
            >
              {role === 'ALL' ? 'Tất cả' : roleLabel[role] || role}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="glass overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[720px]">
          <thead>
            <tr className="bg-gradient-to-r from-white/[0.07] to-white/[0.02] border-b border-white/10">
              {['Người dùng', 'Liên hệ', 'Vai trò', 'Trạng thái', 'Thao tác'].map(h => (
                <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {loading ? (
              <tr><td colSpan={5} className="text-center py-12 text-slate-500">Đang tải...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-12 text-slate-500">Không có người dùng nào</td></tr>
            ) : filtered.map(u => (
              <tr key={u.id} className="hover:bg-white/5 transition-colors">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-indigo-500/15 flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {u.avatarUrl
                        ? <img src={u.avatarUrl} alt="" className="w-full h-full object-cover" />
                        : <span className="text-sm font-bold text-indigo-300">{u.fullName?.[0]}</span>}
                    </div>
                    <div>
                      <p className="font-semibold text-white">{u.fullName}</p>
                      {u.userCode && <p className="text-xs text-slate-500">{u.userCode}</p>}
                      {isTeacher(u) && u.specialization && (
                        <p className="text-xs text-blue-300">{u.specialization}</p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3.5">
                  <p className="text-slate-300 text-sm">{u.email || <span className="font-mono text-indigo-300">{u.username}</span>}</p>
                  {u.phone && <p className="text-xs text-slate-500">{u.phone}</p>}
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex gap-1 flex-wrap">
                    {u.roles?.map(r => (
                      <span key={r.role?.name} className={`text-xs px-2 py-0.5 rounded-full font-medium ${roleColor[r.role?.name] || 'bg-white/10 text-slate-300'}`}>
                        {roleLabel[r.role?.name] || r.role?.name}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-5 py-3.5">
                  <Badge variant={statusVariant[u.status]}>{statusLabel[u.status]}</Badge>
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex gap-1.5">
                    {isTeacher(u) && (
                      <button
                        onClick={() => setDetailModal(u)}
                        title="Xem hồ sơ"
                        className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-300 hover:bg-indigo-500/10 transition-colors"
                      >
                        <Eye size={16} />
                      </button>
                    )}
                    {u.status !== 'PENDING' && (
                      <button
                        onClick={() => handleStatus(u)}
                        title={u.status === 'ACTIVE' ? 'Vô hiệu hoá' : 'Kích hoạt lại'}
                        className={`p-1.5 rounded-lg transition-colors ${u.status === 'ACTIVE' ? 'text-red-400 hover:bg-red-500/10 hover:text-red-300' : 'text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300'}`}
                      >
                        {u.status === 'ACTIVE' ? <UserX size={16} /> : <UserCheck size={16} />}
                      </button>
                    )}
                    <button
                      onClick={() => { setRoleModal(u); setSelectedRole(u.roles?.[0]?.role?.name || 'STUDENT'); }}
                      title="Gán vai trò"
                      className="p-1.5 rounded-lg text-slate-500 hover:text-purple-300 hover:bg-purple-500/10 transition-colors"
                    >
                      <Shield size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>

      {/* Role modal */}
      {roleModal && (
        <Modal title={`Đổi vai trò — ${roleModal.fullName}`} onClose={() => setRoleModal(null)} size="sm">
          <div className="space-y-4">
            <p className="text-sm text-slate-400">
              Vai trò hiện tại:{' '}
              <span className="font-semibold text-slate-100">
                {roleModal.roles?.map(r => roleLabel[r.role?.name] || r.role?.name).join(', ') || '—'}
              </span>
            </p>
            <Select value={selectedRole} onChange={e => setSelectedRole(e.target.value)}>
              <option value="STUDENT">Học viên (STUDENT)</option>
              <option value="TEACHER">Giảng viên (TEACHER)</option>
              <option value="ORG_ADMIN">Quản trị viên (ORG_ADMIN)</option>
            </Select>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setRoleModal(null)}>Huỷ</Button>
              <Button onClick={handleAssignRole}>Lưu thay đổi</Button>
            </div>
          </div>
        </Modal>
      )}

      {addModal && <AddUserModal onClose={() => setAddModal(false)} onCreated={load} />}
      {importModal && <ImportUsersModal onClose={() => setImportModal(false)} onImported={load} />}
      {jobsModal && <ImportJobsModal onClose={() => setJobsModal(false)} onChanged={load} />}

      {/* Teacher detail modal */}
      {detailModal && (
        <Modal title="Hồ sơ giảng viên" onClose={() => setDetailModal(null)} size="md">
          <div className="space-y-4">
            <div className="flex items-center gap-4 pb-4 border-b border-white/10">
              <div className="w-16 h-16 rounded-full bg-blue-500/15 flex items-center justify-center overflow-hidden flex-shrink-0">
                {detailModal.avatarUrl
                  ? <img src={detailModal.avatarUrl} alt="" className="w-full h-full object-cover" />
                  : <span className="text-2xl font-bold text-blue-300">{detailModal.fullName?.[0]}</span>}
              </div>
              <div>
                <p className="text-lg font-bold text-white">{detailModal.fullName}</p>
                <p className="text-sm text-slate-400">{detailModal.email}</p>
                {detailModal.phone && <p className="text-sm text-slate-400">{detailModal.phone}</p>}
              </div>
            </div>
            {detailModal.specialization && (
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Chuyên môn</p>
                <p className="text-sm text-slate-100">{detailModal.specialization}</p>
              </div>
            )}
            {detailModal.bio && (
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Giới thiệu bản thân</p>
                <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">{detailModal.bio}</p>
              </div>
            )}
            {!detailModal.specialization && !detailModal.bio && (
              <p className="text-sm text-slate-500 text-center py-4">Giảng viên chưa cập nhật hồ sơ</p>
            )}
            <div className="flex justify-end pt-2">
              <Button variant="outline" onClick={() => setDetailModal(null)}>Đóng</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
