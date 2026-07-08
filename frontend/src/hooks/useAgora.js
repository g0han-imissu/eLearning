import { useEffect, useRef, useState } from 'react';
import AgoraRTC from 'agora-rtc-sdk-ng';

export default function useAgora({ appId, token, channel, uid, enabled }) {
  const clientRef = useRef(null);
  const tracksRef = useRef({ audio: null, video: null });
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
        // Create a plain snapshot so React always sees a new reference
        const snapshot = { uid: user.uid, videoTrack: user.videoTrack, audioTrack: user.audioTrack };
        const exists = prev.find((u) => u.uid === user.uid);
        return exists
          ? prev.map((u) => (u.uid === user.uid ? snapshot : u))
          : [...prev, snapshot];
      });
    };

    const handleUserUnpublished = (user, mediaType) => {
      setRemoteUsers((prev) =>
        prev.map((u) => {
          if (u.uid !== user.uid) return u;
          return {
            ...u,
            videoTrack: mediaType === 'video' ? null : u.videoTrack,
            audioTrack: mediaType === 'audio' ? null : u.audioTrack,
          };
        })
      );
    };

    const handleUserLeft = (user) => {
      setRemoteUsers((prev) => prev.filter((u) => u.uid !== user.uid));
    };

    client.on('user-published', handleUserPublished);
    client.on('user-unpublished', handleUserUnpublished);
    client.on('user-left', handleUserLeft);

    let cancelled = false;

    const join = async () => {
      try {
        await client.join(appId, channel, token, uid);
        if (cancelled) return;

        let audioTrack, videoTrack;
        try {
          [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();
        } catch (e) {
          // Try camera-only if mic fails
          try {
            videoTrack = await AgoraRTC.createCameraVideoTrack();
          } catch (e2) {
            if (!cancelled) setError(e2.message);
            return;
          }
        }

        if (cancelled) {
          audioTrack?.close();
          videoTrack?.close();
          return;
        }

        const tracks = [audioTrack, videoTrack].filter(Boolean);
        tracksRef.current = { audio: audioTrack || null, video: videoTrack || null };
        await client.publish(tracks);
        setLocalTracks({ audio: audioTrack || null, video: videoTrack || null });
        setJoined(true);
      } catch (e) {
        if (!cancelled) setError(e.message);
      }
    };

    join();

    return () => {
      cancelled = true;
      tracksRef.current.audio?.close();
      tracksRef.current.video?.close();
      client.leave();
      tracksRef.current = { audio: null, video: null };
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
