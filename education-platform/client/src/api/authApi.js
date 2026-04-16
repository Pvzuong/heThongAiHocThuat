import axiosInstance from './axiosInstance';

export const register = (email, password) =>
  axiosInstance.post('/auth/register', { email, password });

export const verifyEmail = (email, otp) =>
  axiosInstance.post('/auth/verify-email', { email, otp });

export const resendOTP = (email) =>
  axiosInstance.post('/auth/resend-otp', { email });

export const login = (email, password) =>
  axiosInstance.post('/auth/login', { email, password });

export const logout = () =>
  axiosInstance.post('/auth/logout');

export const getMe = () =>
  axiosInstance.get('/auth/me');
