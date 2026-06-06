/**
 * 干预方案服务（第5周完整实现）
 *
 * 核心流程：
 *   1. 根据归因类型匹配预设干预策略（INTERVENTION_STRATEGIES）
 *   2. 获取用户历史数据（任务数、分析记录、打卡情况）
 *   3. 组装 System Prompt（包含5种类型完整策略库）
 *   4. 调 DeepSeek API 生成个性化 3 步行动建议 + 鼓励语
 *   5. 返回结构化建议卡片
 */
import prisma from '../config/database'
import { singlePrompt } from './llmService'
import {
  PROCRASTINATION_TYPES,
  INTERVENTION_STRATEGIES,
} from '../utils/constants'
import type { ProcrastinationType } from '../utils/constants'
import type { Suggestion, InterventionRequest } from '../models/Suggestion'
import logger from '../utils/logger'

/**
 * 干预方案 System Prompt
 * 包含完整的策略库和输出规范
 */
const INTERVENTION_SYSTEM_PROMPT = `你是一位专业的拖延心理学顾问，精通认知行为疗法(CBT)、时间管理和行为激活技术。你的任务是根据用户的拖延类型和情况，生成个性化的干预方案。

## 五种拖延类型的核心干预策略

### 1. 畏难型
**核心问题**：任务看起来太大、太难，产生畏难逃避心理。
**干预策略**：
- 任务拆分法：将大任务分解为 5-10 分钟可完成的微步骤
- 微行动启动：从最简单的一步开始，降低启动门槛
- 进度可视化：用清单或进度条记录每完成一个小步骤
- 5分钟法则：告诉自己"只做5分钟"，通常开始后就会继续

### 2. 焦虑型
**核心问题**：对任务结果的过度担忧，灾难化想象。
**干预策略**：
- 认知重构：识别"如果失败了怎么办"等负面自动思维，用事实检验
- 担忧时间法：每天固定15分钟专门担忧，其余时间转移注意力
- 呼吸放松法：4-7-8呼吸法（吸气4秒→屏息7秒→呼气8秒）
- 最坏情况分析：写出最坏结果和应对方案，通常发现没那么可怕

### 3. 贪玩型
**核心问题**：被手机/游戏/短视频等即时满足诱惑。
**干预策略**：
- 番茄工作法：25分钟专注 + 5分钟休息，用计时器强制执行
- 环境设计：手机放另一个房间/开启专注模式/卸载诱惑App
- 替代奖励：完成任务后给自己一个健康奖励（散步/音乐/零食）
- 诱惑捆绑：将喜欢的活动与任务绑定（如一边听播客一边整理）

### 4. 无规划型
**核心问题**：缺乏时间管理和优先级意识，不知从何开始。
**干预策略**：
- ABC优先级法：A-紧急重要 / B-重要不紧急 / C-紧急不重要，按顺序处理
- 每日三件事：每天早上确定今天必须完成的3件最重要的事
- 时间块规划：将一天分成几个时间块，每个块只做一件事
- 晚间复盘：每晚花5分钟回顾今天完成的事并规划明天

### 5. 完美主义型
**核心问题**：过度追求完美，导致迟迟无法开始或无限修改。
**干预策略**：
- 最小可用产品(MVP)原则：先完成初稿，再迭代优化
- 设定"够好"标准：明确什么程度就算"可以了"
- 时间盒法：给任务设定固定时间限制，到时间就停止
- 80分法则：告诉自己80分就可以提交，不需要100分

## 输出要求

请严格以 JSON 格式返回干预方案：
{
  "type": "畏难型",
  "strategy": "任务拆分法",
  "title": "将任务变小，让开始变得容易",
  "steps": [
    "第1步：将【具体任务】分解为3-5个子任务，每个不超过15分钟",
    "第2步：从最简单的子任务开始，完成后打勾获得成就感",
    "第3步：每完成2个子任务休息5分钟，用进度条记录整体进展"
  ],
  "encouragement": "每个人都是从一小步开始的。你不需要一次性爬到山顶，只需要看清脚下的路，一步一步走。",
  "tip": "实用小贴士...（30字以内）"
}

## 要求
- steps 必须是3步，每步具体可执行，结合用户的实际任务
- encouragement 要温暖有力，50-80字
- 建议必须个性化，不能是泛泛而谈的鸡汤
- title 要简短有力，激发行动`;

/**
 * 从 LLM 返回文本解析干预方案 JSON
 */
function parseInterventionJSON(raw: string): {
  type: string
  strategy: string
  title: string
  steps: string[]
  encouragement: string
  tip: string
} {
  let cleaned = raw.trim()

  // 移除 markdown 代码块
  const codeBlockMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (codeBlockMatch) {
    cleaned = codeBlockMatch[1].trim()
  }

  // 提取第一个 JSON 对象
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/)
  if (jsonMatch) {
    cleaned = jsonMatch[0]
  }

  const parsed = JSON.parse(cleaned)

  return {
    type: parsed.type || '未知',
    strategy: parsed.strategy || '通用策略',
    title: parsed.title || '克服拖延，从现在开始',
    steps: Array.isArray(parsed.steps) ? parsed.steps.slice(0, 3) : ['开始行动', '保持专注', '复盘总结'],
    encouragement: parsed.encouragement || '每一步都是进步，你已经走在改变的路上了。',
    tip: parsed.tip || '',
  }
}

