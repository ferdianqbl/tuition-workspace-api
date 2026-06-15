import { userRepository } from "./user.repository";
import type { IFindAllUsersRequest } from "./user.types";

export class UserService {
  async getUsers(params?: IFindAllUsersRequest) {
    return userRepository.findAll(params);
  }
}

export const userService = new UserService();
