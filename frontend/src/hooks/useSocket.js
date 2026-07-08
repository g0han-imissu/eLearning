import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import useAuthStore from '../stores/authStore';

export default function useSocket({
  sessionId,
  name,
  onRoomJoined,
  onRoomLeft,
  onQuizLaunched,
  onQuizResult,
  onQuizEnded,
}) {
  const socketRef = useRef(null);
  const accessToken = useAuthStore((s) => s.accessToken);

  // Keep callbacks in refs so handlers always use latest version
  const cbRef = useRef({});
  cbRef.current = { onRoomJoined, onRoomLeft, onQuizLaunched, onQuizResult, onQuizEnded };

  useEffect(() => {
    if (!sessionId || !accessToken) return;

    const socket = io(import.meta.env.VITE_SOCKET_URL || '/', { auth: { token: accessToken } });
    socketRef.current = socket;

    socket.emit('join-room', { sessionId, name });
    socket.on('room:joined', (data) => cbRef.current.onRoomJoined?.(data));
    socket.on('room:left', (data) => cbRef.current.onRoomLeft?.(data));
    socket.on('quiz:launched', (data) => cbRef.current.onQuizLaunched?.(data));
    socket.on('quiz:result', (data) => cbRef.current.onQuizResult?.(data));
    socket.on('quiz:ended', () => cbRef.current.onQuizEnded?.());

    return () => socket.disconnect();
  }, [sessionId, accessToken]);

  const launchQuiz = (quiz) => socketRef.current?.emit('quiz:launch', { sessionId, quiz });
  const submitQuiz = (result) => socketRef.current?.emit('quiz:submit', { sessionId, result });
  const endQuiz = () => socketRef.current?.emit('quiz:end', { sessionId });

  return { launchQuiz, submitQuiz, endQuiz };
}
