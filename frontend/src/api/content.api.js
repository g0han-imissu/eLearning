import api from './axios';

// Lectures
export const getLectures = (params) => api.get('/content/lectures', { params });
export const getLecture = (id) => api.get(`/content/lectures/${id}`);
export const createLecture = (data) => api.post('/content/lectures', data);
export const updateLecture = (id, data) => api.patch(`/content/lectures/${id}`, data);
export const deleteLecture = (id) => api.delete(`/content/lectures/${id}`);

// Modules
export const getModule = (id) => api.get(`/content/modules/${id}`);
export const createModule = (data) => api.post('/content/modules', data);
export const updateModule = (id, data) => api.patch(`/content/modules/${id}`, data);
export const deleteModule = (id) => api.delete(`/content/modules/${id}`);

// Contents
export const getContent = (id) => api.get(`/content/contents/${id}`);
export const createContent = (data) => api.post('/content/contents', data);
export const deleteContent = (id) => api.delete(`/content/contents/${id}`);
