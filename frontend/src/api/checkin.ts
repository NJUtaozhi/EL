/**
 * 打卡相关 API
 */
import api from './index'
import type { CheckinRecord, Badge } from '@/types/user'

/** 执行打卡 */
export const doCheckin = (action: string): Promise<CheckinRecord> =>
  api.post('/checkin', { action })

/** 获取打卡历史 */
export const getCheckinHistory = (): Promise<CheckinRecord[]> =>
  api.get('/checkin/history')

/** 获取打卡连续天数 */
export const getCheckinStreak = (): Promise<number> =>
  api.get('/checkin/streak')

/** 获取徽章列表 */
export const getBadges = (): Promise<Badge[]> =>
  api.get('/checkin/badges')
