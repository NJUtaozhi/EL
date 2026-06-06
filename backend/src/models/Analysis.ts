/**
 * 归因分析模型类型定义
 */
export interface Analysis {
  id: number
  taskId: number
  type: string
  confidence: number
  keywords: string | null
  suggestion: string | null
  createdAt: Date
}

export interface AttributionResult {
  id: number
  taskId: number
  type: string
  confidence: number
  keywords: string[]
  suggestion: string
  createdAt: Date
}

export interface AnalysisWithTask extends Analysis {
  task: {
    id: number
    title: string
    reason: string | null
    emotion: string | null
    createdAt: Date
  }
}
