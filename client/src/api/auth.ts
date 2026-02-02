import { LoginRequest, RegistRequest } from '@/types/auth';
import axios from './axios';

export async function register(request: RegistRequest) {
  const response = await axios.post('/auth/register', request);
  return response.data;
}

// Gửi request login, trả về dữ liệu (ví dụ: { token, user })
export async function login(credentials: LoginRequest) {
  const response = await axios.post('/auth/login', credentials);
  return response.data;  // giả định API trả về { token, user }
}

// (Tuỳ chọn) Hàm lấy thông tin người dùng hiện tại
export async function getProfile() {
  const response = await axios.get('/auth/me');
  return response.data;
}
