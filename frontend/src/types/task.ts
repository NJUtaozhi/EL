/** 情绪标签 */
export type Emotion = '开心' | '平静' | '焦虑' | '沮丧' | '生气'

/** 学期阶段 */
export type SemesterPhase = '平时' | '期中' | '考试周' | '假期'

/** 任务 */
export interface Task {
  id: number
  userId: number
  title: string
  reason?: string
  emotion?: Emotion
  weather?: string
  semesterPhase?: SemesterPhase
  createdAt: string
}

/** 创建任务请求 */
export interface CreateTaskDTO {
  title: string
  reason?: string
  emotion?: Emotion
}
