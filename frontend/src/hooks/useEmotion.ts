import { useState, useCallback } from 'react'
import type { Emotion } from '@/types/task'

/** 5种情绪标签（按文档定义） */
export const EMOTION_LIST: { key: Emotion; label: string; emoji: string }[] = [
  { key: '开心', label: '开心', emoji: '😊' },
  { key: '焦虑', label: '焦虑', emoji: '😰' },
  { key: '平静', label: '平静', emoji: '😌' },
  { key: '沮丧', label: '沮丧', emoji: '😞' },
  { key: '生气', label: '生气', emoji: '😤' },
]

/**
 * 情绪选择管理 Hook
 * 管理当前选中的情绪状态
 */
export function useEmotion(initial?: Emotion) {
  const [emotion, setEmotion] = useState<Emotion | undefined>(initial)

  const selectEmotion = useCallback((e: Emotion) => {
    setEmotion((prev) => (prev === e ? undefined : e))
  }, [])

  const clearEmotion = useCallback(() => {
    setEmotion(undefined)
  }, [])

  return {
    emotion,
    setEmotion: selectEmotion,
    clearEmotion,
    emotionList: EMOTION_LIST,
  }
}
