import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL + import.meta.env.VITE_API_PREFIX,
  headers: {
    'Content-Type': 'application/json'
  }
})

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle 401s globally
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Handle unauthorized (redirect to login, etc)
    }
    return Promise.reject(error)
  }
)

export default api
