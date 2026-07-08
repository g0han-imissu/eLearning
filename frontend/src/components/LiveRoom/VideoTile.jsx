import { useEffect, useRef } from 'react';
import { User } from 'lucide-react';

export default function VideoTile({ user, videoTrack, audioTrack, isLocal, label, highlight = false }) {
  const containerRef = useRef(null);
  const track = isLocal ? videoTrack : user?.videoTrack;

  useEffect(() => {
    if (!containerRef.current) return;
    if (track) track.play(containerRef.current);
    return () => track?.stop();
  }, [track]);

  useEffect(() => {
    if (!isLocal && user?.audioTrack) user.audioTrack.play();
    return () => { if (!isLocal) user?.audioTrack?.stop(); };
  }, [user?.audioTrack, isLocal]);

  const displayLabel = label || (isLocal ? 'Bạn' : `User ${user?.uid}`);

  return (
    <div className={`relative bg-slate-900/80 rounded-2xl overflow-hidden aspect-video shadow-lg shadow-black/30 ${
      highlight ? 'ring-2 ring-indigo-500/60' : 'ring-1 ring-white/10'
    }`}>
      <div ref={containerRef} className="w-full h-full" />
      {/* Placeholder khi chưa có video */}
      {!track && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-slate-900 to-slate-950">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500/40 to-violet-600/40 ring-1 ring-white/10 flex items-center justify-center">
            <User size={20} className="text-slate-300" />
          </div>
          <p className="text-[11px] text-slate-500">Chưa bật camera</p>
        </div>
      )}
      <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm text-white text-[11px] font-medium px-2.5 py-1 rounded-lg flex items-center gap-1 max-w-[85%] truncate">
        {displayLabel}
      </div>
    </div>
  );
}
