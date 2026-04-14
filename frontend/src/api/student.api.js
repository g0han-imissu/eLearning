import api from './axios';

export const getMe = () => api.get('/student/me');
export const getMyEnrollments = () => api.get('/student/enrollments');
export const getMyProgress = () => api.get('/student/progress');
export const joinClassByCode = (code) => api.post('/student/join', { code });
export const submitQuiz = (data) => api.post('/student/quiz-submit', data);
export const updateProgress = (data) => api.patch('/student/progress', data);
