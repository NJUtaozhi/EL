/**
 * 仪表盘 API
 * 对应后端 /api/dashboard 路由
 */
import api from './index'

/** 仪表盘完整数据 */
export interface DashboardData {
  todayTaskCount: number
  weekTaskCount: number
  streak: number
  weekCheckinDays: number
  totalTasks: number
  totalCheckins: number
  recentProcrastinationType: string | null
  typeDistribution: Record<string, number>
  weekDailyTaskCounts: Array<{ date: string; count: number }>
  weekDailyCheckinCounts: Array<{ date: string; count: number }>
}

/** 获取首页轻量概览 */
export const getDashboardOverview = (): Promise<DashboardData> =>
  api.get('/dashboard/overview')

/** 获取完整仪表盘数据 */
export const getDashboard = (): Promise<DashboardData> =>
  api.get('/dashboard')
