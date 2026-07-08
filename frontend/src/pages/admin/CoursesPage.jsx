import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, ChevronRight, GraduationCap, School } from 'lucide-react';
import { getCourses, getCourse, createCourse, updateCourse, deleteCourse, getPrograms } from '../../api/learning.api';
import Modal from '../../components/ui/Modal';
import Confirm from '../../components/ui/Confirm';
import Badge from '../../components/ui/Badge';
import PageHeader from '../../components/ui/PageHeader';
import { Button, Input, Textarea, Select } from '../../components/ui/FormField';

const statusVariant = { DRAFT: 'gray', OPEN: 'green', CLOSED: 'red', ARCHIVED: 'yellow' };
const statusLabel = { DRAFT: 'Nháp', OPEN: 'Đang mở', CLOSED: 'Đóng', ARCHIVED: 'Lưu trữ' };

export default function CoursesPage() {
  const [items, setItems] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [modal, setModal] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [detailModal, setDetailModal] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [form, setForm] = useState({ code: '', title: '', description: '', programId: '' });
  const [saving, setSaving] = useState(false);
  const [filterProgram, setFilterProgram] = useState('ALL');

  const load = () => {
    getCourses({ limit: 200 }).then(r => setItems(r.data.data || []));
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
    setSaving(true);
    try {
      if (modal === 'create') await createCourse(form);
      else await updateCourse(modal.id, form);
      setModal(null); load();
    } finally { setSaving(false); }
  };

  const filtered = filterProgram === 'ALL' ? items : items.filter(c => c.programId === filterProgram);

  return (
    <div className="space-y-7">
      <PageHeader
        title="Môn học"
        subtitle={`${items.length} môn học trong các chương trình đào tạo`}
        icon={<GraduationCap size={20} />}
        actions={<Button onClick={openCreate}><Plus size={16} />Thêm môn học</Button>}
      />

      {/* Filter by program */}
      {programs.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFilterProgram('ALL')}
            className={`px-3.5 py-2 rounded-lg text-xs font-medium transition-colors ${filterProgram === 'ALL' ? 'bg-indigo-600 text-white' : 'bg-white/5 border border-white/10 text-slate-300 hover:border-indigo-300'}`}
          >
            Tất cả
          </button>
          {programs.map(p => (
            <button
              key={p.id}
              onClick={() => setFilterProgram(p.id)}
              className={`px-3.5 py-2 rounded-lg text-xs font-medium transition-colors ${filterProgram === p.id ? 'bg-indigo-600 text-white' : 'bg-white/5 border border-white/10 text-slate-300 hover:border-indigo-300'}`}
            >
              {p.code} – {p.title}
            </button>
          ))}
        </div>
      )}

      <div className="glass overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[640px]">
          <thead>
            <tr className="bg-gradient-to-r from-white/[0.07] to-white/[0.02] border-b border-white/10">
              {['Mã', 'Tên môn học', 'Chương trình', 'Số lớp', ''].map(h => (
                <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {filtered.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-12 text-slate-500">
                <GraduationCap size={32} className="mx-auto mb-2 opacity-20" />Chưa có môn học nào
              </td></tr>
            ) : filtered.map(c => (
              <tr key={c.id} className="hover:bg-white/5 transition-colors">
                <td className="px-5 py-3.5">
                  <span className="font-mono text-xs font-semibold text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded">{c.code}</span>
                </td>
                <td className="px-5 py-3.5 font-semibold text-white">{c.title}</td>
                <td className="px-5 py-3.5 text-slate-400 text-sm">{c.program?.title || '—'}</td>
                <td className="px-5 py-3.5">
                  <button
                    onClick={() => openDetail(c)}
                    className="flex items-center gap-1.5 text-indigo-300 hover:text-indigo-200 text-xs font-semibold transition-colors group"
                  >
                    <School size={13} />
                    {c._count?.classes ?? 0} lớp
                    <ChevronRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(c)} className="p-1.5 text-slate-500 hover:text-indigo-300 hover:bg-indigo-500/10 rounded-lg transition-colors"><Pencil size={14} /></button>
                    <button onClick={() => setConfirm(c)} className="p-1.5 text-slate-500 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>

      {/* Edit/Create modal */}
      {modal && (
        <Modal title={modal === 'create' ? 'Thêm môn học mới' : 'Chỉnh sửa môn học'} onClose={() => setModal(null)} size="sm">
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1.5 block">Chương trình đào tạo</label>
              <Select value={form.programId} onChange={e => setForm({ ...form, programId: e.target.value })}>
                <option value="">-- Chọn chương trình --</option>
                {programs.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
              </Select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1.5 block">Mã môn</label>
              <Input value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} placeholder="VD: CS101, MATH201..." />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1.5 block">Tên môn học</label>
              <Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Tên đầy đủ môn học" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1.5 block">Mô tả</label>
              <Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Mô tả môn học..." />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setModal(null)}>Huỷ</Button>
              <Button onClick={handleSave} disabled={saving}>{saving ? 'Đang lưu...' : 'Lưu'}</Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Detail modal */}
      {detailModal && (
        <Modal title={`Lớp học — ${detailModal.course.title}`} onClose={() => setDetailModal(null)}>
          {detailLoading ? (
            <p className="text-slate-500 text-sm py-6 text-center">Đang tải...</p>
          ) : detailModal.classes.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <School size={32} className="mx-auto mb-2 opacity-20" />
              <p className="text-sm">Môn học này chưa có lớp nào</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {detailModal.classes.map(cls => (
                <div key={cls.id} className="flex items-center justify-between bg-white/5 rounded-xl px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-semibold text-indigo-300">{cls.code}</span>
                    <span className="text-sm font-medium text-slate-100">{cls.title}</span>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                    cls.status === 'OPEN' ? 'bg-emerald-500/15 text-emerald-300' :
                    cls.status === 'DRAFT' ? 'bg-amber-500/15 text-amber-300' : 'bg-white/10 text-slate-300'
                  }`}>{statusLabel[cls.status] || cls.status}</span>
                </div>
              ))}
            </div>
          )}
        </Modal>
      )}

      {confirm && (
        <Confirm
          message={`Xoá môn học "${confirm.title}"?`}
          onConfirm={async () => { await deleteCourse(confirm.id); setConfirm(null); load(); }}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  );
}
