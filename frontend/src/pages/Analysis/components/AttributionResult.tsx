import type { AttributionResult as AttributionResultType } from '@/types/analysis'
import styles from './AttributionResult.module.css'

/** 拖延类型 → 展示配置 */
const TYPE_CONFIG: Record<string, { icon: string; color: string; bg: string; desc: string }> = {
  '畏难型': { icon: '🏔️', color: '#7AB8CE', bg: 'rgba(168,216,234,0.12)', desc: '任务看起来太大，害怕失败而迟迟不开始' },
  '焦虑型': { icon: '😰', color: '#AA96DA', bg: 'rgba(170,150,218,0.12)', desc: '过度担忧结果，越想越不敢行动' },
  '贪玩型': { icon: '🎮', color: '#FCBAD3', bg: 'rgba(252,186,211,0.12)', desc: '被娱乐分散注意力，控制不住自己' },
  '无规划型': { icon: '🗺️', color: '#FFD4B8', bg: 'rgba(255,212,184,0.15)', desc: '不知道从哪里开始，缺乏计划' },
  '完美主义型': { icon: '✨', color: '#B5EAD7', bg: 'rgba(181,234,215,0.15)', desc: '过度追求完美，总觉得准备不够' },
}

interface AttributionResultProps {
  result: AttributionResultType
}

/**
 * 归因结果卡片
 * 展示：拖延类型 + 置信度 + 关键词 + AI建议
 */
export default function AttributionResult({ result }: AttributionResultProps) {
  const config = TYPE_CONFIG[result.type] ?? {
    icon: '❓',
    color: '#8C8C8C',
    bg: 'rgba(0,0,0,0.04)',
    desc: '',
  }

  return (
    <div className={styles.result} style={{ borderColor: config.color }}>
      {/* 类型头部 */}
      <div className={styles.header} style={{ background: config.bg }}>
        <span className={styles.typeIcon}>{config.icon}</span>
        <div className={styles.typeInfo}>
          <h3 className={styles.typeName} style={{ color: config.color }}>
            {result.type}
          </h3>
          <p className={styles.typeDesc}>{config.desc}</p>
        </div>
        <div className={styles.confidence}>
          <span className={styles.confNum}>{result.confidence}%</span>
          <span className={styles.confLabel}>置信度</span>
        </div>
      </div>

      {/* 关键词 */}
      {result.keywords.length > 0 && (
        <div className={styles.section}>
          <h4 className={styles.sectionTitle}>🔑 关键词</h4>
          <div className={styles.keywords}>
            {result.keywords.map((kw, i) => (
              <span
                key={i}
                className={styles.keyword}
                style={{
                  background: config.bg,
                  color: config.color,
                  borderColor: config.color,
                }}
              >
                {kw}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* AI 建议 */}
      {result.suggestion && (
        <div className={styles.section}>
          <h4 className={styles.sectionTitle}>💡 AI 建议</h4>
          <p className={styles.suggestion}>{result.suggestion}</p>
        </div>
      )}
    </div>
  )
}
