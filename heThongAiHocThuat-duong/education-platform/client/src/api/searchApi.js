import axiosInstance from './axiosInstance';

export const searchContent = (q) => axiosInstance.get('/search', { params: { q } });
