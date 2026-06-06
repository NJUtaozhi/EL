import styles from './style.module.css'

/**
 * 拖延画像页
 * Week 1: 基础框架占位
 * Week 4: 完整实现（周报、热力图、趋势图聚合展示）
 */
export default function ProfilePage() {
  return (
    <div className={`page-container ${styles.profile}`}>
      <div className={styles.header}>
        <h2 className={styles.pageTitle}>👤 拖延画像</h2>
        <p className={styles.pageDesc}>了解你的拖延模式</p>
      </div>

      {/* 用户信息卡片 */}
      <div className={`card ${styles.userCard}`}>
        <div className={styles.avatar}>😊</div>
        <div className={styles.userInfo}>
          <h3 className={styles.userName}>拖延探索者</h3>
          <p className={styles.userLevel}>Lv.1 · 刚刚开始</p>
        </div>
      </div>

      {/* 报告区域占位 */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>📊 周报告</h3>
        <div className={`card ${styles.placeholder}`}>
          <p className={styles.placeholderText}>记录满7天后解锁周报告</p>
        </div>
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>🔥 拖延热力图</h3>
        <div className={`card ${styles.placeholder}`}>
          <p className={styles.placeholderText}>数据收集中...</p>
        </div>
      </div>
    </div>
  )
}
