/**
 * 打卡与徽章模型类型定义
 */
export interface Checkin {
  id: number
  userId: number
  action: string
  date: Date
}

export interface CheckinDTO {
  action: string
}

export interface Badge {
  id: number
  userId: number
  name: string
  icon: string
  condition: string
  earnedAt: Date
}

export interface CheckinStatus {
  todayCheckedIn: boolean
  streak: number
  totalCheckins: number
  badges: Badge[]
}
