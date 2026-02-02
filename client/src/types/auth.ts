export interface User {
  email: string;
  permissions: string[];
  fullName: string;
  phone: string;
}

export interface AuthContextProps {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  accessToken: string;
}

export interface RegistRequest {
  email: string,
  password: string,
  fullName: string,
  phone: string
}