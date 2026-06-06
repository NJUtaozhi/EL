/**
 * Intervention 服务单元测试
 *
 * 测试范围：
 *   - generateIntervention: 生成个性化干预方案
 *   - getPresetStrategy: 预设策略查询
 *   - getAllStrategies: 全部策略摘要
 *   - 类型校验：有效/无效拖延类型
 *   - JSON 解析：干预方案结果解析
 */
import { describe, it, expect, vi } from 'vitest'
import { mockPrisma } from './setup'
import { buildMockLLMResponse, buildInterventionJSON } from './helpers'
import * as llmService from '../src/services/llmService'

import * as interventionService from '../src/services/interventionService'

describe('interventionService', () => {
  // ─── generateIntervention ──────────────────────────────────
  describe('generateIntervention', () => {
    it('应为有效拖延类型生成个性化干预方案', async () => {
      // 用户画像数据
      mockPrisma.task.count.mockResolvedValue(15)
      mockPrisma.analysis.findMany.mockResolvedValue([
        { type: '畏难型' },
        { type: '焦虑型' },
        { type: '畏难型' },
      ])
      mockPrisma.checkin.findMany.mockResolvedValue([
        { action: '完成了番茄钟' },
        { action: '早起跑步' },
      ])
      // 情绪数据
      mockPrisma.task.findMany.mockResolvedValue([
        { emotion: '焦虑' },
        { emotion: '沮丧' },
        { emotion: '焦虑' },
      ])
      // LLM 返回
      vi.mocked(llmService.singlePrompt).mockResolvedValue(
        buildMockLLMResponse(buildInterventionJSON()),
      )

      const result = await interventionService.generateIntervention(1, {
        procrastinationType: '焦虑型',
        taskTitle: '准备期末考试',
        userId: 1,
      })

      expect(result.type).toBe('焦虑型')
      expect(result.strategy).toBe('认知重构法')
      expect(result.steps).toHaveLength(3)
      expect(result.encouragement).toBeTruthy()
      expect(result.tip).toBeTruthy()
      expect(result.baseStrategy).toBeDefined()
    })

    it('应抛出 400 当拖延类型无效时', async () => {
      await expect(
        interventionService.generateIntervention(1, {
          procrastinationType: '无效类型',
          userId: 1,
        }),
      ).rejects.toMatchObject({
        statusCode: 400,
      })
    })

    it('应为贪玩型生成番茄工作法方案', async () => {
      mockPrisma.task.count.mockResolvedValue(5)
      mockPrisma.analysis.findMany.mockResolvedValue([{ type: '贪玩型' }])
      mockPrisma.checkin.findMany.mockResolvedValue([])
      mockPrisma.task.findMany.mockResolvedValue([])
      vi.mocked(llmService.singlePrompt).mockResolvedValue(
        buildMockLLMResponse(
          buildInterventionJSON({
            type: '贪玩型',
            strategy: '番茄工作法',
            title: '用番茄钟战胜手机诱惑',
            steps: [
              '第1步：将手机放在另一个房间，设置25分钟番茄钟',
              '第2步：专注学习直到番茄钟响，中间不碰手机',
              '第3步：休息5分钟时做几个深呼吸或走动，再看手机',
            ],
            encouragement: '每次抵抗诱惑都是在训练你的意志力肌肉。',
            tip: '试试 Forest App 种树，离开页面树会枯萎',
          }),
        ),
      )

      const result = await interventionService.generateIntervention(1, {
        procrastinationType: '贪玩型',
        userId: 1,
      })

      expect(result.type).toBe('贪玩型')
      expect(result.strategy).toBe('番茄工作法')
      expect(result.steps.length).toBe(3)
    })

    it('应抛出 502 当 LLM 返回无法解析的内容', async () => {
      mockPrisma.task.count.mockResolvedValue(3)
      mockPrisma.analysis.findMany.mockResolvedValue([{ type: '焦虑型' }])
      mockPrisma.checkin.findMany.mockResolvedValue([])
      mockPrisma.task.findMany.mockResolvedValue([])
      vi.mocked(llmService.singlePrompt).mockResolvedValue(
        buildMockLLMResponse('无法生成建议，请稍后重试'),
      )

      await expect(
        interventionService.generateIntervention(1, {
          procrastinationType: '焦虑型',
          userId: 1,
        }),
      ).rejects.toMatchObject({
        statusCode: 502,
      })
    })
  })

  // ─── getPresetStrategy ──────────────────────────────────
  describe('getPresetStrategy', () => {
    it('应返回有效类型的预设策略', () => {
      const result = interventionService.getPresetStrategy('畏难型')

      expect(result.isValid).toBe(true)
      expect(result.type).toBe('畏难型')
      expect(result.baseStrategy).toContain('任务拆分法')
    })

    it('应返回 5 种类型全部', () => {
      const types = ['畏难型', '焦虑型', '贪玩型', '无规划型', '完美主义型']
      for (const type of types) {
        const result = interventionService.getPresetStrategy(type)
        expect(result.isValid).toBe(true)
      }
    })

    it('应返回 isValid=false 当类型无效时', () => {
      const result = interventionService.getPresetStrategy('不知道型')

      expect(result.isValid).toBe(false)
      expect(result.baseStrategy).toBe('')
    })
  })

  // ─── getAllStrategies ──────────────────────────────────
  describe('getAllStrategies', () => {
    it('应返回全部 5 种类型的策略摘要', () => {
      const strategies = interventionService.getAllStrategies()

      expect(strategies).toHaveLength(5)
      expect(strategies.map((s) => s.type)).toContain('畏难型')
      expect(strategies.map((s) => s.type)).toContain('完美主义型')

      // 每种类型都有对应的策略描述
      for (const s of strategies) {
        expect(s.strategy).toBeTruthy()
      }
    })
  })
})
