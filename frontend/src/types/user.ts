/** 用户 */
export interface User {
  id: number
  nickname?: string
  avatar?: string
  checkinStreak: number
}

/** 徽章 */
export interface Badge {
  id: number
  name: string
  icon: string
  condition: string
  earnedAt: string
}

/** 打卡记录 */
export interface CheckinRecord {
  id: number
  action: string
  date: string
  streak: number
}
