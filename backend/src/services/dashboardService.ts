/**
 * 仪表盘数据聚合服务（第4周实现）
 *
 * 为前端 Home 仪表盘和 Profile 页面提供聚合数据：
 *   - 今日任务数 / 本周任务数
 *   - 连续打卡天数 / 本周打卡天数
 *   - 最近拖延类型
 *   - 拖延类型分布
 *   - 周报数据（任务趋势 + 打卡趋势）
 */
import prisma from '../config/database'
import * as checkinService from './checkinService'
import * as analysisService from './analysisService'
import logger from '../utils/logger'

/**
 * 获取本周起止时间（周一开始）
 */
function getWeekRange(): { start: Date; end: Date } {
  const now = new Date()
  const dayOfWeek = now.getDay()
  // 周一为一周开始（周日=0 → 6天前，周一=1 → 0天前）
  const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - mondayOffset)
  start.setHours(0, 0, 0, 0)
  const end = new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000 - 1)
  return { start, end }
}

/**
 * 获取今日起止时间
 */
function getTodayRange(): { start: Date; end: Date } {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000 - 1)
  return { start, end }
}

export interface DashboardData {
  /** 今日任务数 */
  todayTaskCount: number
  /** 本周任务总数 */
  weekTaskCount: number
  /** 连续打卡天数 */
  streak: number
  /** 本周已打卡天数 */
  weekCheckinDays: number
  /** 总任务数 */
  totalTasks: number
  /** 总打卡数 */
  totalCheckins: number
  /** 最近拖延类型（最近一次归因分析结果） */
  recentProcrastinationType: string | null
  /** 拖延类型分布 */
  typeDistribution: Record<string, number>
  /** 本周每日任务数（折线图数据） */
  weekDailyTaskCounts: Array<{ date: string; count: number }>
  /** 本周每日打卡数（趋势图数据） */
  weekDailyCheckinCounts: Array<{ date: string; count: number }>
}

/**
 * 获取仪表盘聚合数据
 * 一次请求返回 Home 和 Profile 页面需要的所有数据
 */
export async function getDashboardData(userId: number): Promise<DashboardData> {
  const today = getTodayRange()
  const week = getWeekRange()

  // 并行查询各项数据
  const [
    todayTaskCount,
    weekTasks,
    totalTasks,
    totalCheckins,
    checkinStatus,
    typeDistribution,
  ] = await Promise.all([
    // 今日任务数
    prisma.task.count({
      where: { userId, createdAt: { gte: today.start, lte: today.end } },
    }),
    // 本周任务
    prisma.task.findMany({
      where: { userId, createdAt: { gte: week.start, lte: week.end } },
      orderBy: { createdAt: 'asc' },
    }),
    // 总任务数
    prisma.task.count({ where: { userId } }),
    // 总打卡数
    prisma.checkin.count({ where: { userId } }),
    // 打卡状态
    checkinService.getCheckinStatus(userId),
    // 拖延类型分布
    analysisService.getTypeDistribution(userId),
  ])

  // 最近拖延类型（从最近一次分析中获取）
  const recentAnalysis = await prisma.analysis.findFirst({
    where: { task: { userId } },
    orderBy: { createdAt: 'desc' },
    select: { type: true },
  })

  // 本周每日任务数（按天分组）
  const weekDailyTaskCounts = buildDailyCounts(week.start, weekTasks)

  // 本周每日打卡数
  const weekCheckins = await prisma.checkin.findMany({
    where: { userId, date: { gte: week.start, lte: week.end } },
  })
  const weekDailyCheckinCounts = buildDailyCheckinCounts(week.start, weekCheckins)

  // 本周已打卡天数（不重复日期）
  const checkedInDays = new Set(
    weekCheckins.map((c) => c.date.toISOString().slice(0, 10)),
  )

  logger.info(`仪表盘数据聚合完成: userId=${userId}, todayTasks=${todayTaskCount}, streak=${checkinStatus.streak}`)

  return {
    todayTaskCount,
    weekTaskCount: weekTasks.length,
    streak: checkinStatus.streak,
    weekCheckinDays: checkedInDays.size,
    totalTasks,
    totalCheckins,
    recentProcrastinationType: recentAnalysis?.type ?? null,
    typeDistribution,
    weekDailyTaskCounts,
    weekDailyCheckinCounts,
  }
}

/**
 * 构建本周每日任务数数组
 */
function buildDailyCounts(
  weekStart: Date,
  tasks: Array<{ createdAt: Date }>,
): Array<{ date: string; count: number }> {
  const counts = new Map<string, number>()

  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart.getTime() + i * 24 * 60 * 60 * 1000)
    counts.set(d.toISOString().slice(0, 10), 0)
  }

  for (const t of tasks) {
    const key = t.createdAt.toISOString().slice(0, 10)
    counts.set(key, (counts.get(key) || 0) + 1)
  }

  return Array.from(counts.entries()).map(([date, count]) => ({ date, count }))
}

/**
 * 构建本周每日打卡数数组
 */
function buildDailyCheckinCounts(
  weekStart: Date,
  checkins: Array<{ date: Date }>,
): Array<{ date: string; count: number }> {
  const counts = new Map<string, number>()

  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart.getTime() + i * 24 * 60 * 60 * 1000)
    counts.set(d.toISOString().slice(0, 10), 0)
  }

  for (const c of checkins) {
    const key = c.date.toISOString().slice(0, 10)
    counts.set(key, (counts.get(key) || 0) + 1)
  }

  return Array.from(counts.entries()).map(([date, count]) => ({ date, count }))
}

/**
 * 获取用户概览数据（Home 页面轻量版）
 * 仅返回首页需要的核心指标
 */
export async function getOverview(userId: number): Promise<{
  todayTaskCount: number
  streak: number
  todayCheckedIn: boolean
  recentProcrastinationType: string | null
  totalTasks: number
  totalCheckins: number
}> {
  const today = getTodayRange()

  const [todayTaskCount, totalTasks, totalCheckins, checkinStatus, recentAnalysis] =
    await Promise.all([
      prisma.task.count({
        where: { userId, createdAt: { gte: today.start, lte: today.end } },
      }),
      prisma.task.count({ where: { userId } }),
      prisma.checkin.count({ where: { userId } }),
      checkinService.getCheckinStatus(userId),
      prisma.analysis.findFirst({
        where: { task: { userId } },
        orderBy: { createdAt: 'desc' },
        select: { type: true },
      }),
    ])

  return {
    todayTaskCount,
    streak: checkinStatus.streak,
    todayCheckedIn: checkinStatus.todayCheckedIn,
    recentProcrastinationType: recentAnalysis?.type ?? null,
    totalTasks,
    totalCheckins,
  }
}
