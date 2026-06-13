/**
 * 打卡控制器（第4周完整实现）
 * 处理打卡、连续天数、徽章、日历等 HTTP 请求
 */
import { Request, Response, NextFunction } from 'express'
import * as checkinService from '../services/checkinService'
import { success, error } from '../utils/response'
import logger from '../utils/logger'

/**
 * POST /api/checkin
 * 执行每日打卡
 * Body: { action: string }
 *
 * 返回：打卡记录 + 连续天数 + 新获得的徽章
 */
export async function doCheckin(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId
    const { action } = req.body

    if (!action || typeof action !== 'string') {
      error(res, '请提供打卡内容（action）', 400)
      return
    }

    logger.info(`用户 ${userId} 打卡: action="${action}"`)

    const result = await checkinService.doCheckin(userId, action)

    const message = result.newBadges.length > 0
      ? `打卡成功！获得 ${result.newBadges.length} 枚新徽章 🎉`
      : '打卡成功'

    success(res, {
      id: result.checkin.id,
      action: result.checkin.action,
      date: result.checkin.date,
      streak: result.streak,
      newBadges: result.newBadges,
    }, message, 201)
  } catch (err) {
    next(err)
  }
}

/**
 * GET /api/checkin/history
 * 获取打卡历史记录
 * Query: month? (YYYY-MM 格式)
 */
export async function getHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId
    const month = req.query.month as string | undefined

    const records = await checkinService.getCheckinHistory(userId, month)

    success(res, records, `共 ${records.length} 条打卡记录`)
  } catch (err) {
    next(err)
  }
}

/**
 * GET /api/checkin/streak
 * 获取当前连续打卡天数
 */
export async function getStreak(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId
    const streak = await checkinService.getCheckinStreak(userId)
    success(res, { streak })
  } catch (err) {
    next(err)
  }
}

/**
 * GET /api/checkin/badge-rules
 * 获取全部徽章规则及当前用户的进度（供前端徽章墙使用）
 */
export async function getBadgeRules(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId
    const rules = await checkinService.getBadgeRulesWithProgress(userId)
    success(res, rules)
  } catch (err) {
    next(err)
  }
}

/**
 * GET /api/checkin/badges
 * 获取用户已获得的徽章列表
 */
export async function getBadges(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId
    const badges = await checkinService.getBadges(userId)
    success(res, badges, `共 ${badges.length} 枚徽章`)
  } catch (err) {
    next(err)
  }
}

/**
 * GET /api/checkin/status
 * 获取今日打卡状态概览（供仪表盘使用）
 * 返回：todayCheckedIn / streak / totalCheckins / badges
 */
export async function getStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId
    const status = await checkinService.getCheckinStatus(userId)
    success(res, status)
  } catch (err) {
    next(err)
  }
}

/**
 * GET /api/checkin/calendar
 * 获取指定月份的打卡日历数据
 * Query: year, month (必填)
 */
export async function getCalendar(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId
    const year = parseInt(req.query.year as string, 10)
    const month = parseInt(req.query.month as string, 10)

    if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
      error(res, '请提供有效的 year 和 month 参数', 400)
      return
    }

    const data = await checkinService.getCalendarData(userId, year, month)
    success(res, data)
  } catch (err) {
    next(err)
  }
}
