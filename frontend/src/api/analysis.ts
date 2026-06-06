/**
 * 归因分析 API
 */
import api from './index'
import type { AttributionResult } from '@/types/analysis'

/** 提交任务进行归因分析 */
export const submitForAnalysis = (taskId: number): Promise<AttributionResult> =>
  api.post('/analysis/submit', { taskId })

/** 获取归因分析结果 */
export const getAnalysisResult = (taskId: number): Promise<AttributionResult> =>
  api.get(`/analysis/result/${taskId}`)
