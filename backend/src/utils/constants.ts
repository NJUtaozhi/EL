/**
 * 项目关键常量（前后端共用）
 */

/** 拖延类型枚举 */
export const PROCRASTINATION_TYPES = [
  '畏难型',      // 任务大，怕失败
  '焦虑型',      // 过度担忧结果
  '贪玩型',      // 娱乐分散注意
  '无规划型',    // 不知从何开始
  '完美主义型',  // 过度追求完美
] as const

export type ProcrastinationType = typeof PROCRASTINATION_TYPES[number]

/** 情绪标签 */
export const EMOTIONS = ['开心', '焦虑', '平静', '沮丧', '生气'] as const
export type Emotion = typeof EMOTIONS[number]

/** 学期阶段（后端自动补全） */
export const SEMESTER_PHASES = ['平时', '期中', '考试周', '假期'] as const
export type SemesterPhase = typeof SEMESTER_PHASES[number]

/** 天气（后端自动补全占位） */
export const WEATHERS = ['晴', '多云', '阴', '雨', '雪'] as const

/** 徽章条件 */
export const BADGE_RULES = {
  FIRST_CHECKIN: { name: '初次打卡', icon: '🎯', condition: '完成首次打卡' },
  STREAK_3: { name: '连续三天', icon: '🔥', condition: '连续打卡3天' },
  STREAK_7: { name: '坚持一周', icon: '⭐', condition: '连续打卡7天' },
  STREAK_14: { name: '两周达人', icon: '🏅', condition: '连续打卡14天' },
  STREAK_30: { name: '月度之星', icon: '👑', condition: '连续打卡30天' },
  TASK_10: { name: '记录达人', icon: '📝', condition: '累计记录10个任务' },
  ANALYSIS_5: { name: '自我认知', icon: '🧠', condition: '完成5次归因分析' },
} as const

/** 各拖延类型的干预策略 */
export const INTERVENTION_STRATEGIES: Record<ProcrastinationType, string> = {
  '畏难型': '任务拆分法：将大任务分解为多个可执行的小步骤，从最简单的一步开始',
  '焦虑型': '认知重构法：识别并挑战负面思维，用客观事实替代灾难化想象',
  '贪玩型': '番茄工作法：25分钟专注 + 5分钟休息，用手机关机/锁App减少诱惑',
  '无规划型': 'ABC优先级法：列出所有任务并按紧急/重要分类，制定日计划',
  '完美主义型': '最小可用原则：先完成再完美，设定"够好"的标准而非"完美"',
}
