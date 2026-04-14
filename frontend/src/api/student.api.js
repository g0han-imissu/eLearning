import api from './axios';

export const getMyEnrollments = (params) => api.get('/student/me', { params });
export const getMyProgress = () => api.get('/student/progress');
export const submitQuiz = (data) => api.post('/student/quiz-submit', data);
export const updateProgress = (data) => api.patch('/student/progress', data);
