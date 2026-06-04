import axiosInstance from './axiosInstance';

export const getPlacementStatus = (gradeSlug, subjectSlug) =>
  axiosInstance.get(`/placement/${gradeSlug}/${subjectSlug}/status`);

export const getPlacementTest = (gradeSlug, subjectSlug) =>
  axiosInstance.get(`/placement/${gradeSlug}/${subjectSlug}/test`);

export const submitPlacementTest = (gradeSlug, subjectSlug, answers) =>
  axiosInstance.post(`/placement/${gradeSlug}/${subjectSlug}/submit`, { answers });
