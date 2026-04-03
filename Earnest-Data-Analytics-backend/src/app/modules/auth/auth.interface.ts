import { Role } from "@prisma/client";

export interface IAuthLoginPayload {
  email: string;
  password: string;
  isRemember: boolean;
}

export interface IAuthRegisterPayload {
  email: string;
  password: string;
  phone?: string;
  name: string;
  role: Role;
}
export interface IAuthService {
  loginService: (payload: IAuthLoginPayload) => Promise<{ token: string }>;
  registerService: (
    payload: IAuthRegisterPayload
  ) => Promise<{ id: string; email: string; role: Role }>;
}

export interface CreateUserDTO {
  name: string;
  email: string;
  password: string;
}

export interface AdminResetPasswordDTO {
  userId: string;
}

export interface ChangePasswordDTO {
  currentPassword: string;
  newPassword: string;
}

export interface ForgotPasswordDTO {
  email: string;
}

export interface ResetPasswordDTO {
  token: string;
  newPassword: string;
}

export interface UpdateProfileDTO {
  name: string;
  email: string;
  phone?: string;
  address?: string;
}
