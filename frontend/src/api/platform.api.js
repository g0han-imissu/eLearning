import api from './axios';

// Public — không cần đăng nhập
export const submitOrgRegistration = (data) => api.post('/organization-registrations', data);

// Super Admin
export const getOrgRequests = (params) => api.get('/platform/organization-registrations', { params });
export const getOrgRequest = (id) => api.get(`/platform/organization-registrations/${id}`);
export const approveOrgRequest = (id) => api.post(`/platform/organization-registrations/${id}/approve`);
export const rejectOrgRequest = (id, rejectReason) =>
  api.post(`/platform/organization-registrations/${id}/reject`, { rejectReason });

export const getOrganizations = () => api.get('/platform/organizations');
export const getOrganization = (id) => api.get(`/platform/organizations/${id}`);
export const suspendOrganization = (id) => api.patch(`/platform/organizations/${id}/suspend`);
export const activateOrganization = (id) => api.patch(`/platform/organizations/${id}/activate`);

export const getPlatformStats = () => api.get('/platform/stats');
