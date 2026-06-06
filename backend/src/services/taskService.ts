/**
 * 任务业务逻辑
 * 任务 CRUD + 自动补全天气/学期阶段
 */
import prisma from '../config/database'
import { SEMESTER_PHASES } from '../utils/constants'
import type { CreateTaskDTO, Task, TaskWithAnalysis } from '../models/Task'
import { checkAndAwardBadges } from './checkinService'

/**
 * 根据当前日期自动判断学期阶段
 * 简单规则：
 *   1-2月 → 假期
 *   3-5月 → 平时
 *   6-7月初 → 考试周
 *   7-8月 → 假期
 *   9-12月 → 平时
 */
function getCurrentSemesterPhase(): string {
  const month = new Date().getMonth() + 1 // 0-indexed
  if (month <= 2 || (month >= 7 && month <= 8)) return '假期'
  if (month === 6 || (month === 7 && new Date().getDate() <= 7)) return '考试周'
  if (month >= 3 && month <= 5) return '平时'
  if (month >= 9 && month <= 12) return '平时'
  // 其余月份默认
  if (month >= 3 && month <= 6) return '期中'
  return '平时'
}

/**
 * 自动补全天气（模拟：根据季节简单推断）
 * 实际项目中可接入天气 API
 */
function getCurrentWeather(): string {
  const month = new Date().getMonth() + 1
  if (month >= 6 && month <= 8) return '晴'
  if (month >= 3 && month <= 5) return '多云'
  if (month >= 9 && month <= 11) return '多云'
  return '阴'
}

/**
 * 创建任务
 * 自动补全 weather 和 semesterPhase
 */
export async function createTask(userId: number, dto: CreateTaskDTO): Promise<Task> {
  const task = await prisma.task.create({
    data: {
      userId,
      title: dto.title,
      reason: dto.reason ?? null,
      emotion: dto.emotion ?? null,
      weather: getCurrentWeather(),
      semesterPhase: getCurrentSemesterPhase(),
    },
  })

  // 异步检查徽章（不阻塞任务创建返回）
  checkAndAwardBadges(userId).catch(() => {})

  return {
    id: task.id,
    userId: task.userId,
    title: task.title,
    reason: task.reason,
    emotion: task.emotion,
    weather: task.weather,
    semesterPhase: task.semesterPhase,
    createdAt: task.createdAt,
  }
}

/**
 * 查询任务列表（按用户 + 可选日期范围）
 */
export async function getTasks(
  userId: number,
  options?: { startDate?: Date; endDate?: Date; limit?: number },
): Promise<TaskWithAnalysis[]> {
  const { startDate, endDate, limit = 50 } = options ?? {}

  const where: any = { userId }

  if (startDate || endDate) {
    where.createdAt = {}
    if (startDate) where.createdAt.gte = startDate
    if (endDate) where.createdAt.lte = endDate
  }

  const tasks = await prisma.task.findMany({
    where,
    include: {
      analysis: true,
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  })

  return tasks.map((t) => ({
    id: t.id,
    userId: t.userId,
    title: t.title,
    reason: t.reason,
    emotion: t.emotion,
    weather: t.weather,
    semesterPhase: t.semesterPhase,
    createdAt: t.createdAt,
    analysis: t.analysis
      ? {
          id: t.analysis.id,
          type: t.analysis.type,
          confidence: t.analysis.confidence,
          keywords: t.analysis.keywords,
          suggestion: t.analysis.suggestion,
          createdAt: t.analysis.createdAt,
        }
      : null,
  }))
}

/**
 * 根据 ID 获取单个任务（含分析结果）
 */
export async function getTaskById(userId: number, taskId: number): Promise<TaskWithAnalysis | null> {
  const task = await prisma.task.findFirst({
    where: { id: taskId, userId },
    include: { analysis: true },
  })

  if (!task) return null

  return {
    id: task.id,
    userId: task.userId,
    title: task.title,
    reason: task.reason,
    emotion: task.emotion,
    weather: task.weather,
    semesterPhase: task.semesterPhase,
    createdAt: task.createdAt,
    analysis: task.analysis
      ? {
          id: task.analysis.id,
          type: task.analysis.type,
          confidence: task.analysis.confidence,
          keywords: task.analysis.keywords,
          suggestion: task.analysis.suggestion,
          createdAt: task.analysis.createdAt,
        }
      : null,
  }
}

/**
 * 删除任务（仅所有者可删）
 */
export async function deleteTask(userId: number, taskId: number): Promise<boolean> {
  const task = await prisma.task.findFirst({
    where: { id: taskId, userId },
  })

  if (!task) return false

  // 先删除关联的分析记录
  await prisma.analysis.deleteMany({
    where: { taskId },
  })

  await prisma.task.delete({
    where: { id: taskId },
  })

  return true
}
