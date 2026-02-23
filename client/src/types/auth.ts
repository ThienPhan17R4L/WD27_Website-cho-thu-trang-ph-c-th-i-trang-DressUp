export interface Address {
  receiverName: string;
  receiverPhone: string;
  line1: string;
  ward: string;
  district: string;
  province: string;
  country?: string;
  postalCode?: string;
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  phone: string | null;
  avatarUrl?: string;
  dob?: string;
  gender?: "male" | "female" | "other";
  roles: string[]; // ["user"], ["admin"], or ["user", "admin"]
  isEmailVerified: boolean;
  address?: Address;
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