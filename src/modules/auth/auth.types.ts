import { Role } from "@/generated/prisma/client";

export interface IRegisterRequest {
  username: string;
  password: string;
  name: string;
  role: Role;
}

export interface ILoginRequest {
  username: string;
  password: string;
}

export interface IAuthUser {
  id: string;
  username: string;
  name: string;
  role: Role;
}

export interface IAuthCreateSessionRequest {
  userId: string;
  token: string;
  expiresAt: Date;
}
