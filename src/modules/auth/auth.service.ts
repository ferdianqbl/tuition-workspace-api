import bcrypt from "bcryptjs";
import { userRepository } from "../user/user.repository";
import { userService } from "../user/user.service";
import { generateToken } from "@/utils/crypto";
import { createAppError } from "@/utils/error";
import type { ILoginRequest, IRegisterRequest } from "./auth.types";

export class AuthService {
  async register(data: IRegisterRequest) {
    return userService.createUser(data);
  }

  async login(data: ILoginRequest) {
    const { username, password } = data;

    // Retrieve the user including the password hash using our auth-specific lookup
    const user = await userRepository.findForAuth(username);
    if (!user) {
      throw createAppError("Invalid username or password", 401);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw createAppError("Invalid username or password", 401);
    }

    // Generate JWT token containing key user details
    const token = generateToken({
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
    });

    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role,
      },
    };
  }
}

export const authService = new AuthService();
