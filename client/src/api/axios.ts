import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3030',
  // có thể bổ sung các thiết lập mặc định khác (timeout, headers JSON...) nếu cần
});

// Request interceptor: thêm token vào header Authorization nếu có
axiosInstance.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: xử lý lỗi chung (ví dụ 401 Unauthorized)
axiosInstance.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      // Nếu Unauthorized -> xóa thông tin user, token và có thể điều hướng đến /login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // TODO: Optionally, phát ra thông báo lỗi hoặc redirect về /login
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
