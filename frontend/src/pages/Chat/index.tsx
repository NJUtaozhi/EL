/**
 * AI 对话页
 * ⏸️ 暂缓 — 专项组阶段实现
 */
export default function ChatPage() {
  return (
    <div className="page-container" style={{ animation: 'fadeIn 0.35s ease forwards' }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>🤖 AI 对话</h2>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>与智能助手聊聊你的拖延困扰</p>
      </div>

      <div
        className="card"
        style={{
          textAlign: 'center',
          padding: '48px 24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <span style={{ fontSize: 56 }}>🚧</span>
        <p style={{ fontSize: 15, fontWeight: 500, color: 'var(--text-secondary)' }}>
          AI 多轮对话功能将在专项组阶段上线
        </p>
        <p style={{ fontSize: 13, color: 'var(--text-light)' }}>
          届时你可以与智能体深度交流拖延困扰
        </p>
      </div>
    </div>
  )
}
