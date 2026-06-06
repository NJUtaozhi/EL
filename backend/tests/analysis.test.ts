/**
 * Analysis 服务单元测试
 *
 * 测试范围：
 *   - analyzeTask: 归因分析完整流程、缓存命中、强制刷新
 *   - JSON 解析容错：markdown 代码块、文本中嵌入 JSON、缺失字段
 *   - getAnalysisByTaskId: 查库获取
 *   - getUserAnalyses: 分页查询
 *   - getTypeDistribution: 类型分布统计
 */
import { describe, it, expect, vi } from 'vitest'
import { mockPrisma } from './setup'
import { buildMockTask, buildMockAnalysis, buildMockLLMResponse, buildAttributionJSON } from './helpers'
import * as llmService from '../src/services/llmService'

import * as analysisService from '../src/services/analysisService'

describe('analysisService', () => {
  // 基础测试数据
  const mockTask = buildMockTask()
  const mockAnalysis = buildMockAnalysis()
  const mockLLMResponse = buildMockLLMResponse(buildAttributionJSON())

  // ─── analyzeTask ─────────────────────────────────────────
  describe('analyzeTask', () => {
    it('应完成完整的归因分析流程：查任务→调 LLM→解析→存入 DB', async () => {
      // 任务存在且无已有分析（触发 LLM 调用）
      mockPrisma.task.findFirst.mockResolvedValue({
        ...mockTask,
        analysis: null,
      })
      // LLM 返回 JSON
      vi.mocked(llmService.singlePrompt).mockResolvedValue(mockLLMResponse)
      // DB 存储返回
      mockPrisma.analysis.upsert.mockResolvedValue(mockAnalysis)
      // 徽章检查 mock
      mockPrisma.badge.findMany.mockResolvedValue([])
      mockPrisma.checkin.count.mockResolvedValue(0)
      mockPrisma.analysis.count.mockResolvedValue(0)

      const result = await analysisService.analyzeTask(1, 1)

      expect(result).toMatchObject({
        taskId: 1,
        type: '焦虑型',
        suggestion: expect.any(String),
      })
      expect(result.confidence).toBeGreaterThanOrEqual(0)
      expect(result.confidence).toBeLessThanOrEqual(1)
      expect(llmService.singlePrompt).toHaveBeenCalledTimes(1)
      expect(mockPrisma.analysis.upsert).toHaveBeenCalledTimes(1)
    })

    it('应命中缓存：任务已有分析且非 forceRefresh 时直接返回', async () => {
      mockPrisma.task.findFirst.mockResolvedValue({
        ...mockTask,
        analysis: mockAnalysis,
      })

      const result = await analysisService.analyzeTask(1, 1)

      expect(result.type).toBe('焦虑型')
      expect(llmService.singlePrompt).not.toHaveBeenCalled()
    })

    it('forceRefresh=true 应跳过缓存重新分析', async () => {
      mockPrisma.task.findFirst.mockResolvedValue({
        ...mockTask,
        analysis: mockAnalysis,
      })
      vi.mocked(llmService.singlePrompt).mockResolvedValue(mockLLMResponse)
      mockPrisma.analysis.upsert.mockResolvedValue(mockAnalysis)
      mockPrisma.badge.findMany.mockResolvedValue([])
      mockPrisma.checkin.count.mockResolvedValue(0)
      mockPrisma.analysis.count.mockResolvedValue(0)

      await analysisService.analyzeTask(1, 1, { forceRefresh: true })

      expect(llmService.singlePrompt).toHaveBeenCalledTimes(1)
    })

    it('应抛出 404 当任务不存在或不属于当前用户', async () => {
      mockPrisma.task.findFirst.mockResolvedValue(null)

      await expect(
        analysisService.analyzeTask(1, 999),
      ).rejects.toMatchObject({
        message: '任务不存在或无权访问',
        statusCode: 404,
      })
    })

    it('应抛出 502 当 LLM 返回无法解析的内容', async () => {
      mockPrisma.task.findFirst.mockResolvedValue({
        ...mockTask,
        analysis: null,
      })
      vi.mocked(llmService.singlePrompt).mockResolvedValue(
        buildMockLLMResponse('不是JSON'),
      )

      await expect(
        analysisService.analyzeTask(1, 1),
      ).rejects.toMatchObject({
        statusCode: 502,
      })
    })
  })

  // ─── JSON 解析容错 ─────────────────────────────────────
  describe('JSON 解析容错', () => {
    it('应能解析被 markdown 代码块包裹的 JSON', async () => {
      mockPrisma.task.findFirst.mockResolvedValue({
        ...mockTask,
        analysis: null,
      })
      vi.mocked(llmService.singlePrompt).mockResolvedValue(
        buildMockLLMResponse('```json\n' + buildAttributionJSON() + '\n```'),
      )
      mockPrisma.analysis.upsert.mockResolvedValue(mockAnalysis)
      mockPrisma.badge.findMany.mockResolvedValue([])
      mockPrisma.checkin.count.mockResolvedValue(0)
      mockPrisma.analysis.count.mockResolvedValue(0)

      const result = await analysisService.analyzeTask(1, 1)

      expect(result.type).toBe('焦虑型')
    })

    it('应能解析文本中嵌入的 JSON 对象', async () => {
      mockPrisma.task.findFirst.mockResolvedValue({
        ...mockTask,
        analysis: null,
      })
      vi.mocked(llmService.singlePrompt).mockResolvedValue(
        buildMockLLMResponse(
          '分析结果如下：\n' + buildAttributionJSON() + '\n请查看。',
        ),
      )
      mockPrisma.analysis.upsert.mockResolvedValue(mockAnalysis)
      mockPrisma.badge.findMany.mockResolvedValue([])
      mockPrisma.checkin.count.mockResolvedValue(0)
      mockPrisma.analysis.count.mockResolvedValue(0)

      const result = await analysisService.analyzeTask(1, 1)

      expect(result.type).toBe('焦虑型')
    })

    it('应钳制 confidence 到 [0, 1] 范围', async () => {
      mockPrisma.task.findFirst.mockResolvedValue({
        ...mockTask,
        analysis: null,
      })
      vi.mocked(llmService.singlePrompt).mockResolvedValue(
        buildMockLLMResponse(buildAttributionJSON({ confidence: 1.5 })),
      )
      mockPrisma.analysis.upsert.mockResolvedValue({
        ...mockAnalysis,
        confidence: 1.0,
        keywords: '["担心","做不好"]',
      })
      mockPrisma.badge.findMany.mockResolvedValue([])
      mockPrisma.checkin.count.mockResolvedValue(0)
      mockPrisma.analysis.count.mockResolvedValue(0)

      const result = await analysisService.analyzeTask(1, 1)

      expect(result.confidence).toBe(1.0)
    })

    it('应限制 keywords 最多 4 个', async () => {
      mockPrisma.task.findFirst.mockResolvedValue({
        ...mockTask,
        analysis: null,
      })
      const manyKeywords = buildAttributionJSON({
        keywords: ['a', 'b', 'c', 'd', 'e', 'f'],
      })
      vi.mocked(llmService.singlePrompt).mockResolvedValue(
        buildMockLLMResponse(manyKeywords),
      )
      mockPrisma.analysis.upsert.mockResolvedValue({
        ...mockAnalysis,
        keywords: JSON.stringify(['a', 'b', 'c', 'd']),
      })
      mockPrisma.badge.findMany.mockResolvedValue([])
      mockPrisma.checkin.count.mockResolvedValue(0)
      mockPrisma.analysis.count.mockResolvedValue(0)

      const result = await analysisService.analyzeTask(1, 1)

      expect(result.keywords.length).toBeLessThanOrEqual(4)
    })
  })

  // ─── getAnalysisByTaskId ─────────────────────────────────
  describe('getAnalysisByTaskId', () => {
    it('应返回已存储的分析结果', async () => {
      mockPrisma.task.findFirst.mockResolvedValue({
        ...mockTask,
        analysis: mockAnalysis,
      })

      const result = await analysisService.getAnalysisByTaskId(1, 1)

      expect(result).not.toBeNull()
      expect(result!.type).toBe('焦虑型')
    })

    it('应返回 null 当任务未分析', async () => {
      mockPrisma.task.findFirst.mockResolvedValue({
        ...mockTask,
        analysis: null,
      })

      const result = await analysisService.getAnalysisByTaskId(1, 1)

      expect(result).toBeNull()
    })

    it('应抛出 404 当任务不存在', async () => {
      mockPrisma.task.findFirst.mockResolvedValue(null)

      await expect(
        analysisService.getAnalysisByTaskId(1, 999),
      ).rejects.toMatchObject({
        statusCode: 404,
      })
    })
  })

  // ─── getUserAnalyses ────────────────────────────────────
  describe('getUserAnalyses', () => {
    it('应返回用户分析记录列表（含任务关联）', async () => {
      const mockAnalyses = [
        {
          ...mockAnalysis,
          id: 1,
          task: { id: 1, title: '任务A', reason: '好难', emotion: '焦虑', createdAt: new Date() },
        },
        {
          ...mockAnalysis,
          id: 2,
          type: '畏难型',
          task: { id: 2, title: '任务B', reason: '太多', emotion: '沮丧', createdAt: new Date() },
        },
      ]
      mockPrisma.analysis.findMany.mockResolvedValue(mockAnalyses)

      const result = await analysisService.getUserAnalyses(1, { limit: 10, offset: 0 })

      expect(result).toHaveLength(2)
      expect(result[0].task.title).toBe('任务A')
      expect(result[1].type).toBe('畏难型')
      expect(mockPrisma.analysis.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ take: 10, skip: 0 }),
      )
    })

    it('应使用默认分页参数', async () => {
      mockPrisma.analysis.findMany.mockResolvedValue([])

      await analysisService.getUserAnalyses(1)

      expect(mockPrisma.analysis.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ take: 20, skip: 0 }),
      )
    })
  })

  // ─── getTypeDistribution ─────────────────────────────────
  describe('getTypeDistribution', () => {
    it('应统计各拖延类型数量', async () => {
      mockPrisma.analysis.findMany.mockResolvedValue([
        { type: '焦虑型' },
        { type: '焦虑型' },
        { type: '畏难型' },
        { type: '贪玩型' },
      ])

      const result = await analysisService.getTypeDistribution(1)

      expect(result).toEqual({
        '焦虑型': 2,
        '畏难型': 1,
        '贪玩型': 1,
      })
    })

    it('应返回空对象当用户无分析记录', async () => {
      mockPrisma.analysis.findMany.mockResolvedValue([])

      const result = await analysisService.getTypeDistribution(1)

      expect(result).toEqual({})
    })
  })
})
