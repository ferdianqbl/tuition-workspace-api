export interface IFindAllUsersRequest {
  filters: {
    role?: "PARENT" | "TUTOR" | "ADMIN";
  };
}
