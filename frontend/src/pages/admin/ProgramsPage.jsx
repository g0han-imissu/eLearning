import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, ChevronRight, BookOpen } from 'lucide-react';
import { getPrograms, getProgram, createProgram, updateProgram, deleteProgram } from '../../api/learning.api';
import Modal from '../../components/ui/Modal';
import Confirm from '../../components/ui/Confirm';
import { Button, Input, Textarea } from '../../components/ui/FormField';

export default function ProgramsPage() {
  const [items, setItems] = useState([]);
  const [modal, setModal] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [detailModal, setDetailModal] = useState(null); // { program, courses }
  const [detailLoading, setDetailLoading] = useState(false);
  const [form, setForm] = useState({ code: '', title: '', description: '' });
  const [loading, setLoading] = useState(false);

  const load = () => getPrograms({ limit: 100 }).then(r => setItems(r.data.data || []));
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
    setLoading(true);
    try {
      if (modal === 'create') await createProgram(form);
      else await updateProgram(modal.id, form);
      setModal(null); load();
    } finally { setLoading(false); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">Chương trình học</h1>
        <Button onClick={openCreate}><Plus size={16} />Thêm chương trình</Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {items.map(p => (
          <div key={p.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 min-w-0">
                <p className="text-xs text-indigo-600 font-mono font-medium">{p.code}</p>
                <h3 className="font-semibold text-gray-900 mt-0.5 truncate">{p.title}</h3>
              </div>
              <div className="flex gap-1 ml-2 flex-shrink-0">
                <button onClick={() => openEdit(p)} className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"><Pencil size={14} /></button>
                <button onClick={() => setConfirm(p)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={14} /></button>
              </div>
            </div>
            {p.description && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{p.description}</p>}
            <button
              onClick={() => openDetail(p)}
              className="mt-3 flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-800 font-medium"
            >
              <BookOpen size={12} />
              {p._count?.courses ?? 0} môn học
              <ChevronRight size={12} />
            </button>
          </div>
        ))}
      </div>

      {/* Edit/Create modal */}
      {modal && (
        <Modal title={modal === 'create' ? 'Thêm chương trình' : 'Sửa chương trình'} onClose={() => setModal(null)} size="sm">
          <div className="space-y-3">
            <div><label className="text-xs font-medium text-gray-600 mb-1 block">Mã chương trình</label>
              <Input value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} placeholder="VD: CNTT, KT..." /></div>
            <div><label className="text-xs font-medium text-gray-600 mb-1 block">Tên chương trình</label>
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

      {/* Detail modal */}
      {detailModal && (
        <Modal title={`Môn học — ${detailModal.program.title}`} onClose={() => setDetailModal(null)}>
          {detailLoading ? (
            <p className="text-gray-400 text-sm py-4 text-center">Đang tải...</p>
          ) : detailModal.courses.length === 0 ? (
            <p className="text-gray-400 text-sm py-6 text-center">Chương trình này chưa có môn học nào.</p>
          ) : (
            <div className="space-y-2">
              {detailModal.courses.map(c => (
                <div key={c.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3">
                  <div>
                    <span className="text-xs font-mono text-indigo-600 mr-2">{c.code}</span>
                    <span className="text-sm font-medium text-gray-800">{c.title}</span>
                  </div>
                  {c.description && <span className="text-xs text-gray-400 max-w-xs truncate">{c.description}</span>}
                </div>
              ))}
            </div>
          )}
        </Modal>
      )}

      {confirm && <Confirm message={`Xoá chương trình "${confirm.title}"?`} onConfirm={async () => { await deleteProgram(confirm.id); setConfirm(null); load(); }} onCancel={() => setConfirm(null)} />}
    </div>
  );
}
