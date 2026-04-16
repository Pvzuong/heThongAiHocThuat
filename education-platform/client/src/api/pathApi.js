import axiosInstance from './axiosInstance';

export const getPaths = () => axiosInstance.get('/paths');
export const getPathBySlug = (slug) => axiosInstance.get(`/paths/${slug}`);
export const getModuleById = (moduleId) => axiosInstance.get(`/paths/modules/${moduleId}`);
export const getSkillLessonById = (lessonId) => axiosInstance.get(`/paths/lessons/${lessonId}`);
export const getPlacementTest = (pathSlug) => axiosInstance.get(`/paths/${pathSlug}/placement-test`);
export const submitPlacementTest = (testId, answers) =>
  axiosInstance.post(`/paths/placement-test/${testId}/submit`, { answers });
