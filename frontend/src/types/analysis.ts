/** 拖延类型 */
export type ProcrastinationType = '畏难型' | '焦虑型' | '贪玩型' | '无规划型' | '完美主义型'

/** 归因分析结果 */
export interface AttributionResult {
  id: number
  taskId: number
  type: ProcrastinationType
  confidence: number
  keywords: string[]
  suggestion: string
  createdAt: string
}
