import { useEffect, useState, useCallback } from 'react';
import { Plus, Pencil, Trash2, UserPlus, Users, Search, School, AlertCircle, Loader2, DoorOpen, FileEdit } from 'lucide-react';
import { getClasses, createClass, updateClass, deleteClass, enrollClass, getCourseTeachers } from '../../api/learning.api';
import { getCourses } from '../../api/learning.api';
import { getUsers } from '../../api/users.api';
import { getClassStudents } from '../../api/teacher.api';
import Modal from '../../components/ui/Modal';
import Confirm from '../../components/ui/Confirm';
import Badge from '../../components/ui/Badge';
import StatCard from '../../components/ui/StatCard';
import PageHeader from '../../components/ui/PageHeader';
import { Button, Input, Select } from '../../components/ui/FormField';

const statusLabel = { DRAFT: 'Nháp', OPEN: 'Đang mở', CLOSED: 'Đóng', ARCHIVED: 'Lưu trữ' };
const enrollStatusVariant = { PENDING: 'yellow', ENROLLED: 'blue', IN_PROGRESS: 'green', COMPLETED: 'purple', DROPPED: 'red' };
const enrollStatusLabel = { PENDING: 'Chờ duyệt', ENROLLED: 'Đã ghi danh', IN_PROGRESS: 'Đang học', COMPLETED: 'Hoàn thành', DROPPED: 'Đã xoá' };

const EMPTY_FORM = { code: '', title: '', courseId: '', teacherId: '', status: 'DRAFT', startDate: '', endDate: '' };

