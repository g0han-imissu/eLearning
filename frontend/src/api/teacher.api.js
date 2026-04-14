import api from './axios';

export const getMyClasses = () => api.get('/teacher/classes');
export const getClassStudents = (classId) => api.get(`/teacher/classes/${classId}/students`);
export const getClassRequests = (classId) => api.get(`/teacher/classes/${classId}/requests`);
export const handleEnrollmentRequest = (classId, studentId, action) =>
  api.post(`/teacher/classes/${classId}/requests`, { studentId, action });
