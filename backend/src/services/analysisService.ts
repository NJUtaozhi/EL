/**
 * 归因分析服务（第3周核心实现）
 *
 * 核心流程：
 *   1. 根据 taskId 获取任务信息（标题 + 拖延理由 + 情绪标签）
 *   2. 组装 System Prompt（拖延心理学专家角色） + User Prompt（具体任务描述）
 *   3. 调 DeepSeek API 进行归因分析（带 JSON 结构化输出）
 *   4. 解析 LLM 返回的 JSON 结果
 *   5. 存入数据库 Analysis 表（幂等：已存在则更新）
 *   6. 返回归因结果给前端
 */
import prisma from '../config/database'
import { singlePrompt } from './llmService'
import { llmConfig } from '../config/llm'
import type { AttributionResult, AnalysisWithTask } from '../models/Analysis'
import { checkAndAwardBadges } from './checkinService'
import logger from '../utils/logger'

/**
 * 归因分析 System Prompt
 * 精心设计的 Prompt 模板，确保 LLM 返回高质量的归因分析
 */
const ATTRIBUTION_SYSTEM_PROMPT = `你是一位专业的拖延心理学专家，精通认知行为疗法和时间管理理论。你的任务是分析用户的拖延日志，判断其拖延类型并提供专业建议。

## 拖延类型定义

1. **畏难型**：因任务难度大或数量多而产生畏难情绪，害怕失败，用拖延来逃避压力。
   特征关键词：太难了、做不完、不会做、怕做不好、任务太多

2. **焦虑型**：对任务结果过度担忧，反复思考负面可能的后果，无法集中注意力。
   特征关键词：担心、紧张、怕出错、万一失败、别人怎么看我

3. **贪玩型**：被娱乐活动（手机、游戏、视频等）分散注意力，缺乏自我控制力。
   特征关键词：玩手机、刷视频、打游戏、不想动、没意思、等会儿再做

4. **无规划型**：缺乏时间管理能力，不知从何开始，没有明确计划和优先级。
   特征关键词：不知道先做什么、没计划、忘了、来不及、一下子太多事、混乱

5. **完美主义型**：过度追求完美，总觉准备不足，陷入无限准备的循环中。
   特征关键词：还没准备好、不够完美、再想想、等状态好了、先整理清楚

## 输出要求

请严格以 JSON 格式返回分析结果，格式如下：
{
  "type": "畏难型",          // 拖延类型（5选1）
  "confidence": 0.85,       // 置信度（0.0 ~ 1.0）
  "keywords": ["太难了", "做不完"],  // 提取 2-4 个关键词
  "suggestion": "建议将任务拆分为..."  // 50-100字的具体可操作建议
}

## 分析原则
- 优先根据用户描述的"拖延理由"判断类型，其次参考任务名和情绪
- confidence 反映判断的确定程度（理由越明确，置信度越高）
- suggestion 必须具体、可操作，针对该类型给出差异化建议
- 关键词从用户原文中提取，不要编造`;

/**
 * 从 LLM 返回的文本中解析 JSON
 * 处理 LLM 可能包裹 markdown 代码块的情况
 */
function parseAnalysisJSON(raw: string): { type: string; confidence: number; keywords: string[]; suggestion: string } {
  // 尝试直接解析
  let cleaned = raw.trim()

  // 移除可能的 markdown 代码块包裹
  const codeBlockMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (codeBlockMatch) {
    cleaned = codeBlockMatch[1].trim()
  }

  // 尝试提取第一个 JSON 对象
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/)
  if (jsonMatch) {
    cleaned = jsonMatch[0]
  }

  const parsed = JSON.parse(cleaned)

  // 校验必填字段
  if (!parsed.type || typeof parsed.type !== 'string') {
    throw new Error('LLM 返回缺少有效的 type 字段')
  }
  if (typeof parsed.confidence !== 'number') {
    parsed.confidence = 0.5
  }
  if (!Array.isArray(parsed.keywords)) {
    parsed.keywords = []
  }
  if (typeof parsed.suggestion !== 'string') {
    parsed.suggestion = '暂无建议'
  }

  return {
    type: parsed.type,
    confidence: Math.min(1, Math.max(0, parsed.confidence)), // 钳制到 [0, 1]
    keywords: parsed.keywords.slice(0, 4), // 最多 4 个关键词
    suggestion: parsed.suggestion.slice(0, 200), // 最长 200 字
  }
}

/**
 * 构造 User Prompt
 * 将任务信息格式化为便于 LLM 理解的自然语言
 */
function buildUserPrompt(task: {
  title: string
  reason: string | null
  emotion: string | null
  semesterPhase: string | null
}): string {
  const parts: string[] = []

  parts.push(`【任务名称】${task.title}`)

  if (task.reason) {
    parts.push(`【拖延理由】${task.reason}`)
  } else {
    parts.push(`【拖延理由】未提供（请仅根据任务名称判断）`)
  }

  if (task.emotion) {
    parts.push(`【当前情绪】${task.emotion}`)
  }

  if (task.semesterPhase) {
    parts.push(`【学期阶段】${task.semesterPhase}`)
  }

  parts.push(`\n请根据以上信息进行拖延归因分析，返回 JSON 格式结果。`)

  return parts.join('\n')
}

/**
 * 提交任务进行归因分析（核心方法）
 *
 * 幂等设计：如果该任务已有分析结果，则基于已有 prompt 重新分析并更新
 * 如果已存在则跳过 LLM 调用直接返回缓存（可通过 forceRefresh 强制刷新）
 */
