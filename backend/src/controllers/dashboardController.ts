/**
 * 仪表盘控制器（第4周实现）
 * 提供前端 Home 和 Profile 页面所需的聚合数据
 */
import { Request, Response, NextFunction } from 'express'
import * as dashboardService from '../services/dashboardService'
import { success } from '../utils/response'

/**
 * GET /api/dashboard
 * 获取仪表盘完整聚合数据（Home + Profile 页面共用）
 */
export async function getDashboard(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId
    const data = await dashboardService.getDashboardData(userId)
    success(res, data)
  } catch (err) {
    next(err)
  }
}

/**
 * GET /api/dashboard/overview
 * 获取首页轻量概览数据
 */
export async function getOverview(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId
    const data = await dashboardService.getOverview(userId)
    success(res, data)
  } catch (err) {
    next(err)
  }
}
