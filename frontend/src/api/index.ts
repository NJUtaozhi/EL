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
  // 上传文件时删除 Content-Type 让 axios 自动设置 multipart boundary
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type']
  }
  return config
})

// 响应拦截：统一解包 + 错误处理
// 后端统一返回 { code: 0, data: ..., message: "ok" }
// 拦截器自动解包 data，code !== 0 时抛出异常
api.interceptors.response.use(
  (res) => {
    const body = res.data
    if (body && body.code === 0) {
      return body.data // 自动解包内层 data
    }
    // 后端返回的业务错误
    const msg = body?.message || '请求失败'
    return Promise.reject(new Error(msg))
  },
  (err) => {
    const msg = err.response?.data?.message || '网络异常，请稍后重试'
    console.error('[API Error]', msg)
    return Promise.reject(new Error(msg))
  }
)

export default api
