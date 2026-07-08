import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, BookOpen, ChevronRight } from 'lucide-react';
import { getPrograms, getProgram, createProgram, updateProgram, deleteProgram } from '../../api/learning.api';
import Modal from '../../components/ui/Modal';
import Confirm from '../../components/ui/Confirm';
import PageHeader from '../../components/ui/PageHeader';
import { Button, Input, Textarea } from '../../components/ui/FormField';

export default function ProgramsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [detailModal, setDetailModal] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [form, setForm] = useState({ code: '', title: '', description: '' });
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    getPrograms({ limit: 100 }).then(r => setItems(r.data.data || [])).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const openCreate = () => { setForm({ code: '', title: '', description: '' }); setModal('create'); };
  const openEdit = (item) => { setForm({ code: item.code, title: item.title, description: item.description || '' }); setModal(item); };

  const openDetail = async (item) => {
    setDetailLoading(true);
    setDetailModal({ program: item, courses: [] });
    try {
      const r = await getProgram(item.id);
      setDetailModal({ program: r.data, courses: r.data.courses || [] });
    } finally { setDetailLoading(false); }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (modal === 'create') await createProgram(form);
      else await updateProgram(modal.id, form);
      setModal(null); load();
    } finally { setSaving(false); }
  };

  return (
    <div className="space-y-7">
      <PageHeader
        title="Chương trình đào tạo"
        subtitle={`${items.length} chương trình`}
        icon={<BookOpen size={20} />}
        actions={<Button onClick={openCreate}><Plus size={16} />Thêm chương trình</Button>}
      />

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <div key={i} className="h-36 bg-white/10 rounded-2xl animate-pulse" />)}
        </div>
      ) : items.length === 0 ? (
        <div className="glass p-12 text-center text-slate-500">
          <BookOpen size={40} className="mx-auto mb-3 opacity-20" />
          <p>Chưa có chương trình đào tạo nào</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map(p => (
            <div key={p.id} className="glass p-5 hover:shadow-md transition-shadow flex flex-col">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <span className="inline-block text-xs text-indigo-300 font-mono font-semibold bg-indigo-500/10 px-2 py-0.5 rounded-md mb-2">{p.code}</span>
                  <h3 className="font-bold text-white text-base leading-snug">{p.title}</h3>
                </div>
                <div className="flex gap-1 ml-2 flex-shrink-0">
                  <button onClick={() => openEdit(p)} className="p-1.5 text-slate-500 hover:text-indigo-300 hover:bg-indigo-500/10 rounded-lg transition-colors"><Pencil size={14} /></button>
                  <button onClick={() => setConfirm(p)} className="p-1.5 text-slate-500 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"><Trash2 size={14} /></button>
                </div>
              </div>

              {p.description && (
                <p className="text-xs text-slate-400 line-clamp-2 flex-1">{p.description}</p>
              )}

              <button
                onClick={() => openDetail(p)}
                className="mt-4 flex items-center gap-1.5 text-xs text-indigo-300 hover:text-indigo-200 font-semibold group"
              >
                <BookOpen size={12} />
                {p._count?.courses ?? 0} môn học
                <ChevronRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Edit/Create modal */}
      {modal && (
        <Modal title={modal === 'create' ? 'Thêm chương trình đào tạo' : 'Chỉnh sửa chương trình'} onClose={() => setModal(null)} size="sm">
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1.5 block">Mã chương trình</label>
              <Input value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} placeholder="VD: CNTT, KT, QT..." />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1.5 block">Tên chương trình</label>
              <Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Tên đầy đủ của chương trình" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1.5 block">Mô tả</label>
              <Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Mô tả chương trình đào tạo..." />
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
        <Modal title={`Môn học trong — ${detailModal.program.title}`} onClose={() => setDetailModal(null)}>
          {detailLoading ? (
            <p className="text-slate-500 text-sm py-6 text-center">Đang tải...</p>
          ) : detailModal.courses.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <BookOpen size={32} className="mx-auto mb-2 opacity-20" />
              <p className="text-sm">Chương trình này chưa có môn học nào</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {detailModal.courses.map(c => (
                <div key={c.id} className="flex items-center justify-between bg-white/5 rounded-xl px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-semibold text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded">{c.code}</span>
                    <span className="text-sm font-medium text-slate-100">{c.title}</span>
                  </div>
                  {c.description && <span className="text-xs text-slate-500 max-w-xs truncate">{c.description}</span>}
                </div>
              ))}
            </div>
          )}
        </Modal>
      )}

      {confirm && (
        <Confirm
          message={`Xoá chương trình "${confirm.title}"?`}
          onConfirm={async () => { await deleteProgram(confirm.id); setConfirm(null); load(); }}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  );
}
