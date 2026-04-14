import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, ChevronRight, School } from 'lucide-react';
import { getCourses, getCourse, createCourse, updateCourse, deleteCourse, getPrograms } from '../../api/learning.api';
import Modal from '../../components/ui/Modal';
import Confirm from '../../components/ui/Confirm';
import Badge from '../../components/ui/Badge';
import { Button, Input, Textarea, Select } from '../../components/ui/FormField';

const statusVariant = { DRAFT: 'gray', OPEN: 'green', CLOSED: 'red', ARCHIVED: 'yellow' };

export default function CoursesPage() {
  const [items, setItems] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [modal, setModal] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [detailModal, setDetailModal] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [form, setForm] = useState({ code: '', title: '', description: '', programId: '' });
  const [loading, setLoading] = useState(false);

  const load = () => {
    getCourses({ limit: 100 }).then(r => setItems(r.data.data || []));
    getPrograms({ limit: 100 }).then(r => setPrograms(r.data.data || []));
  };
  useEffect(() => { load(); }, []);

  const openCreate = () => { setForm({ code: '', title: '', description: '', programId: programs[0]?.id || '' }); setModal('create'); };
  const openEdit = (item) => { setForm({ code: item.code, title: item.title, description: item.description || '', programId: item.programId }); setModal(item); };

  const openDetail = async (item) => {
    setDetailLoading(true);
    setDetailModal({ course: item, classes: [] });
    try {
      const r = await getCourse(item.id);
      setDetailModal({ course: r.data, classes: r.data.classes || [] });
    } finally { setDetailLoading(false); }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      if (modal === 'create') await createCourse(form);
      else await updateCourse(modal.id, form);
      setModal(null); load();
    } finally { setLoading(false); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">Môn học</h1>
        <Button onClick={openCreate}><Plus size={16} />Thêm môn học</Button>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>{['Mã', 'Tên môn học', 'Chương trình', 'Số lớp', ''].map(h => (
              <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
            ))}</tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {items.map(c => (
              <tr key={c.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-mono text-xs text-indigo-600">{c.code}</td>
                <td className="px-4 py-3 font-medium text-gray-900">{c.title}</td>
                <td className="px-4 py-3 text-gray-500">{c.program?.title || '—'}</td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => openDetail(c)}
                    className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 text-xs font-medium"
                  >
                    <School size={13} />
                    {c._count?.classes ?? 0} lớp
                    <ChevronRight size={12} />
                  </button>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(c)} className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"><Pencil size={14} /></button>
                    <button onClick={() => setConfirm(c)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit/Create modal */}
      {modal && (
        <Modal title={modal === 'create' ? 'Thêm môn học' : 'Sửa môn học'} onClose={() => setModal(null)} size="sm">
          <div className="space-y-3">
            <div><label className="text-xs font-medium text-gray-600 mb-1 block">Chương trình</label>
              <Select value={form.programId} onChange={e => setForm({ ...form, programId: e.target.value })}>
                {programs.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
              </Select></div>
            <div><label className="text-xs font-medium text-gray-600 mb-1 block">Mã môn</label>
              <Input value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} /></div>
            <div><label className="text-xs font-medium text-gray-600 mb-1 block">Tên môn học</label>
              <Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></div>
            <div><label className="text-xs font-medium text-gray-600 mb-1 block">Mô tả</label>
              <Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setModal(null)}>Huỷ</Button>
              <Button onClick={handleSave} disabled={loading}>{loading ? 'Đang lưu...' : 'Lưu'}</Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Detail modal - classes list */}
      {detailModal && (
        <Modal title={`Lớp học — ${detailModal.course.title}`} onClose={() => setDetailModal(null)}>
          {detailLoading ? (
            <p className="text-gray-400 text-sm py-4 text-center">Đang tải...</p>
          ) : detailModal.classes.length === 0 ? (
            <p className="text-gray-400 text-sm py-6 text-center">Môn học này chưa có lớp nào.</p>
          ) : (
            <div className="space-y-2">
              {detailModal.classes.map(cls => (
                <div key={cls.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3">
                  <div>
                    <span className="text-xs font-mono text-indigo-600 mr-2">{cls.code}</span>
                    <span className="text-sm font-medium text-gray-800">{cls.title}</span>
                  </div>
                  <Badge variant={statusVariant[cls.status] || 'gray'}>{cls.status}</Badge>
                </div>
              ))}
            </div>
          )}
        </Modal>
      )}

      {confirm && <Confirm message={`Xoá môn học "${confirm.title}"?`} onConfirm={async () => { await deleteCourse(confirm.id); setConfirm(null); load(); }} onCancel={() => setConfirm(null)} />}
    </div>
  );
}
