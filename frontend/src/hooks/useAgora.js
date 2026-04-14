import { useEffect, useRef, useState } from 'react';
import AgoraRTC from 'agora-rtc-sdk-ng';

export default function useAgora({ appId, token, channel, uid, enabled }) {
  const clientRef = useRef(null);
  const [localTracks, setLocalTracks] = useState({ audio: null, video: null });
  const [remoteUsers, setRemoteUsers] = useState([]);
  const [joined, setJoined] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!enabled || !appId || !token || !channel) return;

    const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
    clientRef.current = client;

    const handleUserPublished = async (user, mediaType) => {
      await client.subscribe(user, mediaType);
      setRemoteUsers((prev) => {
        const exists = prev.find((u) => u.uid === user.uid);
        return exists ? prev.map((u) => u.uid === user.uid ? user : u) : [...prev, user];
      });
    };

    const handleUserUnpublished = (user) => {
      setRemoteUsers((prev) => prev.filter((u) => u.uid !== user.uid));
    };

    client.on('user-published', handleUserPublished);
    client.on('user-unpublished', handleUserUnpublished);

    const join = async () => {
      try {
        await client.join(appId, channel, token, uid);
        const [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();
        await client.publish([audioTrack, videoTrack]);
        setLocalTracks({ audio: audioTrack, video: videoTrack });
        setJoined(true);
      } catch (e) {
        setError(e.message);
      }
    };

    join();

    return () => {
      localTracks.audio?.close();
      localTracks.video?.close();
      client.leave();
    };
  }, [enabled, appId, token, channel, uid]);

  const toggleMic = () => {
    if (localTracks.audio) localTracks.audio.setEnabled(!localTracks.audio.enabled);
  };

  const toggleCamera = () => {
    if (localTracks.video) localTracks.video.setEnabled(!localTracks.video.enabled);
  };

  return { joined, remoteUsers, localTracks, toggleMic, toggleCamera, error };
}
