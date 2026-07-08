import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Mic, MicOff, Video, VideoOff, PhoneOff, ClipboardList, AlertCircle, Users, Radio, BarChart3 } from 'lucide-react';
import { joinSession } from '../../api/live.api';
import useAgora from '../../hooks/useAgora';
import useSocket from '../../hooks/useSocket';
import VideoTile from '../../components/LiveRoom/VideoTile';
import QuizLauncher from '../../components/LiveRoom/QuizLauncher';
import QuizStats from '../../components/LiveRoom/QuizStats';
import useAuthStore from '../../stores/authStore';

export default function TeacherLivePage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  const [agoraInfo, setAgoraInfo] = useState(null);
  const [showQuizLauncher, setShowQuizLauncher] = useState(false);
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [quizResults, setQuizResults] = useState([]);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  // Socket-based participant tracking (userId → name)
  const [participants, setParticipants] = useState({});

  useEffect(() => {
    joinSession(sessionId).then((r) => setAgoraInfo(r.data));
  }, [sessionId]);

  const { joined, remoteUsers, localTracks, toggleMic, toggleCamera, error: agoraError } = useAgora({
    appId: agoraInfo?.appId,
    token: agoraInfo?.token,
    channel: agoraInfo?.channelName,
    uid: agoraInfo?.uid,
    enabled: !!agoraInfo,
  });

  const handleRoomJoined = useCallback(({ userId, name }) => {
    setParticipants((prev) => ({ ...prev, [userId]: name }));
  }, []);

  const handleRoomLeft = useCallback(({ userId }) => {
    setParticipants((prev) => {
      const next = { ...prev };
      delete next[userId];
      return next;
    });
  }, []);

  const { launchQuiz, endQuiz } = useSocket({
    sessionId,
    name: user?.fullName,
    onRoomJoined: handleRoomJoined,
    onRoomLeft: handleRoomLeft,
    onQuizLaunched: () => {},
    onQuizResult: (result) => setQuizResults((prev) => [...prev, result]),
    onQuizEnded: () => {},
  });

  // Exclude teacher themselves from participant count
  const studentCount = Object.keys(participants).filter((id) => id !== user?.id).length;

  const handleLaunchQuiz = (quiz) => {
    setActiveQuiz(quiz);
    setQuizResults([]);
    launchQuiz(quiz);
    setShowQuizLauncher(false);
  };

  const handleEndQuiz = () => {
    endQuiz();
    setActiveQuiz(null);
  };

  const handleToggleMic = () => { toggleMic(); setMicOn((v) => !v); };
  const handleToggleCamera = () => { toggleCamera(); setCamOn((v) => !v); };

  return (
    <div className="flex flex-col lg:flex-row gap-5 h-[calc(100vh-8.5rem)] lg:h-[calc(100vh-7rem)]">
      {/* Video area */}
      <div className="flex-1 flex flex-col gap-4 min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-2 bg-red-500/15 text-red-300 ring-1 ring-red-500/30 rounded-full px-3.5 py-1.5 text-xs font-bold uppercase tracking-wide">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-400" />
              </span>
              Live
            </span>
            <h1 className="text-base font-bold text-white tracking-tight">Phòng dạy trực tuyến</h1>
          </div>
          <span className="inline-flex items-center gap-1.5 bg-white/5 ring-1 ring-white/10 rounded-full px-3 py-1.5 text-xs font-medium text-slate-300">
            <Users size={13} className="text-indigo-300" />
            {studentCount} học sinh
          </span>
        </div>

        {agoraError && (
          <div className="flex items-center gap-2 bg-red-500/10 ring-1 ring-red-500/30 rounded-xl px-4 py-2.5 text-red-300 text-xs">
            <AlertCircle size={14} className="flex-shrink-0" />
            Camera/Mic: {agoraError}
          </div>
        )}

        {/* Video grid */}
        <div className="flex-1 overflow-y-auto grid grid-cols-2 lg:grid-cols-3 gap-3 content-start">
          {agoraInfo && (
            <VideoTile
              isLocal
              videoTrack={localTracks.video}
              label={`${user?.fullName} (Bạn)`}
            />
          )}
          {remoteUsers.map((u) => (
            <VideoTile key={u.uid} user={u} label={`Học sinh ${u.uid}`} />
          ))}
        </div>

        {/* Control bar */}
        <div className="flex items-center justify-center">
          <div className="flex items-center gap-2.5 glass px-4 py-2.5 !rounded-full">
            <button
              onClick={handleToggleMic}
              title={micOn ? 'Tắt mic' : 'Bật mic'}
              className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
                micOn ? 'bg-white/10 hover:bg-white/20 ring-1 ring-white/10 text-white' : 'bg-red-500 hover:bg-red-400 text-white shadow-lg shadow-red-500/30'
              }`}
            >
              {micOn ? <Mic size={18} /> : <MicOff size={18} />}
            </button>
            <button
              onClick={handleToggleCamera}
              title={camOn ? 'Tắt camera' : 'Bật camera'}
              className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
                camOn ? 'bg-white/10 hover:bg-white/20 ring-1 ring-white/10 text-white' : 'bg-red-500 hover:bg-red-400 text-white shadow-lg shadow-red-500/30'
              }`}
            >
              {camOn ? <Video size={18} /> : <VideoOff size={18} />}
            </button>
            <button
              onClick={() => setShowQuizLauncher(true)}
              className="px-5 h-11 bg-gradient-to-r from-indigo-500 to-violet-600 hover:brightness-110 rounded-full flex items-center gap-2 text-white text-sm font-semibold shadow-lg shadow-indigo-600/30 transition-all"
            >
              <ClipboardList size={16} /> Tạo Quiz
            </button>
            <button
              onClick={() => navigate('/teacher')}
              title="Rời phòng"
              className="w-11 h-11 rounded-full bg-red-500 hover:bg-red-400 flex items-center justify-center text-white shadow-lg shadow-red-500/30 transition-all"
            >
              <PhoneOff size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Side panel */}
      <div className="w-full lg:w-80 glass flex flex-col overflow-hidden flex-shrink-0 max-h-64 lg:max-h-none">
        <div className="px-4 py-3.5 border-b border-white/10 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center flex-shrink-0">
            <BarChart3 size={15} className="text-white" />
          </div>
          <h3 className="text-sm font-bold text-white">Quiz & Thống kê</h3>
        </div>
        <div className="flex-1 overflow-y-auto p-3.5">
          {activeQuiz ? (
            <div className="space-y-3">
              <div className="bg-indigo-500/15 ring-1 ring-indigo-500/30 rounded-xl p-3.5">
                <p className="flex items-center gap-1.5 text-[11px] font-semibold text-indigo-300 uppercase tracking-wide mb-1">
                  <Radio size={12} className="animate-pulse" /> Quiz đang chạy
                </p>
                <p className="text-sm font-semibold text-white">{activeQuiz.title}</p>
              </div>
              <QuizStats results={quizResults} total={studentCount} />
              <button
                onClick={handleEndQuiz}
                className="w-full bg-red-500/15 hover:bg-red-500/25 ring-1 ring-red-500/30 text-red-300 text-sm font-semibold rounded-xl py-2.5 transition-all"
              >
                Kết thúc Quiz
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center py-10 px-4">
              <div className="w-14 h-14 rounded-2xl bg-white/5 ring-1 ring-white/10 flex items-center justify-center mb-3">
                <ClipboardList size={22} className="text-slate-500" />
              </div>
              <p className="text-sm font-medium text-slate-300">Chưa có quiz nào</p>
              <p className="text-xs text-slate-500 mt-1">Nhấn "Tạo Quiz" để kiểm tra nhanh học sinh trong phòng.</p>
            </div>
          )}
        </div>
      </div>

      {showQuizLauncher && (
        <QuizLauncher onLaunch={handleLaunchQuiz} onClose={() => setShowQuizLauncher(false)} />
      )}
    </div>
  );
}