export default function ClassesPage() {
  const [items, setItems] = useState([]);
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);

  // Modal state
  const [modal, setModal] = useState(null);       // null | 'create' | classItem
  const [enrollModal, setEnrollModal] = useState(null);
  const [studentsModal, setStudentsModal] = useState(null);
  const [studentsData, setStudentsData] = useState(null);
  const [confirm, setConfirm] = useState(null);

  // Form state
  const [form, setForm] = useState(EMPTY_FORM);

  // Teachers filtered by selected course
  const [courseTeachers, setCourseTeachers] = useState([]);
  const [loadingTeachers, setLoadingTeachers] = useState(false);

  // Enroll
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [enrollSearch, setEnrollSearch] = useState('');
  const [enrollLoading, setEnrollLoading] = useState(false);
  const [enrollError, setEnrollError] = useState('');

  // Table
  const [tableSearch, setTableSearch] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  const load = () => {
    getClasses().then(r => setItems(r.data.data || []));
    getCourses({ limit: 200 }).then(r => setCourses(r.data.data || []));
    getUsers().then(r => {
      const all = r.data || [];
      setStudents(all.filter(u => u.roles?.some(x => x.role?.name === 'STUDENT')));
    });
  };
  useEffect(() => { load(); }, []);

  // Khi courseId trong form thay đổi: tải danh sách GV đã đăng ký môn đó
  const loadTeachersForCourse = useCallback(async (courseId) => {
    if (!courseId) {
      setCourseTeachers([]);
      return;
    }
    setLoadingTeachers(true);
    try {
      const r = await getCourseTeachers(courseId);
      setCourseTeachers(r.data || []);
    } catch {
      setCourseTeachers([]);
    } finally {
      setLoadingTeachers(false);
    }
  }, []);

  const handleCourseChange = (courseId) => {
    setForm(f => ({ ...f, courseId, teacherId: '' })); // reset giảng viên khi đổi môn
    loadTeachersForCourse(courseId);
  };

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setCourseTeachers([]);
    setSaveError('');
    setModal('create');
  };

  const openEdit = async (item) => {
    setForm({
      code: item.code,
      title: item.title,
      courseId: item.courseId,
      teacherId: item.teacherId,
      status: item.status,
      startDate: item.startDate?.slice(0, 10) || '',
      endDate: item.endDate?.slice(0, 10) || '',
    });
    setCourseTeachers([]);
    setModal(item);
    // Load teachers for this class's course
    await loadTeachersForCourse(item.courseId);
  };

  const openEnroll = (cls) => {
    setEnrollModal(cls);
    setSelectedStudentIds([]);
    setEnrollSearch('');
    setEnrollError('');
  };

  const openStudents = async (cls) => {
    setStudentsModal(cls);
    setStudentsData(null);
    try {
      const r = await getClassStudents(cls.id);
      setStudentsData(r.data);
    } catch {
      setStudentsData({ enrollments: [] });
    }
  };

  const toggleStudent = (id) =>
    setSelectedStudentIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const handleSave = async () => {
    setSaving(true);
    setSaveError('');
    try {
      const payload = { ...form, startDate: form.startDate || undefined, endDate: form.endDate || undefined };
      if (modal === 'create') await createClass(payload);
      else await updateClass(modal.id, payload);
      setModal(null);
      load();
    } catch (e) {
      setSaveError(
        e.response?.data?.message ||
        (e.request ? 'Không kết nối được máy chủ — kiểm tra backend đang chạy.' : 'Lưu thất bại')
      );
    } finally { setSaving(false); }
  };

  const handleEnroll = async () => {
    if (selectedStudentIds.length === 0) { setEnrollError('Vui lòng chọn ít nhất một học viên.'); return; }
    setEnrollLoading(true); setEnrollError('');
    try {
      await Promise.all(selectedStudentIds.map(studentId => enrollClass({ classId: enrollModal.id, studentId })));
      setEnrollModal(null);
      load();
    } catch (e) {
      setEnrollError(e.response?.data?.message || 'Ghi danh thất bại');
    } finally { setEnrollLoading(false); }
  };

  const filteredStudents = students.filter(s =>
    s.fullName?.toLowerCase().includes(enrollSearch.toLowerCase()) ||
    s.email?.toLowerCase().includes(enrollSearch.toLowerCase())
  );

  const filteredItems = tableSearch
    ? items.filter(c =>
        c.title?.toLowerCase().includes(tableSearch.toLowerCase()) ||
        c.code?.toLowerCase().includes(tableSearch.toLowerCase()) ||
        c.teacher?.fullName?.toLowerCase().includes(tableSearch.toLowerCase())
      )
    : items;

  const stats = {
    total: items.length,
    open: items.filter(c => c.status === 'OPEN').length,
    draft: items.filter(c => c.status === 'DRAFT').length,
    totalStudents: items.reduce((s, c) => s + (c._count?.enrollments || 0), 0),
  };

  // Helper: tên môn học đang chọn
  const selectedCourseName = courses.find(c => c.id === form.courseId)?.title;

  return (
    <div className="space-y-7">
      <PageHeader
        title="Quản lý lớp học"
        subtitle="Tạo lớp, phân công giảng viên và ghi danh học viên"
        icon={<School size={20} />}
        actions={<Button onClick={openCreate}><Plus size={16} />Tạo lớp học</Button>}
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Tổng lớp học" value={stats.total} icon={School} gradient="from-slate-500 to-slate-700" light="bg-slate-500/15 text-slate-300" />
        <StatCard label="Đang mở" value={stats.open} icon={DoorOpen} gradient="from-emerald-500 to-teal-600" light="bg-emerald-500/10 text-emerald-300" />
        <StatCard label="Bản nháp" value={stats.draft} icon={FileEdit} gradient="from-amber-500 to-orange-500" light="bg-amber-500/10 text-amber-300" />
        <StatCard label="Tổng học viên" value={stats.totalStudents} icon={Users} gradient="from-indigo-500 to-violet-600" light="bg-indigo-500/10 text-indigo-300" />
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          value={tableSearch}
          onChange={e => setTableSearch(e.target.value)}
          placeholder="Tìm theo tên lớp, mã, giảng viên..."
          className="border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white/5"
        />
      </div>

      {/* Table */}
      <div className="glass overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[760px]">
          <thead>
            <tr className="bg-gradient-to-r from-white/[0.07] to-white/[0.02] border-b border-white/10">
              {['Mã lớp', 'Tên lớp', 'Môn học', 'Giảng viên', 'Trạng thái', 'Học viên', ''].map(h => (
                <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {filteredItems.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-12 text-slate-500">
                  <School size={32} className="mx-auto mb-2 opacity-20" />Chưa có lớp học nào
                </td>
              </tr>
            ) : filteredItems.map(c => (
              <tr key={c.id} className="hover:bg-white/5 transition-colors">
                <td className="px-5 py-3.5 font-mono text-xs text-indigo-300 font-semibold">{c.code}</td>
                <td className="px-5 py-3.5 font-semibold text-white">{c.title}</td>
                <td className="px-5 py-3.5 text-slate-400 text-sm">{c.course?.title || '—'}</td>
                <td className="px-5 py-3.5">
                  {c.teacher ? (
                    <div>
                      <p className="text-white font-medium text-sm">{c.teacher.fullName}</p>
                      {c.teacher.specialization && (
                        <p className="text-xs text-slate-500">{c.teacher.specialization}</p>
                      )}
                    </div>
                  ) : <span className="text-slate-500">—</span>}
                </td>
                <td className="px-5 py-3.5">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                    c.status === 'OPEN' ? 'bg-emerald-500/15 text-emerald-300' :
                    c.status === 'DRAFT' ? 'bg-amber-500/15 text-amber-300' :
                    c.status === 'CLOSED' ? 'bg-red-500/15 text-red-300' : 'bg-white/10 text-slate-300'
                  }`}>{statusLabel[c.status] || c.status}</span>
                </td>
                <td className="px-5 py-3.5 text-slate-300 font-medium">{c._count?.enrollments ?? 0}</td>
                <td className="px-5 py-3.5">
                  <div className="flex gap-1">
                    <button onClick={() => openStudents(c)} className="p-1.5 text-slate-500 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg transition-colors" title="Xem học viên"><Users size={14} /></button>
                    <button onClick={() => openEnroll(c)} className="p-1.5 text-slate-500 hover:text-emerald-300 hover:bg-emerald-500/10 rounded-lg transition-colors" title="Thêm học viên"><UserPlus size={14} /></button>
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

      {/* ========== Modal tạo/sửa lớp ========== */}
      {modal && (
        <Modal
          title={modal === 'create' ? 'Tạo lớp học mới' : `Chỉnh sửa — ${modal.title}`}
          onClose={() => setModal(null)}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 mb-1.5 block">Mã lớp</label>
                <Input
                  value={form.code}
                  onChange={e => setForm(f => ({ ...f, code: e.target.value }))}
                  placeholder="VD: CS101-A"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-300 mb-1.5 block">Tên lớp</label>
                <Input
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="Tên lớp học"
                />
              </div>
            </div>

            {/* Môn học */}
            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1.5 block">Môn học</label>
              <Select
                value={form.courseId}
                onChange={e => handleCourseChange(e.target.value)}
              >
                <option value="">-- Chọn môn học trước --</option>
                {courses.map(c => (
                  <option key={c.id} value={c.id}>{c.code} – {c.title}</option>
                ))}
              </Select>
            </div>

            {/* Giảng viên — lọc theo môn học */}
            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1.5 block">
                Giảng viên
                {selectedCourseName && (
                  <span className="ml-1 text-indigo-400 font-normal">({selectedCourseName})</span>
                )}
              </label>

              {!form.courseId ? (
                <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-500">
                  <AlertCircle size={15} />
                  Chọn môn học để xem danh sách giảng viên
                </div>
              ) : loadingTeachers ? (
                <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-500">
                  <Loader2 size={15} className="animate-spin" />
                  Đang tải danh sách giảng viên...
                </div>
              ) : courseTeachers.length === 0 ? (
                <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 rounded-xl px-4 py-3 text-sm text-amber-300">
                  <AlertCircle size={15} />
                  Chưa có giảng viên nào đăng ký giảng dạy môn học này.
                </div>
              ) : (
                <Select
                  value={form.teacherId}
                  onChange={e => setForm(f => ({ ...f, teacherId: e.target.value }))}
                >
                  <option value="">-- Chọn giảng viên --</option>
                  {courseTeachers.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.fullName}{t.specialization ? ` — ${t.specialization}` : ''}
                    </option>
                  ))}
                </Select>
              )}

              {/* Hiển thị GV hiện tại khi edit, nếu GV đó không còn đăng ký môn này */}
              {modal !== 'create' && form.teacherId && courseTeachers.length > 0 &&
                !courseTeachers.find(t => t.id === form.teacherId) && (
                <p className="text-xs text-amber-300 mt-1.5 flex items-center gap-1">
                  <AlertCircle size={12} />
                  Giảng viên hiện tại chưa đăng ký môn học này. Vui lòng chọn lại.
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 mb-1.5 block">Trạng thái</label>
                <Select
                  value={form.status}
                  onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                >
                  <option value="DRAFT">Nháp</option>
                  <option value="OPEN">Đang mở</option>
                  <option value="CLOSED">Đóng</option>
                  <option value="ARCHIVED">Lưu trữ</option>
                </Select>
              </div>
              <div />
              <div>
                <label className="text-xs font-semibold text-slate-300 mb-1.5 block">Ngày bắt đầu</label>
                <Input
                  type="date"
                  value={form.startDate}
                  onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-300 mb-1.5 block">Ngày kết thúc</label>
                <Input
                  type="date"
                  value={form.endDate}
                  onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))}
                />
              </div>
            </div>

            {saveError && (
              <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-300 rounded-xl px-4 py-3 text-sm">
                <AlertCircle size={15} className="flex-shrink-0" />{saveError}
              </div>
            )}

            <div className="flex flex-col items-end gap-1.5 pt-2">
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setModal(null)}>Huỷ</Button>
                <Button onClick={handleSave} disabled={saving || !form.code || !form.title || !form.courseId || !form.teacherId}>
                  {saving ? 'Đang lưu...' : 'Lưu'}
                </Button>
              </div>
              {(!form.code || !form.title || !form.courseId || !form.teacherId) && (
                <p className="text-xs text-slate-500">
                  Cần điền: {[
                    !form.code && 'mã lớp',
                    !form.title && 'tên lớp',
                    !form.courseId && 'môn học',
                    !form.teacherId && 'giảng viên',
                  ].filter(Boolean).join(', ')}
                </p>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* ========== Modal thêm học viên ========== */}
      {enrollModal && (
        <Modal title={`Thêm học viên — ${enrollModal.title}`} onClose={() => setEnrollModal(null)}>
          <div className="space-y-3">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                value={enrollSearch}
                onChange={e => setEnrollSearch(e.target.value)}
                placeholder="Tìm theo tên, email..."
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-8 pr-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="border border-white/10 rounded-xl overflow-hidden max-h-72 overflow-y-auto">
              {filteredStudents.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-6">Không tìm thấy học viên</p>
              ) : filteredStudents.map(s => (
                <label key={s.id} className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 cursor-pointer border-b border-white/10 last:border-0 transition-colors">
                  <input
                    type="checkbox"
                    checked={selectedStudentIds.includes(s.id)}
                    onChange={() => toggleStudent(s.id)}
                    className="w-4 h-4 rounded border-white/15 text-indigo-300 focus:ring-indigo-500"
                  />
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-slate-300 flex-shrink-0">
                    {s.fullName?.[0]}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{s.fullName}</p>
                    <p className="text-xs text-slate-500">{s.email}</p>
                  </div>
                </label>
              ))}
            </div>
            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-slate-500">
                Đã chọn <span className="font-semibold text-indigo-300">{selectedStudentIds.length}</span> học viên
              </span>
              <div className="flex gap-2">
                {selectedStudentIds.length > 0 && (
                  <Button variant="ghost" onClick={() => setSelectedStudentIds([])}>Bỏ chọn</Button>
                )}
                <Button variant="outline" onClick={() => setEnrollModal(null)}>Huỷ</Button>
                <Button onClick={handleEnroll} disabled={enrollLoading}>
                  {enrollLoading ? 'Đang ghi danh...' : 'Ghi danh'}
                </Button>
              </div>
            </div>
            {enrollError && <p className="text-red-400 text-xs">{enrollError}</p>}
          </div>
        </Modal>
      )}

      {/* ========== Modal danh sách học viên ========== */}
      {studentsModal && (
        <Modal title={`Học viên — ${studentsModal.title}`} onClose={() => setStudentsModal(null)}>
          {!studentsData ? (
            <p className="text-sm text-slate-500 py-6 text-center">Đang tải...</p>
          ) : studentsData.enrollments?.length === 0 ? (
            <p className="text-sm text-slate-500 py-8 text-center">Chưa có học viên nào.</p>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {studentsData.enrollments.map(e => (
                <div key={e.id || e.student?.id} className="flex items-center justify-between bg-white/5 rounded-xl px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-500/15 flex items-center justify-center text-xs font-bold text-indigo-300">
                      {e.student?.fullName?.[0]}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{e.student?.fullName}</p>
                      <p className="text-xs text-slate-500">{e.student?.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-xs text-slate-400">{Number(e.progress ?? 0).toFixed(0)}% • {Number(e.avgScore ?? 0).toFixed(1)}đ</p>
                    <Badge variant={enrollStatusVariant[e.status]}>{enrollStatusLabel[e.status]}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Modal>
      )}

      {confirm && (
        <Confirm
          message={`Xoá lớp "${confirm.title}"?`}
          onConfirm={async () => { await deleteClass(confirm.id); setConfirm(null); load(); }}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  );
}
