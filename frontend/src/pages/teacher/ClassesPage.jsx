import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Video, Users, Calendar, CheckCircle, XCircle, Bell, BarChart2, TrendingUp, Award } from 'lucide-react';
import { getMyClasses, getClassStudents, getClassRequests, handleEnrollmentRequest } from '../../api/teacher.api';
import Modal from '../../components/ui/Modal';

function StatBadge({ label, value, color = 'text-gray-700' }) {
  return (
    <div className="text-center">
      <p className={`text-lg font-bold ${color}`}>{value}</p>
      <p className="text-xs text-gray-400">{label}</p>
    </div>
  );
}

export default function TeacherClassesPage() {
  const [classes, setClasses] = useState([]);
  const [pendingMap, setPendingMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [studentsModal, setStudentsModal] = useState(null); // { classTitle, metrics, enrollments }
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

  if (loading) return <div className="text-gray-500 text-sm">Đang tải...</div>;

  const totalPending = Object.values(pendingMap).reduce((s, r) => s + r.length, 0);

  const statusColor = { ENROLLED: 'bg-blue-100 text-blue-700', IN_PROGRESS: 'bg-amber-100 text-amber-700', COMPLETED: 'bg-green-100 text-green-700', DROPPED: 'bg-gray-100 text-gray-500' };
  const statusLabel = { ENROLLED: 'Đã ghi danh', IN_PROGRESS: 'Đang học', COMPLETED: 'Hoàn thành', DROPPED: 'Đã rời' };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-bold text-gray-900">Lớp học của tôi</h1>
        {totalPending > 0 && (
          <span className="flex items-center gap-1 bg-amber-100 text-amber-700 text-xs font-medium px-2.5 py-1 rounded-full">
            <Bell size={12} />{totalPending} yêu cầu chờ duyệt
          </span>
        )}
      </div>

      {classes.length === 0 ? (
        <div className="bg-white rounded-xl border p-8 text-center text-gray-400">Chưa có lớp học nào.</div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {classes.map((cls) => {
            const requests = pendingMap[cls.id] || [];
            const isExpanded = expandedClass === cls.id;
            return (
              <div key={cls.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-xs text-indigo-600 font-medium mb-1 font-mono">{cls.code}</p>
                      <h3 className="font-semibold text-gray-900 text-sm">{cls.title}</h3>
                      <p className="text-xs text-gray-400 mt-0.5">{cls.course?.title}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      cls.status === 'OPEN' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}>{cls.status}</span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-gray-500 mb-4">
                    <span className="flex items-center gap-1"><Users size={13} />{cls._count?.enrollments ?? 0} học viên</span>
                    {cls.startDate && (
                      <span className="flex items-center gap-1">
                        <Calendar size={13} />{new Date(cls.startDate).toLocaleDateString('vi-VN')}
                      </span>
                    )}
                  </div>

                  <div className="space-y-2">
                    {requests.length > 0 && (
                      <button
                        onClick={() => setExpandedClass(isExpanded ? null : cls.id)}
                        className="w-full flex items-center justify-center gap-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-medium rounded-lg py-2 transition-colors"
                      >
                        <Bell size={13} />{requests.length} yêu cầu chờ duyệt
                      </button>
                    )}
                    <button
                      onClick={() => openStudents(cls)}
                      className="w-full flex items-center justify-center gap-2 bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-medium rounded-lg py-2 transition-colors"
                    >
                      <BarChart2 size={14} />Quản lý học viên
                    </button>
                    <button
                      onClick={() => navigate(`/teacher/live/${cls.id}`)}
                      className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-lg py-2 transition-colors"
                    >
                      <Video size={14} />Vào phòng dạy
                    </button>
                  </div>
                </div>

                {isExpanded && requests.length > 0 && (
                  <div className="border-t border-gray-100 bg-gray-50 p-4 space-y-2">
                    <p className="text-xs font-semibold text-gray-600 mb-2">Yêu cầu tham gia lớp</p>
                    {requests.map(req => (
                      <div key={req.student?.id} className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border border-gray-100">
                        <div>
                          <p className="text-xs font-medium text-gray-800">{req.student?.fullName}</p>
                          <p className="text-xs text-gray-400">{req.student?.email}</p>
                        </div>
                        <div className="flex gap-1">
                          <button onClick={() => handleApprove(cls.id, req.student?.id)} className="p-1.5 rounded-lg bg-green-50 hover:bg-green-100 text-green-600" title="Duyệt"><CheckCircle size={15} /></button>
                          <button onClick={() => handleReject(cls.id, req.student?.id)} className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-500" title="Từ chối"><XCircle size={15} /></button>
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
            <p className="text-gray-400 text-sm py-6 text-center">Đang tải...</p>
          ) : (
            <div className="space-y-4">
              {studentsModal.metrics && (
                <div className="grid grid-cols-4 gap-3 bg-gray-50 rounded-xl p-4">
                  <StatBadge label="Tổng học viên" value={studentsModal.metrics.totalStudents} color="text-indigo-600" />
                  <StatBadge label="Đang học" value={studentsModal.metrics.inProgressStudents} color="text-amber-600" />
                  <StatBadge label="Hoàn thành" value={studentsModal.metrics.completedStudents} color="text-green-600" />
                  <StatBadge label="Tb tiến độ" value={`${Math.round(studentsModal.metrics.avgProgress)}%`} color="text-blue-600" />
                </div>
              )}

              {(studentsModal.enrollments || []).length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-4">Chưa có học viên nào.</p>
              ) : (
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {(studentsModal.enrollments || []).map(enr => (
                    <div key={enr.id || enr.student?.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3">
                      <div className="flex-1 min-w-0 mr-4">
                        <p className="text-sm font-medium text-gray-800 truncate">{enr.student?.fullName}</p>
                        <p className="text-xs text-gray-400 truncate">{enr.student?.email}</p>
                      </div>
                      <div className="flex items-center gap-4 flex-shrink-0">
                        <div className="text-right">
                          <div className="flex items-center gap-1.5 mb-1">
                            <div className="w-24 h-1.5 bg-gray-200 rounded-full">
                              <div className="h-1.5 bg-indigo-500 rounded-full" style={{ width: `${Number(enr.progress)}%` }} />
                            </div>
                            <span className="text-xs text-gray-500 w-8 text-right">{Number(enr.progress)}%</span>
                          </div>
                          <div className="flex items-center gap-1 justify-end">
                            <Award size={10} className="text-amber-400" />
                            <span className="text-xs text-gray-500">{Number(enr.avgScore).toFixed(0)}đ</span>
                          </div>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColor[enr.status] || 'bg-gray-100 text-gray-500'}`}>
                          {statusLabel[enr.status] || enr.status}
                        </span>
                      </div>
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