export async function analyzeTask(
  userId: number,
  taskId: number,
  options?: { forceRefresh?: boolean },
): Promise<AttributionResult> {
  // 1. 获取任务，同时校验归属
  const task = await prisma.task.findFirst({
    where: { id: taskId, userId },
    include: { analysis: true },
  })

  if (!task) {
    throw Object.assign(new Error('任务不存在或无权访问'), { statusCode: 404 })
  }

  // 2. 如果已有分析且不强制刷新，直接返回
  if (task.analysis && !options?.forceRefresh) {
    logger.info(`归因分析命中缓存: taskId=${taskId}`)
    return {
      id: task.analysis.id,
      taskId: task.id,
      type: task.analysis.type,
      confidence: task.analysis.confidence,
      keywords: JSON.parse(task.analysis.keywords ?? '[]'),
      suggestion: task.analysis.suggestion ?? '',
      createdAt: task.analysis.createdAt,
    }
  }

  // 3. 构造 Prompt
  const userPrompt = buildUserPrompt({
    title: task.title,
    reason: task.reason,
    emotion: task.emotion,
    semesterPhase: task.semesterPhase,
  })

  logger.info(`开始归因分析: taskId=${taskId}, title="${task.title.slice(0, 30)}..."`)

  // 4. 调用 DeepSeek API（带 JSON 输出格式）
  const response = await singlePrompt(
    ATTRIBUTION_SYSTEM_PROMPT,
    userPrompt,
    {
      temperature: 0.5,   // 中等温度，平衡一致性和多样性
      maxTokens: 512,     // 足够返回 JSON 结果
      responseFormat: 'json_object',
    },
  )

  // 5. 解析 JSON 结果
  let result: { type: string; confidence: number; keywords: string[]; suggestion: string }
  try {
    result = parseAnalysisJSON(response.content)
    logger.info(`归因分析解析成功: type=${result.type}, confidence=${result.confidence}`)
  } catch (parseErr) {
    logger.error(`归因分析 JSON 解析失败: ${(parseErr as Error).message}, raw=${response.content.slice(0, 200)}`)
    throw Object.assign(
      new Error(`AI 返回结果解析失败，请稍后重试`),
      { statusCode: 502, cause: parseErr },
    )
  }

  // 6. 存入数据库（幂等：已存在则更新）
  const analysis = await prisma.analysis.upsert({
    where: { taskId },
    create: {
      taskId,
      type: result.type,
      confidence: result.confidence,
      keywords: JSON.stringify(result.keywords),
      suggestion: result.suggestion,
    },
    update: {
      type: result.type,
      confidence: result.confidence,
      keywords: JSON.stringify(result.keywords),
      suggestion: result.suggestion,
    },
  })

  logger.info(`归因分析存入数据库: analysisId=${analysis.id}, taskId=${taskId}`)

  // 异步检查徽章（不阻塞分析返回）
  checkAndAwardBadges(userId).catch(() => {})

  // 7. 返回结果
  return {
    id: analysis.id,
    taskId: analysis.taskId,
    type: analysis.type,
    confidence: analysis.confidence,
    keywords: JSON.parse(analysis.keywords ?? '[]'),
    suggestion: analysis.suggestion ?? '',
    createdAt: analysis.createdAt,
  }
}

/**
 * 根据 taskId 获取已有的分析结果
 * 不做新的 LLM 调用，仅从数据库读取
 */
export async function getAnalysisByTaskId(
  userId: number,
  taskId: number,
): Promise<AttributionResult | null> {
  const task = await prisma.task.findFirst({
    where: { id: taskId, userId },
    include: { analysis: true },
  })

  if (!task) {
    throw Object.assign(new Error('任务不存在或无权访问'), { statusCode: 404 })
  }

  if (!task.analysis) return null

  return {
    id: task.analysis.id,
    taskId: task.id,
    type: task.analysis.type,
    confidence: task.analysis.confidence,
    keywords: JSON.parse(task.analysis.keywords ?? '[]'),
    suggestion: task.analysis.suggestion ?? '',
    createdAt: task.analysis.createdAt,
  }
}

/**
 * 获取用户所有分析记录（按时间倒序）
 * 用于"拖延画像"页面的聚合展示
 */
export async function getUserAnalyses(
  userId: number,
  options?: { limit?: number; offset?: number },
): Promise<AnalysisWithTask[]> {
  const { limit = 20, offset = 0 } = options ?? {}

  const analyses = await prisma.analysis.findMany({
    where: {
      task: { userId },
    },
    include: {
      task: {
        select: {
          id: true,
          title: true,
          reason: true,
          emotion: true,
          createdAt: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
    skip: offset,
  })

  return analyses.map((a) => ({
    id: a.id,
    taskId: a.taskId,
    type: a.type,
    confidence: a.confidence,
    keywords: JSON.parse(a.keywords ?? '[]'),
    suggestion: a.suggestion ?? '',
    createdAt: a.createdAt,
    task: {
      id: a.task.id,
      title: a.task.title,
      reason: a.task.reason,
      emotion: a.task.emotion,
      createdAt: a.task.createdAt,
    },
  }))
}

/**
 * 获取用户的拖延类型分布统计
 * 用于饼图展示
 */
export async function getTypeDistribution(userId: number): Promise<Record<string, number>> {
  const analyses = await prisma.analysis.findMany({
    where: {
      task: { userId },
    },
    select: { type: true },
  })

  const distribution: Record<string, number> = {}
  for (const a of analyses) {
    distribution[a.type] = (distribution[a.type] || 0) + 1
  }

  return distribution
}
