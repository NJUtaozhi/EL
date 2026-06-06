import TagCloud from '@/components/TagCloud'

interface AnalysisTagCloudProps {
  keywords: string[]
}

/**
 * 分析页标签云
 * 将平铺关键词转为 TagCloud 所需格式（name + value）
 * value 越大字越大：靠前的关键词权重更高
 */
export default function AnalysisTagCloud({ keywords }: AnalysisTagCloudProps) {
  if (keywords.length === 0) return null

  const data = keywords.map((name, i) => ({
    name,
    value: keywords.length - i, // 越靠前权重越高
  }))

  return (
    <div style={{ marginTop: 16 }}>
      <h3
        style={{
          fontSize: 14,
          fontWeight: 600,
          marginBottom: 8,
        }}
      >
        🏷️ 拖延关键词云
      </h3>
      <div
        style={{
          background: '#fff',
          borderRadius: 12,
          padding: '12px 0',
          boxShadow: 'var(--shadow-card)',
        }}
      >
        <TagCloud data={data} height={220} />
      </div>
    </div>
  )
}
