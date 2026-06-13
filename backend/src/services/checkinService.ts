/**
 * 打卡服务（第4周完整实现）
 *
 * 功能：
 *   - 每日打卡（一天限一次）
 *   - 连续打卡天数计算
 *   - 徽章自动判定与发放
 *   - 打卡日历数据（月视图）
 *   - 打卡状态查询
 */
import prisma from '../config/database'
import { BADGE_RULES } from '../utils/constants'
import type { Checkin, Badge, CheckinStatus } from '../models/Checkin'
import logger from '../utils/logger'

/**
 * 获取今日的起止时间（本地时区 00:00:00 ~ 23:59:59）
 */
function getTodayRange(): { start: Date; end: Date } {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000 - 1)
  return { start, end }
}

/**
 * 计算从某天开始的连续天数
 * 向前追溯直到遇到中断（没有打卡记录的日期）
 */
async function calcStreak(userId: number, fromDate: Date): Promise<number> {
  let streak = 0
  const cursor = new Date(fromDate)

  while (true) {
    // 当天 00:00:00 ~ 23:59:59
    const dayStart = new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate())
    const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000 - 1)

    const count = await prisma.checkin.count({
      where: {
        userId,
        date: { gte: dayStart, lte: dayEnd },
      },
    })

    if (count === 0) break

    streak++
    cursor.setDate(cursor.getDate() - 1)
  }

  return streak
}

/**
 * 检查并发放新徽章
 * 在打卡/创建任务/完成分析后调用
 * 返回本次新获得的徽章列表
 */
export async function checkAndAwardBadges(userId: number): Promise<Badge[]> {
  const newBadges: Badge[] = []

  // 获取用户已有徽章名称集合（避免重复发放）
  const existingBadges = await prisma.badge.findMany({
    where: { userId },
    select: { name: true },
  })
  const existingNames = new Set(existingBadges.map((b) => b.name))

  // 获取用户统计数据
  const totalCheckins = await prisma.checkin.count({ where: { userId } })
  const totalTasks = await prisma.task.count({ where: { userId } })
  const totalAnalyses = await prisma.analysis.count({
    where: { task: { userId } },
  })

  // 计算当前连续天数（基于今天）
  const { start: todayStart } = getTodayRange()
  const todayCheckedIn = await prisma.checkin.count({
    where: { userId, date: { gte: todayStart } },
  }) > 0

  const streak = todayCheckedIn ? await calcStreak(userId, new Date()) : 0

  // 徽章判定规则
  const conditions: Array<{ key: string; rule: typeof BADGE_RULES[keyof typeof BADGE_RULES]; met: boolean }> = [
    { key: 'FIRST_CHECKIN', rule: BADGE_RULES.FIRST_CHECKIN, met: totalCheckins >= 1 },
    { key: 'STREAK_3', rule: BADGE_RULES.STREAK_3, met: streak >= 3 },
    { key: 'STREAK_7', rule: BADGE_RULES.STREAK_7, met: streak >= 7 },
    { key: 'STREAK_14', rule: BADGE_RULES.STREAK_14, met: streak >= 14 },
    { key: 'STREAK_30', rule: BADGE_RULES.STREAK_30, met: streak >= 30 },
    { key: 'TASK_10', rule: BADGE_RULES.TASK_10, met: totalTasks >= 10 },
    { key: 'ANALYSIS_5', rule: BADGE_RULES.ANALYSIS_5, met: totalAnalyses >= 5 },
  ]

  for (const { key, rule, met } of conditions) {
    if (met && !existingNames.has(rule.name)) {
      const badge = await prisma.badge.create({
        data: {
          userId,
          name: rule.name,
          icon: rule.icon,
          condition: rule.condition,
        },
      })
      newBadges.push({
        id: badge.id,
        userId: badge.userId,
        name: badge.name,
        icon: badge.icon,
        condition: badge.condition,
        earnedAt: badge.earnedAt,
      })
      logger.info(`🎖️ 用户 ${userId} 获得新徽章: ${rule.name}`)
    }
  }

  return newBadges
}

/**
 * 执行每日打卡
 * - 一天只能打卡一次（同一天再次打卡返回已有记录）
 * - 打卡后自动更新 User.checkinStreak
 * - 自动检查并发放新徽章
 *
 * @returns 打卡记录 + 连续天数 + 新徽章
 */
export async function doCheckin(
  userId: number,
  action: string,
): Promise<{ checkin: Checkin; streak: number; newBadges: Badge[] }> {
  const { start, end } = getTodayRange()

  // 1. 检查今天是否已打卡
  const existing = await prisma.checkin.findFirst({
    where: {
      userId,
      date: { gte: start, lte: end },
    },
  })

  if (existing) {
    // 已打卡：返回已有记录，不重复创建
    const streak = await calcStreak(userId, new Date())
    logger.info(`用户 ${userId} 今天已打卡，返回已有记录`)
    return {
      checkin: {
        id: existing.id,
        userId: existing.userId,
        action: existing.action,
        date: existing.date,
      },
      streak,
      newBadges: [], // 已打卡不重复检查徽章
    }
  }

  // 2. 创建打卡记录
  const checkin = await prisma.checkin.create({
    data: { userId, action },
  })

  // 3. 计算连续天数
  const streak = await calcStreak(userId, new Date())

  // 4. 更新用户连续天数
  await prisma.user.update({
    where: { id: userId },
    data: { checkinStreak: streak },
  })

  // 5. 检查并发放新徽章
  const newBadges = await checkAndAwardBadges(userId)

  logger.info(`用户 ${userId} 打卡成功: action="${action}", streak=${streak}, newBadges=${newBadges.length}`)

  return {
    checkin: {
      id: checkin.id,
      userId: checkin.userId,
      action: checkin.action,
      date: checkin.date,
    },
    streak,
    newBadges,
  }
}

