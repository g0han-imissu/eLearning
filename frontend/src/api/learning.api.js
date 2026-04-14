import api from './axios';

// Programs
export const getPrograms = (params) => api.get('/learning/programs', { params });
export const createProgram = (data) => api.post('/learning/programs', data);
export const updateProgram = (id, data) => api.patch(`/learning/programs/${id}`, data);
export const deleteProgram = (id) => api.delete(`/learning/programs/${id}`);

// Courses
export const getCourses = (params) => api.get('/learning/courses', { params });
export const createCourse = (data) => api.post('/learning/courses', data);
export const updateCourse = (id, data) => api.patch(`/learning/courses/${id}`, data);
export const deleteCourse = (id) => api.delete(`/learning/courses/${id}`);

// Classes
export const getClasses = (params) => api.get('/learning/classes', { params });
export const getClass = (id) => api.get(`/learning/classes/${id}`);
export const createClass = (data) => api.post('/learning/classes', data);
export const updateClass = (id, data) => api.patch(`/learning/classes/${id}`, data);
export const deleteClass = (id) => api.delete(`/learning/classes/${id}`);

// Enrollments
export const enrollClass = (data) => api.post('/learning/enrollments', data);
