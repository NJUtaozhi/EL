import { useEffect, useState } from 'react'
import { useNetworkStatus } from '@/hooks/useNetworkStatus'
import { WifiIcon, CloseIcon } from 'tdesign-icons-react'
import styles from './index.module.css'

/**
 * 网络状态提示条
 * 离线时顶部显示红色提示，恢复时绿色闪过再消失
 */
export default function NetworkStatus() {
  const online = useNetworkStatus()
  const [showRestored, setShowRestored] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    if (online && showRestored) {
      // 在线恢复提示 2s 后消失
      const t = setTimeout(() => setShowRestored(false), 2000)
      return () => clearTimeout(t)
    }
  }, [online, showRestored])

  useEffect(() => {
    if (!online) {
      setDismissed(false)
    } else {
      // 从离线恢复
      setShowRestored(true)
    }
  }, [online])

  if (online && !showRestored) return null
  if (dismissed && !online) return null

  return (
    <div
      className={`${styles.bar} ${online ? styles.restored : styles.offline}`}
    >
      <WifiIcon size="14px" />
      <span className={styles.text}>
        {online ? '网络已恢复' : '当前无网络连接'}
      </span>
      {!online && (
        <button
          className={styles.closeBtn}
          onClick={() => setDismissed(true)}
          aria-label="关闭"
        >
          <CloseIcon size="12px" />
        </button>
      )}
    </div>
  )
}
