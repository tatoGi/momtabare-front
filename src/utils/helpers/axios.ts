import axios from "axios"

const AxiosJSON = axios.create({
  baseURL: `${import.meta.env.VITE_BACKEND_URL}/api`,
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
