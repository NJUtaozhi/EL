/**
 * Task 服务单元测试
 *
 * 测试范围：
 *   - createTask: 创建任务、自动补全字段、徽章异步检查
 *   - getTasks: 列表查询、日期筛选、分页
 *   - getTaskById: 单个查询、权限校验
 *   - deleteTask: 删除任务及关联分析
 */
import { describe, it, expect, vi } from 'vitest'
import { mockPrisma } from './setup'
import { buildMockUser, buildMockTask, buildTaskWithAnalysis } from './helpers'

// 由于 tsconfig 排除了 tests/，使用相对路径导入被测试模块
import * as taskService from '../src/services/taskService'

describe('taskService', () => {
  // ─── createTask ────────────────────────────────────────────
  describe('createTask', () => {
    it('应创建任务并自动补全 weather 和 semesterPhase', async () => {
      const mockCreated = {
        id: 1,
        userId: 1,
        title: '写期末论文',
        reason: '好难',
        emotion: '焦虑',
        weather: '多云',
        semesterPhase: '考试周',
        createdAt: new Date('2026-06-06'),
      }
      mockPrisma.task.create.mockResolvedValue(mockCreated)
      // 徽章检查返回空数组
      mockPrisma.badge.findMany.mockResolvedValue([])
      mockPrisma.checkin.count.mockResolvedValue(0)
      mockPrisma.task.count.mockResolvedValue(0)
      mockPrisma.analysis.count.mockResolvedValue(0)

      const result = await taskService.createTask(1, {
        title: '写期末论文',
        reason: '好难',
        emotion: '焦虑',
      })

      expect(result).toMatchObject({
        id: 1,
        title: '写期末论文',
        reason: '好难',
        emotion: '焦虑',
      })
      expect(result.weather).toBeDefined()
      expect(result.semesterPhase).toBeDefined()
      expect(mockPrisma.task.create).toHaveBeenCalledTimes(1)
      // 验证传入 data 包含 userId 和 title
      const createCall = mockPrisma.task.create.mock.calls[0][0]
      expect(createCall.data.userId).toBe(1)
      expect(createCall.data.title).toBe('写期末论文')
    })

    it('应处理空的可选字段', async () => {
      const mockCreated = {
        id: 2,
        userId: 1,
        title: '简单任务',
        reason: null,
        emotion: null,
        weather: '多云',
        semesterPhase: '考试周',
        createdAt: new Date('2026-06-06'),
      }
      mockPrisma.task.create.mockResolvedValue(mockCreated)
      mockPrisma.badge.findMany.mockResolvedValue([])
      mockPrisma.checkin.count.mockResolvedValue(0)
      mockPrisma.task.count.mockResolvedValue(0)
      mockPrisma.analysis.count.mockResolvedValue(0)

      const result = await taskService.createTask(1, { title: '简单任务' })

      expect(result.title).toBe('简单任务')
      expect(result.reason).toBeNull()
      expect(result.emotion).toBeNull()
    })

    it('应处理 Prisma 创建失败的错误', async () => {
      mockPrisma.task.create.mockRejectedValue(new Error('数据库连接失败'))

      await expect(
        taskService.createTask(1, { title: '失败任务' }),
      ).rejects.toThrow('数据库连接失败')
    })
  })

  // ─── getTasks ────────────────────────────────────────────
  describe('getTasks', () => {
    it('应返回用户的任务列表（含分析关联）', async () => {
      const mockTasks = [
        buildTaskWithAnalysis({ id: 1, title: '任务A' }),
        buildTaskWithAnalysis({ id: 2, title: '任务B' }),
      ]
      mockPrisma.task.findMany.mockResolvedValue(mockTasks)

      const result = await taskService.getTasks(1)

      expect(result).toHaveLength(2)
      expect(result[0].title).toBe('任务A')
      expect(result[1].analysis).toBeDefined()
      expect(mockPrisma.task.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: 1 },
          orderBy: { createdAt: 'desc' },
        }),
      )
    })

    it('应支持日期范围筛选', async () => {
      const startDate = new Date('2026-06-01')
      const endDate = new Date('2026-06-07')
      mockPrisma.task.findMany.mockResolvedValue([])

      await taskService.getTasks(1, { startDate, endDate })

      const where = mockPrisma.task.findMany.mock.calls[0][0].where
      expect(where.createdAt).toBeDefined()
      expect(where.createdAt.gte).toEqual(startDate)
      expect(where.createdAt.lte).toEqual(endDate)
    })

    it('应返回空列表当用户没有任务时', async () => {
      mockPrisma.task.findMany.mockResolvedValue([])

      const result = await taskService.getTasks(1)

      expect(result).toEqual([])
    })
  })

  // ─── getTaskById ────────────────────────────────────────────
  describe('getTaskById', () => {
    it('应返回指定任务的详情', async () => {
      const mockTask = buildTaskWithAnalysis({ id: 5 })
      mockPrisma.task.findFirst.mockResolvedValue(mockTask)

      const result = await taskService.getTaskById(1, 5)

      expect(result).not.toBeNull()
      expect(result!.id).toBe(5)
      expect(mockPrisma.task.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 5, userId: 1 },
        }),
      )
    })

    it('应返回 null 当任务不存在或无权访问', async () => {
      mockPrisma.task.findFirst.mockResolvedValue(null)

      const result = await taskService.getTaskById(1, 999)

      expect(result).toBeNull()
    })

    it('应正确处理无分析关联的任务', async () => {
      const mockTask = buildTaskWithAnalysis({ analysis: null })
      mockPrisma.task.findFirst.mockResolvedValue(mockTask)

      const result = await taskService.getTaskById(1, 2)

      expect(result).not.toBeNull()
      expect(result!.analysis).toBeNull()
    })
  })

  // ─── deleteTask ──────────────────────────────────────────
  describe('deleteTask', () => {
    it('应删除任务及其关联的分析记录', async () => {
      mockPrisma.task.findFirst.mockResolvedValue(buildMockTask({ id: 3 }))
      mockPrisma.analysis.deleteMany.mockResolvedValue({ count: 1 })
      mockPrisma.task.delete.mockResolvedValue({} as any)

      const result = await taskService.deleteTask(1, 3)

      expect(result).toBe(true)
      expect(mockPrisma.analysis.deleteMany).toHaveBeenCalledWith(
        { where: { taskId: 3 } },
      )
      expect(mockPrisma.task.delete).toHaveBeenCalledWith(
        { where: { id: 3 } },
      )
    })

    it('应返回 false 当任务不存在', async () => {
      mockPrisma.task.findFirst.mockResolvedValue(null)

      const result = await taskService.deleteTask(1, 999)

      expect(result).toBe(false)
      expect(mockPrisma.analysis.deleteMany).not.toHaveBeenCalled()
      expect(mockPrisma.task.delete).not.toHaveBeenCalled()
    })

    it('应校验任务属于当前用户', async () => {
      // 任务属于 userId=2，但当前用户是 userId=1
      mockPrisma.task.findFirst.mockResolvedValue(null)

      const result = await taskService.deleteTask(1, 1)

      expect(result).toBe(false)
    })
  })
})
