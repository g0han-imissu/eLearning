import { useEffect, useRef } from 'react';
import { MicOff } from 'lucide-react';

export default function VideoTile({ user, videoTrack, audioTrack, isLocal, label }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const track = isLocal ? videoTrack : user?.videoTrack;
    if (track) track.play(containerRef.current);
    return () => track?.stop();
  }, [videoTrack, user?.videoTrack, isLocal]);

  useEffect(() => {
    if (!isLocal && user?.audioTrack) user.audioTrack.play();
    return () => { if (!isLocal) user?.audioTrack?.stop(); };
  }, [user?.audioTrack, isLocal]);

  return (
    <div className="relative bg-gray-900 rounded-xl overflow-hidden aspect-video">
      <div ref={containerRef} className="w-full h-full" />
      <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded-md flex items-center gap-1">
        {label || (isLocal ? 'Bạn' : `User ${user?.uid}`)}
      </div>
    </div>
  );
}
