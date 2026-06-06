/**
 * 干预建议页
 * Week 1: 基础框架占位
 * Week 5: 完整实现（根据归因类型推送建议卡片列表）
 */
export default function InterventionPage() {
  return (
    <div className="page-container" style={{ animation: 'fadeIn 0.35s ease forwards' }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>💡 干预建议</h2>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>个性化策略，帮你克服拖延</p>
      </div>

      <div
        className="card"
        style={{
          textAlign: 'center',
          padding: '32px 24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <span style={{ fontSize: 48 }}>🎯</span>
        <p style={{ fontSize: 15, fontWeight: 500 }}>完成归因分析后</p>
        <p style={{ fontSize: 13, color: 'var(--text-light)' }}>
          将为你生成个性化的干预建议
        </p>
      </div>
    </div>
  )
}
