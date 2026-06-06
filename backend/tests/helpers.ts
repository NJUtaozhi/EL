/**
 * 测试数据工厂
 * 提供便捷的 Mock 数据生成函数
 */

/** 生成用户数据 */
export function buildMockUser(overrides: Partial<any> = {}) {
  return {
    id: 1,
    openId: 'test_open_id',
    nickname: '测试用户',
    avatar: null,
    checkinStreak: 0,
    createdAt: new Date('2026-06-01'),
    ...overrides,
  }
}

/** 生成任务数据 */
export function buildMockTask(overrides: Partial<any> = {}) {
  return {
    id: 1,
    userId: 1,
    title: '写期末论文',
    reason: '不知道怎么开头，一拖再拖',
    emotion: '焦虑',
    weather: '多云',
    semesterPhase: '考试周',
    createdAt: new Date('2026-06-06'),
    ...overrides,
  }
}

/** 生成分析结果数据 */
export function buildMockAnalysis(overrides: Partial<any> = {}) {
  return {
    id: 1,
    taskId: 1,
    type: '焦虑型',
    confidence: 0.85,
    keywords: '["担心","做不好"]',
    suggestion: '建议使用认知重构法，识别负面自动思维',
    createdAt: new Date('2026-06-06'),
    ...overrides,
  }
}

/** 生成打卡记录 */
export function buildMockCheckin(overrides: Partial<any> = {}) {
  return {
    id: 1,
    userId: 1,
    action: '完成了25分钟番茄钟',
    date: new Date('2026-06-06'),
    ...overrides,
  }
}

/** 生成徽章数据 */
export function buildMockBadge(overrides: Partial<any> = {}) {
  return {
    id: 1,
    userId: 1,
    name: '初次打卡',
    icon: '🎯',
    condition: '完成首次打卡',
    earnedAt: new Date('2026-06-06'),
    ...overrides,
  }
}

/** 生成 LLM API 响应 */
export function buildMockLLMResponse(content: string, overrides: Partial<any> = {}) {
  return {
    content,
    usage: {
      promptTokens: 200,
      completionTokens: 150,
      totalTokens: 350,
    },
    ...overrides,
  }
}

/** 生成归因分析 LLM JSON 响应内容 */
export function buildAttributionJSON(overrides: Partial<any> = {}) {
  return JSON.stringify({
    type: '焦虑型',
    confidence: 0.85,
    keywords: ['担心', '做不好'],
    suggestion: '建议将任务拆解为小步骤，使用5分钟法则开始行动',
    ...overrides,
  })
}

/** 生成干预方案 LLM JSON 响应内容 */
export function buildInterventionJSON(overrides: Partial<any> = {}) {
  return JSON.stringify({
    type: '焦虑型',
    strategy: '认知重构法',
    title: '改变你看待任务的方式',
    steps: [
      '第1步：写出你担心的具体结果，判断它发生的概率有多大',
      '第2步：找3个过去你担心但实际没发生的例子，告诉自己负面预测常不准确',
      '第3步：设定一个15分钟的「担忧时间」，其余时间一旦担忧就告诉自己到时间再想',
    ],
    encouragement: '焦虑不是敌人，它是你内心对重视的事情发出的信号。学会与它共处，而不是被它控制。',
    tip: '试试4-7-8呼吸法：吸气4秒，屏息7秒，呼气8秒',
    ...overrides,
  })
}

/** 生成带 Analysis 关联的任务（taskService 返回格式） */
export function buildTaskWithAnalysis(overrides: Partial<any> = {}) {
  return {
    id: 1,
    userId: 1,
    title: '写期末论文',
    reason: '不知道怎么开头，一拖再拖',
    emotion: '焦虑',
    weather: '多云',
    semesterPhase: '考试周',
    createdAt: new Date('2026-06-06'),
    analysis: {
      id: 1,
      type: '焦虑型',
      confidence: 0.85,
      keywords: null,
      suggestion: '建议使用认知重构法',
      createdAt: new Date('2026-06-06'),
    },
    ...overrides,
  }
}
