import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import useAuthStore from '../stores/authStore';

export default function useSocket({ sessionId, onQuizLaunched, onQuizResult, onQuizEnded }) {
  const socketRef = useRef(null);
  const accessToken = useAuthStore((s) => s.accessToken);

  useEffect(() => {
    if (!sessionId || !accessToken) return;

    const socket = io('/', { auth: { token: accessToken } });
    socketRef.current = socket;

    socket.emit('join-room', sessionId);
    socket.on('quiz:launched', onQuizLaunched);
    socket.on('quiz:result', onQuizResult);
    socket.on('quiz:ended', onQuizEnded);

    return () => socket.disconnect();
  }, [sessionId, accessToken]);

  const launchQuiz = (quiz) => socketRef.current?.emit('quiz:launch', { sessionId, quiz });
  const submitQuiz = (result) => socketRef.current?.emit('quiz:submit', { sessionId, result });
  const endQuiz = () => socketRef.current?.emit('quiz:end', { sessionId });

  return { launchQuiz, submitQuiz, endQuiz };
}
