import api from './axios';

export const getQuiz = (id) => api.get(`/quizzes/${id}`);
export const updateQuiz = (id, data) => api.patch(`/quizzes/${id}`, data);
export const createQuestion = (quizId, data) => api.post(`/quizzes/${quizId}/questions`, data);
export const updateQuestion = (id, data) => api.patch(`/quizzes/questions/${id}`, data);
export const deleteQuestion = (id) => api.delete(`/quizzes/questions/${id}`);
export const createAnswer = (questionId, data) => api.post(`/quizzes/questions/${questionId}/answers`, data);
export const updateAnswer = (id, data) => api.patch(`/quizzes/answers/${id}`, data);
export const deleteAnswer = (id) => api.delete(`/quizzes/answers/${id}`);
export const submitQuiz = (data) => api.post('/student/quiz/submit', data);
