import api from './axios';

export const getSessionsByClass = (classId, params) => api.get(`/live/sessions/${classId}`, { params });
export const createSession = (data) => api.post('/live/sessions', data);
export const joinSession = (sessionId) => api.post(`/live/sessions/${sessionId}/join`);
export const markAttendance = (data) => api.post('/live/attendance', data);
