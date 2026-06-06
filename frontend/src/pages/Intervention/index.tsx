import { useState, useEffect, useCallback } from 'react'

import {
  generateIntervention,
  getAllStrategies,
  type Suggestion,
  type StrategySummary,
} from '@/api/intervention'
import type { ProcrastinationType } from '@/types/analysis'
import SuggestionList from './components/SuggestionList'
import DailyReminder from './components/DailyReminder'
import styles from './style.module.css'

/** 5类拖延类型带emoji */
const TYPE_OPTIONS: { key: ProcrastinationType; emoji: string }[] = [
  { key: '畏难型', emoji: '🏔️' },
  { key: '焦虑型', emoji: '😰' },
  { key: '贪玩型', emoji: '🎮' },
  { key: '无规划型', emoji: '🗺️' },
  { key: '完美主义型', emoji: '✨' },
]

export default function InterventionPage() {
  const [selectedType, setSelectedType] = useState<ProcrastinationType | null>(null)
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [strategies, setStrategies] = useState<StrategySummary[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // 加载全部预设策略
  useEffect(() => {
    getAllStrategies()
      .then(setStrategies)
      .catch(() => {})
  }, [])

  /** 生成个性化方案 */
  const handleGenerate = useCallback(async () => {
    if (!selectedType) return
    setLoading(true)
    setError('')
    try {
      const result = await generateIntervention(selectedType)
      setSuggestions((prev) => [result, ...prev])
    } catch {
      setError('生成失败，请检查后端服务')
    } finally {
      setLoading(false)
    }
  }, [selectedType])

  return (
    <div className={`page-container ${styles.intervention}`}>
      <div className={styles.header}>
        <h2 className={styles.pageTitle}>💡 干预建议</h2>
        <p className={styles.pageDesc}>个性化策略，帮你科学克服拖延</p>
      </div>

      {/* 类型选择 */}
      <div className={styles.typeSection}>
        <h3 className={styles.typeTitle}>选择你的拖延类型</h3>
        <div className={styles.typeGrid}>
          {TYPE_OPTIONS.map(({ key, emoji }) => (
            <button
              key={key}
              className={`${styles.typeBtn} ${selectedType === key ? styles.typeBtnSelected : ''}`}
              onClick={() => setSelectedType(key)}
            >
              {emoji} {key}
            </button>
          ))}
        </div>
      </div>

      {/* 生成按钮 */}
      <button
        className={styles.generateBtn}
        onClick={handleGenerate}
        disabled={!selectedType || loading}
      >
        🤖
        {loading ? ' 正在生成...' : ' AI 生成个性化方案'}
      </button>

      {/* 错误 */}
      {error && (
        <div className={`card ${styles.stateCard}`}>
          <p className={styles.stateText}>{error}</p>
        </div>
      )}

      {/* 建议列表 */}
      <SuggestionList suggestions={suggestions} loading={loading} />

      {/* 预设策略（当没有AI生成结果时展示） */}
      {suggestions.length === 0 && strategies.length > 0 && !loading && (
        <div className={styles.presetSection}>
          <h3 className={styles.presetTitle}>📚 基础策略库</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
            {strategies.map((s) => (
              <div
                key={s.type}
                className={`card ${styles.presetCard}`}
                onClick={() => setSelectedType(s.type as ProcrastinationType)}
              >
                <div className={styles.presetHeader}>
                  <span className={styles.presetName}>
                    {TYPE_OPTIONS.find((t) => t.key === s.type)?.emoji} {s.type}
                  </span>
                </div>
                <p className={styles.presetStrategy}>{s.strategy}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 每日提醒 */}
      {suggestions.length > 0 && (
        <div style={{ marginTop: 'var(--space-lg)' }}>
          <DailyReminder />
        </div>
      )}
    </div>
  )
}
