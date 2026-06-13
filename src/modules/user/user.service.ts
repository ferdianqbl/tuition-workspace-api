import * as repository from "./user.repository";

export async function getUsers() {
  return repository.findAll();
}
