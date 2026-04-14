import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, UserPlus } from 'lucide-react';
import { getClasses, createClass, updateClass, deleteClass, enrollClass } from '../../api/learning.api';
import { getCourses } from '../../api/learning.api';
import { getUsers } from '../../api/users.api';
import Modal from '../../components/ui/Modal';
import Confirm from '../../components/ui/Confirm';
import Badge from '../../components/ui/Badge';
import { Button, Input, Select } from '../../components/ui/FormField';

const statusVariant = { DRAFT: 'gray', OPEN: 'green', CLOSED: 'red', ARCHIVED: 'yellow' };

export default function ClassesPage() {
  const [items, setItems] = useState([]);
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [modal, setModal] = useState(null);
  const [enrollModal, setEnrollModal] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [form, setForm] = useState({ code: '', title: '', courseId: '', teacherId: '', status: 'DRAFT', startDate: '', endDate: '' });
  const [enrollStudentId, setEnrollStudentId] = useState('');
  const [loading, setLoading] = useState(false);

  const load = () => {
    getClasses().then(r => setItems(r.data.data || []));
    getCourses().then(r => setCourses(r.data.data || []));
    getUsers({ role: 'TEACHER' }).then(r => setTeachers((r.data.data || []).filter(u => u.roles?.some(r => r.role?.name === 'TEACHER'))));
    getUsers().then(r => setStudents((r.data.data || []).filter(u => u.roles?.some(r => r.role?.name === 'STUDENT'))));
  };
  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setForm({ code: '', title: '', courseId: courses[0]?.id || '', teacherId: teachers[0]?.id || '', status: 'DRAFT', startDate: '', endDate: '' });
    setModal('create');
  };
  const openEdit = (item) => {
    setForm({ code: item.code, title: item.title, courseId: item.courseId, teacherId: item.teacherId, status: item.status, startDate: item.startDate?.slice(0, 10) || '', endDate: item.endDate?.slice(0, 10) || '' });
    setModal(item);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const payload = { ...form, startDate: form.startDate || undefined, endDate: form.endDate || undefined };
      if (modal === 'create') await createClass(payload);
      else await updateClass(modal.id, payload);
      setModal(null); load();
    } finally { setLoading(false); }
  };

  const handleEnroll = async () => {
    if (!enrollStudentId) return;
    await enrollClass({ classId: enrollModal.id, studentId: enrollStudentId });
    setEnrollModal(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">Lớp học</h1>
        <Button onClick={openCreate}><Plus size={16} />Tạo lớp học</Button>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>{['Mã lớp', 'Tên lớp', 'Môn học', 'Giảng viên', 'Trạng thái', 'SL', ''].map(h => (
              <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
            ))}</tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {items.map(c => (
              <tr key={c.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-mono text-xs text-indigo-600">{c.code}</td>
                <td className="px-4 py-3 font-medium text-gray-900">{c.title}</td>
                <td className="px-4 py-3 text-gray-500">{c.course?.title || '—'}</td>
                <td className="px-4 py-3 text-gray-500">{c.teacher?.fullName || '—'}</td>
                <td className="px-4 py-3"><Badge variant={statusVariant[c.status]}>{c.status}</Badge></td>
                <td className="px-4 py-3 text-gray-500">{c._count?.enrollments ?? 0}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <button onClick={() => { setEnrollModal(c); setEnrollStudentId(students[0]?.id || ''); }} className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg" title="Ghi danh học viên"><UserPlus size={14} /></button>
                    <button onClick={() => openEdit(c)} className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"><Pencil size={14} /></button>
                    <button onClick={() => setConfirm(c)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <Modal title={modal === 'create' ? 'Tạo lớp học' : 'Sửa lớp học'} onClose={() => setModal(null)}>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs font-medium text-gray-600 mb-1 block">Mã lớp</label><Input value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} /></div>
            <div><label className="text-xs font-medium text-gray-600 mb-1 block">Tên lớp</label><Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></div>
            <div><label className="text-xs font-medium text-gray-600 mb-1 block">Môn học</label>
              <Select value={form.courseId} onChange={e => setForm({ ...form, courseId: e.target.value })}>
                {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
              </Select></div>
            <div><label className="text-xs font-medium text-gray-600 mb-1 block">Giảng viên</label>
              <Select value={form.teacherId} onChange={e => setForm({ ...form, teacherId: e.target.value })}>
                {teachers.map(t => <option key={t.id} value={t.id}>{t.fullName}</option>)}
              </Select></div>
            <div><label className="text-xs font-medium text-gray-600 mb-1 block">Trạng thái</label>
              <Select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                {['DRAFT', 'OPEN', 'CLOSED', 'ARCHIVED'].map(s => <option key={s} value={s}>{s}</option>)}
              </Select></div>
            <div></div>
            <div><label className="text-xs font-medium text-gray-600 mb-1 block">Ngày bắt đầu</label><Input type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} /></div>
            <div><label className="text-xs font-medium text-gray-600 mb-1 block">Ngày kết thúc</label><Input type="date" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} /></div>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setModal(null)}>Huỷ</Button>
            <Button onClick={handleSave} disabled={loading}>{loading ? 'Đang lưu...' : 'Lưu'}</Button>
          </div>
        </Modal>
      )}

      {enrollModal && (
        <Modal title={`Ghi danh vào "${enrollModal.title}"`} onClose={() => setEnrollModal(null)} size="sm">
          <div className="space-y-3">
            <div><label className="text-xs font-medium text-gray-600 mb-1 block">Học viên</label>
              <Select value={enrollStudentId} onChange={e => setEnrollStudentId(e.target.value)}>
                {students.map(s => <option key={s.id} value={s.id}>{s.fullName} — {s.email}</option>)}
              </Select></div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEnrollModal(null)}>Huỷ</Button>
              <Button onClick={handleEnroll}>Ghi danh</Button>
            </div>
          </div>
        </Modal>
      )}

      {confirm && <Confirm message={`Xoá lớp "${confirm.title}"?`} onConfirm={async () => { await deleteClass(confirm.id); setConfirm(null); load(); }} onCancel={() => setConfirm(null)} />}
    </div>
  );
}
