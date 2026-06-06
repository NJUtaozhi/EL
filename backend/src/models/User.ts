/**
 * 用户模型类型定义
 */
export interface User {
  id: number
  openId: string | null
  nickname: string | null
  avatar: string | null
  checkinStreak: number
  createdAt: Date
}

export interface LoginDTO {
  openId: string
  nickname?: string
  avatar?: string
}

export interface UserInfo {
  id: number
  nickname: string | null
  avatar: string | null
  checkinStreak: number
  createdAt: Date
}

export interface UserWithToken {
  user: UserInfo
  token: string
}
