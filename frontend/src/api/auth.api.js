import api from './axios';

export const login = (data) => api.post('/auth/login', data);
export const register = (data) => api.post('/auth/register', data);
export const logout = (data) => api.post('/auth/logout', data);
export const refreshToken = (data) => api.post('/auth/refresh', data);
export const verifyEmail = (token) => api.get('/auth/verify-email', { params: { token } });
export const activateAccount = (data) => api.post('/auth/activate', data);
export const firstChangePassword = (data) => api.post('/auth/first-password', data);
export const requestChangePassword = () => api.post('/auth/change-password/request');
export const confirmChangePassword = (data) => api.post('/auth/change-password/confirm', data);
export const updateProfile = (data) => api.patch('/auth/profile', data);
