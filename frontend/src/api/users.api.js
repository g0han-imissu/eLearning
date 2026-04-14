import api from './axios';

export const getUsers = (params) => api.get('/users', { params });
export const updateUserStatus = (id, status) => api.patch(`/users/${id}/status`, { status });
export const assignRoles = (id, roles) => api.patch(`/users/${id}/roles`, { roles });
