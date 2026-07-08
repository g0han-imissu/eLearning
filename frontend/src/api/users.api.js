import api from './axios';

export const getUsers = (params) => api.get('/users', { params });
export const updateUserStatus = (id, status) => api.patch(`/users/${id}/status`, { status });
export const assignRoles = (id, roleNames) => api.patch(`/users/${id}/roles`, { roleNames });

// Tạo thủ công + import hàng loạt
export const createUser = (data) => api.post('/users', data);
export const importUsers = (file, { type, dryRun = false, atomic = false }) => {
  const fd = new FormData();
  fd.append('file', file);
  return api.post(`/users/import?type=${type}&dryRun=${dryRun}&atomic=${atomic}`, fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};
export const getImportJobs = () => api.get('/users/import-jobs');
export const getImportJob = (id) => api.get(`/users/import-jobs/${id}`);
export const rollbackImportJob = (id) => api.post(`/users/import-jobs/${id}/rollback`);
export const wipeImportCredentials = (id) => api.delete(`/users/import-jobs/${id}/credentials`);

const downloadBlob = (data, filename) => {
  const url = URL.createObjectURL(new Blob([data], { type: 'text/csv;charset=utf-8' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

export const downloadImportCredentials = async (id) => {
  const res = await api.get(`/users/import-jobs/${id}/credentials`, { responseType: 'blob' });
  downloadBlob(res.data, `credentials-${id}.csv`);
};

export const downloadImportTemplate = async (type) => {
  const res = await api.get(`/users/import-template?type=${type}`, { responseType: 'blob' });
  downloadBlob(res.data, `import-${type.toLowerCase()}-template.csv`);
};
