/**
 * axios 实例封装
 * - 自动添加 baseURL
 * - 请求/响应拦截器
 * - 统一错误处理
 */
import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

// 请求拦截：添加 token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 响应拦截：统一错误处理
api.interceptors.response.use(
  (res) => res.data,
  (err) => {
    const msg = err.response?.data?.message || '网络异常，请稍后重试'
    console.error('[API Error]', msg)
    return Promise.reject(err)
  }
)

export default api
