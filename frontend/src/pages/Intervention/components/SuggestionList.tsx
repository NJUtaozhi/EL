import { useState } from 'react'
import type { Suggestion } from '@/api/intervention'
import SuggestionCard from '@/components/SuggestionCard'

interface SuggestionListProps {
  suggestions: Suggestion[]
  loading?: boolean
}

/**
 * 建议卡片列表
 * 展示收藏 + 展开/收起
 */
export default function SuggestionList({ suggestions, loading }: SuggestionListProps) {
  const [favorites, setFavorites] = useState<Set<number>>(new Set())

  const toggleFavorite = (id: number) => {
    setFavorites((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-light)' }}>
        正在生成个性化建议...
      </div>
    )
  }

  if (suggestions.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-light)' }}>
        选择一种拖延类型来获取建议
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
      {suggestions.map((s, i) => (
        <SuggestionCard
          key={s.id || i}
          suggestion={s}
          onFavorite={toggleFavorite}
          isFavorited={favorites.has(s.id)}
        />
      ))}
    </div>
  )
}
