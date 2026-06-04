import axiosInstance from './axiosInstance';

export const getExercisesByLesson = (lessonId) => axiosInstance.get(`/exercises/lesson/${lessonId}`);
export const submitExercise = (exerciseId, answer) =>
  axiosInstance.post(`/exercises/${exerciseId}/submit`, { answer });

export const completeLesson = (lessonId) =>
  axiosInstance.post(`/progress/lesson/${lessonId}/complete`);
export const getProgressOverview = () => axiosInstance.get('/progress/overview');
export const getChapterProgress = (chapterId) => axiosInstance.get(`/progress/chapter/${chapterId}`);
export const getHeatmap = (year) => axiosInstance.get('/progress/heatmap', { params: { year } });
export const getCoursesInProgress = () => axiosInstance.get('/progress/courses');
