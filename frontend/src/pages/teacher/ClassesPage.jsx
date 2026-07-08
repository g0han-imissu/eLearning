import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Video, Users, Calendar, CheckCircle, XCircle, Bell, BarChart2, Award, BookOpen } from 'lucide-react';
import { getMyClasses, getClassStudents, getClassRequests, handleEnrollmentRequest } from '../../api/teacher.api';
import Modal from '../../components/ui/Modal';

function ProgressBar({ value }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
        <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: `${Math.min(100, Number(value))}%` }} />
      </div>
      <span className="text-xs text-slate-400 w-8 text-right">{Number(value).toFixed(0)}%</span>
    </div>
  );
}

export default function TeacherClassesPage() {
  const [classes, setClasses] = useState([]);
  const [pendingMap, setPendingMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [studentsModal, setStudentsModal] = useState(null);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [expandedClass, setExpandedClass] = useState(null);
  const navigate = useNavigate();

  const load = useCallback(async () => {
    const res = await getMyClasses();
    const list = res.data.data || res.data || [];
    setClasses(list);
    setLoading(false);

    const results = await Promise.all(
      list.map(cls =>
        getClassRequests(cls.id)
          .then(r => ({ id: cls.id, requests: r.data }))
          .catch(() => ({ id: cls.id, requests: [] }))
      )
    );
    const map = {};
    results.forEach(r => { map[r.id] = r.requests; });
    setPendingMap(map);
  }, []);

  useEffect(() => { load(); }, [load]);

  const openStudents = async (cls) => {
    setStudentsLoading(true);
    setStudentsModal({ classTitle: cls.title, metrics: null, enrollments: [] });
    try {
      const r = await getClassStudents(cls.id);
      setStudentsModal({ classTitle: cls.title, ...r.data });
    } finally { setStudentsLoading(false); }
  };

  const handleApprove = async (classId, studentId) => {
    await handleEnrollmentRequest(classId, studentId, 'approve');
    load();
  };
  const handleReject = async (classId, studentId) => {
    await handleEnrollmentRequest(classId, studentId, 'reject');
    load();
  };

  const totalPending = Object.values(pendingMap).reduce((s, r) => s + r.length, 0);

  const statusColor = {
    ENROLLED: 'bg-blue-500/15 text-blue-300',
    IN_PROGRESS: 'bg-amber-500/15 text-amber-300',
    COMPLETED: 'bg-emerald-500/15 text-emerald-300',
    DROPPED: 'bg-white/10 text-slate-400',
  };
  const statusLabel = { ENROLLED: 'Đã ghi danh', IN_PROGRESS: 'Đang học', COMPLETED: 'Hoàn thành', DROPPED: 'Đã rời' };

  if (loading) {
    return (
      <div className="space-y-7 animate-pulse">
        <div className="h-8 bg-white/10 rounded-lg w-56" />
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <div key={i} className="h-48 bg-white/10 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Lớp học của tôi</h1>
          <p className="text-sm text-slate-400 mt-1">Quản lý các lớp đang giảng dạy</p>
        </div>
        {totalPending > 0 && (
          <span className="flex items-center gap-1.5 bg-amber-500/15 text-amber-300 text-xs font-semibold px-3 py-1.5 rounded-full">
            <Bell size={12} />{totalPending} yêu cầu đang chờ
          </span>
        )}
      </div>

      {classes.length === 0 ? (
        <div className="glass p-12 text-center text-slate-500">
          <BookOpen size={48} className="mx-auto mb-3 opacity-20" />
          <p className="text-sm">Chưa có lớp học nào được phân công</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {classes.map((cls) => {
            const requests = pendingMap[cls.id] || [];
            const isExpanded = expandedClass === cls.id;
            return (
              <div key={cls.id} className="glass overflow-hidden flex flex-col hover:shadow-md transition-shadow">
                {/* Card header */}
                <div className="p-5 flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0 mr-2">
                      <p className="text-xs text-indigo-300 font-semibold font-mono mb-1">{cls.code}</p>
                      <h3 className="font-bold text-white text-base truncate">{cls.title}</h3>
                      <p className="text-xs text-slate-500 mt-1 truncate">{cls.course?.title}</p>
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-semibold flex-shrink-0 ${
                      cls.status === 'OPEN' ? 'bg-emerald-500/15 text-emerald-300' :
                      cls.status === 'DRAFT' ? 'bg-amber-500/15 text-amber-300' :
                      'bg-white/10 text-slate-400'
                    }`}>{cls.status === 'OPEN' ? 'Đang mở' : cls.status === 'DRAFT' ? 'Nháp' : cls.status}</span>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-slate-400 mb-4">
                    <span className="flex items-center gap-1.5"><Users size={13} />{cls._count?.enrollments ?? 0} học viên</span>
                    {cls.startDate && (
                      <span className="flex items-center gap-1.5">
                        <Calendar size={13} />{new Date(cls.startDate).toLocaleDateString('vi-VN')}
                      </span>
                    )}
                  </div>

                  <div className="space-y-2">
                    {requests.length > 0 && (
                      <button
                        onClick={() => setExpandedClass(isExpanded ? null : cls.id)}
                        className="w-full flex items-center justify-between bg-amber-500/10 hover:bg-amber-500/15 text-amber-300 text-xs font-semibold rounded-xl px-3 py-2.5 transition-colors"
                      >
                        <span className="flex items-center gap-1.5"><Bell size={13} />{requests.length} yêu cầu chờ duyệt</span>
                        <span className="text-amber-300">{isExpanded ? '▲' : '▼'}</span>
                      </button>
                    )}

                    <button
                      onClick={() => openStudents(cls)}
                      className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-semibold rounded-xl py-2.5 transition-colors"
                    >
                      <BarChart2 size={14} />Quản lý học viên
                    </button>

                    <button
                      onClick={() => navigate(`/teacher/live/${cls.id}`)}
                      className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-violet-600 hover:brightness-110 text-white text-xs font-semibold rounded-xl py-2.5 transition-colors"
                    >
                      <Video size={14} />Vào phòng dạy
                    </button>
                  </div>
                </div>

                {/* Pending requests panel */}
                {isExpanded && requests.length > 0 && (
                  <div className="border-t border-white/10 bg-amber-500/[0.06] p-4 space-y-2">
                    <p className="text-xs font-bold text-amber-300/90 uppercase tracking-wide mb-2">Yêu cầu tham gia</p>
                    {requests.map(req => (
                      <div key={req.student?.id} className="flex items-center justify-between bg-white/5 rounded-xl px-3 py-2.5 border border-white/10 shadow-sm">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-7 h-7 rounded-full bg-amber-500/15 flex items-center justify-center text-xs font-bold text-amber-300 flex-shrink-0">
                            {req.student?.fullName?.[0]}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-slate-100 truncate">{req.student?.fullName}</p>
                            <p className="text-xs text-slate-500 truncate">{req.student?.email}</p>
                          </div>
                        </div>
                        <div className="flex gap-1.5 flex-shrink-0 ml-2">
                          <button onClick={() => handleApprove(cls.id, req.student?.id)} className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/15 text-emerald-300 transition-colors" title="Duyệt"><CheckCircle size={14} /></button>
                          <button onClick={() => handleReject(cls.id, req.student?.id)} className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/15 text-red-300 transition-colors" title="Từ chối"><XCircle size={14} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Students modal */}
      {studentsModal && (
        <Modal title={`Học viên — ${studentsModal.classTitle}`} onClose={() => setStudentsModal(null)}>
          {studentsLoading ? (
            <p className="text-slate-500 text-sm py-8 text-center">Đang tải...</p>
          ) : (
            <div className="space-y-4">
              {studentsModal.metrics && (
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { label: 'Tổng', value: studentsModal.metrics.totalStudents, color: 'text-indigo-300', bg: 'bg-indigo-500/10' },
                    { label: 'Đang học', value: studentsModal.metrics.inProgressStudents, color: 'text-amber-300', bg: 'bg-amber-500/10' },
                    { label: 'Hoàn thành', value: studentsModal.metrics.completedStudents, color: 'text-emerald-300', bg: 'bg-emerald-500/10' },
                    { label: 'TB tiến độ', value: `${Math.round(studentsModal.metrics.avgProgress)}%`, color: 'text-blue-300', bg: 'bg-blue-500/10' },
                  ].map(s => (
                    <div key={s.label} className={`${s.bg} rounded-xl p-3 text-center`}>
                      <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                      <p className="text-xs text-slate-400 mt-1">{s.label}</p>
                    </div>
                  ))}
                </div>
              )}

              {(studentsModal.enrollments || []).length === 0 ? (
                <p className="text-slate-500 text-sm text-center py-6">Chưa có học viên nào.</p>
              ) : (
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {(studentsModal.enrollments || []).map(enr => (
                    <div key={enr.id || enr.student?.id} className="bg-white/5 rounded-xl px-4 py-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-xs font-bold text-indigo-300">
                            {enr.student?.fullName?.[0]}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-100">{enr.student?.fullName}</p>
                            <p className="text-xs text-slate-500">{enr.student?.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="flex items-center gap-1 text-xs text-amber-300">
                            <Award size={11} />{Number(enr.avgScore).toFixed(0)}đ
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor[enr.status] || 'bg-white/10 text-slate-400'}`}>
                            {statusLabel[enr.status] || enr.status}
                          </span>
                        </div>
                      </div>
                      <ProgressBar value={Number(enr.progress)} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}
