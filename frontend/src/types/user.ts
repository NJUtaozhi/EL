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

/** 徽章进度 */
export interface BadgeProgress {
  current: number
  target: number
}

/** 徽章规则（含 earned 状态 + 进度） */
export interface BadgeRule extends Badge {
  earned: boolean
  progress: BadgeProgress
}

/** 打卡记录 */
export interface CheckinRecord {
  id: number
  action: string
  date: string
  streak: number
}

/** 打卡响应（含新获得徽章） */
export interface CheckinResponse extends CheckinRecord {
  newBadges: Badge[]
}
