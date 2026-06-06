import styles from './style.module.css'

/**
 * 归因分析页
 * Week 1: 基础框架占位
 * Week 3: 完整实现（触发分析 + 展示归因结果 + 拖延类型 + 建议）
 */
export default function AnalysisPage() {
  return (
    <div className={`page-container ${styles.analysis}`}>
      <div className={styles.header}>
        <h2 className={styles.pageTitle}>🔍 归因分析</h2>
        <p className={styles.pageDesc}>AI 帮你分析拖延背后的原因</p>
      </div>

      <div className={`card ${styles.emptyState}`}>
        <span className={styles.emptyIcon}>🧠</span>
        <p className={styles.emptyText}>选择一条拖延记录</p>
        <p className={styles.emptyHint}>DeepSeek 将为你分析拖延类型和深层原因</p>
        <button className={styles.analyzeBtn} disabled>
          🤖 开始分析
        </button>
      </div>

      {/* 拖延类型说明 */}
      <div className={styles.typeHint}>
        <h3 className={styles.typeTitle}>五类拖延类型</h3>
        <div className={styles.typeTags}>
          {['畏难型', '焦虑型', '贪玩型', '无规划型', '完美主义型'].map((t) => (
            <span key={t} className={styles.typeTag}>
              {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