/**
 * 构建 User Prompt
 */
function buildInterventionPrompt(request: {
  procrastinationType: string
  taskTitle?: string
  taskCount: number
  analysisCount: number
  commonEmotions: string[]
  recentTypes: string[]
}): string {
  const parts: string[] = []

  parts.push(`【拖延类型】${request.procrastinationType}`)

  if (request.taskTitle) {
    parts.push(`【当前任务】${request.taskTitle}`)
  }

  parts.push(`【用户画像】`)
  parts.push(`- 累计记录任务数：${request.taskCount}`)
  parts.push(`- 完成归因分析次数：${request.analysisCount}`)

  if (request.commonEmotions.length > 0) {
    parts.push(`- 常见情绪：${request.commonEmotions.join('、')}`)
  }

  if (request.recentTypes.length > 0) {
    parts.push(`- 近期拖延类型：${request.recentTypes.join('、')}`)
  }

  parts.push(`\n请根据以上信息，针对「${request.procrastinationType}」生成个性化的 3 步干预方案。`)

  return parts.join('\n')
}

/**
 * 验证拖延类型是否有效
 */
function isValidType(type: string): type is ProcrastinationType {
  return PROCRASTINATION_TYPES.includes(type as ProcrastinationType)
}

/**
 * 生成个性化干预方案
 *
 * 根据用户的拖延类型和历史数据，调 DeepSeek 生成：
 * - 3步可执行行动建议
 * - 个性化鼓励语
 * - 实用小贴士
 */
export async function generateIntervention(
  userId: number,
  request: InterventionRequest,
): Promise<Suggestion> {
  const { procrastinationType, taskTitle } = request

  // 1. 验证拖延类型
  if (!isValidType(procrastinationType)) {
    throw Object.assign(
      new Error(`无效的拖延类型: ${procrastinationType}，有效值: ${PROCRASTINATION_TYPES.join(', ')}`),
      { statusCode: 400 },
    )
  }

  // 2. 获取用户画像数据
  const [taskCount, analyses, checkins] = await Promise.all([
    prisma.task.count({ where: { userId } }),
    prisma.analysis.findMany({
      where: { task: { userId } },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: { type: true },
    }),
    prisma.checkin.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      take: 20,
      select: { action: true },
    }),
  ])

  // 提取情绪数据
  const recentTasks = await prisma.task.findMany({
    where: { userId, emotion: { not: null } },
    orderBy: { createdAt: 'desc' },
    take: 10,
    select: { emotion: true },
  })
  const commonEmotions = [...new Set(recentTasks.map((t) => t.emotion!).filter(Boolean))]

  // 最近拖延类型
  const recentTypes = [...new Set(analyses.map((a) => a.type))]

  // 3. 获取预设策略
  const baseStrategy = INTERVENTION_STRATEGIES[procrastinationType]

  logger.info(`生成干预方案: userId=${userId}, type=${procrastinationType}, taskCount=${taskCount}`)

  // 4. 构建 User Prompt
  const userPrompt = buildInterventionPrompt({
    procrastinationType,
    taskTitle,
    taskCount,
    analysisCount: analyses.length,
    commonEmotions,
    recentTypes,
  })

  // 5. 调用 DeepSeek API 生成个性化方案
  const response = await singlePrompt(
    INTERVENTION_SYSTEM_PROMPT,
    userPrompt,
    {
      temperature: 0.7,   // 稍高温度增加建议的多样性和创意
      maxTokens: 800,     // 足够返回完整 JSON
      responseFormat: 'json_object',
    },
  )

  // 6. 解析结果
  let result: { type: string; strategy: string; title: string; steps: string[]; encouragement: string; tip: string }
  try {
    result = parseInterventionJSON(response.content)
    logger.info(`干预方案生成成功: type=${result.type}, strategy=${result.strategy}`)
  } catch (parseErr) {
    logger.error(`干预方案 JSON 解析失败: ${(parseErr as Error).message}, raw=${response.content.slice(0, 200)}`)
    throw Object.assign(
      new Error('AI 干预方案生成失败，请稍后重试'),
      { statusCode: 502, cause: parseErr },
    )
  }

  // 7. 返回结构化建议
  return {
    id: 0, // 干预方案为实时生成，不持久化
    type: result.type,
    strategy: result.strategy,
    title: result.title,
    steps: result.steps,
    encouragement: result.encouragement,
    tip: result.tip,
    baseStrategy,
    createdAt: new Date(),
  }
}

/**
 * 根据拖延类型获取预设策略（不调 LLM，快速返回）
 * 用于前端首次加载或离线场景
 */
export function getPresetStrategy(type: string): {
  type: string
  baseStrategy: string
  isValid: boolean
} {
  if (!isValidType(type)) {
    return { type, baseStrategy: '', isValid: false }
  }
  return {
    type,
    baseStrategy: INTERVENTION_STRATEGIES[type],
    isValid: true,
  }
}

/**
 * 获取所有5种类型的策略摘要
 * 供前端干预建议页首次展示
 */
export function getAllStrategies(): Array<{
  type: string
  strategy: string
}> {
  return PROCRASTINATION_TYPES.map((type) => ({
    type,
    strategy: INTERVENTION_STRATEGIES[type],
  }))
}
