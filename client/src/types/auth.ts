export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  role: "creator" | "editor" | "admin";
  plan: "studio-pro" | "starter-plan" | "free-tier";
  credits: number; // Defaults to 100,000 credits
  tokenUsage: number;
  totalComicsCreated: number;
  verified: boolean;
  authProvider?: "email" | "google";
  providerId?: string;
  passwordHash?: string;
  createdAt: string;
  updatedAt?: string;
  bio?: string;
  routine?: string;
  thinkingLevel?: string;
  imaginationScore?: number;
  creativeLevel?: string;
}

export interface AuthSession {
  user: UserProfile | null;
  isAuthenticated: boolean;
  accessToken?: string;
  expiresAt?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface SignupCredentials {
  name: string;
  email: string;
  password: string;
  confirmPassword?: string;
}

export interface AuthApiResponse {
  success: boolean;
  user?: UserProfile;
  error?: string;
  message?: string;
}
