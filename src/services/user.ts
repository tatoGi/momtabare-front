import { IGetUserResponse, IGetUsersResponse } from "../ts/services/user.types.ts"
import AxiosJSON from "../utils/helpers/axios.ts"

export async function getUser(): Promise<IGetUserResponse | null> {
  try {
    const response = await AxiosJSON.get("/user")
    return response.data.user
  } catch (error) {
    console.log(error)
    return null
  }
}

export async function getUserById(
  userId: number,
): Promise<IGetUserResponse | null> {
  try {
    const response = await AxiosJSON.get(`/users/${userId}`)
    return response.data
  } catch (error) {
    console.log(error)
    return null
  }
}
export async function getAllUsers(): Promise<IGetUsersResponse | null> {
  try {
    const response = await AxiosJSON.get(`/users`)
    return response.data
  } catch (error) {
    console.log(error)
    return null
  }
}
