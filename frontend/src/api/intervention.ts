/**
 * 干预方案 API
 */
import api from './index'

export interface Suggestion {
  id: number
  type: string
  strategy: string
  title: string
  steps: string[]
  encouragement: string
  tip: string
  baseStrategy?: string
  createdAt: string
}

export interface PresetStrategy {
  type: string
  baseStrategy: string
  isValid: boolean
}

export interface StrategySummary {
  type: string
  strategy: string
}

/** 生成个性化干预方案（调 AI） */
export const generateIntervention = (
  procrastinationType: string,
  taskTitle?: string,
): Promise<Suggestion> =>
  api.post('/intervention/generate', { procrastinationType, taskTitle })

/** 获取指定类型的预设策略（不调 AI，即时返回） */
export const getPresetStrategy = (type: string): Promise<PresetStrategy> =>
  api.get(`/intervention/strategy/${type}`)

/** 获取全部 5 种策略摘要 */
export const getAllStrategies = (): Promise<StrategySummary[]> =>
  api.get('/intervention/strategies')
