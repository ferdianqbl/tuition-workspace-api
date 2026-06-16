import type { Role as UserRoleEnum } from "@/generated/prisma/enums";

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
