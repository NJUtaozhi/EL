/**
 * 干预建议模型类型定义
 */
export interface Suggestion {
  id: number
  type: string
  strategy: string
  steps: string[]
  encouragement: string
  createdAt: Date
}

export interface InterventionRequest {
  procrastinationType: string
  taskTitle?: string
  userId: number
}