/**
 * 获取打卡历史记录
 * @param month - 可选，YYYY-MM 格式，仅查询指定月份
 */
export async function getCheckinHistory(
  userId: number,
  month?: string,
): Promise<Checkin[]> {
  const where: any = { userId }

  if (month) {
    const [year, mon] = month.split('-').map(Number)
    const start = new Date(year, mon - 1, 1)
    const end = new Date(year, mon, 0, 23, 59, 59)
    where.date = { gte: start, lte: end }
  }

  const records = await prisma.checkin.findMany({
    where,
    orderBy: { date: 'desc' },
  })

  return records.map((r) => ({
    id: r.id,
    userId: r.userId,
    action: r.action,
    date: r.date,
  }))
}

/**
 * 获取用户当前连续打卡天数
 */
export async function getCheckinStreak(userId: number): Promise<number> {
  const { start: todayStart } = getTodayRange()

  // 检查今天是否已打卡
  const todayCount = await prisma.checkin.count({
    where: { userId, date: { gte: todayStart } },
  })

  if (todayCount === 0) {
    // 今天未打卡：从昨天开始计算连续天数
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    return calcStreak(userId, yesterday)
  }

  return calcStreak(userId, new Date())
}

/**
 * 获取用户已获得的徽章列表
 */
export async function getBadges(userId: number): Promise<Badge[]> {
  const badges = await prisma.badge.findMany({
    where: { userId },
    orderBy: { earnedAt: 'desc' },
  })

  return badges.map((b) => ({
    id: b.id,
    userId: b.userId,
    name: b.name,
    icon: b.icon,
    condition: b.condition,
    earnedAt: b.earnedAt,
  }))
}

/**
 * 获取徽章规则及用户进度（供前端徽章墙使用）
 * 返回所有 7 枚预设徽章，每枚包含 earned 状态 + progress 进度
 */
export async function getBadgeRulesWithProgress(userId: number) {
  // 获取用户已有徽章（含 id / earnedAt / name 等完整信息）
  const existingBadges = await prisma.badge.findMany({
    where: { userId },
  })
  const earnedByName = new Map(
    existingBadges.map((b) => [b.name, b])
  )

  // 获取用户统计数据（用于计算进度）
  const totalCheckins = await prisma.checkin.count({ where: { userId } })
  const totalTasks = await prisma.task.count({ where: { userId } })
  const totalAnalyses = await prisma.analysis.count({
    where: { task: { userId } },
  })
  const streak = await getCheckinStreak(userId)

  const RULES = [
    { rule: BADGE_RULES.FIRST_CHECKIN, met: totalCheckins >= 1, progress: { current: Math.min(totalCheckins, 1), target: 1 } },
    { rule: BADGE_RULES.STREAK_3, met: streak >= 3, progress: { current: Math.min(streak, 3), target: 3 } },
    { rule: BADGE_RULES.STREAK_7, met: streak >= 7, progress: { current: Math.min(streak, 7), target: 7 } },
    { rule: BADGE_RULES.STREAK_14, met: streak >= 14, progress: { current: Math.min(streak, 14), target: 14 } },
    { rule: BADGE_RULES.STREAK_30, met: streak >= 30, progress: { current: Math.min(streak, 30), target: 30 } },
    { rule: BADGE_RULES.TASK_10, met: totalTasks >= 10, progress: { current: Math.min(totalTasks, 10), target: 10 } },
    { rule: BADGE_RULES.ANALYSIS_5, met: totalAnalyses >= 5, progress: { current: Math.min(totalAnalyses, 5), target: 5 } },
  ]

  // 返回所有预设徽章，附带 earned + progress + 真实 DB 中的 id / earnedAt
  return RULES.map(({ rule, met, progress }) => {
    const dbBadge = earnedByName.get(rule.name)
    return {
      id: dbBadge?.id ?? null,
      name: rule.name,
      icon: rule.icon,
      condition: rule.condition,
      earned: met,
      earnedAt: dbBadge?.earnedAt ?? null,
      progress,
    }
  })
}

/**
 * 获取打卡状态概览（供仪表盘使用）
 */
export async function getCheckinStatus(userId: number): Promise<CheckinStatus> {
  const { start: todayStart } = getTodayRange()

  const todayCount = await prisma.checkin.count({
    where: { userId, date: { gte: todayStart } },
  })

  const totalCheckins = await prisma.checkin.count({ where: { userId } })
  const streak = await getCheckinStreak(userId)
  const badges = await getBadges(userId)

  return {
    todayCheckedIn: todayCount > 0,
    streak,
    totalCheckins,
    badges,
  }
}

/**
 * 获取打卡日历数据（月视图）
 * 返回指定月份中每天的打卡信息
 *
 * @returns 该月每天打卡的 actions 数组，key 为 YYYY-MM-DD
 */
export async function getCalendarData(
  userId: number,
  year: number,
  month: number,
): Promise<Record<string, string[]>> {
  const start = new Date(year, month - 1, 1)
  const end = new Date(year, month, 0, 23, 59, 59)

  const records = await prisma.checkin.findMany({
    where: {
      userId,
      date: { gte: start, lte: end },
    },
    orderBy: { date: 'asc' },
  })

  const calendar: Record<string, string[]> = {}

  for (const r of records) {
    const key = r.date.toISOString().slice(0, 10) // YYYY-MM-DD
    if (!calendar[key]) calendar[key] = []
    calendar[key].push(r.action)
  }

  return calendar
}
