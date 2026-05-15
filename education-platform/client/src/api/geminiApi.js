import axiosInstance from './axiosInstance';

export const generateQuestions = (config) =>
  axiosInstance.post('/gemini/generate-questions', config);

export const generateTest = (config) =>
  axiosInstance.post('/gemini/generate-test', config);

export const getMyCollections = () =>
  axiosInstance.get('/gemini/collections');

export const getCollectionDetail = (id) =>
  axiosInstance.get(`/gemini/collections/${id}`);

export const submitCollectionResult = (id, data) =>
  axiosInstance.post(`/gemini/collections/${id}/submit`, data);

export const deleteCollection = (id) =>
  axiosInstance.delete(`/gemini/collections/${id}`);

export const cloneCollection = (id) =>
  axiosInstance.post(`/gemini/collections/${id}/clone`);

export const updateQuestion = (collectionId, questionId, data) =>
  axiosInstance.put(`/gemini/collections/${collectionId}/questions/${questionId}`, data);

export const deleteQuestion = (collectionId, questionId) =>
  axiosInstance.delete(`/gemini/collections/${collectionId}/questions/${questionId}`);

export const regenerateQuestion = (collectionId, questionId) =>
  axiosInstance.post(`/gemini/collections/${collectionId}/questions/${questionId}/regenerate`);
