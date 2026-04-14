import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Mic, MicOff, Video, VideoOff, PhoneOff } from 'lucide-react';
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

  const { remoteUsers, localTracks, toggleMic, toggleCamera } = useAgora({
    appId: agoraInfo?.appId,
    token: agoraInfo?.token,
    channel: agoraInfo?.channelName,
    uid: agoraInfo?.uid,
    enabled: !!agoraInfo,
  });

  const { submitQuiz } = useSocket({
    sessionId,
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
    <div className="flex h-[calc(100vh-57px)] bg-gray-900 flex-col">
      <div className="flex-1 p-4 flex flex-col gap-4">
        <div className="flex items-center justify-between text-white px-2">
          <span className="text-sm font-medium">Lớp học trực tuyến</span>
          <span className="text-xs text-gray-400">{remoteUsers.length + 1} người trong phòng</span>
        </div>

        <div className="flex-1 grid grid-cols-3 gap-3 content-start">
          {/* Giảng viên (remote user đầu tiên) */}
          {remoteUsers[0] && (
            <div className="col-span-2">
              <VideoTile user={remoteUsers[0]} label="Giảng viên" />
            </div>
          )}
          {/* Video của bản thân */}
          {agoraInfo && (
            <VideoTile isLocal videoTrack={localTracks.video} label={`${user?.fullName} (Bạn)`} />
          )}
          {/* Các học sinh khác */}
          {remoteUsers.slice(1).map(u => (
            <VideoTile key={u.uid} user={u} label={`Học sinh`} />
          ))}
        </div>

        <div className="flex items-center justify-center gap-3 py-2">
          <button onClick={handleToggleMic} className={`w-11 h-11 rounded-full flex items-center justify-center transition-colors ${micOn ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-600'}`}>
            {micOn ? <Mic size={18} className="text-white" /> : <MicOff size={18} className="text-white" />}
          </button>
          <button onClick={handleToggleCamera} className={`w-11 h-11 rounded-full flex items-center justify-center transition-colors ${camOn ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-600'}`}>
            {camOn ? <Video size={18} className="text-white" /> : <VideoOff size={18} className="text-white" />}
          </button>
          <button onClick={() => navigate('/student')} className="w-11 h-11 rounded-full bg-red-600 hover:bg-red-500 flex items-center justify-center">
            <PhoneOff size={18} className="text-white" />
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
