import { useEffect, useState, useCallback } from 'react';
import {
  Pencil, Trash2, FileVideo, FileText, ClipboardList, Upload,
  Library, School, FolderPlus, Download,
} from 'lucide-react';
import {
  getLectures, createLecture,
  createModule, updateModule, deleteModule,
  createContent, updateContent, deleteContent,
} from '../../api/content.api';
import { getMyClasses } from '../../api/teacher.api';
import { uploadVideo, uploadDocument } from '../../api/upload.api';
import Modal from '../../components/ui/Modal';
import Confirm from '../../components/ui/Confirm';
import PageHeader from '../../components/ui/PageHeader';
import { Button, Input } from '../../components/ui/FormField';

const typeIcon = { VIDEO: FileVideo, DOCUMENT: FileText, QUIZ: ClipboardList };
const typeBg = { VIDEO: 'bg-blue-500/15 text-blue-300', DOCUMENT: 'bg-orange-500/15 text-orange-300', QUIZ: 'bg-violet-500/15 text-violet-300' };
const typeLabel = { VIDEO: 'Video', DOCUMENT: 'Tài liệu', QUIZ: 'Bài kiểm' };

function buildPayload(type, form) {
  if (type === 'VIDEO') return { videoUrl: form.videoUrl, durationSecond: Number(form.durationSecond) || undefined, provider: 'local' };
  if (type === 'DOCUMENT') return { fileUrl: form.fileUrl, fileType: form.fileType, fileSize: form.fileSize };
  if (type === 'QUIZ') return { title: form.title };
  return {};
}

