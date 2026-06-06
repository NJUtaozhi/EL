/**
 * 任务模型类型定义
 */
export interface Task {
  id: number
  userId: number
  title: string
  reason: string | null
  emotion: string | null
  weather: string | null
  semesterPhase: string | null
  createdAt: Date
}

export interface CreateTaskDTO {
  title: string
  reason?: string
  emotion?: string
}

export interface UpdateTaskDTO {
  title?: string
  reason?: string
  emotion?: string
}

export interface TaskWithAnalysis extends Task {
  analysis?: {
    id: number
    type: string
    confidence: number
    keywords: string | null
    suggestion: string | null
    createdAt: Date
  } | null
}
