import axiosInstance from './axiosInstance';

export const getGrades = () => axiosInstance.get('/grades');
export const getSubjectsByGrade = (gradeSlug) => axiosInstance.get(`/grades/${gradeSlug}/subjects`);
export const getChaptersBySubject = (gradeSlug, subjectSlug) =>
  axiosInstance.get(`/subjects/${gradeSlug}/${subjectSlug}/chapters`);
export const getLessonsByChapter = (chapterId) => axiosInstance.get(`/chapters/${chapterId}/lessons`);
export const getLessonById = (lessonId) => axiosInstance.get(`/lessons/${lessonId}`);