function FileUploadZone({ type, existingUrl, onUploaded, uploading, setUploading, uploadProgress, setUploadProgress }) {
  const isVideo = type === 'VIDEO';
  const [uploaded, setUploaded] = useState(false);

  const handleChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadProgress(0);
    try {
      const upFn = isVideo ? uploadVideo : uploadDocument;
      const res = await upFn(file, setUploadProgress);
      onUploaded(res.data);
      setUploaded(true);
    } finally { setUploading(false); }
  };

  return (
    <label className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-2xl p-7 cursor-pointer transition-colors ${uploaded ? 'border-emerald-400/60 bg-emerald-500/10' : 'border-white/15 hover:border-indigo-400/60 bg-white/[0.03] hover:bg-indigo-500/10'}`}>
      <Upload size={26} className={uploaded ? 'text-emerald-400' : 'text-slate-400'} />
      {uploaded ? (
        <span className="text-sm font-semibold text-emerald-300">Đã tải lên thành công</span>
      ) : uploading ? (
        <span className="text-sm text-slate-400">Đang tải lên...</span>
      ) : (
        <>
          <span className="text-sm font-medium text-slate-200">
            {existingUrl ? 'Tải lên để thay thế file hiện tại' : 'Nhấn để chọn file'}
          </span>
          <span className="text-xs text-slate-500">
            {isVideo ? 'MP4, WebM, MOV (tối đa 500MB)' : 'PDF, DOC, DOCX (tối đa 20MB)'}
          </span>
        </>
      )}
      <input type="file" accept={isVideo ? 'video/*' : '.pdf,.doc,.docx'} onChange={handleChange} disabled={uploading} className="hidden" />
      {uploading && (
        <div className="w-full mt-1">
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all" style={{ width: `${uploadProgress}%` }} />
          </div>
          <p className="text-xs text-center text-slate-500 mt-1">{uploadProgress}%</p>
        </div>
      )}
      {existingUrl && !uploaded && (
        <a href={existingUrl} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}
          className="text-xs text-indigo-300 hover:underline mt-1">Xem file hiện tại</a>
      )}
    </label>
  );
}

export default function TeacherLecturesPage() {
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [lecture, setLecture] = useState(null);     // container lecture của lớp (ẩn với người dùng)
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [form, setForm] = useState({});
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [saving, setSaving] = useState(false);

  const selectedClass = classes.find(c => c.id === selectedClassId);
  const chapters = lecture?.modules || [];

  useEffect(() => {
    getMyClasses().then(r => {
      const list = r.data || [];
      setClasses(list);
      if (list[0]) setSelectedClassId(list[0].id);
    });
  }, []);

  const loadLecture = useCallback((classId) => {
    if (!classId) { setLecture(null); return; }
    setLoading(true);
    getLectures({ classId, limit: 100 })
      .then(r => setLecture((r.data.data || [])[0] || null))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { loadLecture(selectedClassId); }, [selectedClassId, loadLecture]);

  // Tạo container lecture nếu lớp chưa có, trả về lectureId
  const ensureLecture = async () => {
    if (lecture?.id) return lecture.id;
    const res = await createLecture({
      classId: selectedClassId,
      title: `Bài giảng — ${selectedClass?.title || ''}`.trim(),
      isPublished: true,
    });
    return res.data.id;
  };

  // ----- Chương (Module) -----
  const openCreateChapter = () => {
    setForm({ title: '', orderIndex: chapters.length + 1 });
    setModal('chapter-create');
  };
  const openEditChapter = (mod) => {
    setForm({ title: mod.title, orderIndex: mod.orderIndex });
    setModal({ type: 'chapter-edit', item: mod });
  };
  const saveChapter = async () => {
    setSaving(true);
    try {
      if (modal === 'chapter-create') {
        const lectureId = await ensureLecture();
        await createModule({ lectureId, title: form.title, orderIndex: Number(form.orderIndex) || 1 });
      } else {
        await updateModule(modal.item.id, { title: form.title, orderIndex: Number(form.orderIndex) });
      }
      setModal(null); loadLecture(selectedClassId);
    } finally { setSaving(false); }
  };

  // ----- Nội dung (Content) -----
  const openCreateContent = (moduleId, type) => {
    const mod = chapters.find(m => m.id === moduleId);
    setForm({ moduleId, type, title: '', orderIndex: (mod?.contents?.length || 0) + 1, videoUrl: '', durationSecond: '', fileUrl: '', fileType: '', fileSize: undefined });
    setModal({ type: 'content-create', contentType: type });
  };
  const openEditContent = (content, moduleId) => {
    setForm({
      moduleId, type: content.type, title: content.title, orderIndex: content.orderIndex,
      videoUrl: content.video?.videoUrl || '', durationSecond: content.video?.durationSecond || '',
      fileUrl: content.document?.fileUrl || '', fileType: content.document?.fileType || '', fileSize: content.document?.fileSize,
    });
    setModal({ type: 'content-edit', contentType: content.type, item: content });
  };
  const saveContent = async () => {
    setSaving(true);
    const type = form.type;
    const payload = buildPayload(type, form);
    try {
      if (modal?.type === 'content-edit') {
        await updateContent(modal.item.id, { title: form.title, orderIndex: Number(form.orderIndex), payload });
      } else {
        await createContent({ moduleId: form.moduleId, type, title: form.title, orderIndex: Number(form.orderIndex), payload });
      }
      setModal(null); loadLecture(selectedClassId);
    } finally { setSaving(false); }
  };

  const isContentModal = modal?.type === 'content-create' || modal?.type === 'content-edit';
  const contentType = isContentModal ? modal.contentType : null;
  const isEdit = modal?.type === 'content-edit';

  return (
    <div className="space-y-8">
      <PageHeader
        title="Bài giảng"
        subtitle="Chọn lớp, thêm các chương và tải lên video, PDF, Word cho từng chương"
        icon={<Library size={20} />}
        actions={<Button onClick={openCreateChapter} disabled={!selectedClassId}><FolderPlus size={16} />Thêm chương</Button>}
      />

      {classes.length === 0 ? (
        <div className="bg-amber-500/10 border border-amber-500/30 text-amber-300 rounded-2xl px-5 py-4 text-sm">
          Bạn chưa được phân công lớp nào. Liên hệ quản trị viên để được phân công trước khi tạo bài giảng.
        </div>
      ) : (
        <>
          {/* Chọn lớp */}
          <div className="space-y-2.5">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Chọn lớp học</p>
            <div className="flex flex-wrap gap-2.5">
              {classes.map(c => {
                const active = c.id === selectedClassId;
                return (
                  <button
                    key={c.id}
                    onClick={() => setSelectedClassId(c.id)}
                    className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      active
                        ? 'bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-600/30 ring-1 ring-inset ring-white/15'
                        : 'bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 hover:border-white/20'
                    }`}
                  >
                    <School size={15} className={active ? 'text-white' : 'text-indigo-300'} />
                    <span>{c.code} — {c.title}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Danh sách chương */}
          {loading ? (
            <div className="text-slate-400 text-sm py-10 text-center">Đang tải...</div>
          ) : chapters.length === 0 ? (
            <div className="glass p-14 text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-600/30">
                <Library size={28} className="text-white" />
              </div>
              <p className="font-semibold text-white text-lg">Chưa có chương nào cho lớp này</p>
              <p className="text-sm text-slate-400 mt-1.5 mb-6">Bắt đầu bằng cách thêm chương đầu tiên, sau đó tải video / tài liệu vào chương.</p>
              <div className="flex justify-center">
                <Button onClick={openCreateChapter}><FolderPlus size={16} />Thêm chương đầu tiên</Button>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {chapters.map((mod, idx) => (
                <div key={mod.id} className="glass overflow-hidden">
                  {/* Chương header */}
                  <div className="flex items-center gap-4 px-6 py-5 border-b border-white/10">
                    <span className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white font-bold flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-600/30">
                      {idx + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-white text-base truncate">{mod.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{mod.contents?.length || 0} tài liệu</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Button size="sm" variant="outline" onClick={() => openCreateContent(mod.id, 'VIDEO')}><FileVideo size={14} className="text-blue-300" />Video</Button>
                      <Button size="sm" variant="outline" onClick={() => openCreateContent(mod.id, 'DOCUMENT')}><FileText size={14} className="text-orange-300" />Tài liệu</Button>
                      <button onClick={() => openEditChapter(mod)} className="p-2 text-slate-400 hover:text-indigo-300 hover:bg-indigo-500/10 rounded-lg transition-colors" title="Sửa chương"><Pencil size={15} /></button>
                      <button onClick={() => setConfirm({ type: 'module', item: mod })} className="p-2 text-slate-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors" title="Xoá chương"><Trash2 size={15} /></button>
                    </div>
                  </div>

                  {/* Tài liệu trong chương */}
                  {(mod.contents || []).length > 0 ? (
                    <div className="p-3 sm:p-4 space-y-2">
                      {mod.contents.map(c => {
                        const Icon = typeIcon[c.type] || FileText;
                        const fileUrl = c.video?.videoUrl || c.document?.fileUrl;
                        return (
                          <div key={c.id} className="flex items-center gap-3 py-3 px-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] transition-colors group">
                            <span className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${typeBg[c.type] || 'bg-white/10'}`}>
                              <Icon size={17} />
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-slate-100 truncate">{c.title}</p>
                              <p className="text-xs text-slate-500">{typeLabel[c.type] || c.type}</p>
                            </div>
                            {fileUrl && (
                              <a href={fileUrl} target="_blank" rel="noreferrer" className="p-2 text-slate-400 hover:text-emerald-300 hover:bg-emerald-500/10 rounded-lg transition-colors" title="Xem / tải"><Download size={15} /></a>
                            )}
                            <button onClick={() => openEditContent(c, mod.id)} className="p-2 text-slate-400 hover:text-indigo-300 hover:bg-indigo-500/10 rounded-lg transition-colors" title="Sửa / thay thế"><Pencil size={15} /></button>
                            <button onClick={() => setConfirm({ type: 'content', item: c })} className="p-2 text-slate-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors" title="Xoá"><Trash2 size={15} /></button>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500 text-center py-6">Chương này chưa có tài liệu. Nhấn <span className="text-slate-300 font-medium">Video</span> hoặc <span className="text-slate-300 font-medium">Tài liệu</span> để thêm.</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Modal chương */}
      {(modal === 'chapter-create' || modal?.type === 'chapter-edit') && (
        <Modal title={modal === 'chapter-create' ? 'Thêm chương mới' : 'Chỉnh sửa chương'} subtitle={selectedClass ? `${selectedClass.code} — ${selectedClass.title}` : ''} onClose={() => setModal(null)} size="sm">
          <div className="space-y-5">
            <div>
              <label className="text-sm font-medium text-slate-300 mb-1.5 block">Tiêu đề chương</label>
              <Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="VD: Chương 1 — Giới thiệu" />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-300 mb-1.5 block">Thứ tự</label>
              <Input type="number" min={1} value={form.orderIndex} onChange={e => setForm({ ...form, orderIndex: e.target.value })} />
            </div>
            <div className="flex justify-end gap-2.5 pt-2">
              <Button variant="outline" onClick={() => setModal(null)}>Huỷ</Button>
              <Button onClick={saveChapter} disabled={saving || !form.title}>{saving ? 'Đang lưu...' : 'Lưu'}</Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal nội dung */}
      {isContentModal && (
        <Modal title={`${isEdit ? 'Sửa' : 'Thêm'} ${typeLabel[contentType] || contentType}`} onClose={() => setModal(null)} size="sm">
          <div className="space-y-5">
            <div>
              <label className="text-sm font-medium text-slate-300 mb-1.5 block">Tiêu đề</label>
              <Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Tên nội dung" />
            </div>

            {contentType === 'VIDEO' && (
              <div>
                <label className="text-sm font-medium text-slate-300 mb-1.5 block">Video bài giảng</label>
                <FileUploadZone type="VIDEO" existingUrl={form.videoUrl} uploading={uploading} setUploading={setUploading} uploadProgress={uploadProgress} setUploadProgress={setUploadProgress}
                  onUploaded={(data) => setForm(f => ({ ...f, videoUrl: data.url, durationSecond: data.durationSecond || '' }))} />
              </div>
            )}

            {contentType === 'DOCUMENT' && (
              <div>
                <label className="text-sm font-medium text-slate-300 mb-1.5 block">Tài liệu (PDF, DOC, DOCX)</label>
                <FileUploadZone type="DOCUMENT" existingUrl={form.fileUrl} uploading={uploading} setUploading={setUploading} uploadProgress={uploadProgress} setUploadProgress={setUploadProgress}
                  onUploaded={(data) => setForm(f => ({ ...f, fileUrl: data.url, fileType: data.fileType || '', fileSize: data.fileSize }))} />
              </div>
            )}

            <div className="flex justify-end gap-2.5 pt-2">
              <Button variant="outline" onClick={() => setModal(null)}>Huỷ</Button>
              <Button
                onClick={saveContent}
                disabled={saving || uploading || !form.title || (contentType === 'VIDEO' && !form.videoUrl) || (contentType === 'DOCUMENT' && !form.fileUrl)}
              >
                {saving ? 'Đang lưu...' : isEdit ? 'Cập nhật' : 'Lưu'}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Confirm xoá */}
      {confirm && (
        <Confirm
          message={confirm.type === 'module' ? `Xoá chương "${confirm.item.title}" và toàn bộ tài liệu bên trong?` : `Xoá "${confirm.item.title}"?`}
          onConfirm={async () => {
            if (confirm.type === 'module') await deleteModule(confirm.item.id);
            else await deleteContent(confirm.item.id);
            setConfirm(null); loadLecture(selectedClassId);
          }}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  );
}
