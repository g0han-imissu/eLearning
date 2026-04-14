import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Video, LogIn, Clock, TrendingUp, Award, CheckCircle } from 'lucide-react';
import { getMe, getMyEnrollments, joinClassByCode } from '../../api/student.api';

export default function StudentClassesPage() {
  const [enrollments, setEnrollments] = useState([]);
  const [kpi, setKpi] = useState(null);
  const [loading, setLoading] = useState(true);
  const [joinCode, setJoinCode] = useState('');
  const [joinMsg, setJoinMsg] = useState('');
  const [joinError, setJoinError] = useState('');
  const [joining, setJoining] = useState(false);
  const navigate = useNavigate();

  const load = async () => {
    try {
      const [meRes, enrollRes] = await Promise.all([getMe(), getMyEnrollments()]);
      // getMe returns user with enrollments for KPI calculation
      const me = meRes.data;
      const enrs = me.enrollments || [];
      const active = enrs.filter(e => e.status !== 'PENDING' && e.status !== 'DROPPED');
      setKpi({
        total: active.length,
        completed: active.filter(e => e.status === 'COMPLETED').length,
        avgProgress: active.length ? Math.round(active.reduce((s, e) => s + Number(e.progress), 0) / active.length) : 0,
        avgScore: active.length ? Math.round(active.reduce((s, e) => s + Number(e.avgScore), 0) / active.length) : 0,
      });
      setEnrollments(enrollRes.data);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleJoin = async () => {
    if (!joinCode.trim()) return;
    setJoining(true); setJoinMsg(''); setJoinError('');
    try {
      const r = await joinClassByCode(joinCode.trim().toUpperCase());
      setJoinMsg(r.data.message);
      setJoinCode('');
      load();
    } catch (e) {
      setJoinError(e.response?.data?.message || 'Lỗi');
    } finally { setJoining(false); }
  };

  const active = enrollments.filter(e => e.status !== 'PENDING' && e.status !== 'DROPPED');
  const pending = enrollments.filter(e => e.status === 'PENDING');

  if (loading) return <div className="text-gray-500 text-sm">Đang tải...</div>;

  return (
    <div className="space-y-6">
      {/* KPI stats */}
      {kpi && kpi.total > 0 && (
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Lớp đang học', value: kpi.total, icon: BookOpen, color: 'text-indigo-600', bg: 'bg-indigo-50' },
            { label: 'Hoàn thành', value: kpi.completed, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
            { label: 'Tiến độ TB', value: `${kpi.avgProgress}%`, icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Điểm TB', value: `${kpi.avgScore}đ`, icon: Award, color: 'text-amber-600', bg: 'bg-amber-50' },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
              <div className={`${bg} w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0`}>
                <Icon size={18} className={color} />
              </div>
              <div>
                <p className={`text-lg font-bold ${color}`}>{value}</p>
                <p className="text-xs text-gray-400">{label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Lớp học của tôi</h1>
      </div>

      {/* Join by code */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <p className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2"><LogIn size={16} />Tham gia lớp học bằng mã lớp</p>
        <div className="flex gap-2">
          <input
            value={joinCode}
            onChange={e => setJoinCode(e.target.value.toUpperCase())}
            onKeyDown={e => e.key === 'Enter' && handleJoin()}
            placeholder="Nhập mã lớp (VD: CS101)"
            className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 font-mono tracking-wider"
          />
          <button
            onClick={handleJoin}
            disabled={joining || !joinCode.trim()}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium px-4 rounded-lg transition-colors"
          >
            {joining ? 'Đang gửi...' : 'Tham gia'}
          </button>
        </div>
        {joinMsg && <p className="text-green-600 text-xs mt-2">{joinMsg}</p>}
        {joinError && <p className="text-red-500 text-xs mt-2">{joinError}</p>}
      </div>

      {/* Pending requests */}
      {pending.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
            <Clock size={14} />Yêu cầu đang chờ duyệt ({pending.length})
          </h2>
          <div className="grid grid-cols-3 gap-4">
            {pending.map((enr) => (
              <div key={enr.id} className="bg-amber-50 rounded-xl border border-amber-200 p-5">
                <p className="text-xs text-amber-600 font-medium mb-1">{enr.class?.code}</p>
                <h3 className="font-semibold text-gray-900 text-sm mb-1">{enr.class?.title}</h3>
                <p className="text-xs text-gray-500 mb-2">{enr.class?.course?.title}</p>
                <p className="text-xs text-gray-400">GV: {enr.class?.teacher?.fullName}</p>
                <span className="inline-flex items-center gap-1 mt-3 text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full">
                  <Clock size={11} />Chờ giảng viên duyệt
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active classes */}
      {active.length === 0 && pending.length === 0 ? (
        <div className="bg-white rounded-xl border p-8 text-center text-gray-400">
          <BookOpen size={32} className="mx-auto mb-2 text-gray-300" />
          <p>Chưa có lớp học nào. Nhập mã lớp để tham gia.</p>
        </div>
      ) : active.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {active.map((enr) => (
            <div key={enr.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow">
              <p className="text-xs text-indigo-600 font-medium mb-1 font-mono">{enr.class?.code}</p>
              <h3 className="font-semibold text-gray-900 text-sm mb-1">{enr.class?.title}</h3>
              <p className="text-xs text-gray-500 mb-1">{enr.class?.course?.title}</p>
              <p className="text-xs text-gray-400 mb-3">GV: {enr.class?.teacher?.fullName}</p>

              <div className="mb-4">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Tiến độ</span>
                  <span>{Number(enr.progress)}%</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full">
                  <div className="h-1.5 bg-indigo-500 rounded-full transition-all" style={{ width: `${enr.progress}%` }} />
                </div>
                {Number(enr.avgScore) > 0 && (
                  <div className="flex items-center gap-1 mt-1.5">
                    <Award size={11} className="text-amber-400" />
                    <span className="text-xs text-gray-400">Điểm TB: {Number(enr.avgScore).toFixed(0)}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate(`/student/lecture/${enr.classId}`)}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-lg py-2 transition-colors"
                >
                  <BookOpen size={13} />Học bài
                </button>
                <button
                  onClick={() => navigate(`/student/live/${enr.classId}`)}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded-lg py-2 transition-colors"
                >
                  <Video size={13} />Vào live
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
