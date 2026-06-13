/**
 * 用户相关 API
 */
import api from './index'
import type { User } from '@/types/user'

/** 登录 */
export const login = (openId: string, nickname?: string): Promise<{ token: string; user: User }> =>
  api.post('/user/login', { openId, nickname })

/** 获取用户信息 */
export const getUserInfo = (): Promise<User> =>
  api.get('/user/me')

/** 更新昵称 */
export const updateNickname = (nickname: string): Promise<User> =>
  api.put('/user/me', { nickname })

/** 上传头像 */
export const uploadAvatar = (file: File): Promise<User> => {
  const formData = new FormData()
  formData.append('file', file)
  return api.post('/user/avatar', formData)
}
