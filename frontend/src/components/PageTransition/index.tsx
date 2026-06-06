import { type ReactNode } from 'react'
import styles from './index.module.css'

interface PageTransitionProps {
  children: ReactNode
  /** 页面唯一 key，用于触发过渡动画 */
  pageKey?: string
}

/**
 * 页面过渡动画包装
 * 给每个页面添加淡入动画
 */
export default function PageTransition({ children, pageKey }: PageTransitionProps) {
  return (
    <div className={styles.transition} key={pageKey}>
      {children}
    </div>
  )
}
