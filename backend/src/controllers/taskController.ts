/**
 * 任务控制器
 * 处理任务 CRUD 的 HTTP 请求
 */
import { Request, Response, NextFunction } from 'express'
import * as taskService from '../services/taskService'
import { success, error } from '../utils/response'
import logger from '../utils/logger'

/**
 * POST /api/tasks
 * 创建任务（自动补全天气和学期阶段）
 */
export async function createTask(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId
    const { title, reason, emotion } = req.body

    logger.info(`创建任务: userId=${userId}, title="${title}"`)

    const task = await taskService.createTask(userId, { title, reason, emotion })

    success(res, task, '任务创建成功', 201)
  } catch (err) {
    next(err)
  }
}

/**
 * GET /api/tasks
 * 获取任务列表（可选 startDate / endDate / limit 查询参数）
 */
export async function getTasks(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId

    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50

    const tasks = await taskService.getTasks(userId, { startDate, endDate, limit })

    success(res, tasks, `共 ${tasks.length} 条任务`)
  } catch (err) {
    next(err)
  }
}

/**
 * GET /api/tasks/:id
 * 获取单个任务详情（含分析结果）
 */
export async function getTaskById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId
    const taskId = parseInt(req.params.id, 10)

    if (isNaN(taskId)) {
      error(res, '无效的任务 ID', 400)
      return
    }

    const task = await taskService.getTaskById(userId, taskId)

    if (!task) {
      error(res, '任务不存在', 404, 404)
      return
    }

    success(res, task)
  } catch (err) {
    next(err)
  }
}

/**
 * DELETE /api/tasks/:id
 * 删除任务（仅所有者可删）
 */
export async function deleteTask(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId
    const taskId = parseInt(req.params.id, 10)

    if (isNaN(taskId)) {
      error(res, '无效的任务 ID', 400)
      return
    }

    const deleted = await taskService.deleteTask(userId, taskId)

    if (!deleted) {
      error(res, '任务不存在或无权删除', 404, 404)
      return
    }

    success(res, null, '任务已删除')
  } catch (err) {
    next(err)
  }
}
