import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, ChevronDown, ChevronRight, Upload, FileVideo, FileText, ClipboardList, X } from 'lucide-react';
import { getLectures, createLecture, updateLecture, deleteLecture, createModule, updateModule, deleteModule, createContent, deleteContent } from '../../api/content.api';
import { getCourses } from '../../api/learning.api';
import { uploadVideo, uploadDocument } from '../../api/upload.api';
import Modal from '../../components/ui/Modal';
import Confirm from '../../components/ui/Confirm';
import { Button, Input, Textarea, Select } from '../../components/ui/FormField';

const typeIcon = { VIDEO: FileVideo, DOCUMENT: FileText, QUIZ: ClipboardList };
const typeColor = { VIDEO: 'text-blue-500', DOCUMENT: 'text-orange-500', QUIZ: 'text-purple-500' };

export default function TeacherLecturesPage() {
  const [lectures, setLectures] = useState([]);
  const [courses, setCourses] = useState([]);
  const [expanded, setExpanded] = useState({});
  const [modal, setModal] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [form, setForm] = useState({});
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const load = () => {
    getLectures().then(r => setLectures(r.data.data || []));
    getCourses().then(r => setCourses(r.data.data || []));
  };
  useEffect(() => { load(); }, []);

  const toggle = (id) => setExpanded(e => ({ ...e, [id]: !e[id] }));

  // --- Lecture handlers ---
  const openCreateLecture = () => { setForm({ courseId: courses[0]?.id || '', title: '', description: '', isPublished: false }); setModal('lecture-create'); };
  const openEditLecture = (l) => { setForm({ courseId: l.courseId, title: l.title, description: l.description || '', isPublished: l.isPublished }); setModal({ type: 'lecture-edit', item: l }); };

  const saveLecture = async () => {
    if (modal === 'lecture-create') await createLecture(form);
    else await updateLecture(modal.item.id, form);
    setModal(null); load();
  };

  // --- Module handlers ---
  const openCreateModule = (lectureId) => { setForm({ lectureId, title: '', description: '', orderIndex: 1 }); setModal('module-create'); };
  const openEditModule = (mod) => { setForm({ lectureId: mod.lectureId, title: mod.title, description: mod.description || '', orderIndex: mod.orderIndex }); setModal({ type: 'module-edit', item: mod }); };

  const saveModule = async () => {
    if (modal === 'module-create') await createModule(form);
    else await updateModule(modal.item.id, form);
    setModal(null); load();
  };

  // --- Content handlers ---
  const openCreateContent = (moduleId, type) => {
    setForm({ moduleId, type, title: '', orderIndex: 1, videoUrl: '', fileUrl: '', fileType: '', durationSecond: '' });
    setModal(`content-create-${type}`);
  };

  const handleFileUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    setUploadProgress(0);
    try {
      const upFn = type === 'VIDEO' ? uploadVideo : uploadDocument;
      const res = await upFn(file, setUploadProgress);
      if (type === 'VIDEO') setForm(f => ({ ...f, videoUrl: res.data.url, durationSecond: res.data.duration || '' }));
      else setForm(f => ({ ...f, fileUrl: res.data.url, fileType: res.data.fileType || file.type }));
    } finally { setUploading(false); }
  };

  const saveContent = async () => {
    const type = form.type;
    const payload = { moduleId: form.moduleId, type, title: form.title, orderIndex: Number(form.orderIndex) };
    if (type === 'VIDEO') payload.video = { videoUrl: form.videoUrl, durationSecond: Number(form.durationSecond) || undefined };
    if (type === 'DOCUMENT') payload.document = { fileUrl: form.fileUrl, fileType: form.fileType };
    if (type === 'QUIZ') payload.quiz = { title: form.title, passScore: 50 };
    await createContent(payload);
    setModal(null); load();
  };

  const isContentModal = typeof modal === 'string' && modal.startsWith('content-create-');
  const contentType = isContentModal ? modal.split('-').pop() : null;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">Bài giảng</h1>
        <Button onClick={openCreateLecture}><Plus size={16} />Tạo bài giảng</Button>
      </div>

      <div className="space-y-3">
        {lectures.map(lecture => (
          <div key={lecture.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Lecture header */}
            <div className="flex items-center gap-3 px-5 py-4">
              <button onClick={() => toggle(lecture.id)} className="text-gray-400 hover:text-gray-600">
                {expanded[lecture.id] ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
              </button>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">{lecture.title}</p>
                <p className="text-xs text-gray-400 mt-0.5">{lecture.course?.title} · {lecture.modules?.length ?? 0} module</p>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${lecture.isPublished ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                {lecture.isPublished ? 'Đã xuất bản' : 'Nháp'}
              </span>
              <div className="flex gap-1">
                <button onClick={() => openCreateModule(lecture.id)} className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg" title="Thêm module"><Plus size={14} /></button>
                <button onClick={() => openEditLecture(lecture)} className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"><Pencil size={14} /></button>
                <button onClick={() => setConfirm({ type: 'lecture', item: lecture })} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={14} /></button>
              </div>
            </div>

            {/* Modules */}
            {expanded[lecture.id] && (
              <div className="border-t bg-gray-50 px-5 py-3 space-y-3">
                {(lecture.modules || []).map(mod => (
                  <div key={mod.id} className="bg-white rounded-lg border border-gray-100 p-3">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-gray-800">{mod.title}</p>
                      <div className="flex gap-1">
                        {['VIDEO', 'DOCUMENT', 'QUIZ'].map(t => (
                          <button key={t} onClick={() => openCreateContent(mod.id, t)} title={`Thêm ${t}`}
                            className="p-1 text-gray-400 hover:text-indigo-600 rounded">
                            {t === 'VIDEO' ? <FileVideo size={13} /> : t === 'DOCUMENT' ? <FileText size={13} /> : <ClipboardList size={13} />}
                          </button>
                        ))}
                        <button onClick={() => openEditModule(mod)} className="p-1 text-gray-400 hover:text-indigo-600 rounded"><Pencil size={13} /></button>
                        <button onClick={() => setConfirm({ type: 'module', item: mod })} className="p-1 text-gray-400 hover:text-red-600 rounded"><Trash2 size={13} /></button>
                      </div>
                    </div>
                    <div className="space-y-1">
                      {(mod.contents || []).map(c => {
                        const Icon = typeIcon[c.type] || FileText;
                        return (
                          <div key={c.id} className="flex items-center gap-2 text-xs text-gray-600 py-1">
                            <Icon size={12} className={typeColor[c.type]} />
                            <span className="flex-1">{c.title}</span>
                            <button onClick={() => setConfirm({ type: 'content', item: c })} className="text-gray-300 hover:text-red-500"><X size={12} /></button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
                {(lecture.modules || []).length === 0 && (
                  <p className="text-xs text-gray-400 text-center py-2">Chưa có module. Nhấn + để thêm.</p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Lecture modal */}
      {(modal === 'lecture-create' || modal?.type === 'lecture-edit') && (
        <Modal title={modal === 'lecture-create' ? 'Tạo bài giảng' : 'Sửa bài giảng'} onClose={() => setModal(null)} size="sm">
          <div className="space-y-3">
            <div><label className="text-xs font-medium text-gray-600 mb-1 block">Môn học</label>
              <Select value={form.courseId} onChange={e => setForm({ ...form, courseId: e.target.value })}>
                {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
              </Select></div>
            <div><label className="text-xs font-medium text-gray-600 mb-1 block">Tiêu đề</label>
              <Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></div>
            <div><label className="text-xs font-medium text-gray-600 mb-1 block">Mô tả</label>
              <Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input type="checkbox" checked={form.isPublished} onChange={e => setForm({ ...form, isPublished: e.target.checked })} className="accent-indigo-600" />
              Xuất bản ngay
            </label>
            <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setModal(null)}>Huỷ</Button><Button onClick={saveLecture}>Lưu</Button></div>
          </div>
        </Modal>
      )}

      {/* Module modal */}
      {(modal === 'module-create' || modal?.type === 'module-edit') && (
        <Modal title={modal === 'module-create' ? 'Thêm module' : 'Sửa module'} onClose={() => setModal(null)} size="sm">
          <div className="space-y-3">
            <div><label className="text-xs font-medium text-gray-600 mb-1 block">Tiêu đề module</label>
              <Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></div>
            <div><label className="text-xs font-medium text-gray-600 mb-1 block">Thứ tự</label>
              <Input type="number" min={1} value={form.orderIndex} onChange={e => setForm({ ...form, orderIndex: e.target.value })} /></div>
            <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setModal(null)}>Huỷ</Button><Button onClick={saveModule}>Lưu</Button></div>
          </div>
        </Modal>
      )}

      {/* Content modal */}
      {isContentModal && (
        <Modal title={`Thêm ${contentType}`} onClose={() => setModal(null)} size="sm">
          <div className="space-y-3">
            <div><label className="text-xs font-medium text-gray-600 mb-1 block">Tiêu đề</label>
              <Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></div>
            <div><label className="text-xs font-medium text-gray-600 mb-1 block">Thứ tự</label>
              <Input type="number" min={1} value={form.orderIndex} onChange={e => setForm({ ...form, orderIndex: e.target.value })} /></div>

            {contentType === 'VIDEO' && (
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Upload video</label>
                <input type="file" accept="video/*" onChange={e => handleFileUpload(e, 'VIDEO')} className="text-sm" />
                {uploading && <div className="mt-2 h-1.5 bg-gray-100 rounded-full"><div className="h-1.5 bg-indigo-500 rounded-full transition-all" style={{ width: `${uploadProgress}%` }} /></div>}
                {form.videoUrl && <p className="text-xs text-green-600 mt-1">✓ Upload thành công</p>}
              </div>
            )}
            {contentType === 'DOCUMENT' && (
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Upload tài liệu</label>
                <input type="file" accept=".pdf,.doc,.docx,.ppt,.pptx" onChange={e => handleFileUpload(e, 'DOCUMENT')} className="text-sm" />
                {uploading && <div className="mt-2 h-1.5 bg-gray-100 rounded-full"><div className="h-1.5 bg-indigo-500 rounded-full transition-all" style={{ width: `${uploadProgress}%` }} /></div>}
                {form.fileUrl && <p className="text-xs text-green-600 mt-1">✓ Upload thành công</p>}
              </div>
            )}
            {contentType === 'QUIZ' && <p className="text-xs text-gray-500">Quiz sẽ được tạo tự động. Bạn có thể thêm câu hỏi sau.</p>}

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setModal(null)}>Huỷ</Button>
              <Button onClick={saveContent} disabled={uploading || (contentType === 'VIDEO' && !form.videoUrl) || (contentType === 'DOCUMENT' && !form.fileUrl)}>
                Lưu
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Confirm delete */}
      {confirm && (
        <Confirm
          message={`Xoá "${confirm.item.title}"?`}
          onConfirm={async () => {
            if (confirm.type === 'lecture') await deleteLecture(confirm.item.id);
            else if (confirm.type === 'module') await deleteModule(confirm.item.id);
            else await deleteContent(confirm.item.id);
            setConfirm(null); load();
          }}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  );
}
