import { RefreshIcon } from 'tdesign-icons-react'

interface MicroActionProps {
  action: string
  onRefresh?: () => void
}

/** 最小行动建议池 */
const ACTION_POOL = [
  '写下今天要完成的一件事',
  '设置一个25分钟的番茄钟',
  '把大任务拆成3个小步骤',
  '整理桌面，清空干扰',
  '给任务设定一个截止时间',
  '先做任务中最简单的第一部分',
  '关闭手机通知5分钟',
  '站起来，深呼吸3次',
]

/**
 * 最小行动卡片 🟡 重要
 * 展示今日微行动建议
 */
export default function MicroAction({ action, onRefresh }: MicroActionProps) {
  return (
    <div
      style={{
        textAlign: 'center',
        padding: '24px',
        background: 'linear-gradient(135deg, var(--color-primary-light), var(--color-warm))',
        borderRadius: 16,
        marginBottom: 20,
      }}
    >
      <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>
        ⚡ 今日最小行动
      </p>
      <p style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>{action}</p>
      <p style={{ fontSize: 12, color: 'var(--text-light)', marginBottom: 12 }}>
        完成它，今天就是有收获的一天
      </p>
      {onRefresh && (
        <button
          onClick={onRefresh}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            padding: '4px 12px',
            borderRadius: 9999,
            fontSize: 12,
            color: 'var(--color-secondary)',
            background: 'rgba(170, 150, 218, 0.1)',
          }}
        >
          <RefreshIcon size="12px" /> 换一个
        </button>
      )}
    </div>
  )
}

export { ACTION_POOL }
