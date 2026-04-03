export type User = {
  id: string;
  email: string;
  name: string;
};

export type AuthResponse = {
  data: {
    accessToken: string;
    refreshToken: string;
    user?: User | null;
  };
  message: string;
  success: boolean;
};

export type RefreshResponse = {
  data: {
    accessToken: string;
    refreshToken: string;
  };
  message: string;
  success: boolean;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type RegisterRequest = {
  name: string;
  email: string;
  password: string;
};
