import axios from 'axios'
import { ENV } from '../config/env'

const AxiosJSON = axios.create({
  baseURL: ENV.BACKEND_URL,
  headers: {
    Accept: "application/json",
    ContentType: "application/json",
  },
})

AxiosJSON.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("user_auth_token")
    if (token) config.headers["Authorization"] = `Bearer ${token}`
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

export default AxiosJSON
