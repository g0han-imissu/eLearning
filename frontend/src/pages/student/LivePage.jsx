import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Mic, MicOff, Video, VideoOff, PhoneOff, AlertCircle, Users } from 'lucide-react';
import { joinSession } from '../../api/live.api';
import useAgora from '../../hooks/useAgora';
import useSocket from '../../hooks/useSocket';
import VideoTile from '../../components/LiveRoom/VideoTile';
import QuizPopup from '../../components/LiveRoom/QuizPopup';
import useAuthStore from '../../stores/authStore';

export default function StudentLivePage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  const [agoraInfo, setAgoraInfo] = useState(null);
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [quizDone, setQuizDone] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);

  useEffect(() => {
    joinSession(sessionId).then(r => setAgoraInfo(r.data));
  }, [sessionId]);

  const { remoteUsers, localTracks, toggleMic, toggleCamera, error: agoraError } = useAgora({
    appId: agoraInfo?.appId,
    token: agoraInfo?.token,
    channel: agoraInfo?.channelName,
    uid: agoraInfo?.uid,
    enabled: !!agoraInfo,
  });

  const { submitQuiz } = useSocket({
    sessionId,
    name: user?.fullName,
    onQuizLaunched: (quiz) => { setActiveQuiz(quiz); setQuizDone(false); },
    onQuizResult: () => {},
    onQuizEnded: () => { setActiveQuiz(null); setQuizDone(false); },
  });

  const handleSubmitQuiz = (result) => {
    submitQuiz(result);
    setQuizDone(true);
  };

  const handleToggleMic = () => { toggleMic(); setMicOn(v => !v); };
  const handleToggleCamera = () => { toggleCamera(); setCamOn(v => !v); };

  return (
    <div className="flex flex-col gap-4 h-[calc(100vh-8.5rem)] lg:h-[calc(100vh-7rem)]">
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
          <h1 className="text-base font-bold text-white tracking-tight">Lớp học trực tuyến</h1>
        </div>
        <span className="inline-flex items-center gap-1.5 bg-white/5 ring-1 ring-white/10 rounded-full px-3 py-1.5 text-xs font-medium text-slate-300">
          <Users size={13} className="text-indigo-300" />
          {remoteUsers.length + 1} người trong phòng
        </span>
      </div>

      {agoraError && (
        <div className="flex items-center gap-2 bg-red-500/10 ring-1 ring-red-500/30 rounded-xl px-4 py-2.5 text-red-300 text-xs">
          <AlertCircle size={14} className="flex-shrink-0" />
          Camera/Mic: {agoraError}
        </div>
      )}

      {/* Video grid — giảng viên chiếm khung lớn */}
      <div className="flex-1 overflow-y-auto grid grid-cols-2 lg:grid-cols-3 gap-3 content-start">
        {remoteUsers[0] && (
          <div className="col-span-2">
            <VideoTile user={remoteUsers[0]} label="Giảng viên" highlight />
          </div>
        )}
        {agoraInfo && (
          <VideoTile isLocal videoTrack={localTracks.video} label={`${user?.fullName} (Bạn)`} />
        )}
        {remoteUsers.slice(1).map(u => (
          <VideoTile key={u.uid} user={u} label="Học sinh" />
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
            onClick={() => navigate('/student')}
            title="Rời phòng"
            className="w-11 h-11 rounded-full bg-red-500 hover:bg-red-400 flex items-center justify-center text-white shadow-lg shadow-red-500/30 transition-all"
          >
            <PhoneOff size={18} />
          </button>
        </div>
      </div>

      {/* Quiz popup xuất hiện khi giảng viên phát */}
      {activeQuiz && !quizDone && (
        <QuizPopup quiz={activeQuiz} onSubmit={handleSubmitQuiz} />
      )}
    </div>
  );
}
