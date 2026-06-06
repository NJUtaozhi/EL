import { useNavigate, useLocation } from 'react-router-dom'
import { ChevronLeftIcon } from 'tdesign-icons-react'
import styles from './index.module.css'

interface NavBarProps {
  /** 标题文字，不传则根据路由自动判断 */
  title?: string
  /** 是否显示返回按钮，默认根据路由判断（首页不显示） */
  showBack?: boolean
  /** 右侧操作区域 */
  rightContent?: React.ReactNode
  /** 自定义返回事件 */
  onBack?: () => void
}

/** 路由路径 → 标题映射 */
const TITLE_MAP: Record<string, string> = {
  '/': '不拖延实验室',
  '/log': '拖延日志',
  '/analysis': '归因分析',
  '/profile': '拖延画像',
  '/intervention': '干预建议',
  '/checkin': '每日打卡',
  '/chat': 'AI 对话',
}

export default function NavBar({
  title,
  showBack,
  rightContent,
  onBack,
}: NavBarProps) {
  const navigate = useNavigate()
  const location = useLocation()

  const isHome = location.pathname === '/'
  const displayTitle = title ?? TITLE_MAP[location.pathname] ?? '不拖延实验室'
  const displayBack = showBack ?? !isHome

  const handleBack = () => {
    if (onBack) {
      onBack()
    } else {
      navigate(-1)
    }
  }

  return (
    <nav className={styles.navbar}>
      <div className={styles.left}>
        {displayBack && (
          <button
            className={styles.backBtn}
            onClick={handleBack}
            aria-label="返回"
          >
            <ChevronLeftIcon size="24px" />
          </button>
        )}
      </div>

      <h1 className={styles.title}>{displayTitle}</h1>

      <div className={styles.right}>
        {rightContent ?? <div className={styles.placeholder} />}
      </div>
    </nav>
  )
}
