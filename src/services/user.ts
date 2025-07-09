import { IGetUserResponse, IGetUsersResponse } from "../ts/services/user.types.ts"
import AxiosJSON from "../utils/helpers/axios.ts"

export async function getUser() {
  return { id: 1, name: 'Demo User', email: 'demo@example.com' };
}

export async function getUserById() {
  return { id: 1, name: 'Demo User', email: 'demo@example.com' };
}

export async function getAllUsers() {
  return {
    users: [
      { id: 1, name: 'Demo User', email: 'demo@example.com' },
      { id: 2, name: 'Sample User', email: 'sample@example.com' }
    ]
  };
}
