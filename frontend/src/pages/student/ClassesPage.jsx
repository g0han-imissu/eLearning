import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Video, LogIn, Clock, TrendingUp, Award, CheckCircle, GraduationCap } from 'lucide-react';
import { getMe, getMyEnrollments, joinClassByCode } from '../../api/student.api';

function ProgressBar({ value }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
        <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: `${Math.min(100, Number(value))}%` }} />
      </div>
      <span className="text-xs text-slate-400 w-8 text-right tabular-nums">{Number(value).toFixed(0)}%</span>
    </div>
  );
}

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
      const [meRes] = await Promise.all([getMe(), getMyEnrollments()]);
      const me = meRes.data;
      const enrs = me.enrollments || [];
      const active = enrs.filter(e => e.status !== 'PENDING' && e.status !== 'DROPPED');
      setKpi({
        total: active.length,
        completed: active.filter(e => e.status === 'COMPLETED').length,
        avgProgress: active.length ? Math.round(active.reduce((s, e) => s + Number(e.progress), 0) / active.length) : 0,
        avgScore: active.length ? Math.round(active.reduce((s, e) => s + Number(e.avgScore), 0) / active.length) : 0,
      });
      setEnrollments(enrs);
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
      setJoinError(e.response?.data?.message || 'Lỗi tham gia lớp');
    } finally { setJoining(false); }
  };

  const active = enrollments.filter(e => e.status !== 'PENDING' && e.status !== 'DROPPED');
  const pending = enrollments.filter(e => e.status === 'PENDING');

  if (loading) {
    return (
      <div className="space-y-7 animate-pulse">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-20 bg-white/10 rounded-2xl" />)}
        </div>
        <div className="h-20 bg-white/10 rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <div key={i} className="h-48 bg-white/10 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Lớp học của tôi</h1>
        <p className="text-sm text-slate-400 mt-1">Theo dõi tiến độ học tập của bạn</p>
      </div>

      {/* KPI stats */}
      {kpi && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Đang theo học', value: kpi.total, icon: BookOpen, gradient: 'from-indigo-500 to-indigo-600' },
            { label: 'Đã hoàn thành', value: kpi.completed, icon: CheckCircle, gradient: 'from-emerald-500 to-teal-600' },
            { label: 'Tiến độ TB', value: `${kpi.avgProgress}%`, icon: TrendingUp, gradient: 'from-blue-500 to-blue-600' },
            { label: 'Điểm TB', value: `${kpi.avgScore}đ`, icon: Award, gradient: 'from-amber-500 to-orange-500' },
          ].map(({ label, value, icon: Icon, gradient }) => (
            <div key={label} className="glass p-4 flex items-center gap-3.5">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                <Icon size={20} className="text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{value}</p>
                <p className="text-xs text-slate-400">{label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Join by code */}
      <div className="glass p-5">
        <p className="text-sm font-semibold text-slate-100 mb-3 flex items-center gap-2">
          <LogIn size={16} className="text-indigo-400" />Tham gia lớp học bằng mã
        </p>
        <div className="flex gap-2">
          <input
            value={joinCode}
            onChange={e => setJoinCode(e.target.value.toUpperCase())}
            onKeyDown={e => e.key === 'Enter' && handleJoin()}
            placeholder="Nhập mã lớp (VD: CS101)"
            className="flex-1 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono tracking-widest bg-white/5"
          />
          <button
            onClick={handleJoin}
            disabled={joining || !joinCode.trim()}
            className="bg-gradient-to-r from-indigo-500 to-violet-600 hover:brightness-110 disabled:opacity-50 text-white text-sm font-semibold px-5 rounded-xl transition-colors"
          >
            {joining ? 'Đang gửi...' : 'Tham gia'}
          </button>
        </div>
        {joinMsg && <p className="text-emerald-300 text-xs mt-2 font-medium">{joinMsg}</p>}
        {joinError && <p className="text-red-400 text-xs mt-2">{joinError}</p>}
      </div>

      {/* Pending requests */}
      {pending.length > 0 && (
        <div>
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wide mb-3 flex items-center gap-2">
            <Clock size={14} />Đang chờ duyệt ({pending.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {pending.map((enr) => (
              <div key={enr.id} className="bg-amber-500/10 rounded-2xl border border-amber-500/30 p-5">
                <span className="inline-block text-xs font-mono font-semibold text-amber-300 bg-amber-500/15 px-2 py-0.5 rounded mb-2">{enr.class?.code}</span>
                <h3 className="font-bold text-white text-sm mb-1">{enr.class?.title}</h3>
                <p className="text-xs text-slate-400 mb-1">{enr.class?.course?.title}</p>
                <p className="text-xs text-slate-500 mb-3">GV: {enr.class?.teacher?.fullName}</p>
                <span className="inline-flex items-center gap-1.5 text-xs bg-amber-500/15 text-amber-300 font-medium px-2.5 py-1 rounded-full">
                  <Clock size={11} />Chờ giảng viên phê duyệt
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active classes */}
      {active.length === 0 && pending.length === 0 ? (
        <div className="glass p-12 text-center text-slate-500">
          <GraduationCap size={48} className="mx-auto mb-3 opacity-20" />
          <p className="font-medium">Chưa có lớp học nào</p>
          <p className="text-xs text-slate-500 mt-1">Nhập mã lớp để tham gia lớp học mới</p>
        </div>
      ) : active.length > 0 && (
        <div>
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wide mb-3">
            Đang theo học ({active.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {active.map((enr) => (
              <div key={enr.id} className="glass overflow-hidden hover:shadow-md transition-shadow flex flex-col">
                <div className="p-5 flex-1">
                  <span className="inline-block text-xs font-mono font-semibold text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded mb-2">{enr.class?.code}</span>
                  <h3 className="font-bold text-white text-base leading-snug mb-1">{enr.class?.title}</h3>
                  <p className="text-xs text-slate-400 mb-0.5">{enr.class?.course?.title}</p>
                  <p className="text-xs text-slate-500 mb-4">GV: {enr.class?.teacher?.fullName}</p>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>Tiến độ học</span>
                      {Number(enr.avgScore) > 0 && (
                        <span className="flex items-center gap-1 text-amber-300">
                          <Award size={10} />Điểm TB: {Number(enr.avgScore).toFixed(0)}
                        </span>
                      )}
                    </div>
                    <ProgressBar value={Number(enr.progress)} />
                  </div>
                </div>

                <div className="px-5 pb-5 grid grid-cols-2 gap-2">
                  <button
                    onClick={() => navigate(`/student/lecture/${enr.classId}`)}
                    className="flex items-center justify-center gap-1.5 bg-gradient-to-r from-indigo-500 to-violet-600 hover:brightness-110 text-white text-xs font-semibold rounded-xl py-2.5 transition-colors"
                  >
                    <BookOpen size={13} />Học bài
                  </button>
                  <button
                    onClick={() => navigate(`/student/live/${enr.classId}`)}
                    className="flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl py-2.5 transition-colors"
                  >
                    <Video size={13} />Vào live
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
