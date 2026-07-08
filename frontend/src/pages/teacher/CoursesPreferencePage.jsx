import { useEffect, useState } from 'react';
import { BookOpen, CheckCircle, Save } from 'lucide-react';
import { getCourses } from '../../api/learning.api';
import { getMyTeacherCourses, setMyTeacherCourses } from '../../api/teacher.api';
import { Button } from '../../components/ui/FormField';

export default function CoursesPreferencePage() {
  const [allCourses, setAllCourses] = useState([]);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      getCourses({ limit: 200 }),
      getMyTeacherCourses(),
    ]).then(([allRes, myRes]) => {
      setAllCourses(allRes.data?.data || []);
      const myIds = (myRes.data || []).map(tc => tc.courseId);
      setSelectedIds(new Set(myIds));
    }).finally(() => setLoading(false));
  }, []);

  const toggle = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSave = async () => {
    setSaving(true); setSuccess(''); setError('');
    try {
      await setMyTeacherCourses([...selectedIds]);
      setSuccess('Cập nhật môn học thành công');
    } catch (e) {
      setError(e.response?.data?.message || 'Lỗi cập nhật');
    } finally { setSaving(false); }
  };

  const groupedByProgram = allCourses.reduce((acc, course) => {
    const prog = course.program?.title || 'Khác';
    if (!acc[prog]) acc[prog] = [];
    acc[prog].push(course);
    return acc;
  }, {});

  if (loading) return <div className="text-slate-500 text-sm">Đang tải...</div>;

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Môn học có thể giảng dạy</h1>
          <p className="text-sm text-slate-400 mt-1">Chọn các môn học bạn có thể đảm nhận giảng dạy</p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save size={15} />{saving ? 'Đang lưu...' : 'Lưu thay đổi'}
        </Button>
      </div>

      {success && (
        <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-xl px-4 py-3 mb-4 text-sm">
          <CheckCircle size={16} />{success}
        </div>
      )}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-300 rounded-xl px-4 py-3 mb-4 text-sm">{error}</div>
      )}

      <div className="text-xs text-slate-500 mb-4">
        Đã chọn <span className="font-semibold text-indigo-300">{selectedIds.size}</span> môn học
      </div>

      {Object.keys(groupedByProgram).length === 0 ? (
        <div className="glass p-10 text-center text-slate-500">
          <BookOpen size={40} className="mx-auto mb-3 opacity-30" />
          <p>Chưa có môn học nào trong hệ thống</p>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(groupedByProgram).map(([program, courses]) => (
            <div key={program} className="glass overflow-hidden">
              <div className="px-5 py-3 bg-white/5 border-b border-white/10">
                <p className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                  <BookOpen size={14} className="text-indigo-400" />{program}
                </p>
              </div>
              <div className="divide-y divide-white/10">
                {courses.map(course => {
                  const checked = selectedIds.has(course.id);
                  return (
                    <div
                      key={course.id}
                      onClick={() => toggle(course.id)}
                      className="flex items-center gap-4 px-5 py-3.5 hover:bg-white/5 cursor-pointer transition-colors select-none"
                    >
                      <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                        checked ? 'bg-indigo-600 border-indigo-600' : 'border-white/15 bg-white/5'
                      }`}>
                        {checked && <CheckCircle size={12} className="text-white" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white">{course.title}</p>
                        <p className="text-xs text-slate-500 font-mono">{course.code}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
