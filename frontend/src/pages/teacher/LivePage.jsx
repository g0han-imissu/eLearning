import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Mic, MicOff, Video, VideoOff, PhoneOff, ClipboardList } from 'lucide-react';
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
  const [studentCount, setStudentCount] = useState(0);

  useEffect(() => {
    joinSession(sessionId).then(r => setAgoraInfo(r.data));
  }, [sessionId]);

  const { joined, remoteUsers, localTracks, toggleMic, toggleCamera } = useAgora({
    appId: agoraInfo?.appId,
    token: agoraInfo?.token,
    channel: agoraInfo?.channelName,
    uid: agoraInfo?.uid,
    enabled: !!agoraInfo,
  });

  useEffect(() => { setStudentCount(remoteUsers.length); }, [remoteUsers]);

  const { launchQuiz, endQuiz } = useSocket({
    sessionId,
    onQuizLaunched: () => {},
    onQuizResult: (result) => setQuizResults(prev => [...prev, result]),
    onQuizEnded: () => {},
  });

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

  const handleToggleMic = () => { toggleMic(); setMicOn(v => !v); };
  const handleToggleCamera = () => { toggleCamera(); setCamOn(v => !v); };

  return (
    <div className="flex h-[calc(100vh-57px)] bg-gray-900 gap-0">
      {/* Video area */}
      <div className="flex-1 flex flex-col p-4 gap-4">
        <div className="flex items-center justify-between text-white px-2">
          <span className="text-sm font-medium">Phòng dạy live</span>
          <span className="text-xs text-gray-400">{studentCount} học sinh đang kết nối</span>
        </div>

        <div className="flex-1 grid grid-cols-3 gap-3 content-start">
          {agoraInfo && (
            <VideoTile
              isLocal
              videoTrack={localTracks.video}
              label={`${user?.fullName} (Bạn)`}
            />
          )}
          {remoteUsers.map(u => (
            <VideoTile key={u.uid} user={u} label={`Học sinh ${u.uid}`} />
          ))}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-3 py-2">
          <button onClick={handleToggleMic} className={`w-11 h-11 rounded-full flex items-center justify-center transition-colors ${micOn ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-600'}`}>
            {micOn ? <Mic size={18} className="text-white" /> : <MicOff size={18} className="text-white" />}
          </button>
          <button onClick={handleToggleCamera} className={`w-11 h-11 rounded-full flex items-center justify-center transition-colors ${camOn ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-600'}`}>
            {camOn ? <Video size={18} className="text-white" /> : <VideoOff size={18} className="text-white" />}
          </button>
          <button
            onClick={() => setShowQuizLauncher(true)}
            className="px-4 h-11 bg-indigo-600 hover:bg-indigo-500 rounded-full flex items-center gap-2 text-white text-sm font-medium transition-colors"
          >
            <ClipboardList size={16} /> Tạo Quiz
          </button>
          <button onClick={() => navigate('/teacher')} className="w-11 h-11 rounded-full bg-red-600 hover:bg-red-500 flex items-center justify-center">
            <PhoneOff size={18} className="text-white" />
          </button>
        </div>
      </div>

      {/* Side panel */}
      <div className="w-72 bg-gray-800 flex flex-col border-l border-gray-700">
        <div className="px-4 py-3 border-b border-gray-700">
          <h3 className="text-sm font-semibold text-white">Quiz & Thống kê</h3>
        </div>
        <div className="flex-1 overflow-y-auto p-3">
          {activeQuiz ? (
            <div className="space-y-3">
              <div className="bg-indigo-900/50 border border-indigo-700 rounded-xl p-3">
                <p className="text-xs text-indigo-300 mb-1">Quiz đang chạy</p>
                <p className="text-sm font-semibold text-white">{activeQuiz.title}</p>
              </div>
              <QuizStats results={quizResults} total={studentCount} />
              <button onClick={handleEndQuiz} className="w-full bg-red-600 hover:bg-red-500 text-white text-sm font-medium rounded-lg py-2 transition-colors">
                Kết thúc Quiz
              </button>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 text-sm">
              Chưa có quiz nào đang chạy.
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
