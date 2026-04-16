import axiosInstance from './axiosInstance';

// Users
export const getAdminUsers = (params) => axiosInstance.get('/admin/users', { params });
export const updateAdminUser = (id, data) => axiosInstance.put(`/admin/users/${id}`, data);
export const deleteAdminUser = (id) => axiosInstance.delete(`/admin/users/${id}`);

// Chapters
export const createAdminChapter = (data) => axiosInstance.post('/admin/chapters', data);
export const updateAdminChapter = (id, data) => axiosInstance.put(`/admin/chapters/${id}`, data);
export const deleteAdminChapter = (id) => axiosInstance.delete(`/admin/chapters/${id}`);

// Lessons
export const createAdminLesson = (data) => axiosInstance.post('/admin/lessons', data);
export const updateAdminLesson = (id, data) => axiosInstance.put(`/admin/lessons/${id}`, data);
export const deleteAdminLesson = (id) => axiosInstance.delete(`/admin/lessons/${id}`);

// Exercises
export const createAdminExercise = (data) => axiosInstance.post('/admin/exercises', data);
export const updateAdminExercise = (id, data) => axiosInstance.put(`/admin/exercises/${id}`, data);
export const deleteAdminExercise = (id) => axiosInstance.delete(`/admin/exercises/${id}`);

// Skill modules
export const createAdminSkillModule = (data) => axiosInstance.post('/admin/skill-modules', data);
export const updateAdminSkillModule = (id, data) => axiosInstance.put(`/admin/skill-modules/${id}`, data);
export const deleteAdminSkillModule = (id) => axiosInstance.delete(`/admin/skill-modules/${id}`);

// Skill lessons
export const createAdminSkillLesson = (data) => axiosInstance.post('/admin/skill-lessons', data);
export const updateAdminSkillLesson = (id, data) => axiosInstance.put(`/admin/skill-lessons/${id}`, data);
export const deleteAdminSkillLesson = (id) => axiosInstance.delete(`/admin/skill-lessons/${id}`);

// Gemini
export const getGeminiSettings = () => axiosInstance.get('/admin/gemini/settings');
export const updateGeminiSettings = (data) => axiosInstance.put('/admin/gemini/settings', data);
export const testGeminiGenerate = (prompt) => axiosInstance.post('/admin/gemini/generate', { prompt });
