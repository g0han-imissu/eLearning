import api from './axios';

export const getQuiz = (id) => api.get(`/quizzes/${id}`);
export const updateQuiz = (id, data) => api.patch(`/quizzes/${id}`, data);

// quizId phải nằm trong body, không phải URL
export const createQuestion = (quizId, data) => api.post('/quizzes/questions', { quizId, ...data });
export const updateQuestion = (id, data) => api.patch(`/quizzes/questions/${id}`, data);
export const deleteQuestion = (id) => api.delete(`/quizzes/questions/${id}`);

// questionId phải nằm trong body
export const createAnswer = (questionId, data) => api.post('/quizzes/answers', { questionId, ...data });
export const updateAnswer = (id, data) => api.patch(`/quizzes/answers/${id}`, data);
export const deleteAnswer = (id) => api.delete(`/quizzes/answers/${id}`);
