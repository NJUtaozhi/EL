/**
 * 用户相关 API
 */
import api from './index'
import type { User } from '@/types/user'

/** 登录 */
export const login = (code: string): Promise<{ token: string; user: User }> =>
  api.post('/user/login', { code })

/** 获取用户信息 */
export const getUserInfo = (): Promise<User> =>
  api.get('/user/info')
