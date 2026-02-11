export interface User {
  id: string;
  email: string;
  fullName: string;
  phone: string | null;
  roles: string[]; // ["user"], ["admin"], or ["user", "admin"]
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthContextProps {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
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
  email: string;
  password: string;
  fullName: string;
  phone?: string; // Optional
}