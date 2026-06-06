import HeatMap from '@/components/HeatMap'

interface ProfileHeatMapProps {
  /** 拖延迟热力图数据（可由 dashboard 聚合接口提供，或前端计算） */
  data: Array<{ day: number; period: string; value: number }>
}

/**
 * 画像页热力图
 * 包装公共 HeatMap 组件
 */
export default function ProfileHeatMap({ data }: ProfileHeatMapProps) {
  return (
    <div>
      <h3
        style={{
          fontSize: 14,
          fontWeight: 600,
          marginBottom: 8,
        }}
      >
        🔥 拖延热力图
      </h3>
      <div
        style={{
          background: '#fff',
          borderRadius: 12,
          padding: '16px 8px',
          boxShadow: 'var(--shadow-card)',
        }}
      >
        {data.length > 0 ? (
          <HeatMap data={data} height={280} />
        ) : (
          <p
            style={{
              textAlign: 'center',
              color: 'var(--text-light)',
              fontSize: 13,
              padding: '40px 0',
            }}
          >
            数据收集中，记录更多拖延后解锁
          </p>
        )}
      </div>
    </div>
  )
}
