import { userRepository } from "./user.repository";
import type { IFindAllUsersRequest } from "./user.types";

export class UserService {
  async getUsers(params?: IFindAllUsersRequest) {
    return userRepository.findAll(params);
  }

  async getUserById(id: string) {
    return userRepository.findById(id);
  }

  async getUserByUsername(username: string) {
    return userRepository.findByUsername(username);
  }
}

export const userService = new UserService();
