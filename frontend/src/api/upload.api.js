import api from './axios';

export const uploadVideo = (file, onProgress) => {
  const form = new FormData();
  form.append('file', file);
  return api.post('/upload/video', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (e) => onProgress?.(Math.round((e.loaded * 100) / e.total)),
  });
};

export const uploadDocument = (file, onProgress) => {
  const form = new FormData();
  form.append('file', file);
  return api.post('/upload/document', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (e) => onProgress?.(Math.round((e.loaded * 100) / e.total)),
  });
};

export const uploadImage = (file) => {
  const form = new FormData();
  form.append('file', file);
  return api.post('/upload/image', form, { headers: { 'Content-Type': 'multipart/form-data' } });
};
