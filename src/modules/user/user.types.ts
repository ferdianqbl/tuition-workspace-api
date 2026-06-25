import type { Role as UserRoleEnum } from "@prisma/client";

export interface IFindAllUsersRequest {
  filters: {
    role?: UserRoleEnum;
  };
}

export interface ISaveUserRequest {
  username: string;
  password: string;
  name: string;
  role: UserRoleEnum;
}
