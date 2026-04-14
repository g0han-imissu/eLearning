import { useEffect, useState } from 'react';
import { Search, UserCheck, UserX, Shield } from 'lucide-react';
import { getUsers, updateUserStatus, assignRoles } from '../../api/users.api';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import { Button, Select } from '../../components/ui/FormField';

const statusVariant = { ACTIVE: 'green', PENDING: 'yellow', INACTIVE: 'red' };
const statusLabel = { ACTIVE: 'Hoạt động', PENDING: 'Chờ duyệt', INACTIVE: 'Vô hiệu' };

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleModal, setRoleModal] = useState(null);
  const [selectedRole, setSelectedRole] = useState('STUDENT');

  const load = () => {
    setLoading(true);
    getUsers({ search }).then(r => setUsers(r.data.data || [])).finally(() => setLoading(false));
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

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">Quản lý người dùng</h1>
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Tìm theo email, tên..."
            className="border border-gray-300 rounded-lg pl-9 pr-4 py-2 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              {['Họ tên', 'Email', 'Vai trò', 'Trạng thái', 'Thao tác'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr><td colSpan={5} className="text-center py-8 text-gray-400">Đang tải...</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-8 text-gray-400">Không có người dùng nào</td></tr>
            ) : users.map(u => (
              <tr key={u.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{u.fullName}</td>
                <td className="px-4 py-3 text-gray-500">{u.email}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-1 flex-wrap">
                    {u.roles?.map(r => (
                      <Badge key={r.role?.name} variant={r.role?.name === 'ADMIN' ? 'purple' : r.role?.name === 'TEACHER' ? 'blue' : 'gray'}>
                        {r.role?.name}
                      </Badge>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Badge variant={statusVariant[u.status]}>{statusLabel[u.status]}</Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleStatus(u)}
                      title={u.status === 'ACTIVE' ? 'Vô hiệu hoá' : 'Kích hoạt'}
                      className={`p-1.5 rounded-lg transition-colors ${u.status === 'ACTIVE' ? 'text-red-500 hover:bg-red-50' : 'text-green-500 hover:bg-green-50'}`}
                    >
                      {u.status === 'ACTIVE' ? <UserX size={16} /> : <UserCheck size={16} />}
                    </button>
                    <button
                      onClick={() => { setRoleModal(u); setSelectedRole(u.roles?.[0]?.role?.name || 'STUDENT'); }}
                      title="Gán vai trò"
                      className="p-1.5 rounded-lg text-indigo-500 hover:bg-indigo-50 transition-colors"
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

      {roleModal && (
        <Modal title={`Gán vai trò — ${roleModal.fullName}`} onClose={() => setRoleModal(null)} size="sm">
          <div className="space-y-4">
            <Select value={selectedRole} onChange={e => setSelectedRole(e.target.value)}>
              <option value="STUDENT">STUDENT</option>
              <option value="TEACHER">TEACHER</option>
              <option value="ADMIN">ADMIN</option>
            </Select>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setRoleModal(null)}>Huỷ</Button>
              <Button onClick={handleAssignRole}>Lưu</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
